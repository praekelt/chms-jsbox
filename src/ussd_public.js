go.app = function() {
    var vumigo = require('vumigo_v02');
    var MetricsHelper = require('go-jsbox-metrics-helper');
    var App = vumigo.App;
    var Choice = vumigo.states.Choice;
    var ChoiceState = vumigo.states.ChoiceState;
    var EndState = vumigo.states.EndState;
    var FreeText = vumigo.states.FreeText;


    var GoFC = App.extend(function(self) {
        App.call(self, 'state_start');
        var $ = self.$;
        var interrupt = true;

        self.init = function() {

            // Use the metrics helper to add some metrics
            mh = new MetricsHelper(self.im);
            mh
                // Total unique users
                .add.total_unique_users('total.ussd.unique_users')

                // Total sessions
                .add.total_sessions('total.ussd.sessions')

                // Total times reached state_timed_out
                .add.total_state_actions(
                    {
                        state: 'state_timed_out',
                        action: 'enter'
                    },
                    'total.reached_state_timed_out'
                );

            // Load self.contact
            return self.im.contacts
                .for_user()
                .then(function(user_contact) {
                   self.contact = user_contact;
                });
        };


    // TEXT CONTENT

        var questions = {
            "state_timed_out":
                "You have an incomplete registration. Would you like to continue with this registration?",
            "state_language":
                "Welcome to FamilyConnect. Please choose your language",
            "state_permission":
                "Welcome to FamilyConnect. Do you have permission to manage the number {{msisdn}}?",
            "state_permission_required":
                "Sorry, you need permission.",
            "state_manage_msisdn":
                "Please enter the number you would like to manage. For example 0803304899.  Note: You should permission from the owner to manage this number.",
            "state_change_menu":
                "Choose:",

            "state_already_baby":
                "You are already registered for baby messages.",
            "state_end_baby":
                "You will receive baby messages.",

            "state_change_language":
                "What language would this person like to receive these messages in?",
            "state_end_language":
                "Thank you. Your language preference has been updated and you will start to receive SMSs in this language.",

            "state_change_number":
                "Please enter the new mobile number you would like to receive weekly messages on. For example 0803304899",
            "state_change_recipient":
                "Who will receive these messages?",
            "state_end_recipient":
                "Thank you. The number which receives messages has been updated.",

            "state_optout_reason":
                "Please tell us why you no longer want to receive messages so we can help you further.",
            "state_loss_subscription":
                "We are sorry for your loss. Would you like to receive a small set of free messages from FamilyConnect that could help you in this difficult time?",
            "state_end_loss_subscription":
                "Thank you. You will now receive messages to support you during this difficult time.",
            "state_end_optout":
                "Thank you. You will no longer receive messages",

            "state_msg_receiver":
                "Who will receive these messages?",
            "state_last_period_month":
                "When did the woman have her last period",
            "state_last_period_day":
                "What day of the month did the woman start her last period? For example, 12.",
            "state_hiv_messages":
                "Would they like to receive additional messages about HIV?",
            "state_end_thank_you":
                "Thank you. Your FamilyConnect ID is {{health_id}}. You will receive an SMS with it shortly.",

            "state_end_general":
                "Thank you for using the FamilyConnect service"
        };

        var errors = {
            "state_auth_code":
                "That code is not recognised. Please enter your 5 digit personnel code.",
        };

        get_error_text = function(name) {
            return errors[name] || "Sorry not a valid input. " + questions[name];
        };



    // TIMEOUT HANDLING

        // override normal state adding
        self.add = function(name, creator) {
            self.states.add(name, function(name, opts) {
                if (!interrupt || !go.utils.timed_out(self.im))
                    return creator(name, opts);

                interrupt = false;
                opts = opts || {};
                opts.name = name;
                return self.states.create('state_timed_out', opts);
            });
        };

        // timeout 01
        self.states.add('state_timed_out', function(name, creator_opts) {
            return new ChoiceState(name, {
                question: $(questions[name]),
                choices: [
                    new Choice('continue', $("Yes")),
                    new Choice('restart', $("No, start from the beginning"))
                ],
                next: function(choice) {
                    if (choice.value === 'continue') {
                        return {
                            name: creator_opts.name,
                            creator_opts: creator_opts
                        };
                        // return creator_opts.name;
                    } else if (choice.value === 'restart') {
                        return 'state_start';
                    }
                }
            });
        });


    // START STATES

        self.add('state_start', function(name) {
            // Reset user answers when restarting the app
            self.im.user.answers = {};
            return go.utils
                .get_or_create_identity({'msisdn': self.im.user.addr}, self.im, null)
                .then(function(user) {
                    self.im.user.set_answer('user_id', user.id);
                    if (user.details.receiver_role) {
                        self.im.user.set_answer('role_player', user.details.receiver_role);
                        return self.states.create('state_permission');
                    } else {
                        self.im.user.set_answer('role_player', 'guest');
                        return self.states.create('state_language');
                    }
                });
        });

        // ChoiceState st-D
        self.add('state_language', function(name) {
            return new ChoiceState(name, {
                question: $(questions[name]),
                choices: [
                    new Choice('english', $('English')),
                    new Choice('rukiga', $('Rukiga')),
                    new Choice('lusoga', $('Lusoga')),
                    new Choice('luganda', $('Luganda'))
                ],
                error: $(get_error_text(name)),
                next: 'state_permission'
            });
        });

        // ChoiceState st-C
        self.add('state_permission', function(name) {
            return new ChoiceState(name, {
                question: $(questions[name]).context({msisdn: self.im.user.addr}),
                choices: [
                    new Choice('has_permission', $('Yes')),
                    new Choice('no_permission', $('No')),
                    new Choice('other_number', $("Change the number I'd like to manage"))
                ],
                error: $(get_error_text(name)),
                next: function(choice) {
                    if (choice.value === 'has_permission') {
                        return {
                            name: 'state_check_registered_user',
                            creator_opts: {msisdn: self.im.user.addr}
                        };
                    }
                    else if (choice.value === 'no_permission') {
                        return 'state_permission_required';
                    }
                    else if (choice.value === 'other_number') {
                        return 'state_manage_msisdn';
                    }
                }
            });
        });

        // EndState permission required
        self.add('state_permission_required', function(name) {
            return new EndState(name, {
                text: $(questions[name]),
                next: 'state_start'
            });
        });

        // FreeText st-B
        self.add('state_manage_msisdn', function(name) {
            return new FreeText(name, {
                question: $(questions[name]),
                check: function(content) {
                    if (go.utils.is_valid_msisdn(content)) {
                        return null;  // vumi expects null or undefined if check passes
                    } else {
                        return $(get_error_text(name));
                    }
                },
                next: function(content) {
                    return {
                        name: 'state_check_registered_user',
                        creator_opts: {msisdn: content}
                    };
                }
            });
        });

        self.add('state_check_registered_user', function(name, opts) {
            return go.utils
                .get_or_create_identity({'msisdn': opts.msisdn}, self.im, null)
                .then(function(contact) {
                    if (contact.details.receiver_role) {
                        self.im.user.set_answer('role_player', contact.details.receiver_role);
                        self.im.user.set_answer('contact_id', contact.id);
                        return self.states.create('state_change_menu');
                    } else {
                        self.im.user.set_answer('contact_id', contact.id);
                        return self.states.create('state_msg_receiver');
                    }
                });
        });

        // ChoiceState st-A1
        self.add('state_change_menu', function(name) {
            return new ChoiceState(name, {
                question: $(questions[name]),
                error: $(get_error_text(name)),
                choices: [
                    new Choice('state_check_baby_subscription', $('Start baby SMSs')),
                    new Choice('state_change_language', $('Update language')),
                    new Choice('state_change_number', $("Change the number which gets SMSs")),
                    new Choice('state_optout_reason', $("Stop SMSs")),
                ],
                next: function(choice) {
                    return choice.value;
                }
            });
        });


    // CHANGE STATES

    // Change to baby
        // Interstitial
        self.add('state_check_baby_subscription', function(name) {
            return go.utils_project
                .check_baby_subscription(self.im.user.addr)
                .then(function(is_subscribed) {
                    if (is_subscribed) {
                        return self.states.create('state_already_baby');
                    } else {
                        return self.states.create('state_end_baby');
                    }
                });
        });

        // ChoiceState st-01
        self.add('state_already_baby', function(name) {
            return new ChoiceState(name, {
                question: $(questions[name]),
                choices: [
                    new Choice('state_change_menu', $("Back to main menu")),
                    new Choice('state_end_general', $("Exit"))
                ],
                error: $(get_error_text(name)),
                next: function(choice) {
                    return choice.value;
                }
            });
        });

        // EndState st-02
        self.add('state_end_baby', function(name) {
            return new EndState(name, {
                text: $(questions[name]),
                next: 'state_start'
            });
        });

        // EndState st-18
        self.add('state_end_general', function(name) {
            return new EndState(name, {
                text: $(questions[name]),
                next: 'state_start'
            });
        });

    // Change message language
        // ChoiceState st-03
        self.add('state_change_language', function(name) {
            return new ChoiceState(name, {
                question: $(questions[name]),
                choices: [
                    new Choice('english', $('English')),
                    new Choice('rukiga', $('Rukiga')),
                    new Choice('lusoga', $('Lusoga')),
                    new Choice('luganda', $('Luganda'))
                ],
                error: $(get_error_text(name)),
                next: 'state_end_language'
            });
        });

        // EndState st-04
        self.add('state_end_language', function(name) {
            return new EndState(name, {
                text: $(questions[name]),
                next: 'state_start'
            });
        });

    // Change number
        // FreeText st-05
        self.add('state_change_number', function(name) {
            return new FreeText(name, {
                question: $(questions[name]),
                check: function(content) {
                    if (go.utils.is_valid_msisdn(content)) {
                        return null;  // vumi expects null or undefined if check passes
                    } else {
                        return $(get_error_text(name));
                    }
                },
                next: 'state_change_recipient'
            });
        });

        // ChoiceState st-06
        self.add('state_change_recipient', function(name) {
            return new ChoiceState(name, {
                question: $(questions[name]),
                choices: [
                    new Choice('head_of_household', $("Head of the Household")),
                    new Choice('mother_to_be', $("Mother to be")),
                    new Choice('family_member', $("Family member")),
                    new Choice('trusted_friend', $("Trusted friend"))
                ],
                error: $(get_error_text(name)),
                next: 'state_end_recipient'
            });
        });

        // EndState st-07
        self.add('state_end_recipient', function(name) {
            return new EndState(name, {
                text: $(questions[name]),
                next: 'state_start'
            });
        });

    // Optout
        // ChoiceState st-08
        self.add('state_optout_reason', function(name) {
            var loss_reasons = ['miscarriage', 'stillborn', 'baby_died'];
            return new ChoiceState(name, {
                question: $(questions[name]),
                choices: [
                    new Choice('miscarriage', $("Mother miscarried")),
                    new Choice('stillborn', $("Baby stillborn")),
                    new Choice('baby_died', $("Baby passed away")),
                    new Choice('not_useful', $("Messages not useful")),
                    new Choice('other', $("Other"))
                ],
                error: $(get_error_text(name)),
                next: function(choice) {
                    return loss_reasons.indexOf(choice.value) !== -1
                        ? 'state_loss_subscription'
                        : 'state_end_optout';
                }
            });
        });

        // ChoiceState st-09
        self.add('state_loss_subscription', function(name) {
            return new ChoiceState(name, {
                question: $(questions[name]),
                choices: [
                    new Choice('state_end_loss_subscription', $("Yes")),
                    new Choice('state_end_optout', $("No"))
                ],
                error: $(get_error_text(name)),
                next: function(choice) {
                    return choice.value;
                }
            });
        });

        // EndState st-10
        self.add('state_end_loss_subscription', function(name) {
            return new EndState(name, {
                text: $(questions[name]),
                next: 'state_start'
            });
        });

        // EndState st-11
        self.add('state_end_optout', function(name) {
            return new EndState(name, {
                text: $(questions[name]),
                next: 'state_start'
            });
        });

    // REGISTRATION STATES

        // ChoiceState st-01
        self.add('state_msg_receiver', function(name) {
            return new ChoiceState(name, {
                question: $(questions[name]),
                choices: [
                    new Choice('head_of_household', $("Head of the Household")),
                    new Choice('mother_to_be', $("Mother to be")),
                    new Choice('family_member', $("Family member")),
                    new Choice('trusted_friend', $("Trusted friend"))
                ],
                error: $(get_error_text(name)),
                next: 'state_last_period_month'
            });
        });

        // ChoiceState st-05
        self.add('state_last_period_month', function(name) {
            var today = go.utils.get_today(self.im.config);
            return new ChoiceState(name, {
                question: $(questions[name]),
                choices: go.utils.make_month_choices($, today, 9, -1, "MMYYYY", "MMM YY"),
                error: $(get_error_text(name)),
                next: 'state_last_period_day'
            });
        });

        // FreeText st-06
        self.add('state_last_period_day', function(name) {
            return new FreeText(name, {
                question: $(questions[name]),
                check: function(content) {
                    if (go.utils.is_valid_day_of_month(content)) {
                        return null;  // vumi expects null or undefined if check passes
                    } else {
                        return $(get_error_text(name));
                    }
                },
                next: 'state_hiv_messages'
            });
        });

        // ChoiceState st-12
        self.add('state_hiv_messages', function(name) {
            return new ChoiceState(name, {
                question: $(questions[name]),
                error: $(get_error_text(name)),
                choices: [
                    new Choice('yes_hiv_msgs', $('Yes')),
                    new Choice('no_hiv_msgs', $('No'))
                ],
                next: 'state_get_health_id'
            });
        });

        self.add('state_get_health_id', function(name) {
            return go.utils
                .get_identity(self.im.user.answers.contact_id, self.im)
                .then(function(identity) {
                    self.im.user.set_answer('health_id', identity.details.health_id);
                    return self.states.create('state_end_thank_you');
                });
        });

        // EndState st-13
        self.add('state_end_thank_you', function(name) {
            return new EndState(name, {
                text: $(questions[name]).context({health_id: self.im.user.answers.health_id}),
                next: 'state_start'
            });
        });

    });

    return {
        GoFC: GoFC
    };
}();

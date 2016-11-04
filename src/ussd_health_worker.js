go.app = function() {
    var vumigo = require('vumigo_v02');
    var App = vumigo.App;
    var Choice = vumigo.states.Choice;
    var ChoiceState = vumigo.states.ChoiceState;
    var EndState = vumigo.states.EndState;
    var FreeText = vumigo.states.FreeText;


    var GoFC = App.extend(function(self) {
        App.call(self, 'state_start');
        var $ = self.$;
        var interrupt = true;

        self.init = function() {};


    // TEXT CONTENT

        var questions = {
            "state_timed_out":
                $("You have an incomplete registration. Would you like to continue with this registration?"),
            "state_auth_code":
                $("Welcome to FamilyConnect. Please enter your unique personnel code. For example, 12345"),
            "state_msisdn":
                $("Please enter the mobile number of the person who will receive the weekly messages. For example: 0803304899"),
            "state_msisdn_already_registered":
                $("{{msisdn}} is already registered for messages."),
            "state_household_head_name":
                $("Please enter both the first name and last name of the Head of Household. For example: Isaac Mbire"),
            "state_household_head_surname":
                $("You only entered the first name, please enter the lastname of the household? For example: Mbire"),
            "state_last_period_month":
                $("Please select the month the woman started her last period:"),
            "state_last_period_day":
                $("What date of the month did the woman start her last period? For example, 12."),
            "state_mother_name":
                $("Please enter the first name of the woman. For example: Sharon"),
            "state_mother_surname":
                $("Please enter the surname of the woman. For example: Nalule"),
            "state_msg_language":
                $("What language would they like to receive these messages in?"),
            "state_end_thank_you":
                $("Thank you. The woman's FamilyConnect ID is {{health_id}}. They will now start receiving messages"),
        };

        var errors = {
            "state_timed_out":
                $("Sorry, not a valid input. You have an incomplete registration. Would you like to continue with this registration?"),
            "state_auth_code":
                $("That code is not recognised. Please enter your 5 digit personnel code."),
            "state_msisdn":
                $("Sorry, invalid number. Please enter the mobile number of the person who will receive the weekly messages. For example, 0803304899"),
            "state_msisdn_already_registered":
                $("Sorry, not a valid input. {{msisdn}} is already registered for messages."),
            "state_household_head_name":
                $("Sorry, invalid name. Please enter both the first  name and surname of the Head of the Household. For example: Isaac Mbire"),
            "state_household_head_surname":
                $("Sorry not a valid input. Please enter the last name of the Head of the Household. For example: Mbire"),
            "state_last_period_month":
                $("Sorry, not a valid input. When month did the woman start her last period:"),
            "state_last_period_day":
                $("Sorry, not a valid input. What date of the month did the woman start her last period? For example, 12."),
            "state_mother_name":
                $("Sorry, invalid name. Please enter the first name of the woman. For example: Sharon"),
            "state_mother_surname":
                $("Sorry, invalid name. Please enter the surname of the woman. For example: Nalule"),
            "state_msg_language":
                $("Sorry, not a valid input. What language would they like to receive these messages in?"),
            "state_end_thank_you":
                $("Thank you. The woman's FamilyConnect ID is {{health_id}}. They will now start receiving messages"),
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
                question: questions[name],
                choices: [
                    new Choice('continue', $("Yes")),
                    new Choice('restart', $("No, start new registration"))
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


    // START STATE

        self.add('state_start', function(name) {
            // Reset user answers when restarting the app
            self.im.user.answers = {};
            return go.utils
                .get_or_create_identity({'msisdn': self.im.user.addr}, self.im, null)
                .then(function(user) {
                    if (user.details.personnel_code) {
                        self.im.user.set_answer('operator_id', user.id);
                        return self.states.create('state_msisdn');
                    } else {
                        return self.states.create('state_auth_code');
                    }
                });
        });


    // REGISTRATION STATES

        // FreeText st-B
        self.add('state_auth_code', function(name) {
            return new FreeText(name, {
                question: questions[name],
                check: function(content) {
                    return go.utils_project
                        .find_healthworker_with_personnel_code(self.im, content)
                        .then(function(healthworker) {
                            if (healthworker) {
                                self.im.user.set_answer('operator_id', healthworker.id);
                                return null;  // vumi expects null or undefined if check passes
                            } else {
                                return errors[name];
                            }
                        });
                },
                next: 'state_msisdn'
            });
        });

        // FreeText st-02
        self.add('state_msisdn', function(name) {
            return new FreeText(name, {
                question: questions[name],
                check: function(content) {
                    if (go.utils.is_valid_msisdn(content)) {
                        return null;  // vumi expects null or undefined if check passes
                    } else {
                        return errors[name];
                    }
                },
                next: 'state_msisdn_check'
            });
        });

        // interstitial
        self.add('state_msisdn_check', function(name) {
            return go.utils
                // check if identity with msisdn alreay exists in db
                .get_identity_by_address(
                    {'msisdn': go.utils.normalize_msisdn(
                        self.im.user.answers.state_msisdn,
                        self.im.config.country_code)
                    }, self.im
                )
                .then(function(identity) {
                    if (identity) {
                        self.im.user.set_answer('receiver_id', identity.id);
                        // check if identity has active subscription
                        return go.utils
                            .has_active_subscription(identity.id, self.im)
                            .then(function(hasSubscriptions) {
                                if (hasSubscriptions) {
                                    // should result in a rewrite of existing subscription
                                    // info if user chooses to continue registration at
                                    // next state/screen
                                    return self.states.create('state_msisdn_already_registered');
                                } else {
                                    return self.states.create('state_save_identities');
                                }
                            });
                    }
                    else {
                        return go.utils
                            .create_identity(
                                self.im,
                                {'msisdn': go.utils.normalize_msisdn(
                                    self.im.user.answers.state_msisdn,
                                    self.im.config.country_code)
                                }, null, self.im.user.answers.operator_id
                            )
                            .then(function(identity) {
                                self.im.user.set_answer('receiver_id', identity.id);
                                return self.states.create('state_save_identities');
                            });
                    }
                });
        });

        // ChoiceState st-2B
        self.add('state_msisdn_already_registered', function(name) {
            return new ChoiceState(name, {
                question: questions[name].context({
                    msisdn: self.im.user.answers.state_msisdn
                }),
                error: errors[name],
                choices: [
                    new Choice('continue', $("Continue registration")),
                    new Choice('register', $("Register a different number"))
                ],
                next: function(choice) {
                    return choice.value === 'continue'
                        ? 'state_household_head_name'
                        : 'state_msisdn';
                }
            });
        });

        // Get or create identities and save their IDs
        self.add('state_save_identities', function(name) {
            return go.utils_project
                .save_identities(
                    self.im,
                    'mother_to_be',
                    self.im.user.answers.receiver_id,
                    self.im.user.answers.operator_id
                )
                .then(function() {
                    return self.states.create('state_household_head_name');
                });
        });

        // FreeText st-04
        self.add('state_household_head_name', function(name) {
            return new FreeText(name, {
                question: questions[name],
                check: function(content) {
                    if (!go.utils.is_valid_name(content, 1, 150)) {
                        return errors[name];
                    }
                    names = go.utils.split_parts(content);
                    if (!(names instanceof Array) || names.length === 0){
                        return errors[name];
                    }
                    return null;
                },
                next: 'check_household_head_name'
            });
        });

        self.add('check_household_head_name', function(name) {
            names = go.utils.split_parts(self.im.user.answers.state_household_head_name);
            if (names.length === 1) {
                return self.states.create('state_household_head_surname');
            } else {
                self.im.user.answers.state_household_head_surname = names.pop();
                self.im.user.answers.state_household_head_name = names.join(' ');
                return self.states.create('state_last_period_month');
            }
        });

        // FreeText st-13
        self.add('state_household_head_surname', function(name) {
            return new FreeText(name, {
                question: questions[name],
                check: function(content) {
                    if (!go.utils.is_valid_name(content, 1, 150)) {
                        return errors[name];
                    }
                    return null;
                },
                next: 'state_last_period_month'
            });
        });


        // ChoiceState st-05
        self.add('state_last_period_month', function(name) {
            var today = go.utils.get_today(self.im.config);
            return new ChoiceState(name, {
                question: questions[name],
                choices: go.utils.make_month_choices($, today, 9, -1, "MMYYYY", "MMM YY"),
                error: errors[name],
                next: 'state_last_period_day'
            });
        });

        // FreeText st-06
        self.add('state_last_period_day', function(name) {
            return new FreeText(name, {
                question: questions[name],
                check: function(content) {
                    if (go.utils.is_valid_day_of_month(content)) {
                        return null;  // vumi expects null or undefined if check passes
                    } else {
                        return errors[name];
                    }
                },
                next: function(content) {
                    var year = self.im.user.answers.state_last_period_month.substr(2,4);
                    var month = self.im.user.answers.state_last_period_month.substr(0,2);
                    var day = go.utils.double_digit_number(content);
                    self.im.user.set_answer('last_period_date', year+month+day);
                    return 'state_mother_name';
                }
            });
        });

        // FreeText st-07
        self.add('state_mother_name', function(name) {
            return new FreeText(name, {
                question: questions[name],
                check: function(content) {
                    if (go.utils.is_valid_name(content, 1, 150)) {
                        return null;  // vumi expects null or undefined if check passes
                    } else {
                        return errors[name];
                    }
                },
                next: 'state_mother_surname'
            });
        });

        // FreeText st-08
        self.add('state_mother_surname', function(name) {
            return new FreeText(name, {
                question: questions[name],
                check: function(content) {
                    if (go.utils.is_valid_name(content, 1, 150)) {
                        return null;  // vumi expects null or undefined if check passes
                    } else {
                        return errors[name];
                    }
                },
                next: 'state_msg_language'
            });
        });

        // ChoiceState st-11
        self.add('state_msg_language', function(name) {
            return new ChoiceState(name, {
                question: questions[name],
                error: errors[name],
                choices: [
                    new Choice('eng_UG', $('English')),
                    new Choice('cgg_UG', $('Rukiga')),
                    new Choice('xog_UG', $('Lusoga')),
                    new Choice('lug_UG', $('Luganda'))
                ],
                next: 'state_get_health_id'
            });
        });

        self.add('state_get_health_id', function(name) {
            return go.utils
                .get_identity(self.im.user.answers.mother_id, self.im)
                .then(function(identity) {
                    self.im.user.set_answer('health_id', identity.details.health_id);
                    return self.states.create('state_finish_registration');
                });
        });

        // ChoiceState st-12
        self.add('state_finish_registration', function(name) {
            self.im.user.answers.state_msg_receiver = 'mother_to_be';
            return go.utils_project
                .finish_registration(self.im)
                .then(function() {
                    return self.states.create('state_end_thank_you');
                });
        });

        // EndState st-13
        self.add('state_end_thank_you', function(name) {
            return new EndState(name, {
                text: questions[name].context({
                    health_id: self.im.user.answers.health_id
                }),
                next: 'state_start'
            });
        });

    });

    return {
        GoFC: GoFC
    };
}();

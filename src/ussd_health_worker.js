go.app = function() {
    var vumigo = require('vumigo_v02');
    var App = vumigo.App;
    var Choice = vumigo.states.Choice;
    var ChoiceState = vumigo.states.ChoiceState;
    var PaginatedChoiceState = vumigo.states.PaginatedChoiceState;
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
                "You have an incomplete registration. Would you like to continue with this registration?",
            "state_auth_code":
                "Welcome to FamilyConnect. Please enter your unique personnel code. For example, 12345",
            "state_msg_receiver":
                "Please select who will receive the messages on their phone:",
            "state_msisdn":
                "Please enter the mobile number which the messages will be sent to. For example, 0803304899",
            "state_msisdn_already_registered":
                "{{msisdn}} is already registered for messages.",
            "state_household_head_name":
                "Please enter the first name of the Head of the Household. For example: Isaac.",
            "state_household_head_surname":
                "Please enter the surname of the Head of the Household. For example: Mbire.",
            "state_last_period_month":
                "When did the woman have her last period:",
            "state_last_period_day":
                "What day of the month did the woman start her last period? For example, 12.",
            "state_mother_name":
                "Please enter the name of the woman. For example: Sharon",
            "state_mother_surname":
                "Please enter the surname of the woman. For example: Nalule",
            "state_id_type":
                "What kind of identification does the woman have?",
            "state_nin":
                "Please enter the woman's National Identity Number:",
            "state_mother_birth_day":
                "Please enter the day the woman was born. For example, 12.",
            "state_mother_birth_month":
                "Please select the month of birth:",
            "state_mother_birth_year":
                "Please enter the year the mother was born. For example, 1986.",
            "state_msg_language":
                "What language would they want to receive these messages in?",
            "state_hiv_messages":
                "Would they like to receive additional messages about HIV?",
            "state_end_thank_you":
                "Thank you. The woman's FamilyConnect ID is {{health_id}}. They will now start receiving messages",
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
                    self.im.user.set_answer('user_id', user.id);
                    if (user.details.personnel_code) {
                        return self.states.create('state_msg_receiver');
                    } else {
                        return self.states.create('state_auth_code');
                    }
                });
        });


    // REGISTRATION STATES

        // FreeText st-B
        self.add('state_auth_code', function(name) {
            return new FreeText(name, {
                question: $(questions[name]),
                check: function(content) {
                    return go.utils_project
                        .find_healthworker_with_personnel_code(self.im, content)
                        .then(function(healthworker) {
                            if (healthworker) {
                                self.im.user.set_answer('operator_id', healthworker.id);
                                return null;  // vumi expects null or undefined if check passes
                            } else {
                                return $(get_error_text(name));
                            }
                        });
                },
                next: 'state_msg_receiver'
            });
        });

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
                next: 'state_msisdn'
            });
        });

        // FreeText st-02
        self.add('state_msisdn', function(name) {
            return new FreeText(name, {
                question: $(questions[name]),
                check: function(content) {
                    if (go.utils.is_valid_msisdn(content)) {
                        return null;  // vumi expects null or undefined if check passes
                    } else {
                        return $(get_error_text(name));
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
                question: $(questions[name]).context({msisdn: self.im.user.answers.state_msisdn}),
                error: $(get_error_text(name)),
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
                    self.im.user.answers.state_msg_receiver,
                    self.im.user.answers.receiver_id,
                    self.im.user.answers.operator_id
                )
                .then(function() {
                    return self.states.create('state_household_head_name');
                });
        });

        // FreeText st-03
        self.add('state_household_head_name', function(name) {
            return new FreeText(name, {
                question: $(questions[name]),
                check: function(content) {
                    if (go.utils.is_valid_name(content, 1, 150)) {
                        return null;  // vumi expects null or undefined if check passes
                    } else {
                        return $(get_error_text(name));
                    }
                },
                next: 'state_household_head_surname'
            });
        });

        // FreeText st-04
        self.add('state_household_head_surname', function(name) {
            return new FreeText(name, {
                question: $(questions[name]),
                check: function(content) {
                    if (go.utils.is_valid_name(content, 1, 150)) {
                        return null;  // vumi expects null or undefined if check passes
                    } else {
                        return $(get_error_text(name));
                    }
                },
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
                next: 'state_mother_name'
            });
        });

        // FreeText st-07
        self.add('state_mother_name', function(name) {
            return new FreeText(name, {
                question: $(questions[name]),
                check: function(content) {
                    if (go.utils.is_valid_name(content, 1, 150)) {
                        return null;  // vumi expects null or undefined if check passes
                    } else {
                        return $(get_error_text(name));
                    }
                },
                next: 'state_mother_surname'
            });
        });

        // FreeText st-08
        self.add('state_mother_surname', function(name) {
            return new FreeText(name, {
                question: $(questions[name]),
                check: function(content) {
                    if (go.utils.is_valid_name(content, 1, 150)) {
                        return null;  // vumi expects null or undefined if check passes
                    } else {
                        return $(get_error_text(name));
                    }
                },
                next: 'state_id_type'
            });
        });

        // ChoiceState st-09
        self.add('state_id_type', function(name) {
            return new ChoiceState(name, {
                question: $(questions[name]),
                error: $(get_error_text(name)),
                choices: [
                    new Choice('ugandan_id', $("Ugandan National Identity Number")),
                    new Choice('other', $("Other"))
                ],
                next: function(choice) {
                    return choice.value === 'ugandan_id'
                        ? 'state_nin'
                        : 'state_mother_birth_day';
                }
            });
        });

        // FreeText st-10
        self.add('state_nin', function(name) {
            return new FreeText(name, {
                question: $(questions[name]),
                next: 'state_msg_language'
            });
        });

        // FreeText st-17
        self.add('state_mother_birth_day', function(name) {
            return new FreeText(name, {
                question: $(questions[name]),
                check: function(content) {
                    if (go.utils.is_valid_day_of_month(content)) {
                        return null;  // vumi expects null or undefined if check passes
                    } else {
                        return $(get_error_text(name));
                    }
                },
                next: 'state_mother_birth_month'
            });
        });

        // PaginatedChoiceState st-18 / st-19
        self.add('state_mother_birth_month', function(name) {
            return new PaginatedChoiceState(name, {
                question: $(questions[name]),
                error: $(get_error_text(name)),
                characters_per_page: 160,
                options_per_page: null,
                more: $('More'),
                back: $('Back'),
                choices: [
                    new Choice('01', $('January')),
                    new Choice('02', $('February')),
                    new Choice('03', $('March')),
                    new Choice('04', $('April')),
                    new Choice('05', $('May')),
                    new Choice('06', $('June')),
                    new Choice('07', $('July')),
                    new Choice('08', $('August')),
                    new Choice('09', $('September')),
                    new Choice('10', $('October')),
                    new Choice('11', $('November')),
                    new Choice('12', $('December'))
                ],
                next: 'state_mother_birth_year'
            });
        });

        // FreeText st-20
        self.add('state_mother_birth_year', function(name) {
            return new FreeText(name, {
                question: $(questions[name]),
                check: function(content) {
                    if (go.utils.is_valid_year(content, '1900', go.utils.get_today(self.im.config).format('YYYY'))) {
                        return null;  // vumi expects null or undefined if check passes
                    } else {
                        return $(get_error_text(name));
                    }
                },
                next: 'state_msg_language'
            });
        });

        // ChoiceState st-11
        self.add('state_msg_language', function(name) {
            return new ChoiceState(name, {
                question: $(questions[name]),
                error: $(get_error_text(name)),
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
                    return self.states.create('state_hiv_messages');
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
                next: 'state_end_thank_you'
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

go.app = function() {
    var vumigo = require('vumigo_v02');
    var MetricsHelper = require('go-jsbox-metrics-helper');
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
            "state_auth_code":
                "Welcome to FamilyConnect. Please enter your unique personnel code. For example, 12345",
            "state_msg_receiver":
                "Please select who will receive the messages on their phone:",
            "state_msisdn":
                "Please enter the cellphone number which the messages will be sent to. For example, 0713627893",
            "state_household_head_name":
                "Please enter the first name of the Head of the Household of the Pregnant woman. For example, Isaac.",
            "state_household_head_surname":
                "Please enter the surname of the Head of the Household of the pregnant woman. For example, Mbire.",
            "state_last_period_month":
                "Please select the month when the woman had her last period:",
            "state_last_period_day":
                "What day did her last period start on? (For example, 12)",
            "state_id_type":
                "What kind of identification does the pregnant woman have?",
            "state_nin":
                "Please enter her National Identity Number (NIN).",
            "state_mother_birth_day":
                "Please enter the day the she was born. For example, 12.",
            "state_mother_birth_month":
                "Please select the month of year the Mother was born:",
            "state_mother_birth_year":
                "Please enter the year the mother was born. For example, 1986.",
            "state_msg_language":
                "Which language would they want to receive messages in?",
        };

        var get_error_text = function(name) {
            return errors[name] || "Sorry not a valid input. " + questions[name];
        };

        var errors = {
            // "state_timed_out":
            //     "You have an incomplete registration. Would you like to continue with this registration?",
            "state_auth_code":
                "That code is not recognised. Please enter your 5 digit personnel code.",
            // "state_msisdn":
            //     "That number is invalid. Please enter the cellphone number which the messages will be sent to.",
            // "state_household_head_name":
            //     "That name is invalid. Please enter the first name of the Head of the Household of the Pregnant woman.",
            // "state_household_head_surname":
            //     "That surname is not invalid. Please enter the surname of the Head of the Household.",
            // "state_last_period_month":
            //     "That is an invalid month. Please select the month when the woman had her last period:",
            // "state_last_period_day":
            //     "That number is not valid. Please enter the day her last period started on. For example, 12",
            // "state_id_type":
            //     "That is an invalid selection. Please select what identification the woman has:",
            // "state_nin":
            //     "Please enter her National Identity Number (NIN).",
            // "state_mother_birth_day":
            //     "That number is invalid. Please enter the day the she was born. For example, 12",
            // "state_mother_birth_month":
            //     "That is an invalid month. Please select the month of year the Mother was born.",
            // "state_mother_birth_year":
            //     "That number is invalid. Please enter the year the mother was born.",
            // "state_msg_language":
            //     "That is an invalid language. Please select the language they want to receive messages in.",
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
                    new Choice('restart', $("Start new registration"))
                ],
                next: function(choice) {
                    return go.utils
                        .track_redials(self.contact, self.im, choice.value)
                        .then(function() {
                            if (choice.value === 'continue') {
                                return {
                                    name: creator_opts.name,
                                    creator_opts: creator_opts
                                };
                                // return creator_opts.name;
                            } else if (choice.value === 'restart') {
                                return 'state_start';
                            }
                        });
                }
            });
        });


    // START STATE

        self.add('state_start', function(name) {
            if (self.im.config.pre_auth === 'on') {
                return self.states.create('state_auth_code');
            } else {
                return self.states.create('state_msg_receiver');
            }
        });


    // REGISTRATION STATES

        // FreeText state_auth_code
        self.add('state_auth_code', function(name) {
            return new FreeText(name, {
                question: $(questions[name]),
                check: function(content) {
                    return go.utils
                        .validate_personnel_code(self.im, content)
                        .then(function(valid_clinic_code) {
                            if (valid_clinic_code) {
                                return null;  // vumi expects null or undefined if check passes
                            } else {
                                return $(get_error_text(name));
                            }
                        });
                },
                next: 'state_msg_receiver'
            });
        });

        // ChoiceState state_msg_receiver
        self.add('state_msg_receiver', function(name) {
            return new ChoiceState(name, {
                question: $(questions[name]),
                choices: [
                    new Choice('head_of_household', $("Head of Household")),
                    new Choice('mother_to_be', $("Mother to be")),
                    new Choice('friend_or_family', $("Trusted friend/family member"))
                ],
                error: $(get_error_text(name)),
                next: 'state_msisdn'
            });
        });

        // FreeText state_msisdn
        self.add('state_msisdn', function(name) {
            var question = $(questions[name]);
            var error = $(errors[name]);
            return new FreeText(name, {
                question: question,
                check: function(content) {
                    if (go.utils.is_valid_msisdn(content)) {
                        return null;  // vumi expects null or undefined if check passes
                    } else {
                        return error;
                    }
                },
                next: 'state_household_head_name'
            });
        });

        // FreeText state_household_head_name
        self.add('state_household_head_name', function(name) {
            var question = $(questions[name]);
            var error = $(errors[name]);
            return new FreeText(name, {
                question: question,
                check: function(content) {
                    if (go.utils.is_valid_name(content)) {
                        return null;  // vumi expects null or undefined if check passes
                    } else {
                        return error;
                    }
                },
                next: 'state_household_head_surname'
            });
        });

        // FreeText state_household_head_surname
        self.add('state_household_head_surname', function(name) {
            var question = $(questions[name]);
            var error = $(errors[name]);
            return new FreeText(name, {
                question: question,
                check: function(content) {
                    if (go.utils.is_valid_name(content)) {
                        return null;  // vumi expects null or undefined if check passes
                    } else {
                        return error;
                    }
                },
                next: 'state_last_period_month'
            });
        });

        // ChoiceState state_last_period_month
        self.add('state_last_period_month', function(name) {
            var today = go.utils.get_today(self.im.config);
            var start_month = today.month();
            var question = $(questions[name]);
            var error = $(errors[name]);
            return new ChoiceState(name, {
                question: question,
                choices: go.utils.make_month_choices($, start_month, 9, -1),
                error: error,
                next: 'state_last_period_day'
            });
        });

        // FreeText state_last_period_day
        self.add('state_last_period_day', function(name) {
            var question = $(questions[name]);
            var error = $(errors[name]);
            return new FreeText(name, {
                question: question,
                check: function(content) {
                    if (go.utils.is_valid_day_of_month(content)) {
                        return null;  // vumi expects null or undefined if check passes
                    } else {
                        return error;
                    }
                },
                next: 'state_id_type'
            });
        });

        // ChoiceState state_id_type
        self.add('state_id_type', function(name) {
            var question = $(questions[name]);
            var error = $(errors[name]);
            return new ChoiceState(name, {
                question: question,
                error: error,
                choices: [
                    new Choice('ugandan_id', $('Ugandan ID')),
                    new Choice('other', $('None/other'))
                ],
                next: function(choice) {
                    return choice.value === 'ugandan_id'
                        ? 'state_nin'
                        : 'state_mother_birth_day';
                }
            });
        });

        // FreeText state_nin
        self.add('state_nin', function(name) {
            var question = $(questions[name]);
            return new FreeText(name, {
                question: question,
                next: 'state_msg_language'
            });
        });

        // FreeText state_mother_birth_day
        self.add('state_mother_birth_day', function(name) {
            var question = $(questions[name]);
            var error = $(errors[name]);
            return new FreeText(name, {
                question: question,
                check: function(content) {
                    if (go.utils.is_valid_day_of_month(content)) {
                        return null;  // vumi expects null or undefined if check passes
                    } else {
                        return error;
                    }
                },
                next: 'state_mother_birth_month'
            });
        });

        // PaginatedChoiceState state_mother_birth_month
        self.add('state_mother_birth_month', function(name) {
            return new PaginatedChoiceState(name, {
                question: $(questions[name]),
                error: $(errors[name]),
                characters_per_page: 160,
                options_per_page: null,
                more: $('More'),
                back: $('Back'),
                choices: [
                    new Choice('01', $('Jan')),
                    new Choice('02', $('Feb')),
                    new Choice('03', $('Mar')),
                    new Choice('04', $('Apr')),
                    new Choice('05', $('May')),
                    new Choice('06', $('June')),
                    new Choice('07', $('July')),
                    new Choice('08', $('Aug')),
                    new Choice('09', $('Sep')),
                    new Choice('10', $('Oct')),
                    new Choice('11', $('Nov')),
                    new Choice('12', $('Dec'))
                ],
                next: 'state_mother_birth_year'
            });
        });

        // FreeText state_mother_birth_year
        self.add('state_mother_birth_year', function(name) {
            var question = $(questions[name]);
            var error = $(errors[name]);
            return new FreeText(name, {
                question: question,
                check: function(content) {
                    if (go.utils.is_valid_year(content)) {
                        return null;  // vumi expects null or undefined if check passes
                    } else {
                        return error;
                    }
                },
                next: 'state_msg_language'
            });
        });

        // ChoiceState state_msg_language
        self.add('state_msg_language', function(name) {
            var question = $(questions[name]);
            var error = $(errors[name]);
            return new ChoiceState(name, {
                question: question,
                error: error,
                choices: [
                    new Choice('english', $('English')),
                    new Choice('rukiga', $('Rukiga')),
                    new Choice('lusoga', $('Lusoga'))
                ],
                next: function(choice) {
                    return choice.value === 'english'
                        ? 'state_end_thank_you_enter'
                        : 'state_end_thank_translate_enter';
                }
            });
        });

        self.states.add('state_end_thank_you_enter', function(name) {
            return self.im.outbound.send_to_user({
                    endpoint: 'sms',
                    content: $("Thank you. The pregnant woman will receive messages in English.")
                })
                .then(function() {
                    return self.states.create('state_end_thank_you');
                });
        });


        // EndState state_end_thank_you
        self.add('state_end_thank_you', function(name) {
            return new EndState(name, {
                text: $("Thank you. The pregnant woman will now receive messages."),
                next: 'state_start'
            });
        });

        self.states.add('state_end_thank_translate_enter', function(name) {
            return self.im.outbound.send_to_user({
                    endpoint: 'sms',
                    content: $("Thank you. The pregnant woman will receive messages in English until Runyankore and Lusoga messages are available.")
                })
                .then(function() {
                    return self.states.create('state_end_thank_translate');
                });
        });

        // EndState state_end_thank_translate
        self.add('state_end_thank_translate', function(name) {
            return new EndState(name, {
                text: $("Thank you. The pregnant woman will receive messages in English until Runyankore and Lusoga messages are available."),
                next: 'state_start'
            });
        });

    });

    return {
        GoFC: GoFC
    };
}();
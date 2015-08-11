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
                question: $("You have an incomplete registration. Would you like to continue with this registration?"),
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
                return self.states.create('state_welcome');
            }
        });


    // REGISTRATION STATES

        // FreeText state_auth_code
        self.add('state_auth_code', function(name) {
            var question = $("Welcome to FamilyConnect. Please enter your 5 digit personnel code.");
            var error = $("That code is not recognised. Please enter your 5 digit personnel code.");
            return new FreeText(name, {
                question: question,
                check: function(content) {
                    return go.utils
                        .validate_personnel_code(self.im, content)
                        .then(function(valid_clinic_code) {
                            if (valid_clinic_code) {
                                return null;  // vumi expects null or undefined if check passes
                            } else {
                                return error;
                            }
                        });
                },
                next: 'state_msg_receiver'
            });
        });

        // ChoiceState state_msg_receiver
        self.add('state_msg_receiver', function(name) {
            var question = $("Welcome to FamilyConnect. Please select who will receive the messages:");
            var error = $("That is an invalid selection. Please select who will receive the messages:");
            return new ChoiceState(name, {
                question: question,
                choices: [
                    new Choice('head_of_household', $("Head of Household")),
                    new Choice('mother_to_be', $("Mother to be")),
                    new Choice('friend_or_family', $("Trusted friend/family member"))
                ],
                error: error,
                next: 'state_msisdn'
            });
        });

        // FreeText state_msisdn
        self.add('state_msisdn', function(name) {
            var question = $("Please enter the cellphone number which the messages will be sent to. For example, 0713627893");
            var error = $("That number is invalid. Please enter the cellphone number which the messages will be sent to.");
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
            var question = $("Please enter the name of the Head of the Household of the pregnant woman. For example, Isaac.");
            var error = $("That name is invalid. Please enter the name of the Head of the Household.");
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
            var question = $("Please enter the surname of the Head of the Household of the pregnant woman. For example, Mbire.");
            var error = $("That surname is not invalid. Please enter the surname of the Head of the Household.");
            return new FreeText(name, {
                question: question,
                check: function(content) {
                    if (go.utils.is_valid_name(content)) {
                        return null;  // vumi expects null or undefined if check passes
                    } else {
                        return error;
                    }
                },
                next: 'state_end_thank_you'
            });
        });

        // ChoiceState state_last_period_month


        // ChoiceState state_last_period_day


        // ChoiceState state_nin


        // FreeText state_mother_birth_day


        // PaginatedChoiceState state_mother_birth_month


        // FreeText state_mother_birth_year


        // ChoiceState state_msg_language


        // EndState state_end_thank_you
        self.add('state_end_thank_you', function(name) {
            return new EndState(name, {
                text: $("Thank you. The pregnant woman will now receive messages."),
                next: 'state_start'
            });
        });

    });

    return {
        GoFC: GoFC
    };
}();

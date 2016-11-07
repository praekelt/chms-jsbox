go.app = function() {
    var vumigo = require('vumigo_v02');
    var Q = require('q');
    var App = vumigo.App;
    var Choice = vumigo.states.Choice;
    var ChoiceState = vumigo.states.ChoiceState;
    var EndState = vumigo.states.EndState;
    var FreeText = vumigo.states.FreeText;
    var MenuState = vumigo.states.MenuState;


    var GoFC = App.extend(function(self) {
        App.call(self, 'state_start');
        var $ = self.$;

        self.init = function() {};


    // TEXT CONTENT

        var questions = {
            "state_timed_out":
                $("You have an incomplete registration. Would you like to continue with this registration?"),
            "state_language":
                $("Welcome to FamilyConnect. Please choose your language"),
            "state_choose_number":
                $("Choose from:"),
            "state_manage_msisdn":
                $("Please enter the mobile number of the person who will receive the weekly messages. For example 0803304899"),
            "state_change_menu":
                $("Choose:"),
            "state_registration_menu":
                $("Choose from:"),

            "state_already_baby":
                $("You are already registered for baby messages."),
            "state_end_baby":
                $("Thank you. You will now receive messages about caring for the baby"),

            "state_change_language":
                $("What language would you like to receive messages in?"),
            "state_end_language":
                $("Thank you. Your language preference has been updated and you will start to receive SMSs in this language."),

            "state_change_number":
                $("Please enter the new mobile number you would like to receive weekly messages on. For example 0803304899"),
            "state_number_in_use":
                $("Sorry, this number is already registered."),
            "state_change_recipient":
                $("Who will receive these messages?"),
            "state_end_recipient":
                $("Thank you. The number which receives messages has been updated."),

            "state_optout_reason":
                $("Why do you no longer want to receive messages?"),
            "state_loss_subscription":
                $("We are sorry for your loss. Would you like to receive a small set of free messages from FamilyConnect that could help you in this difficult time?"),
            "state_end_loss_subscription":
                $("Thank you. You will now receive messages to support you during this difficult time."),
            "state_end_optout":
                $("Thank you. You will no longer receive messages"),

            "state_last_period_month":
                $("What month did you start your last period?"),
            "state_last_period_day":
                $("What date of the month did you start your last period? For example, 12."),
            "state_cellphone_or_search":
                $("Do you know your local village health team (VHT)?"),
            "state_vht_cellphone_number":
                $("Please enter their cellphone number. For example, 0803304899"),
            "state_check_vht_exists":
                $("We did not recognise the VHTs number."),
            "state_parish_search":
                $("What is the name of your parish?"),
            "state_select_parish":
                $("Select your parish"),
            "state_no_parish_results":
                $("Sorry, there are no results for your parish name."),
            "state_retry_parish_search":
                $("Please re-enter your parish name carefully and make sure you use the correct spelling."),
            "state_end_thank_you":
                $("Thank you. Your FamilyConnect ID is {{health_id}}. You will receive an SMS with it shortly."),

            "state_end_general":
                $("Thank you for using the FamilyConnect service")
        };

        var errors = {
            "state_timed_out":
                $("Sorry, invalid option."),
            "state_language":
                $("Sorry, invalid option."),
            "state_choose_number":
                $("Sorry, invalid option."),
            "state_manage_msisdn":
                $("Sorry, invalid number."),
            "state_change_menu":
                $("Sorry, invalid option."),
            "state_registration_menu":
                $("Sorry, invalid option."),

            "state_already_baby":
                $("Sorry, invalid option."),

            "state_change_language":
                $("Sorry, invalid option."),

            "state_change_number":
                $("Sorry, invalid number."),
            "state_number_in_use":
                $("Sorry, invalid option."),
            "state_change_recipient":
                $("Sorry, invalid option."),

            "state_optout_reason":
                $("Sorry, invalid option."),
            "state_loss_subscription":
                $("Sorry, invalid option."),
            "state_last_period_month":
                $("Sorry, invalid date."),
            "state_last_period_day":
                $("Sorry, invalid number."),
            "state_cellphone_or_search":
                $("Sorry, invalid option."),
            "state_vht_cellphone_number":
                $("Sorry, invalid number."),
            "state_check_vht_exists":
                $("Sorry, invalid option."),
            "state_parish_search":
                $("Sorry, invalid name."),
            "state_select_parish":
                $("Sorry, invalid option."),
            "state_no_parish_results":
                $("Sorry, invalid option."),
            "state_retry_parish_search":
                $("Sorry, invalid name."),
        };


    // TIMEOUT HANDLING

        // override normal state adding
        self.add = function(name, creator) {
            self.states.add(name, function(name, opts) {
                var pass_opts = opts || {};
                pass_opts.name = name;

                if (go.utils.timed_out(self.im))
                {
                    if (go.utils.timeout_redirect(self.im)) {
                        return self.states.create('state_timed_out', pass_opts);
                    } else {
                        // Prevent previous content being passed to next state
                        self.im.msg.session_event = null;
                        // reset user answers
                        self.im.user.answers = {};

                        return self.states.create('state_start', pass_opts);
                    }

                }

                return creator(name, pass_opts);
            });
        };

        // timeout 01
        self.states.add('state_timed_out', function(name, creator_opts) {
            return new ChoiceState(name, {
                question: questions[name],
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
                        // reset user answers
                        self.im.user.answers = {};
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
                    if (user.details.role) {
                        self.im.user.set_answer('role', user.details.role);
                        self.im.user.set_answer('state_language', user.details.preferred_language);
                        if (user.details.role === 'mother') {
                            self.im.user.set_answer('mother_id', user.id);
                        } else {
                            self.im.user.set_answer('mother_id', user.details.mother_id);
                        }

                        return go.utils_project
                            .check_servicerating_status(user.id, self.im)
                            .then(function(status_data) {
                                if (status_data.results.length > 0) {
                                    self.im.user.set_answer('invite_uuid', status_data.results[0].id);
                                    return self.states.create('state_servicerating_question1');
                                }
                                else {
                                    return self.states.create('state_check_registered_user', {
                                        msisdn: go.utils.normalize_msisdn(self.im.user.addr, self.im.config.country_code)
                                    });
                                }
                            });
                    } else {
                        self.im.user.set_answer('role', 'guest');
                        return self.states.create('state_language');
                    }
                });
        });

        // ChoiceState st-D
        self.add('state_language', function(name) {
            return new ChoiceState(name, {
                question: questions[name],
                choices: [
                    new Choice('eng_UG', $('English')),
                    new Choice('cgg_UG', $('Rukiga')),
                ],
                error: errors[name],
                next: 'state_choose_number'
            });
        });

        // ChoiceState st-C
        self.add('state_choose_number', function(name) {
            return new ChoiceState(name, {
                question: questions[name].context({'msisdn': self.im.user.addr}),
                choices: [
                    new Choice('this_number', $("Register this number to receive SMSs about you & your baby")),
                    new Choice('other_number', $("Manage a different phone number"))
                ],
                error: errors[name],
                next: function(choice) {
                    if (choice.value === 'this_number') {
                        self.im.user.set_answer('contact_id', self.im.user.answers.user_id);
                        self.im.user.set_answer('contact_msisdn', go.utils
                            .normalize_msisdn(self.im.user.addr, self.im.config.country_code));
                        return self.im.user.answers.role === 'guest'
                            ? 'state_save_identities'
                            : 'state_change_menu';
                    }
                    else if (choice.value === 'other_number') {
                        return 'state_manage_msisdn';
                    }
                }
            });
        });

        // FreeText st-B
        self.add('state_manage_msisdn', function(name) {
            return new FreeText(name, {
                question: questions[name],
                check: function(content) {
                    if (go.utils.is_valid_msisdn(content)) {
                        return null;  // vumi expects null or undefined if check passes
                    } else {
                        return errors[name];
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
                    if (contact.details.role) {
                        self.im.user.set_answer('role', contact.details.role);
                        self.im.user.set_answer('contact_id', contact.id);
                        self.im.user.set_answer('contact_msisdn', go.utils
                            .normalize_msisdn(opts.msisdn, self.im.config.country_code));
                        if (contact.details.role === 'mother') {
                            self.im.user.set_answer('mother_id', contact.id);
                        } else {
                            self.im.user.set_answer('mother_id', contact.details.mother_id);
                        }
                        return self.states.create('state_change_menu');
                    } else {
                        self.im.user.set_answer('contact_id', contact.id);
                        return self.states.create('state_save_identities');
                    }
                });
        });

        // ChoiceState st-A1
        self.add('state_change_menu', function(name) {
            return new ChoiceState(name, {
                question: questions[name],
                error: errors[name],
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
                .check_postbirth_subscription(self.im, self.im.user.answers.mother_id)
                .then(function(has_postbirth_sub) {
                    if (has_postbirth_sub) {
                        return self.states.create('state_already_baby');
                    } else {
                        return self.states.create('state_change_baby');
                    }
                });
        });

        // ChoiceState st-01
        self.add('state_already_baby', function(name) {
            return new ChoiceState(name, {
                question: questions[name],
                choices: [
                    new Choice('state_change_menu', $("Back to main menu")),
                    new Choice('state_end_general', $("Exit"))
                ],
                error: errors[name],
                next: function(choice) {
                    return choice.value;
                }
            });
        });

        self.add('state_change_baby', function(name) {
            return go.utils_project
                .switch_to_baby(self.im, self.im.user.answers.mother_id)
                .then(function() {
                    return self.states.create('state_end_baby');
                });
        });

        // EndState st-02
        self.add('state_end_baby', function(name) {
            return new EndState(name, {
                text: questions[name],
                next: 'state_start'
            });
        });

        // EndState st-18
        self.add('state_end_general', function(name) {
            return new EndState(name, {
                text: questions[name],
                next: 'state_start'
            });
        });

        // Change message language
        // ChoiceState st-03
        self.add('state_change_language', function(name) {
            return new ChoiceState(name, {
                question: questions[name],
                choices: [
                    new Choice('eng_UG', $('English')),
                    new Choice('cgg_UG', $('Rukiga')),
                ],
                error: errors[name],
                next: 'state_switch_language'
            });
        });

        self.add('state_switch_language', function(name) {
            return go.utils_project
                .change_language(
                    self.im,
                    self.im.user.answers.state_change_language,
                    self.im.user.answers.mother_id
                )
                .then(function() {
                    return self.states.create('state_end_language');
                });
        });

        // EndState st-04
        self.add('state_end_language', function(name) {
            return new EndState(name, {
                text: questions[name],
                next: 'state_start'
            });
        });

        // Change number
        // FreeText st-05
        self.add('state_change_number', function(name) {
            return new FreeText(name, {
                question: questions[name],
                check: function(content) {
                    if (go.utils.is_valid_msisdn(content)) {
                        return null;  // vumi expects null or undefined if check passes
                    } else {
                        return errors[name];
                    }
                },
                next: function(content) {
                    var msisdn = go.utils.normalize_msisdn(
                        content, self.im.config.country_code);
                    return go.utils
                        .get_identity_by_address({'msisdn': msisdn}, self.im)
                        .then(function(identity) {
                            if (identity && identity.details && identity.details.role) {
                                return 'state_number_in_use';
                            } else {
                                return {
                                    'name': 'state_update_number',
                                    'creator_opts': {'new_msisdn': msisdn}
                                };
                            }
                        });
                }
            });
        });

        // ChoiceState
        self.add('state_number_in_use', function(name) {
            return new ChoiceState(name, {
                question: questions[name],
                error: errors[name],
                choices: [
                    new Choice('state_change_number', $("Try a different number")),
                    new Choice('state_end_general', $("Exit"))
                ],
                next: function(choice) {
                    return choice.value;
                }
            });
        });

        // Interstitial
        self.add('state_update_number', function(name, creator_opts) {
            return go.utils
                .get_identity(self.im.user.answers.contact_id, self.im)
                .then(function(contact) {
                    contact.details.addresses.msisdn = {};
                    contact.details.addresses.msisdn[creator_opts.new_msisdn] = {};
                    return go.utils
                        .update_identity(self.im, contact)
                        .then(function() {
                            return self.states.create('state_change_recipient');
                        });
                });
        });

        // ChoiceState st-06
        self.add('state_change_recipient', function(name) {
            return new ChoiceState(name, {
                question: questions[name],
                choices: [
                    new Choice('head_of_household', $("Head of the Household")),
                    new Choice('mother_to_be', $("Mother to be")),
                    new Choice('family_member', $("Family member")),
                    new Choice('trusted_friend', $("Trusted friend"))
                ],
                error: errors[name],
                next: 'state_end_recipient'
            });
        });

        // EndState st-07
        self.add('state_end_recipient', function(name) {
            return new EndState(name, {
                text: questions[name],
                next: 'state_start'
            });
        });

        // Optout
        // ChoiceState st-08
        self.add('state_optout_reason', function(name) {
            var loss_reasons = ['miscarriage', 'stillborn', 'baby_death'];
            return new ChoiceState(name, {
                question: questions[name],
                choices: [
                    new Choice('miscarriage', $("Mother miscarried")),
                    new Choice('stillborn', $("Baby stillborn")),
                    new Choice('baby_death', $("Baby passed away")),
                    new Choice('not_useful', $("Messages not useful")),
                    new Choice('other', $("Other"))
                ],
                error: errors[name],
                next: function(choice) {
                    return loss_reasons.indexOf(choice.value) !== -1
                        ? 'state_loss_subscription'
                        : 'state_optout';
                }
            });
        });

        // ChoiceState st-09
        self.add('state_loss_subscription', function(name) {
            return new ChoiceState(name, {
                question: questions[name],
                choices: [
                    new Choice('state_switch_loss', $("Yes")),
                    new Choice('state_optout', $("No"))
                ],
                error: errors[name],
                next: function(choice) {
                    return choice.value;
                }
            });
        });

        self.add('state_switch_loss', function(name) {
            return go.utils_project
                .switch_to_loss(self.im, self.im.user.answers.mother_id,
                                self.im.user.answers.state_optout_reason)
                .then(function() {
                    return self.states.create('state_end_loss_subscription');
                });
        });

        // EndState st-10
        self.add('state_end_loss_subscription', function(name) {
            return new EndState(name, {
                text: questions[name],
                next: 'state_start'
            });
        });

        self.add('state_optout', function(name) {
            return Q
                .all([
                    go.utils_project.optout_contact(self.im, 'ussd_public'),
                    go.utils_project.unsubscribe_mother(
                        self.im,
                        self.im.user.answers.mother_id,
                        self.im.user.answers.state_optout_reason)
                ])
                .then(function() {
                    return self.states.create('state_end_optout');
                });
        });

        // EndState st-11
        self.add('state_end_optout', function(name) {
            return new EndState(name, {
                text: questions[name],
                next: 'state_start'
            });
        });

    // REGISTRATION STATES
        // Get or create identities and save their IDs
        self.add('state_save_identities', function(name) {
            self.im.user.set_answer('receiver_id', self.im.user.answers.contact_id);
            self.im.user.set_answer('state_msg_receiver', 'mother_to_be');
            return go.utils_project
                .save_identities(
                    self.im,
                    self.im.user.answers.state_msg_receiver,
                    self.im.user.answers.receiver_id,
                    null
                )
                .then(function() {
                    return self.states.create('state_last_period_month');
                });
        });

        // ChoiceState reg-02
        self.add('state_last_period_month', function(name) {
            var today = go.utils.get_today(self.im.config);
            return new ChoiceState(name, {
                question: questions[name],
                choices: go.utils.make_month_choices($, today, 9, -1, "MMYYYY", "MMM YY"),
                error: errors[name],
                next: 'state_last_period_day'
            });
        });

        // FreeText reg-03
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
                    return 'state_get_health_id';
                }
            });
        });

        self.add('state_get_health_id', function(name) {
            return go.utils
                .get_identity(self.im.user.answers.mother_id, self.im)
                .then(function(identity) {
                    if (identity.details.health_id) {
                        self.im.user.set_answer('health_id', identity.details.health_id);
                    } else {
                        self.im.user.set_answer('health_id', 'no_health_id_found');
                    }
                    return self.states.create('state_cellphone_or_search');
                });
        });

        // ChoiceState reg-04
        self.add('state_cellphone_or_search', function(name) {
            return new MenuState(name, {
                question: questions[name],
                choices: [
                    new Choice('state_vht_cellphone_number', $("Yes")),
                    new Choice('state_parish_search', $("No"))
                ]
            });
        });

        // FreeText reg-05
        self.add('state_parish_search', function(name) {
            return new FreeText(name, {
                question: questions[name],
                next: 'state_select_parish'
            });
        });

        // ChoiceState reg-06
        self.add('state_select_parish', function(name) {
            return go.utils_project
                .parish_search(self.im.user.answers.state_parish_search, self.im)
                .then(function(parishes) {
                    if (parishes.length === 0) {
                        return self.states.create('state_no_parish_results');
                    }
                    return new go.utils_project.ParishPaginatedChoiceState(name, {
                        question: questions[name].context({search: self.im.user.answers.state_parish_search}),
                        choices: parishes.map(function(p) { return new Choice(p.name, p.name); }),
                        error: errors[name],
                        back: $("Back"),
                        more: $("More"),
                        retry: $("Try again"),
                        exit: $("Exit"),
                        options_per_page: 4,
                        next: function(choice) {
                            switch (choice.value) {
                                case '__retry__':
                                    return 'state_retry_parish_search';
                                case '__exit__':
                                    return 'state_finish_registration';
                                default:
                                    self.im.user.set_answer('parish', choice.label);
                                    return 'state_finish_registration';
                            }
                        }
                    });
                });
        });

        // Freetext reg-08
        self.add('state_retry_parish_search', function(name) {
            return new FreeText(name, {
                question: questions[name],
                next: function(text) {
                    self.im.user.set_answer('state_parish_search', text);
                    return 'state_select_parish';
                }
            });
        });

        // ChoiceState reg-09
        self.add('state_no_parish_results', function(name) {
            return new MenuState(name, {
                question: questions[name],
                choices: [
                    new Choice('state_retry_parish_search', $("Try again")),
                    new Choice('state_finish_registration', $("Exit"))
                ]
            });
        });

        // FreeText reg-10
        self.add('state_vht_cellphone_number', function(name) {
            return new FreeText(name, {
                question: questions[name],
                next: 'state_check_vht_exists'
            });
        });

        // ChoiceState reg-11
        self.add('state_check_vht_exists', function(name) {
            var number = go.utils.normalize_msisdn(
                self.im.user.answers.state_vht_cellphone_number, self.im.config.country_code);
            return go.utils.get_identity_by_address({'msisdn': number}, self.im).then(function(identity) {
                if (
                        identity === null || identity.details === undefined ||
                        identity.details.parish === undefined || identity.details.personnel_code === undefined) {
                    return new MenuState(name, {
                        question: questions[name],
                        choices: [
                            new Choice('state_vht_cellphone_number', $("Try again")),
                            new Choice('state_parish_search', $("Enter your location instead"))
                        ]
                    });
                } else {
                    self.im.user.set_answer('vht_id', identity.id);
                    self.im.user.set_answer('parish', identity.details.parish);
                    return self.states.create('state_finish_registration');
                }
            });
        });


        // Delegation state to finish registration
        self.add('state_finish_registration', function(name) {
            return go.utils_project
                .finish_public_registration(self.im)
                .then(function() {
                    return self.states.create('state_end_thank_you');
                });
        });

        // EndState reg-07
        self.add('state_end_thank_you', function(name) {
            var text =
                self.im.user.answers.health_id === 'no_health_id_found'
                ? $("Thank you. Your FamilyConnect ID will be sent to you in an SMS shortly.")
                : questions[name].context({health_id: self.im.user.answers.health_id});
            return new EndState(name, {
                text: text,
                next: 'state_start'
            });
        });

    // SERVICERATING STATES

        // ChoiceState 1
        self.add('state_servicerating_question1', function(name) {
            var q_id = 1;
            var q_text_en = $("Welcome. When you signed up, were staff at the facility friendly & helpful?");

            return new ChoiceState(name, {
                question: q_text_en,
                choices: [
                    new Choice('very-satisfied', $('Very Satisfied')),
                    new Choice('satisfied', $('Satisfied')),
                    new Choice('not-satisfied', $('Not Satisfied')),
                    new Choice('very-unsatisfied', $('Very unsatisfied'))
                ],
                next: function(choice) {
                    return go.utils_project
                        .post_servicerating_feedback(self.im, q_id, q_text_en.args[0], choice.label, choice.value, 1, self.im.user.answers.invite_uuid)
                        .then(function() {
                            return 'state_servicerating_question2';
                        });
                }
            });
        });

        // ChoiceState 2
        self.add('state_servicerating_question2', function(name) {
            var q_id = 2;
            var q_text_en = $("How do you feel about the time you had to wait at the facility?");

            return new ChoiceState(name, {
                question: q_text_en,
                choices: [
                    new Choice('very-satisfied', $('Very Satisfied')),
                    new Choice('satisfied', $('Satisfied')),
                    new Choice('not-satisfied', $('Not Satisfied')),
                    new Choice('very-unsatisfied', $('Very unsatisfied'))
                ],
                next: function(choice) {
                    return go.utils_project
                        .post_servicerating_feedback(self.im, q_id, q_text_en.args[0], choice.label, choice.value, 1, self.im.user.answers.invite_uuid)
                        .then(function() {
                            return 'state_servicerating_question3';
                        });
                }
            });
        });

        // ChoiceState 3
        self.add('state_servicerating_question3', function(name) {
            var q_id = 3;
            var q_text_en = $("How long did you wait to be helped at the clinic?");

            return new ChoiceState(name, {
                question: q_text_en,
                choices: [
                    new Choice('less-than-an-hour', $('Less than an hour')),
                    new Choice('between-1-and-3-hours', $('Between 1 and 3 hours')),
                    new Choice('more-than-4-hours', $('More than 4 hours')),
                    new Choice('all-day', $('All day'))
                ],
                next: function(choice) {
                    return go.utils_project
                        .post_servicerating_feedback(self.im, q_id, q_text_en.args[0], choice.label, choice.value, 1, self.im.user.answers.invite_uuid)
                        .then(function() {
                            return 'state_servicerating_question4';
                        });
                }
            });
        });

        // ChoiceState 4
        self.add('state_servicerating_question4', function(name) {
            var q_id = 4;
            var q_text_en = $("Was the facility clean?");

            return new ChoiceState(name, {
                question: q_text_en,
                choices: [
                    new Choice('very-satisfied', $('Very Satisfied')),
                    new Choice('satisfied', $('Satisfied')),
                    new Choice('not-satisfied', $('Not Satisfied')),
                    new Choice('very-unsatisfied', $('Very unsatisfied'))
                ],
                next: function(choice) {
                    return go.utils_project
                        .post_servicerating_feedback(self.im, q_id, q_text_en.args[0], choice.label, choice.value, 1, self.im.user.answers.invite_uuid)
                        .then(function() {
                            return 'state_servicerating_question5';
                        });
                }
            });
        });

        // ChoiceState 5
        self.add('state_servicerating_question5', function(name) {
            var q_id = 5;
            var q_text_en = $("Did you feel that your privacy was respected by the staff?");

            return new ChoiceState(name, {
                question: q_text_en,
                choices: [
                    new Choice('very-satisfied', $('Very Satisfied')),
                    new Choice('satisfied', $('Satisfied')),
                    new Choice('not-satisfied', $('Not Satisfied')),
                    new Choice('very-unsatisfied', $('Very unsatisfied'))
                ],
                next: function(choice) {
                    return go.utils_project
                        .post_servicerating_feedback(self.im, q_id, q_text_en.args[0], choice.label, choice.value, 1, self.im.user.answers.invite_uuid)
                        .then(function() {
                            return 'state_set_servicerating_completed';
                        });
                }
            });
        });

        // Interstitial
        self.add('state_set_servicerating_completed', function(name) {
            return go.utils_project
                .set_servicerating_status_completed(self.im)
                .then(function(response) {
                    return self.states.create('state_end_servicerating');
                });
        });

        // EndState 6
        self.add('state_end_servicerating', function(name) {
            // sets service rating status as completed
            return new EndState(name, {
                text: $("Thank you for rating the FamilyConnect service."),
                next: 'state_start'
            });
        });

    });

    return {
        GoFC: GoFC
    };
}();

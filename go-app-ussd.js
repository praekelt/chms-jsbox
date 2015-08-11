// WARNING: This is a generated file.
//          If you edit it you will be sad.
//          Edit src/app.js instead.

var go = {};
go;

/*jshint -W083 */
var Q = require('q');
var moment = require('moment');
var vumigo = require('vumigo_v02');
var Choice = vumigo.states.Choice;
var JsonApi = vumigo.http.api.JsonApi;


// Shared utils lib
go.utils = {

    timed_out: function(im) {
        var no_redirects = [
            'state_start',
            'state_end_thank_you',
            'state_end_thank_translate'
        ];
        return im.msg.session_event === 'new'
            && im.user.state.name
            && no_redirects.indexOf(im.user.state.name) === -1;
    },

    validate_personnel_code: function(im, content) {
        return Q()
            .then(function(q_response) {
                return content === '12345';
            });
    },

    check_valid_number: function(input) {
        // an attempt to solve the insanity of JavaScript numbers
        var numbers_only = new RegExp('^\\d+$');
        return input !== '' && numbers_only.test(input) && !Number.isNaN(Number(input));
    },

    is_valid_msisdn: function(input) {
        // check that it is a number, starts with 0, and has at least 10 digits
        return go.utils.check_valid_number(input) && input[0] === '0' && input.length >= 10;
    },

    check_valid_alpha: function(input) {
        var alpha_only = new RegExp('^[A-Za-z]+$');
        return input !== '' && alpha_only.test(input);
    },

    is_valid_name: function(input) {
        // check that all chars are alphabetical
        return go.utils.check_valid_alpha(input);
    },

    is_valid_day_of_month: function(input) {
        // check that it is a number and between 1 and 31
        return go.utils.check_valid_number(input)
            && parseInt(input, 10) >= 1
            && parseInt(input, 10) <= 31;
    },

    is_valid_year: function(input) {
        // check that it is a number and has four digits
        return input.length === 4 && go.utils.check_valid_number(input);
    },

    get_today: function(config) {
        var today;
        if (config.testing_today) {
            today = new moment(config.testing_today);
        } else {
            today = new moment();
        }
        return today;
    },

    make_month_choices: function($, start, limit, increment) {
        var choices = [
            new Choice('072015', $('July 15')),
            new Choice('062015', $('June 15')),
            new Choice('052015', $('May 15')),
            new Choice('042015', $('Apr 15')),
            new Choice('032015', $('Mar 15')),
            new Choice('022015', $('Feb 15')),
            new Choice('012015', $('Jan 15')),
            new Choice('122014', $('Dec 14')),
            new Choice('112014', $('Nov 14')),
        ];
        return choices;
    },

    track_redials: function(contact, im, decision) {
        var status = contact.extra.status || 'unregistered';
        return Q.all([
            im.metrics.fire.inc(['total', 'redials', 'choice_made', 'last'].join('.')),
            im.metrics.fire.sum(['total', 'redials', 'choice_made', 'sum'].join('.'), 1),
            im.metrics.fire.inc(['total', 'redials', status, 'last'].join('.')),
            im.metrics.fire.sum(['total', 'redials', status, 'sum'].join('.'), 1),
            im.metrics.fire.inc(['total', 'redials', decision, 'last'].join('.')),
            im.metrics.fire.sum(['total', 'redials', decision, 'sum'].join('.'), 1),
            im.metrics.fire.inc(['total', 'redials', status, decision, 'last'].join('.')),
            im.metrics.fire.sum(['total', 'redials', status, decision, 'sum'].join('.'), 1),
        ]);
    },

    get_clean_first_word: function(user_message) {
        return user_message
            .split(" ")[0]          // split off first word
            .replace(/\W/g, '')     // remove non letters
            .toUpperCase();         // capitalise
    },

    control_api_call: function (method, params, payload, endpoint, im) {
        var http = new JsonApi(im, {
            headers: {
                'Authorization': ['Token ' + im.config.control.api_key]
            }
        });
        switch (method) {
            case "post":
                return http.post(im.config.control.url + endpoint, {
                    data: payload
                });
            case "get":
                return http.get(im.config.control.url + endpoint, {
                    params: params
                });
            case "patch":
                return http.patch(im.config.control.url + endpoint, {
                    data: payload
                });
            case "put":
                return http.put(im.config.control.url + endpoint, {
                    params: params,
                  data: payload
                });
            case "delete":
                return http.delete(im.config.control.url + endpoint);
            }
    },

    subscription_unsubscribe_all: function(contact, im) {
        var params = {
            to_addr: contact.msisdn
        };
        return go.utils
        .control_api_call("get", params, null, 'subscription/', im)
        .then(function(json_result) {
            // make all subscriptions inactive
            var subscriptions = json_result.data;
            var clean = true;  // clean tracks if api call is unnecessary
            var patch_calls = [];
            for (i=0; i<subscriptions.length; i++) {
                if (subscriptions[i].active === true) {
                    var updated_subscription = subscriptions[i];
                    var endpoint = 'subscription/' + updated_subscription.id + '/';
                    updated_subscription.active = false;
                    // store the patch calls to be made
                    patch_calls.push(function() {
                        return go.utils.control_api_call("patch", {}, updated_subscription, endpoint, im);
                    });
                    clean = false;
                }
            }
            if (!clean) {
                return Q
                .all(patch_calls.map(Q.try))
                .then(function(results) {
                    var unsubscribe_successes = 0;
                    var unsubscribe_failures = 0;
                    for (var index in results) {
                        (results[index].code >= 200 && results[index].code < 300)
                            ? unsubscribe_successes += 1
                            : unsubscribe_failures += 1;
                    }

                    if (unsubscribe_successes > 0 && unsubscribe_failures > 0) {
                        return Q.all([
                            im.metrics.fire.inc(["total", "subscription_unsubscribe_success", "last"].join('.'), {amount: unsubscribe_successes}),
                            im.metrics.fire.sum(["total", "subscription_unsubscribe_success", "sum"].join('.'), unsubscribe_successes),
                            im.metrics.fire.inc(["total", "subscription_unsubscribe_fail", "last"].join('.'), {amount: unsubscribe_failures}),
                            im.metrics.fire.sum(["total", "subscription_unsubscribe_fail", "sum"].join('.'), unsubscribe_failures)
                        ]);
                    } else if (unsubscribe_successes > 0) {
                        return Q.all([
                            im.metrics.fire.inc(["total", "subscription_unsubscribe_success", "last"].join('.'), {amount: unsubscribe_successes}),
                            im.metrics.fire.sum(["total", "subscription_unsubscribe_success", "sum"].join('.'), unsubscribe_successes)
                        ]);
                    } else if (unsubscribe_failures > 0) {
                        return Q.all([
                            im.metrics.fire.inc(["total", "subscription_unsubscribe_fail", "last"].join('.'), {amount: unsubscribe_failures}),
                            im.metrics.fire.sum(["total", "subscription_unsubscribe_fail", "sum"].join('.'), unsubscribe_failures)
                        ]);
                    } else {
                        return Q();
                    }
                });
            } else {
                return Q();
            }
        });
    },

    opt_out: function(im, contact) {
        contact.extra.optout_last_attempt = go.utils.get_today(im.config)
            .format('YYYY-MM-DD hh:mm:ss.SSS');

        return Q.all([
            im.contacts.save(contact),
            go.utils.subscription_unsubscribe_all(contact, im),
            im.api_request('optout.optout', {
                address_type: "msisdn",
                address_value: contact.msisdn,
                message_id: im.msg.message_id
            })
        ]);
    },

    opt_in: function(im, contact) {
        contact.extra.optin_last_attempt = go.utils.get_today(im.config)
            .format('YYYY-MM-DD hh:mm:ss.SSS');
        return Q.all([
            im.contacts.save(contact),
            im.api_request('optout.cancel_optout', {
                address_type: "msisdn",
                address_value: contact.msisdn
            }),
        ]);
    },

    "commas": "commas"
};

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
                return self.states.create('state_msg_receiver');
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
                next: 'state_last_period_month'
            });
        });

        // ChoiceState state_last_period_month
        self.add('state_last_period_month', function(name) {
            var today = go.utils.get_today(self.im.config);
            var start_month = today.month();
            var question = $("Please select the month when the woman had her last period:");
            var error = $("That is an invalid month. Please select the month when the woman had her last period:");
            return new ChoiceState(name, {
                question: question,
                choices: go.utils.make_month_choices($, start_month, 9, -1),
                error: error,
                next: 'state_last_period_day'
            });
        });

        // FreeText state_last_period_day
        self.add('state_last_period_day', function(name) {
            var question = $("What day did her last period start on? (For example, 12)");
            var error = $("That number is not valid. Please enter the day her last period started on. For example, 12");
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
            var question = $("What kind of identification does the pregnant woman have?");
            var error = $("That is an invalid selection. Please select what identification the woman has:");
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
            var question = $("Please enter her National Identity Number (NIN).");
            return new FreeText(name, {
                question: question,
                next: 'state_msg_language'
            });
        });

        // FreeText state_mother_birth_day
        self.add('state_mother_birth_day', function(name) {
            var question = $("Please enter the day the she was born. For example, 12.");
            var error = $("That number is invalid. Please enter the day the she was born. For example, 12");
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
                question: $("Please select the month of year the Mother was born:"),
                error: $("That is an invalid month. Please select the month of year the Mother was born."),
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
            var question = $("Please enter the year the mother was born. For example, 1986.");
            var error = $("That number is invalid. Please enter the year the mother was born.");
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
            var question = $("Which language would they want to receive messages in?");
            var error = $("That is an invalid language. Please select the language they want to receive messages in.");
            return new ChoiceState(name, {
                question: question,
                error: error,
                choices: [
                    new Choice('english', $('English')),
                    new Choice('runyankore', $('Runyankore')),
                    new Choice('lusoga', $('Lusoga'))
                ],
                next: function(choice) {
                    return choice.value === 'english'
                        ? 'state_end_thank_you'
                        : 'state_end_thank_translate';
                }
            });
        });

        // EndState state_end_thank_you
        self.add('state_end_thank_you', function(name) {
            return new EndState(name, {
                text: $("Thank you. The pregnant woman will now receive messages."),
                next: 'state_start'
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

go.init = function() {
    var vumigo = require('vumigo_v02');
    var InteractionMachine = vumigo.InteractionMachine;
    var GoFC = go.app.GoFC;

    return {
        im: new InteractionMachine(api, new GoFC())
    };
}();

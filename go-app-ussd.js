// WARNING: This is a generated file.
//          If you edit it you will be sad.
//          Edit src/app.js instead.

var go = {};
go;

/*jshint -W083 */
var Q = require('q');
var moment = require('moment');
var vumigo = require('vumigo_v02');
var JsonApi = vumigo.http.api.JsonApi;

// Shared utils lib
go.utils = {

    timed_out: function(im) {
        var no_redirects = [
            'state_start'
        ];
        return im.msg.session_event === 'new'
            && im.user.state.name
            && no_redirects.indexOf(im.user.state.name) === -1;
    },

    validate_personnel_code: function(im, content) {
        return Q()
            .then(function() {
                return true;
            });
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
        contact.extra.optout_last_attempt = go.utils.get_today(im.config);

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
        contact.extra.optin_last_attempt = go.utils.get_today(im.config);
        return Q.all([
            im.contacts.save(contact),
            im.api_request('optout.cancel_optout', {
                address_type: "msisdn",
                address_value: contact.msisdn
            }),
        ]);
    },

    get_today: function(config) {
        var today;
        if (config.testing_today) {
            today = new moment(config.testing_today);
        } else {
            today = new moment();
        }
        return today.format('YYYY-MM-DD hh:mm:ss.SSS');
    },

    "commas": "commas"
};

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

        self.add('state_auth_code', function(name) {
            var question = $("Welcome to FamilyConnect. Please enter your 5 digit personnel code.");
            var error = $("That code is not recognised. Please enter your 5 digit personnel code.");
            return new FreeText(name, {
                question: question,
                check: function(content) {
                    return go.utils
                        .validate_personnel_code(self.im, content)
                        .then(function(valid_clinic_code) {
                            if (!valid_clinic_code) {
                                return error;
                            } else {
                                return null;  // vumi expects null or undefined if check passes
                            }
                        });
                },
                next: 'state_end_thank_you'
            });
        });

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

go.init = function() {
    var vumigo = require('vumigo_v02');
    var InteractionMachine = vumigo.InteractionMachine;
    var GoFC = go.app.GoFC;

    return {
        im: new InteractionMachine(api, new GoFC())
    };
}();

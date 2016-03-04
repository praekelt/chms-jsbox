/*jshint -W083 */
var Q = require('q');
// var moment = require('moment');
var vumigo = require('vumigo_v02');
var Choice = vumigo.states.Choice;


// Project utils libraty
go.utils_project = {

// TIMEOUT HELPERS

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


// IDENTITY HELPERS

    find_healthworker_with_personnel_code: function(im, personnel_code) {
        var params = {
            "details__personnel_code": personnel_code
        };
        return go.utils
            .service_api_call('identities', 'get', params, null, 'identities/search/', im)
            .then(function(json_get_response) {
                var healthworkers_found = json_get_response.data.results;
                // Return the first healthworker if found
                return healthworkers_found[0];
            });
    },


// TEMPORARY

    check_contact_recognised: function(msisdn) {
        return Q()
            .then(function(q_response) {
                return msisdn === '082222' || msisdn === '082333';
            });
    },

    check_is_registered: function(msisdn) {
        return Q()
            .then(function(q_response) {
                return msisdn === '082222' || msisdn === '082333';
            });
    },

    check_baby_subscription: function(msisdn) {
        return Q()
            .then(function(q_response) {
                return msisdn === '082333';
            });
    },

    make_month_choices: function($, startDate, limit, increment, valueFormat, labelFormat) {
        var choices = [];

        var monthIterator = startDate;
        for (var i=0; i<limit; i++) {
            choices.push(new Choice(monthIterator.format(valueFormat),
                                    $(monthIterator.format(labelFormat))));
            monthIterator.add(increment, 'months');
        }

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

    get_active_subscriptions_by_identity_id: function(identity_id, im) {
        // returns all active subscriptions - for unlikely case where there
        // is more than one active subscription
        var params = {
            contact: identity_id,
            active: "True"
        };

        return go.utils
            .service_api_call("subscriptions", "get", params, null, "subscriptions/", im)
            .then(function(json_get_response) {
                return json_get_response.data.results;
            });
    },

    get_active_subscription_by_identity_id: function(identity_id, im) {
        // returns first active subscription found
        return go.utils_project
            .get_active_subscriptions_by_identity_id(identity_id, im)
            .then(function(subscriptions) {
                return subscriptions[0];
            });
    },

    has_active_subscriptions: function(identity_id, im) {
        return go.utils_project
            .get_active_subscriptions_by_identity_id(identity_id, im)
            .then(function(subscriptions) {
                return subscriptions.length > 0;
            });
    },

    subscription_unsubscribe_all: function(contact, im) {
        var params = {
            'details__addresses__msisdn': contact.msisdn
        };
        return go.utils
        .service_api_call("identities", "get", params, null, 'subscription/', im)
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
                        return go.utils.service_api_call("identities", "patch", {}, updated_subscription, endpoint, im);
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
            go.utils_project.subscription_unsubscribe_all(contact, im),
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

    // IDENTITY HANDLING

    get_identity_by_address: function(address, im) {
        // Searches the Identity Store for all identities with the provided address.
        // Returns the first identity object found
        // Address should be an object {address_type: address}, eg.
        // {'msisdn': '0821234444'}, {'email': 'me@example.com'}
        var address_type = Object.keys(address)[0];
        var address_val = address[address_type];
        var params = {};
        var search_string = 'details__addresses__' + address_type;
        params[search_string] = address_val;

        return go.utils
            .service_api_call('identities', 'get', params, null, 'identities/search/', im)
            .then(function(json_get_response) {
                var identities_found = json_get_response.data.results;
                // Return the first identity in the list of identities
                return (identities_found.length > 0)
                    ? identities_found[0]
                    : null;
            });
    },

    // Create a new identity
    create_identity: function(im, address, communicate_through_id, operator_id) {
        var payload = {};

        // compile base payload
        if (address) {
            var address_type = Object.keys(address);
            var addresses = {};
            addresses[address_type] = {};
            addresses[address_type][address[address_type]] = {};
            payload.details = {
                "default_addr_type": "msisdn",
                "addresses": addresses
            };
        }

        if (communicate_through_id) {
            payload.communicate_through = communicate_through_id;
        }

        // add operator_id if available
        if (operator_id) {
            payload.operator = operator_id;
        }

        return go.utils
            .service_api_call("identities", "post", null, payload, 'identities/', im)
            .then(function(json_post_response) {
                var contact_created = json_post_response.data;
                // Return the contact
                return contact_created;
            });
    },

    // Gets a contact if it exists, otherwise creates a new one
    get_or_create_identity: function(address, im, operator_id) {
        if (address.msisdn) {
            address.msisdn = go.utils
                .normalize_msisdn(address.msisdn, im.config.country_code);
        }
        return go.utils_project
            // Get contact id using msisdn
            .get_identity_by_address(address, im)
            .then(function(contact) {
                if (contact !== null) {
                    // If contact exists, return the contact
                    return contact;
                } else {
                    // If contact doesn't exist, create it
                    return go.utils_project
                        .create_identity(im, address, null, operator_id)
                        .then(function(contact) {
                            return contact;
                        });
                }
            });
    },

    "commas": "commas"
};

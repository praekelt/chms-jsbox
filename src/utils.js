/*jshint -W083 */
var vumigo = require('vumigo_v02');
var moment = require('moment');
var Q = require('q');
var JsonApi = vumigo.http.api.JsonApi;
var Choice = vumigo.states.Choice;

// GENERIC UTILS
go.utils = {

// TIMEOUT HELPERS

    timed_out: function(im) {
        return im.msg.session_event === 'new'
            && im.user.state.name
            && im.config.no_timeout_redirects.indexOf(im.user.state.name) === -1;
    },


// SERVICE API CALL HELPERS

    service_api_call: function (service, method, params, payload, endpoint, im) {
        var http = new JsonApi(im, {
            headers: {
                'Authorization': ['Token ' + im.config.services[service].api_token]
            }
        });
        switch (method) {
            case "post":
                return http.post(im.config.services[service].url + endpoint, {
                    data: payload
                });
            case "get":
                return http.get(im.config.services[service].url + endpoint, {
                    params: params
                });
            case "patch":
                return http.patch(im.config.services[service].url + endpoint, {
                    data: payload
                });
            case "put":
                return http.put(im.config.services[service].url + endpoint, {
                    params: params,
                  data: payload
                });
            case "delete":
                return http.delete(im.config.services[service].url + endpoint);
            }
    },


// MSISDN HELPERS

    // Check that it's a number and starts with 0 and approximate length
    // TODO: refactor to take length, explicitly deal with '+'
    is_valid_msisdn: function(content) {
        return go.utils.check_valid_number(content)
            && content[0] === '0'
            && content.length >= 10
            && content.length <= 13;
    },

    normalize_msisdn: function(raw, country_code) {
        // don't touch shortcodes
        if (raw.length <= 5) {
            return raw;
        }
        // remove chars that are not numbers or +
        raw = raw.replace(/[^0-9+]/g);
        if (raw.substr(0,2) === '00') {
            return '+' + raw.substr(2);
        }
        if (raw.substr(0,1) === '0') {
            return '+' + country_code + raw.substr(1);
        }
        if (raw.substr(0,1) === '+') {
            return raw;
        }
        if (raw.substr(0, country_code.length) === country_code) {
            return '+' + raw;
        }
        return raw;
    },


// NUMBER HELPERS

    // An attempt to solve the insanity of JavaScript numbers
    check_valid_number: function(content) {
        var numbers_only = new RegExp('^\\d+$');
        return content !== ''
            && numbers_only.test(content)
            && !Number.isNaN(Number(content));
    },

    double_digit_number: function(input) {
        input_numeric = parseInt(input, 10);
        if (parseInt(input, 10) < 10) {
            return "0" + input_numeric.toString();
        } else {
            return input_numeric.toString();
        }
    },


// DATE HELPERS

    get_today: function(config) {
        if (config.testing_today) {
            return new moment(config.testing_today, 'YYYY-MM-DD');
        } else {
            return new moment();
        }
    },

    get_january: function(config) {
        // returns current year january 1st moment date
        return go.utils.get_today(config).startOf('year');
    },

    is_valid_date: function(date, format) {
        // implements strict validation with 'true' below
        return moment(date, format, true).isValid();
    },

    is_valid_year: function(input, min, max) {  // expecting string parameters
        // check that it is a number and has four digits
        // AND that the number is within the range determined by the min/max parameters
        return input.length === 4 && min.length === 4 && max.length === 4 &&
                go.utils.check_valid_number(input) &&
                parseInt(input, 10) >= parseInt(min, 10) &&
                parseInt(input, 10) <= parseInt(max, 10);
    },

    is_valid_day_of_month: function(input) {
        // check that it is a number and between 1 and 31
        return go.utils.check_valid_number(input)
            && parseInt(input, 10) >= 1
            && parseInt(input, 10) <= 31;
    },


// TEXT HELPERS

    check_valid_alpha: function(input) {
        // check that all chars are in standard alphabet
        var alpha_only = new RegExp('^[A-Za-z]+$');
        return input !== '' && alpha_only.test(input);
    },

    is_valid_name: function(input, min, max) {
        // check that the string does not include the characters listed in the
        // regex, and min <= input string length <= max
        var name_check = new RegExp(
            '(^[^±!@£$%^&*_+§¡€#¢§¶•ªº«\\/<>?:;|=.,123456789]{min,max}$)'
            .replace('min', min.toString())
            .replace('max', max.toString())
        );
        return input !== '' && name_check.test(input);
    },

    get_clean_first_word: function(user_message) {
        return user_message
            .split(" ")[0]          // split off first word
            .replace(/\W/g, '')     // remove non letters
            .toUpperCase();         // capitalise
    },


// CHOICE HELPERS

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


// REGISTRATION HELPERS

    create_registration: function(im, reg_info) {
        return go.utils
            .service_api_call("registrations", "post", null, reg_info, "registrations/", im)
            .then(function(result) {
                return result.id;
            });
    },


// IDENTITY HELPERS

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

    get_identity: function(identity_id, im) {
      // Gets the identity from the Identity Store
      // Returns the identity object

        var endpoint = 'identities/' + identity_id + '/';
        return go.utils
        .service_api_call('identities', 'get', {}, null, endpoint, im)
        .then(function(json_get_response) {
            return json_get_response.data;
        });
    },

    create_identity: function(im, address, communicate_through_id, operator_id) {
      // Create a new identity
      // Returns the identity object

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
                return json_post_response.data;
            });
    },

    get_or_create_identity: function(address, im, operator_id) {
      // Gets a identity if it exists, otherwise creates a new one

        if (address.msisdn) {
            address.msisdn = go.utils
                .normalize_msisdn(address.msisdn, im.config.country_code);
        }
        return go.utils
            // Get identity id using address
            .get_identity_by_address(address, im)
            .then(function(identity) {
                if (identity !== null) {
                    // If identity exists, return the id
                    return identity;
                } else {
                    // If identity doesn't exist, create it
                    return go.utils
                    .create_identity(im, address, null, operator_id)
                    .then(function(identity) {
                        return identity;
                    });
                }
        });
    },

    update_identity: function(im, identity) {
      // Update an identity by passing in the full updated identity object
      // Returns the id (which should be the same as the identity's id)

        var endpoint = 'identities/' + identity.id + '/';
        return go.utils
            .service_api_call('identities', 'patch', {}, identity, endpoint, im)
            .then(function(response) {
                return response.data.id;
            });
    },


// SUBSCRIPTION HELPERS

    get_active_subscriptions_by_identity_id: function(identity_id, im) {
      // Returns all active subscriptions - for unlikely case where there
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
      // Returns first active subscription found

        return go.utils
            .get_active_subscriptions_by_identity_id(identity_id, im)
            .then(function(subscriptions) {
                return subscriptions[0];
            });
    },

    has_active_subscriptions: function(identity_id, im) {
      // Returns whether an identity has an active subscription
      // Returns true / false

        return go.utils
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
                        return go.utils.service_api_call("identities", "patch",
                            {}, updated_subscription, endpoint, im);
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


// OPTOUT & OPTIN HELPERS

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

// WARNING: This is a generated file.
//          If you edit it you will be sad.
//          Edit src/app.js instead.

var go = {};
go;

/*jshint -W083 */
var vumigo = require('vumigo_v02');
var moment = require('moment');
var assert = require('assert');
var JsonApi = vumigo.http.api.JsonApi;
var Choice = vumigo.states.Choice;

// GENERIC UTILS
go.utils = {

// FIXTURES HELPERS

    check_fixtures_used: function(api, expected_used) {
        var fixts = api.http.fixtures.fixtures;
        var fixts_used = [];
        fixts.forEach(function(f, i) {
            f.uses > 0 ? fixts_used.push(i) : null;
        });
        assert.deepEqual(fixts_used, expected_used);
    },

// TIMEOUT HELPERS

    timed_out: function(im) {
        return im.msg.session_event === 'new'
            && im.user.state.name
            && im.config.no_timeout_redirects.indexOf(im.user.state.name) === -1;
    },

    timeout_redirect: function(im) {
        return im.config.timeout_redirects.indexOf(im.user.state.name) !== -1;
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
                    })
                    .then(go.utils.log_service_api_call(service, method, params, payload, endpoint, im));
            case "get":
                return http.get(im.config.services[service].url + endpoint, {
                        params: params
                    })
                    .then(go.utils.log_service_api_call(service, method, params, payload, endpoint, im));
            case "patch":
                return http.patch(im.config.services[service].url + endpoint, {
                        data: payload
                    })
                    .then(go.utils.log_service_api_call(service, method, params, payload, endpoint, im));
            case "put":
                return http.put(im.config.services[service].url + endpoint, {
                    params: params,
                    data: payload
                })
                .then(go.utils.log_service_api_call(service, method, params, payload, endpoint, im));
            case "delete":
                return http
                    .delete(im.config.services[service].url + endpoint)
                    .then(go.utils.log_service_api_call(service, method, params, payload, endpoint, im));
            }
    },

    log_service_api_call: function(service, method, params, payload, endpoint, im) {
        return function (response) {
            return im
                .log([
                    'Request: ' + method + ' ' + im.config.services[service].url + endpoint,
                    'Payload: ' + JSON.stringify(payload),
                    'Params: ' + JSON.stringify(params),
                    'Response: ' + JSON.stringify(response),
                ].join('\n'))
                .then(function () {
                    return response;
                });
        };
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

    is_valid_year: function(year, minYear, maxYear) {
        // expects string parameters
        // checks that the number is within the range determined by the
        // minYear & maxYear parameters
        return go.utils.check_valid_number(year)
            && parseInt(year, 10) >= parseInt(minYear, 10)
            && parseInt(year, 10) <= parseInt(maxYear, 10);
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
            '(^[^±!@£$%^&*_+§¡€#¢§¶•ªº«\\/<>?:;|=.,0123456789]{min,max}$)'
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
            .service_api_call("registrations", "post", null, reg_info, "registration/", im)
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

        return im
            .log('Getting identity for: ' + JSON.stringify(params))
            .then(function() {
                return go.utils
                    .service_api_call('identities', 'get', params, null, 'identities/search/', im)
                    .then(function(json_get_response) {
                        var identities_found = json_get_response.data.results;
                        // Return the first identity in the list of identities
                        return (identities_found.length > 0)
                        ? identities_found[0]
                        : null;
                    });
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

        var payload = {
            "details": {
                "default_addr_type": null,
                "addresses": {}
            }
        };
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
      // Removes potentially added fields that auto-complete and should not
      // be submitted
      // Returns the id (which should be the same as the identity's id)

        auto_fields = ["url", "created_at", "updated_at", "created_by", "updated_by", "user"];
        for (var i in auto_fields) {
            field = auto_fields[i];
            if (field in identity) {
                delete identity[field];
            }
        }

        var endpoint = 'identities/' + identity.id + '/';
        return go.utils
            .service_api_call('identities', 'patch', {}, identity, endpoint, im)
            .then(function(response) {
                return response.data.id;
            });
    },


// SUBSCRIPTION HELPERS

    get_subscription: function(im, subscription_id) {
      // Gets the subscription from the Stage-base Store
      // Returns the subscription object

        var endpoint = 'subscriptions/' + subscription_id + '/';
        return go.utils
            .service_api_call('subscriptions', 'get', {}, null, endpoint, im)
            .then(function(response) {
                return response.data;
            });
    },

    get_active_subscriptions_by_identity: function(im, identity_id) {
      // Searches the Stage-base Store for all active subscriptions with the provided identity_id
      // Returns the first subscription object found or null if none are found

        var params = {
            identity: identity_id,
            active: true
        };
        var endpoint = 'subscriptions/';
        return go.utils
            .service_api_call('subscriptions', 'get', params, null, endpoint, im)
            .then(function(response) {
                return response.data.results;
            });
    },

    get_active_subscription_by_identity: function(im, identity_id) {
      // Searches the Stage-base Store for all active subscriptions with the provided identity_id
      // Returns the first subscription object found or null if none are found

        return go.utils
            .get_active_subscriptions_by_identity(im, identity_id)
            .then(function(subscriptions_found) {
                return (subscriptions_found.length > 0)
                    ? subscriptions_found[0]
                    : null;
            });
    },

    has_active_subscription: function(identity_id, im) {
      // Returns whether an identity has an active subscription
      // Returns true / false

        return go.utils
            .get_active_subscriptions_by_identity(im, identity_id)
            .then(function(subscriptions) {
                return subscriptions.length > 0;
            });
    },

    update_subscription: function(im, subscription) {
      // Update a subscription by passing in the full updated subscription object
      // Returns the id (which should be the same as the subscription's id)

        var endpoint = 'subscriptions/' + subscription.id + '/';
        return go.utils
            .service_api_call('subscriptions', 'patch', {}, subscription, endpoint, im)
            .then(function(response) {
                return response.data.id;
            });
    },


// MESSAGESET HELPERS

    get_messageset: function(im, messageset_id) {
      // Gets the messageset from the Stage-base Store
      // Returns the messageset object

        var endpoint = 'messageset/' + messageset_id + '/';
        return go.utils
            .service_api_call('subscriptions', 'get', {}, null, endpoint, im)
            .then(function(response) {
                return response.data;
            });
    },


// MESSAGE_SENDER HELPERS

    save_inbound_message: function(im, from_addr, content) {
      // Saves the inbound messages to seed-message-sender

        var payload = {
            "message_id": im.config.testing_message_id || im.msg.message_id,
            "in_reply_to": null,
            "to_addr": im.config.channel,
            "from_addr": from_addr,
            "content": content,
            "transport_name": im.config.transport_name,
            "transport_type": im.config.transport_type,
            "helper_metadata": {}
        };
        return go.utils
            .service_api_call("message_sender", "post", null, payload, 'inbound/', im)
            .then(function(json_post_response) {
                var inbound_response = json_post_response.data;
                // Return the inbound id
                return inbound_response.id;
            });
    },


// OPTOUT & OPTIN HELPERS

    optout: function(im, identity_id, optout_reason, address_type, address,
                     request_source, requestor_source_id, optout_type, config) {
      // Posts an optout to the identity store optout endpoint

        var optout_info = {
            optout_type: optout_type || 'stop',  // default to 'stop'
            identity: identity_id,
            reason: optout_reason || 'unknown',  // default to 'unknown'
            address_type: address_type || 'msisdn',  // default to 'msisdn'
            address: address,
            request_source: request_source,
            requestor_source_id: requestor_source_id
        };
        return go.utils
            .service_api_call("identities", "post", null, optout_info, "optout/", im)
            .then(function(response) {
                return response;
            });
    },


"commas": "commas"
};

/*jshint -W083 */
var Q = require('q');


// Project utils libraty
go.utils_project = {


// SUBSCRIPTION HELPERS

    check_postbirth_subscription: function(im, mother_id) {
      // Look up if the mother is subscribed to postbirth messages
        return go.utils_project
            .get_subscription_messageset_through_identity(im, mother_id)
            .then(function(messageset) {
                if (messageset === 'no_active_subs_found') {
                    return 'no_active_subs_found';
                } else {
                    return messageset.short_name.indexOf('postbirth') > -1;
                }
            });
    },

    get_subscription_messageset_through_identity: function(im, mother_id) {
      // Return the messageset that an identity is subscribed to

        // get subscription
        return go.utils
            .get_active_subscription_by_identity(im, mother_id)
            .then(function(subscription) {
                if (subscription === null) {
                    return 'no_active_subs_found';
                } else {
                    // get messageset
                    return go.utils
                        .get_messageset(im, subscription.messageset)
                        .then(function(messageset) {
                            return messageset;
                        });
                    }
            });
    },


// REGISTRATION HELPERS

    compile_reg_info: function(im) {
        var reg_info = {
            stage: 'prebirth',
            mother_id: im.user.answers.mother_id,
            data: {
                hoh_id: im.user.answers.hoh_id,
                receiver_id: im.user.answers.receiver_id,
                operator_id: im.user.answers.operator_id,
                language: im.user.answers.state_msg_language,
                msg_type: "text",
                last_period_date: im.user.answers.last_period_date,
                msg_receiver: im.user.answers.state_msg_receiver,
                hoh_name: im.user.answers.state_household_head_name,
                hoh_surname: im.user.answers.state_household_head_surname,
                mama_name: im.user.answers.state_mother_name,
                mama_surname: im.user.answers.state_mother_surname,
                mama_id_type: im.user.answers.state_id_type
            }
        };

        if (im.user.answers.state_id_type === 'ugandan_id') {
            reg_info.data.mama_id_no = im.user.answers.state_nin;
        } else {
            reg_info.data.mama_dob = im.user.answers.mother_dob;
        }

        return reg_info;
    },

    compile_public_reg_info: function(im) {
        var reg_info = {
            stage: 'prebirth',
            mother_id: im.user.answers.mother_id,
            data: {
                hoh_id: im.user.answers.hoh_id,
                receiver_id: im.user.answers.receiver_id,
                operator_id: null,
                language: im.user.answers.state_language,
                msg_type: "text",
                last_period_date: im.user.answers.last_period_date,
                msg_receiver: im.user.answers.state_msg_receiver,
            }
        };

        return reg_info;
    },

    set_standard_mother_details: function(im, details) {
        details.msg_receiver = im.user.answers.state_msg_receiver;
        details.role = 'mother';
        details.hoh_id = im.user.answers.hoh_id;
        details.preferred_language = im.user.answers.state_msg_language;
        details.preferred_msg_type = 'text';  // omit?
        details.first_name = im.user.answers.state_mother_name;
        details.surname = im.user.answers.state_mother_surname;
        details.name = im.user.answers.state_mother_name + ' ' +
                       im.user.answers.state_mother_surname;
        details.id_type = im.user.answers.state_id_type;
        details.hiv_interest = im.user.answers.state_hiv_messages;

        if (im.user.answers.state_id_type === 'ugandan_id') {
            details.nin = im.user.answers.state_nin;
        } else {
            details.dob = im.user.answers.mother_dob;
        }

        return details;
    },

    set_public_mother_details: function(im, details) {
        details.msg_receiver = im.user.answers.state_msg_receiver;
        details.role = 'mother';
        details.hoh_id = im.user.answers.hoh_id;
        details.preferred_language = im.user.answers.state_msg_language;
        details.preferred_msg_type = 'text';  // omit?
        details.hiv_interest = im.user.answers.state_hiv_messages;

        return details;
    },

    set_standard_hoh_details: function(im, details) {
        details.role = 'head_of_household';
        details.mother_id = im.user.answers.mother_id;
        details.preferred_language = im.user.answers.state_msg_language;
        details.preferred_msg_type = 'text';  // omit?
        details.first_name = im.user.answers.state_household_head_name;
        details.surname = im.user.answers.state_household_head_surname;
        details.name = im.user.answers.state_household_head_name + ' ' +
                       im.user.answers.state_household_head_surname;

        return details;
    },

    set_public_hoh_details: function(im, details) {
        details.role = 'head_of_household';
        details.mother_id = im.user.answers.mother_id;
        details.preferred_language = im.user.answers.state_msg_language;
        details.preferred_msg_type = 'text';  // omit?
        return details;
    },

    set_standard_ff_details: function(im, details) {
        details.role = im.user.answers.state_msg_receiver;
        details.mother_id = im.user.answers.mother_id;
        details.preferred_language = im.user.answers.state_msg_language;
        details.preferred_msg_type = 'text';  // omit?
        return details;
    },

    update_identities: function(im, is_public_registration) {
      // Saves useful data collected during registration to the relevant identities
        var msg_receiver = im.user.answers.state_msg_receiver;
        if (msg_receiver === 'mother_to_be' || (msg_receiver === 'head_of_household')) {
            return Q
                .all([
                    go.utils.get_identity(im.user.answers.mother_id, im),
                    go.utils.get_identity(im.user.answers.hoh_id, im)
                ])
                .spread(function(mother, hoh) {
                    mother.details = is_public_registration
                        ? go.utils_project.set_public_mother_details(im, mother.details)
                        : go.utils_project.set_standard_mother_details(im, mother.details);
                    hoh.details = is_public_registration
                        ? go.utils_project.set_public_hoh_details(im, hoh.details)
                        : go.utils_project.set_standard_hoh_details(im, hoh.details);
                    return Q.all([
                        go.utils.update_identity(im, mother),
                        go.utils.update_identity(im, hoh)
                    ]);
                });
        } else {
            return Q
                .all([
                    go.utils.get_identity(im.user.answers.mother_id, im),
                    go.utils.get_identity(im.user.answers.hoh_id, im),
                    go.utils.get_identity(im.user.answers.ff_id, im)
                ])
                .spread(function(mother, hoh, ff) {
                    mother.details = is_public_registration
                        ? go.utils_project.set_public_mother_details(im, mother.details)
                        : go.utils_project.set_standard_mother_details(im, mother.details);
                    hoh.details = is_public_registration
                        ? go.utils_project.set_public_hoh_details(im, hoh.details)
                        : go.utils_project.set_standard_hoh_details(im, hoh.details);
                    ff.details = go.utils_project
                        .set_standard_ff_details(im, ff.details);
                    return Q.all([
                        go.utils.update_identity(im, mother),
                        go.utils.update_identity(im, hoh),
                        go.utils.update_identity(im, ff)
                    ]);
                });
        }
    },

    finish_registration: function(im) {
        var reg_info = go.utils_project.compile_reg_info(im);
        return Q.all([
            go.utils.create_registration(im, reg_info),
            go.utils_project.update_identities(im, false)
        ]);
    },

    finish_public_registration: function(im) {
        var reg_info = go.utils_project.compile_public_reg_info(im);
        return Q.all([
            go.utils.create_registration(im, reg_info),
            go.utils_project.update_identities(im, true)
        ]);
    },


// CHANGE HELPERS

    switch_to_baby: function(im, mother_id) {
      // Sends an Api request to the registration store to switch the mother
      // to baby messages

        var change_data = {
            "mother_id": mother_id,
            "action": "change_baby",
            "data": {}
        };

        return go.utils
            .service_api_call("registrations", "post", null, change_data, "change/", im)
            .then(function(response) {
                return response;
            });
    },

    change_language: function(im, new_lang, mother_id) {
      // Sends an Api request to the registration store to change the
      // subscriptions' languages, and sends a patch request to the identity
      // store to change the identities' languages

        var change_data = {
            "mother_id": mother_id,
            "action": "change_language",
            "data": {
                "new_language": new_lang
            }
        };

        return go.utils
            .get_identity(mother_id, im)
            .then(function(mother_identity) {
                mother_identity.details.preferred_language = new_lang;
                return Q
                    .all([
                        go.utils.update_identity(im, mother_identity),
                        go.utils.service_api_call("registrations", "post", null, change_data, "change/", im)
                    ]);
            });
    },

    switch_to_loss: function(im, mother_id, reason) {
      // Sends an Api request to the registration store to switch the mother
      // to loss messages

        var change_data = {
            "mother_id": mother_id,
            "action": "change_loss",
            "data": {
                "reason": reason
            }
        };

        return go.utils
            .service_api_call("registrations", "post", null, change_data, "change/", im)
            .then(function(response) {
                return response;
            });
    },

    unsubscribe_mother: function(im, mother_id, reason) {
      // A unique change endpoint that unsubscribes from the mother messages only
      // in an _only registration case; rather than doing an optout which would
      // block the household messages from getting through to the receiver

        var change_data = {
            "mother_id": mother_id,
            "action": "unsubscribe",
            "data": {
                "reason": reason
            }
        };

        return go.utils
            .service_api_call("registrations", "post", null, change_data, "change/", im)
            .then(function(response) {
                return response;
            });
    },

    optout_contact: function(im, request_source) {
        return go.utils.optout(
            im,
            im.user.answers.contact_id,
            im.user.answers.state_optout_reason,
            'msisdn',
            im.user.answers.contact_msisdn,
            request_source,
            im.config.testing_message_id || im.msg.message_id,
            'stop'
        );
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

    save_identities: function(im, msg_receiver, receiver_id, operator_id) {
      // At this point the receiver identity has already been created
      // Creates identities for additional roles as required and sets
      // the identitity id's to user.answers for later use.
      // msg_receiver: (str) person who will receive messages eg. 'mother_to_be'
      // receiver_id: (str - uuid) id of the message receiver
      // operator_id: (str - uuid) id of healthworker making the registration

        if (msg_receiver === 'mother_to_be') {
            // set the mother as the receiver
            im.user.set_answer('mother_id', receiver_id);
            // create the hoh identity
            return go.utils
                .create_identity(im, null, null, operator_id)
                .then(function(hoh) {
                    im.user.set_answer('hoh_id', hoh.id);
                    return;
                });
        } else if (msg_receiver === 'head_of_household') {
            // set the hoh as the receiver
            im.user.set_answer('hoh_id', receiver_id);
            // create the mother identity - cannot get as no identifying information
            return go.utils
                .create_identity(im, null, receiver_id, operator_id)
                .then(function(mother) {
                    im.user.set_answer('mother_id', mother.id);
                    return;
                });
        } else {  // msg_receiver == family_member / trusted_friend
            // set the friend/family as the receiver
            im.user.set_answer('ff_id', receiver_id);
            // create the hoh identity and the mother identity
            return Q
                .all([
                    go.utils.create_identity(im, null, null, operator_id),  // hoh
                    go.utils.create_identity(im, null, receiver_id, operator_id),  // mother
                ])
                .spread(function(hoh, mother) {
                    im.user.set_answer('hoh_id', hoh.id);
                    im.user.set_answer('mother_id', mother.id);
                    return;
                });
        }
    },

    // SERVICERATING HELPERS

    // check for service rating status not completed yet
    check_servicerating_status: function(identity, im) {
        var params = {
            "identity": identity,
            "completed": "False",
            "expired": "False"
        };
        return go.utils
            .service_api_call("service_rating", "get", params, null, "invite/", im)
            .then(function(json_get_response) {
                return json_get_response.data;
            });
    },

    // saves servicerating info
    post_servicerating_feedback: function(im, q_id, q_text, answer_text, answer_value, version_number, invite_uuid) {
        var payload = {
            "identity": im.user.answers.user_id,
            "invite": invite_uuid,
            "version": version_number,
            "question_id": q_id,
            "question_text": q_text,
            "answer_text": answer_text,
            "answer_value": answer_value
        };

        return go.utils
            .service_api_call("service_rating", "post", null, payload, "rating/", im)
            .then(function(response) {
                return response;
            });
    },

    // sets service rating 'completed' to true
    set_servicerating_status_completed: function(im) {
        var endpoint = "invite/"+im.user.answers.invite_uuid+"/";
        var payload = {
            "completed": "True"
        };

        return go.utils
            .service_api_call("service_rating", "patch", null, payload, endpoint, im)
            .then(function(response) {
                return response;
            });
    },


    "commas": "commas"
};

go.app = function() {
    var vumigo = require('vumigo_v02');
    var Q = require('q');
    var App = vumigo.App;
    var Choice = vumigo.states.Choice;
    var ChoiceState = vumigo.states.ChoiceState;
    var EndState = vumigo.states.EndState;
    var FreeText = vumigo.states.FreeText;


    var GoFC = App.extend(function(self) {
        App.call(self, 'state_start');
        var $ = self.$;

        self.init = function() {};


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
            "state_registration_menu":
                "Choose from:",

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
            "state_number_in_use":
                "Sorry, this number is already registered.",
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
                                    return self.states.create('state_permission');
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
                question: $(questions[name]),
                choices: [
                    new Choice('eng_UG', $('English')),
                    new Choice('cgg_UG', $('Rukiga')),
                    new Choice('xog_UG', $('Lusoga')),
                    new Choice('lug_UG', $('Luganda'))
                ],
                error: $(get_error_text(name)),
                next: 'state_permission'
            });
        });

        // ChoiceState st-C
        self.add('state_permission', function(name) {
            return new ChoiceState(name, {
                question: $(questions[name]).context({'msisdn': self.im.user.addr}),
                choices: [
                    new Choice('has_permission', $('Yes')),
                    new Choice('no_permission', $('No')),
                    new Choice('other_number', $("Change the number I'd like to manage"))
                ],
                error: $(get_error_text(name)),
                next: function(choice) {
                    if (choice.value === 'has_permission') {
                        self.im.user.set_answer('contact_id', self.im.user.answers.user_id);
                        self.im.user.set_answer('contact_msisdn', go.utils
                            .normalize_msisdn(self.im.user.addr, self.im.config.country_code));
                        return self.im.user.answers.role === 'guest'
                            ? 'state_msg_receiver'
                            : 'state_change_menu';
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

        // ChoiceState st-A2
        self.add('state_registration_menu', function(name) {
            return new ChoiceState(name, {
                question: $(questions[name]),
                error: $(get_error_text(name)),
                choices: [
                    new Choice('state_msg_receiver', $('Register to receive SMSs about you & your baby'))
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
                    new Choice('eng_UG', $('English')),
                    new Choice('cgg_UG', $('Rukiga')),
                    new Choice('xog_UG', $('Lusoga')),
                    new Choice('lug_UG', $('Luganda'))
                ],
                error: $(get_error_text(name)),
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
                question: $(questions[name]),
                error: $(get_error_text(name)),
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
            var loss_reasons = ['miscarriage', 'stillborn', 'baby_death'];
            return new ChoiceState(name, {
                question: $(questions[name]),
                choices: [
                    new Choice('miscarriage', $("Mother miscarried")),
                    new Choice('stillborn', $("Baby stillborn")),
                    new Choice('baby_death', $("Baby passed away")),
                    new Choice('not_useful', $("Messages not useful")),
                    new Choice('other', $("Other"))
                ],
                error: $(get_error_text(name)),
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
                question: $(questions[name]),
                choices: [
                    new Choice('state_switch_loss', $("Yes")),
                    new Choice('state_optout', $("No"))
                ],
                error: $(get_error_text(name)),
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
                text: $(questions[name]),
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
                next: function() {
                    self.im.user.set_answer('receiver_id', self.im.user.answers.contact_id);
                    return self.states.create('state_save_identities');
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
                    null
                )
                .then(function() {
                    return self.states.create('state_last_period_month');
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
                next: function() {
                    return go.utils_project
                        .finish_public_registration(self.im)
                        .then(function() {
                            return 'state_end_thank_you';
                        });
                }
            });
        });

        // EndState st-13
        self.add('state_end_thank_you', function(name) {
            var text =
                self.im.user.answers.health_id === 'no_health_id_found'
                ? $("Thank you. Your FamilyConnect ID will be sent to you in an SMS shortly.")
                : $(questions[name]).context({health_id: self.im.user.answers.health_id});
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

go.init = function() {
    var vumigo = require('vumigo_v02');
    var InteractionMachine = vumigo.InteractionMachine;
    var GoFC = go.app.GoFC;

    return {
        im: new InteractionMachine(api, new GoFC())
    };
}();

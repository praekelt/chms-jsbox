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

    split_parts: function(input) {
        // returns an array of an input split by whitespace, or null
        return input.match(/\S+/g);
    },

    get_clean_first_word: function(user_message) {
        return user_message
            .split(" ")[0]          // split off first word
            .replace(/\W/g, '')     // remove non letters
            .toUpperCase();         // capitalise
    },


// CHOICE HELPERS

    make_month_choices: function($, startDate, limit, increment, valueFormat, labelFormat) {
      // Currently supports month translation in formats MMMM and MM

        var choices = [];
        var monthIterator = startDate;
        for (var i=0; i<limit; i++) {
            var raw_label = monthIterator.format(labelFormat);
            var prefix, suffix, month, translation;

            var quad_month_index = labelFormat.indexOf("MMMM");
            var trip_month_index = labelFormat.indexOf("MMM");

            if (quad_month_index > -1) {
                month = monthIterator.format("MMMM");
                prefix = raw_label.substring(0, quad_month_index);
                suffix = raw_label.substring(quad_month_index+month.length, raw_label.length);
                translation = {
                    January: $("{{pre}}January{{post}}"),
                    February: $("{{pre}}February{{post}}"),
                    March: $("{{pre}}March{{post}}"),
                    April: $("{{pre}}April{{post}}"),
                    May: $("{{pre}}May{{post}}"),
                    June: $("{{pre}}June{{post}}"),
                    July: $("{{pre}}July{{post}}"),
                    August: $("{{pre}}August{{post}}"),
                    September: $("{{pre}}September{{post}}"),
                    October: $("{{pre}}October{{post}}"),
                    November: $("{{pre}}November{{post}}"),
                    December: $("{{pre}}December{{post}}"),
                };
                translated_label = translation[month].context({
                    pre: prefix,
                    post: suffix
                });
            } else if (trip_month_index > -1) {
                month = monthIterator.format("MMM");
                prefix = raw_label.substring(0, trip_month_index);
                suffix = raw_label.substring(trip_month_index+month.length, raw_label.length);
                translation = {
                    Jan: $("{{pre}}Jan{{post}}"),
                    Feb: $("{{pre}}Feb{{post}}"),
                    Mar: $("{{pre}}Mar{{post}}"),
                    Apr: $("{{pre}}Apr{{post}}"),
                    May: $("{{pre}}May{{post}}"),
                    Jun: $("{{pre}}Jun{{post}}"),
                    Jul: $("{{pre}}Jul{{post}}"),
                    Aug: $("{{pre}}Aug{{post}}"),
                    Sep: $("{{pre}}Sep{{post}}"),
                    Oct: $("{{pre}}Oct{{post}}"),
                    Nov: $("{{pre}}Nov{{post}}"),
                    Dec: $("{{pre}}Dec{{post}}"),
                };
                translated_label = translation[month].context({
                    pre: prefix,
                    post: suffix
                });
            } else {
                // assume numbers don't need translation
                translated_label = raw_label;
            }

            choices.push(new Choice(monthIterator.format(valueFormat),
                                    translated_label));
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
var vumigo = require('vumigo_v02');
var Choice = vumigo.states.Choice;
var PaginatedChoiceState = vumigo.states.PaginatedChoiceState;


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
                parish: im.user.answers.parish,
                vht_id: im.user.answers.vht_id,
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
        if (details.addresses.msisdn[im.user.answers.contact_msisdn].optedout) {
            delete details.addresses.msisdn[im.user.answers.contact_msisdn].optedout;
        }

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


    // PARISH SEACH HELPERS

    // searches for parish by name
    parish_search: function(name, im) {
        return go.utils
            .service_api_call("registrations", "get", {'name': name}, null, "parish/", im)
            .then(function(response) {
                // The results are paginated, but the default pagination limit is 1000,
                // and we don't want the user to have to go through more than that.
                return response.data.results;
            });
    },

    ParishPaginatedChoiceState: PaginatedChoiceState.extend(function(self, name, opts) {
        // A choice state for displaying the list of parishes. Adds the __retry__ and __exit__ choices, which
        // must be handled in the state's next function.
        PaginatedChoiceState.call(self, name, opts);

        self.retry = new Choice("__retry__", opts.retry);
        self.exit = new Choice("__exit__", opts.exit);

        var super_translate = self.translate;
        self.translate = function(i18n) {
            super_translate.call(self, i18n);
            self.retry.label = i18n(self.retry.label);
            self.exit.label = i18n(self.exit.label);
        };

        var super_current_choices = self.current_choices;
        self.current_choices = function() {
            var choices = super_current_choices();
            choices.push(self.retry);
            choices.push(self.exit);
            return choices;
        };
    }),

    "commas": "commas"
};

go.app = function() {
    var vumigo = require('vumigo_v02');
    var App = vumigo.App;
    var EndState = vumigo.states.EndState;


    var GoApp = App.extend(function(self) {
        App.call(self, 'state_start');
        var $ = self.$;

        self.init = function() {};

    // START STATE

        self.states.add('state_start', function(name) {
            var user_first_word = go.utils.get_clean_first_word(self.im.msg.content);
            self.im.user.set_answer('contact_msisdn', go.utils.normalize_msisdn(
                self.im.user.addr, self.im.config.country_code));
            switch (user_first_word) {
                case "STOP":
                    return self.states.create("state_find_identity");
                case "BABY":
                    return self.states.create("state_find_mother_messageset");
                default:
                    return self.states.create("state_save_inbound");
            }
        });

    // OPTOUT STATES

        self.states.add('state_find_identity', function(name) {
            return go.utils
                .get_identity_by_address(
                    {'msisdn': self.im.user.answers.contact_msisdn}, self.im)
                .then(function(identity) {
                    if (identity) {
                        self.im.user.set_answer('contact_id', identity.id);
                        return self.states.create('state_opt_out');
                    } else {
                        // create identity?
                        return self.states.create('state_end_unrecognised_opt_out');
                    }
                });
        });

        self.states.add('state_opt_out', function(name) {
            return go.utils
                .optout(
                    self.im,
                    self.im.user.answers.contact_id,
                    'unknown',  // optout reason
                    'msisdn',
                    self.im.user.answers.contact_msisdn,
                    'sms_inbound',
                    self.im.config.testing_message_id || self.im.msg.message_id,
                    'stop'
                )
                .then(function() {
                    return self.states.create('state_end_opt_out');
                });
        });

        self.states.add('state_end_opt_out', function(name) {
            return new EndState(name, {
                text: $('You will no longer receive messages from Hello Mama. Should you ever want to re-subscribe, contact your local community health extension worker'),
                next: 'state_start'
            });
        });

        self.states.add('state_end_unrecognised_opt_out', function(name) {
            return new EndState(name, {
                text: $("We do not recognise your number and can therefore not opt you out."),
                next: 'state_start'
            });
        });

    // BABY STATES

        self.states.add('state_find_mother_messageset', function(name) {
            return go.utils
                .get_identity_by_address(
                    {'msisdn': self.im.user.answers.contact_msisdn}, self.im)
                .then(function(identity) {
                    if (identity === null) {
                        return self.states.create('state_end_unrecognised_baby');
                    } else {
                        if (identity.details.role === 'mother') {
                            self.im.user.set_answer('mother_id', identity.id);
                        } else if (identity.details.role) {
                            self.im.user.set_answer('mother_id', identity.details.mother_id);
                        }
                        return go.utils_project
                            .check_postbirth_subscription(self.im, self.im.user.answers.mother_id)
                            .then(function(has_postbirth_sub) {
                                if (has_postbirth_sub) {
                                    return self.states.create('state_end_already_postbirth');
                                } else {
                                    return self.states.create('state_change_baby');
                                }
                            });
                    }
                });
        });

        self.states.add('state_change_baby', function(name) {
            return go.utils_project
                .switch_to_baby(self.im, self.im.user.answers.mother_id)
                .then(function() {
                    return self.states.create('state_end_postbirth_subscription');
                });
        });

        self.states.add('state_end_postbirth_subscription', function(name) {
            return new EndState(name, {
                text: $("Congratulations! You will now receive messages relating to your baby."),
                next: 'state_start'
            });
        });

        self.states.add('state_end_already_postbirth', function(name) {
            return new EndState(name, {
                text: $("You are already subscribed to baby messages."),
                next: 'state_start'
            });
        });

        self.states.add('state_end_unrecognised_baby', function(name) {
            return new EndState(name, {
                text: $("We do not recognise your number and can therefore not subscribe you to baby messages."),
                next: 'state_start'
            });
        });

    // SAVE INBOUND MESSAGES STATES

        self.states.add('state_save_inbound', function(name) {
            return go.utils
                .save_inbound_message(self.im, self.im.user.addr,
                    self.im.user.answers.state_start)
                .then(function() {
                    return self.states.create('state_end_helpdesk');
                });
        });

        self.states.add('state_end_helpdesk', function(name) {
            return new EndState(name, {
                text: $("Currently no helpdesk functionality is active. Reply STOP to unsubscribe."),
                next: 'state_start'
            });
        });

    });

    return {
        GoApp: GoApp
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

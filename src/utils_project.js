/*jshint -W083 */
var Q = require('q');


// Project utils libraty
go.utils_project = {


// TEMPORARY HELPERS

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

    "commas": "commas"
};

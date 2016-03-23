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

    save_identities: function(im, msg_receiver, receiver_msisdn, operator_id) {
      // Creates identities for the msisdns entered in various states
      // and sets the identitity id's to user.answers for later use
      // msg_receiver: (str) person who will receive messages eg. 'mother_to_be'
      // *_msisdn: (str) msisdns of role players
      // operator_id: (str - uuid) id of healthworker making the registration

        if (msg_receiver === 'mother_to_be') {
            return go.utils
                // get or create mother's identity
                .get_or_create_identity({'msisdn': receiver_msisdn}, im, operator_id)
                .then(function(mother) {
                    im.user.set_answer('mother_id', mother.id);
                    im.user.set_answer('receiver_id', mother.id);
                    return;
                });
        } else if (['head_of_household', 'family_member', 'trusted_friend'].indexOf(msg_receiver) !== -1) {
            return go.utils
                // get or create msg_receiver's identity
                .get_or_create_identity({'msisdn': receiver_msisdn}, im, operator_id)
                .then(function(msg_receiver) {
                    im.user.set_answer('receiver_id', msg_receiver.id);
                    return go.utils
                        // create mother's identity - cannot get as no identifying information
                        .create_identity(im, null, msg_receiver.id, operator_id)
                        .then(function(mother) {
                            im.user.set_answer('mother_id', mother.id);
                            return;
                        });
                });
        }
    },

    "commas": "commas"
};

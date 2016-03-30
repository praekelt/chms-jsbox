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
                operator_id: im.user.answers.operator_id,
                language: im.user.answers.state_msg_language,
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

    update_identities: function(im, isPublicRegistration) {
      // Saves useful data collected during registration to the relevant identities
        var msg_receiver = im.user.answers.state_msg_receiver;
        if (msg_receiver === 'mother_to_be' || (msg_receiver === 'head_of_household')) {
            return Q
                .all([
                    go.utils.get_identity(im.user.answers.mother_id, im),
                    go.utils.get_identity(im.user.answers.hoh_id, im)
                ])
                .spread(function(mother, hoh) {
                    mother.details = isPublicRegistration
                                    ? go.utils_project
                                        .set_public_mother_details(im, mother.details)
                                    : go.utils_project
                                        .set_standard_mother_details(im, mother.details);
                    hoh.details = isPublicRegistration
                                    ? go.utils_project
                                        .set_public_hoh_details(im, hoh.details)
                                    : go.utils_project
                                        .set_standard_hoh_details(im, hoh.details);
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
                    mother.details = isPublicRegistration
                                    ? go.utils_project
                                        .set_public_mother_details(im, mother.details)
                                    : go.utils_project
                                        .set_standard_mother_details(im, mother.details);
                    hoh.details = isPublicRegistration
                                    ? go.utils_project
                                        .set_public_hoh_details(im, hoh.details)
                                    : go.utils_project
                                        .set_standard_hoh_details(im, hoh.details);
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

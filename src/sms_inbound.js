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

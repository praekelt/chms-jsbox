var vumigo = require('vumigo_v02');
var fixtures = require('./fixtures_sms_inbound');
var AppTester = vumigo.AppTester;


describe("FamilyConnect SMS app", function() {
    describe("SMS inbound reply test", function() {
        var app;
        var tester;

        beforeEach(function() {
            app = new go.app.GoApp();
            tester = new AppTester(app);

            tester
                .setup.char_limit(160)
                .setup.config.app({
                    name: 'sms_inbound',
                    country_code: '256',  // nigeria
                    channel: '2561234',
                    transport_name: 'aggregator_sms',
                    transport_type: 'sms',
                    testing_today: '2015-04-03',  // testing only
                    testing_message_id: '0170b7bb-978e-4b8a-35d2-662af5b6daee',  // testing only
                    services: {
                        identities: {
                            api_token: 'test_token_identities',
                            url: "http://localhost:8001/api/v1/"
                        },
                        registrations: {
                            api_token: 'test_token_registrations',
                            url: "http://localhost:8002/api/v1/"
                        },
                        voice_content: {
                            api_token: "test_token_voice_content",
                            url: "http://localhost:8004/api/v1/"
                        },
                        subscriptions: {
                            api_token: 'test_token_subscriptions',
                            url: "http://localhost:8005/api/v1/"
                        },
                        message_sender: {
                            api_token: 'test_token_message_sender',
                            url: "http://localhost:8006/api/v1/"
                        }
                    },
                })
                .setup(function(api) {
                    fixtures().forEach(api.http.fixtures.add);
                })
                ;
        });

        describe("when the user sends a STOP message", function() {
            it("should opt them out if contact found", function() {
                return tester
                    .setup.user.addr('0720000222')
                    .inputs('stop and wait for green')
                    .check.interaction({
                        state: 'state_end_opt_out',
                        reply: 'You will no longer receive messages from Hello Mama. Should you ever want to re-subscribe, contact your local community health extension worker'
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [0,1]);
                    })
                    .run();
            });
            it("should report problem if contact not found", function() {
                return tester
                    .setup.user.addr('0720000111')
                    .inputs('stop')
                    .check.interaction({
                        state: 'state_end_unrecognised_opt_out',
                        reply: "We do not recognise your number and can therefore not opt you out."
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [2]);
                    })
                    .run();
            });
        });

        describe("when the user sends a BABY message", function() {
            it("should switch them to baby messages if on prebirth messages", function() {
                return tester
                    .setup.user.addr('0720000222')
                    .inputs('baby')
                    .check.interaction({
                        state: 'state_end_postbirth_subscription',
                        reply: "Congratulations! You will now receive messages relating to your baby."
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [0,4,5,6]);
                    })
                    .run();
            });
            it("should NOT switch them to baby messages if already on postbirth messages", function() {
                return tester
                    .setup.user.addr('0720000333')
                    .inputs('baby is born')
                    .check.interaction({
                        state: 'state_end_already_postbirth',
                        reply: "You are already subscribed to baby messages."
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [7,8,9]);
                    })
                    .run();
            });
            it("should report problem if contact not found", function() {
                return tester
                    .setup.user.addr('0720000111')
                    .inputs('baby')
                    .check.interaction({
                        state: 'state_end_unrecognised_baby',
                        reply: "We do not recognise your number and can therefore not subscribe you to baby messages."
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [2]);
                    })
                    .run();
            });
        });

        describe("when the user sends any other message", function() {
            it("should display helpdesk message", function() {
                return tester
                    .setup.user.addr('0720000111')
                    .inputs('go when the light is green')
                    .check.interaction({
                        state: 'state_end_helpdesk',
                        reply:
                            'Currently no helpdesk functionality is active. Reply STOP to unsubscribe.'
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [3]);
                    })
                    .run();
            });
        });

    });
});

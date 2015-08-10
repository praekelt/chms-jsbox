var vumigo = require('vumigo_v02');
var fixtures = require('./fixtures');
var AppTester = vumigo.AppTester;


describe("familyconnect app", function() {
    describe("for ussd use", function() {
        var app;
        var tester;

        beforeEach(function() {
            app = new go.app.GoFC();
            tester = new AppTester(app);

            tester
                .setup.char_limit(160)
                .setup.config.app({
                    pre_auth: 'on',
                    name: 'familyconnect',
                    channel: '*120*8864*0000#',
                    testing_today: '2015-04-03 06:07:08.999',
                    metric_store: 'chms_uganda_test',  // _env at the end
                    control: {
                        username: "test_user",
                        api_key: "test_key",
                        url: "http://127.0.0.1:8000/subscription/"
                    },
                    endpoints: {
                        "sms": {"delivery_class": "sms"}
                    },
                })
                .setup(function(api) {
                    fixtures().forEach(api.http.fixtures.add);
                })
                .setup(function(api) {
                    api.metrics.stores = {'chms_uganda_test': {}};
                })
                .setup(function(api) {
                    // new user 082111
                    api.contacts.add({
                        msisdn: '+082111',
                        extra: {},
                        key: "contact_key_082111",
                        user_account: "contact_user_account"
                    });
                });
        });


        // TEST REGISTRATION

        describe("Full flow testing", function() {

            it("should work", function() {
                return tester
                    .setup.user.addr('082111')
                    .inputs(
                        {session_event: 'new'}  // dial in
                    )
                    .check.interaction({
                        state: 'state_auth_code',
                        reply: "Welcome to FamilyConnect. Please enter your 5 digit personnel code."
                    })
                    .run();
            });

            it("should work", function() {
                return tester
                    .setup.user.addr('082111')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'  // state_auth_code - personnel code
                    )
                    .check.interaction({
                        state: 'state_end_thank_you',
                        reply: "Thank you. The pregnant woman will now receive messages."
                    })
                    .run();
            });

        });

    });
});

var vumigo = require('vumigo_v02');
var fixtures = require('./fixtures');
var AppTester = vumigo.AppTester;
var _ = require('lodash');
var assert = require('assert');

describe("familyconnect app", function() {
    describe("for ussd use - auth on", function() {
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


        describe("Timeout testing", function() {
            it("should ask about continuing", function() {
                return tester
                    .setup.user.addr('082111')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'  // state_auth_code - personnel code
                        , {session_event: 'close'}
                        , {session_event: 'new'}
                    )
                    .check.interaction({
                        state: 'state_timed_out',
                        reply: [
                            "You have an incomplete registration. Would you like to continue with this registration?",
                            "1. Yes",
                            "2. Start new registration"
                        ].join('\n')
                    })
                    .run();
            });

            it("should continue", function() {
                return tester
                    .setup.user.addr('082111')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'  // state_auth_code - personnel code
                        , {session_event: 'close'}
                        , {session_event: 'new'}
                        , '1'  // state_timed_out - continue
                    )
                    .check.interaction({
                        state: 'state_msg_receiver'
                    })
                    .run();
            });

            it("should restart", function() {
                return tester
                    .setup.user.addr('082111')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'  // state_auth_code - personnel code
                        , {session_event: 'close'}
                        , {session_event: 'new'}
                        , '2'  // state_timed_out - restart
                    )
                    .check.interaction({
                        state: 'state_auth_code'
                    })
                    .run();
            });
        });


        // TEST REGISTRATION

        describe("Flow testing", function() {

            it("to state_auth_code", function() {
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

            it("to state_msg_receiver", function() {
                return tester
                    .setup.user.addr('082111')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'  // state_auth_code - personnel code
                    )
                    .check.interaction({
                        state: 'state_msg_receiver',
                        reply: [
                            "Welcome to FamilyConnect. Please select who will receive the messages:",
                            "1. Head of Household",
                            "2. Mother to be",
                            "3. Trusted friend/family member"
                        ].join('\n')
                    })
                    .run();
            });

            it("to state_msisdn", function() {
                return tester
                    .setup.user.addr('082111')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'  // state_auth_code - personnel code
                        , '1'  // state_msg_receiver - head of household
                    )
                    .check.interaction({
                        state: 'state_msisdn',
                        reply: "Please enter the cellphone number which the messages will be sent to. For example, 0713627893"
                    })
                    .run();
            });

            it("to state_household_head_name", function() {
                return tester
                    .setup.user.addr('082111')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'  // state_auth_code - personnel code
                        , '1'  // state_msg_receiver - head of household
                        , '0713627893'  // state_msisdn
                    )
                    .check.interaction({
                        state: 'state_household_head_name'
                    })
                    .run();
            });

            it("to state_household_head_surname", function() {
                return tester
                    .setup.user.addr('082111')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'  // state_auth_code - personnel code
                        , '1'  // state_msg_receiver - head of household
                        , '0713627893'  // state_msisdn
                        , 'Isaac'  // state_household_head_name
                    )
                    .check.interaction({
                        state: 'state_household_head_surname'
                    })
                    .run();
            });

            it("to state_household_head_surname", function() {
                return tester
                    .setup.user.addr('082111')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'  // state_auth_code - personnel code
                        , '1'  // state_msg_receiver - head of household
                        , '0713627893'  // state_msisdn
                        , 'Isaac'  // state_household_head_name
                        , 'Mbire'  // state_household_head_surname
                    )
                    .check.interaction({
                        state: 'state_last_period_month',
                        reply: [
                            "Please select the month when the woman had her last period:",
                            "1. July 15",
                            "2. June 15",
                            "3. May 15",
                            "4. Apr 15",
                            "5. Mar 15",
                            "6. Feb 15",
                            "7. Jan 15",
                            "8. Dec 14",
                            "9. Nov 14"
                        ].join('\n')
                    })
                    .run();
            });

            it("to state_last_period_day", function() {
                return tester
                    .setup.user.addr('082111')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'  // state_auth_code - personnel code
                        , '1'  // state_msg_receiver - head of household
                        , '0713627893'  // state_msisdn
                        , 'Isaac'  // state_household_head_name
                        , 'Mbire'  // state_household_head_surname
                        , '1'  // state_last_period_month - 21ly 2015
                        , '21'  // state_last_period_day - 21st
                    )
                    .check.interaction({
                        state: 'state_id_type'
                    })
                    .run();
            });

            it("complete flow - uganda ID, english", function() {
                return tester
                    .setup.user.addr('082111')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'  // state_auth_code - personnel code
                        , '1'  // state_msg_receiver - head of household
                        , '0713627893'  // state_msisdn
                        , 'Isaac'  // state_household_head_name
                        , 'Mbire'  // state_household_head_surname
                        , '1'  // state_last_period_month - July 2015
                        , '21'  // state_last_period_day - 21st
                        , '1'  // state_id_type - Ugandan ID
                        , '444'  // state_nin
                        , '1'  // state_msg_language - english
                    )
                    .check.interaction({
                        state: 'state_end_thank_you',
                        reply: "Thank you. The pregnant woman will now receive messages."
                    })
                    .check(function(api) {
                        var smses = _.where(api.outbound.store, {
                            endpoint: 'sms'
                        });
                        var sms = smses[0];
                        assert.equal(smses.length,1);
                        assert.equal(sms.content,
                            "Thank you. The pregnant woman will receive messages in English."
                        );
                        assert.equal(sms.to_addr,'082111');
                    })
                    .run();
            });

            it("complete flow - other ID, lusoga", function() {
                return tester
                    .setup.user.addr('082111')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'  // state_auth_code - personnel code
                        , '1'  // state_msg_receiver - head of household
                        , '0713627893'  // state_msisdn
                        , 'Isaac'  // state_household_head_name
                        , 'Mbire'  // state_household_head_surname
                        , '1'  // state_last_period_month - July 2015
                        , '21'  // state_last_period_day - 21st
                        , '2'  // state_id_type - other ID
                        , '13'  // state_mother_birth_day - 13th
                        , '5'  // state_mother_birth_month - may
                        , '1982'  // state_mother_birth_year - 1982
                        , '3'  // state_msg_language - lusoga
                    )
                    .check.interaction({
                        state: 'state_end_thank_translate',
                        reply: "Thank you. The pregnant woman will receive messages in English until Runyankore and Lusoga messages are available."
                    })
                    .check(function(api) {
                        var smses = _.where(api.outbound.store, {
                            endpoint: 'sms'
                        });
                        var sms = smses[0];
                        assert.equal(smses.length,1);
                        assert.equal(sms.content,
                            "Thank you. The pregnant woman will receive messages in English until Runyankore and Lusoga messages are available."
                        );
                        assert.equal(sms.to_addr,'082111');
                    })
                    .run();
            });

        });

    });
    describe("for ussd use - auth off", function() {
        var app;
        var tester;

        beforeEach(function() {
            app = new go.app.GoFC();
            tester = new AppTester(app);

            tester
                .setup.char_limit(160)
                .setup.config.app({
                    pre_auth: 'off',
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


        describe("Timeout testing", function() {
            it("should ask about continuing", function() {
                return tester
                    .setup.user.addr('082111')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '1'  // state_msg_receiver - head of household
                        , {session_event: 'close'}
                        , {session_event: 'new'}
                    )
                    .check.interaction({
                        state: 'state_timed_out',
                        reply: [
                            "You have an incomplete registration. Would you like to continue with this registration?",
                            "1. Yes",
                            "2. Start new registration"
                        ].join('\n')
                    })
                    .run();
            });

            it("should continue", function() {
                return tester
                    .setup.user.addr('082111')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '1'  // state_msg_receiver - head of household
                        , {session_event: 'close'}
                        , {session_event: 'new'}
                        , '1'  // state_timed_out - continue
                    )
                    .check.interaction({
                        state: 'state_msisdn'
                    })
                    .run();
            });

            it("should restart", function() {
                return tester
                    .setup.user.addr('082111')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '1'  // state_msg_receiver - head of household
                        , {session_event: 'close'}
                        , {session_event: 'new'}
                        , '2'  // state_timed_out - restart
                    )
                    .check.interaction({
                        state: 'state_msg_receiver'
                    })
                    .run();
            });
        });


        // TEST REGISTRATION

        describe("Flow testing", function() {

            it("to state_msg_receiver", function() {
                return tester
                    .setup.user.addr('082111')
                    .inputs(
                        {session_event: 'new'}  // dial in
                    )
                    .check.interaction({
                        state: 'state_msg_receiver',
                        reply: [
                            "Welcome to FamilyConnect. Please select who will receive the messages:",
                            "1. Head of Household",
                            "2. Mother to be",
                            "3. Trusted friend/family member"
                        ].join('\n')
                    })
                    .run();
            });


            it("complete flow - uganda ID, english", function() {
                return tester
                    .setup.user.addr('082111')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '1'  // state_msg_receiver - head of household
                        , '0713627893'  // state_msisdn
                        , 'Isaac'  // state_household_head_name
                        , 'Mbire'  // state_household_head_surname
                        , '1'  // state_last_period_month - July 2015
                        , '21'  // state_last_period_day - 21st
                        , '1'  // state_id_type - Ugandan ID
                        , '444'  // state_nin
                        , '1'  // state_msg_language - english
                    )
                    .check.interaction({
                        state: 'state_end_thank_you',
                        reply: "Thank you. The pregnant woman will now receive messages."
                    })
                    .check(function(api) {
                        var smses = _.where(api.outbound.store, {
                            endpoint: 'sms'
                        });
                        var sms = smses[0];
                        assert.equal(smses.length,1);
                        assert.equal(sms.content,
                            "Thank you. The pregnant woman will receive messages in English."
                        );
                        assert.equal(sms.to_addr,'082111');
                    })
                    .run();
            });

            it("complete flow - other ID, lusoga", function() {
                return tester
                    .setup.user.addr('082111')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '1'  // state_msg_receiver - head of household
                        , '0713627893'  // state_msisdn
                        , 'Isaac'  // state_household_head_name
                        , 'Mbire'  // state_household_head_surname
                        , '1'  // state_last_period_month - July 2015
                        , '21'  // state_last_period_day - 21st
                        , '2'  // state_id_type - other ID
                        , '13'  // state_mother_birth_day - 13th
                        , '5'  // state_mother_birth_month - may
                        , '1982'  // state_mother_birth_year - 1982
                        , '3'  // state_msg_language - lusoga
                    )
                    .check.interaction({
                        state: 'state_end_thank_translate',
                        reply: "Thank you. The pregnant woman will receive messages in English until Runyankore and Lusoga messages are available."
                    })
                    .check(function(api) {
                        var smses = _.where(api.outbound.store, {
                            endpoint: 'sms'
                        });
                        var sms = smses[0];
                        assert.equal(smses.length,1);
                        assert.equal(sms.content,
                            "Thank you. The pregnant woman will receive messages in English until Runyankore and Lusoga messages are available."
                        );
                        assert.equal(sms.to_addr,'082111');
                    })
                    .run();
            });

        });

    });
});

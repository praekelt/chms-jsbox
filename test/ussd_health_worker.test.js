var vumigo = require('vumigo_v02');
var fixtures = require('./fixtures');
var AppTester = vumigo.AppTester;

describe("familyconnect health worker app", function() {
    describe("for ussd use - auth on", function() {
        var app;
        var tester;

        beforeEach(function() {
            app = new go.app.GoFC();
            tester = new AppTester(app);

            tester
                .setup.char_limit(182)
                .setup.config.app({
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
                })
                .setup(function(api) {
                    // hcp recognised user 082222
                    api.contacts.add({
                        msisdn: '+082222',
                        extra: {},
                        key: "contact_key_082222",
                        user_account: "contact_user_account"
                    });
                })
                ;
        });

        // TEST TIMEOUTS

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

        // TEST HCP RECOGNISED USER

        describe("HCP recognised user", function() {
            it("should not be asked for personnel code", function() {
                return tester
                    .setup.user.addr('082222')
                    .inputs(
                        {session_event: 'new'}  // dial in
                    )
                    .check.interaction({
                        state: 'state_msg_receiver'
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
                        reply: "Welcome to FamilyConnect. Please enter your unique personnel code. For example, 12345"
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
                            "Please select who will receive the messages on their phone:",
                            "1. Head of the Household",
                            "2. Mother to be",
                            "3. Family member",
                            "4. Trusted friend"
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
                        state: 'state_household_head_name',
                        reply: "Please enter the first name of the Head of the Household of the Pregnant woman. For example, Isaac."
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
                        state: 'state_household_head_surname',
                        reply: "Please enter the surname of the Head of the Household of the pregnant woman. For example, Mbire."
                    })
                    .run();
            });
            it("to state_last_period_month", function() {
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
                        , '1'  // state_last_period_month - july 2015
                    )
                    .check.interaction({
                        state: 'state_last_period_day',
                        reply: "What day did her last period start on? (For example, 12)"
                    })
                    .run();
            });
            it("to state_mother_name", function() {
                return tester
                    .setup.user.addr('082111')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'  // state_auth_code - personnel code
                        , '1'  // state_msg_receiver - head of household
                        , '0713627893'  // state_msisdn
                        , 'Isaac'  // state_household_head_name
                        , 'Mbire'  // state_household_head_surname
                        , '1'  // state_last_period_month - july 2015
                        , '21'  // state_last_period_day - 21st
                    )
                    .check.interaction({
                        state: 'state_mother_name',
                        reply: "Mother name"
                    })
                    .run();
            });
            it("to state_mother_surname", function() {
                return tester
                    .setup.user.addr('082111')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'  // state_auth_code - personnel code
                        , '1'  // state_msg_receiver - head of household
                        , '0713627893'  // state_msisdn
                        , 'Isaac'  // state_household_head_name
                        , 'Mbire'  // state_household_head_surname
                        , '1'  // state_last_period_month - july 2015
                        , '21'  // state_last_period_day - 21st
                        , 'Sharon'  // state_mother_name
                    )
                    .check.interaction({
                        state: 'state_mother_surname',
                        reply: "Mother surname"
                    })
                    .run();
            });
            it("to state_id_type", function() {
                return tester
                    .setup.user.addr('082111')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'  // state_auth_code - personnel code
                        , '1'  // state_msg_receiver - head of household
                        , '0713627893'  // state_msisdn
                        , 'Isaac'  // state_household_head_name
                        , 'Mbire'  // state_household_head_surname
                        , '1'  // state_last_period_month - july 2015
                        , '21'  // state_last_period_day - 21st
                        , 'Sharon'  // state_mother_name
                        , 'Nalule'  // state_mother_surname
                    )
                    .check.interaction({
                        state: 'state_id_type',
                        reply: [
                            "What kind of identification does the pregnant woman have?",
                            "1. Ugandan National Identity Number",
                            "2. Other"
                        ].join('\n')
                    })
                    .run();
            });

            it("to state_nin", function() {
                return tester
                    .setup.user.addr('082111')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'  // state_auth_code - personnel code
                        , '1'  // state_msg_receiver - head of household
                        , '0713627893'  // state_msisdn
                        , 'Isaac'  // state_household_head_name
                        , 'Mbire'  // state_household_head_surname
                        , '1'  // state_last_period_month - july 2015
                        , '21'  // state_last_period_day - 21st
                        , 'Sharon'  // state_mother_name
                        , 'Nalule'  // state_mother_surname
                        , '1'  // state_id_type - ugandan id
                    )
                    .check.interaction({
                        state: 'state_nin',
                        reply: "Please enter her National Identity Number (NIN)."
                    })
                    .run();
            });
            it("to state_msg_language (NIN)", function() {
                return tester
                    .setup.user.addr('082111')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'  // state_auth_code - personnel code
                        , '1'  // state_msg_receiver - head of household
                        , '0713627893'  // state_msisdn
                        , 'Isaac'  // state_household_head_name
                        , 'Mbire'  // state_household_head_surname
                        , '1'  // state_last_period_month - july 2015
                        , '21'  // state_last_period_day - 21st
                        , 'Sharon'  // state_mother_name
                        , 'Nalule'  // state_mother_surname
                        , '1'  // state_id_type - ugandan id
                        , '444'  // state_nin
                    )
                    .check.interaction({
                        state: 'state_msg_language',
                        reply: [
                            "Which language would they want to receive messages in?",
                            "1. English",
                            "2. Runyakore",
                            "3. Lusoga",
                        ].join('\n')
                    })
                    .run();
            });

            it("to state_mother_birth_day", function() {
                return tester
                    .setup.user.addr('082111')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'  // state_auth_code - personnel code
                        , '1'  // state_msg_receiver - head of household
                        , '0713627893'  // state_msisdn
                        , 'Isaac'  // state_household_head_name
                        , 'Mbire'  // state_household_head_surname
                        , '1'  // state_last_period_month - july 2015
                        , '21'  // state_last_period_day - 21st
                        , 'Sharon'  // state_mother_name
                        , 'Nalule'  // state_mother_surname
                        , '2'  // state_id_type - other
                    )
                    .check.interaction({
                        state: 'state_mother_birth_day',
                        reply: "Please enter the day the she was born. For example, 12."
                    })
                    .run();
            });
            it("to state_mother_birth_month", function() {
                return tester
                    .setup.user.addr('082111')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'  // state_auth_code - personnel code
                        , '1'  // state_msg_receiver - head of household
                        , '0713627893'  // state_msisdn
                        , 'Isaac'  // state_household_head_name
                        , 'Mbire'  // state_household_head_surname
                        , '1'  // state_last_period_month - july 2015
                        , '21'  // state_last_period_day - 21st
                        , 'Sharon'  // state_mother_name
                        , 'Nalule'  // state_mother_surname
                        , '2'  // state_id_type - other
                        , '13'  // state_mother_birth_day - 13th
                    )
                    .check.interaction({
                        state: 'state_mother_birth_month',
                        reply: [
                            "Please select the month of year the Mother was born:",
                            "1. January",
                            "2. February",
                            "3. March",
                            "4. April",
                            "5. May",
                            "6. June",
                            "7. July",
                            "8. August",
                            "9. September",
                            "10. More"
                        ].join('\n')
                    })
                    .run();
            });
            it("to state_mother_birth_year", function() {
                return tester
                    .setup.user.addr('082111')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'  // state_auth_code - personnel code
                        , '1'  // state_msg_receiver - head of household
                        , '0713627893'  // state_msisdn
                        , 'Isaac'  // state_household_head_name
                        , 'Mbire'  // state_household_head_surname
                        , '1'  // state_last_period_month - july 2015
                        , '21'  // state_last_period_day - 21st
                        , 'Sharon'  // state_mother_name
                        , 'Nalule'  // state_mother_surname
                        , '2'  // state_id_type - other
                        , '13'  // state_mother_birth_day - 13th
                        , '5'  // state_mother_birth_month - may
                    )
                    .check.interaction({
                        state: 'state_mother_birth_year',
                        reply: "Please enter the year the mother was born. For example, 1986."
                    })
                    .run();
            });
            it("to state_msg_language (Other)", function() {
                return tester
                    .setup.user.addr('082111')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'  // state_auth_code - personnel code
                        , '1'  // state_msg_receiver - head of household
                        , '0713627893'  // state_msisdn
                        , 'Isaac'  // state_household_head_name
                        , 'Mbire'  // state_household_head_surname
                        , '1'  // state_last_period_month - july 2015
                        , '21'  // state_last_period_day - 21st
                        , 'Sharon'  // state_mother_name
                        , 'Nalule'  // state_mother_surname
                        , '2'  // state_id_type - other
                        , '13'  // state_mother_birth_day - 13th
                        , '5'  // state_mother_birth_month - may
                        , '1982'  // state_mother_birth_year - 1982
                    )
                    .check.interaction({
                        state: 'state_msg_language',
                        reply: [
                            "Which language would they want to receive messages in?",
                            "1. English",
                            "2. Runyakore",
                            "3. Lusoga",
                        ].join('\n')
                    })
                    .run();
            });

            it("to state_hiv_messages", function() {
                return tester
                    .setup.user.addr('082111')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'  // state_auth_code - personnel code
                        , '1'  // state_msg_receiver - head of household
                        , '0713627893'  // state_msisdn
                        , 'Isaac'  // state_household_head_name
                        , 'Mbire'  // state_household_head_surname
                        , '1'  // state_last_period_month - july 2015
                        , '21'  // state_last_period_day - 21st
                        , 'Sharon'  // state_mother_name
                        , 'Nalule'  // state_mother_surname
                        , '1'  // state_id_type - ugandan id
                        , '444'  // state_nin
                        , '3'  // state_msg_language - lusoga
                    )
                    .check.interaction({
                        state: 'state_hiv_messages',
                        reply: [
                            "Would they like to receive additional messages about HIV?",
                            "1. Yes",
                            "2. No"
                        ].join('\n')
                    })
                    .run();
            });

            it("complete flow - uganda ID, english, hiv messages", function() {
                return tester
                    .setup.user.addr('082111')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'  // state_auth_code - personnel code
                        , '1'  // state_msg_receiver - head of household
                        , '0713627893'  // state_msisdn
                        , 'Isaac'  // state_household_head_name
                        , 'Mbire'  // state_household_head_surname
                        , '1'  // state_last_period_month - july 2015
                        , '21'  // state_last_period_day - 21st
                        , 'Sharon'  // state_mother_name
                        , 'Nalule'  // state_mother_surname
                        , '1'  // state_id_type - ugandan id
                        , '444'  // state_nin
                        , '3'  // state_msg_language - lusoga
                        , '1'  // state_hiv_messages - yes
                    )
                    .check.interaction({
                        state: 'state_end_thank_you',
                        reply: "Thank you. The pregnant woman will now receive messages."
                    })
                    .run();
            });
            it("complete flow - mother, other ID, lusoga, no hiv msgs", function() {
                return tester
                    .setup.user.addr('082111')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'  // state_auth_code - personnel code
                        , '2'  // state_msg_receiver - mother to be
                        , '0713627893'  // state_msisdn
                        , 'Isaac'  // state_household_head_name
                        , 'Mbire'  // state_household_head_surname
                        , '1'  // state_last_period_month - July 2015
                        , '21'  // state_last_period_day - 21st
                        , 'Mary'  // state_mother_name
                        , 'Nalule'  // state_mother_surname
                        , '2'  // state_id_type - other ID
                        , '13'  // state_mother_birth_day - 13th
                        , '5'  // state_mother_birth_month - may
                        , '1982'  // state_mother_birth_year - 1982
                        , '3'  // state_msg_language - lusoga
                        , '2'  // state_hiv_messages - no
                    )
                    .check.interaction({
                        state: 'state_end_thank_you',
                        reply: "Thank you. The pregnant woman will now receive messages."
                    })
                    .run();
            });
        });

        // TEST VALIDATION

        describe("Validation testing", function() {
            it("validate state_auth_code", function() {
                return tester
                    .setup.user.addr('082111')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , 'aaaaa'  // state_auth_code - invalid personnel code
                    )
                    .check.interaction({
                        state: 'state_auth_code',
                        reply: "That code is not recognised. Please enter your 5 digit personnel code."
                    })
                    .run();
            });
            it("validate state_msg_receiver", function() {
                return tester
                    .setup.user.addr('082111')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'  // state_auth_code - personnel code
                        , '5'  // state_msg_receiver - invalid choice
                    )
                    .check.interaction({
                        state: 'state_msg_receiver',
                        reply: [
                            "Sorry not a valid input. Please select who will receive the messages on their phone:",
                            "1. Head of the Household",
                            "2. Mother to be",
                            "3. Family member",
                            "4. Trusted friend"
                        ].join('\n')
                    })
                    .run();
            });

        });
    });

});

var vumigo = require('vumigo_v02');
var fixtures = require('./fixtures_public');
var AppTester = vumigo.AppTester;

describe("familyconnect health worker app", function() {
    describe("for ussd use", function() {
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
                    testing_today: '2015-04-03',  // testing only
                    testing_message_id: '0170b7bb-978e-4b8a-35d2-662af5b6daee',  // testing only
                    country_code: '256',  // uganda
                    services: {
                        identities: {
                            api_token: 'test_token_identities',
                            url: "http://localhost:8001/api/v1/"
                        },
                        registrations: {
                            api_token: 'test_token_registrations',
                            url: "http://localhost:8002/api/v1/"
                        },
                        subscriptions: {
                            api_token: 'test_token_subscriptions',
                            url: "http://localhost:8005/api/v1/"
                        },
                        service_rating: {
                            api_token: 'test_token_service_rating',
                            url: "http://localhost:8006/api/v1/"
                        }
                    },
                    no_timeout_redirects: [
                        'state_start',
                        'state_end_baby',
                        'state_end_language',
                        'state_end_recipient',
                        'state_end_loss_subscription',
                        'state_end_optout',
                        'state_end_thank_you',
                        'state_end_servicerating'
                    ],
                    timeout_redirects: [
                        // registration states
                        'state_last_period_month',
                        'state_last_period_day',
                    ],
                })
                .setup(function(api) {
                    fixtures().forEach(api.http.fixtures.add);
                })
                ;
        });

        // TEST TIMEOUTS

        describe("Timeout testing", function() {
            describe("in State Change", function() {
                it("should restart after two time-outs", function() {
                    return tester
                        .setup.user.addr('0720000222')
                        .inputs(
                            {session_event: 'new'}  // dial in
                            , '1'  // state_choose_number - this number
                            , '3'  // state_change_menu - change number
                            , {session_event: 'close'}
                            , {session_event: 'new'}
                            , '1'  // state_choose_number - this number
                            , '3'  // state_change_menu - change number
                            , '0720000111'  // state_change_number
                            , {session_event: 'close'}
                            , {session_event: 'new'}
                        )
                        .check.interaction({
                            state: 'state_change_menu',
                            reply: [
                                "Choose:",
                                "1. Start baby SMSs",
                                "2. Update language",
                                "3. Change the number which gets SMSs",
                                "4. Stop SMSs"
                            ].join('\n')
                        })
                        .run();
                });
                it("should restart (guest with unrecognised number)", function() {
                    return tester
                        .setup.user.addr('0720000111')
                        .inputs(
                            {session_event: 'new'}  // dial in
                            , '1'  // state_language - english
                            , {session_event: 'close'}
                            , {session_event: 'new'}
                        )
                        .check.interaction({
                            state: 'state_language'
                        })
                        .run();
                });
            });
            describe("in Registration", function() {
                it("to state_timed_out", function() {
                    return tester
                        .setup.user.addr('0720000111')
                        .inputs(
                            {session_event: 'new'}  // dial in
                            , '1'  // state_language - english
                            , '1'  // state_choose_number - this number
                            , {session_event: 'close'}
                            , {session_event: 'new'}
                        )
                        .check.interaction({
                            state: 'state_timed_out',
                            reply: [
                                "You have an incomplete registration. Would you like to continue with this registration?",
                                "1. Yes",
                                "2. No, start from the beginning"
                            ].join('\n')
                        })
                        .check(function(api) {
                            go.utils.check_fixtures_used(api, [0,1,6]);
                        })
                        .run();
                });
                it("should continue", function() {
                    return tester
                        .setup.user.addr('0720000111')
                        .inputs(
                            {session_event: 'new'}  // dial in
                            , '1'  // state_language - english
                            , '1'  // state_choose_number - this number
                            , {session_event: 'close'}
                            , {session_event: 'new'}
                            , '1'  // state_timed_out - continue
                        )
                        .check.interaction({
                            state: 'state_last_period_month'
                        })
                        .run();
                });
                it("should restart", function() {
                    return tester
                        .setup.user.addr('0720000111')
                        .inputs(
                            {session_event: 'new'}  // dial in
                            , '1'  // state_language - english
                            , '1'  // state_choose_number - this number
                            , '3'  // state_last_period_month
                            , {session_event: 'close'}
                            , {session_event: 'new'}
                            , '2'  // state_timed_out - restart
                        )
                        .check.interaction({
                            state: 'state_language',
                            reply: [
                                "Welcome to FamilyConnect. Please choose your language",
                                "1. English",
                                "2. Rukiga",
                                "3. Lusoga",
                                "4. Luganda"
                            ].join('\n')
                        })
                        .run();
                });
            });
        });

        // TEST ROUTING

        describe("Routing testing", function() {
            it("to state_language", function() {
                return tester
                    .setup.user.addr('0720000111')
                    .inputs(
                        {session_event: 'new'}  // dial in
                    )
                    .check.interaction({
                        state: 'state_language',
                        reply: [
                            "Welcome to FamilyConnect. Please choose your language",
                            "1. English",
                            "2. Rukiga",
                            "3. Lusoga",
                            "4. Luganda"
                        ].join('\n')
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [0,1]);
                    })
                    .run();
            });
            it("to state_choose_number (via state_language)", function() {
                return tester
                    .setup.user.addr('0720000111')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , "2"  // state_language - Runyakore
                    )
                    .check.interaction({
                        state: 'state_choose_number',
                        reply: [
                            "Choose from:",
                            "1. Register this number to receive SMSs about you & your baby",
                            "2. Manage a different phone number"
                        ].join('\n')
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [0,1]);
                    })
                    .run();
            });
            it("to state_change_menu (recognised user)", function() {
                return tester
                    .setup.user.addr('0720000222')
                    .inputs(
                        {session_event: 'new'}  // dial in
                    )
                    .check.interaction({
                        state: 'state_change_menu',
                        reply: [
                            "Choose:",
                            "1. Start baby SMSs",
                            "2. Update language",
                            "3. Change the number which gets SMSs",
                            "4. Stop SMSs"
                        ].join('\n')
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [2,45]);
                    })
                    .run();
            });
            it("to state_manage_msisdn", function() {
                return tester
                    .setup.user.addr('0720000111')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , "1"  // state_language - English
                        , "2"  // state_choose_number - change number to manage
                    )
                    .check.interaction({
                        state: 'state_manage_msisdn',
                        reply: "Please enter the mobile number of the person who will receive the weekly messages. For example 0803304899"
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [0,1]);
                    })
                    .run();
            });
            it("to state_change_menu", function() {
                return tester
                    .setup.user.addr('0720000222')
                    .inputs(
                        {session_event: 'new'}  // dial in
                    )
                    .check.interaction({
                        state: 'state_change_menu',
                        reply: [
                            "Choose:",
                            "1. Start baby SMSs",
                            "2. Update language",
                            "3. Change the number which gets SMSs",
                            "4. Stop SMSs"
                        ].join('\n')
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [2,45]);
                    })
                    .run();
            });
        });

        // TEST REGISTRATION FLOW

        describe("Registration testing", function() {
            it("to state_last_period_month", function() {
                return tester
                    .setup.user.addr('0720000111')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , "1"  // state_language - English
                        , "2"  // state_choose_number - change number to manage
                        , "0720000333"  // state_manage_msisdn - unregistered user
                    )
                    .check.interaction({
                        state: 'state_last_period_month',
                        reply: [
                            "When did the woman have her last period",
                            "1. Apr 15",
                            "2. Mar 15",
                            "3. Feb 15",
                            "4. Jan 15",
                            "5. Dec 14",
                            "6. Nov 14",
                            "7. Oct 14",
                            "8. Sep 14",
                            "9. Aug 14"
                        ].join('\n')
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [0,1,3,4,6]);
                    })
                    .run();
            });
            it("to state_last_period_day", function() {
                return tester
                    .setup.user.addr('0720000111')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , "1"  // state_language - English
                        , "2"  // state_choose_number - change number to manage
                        , "0720000333"  // state_manage_msisdn - unregistered user
                        , "3"  // state_last_period_month - may
                    )
                    .check.interaction({
                        state: 'state_last_period_day',
                        reply: "What day of the month did the woman start her last period? For example, 12."
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [0,1,3,4,6]);
                    })
                    .run();
            });

            it("to state_cellphone_or_search", function() {
                return tester
                    .setup.user.addr('0720000111')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , "1"  // state_language - English
                        , "2"  // state_choose_number - change number to manage
                        , "0720000333"  // state_manage_msisdn - unregistered user
                        , "3"  // state_last_period_month - may
                        , "22"  // state_last_period_day - 22
                    )
                    .check.interaction({
                        state: 'state_cellphone_or_search',
                        reply: [
                            "Do you know your local village health team (VHT)?",
                            "1. Yes",
                            "2. No"
                        ].join('\n')
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [0,1,3,4,5,6]);
                    })
                    .run();
            });

            it("to state_vht_cellphone_number", function() {
                return tester
                    .setup.user.addr('0720000111')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , "1"  // state_language - English
                        , "2"  // state_choose_number - change number to manage
                        , "0720000333"  // state_manage_msisdn - unregistered user
                        , "3"  // state_last_period_month - may
                        , "22"  // state_last_period_day - 22
                        , "1"  // state_cellphone_or_search - cellphone
                    )
                    .check.interaction({
                        state: 'state_vht_cellphone_number',
                        reply: "Please enter their cellphone number. For example, 0803304899"
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [0,1,3,4,5,6]);
                    })
                    .run();
            });

            it("to state_check_vht_exists", function() {
                return tester
                    .setup.user.addr('0720000111')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , "1"  // state_language - English
                        , "2"  // state_choose_number - change number to manage
                        , "0720000333"  // state_manage_msisdn - unregistered user
                        , "3"  // state_last_period_month - may
                        , "22"  // state_last_period_day - 22
                        , "1"  // state_cellphone_or_search - cellphone
                        , "0720000111" // state_check_vht_exists, invalid vht
                    )
                    .check.interaction({
                        state: 'state_check_vht_exists',
                        reply: [
                            "We did not recognise the VHTs number.",
                            "1. Try again",
                            "2. Enter your location instead"
                        ].join('\n')
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [0,1,3,4,5,6]);
                    })
                    .run();
            });

            it("to state_parish_search", function() {
                return tester
                    .setup.user.addr('0720000111')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , "1"  // state_language - English
                        , "2"  // state_choose_number - change number to manage
                        , "0720000333"  // state_manage_msisdn - unregistered user
                        , "3"  // state_last_period_month - may
                        , "22"  // state_last_period_day - 22
                        , "2"  // state_cellphone_or_search - search
                    )
                    .check.interaction({
                        state: 'state_parish_search',
                        reply: "What is the name of your parish?"
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [0,1,3,4,5,6]);
                    })
                    .run()
            });

            it("to state_select_parish", function() {
                return tester
                    .setup.user.addr('0720000111')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , "1"  // state_language - English
                        , "2"  // state_choose_number - change number to manage
                        , "0720000333"  // state_manage_msisdn - unregistered user
                        , "3"  // state_last_period_month - may
                        , "22"  // state_last_period_day - 22
                        , "2"  // state_cellphone_or_search - search
                        , "kawa" // state_parish_search - search for "kawa", 5 results
                    )
                    .check.interaction({
                        state: 'state_select_parish',
                        reply: [
                            "Results for kawa:",
                            "1. Kawaaga",
                            "2. Balawoli",
                            "3. Kagumba",
                            "4. Kasolwe",
                            "5. More",
                            "6. Try again",
                            "7. Exit"
                        ].join('\n')
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [0,1,3,4,5,6,49]);
                    })
                    .run()
            });

            it("to state_no_parish_results", function() {
                return tester
                    .setup.user.addr('0720000111')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , "1"  // state_language - English
                        , "2"  // state_choose_number - change number to manage
                        , "0720000333"  // state_manage_msisdn - unregistered user
                        , "3"  // state_last_period_month - may
                        , "22"  // state_last_period_day - 22
                        , "2"  // state_cellphone_or_search - search
                        , "foo" // state_parish_search - search for "foo", no results
                    )
                    .check.interaction({
                        state: 'state_no_parish_results',
                        reply: [
                            "Sorry, there are no results for your parish name.",
                            "1. Try again",
                            "2. Exit"
                        ].join('\n')
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [0,1,3,4,5,6,50]);
                    })
                    .run()
            });

            it("to state_retry_parish_search", function() {
                return tester
                    .setup.user.addr('0720000111')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , "1"  // state_language - English
                        , "2"  // state_choose_number - change number to manage
                        , "0720000333"  // state_manage_msisdn - unregistered user
                        , "3"  // state_last_period_month - may
                        , "22"  // state_last_period_day - 22
                        , "2"  // state_cellphone_or_search - search
                        , "foo" // state_parish_search - search for "foo", no results
                        , "1" // state_no_parish_results - try again
                    )
                    .check.interaction({
                        state: 'state_retry_parish_search',
                        reply: [
                            "Please re-enter your parish name carefully and make sure you use the correct spelling."
                        ].join('\n')
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [0,1,3,4,5,6,50]);
                    })
                    .run()
            });

            it("complete flow - vht cellphone", function() {
                return tester
                    .setup.user.addr('0720000111')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , "1"  // state_language - English
                        , "2"  // state_choose_number - change number to manage
                        , "0720000555"  // state_manage_msisdn - unregistered user
                        , "3"  // state_last_period_month - feb 15
                        , "22"  // state_last_period_day - 22
                        , "1"  // state_cellphone_or_search - cellphone
                        , "0720000999" // state_vht_cellphone_number, valid VHT
                    )
                    .check.user.answer('state_msg_receiver', 'mother_to_be')
                    .check.user.answer('receiver_id', 'cb245673-aa41-4302-ac47-0000000555')
                    .check.user.answer('mother_id', 'cb245673-aa41-4302-ac47-0000000555')
                    .check.user.answer('hoh_id', 'identity-uuid-06')
                    .check.user.answer('ff_id', undefined)
                    .check.user.answer('parish', 'Kawaaga')
                    .check.user.answer('vht_personnel_code', '888')
                    .check.interaction({
                        state: 'state_end_thank_you',
                        reply: "Thank you. Your FamilyConnect ID is 5555555555. You will receive an SMS with it shortly."
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [0,1,6,8,16,17,18,19,20,21,48]);
                    })
                    .run();
            });

            it("complete flow - location search", function() {
                return tester
                    .setup.user.addr('0720000111')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , "1"  // state_language - English
                        , "2"  // state_choose_number - change number to manage
                        , "0720000555"  // state_manage_msisdn - unregistered user
                        , "3"  // state_last_period_month - feb 15
                        , "22"  // state_last_period_day - 22
                        , "2"  // state_cellphone_or_search - search
                        , "kawa" // state_parish_search - search "kawa", 5 results
                        , "1" // state_select_parish - select "Kawaaga"
                    )
                    .check.user.answer('state_msg_receiver', 'mother_to_be')
                    .check.user.answer('receiver_id', 'cb245673-aa41-4302-ac47-0000000555')
                    .check.user.answer('mother_id', 'cb245673-aa41-4302-ac47-0000000555')
                    .check.user.answer('hoh_id', 'identity-uuid-06')
                    .check.user.answer('ff_id', undefined)
                    .check.user.answer('state_select_parish', 'Kawaaga')
                    .check.user.answer('vht_personnel_code', undefined)
                    .check.interaction({
                        state: 'state_end_thank_you',
                        reply: "Thank you. Your FamilyConnect ID is 5555555555. You will receive an SMS with it shortly."
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [0,1,6,8,16,17,18,20,21,49,51]);
                    })
                    .run();
            });
        });

        describe("Change testing", function() {
            it("to state_end_baby", function() {
                return tester
                    .setup.user.addr('0720000222')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , "1"  // state_change_menu - baby
                    )
                    .check.interaction({
                        state: 'state_end_baby',
                        reply: "You will receive baby messages."
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [2,26,27,28,45]);
                    })
                    .run();
            });
            it("to state_already_baby", function() {
                return tester
                    .setup.user.addr('0720000111')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , "1"  // state_language - English
                        , "2"  // state_choose_number - change number to manage
                        , "0720000666"  // state_change_menu - baby
                        , "1"  // state_change_menu - baby
                    )
                    .check.interaction({
                        state: 'state_already_baby',
                        reply: [
                            "You are already registered for baby messages.",
                            "1. Back to main menu",
                            "2. Exit"
                        ].join('\n')
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [0,1,29,30,31]);
                    })
                    .run();
            });
            it("to state_end_general", function() {
                return tester
                    .setup.user.addr('0720000111')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , "1"  // state_language - English
                        , "2"  // state_choose_number - change number to manage
                        , "0720000666"  // state_change_menu - baby
                        , "1"  // state_change_menu - baby
                        , "2"  // state_already_baby - exit
                    )
                    .check.interaction({
                        state: 'state_end_general',
                        reply: "Thank you for using the FamilyConnect service"
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [0,1,29,30,31]);
                    })
                    .run();
            });
            it("back to state_change_menu", function() {
                return tester
                    .setup.user.addr('0720000111')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , "1"  // state_language - English
                        , "2"  // state_choose_number - change number to manage
                        , "0720000666"  // state_change_menu - baby
                        , "1"  // state_change_menu - baby
                        , "1"  // state_already_baby - back to main menu
                    )
                    .check.interaction({
                        state: 'state_change_menu'
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [0,1,29,30,31]);
                    })
                    .run();
            });

            it("to state_change_language", function() {
                return tester
                    .setup.user.addr('0720000222')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , "2"  // state_change_menu - change language
                    )
                    .check.interaction({
                        state: 'state_change_language',
                        reply: [
                            "What language would this person like to receive these messages in?",
                            "1. English",
                            "2. Rukiga",
                            "3. Lusoga",
                            "4. Luganda"
                        ].join('\n')
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [2,45]);
                    })
                    .run();
            });
            it("to state_end_language", function() {
                return tester
                    .setup.user.addr('0720000222')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , "2"  // state_change_menu - change language
                        , "3"  // state_change_language - Lusoga
                    )
                    .check.interaction({
                        state: 'state_end_language',
                        reply: "Thank you. Your language preference has been updated and you will start to receive SMSs in this language."
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [2,22,32,33,45]);
                    })
                    .run();
            });

            it("to state_change_number", function() {
                return tester
                    .setup.user.addr('0720000222')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '3'  // state_change_menu - change number
                    )
                    .check.interaction({
                        state: 'state_change_number',
                        reply: "Please enter the new mobile number you would like to receive weekly messages on. For example 0803304899"
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [2,45]);
                    })
                    .run();
            });
            it("to state_change_recipient", function() {
                return tester
                    .setup.user.addr('0720000222')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '3'  // state_change_menu - change number
                        , '0720000111'  // state_change_number
                    )
                    .check.interaction({
                        state: 'state_change_recipient',
                        reply: [
                            "Who will receive these messages?",
                            "1. Head of the Household",
                            "2. Mother to be",
                            "3. Family member",
                            "4. Trusted friend"
                        ].join('\n')
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [0,2,22,23,45]);
                    })
                    .run();
            });
            it("to state_end_recipient", function() {
                return tester
                    .setup.user.addr('0720000222')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '3'  // state_change_menu - change number
                        , '0720000111'  // state_change_number
                        , '1'  // state_change_recipient - head of household
                    )
                    .check.interaction({
                        state: 'state_end_recipient',
                        reply: "Thank you. The number which receives messages has been updated."
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [0,2,22,23,45]);
                    })
                    .run();
            });
            it("to state_number_in_use", function() {
                return tester
                    .setup.user.addr('0720000222')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '3'  // state_change_menu - change number
                        , '0720000444'  // state_change_number
                    )
                    .check.interaction({
                        state: 'state_number_in_use',
                        reply: [
                            "Sorry, this number is already registered.",
                            "1. Try a different number",
                            "2. Exit"
                        ].join('\n')
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [2,24,45]);
                    })
                    .run();
            });
            it("to state_change_number (via state_number_in_use)", function() {
                return tester
                    .setup.user.addr('0720000222')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '3'  // state_change_menu - change number
                        , '0720000444'  // state_change_number
                        , '1'  // state_number_in_use - try different number
                    )
                    .check.interaction({
                        state: 'state_change_number',
                        reply: "Please enter the new mobile number you would like to receive weekly messages on. For example 0803304899"
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [2,24,45]);
                    })
                    .run();
            });
            it("to state_end_general (via state_number_in_use)", function() {
                return tester
                    .setup.user.addr('0720000222')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '3'  // state_change_menu - change number
                        , '0720000444'  // state_change_number
                        , '2'  // state_number_in_use - exit
                    )
                    .check.interaction({
                        state: 'state_end_general',
                        reply: "Thank you for using the FamilyConnect service"
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [2,24,45]);
                    })
                    .run();
            });

            it("to state_optout_reason", function() {
                return tester
                    .setup.user.addr('0720000222')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , "4"  // state_change_menu - optout
                    )
                    .check.interaction({
                        state: 'state_optout_reason',
                        reply: [
                            "Please tell us why you no longer want to receive messages so we can help you further.",
                            "1. Mother miscarried",
                            "2. Baby stillborn",
                            "3. Baby passed away",
                            "4. Messages not useful",
                            "5. Other"
                        ].join('\n')
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [2,45]);
                    })
                    .run();
            });
            it("to state_loss_subscription", function() {
                return tester
                    .setup.user.addr('0720000222')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , "4"  // state_change_menu - optout
                        , "1"  // state_optout_reason - other
                    )
                    .check.interaction({
                        state: 'state_loss_subscription',
                        reply: [
                            "We are sorry for your loss. Would you like to receive a small set of free messages from FamilyConnect that could help you in this difficult time?",
                            "1. Yes",
                            "2. No"
                        ].join('\n')
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [2,45]);
                    })
                    .run();
            });
            it("to state_end_loss_subscription", function() {
                return tester
                    .setup.user.addr('0720000222')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , "4"  // state_change_menu - optout
                        , "1"  // state_optout_reason - other
                        , "1"  // state_loss_subscription - yes
                    )
                    .check.interaction({
                        state: 'state_end_loss_subscription',
                        reply: "Thank you. You will now receive messages to support you during this difficult time."
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [2,34,45]);
                    })
                    .run();
            });
            it("to state_end_optout (loss)", function() {
                return tester
                    .setup.user.addr('0720000222')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , "4"  // state_change_menu - optout
                        , "1"  // state_optout_reason - other
                        , "2"  // state_loss_subscription - no
                    )
                    .check.interaction({
                        state: 'state_end_optout',
                        reply: "Thank you. You will no longer receive messages"
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [2,35,37,45]);
                    })
                    .run();
            });
            it("to state_end_optout (non-loss)", function() {
                return tester
                    .setup.user.addr('0720000222')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , "4"  // state_change_menu - optout
                        , "5"  // state_optout_reason - other
                    )
                    .check.interaction({
                        state: 'state_end_optout',
                        reply: "Thank you. You will no longer receive messages"
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [2,36,38,45]);
                    })
                    .run();
            });
        });

        // TEST SERVICERATING FLOW

        describe("Service Rating testing", function() {
            it("to state_servicerating_question1", function() {
                return tester
                    .setup.user.addr('0720000777')
                    .inputs(
                        {session_event: 'new'}  // dial in
                    )
                    .check.interaction({
                        state: 'state_servicerating_question1',
                        reply: [
                            'Welcome. When you signed up, were staff at the facility friendly & helpful?',
                            '1. Very Satisfied',
                            '2. Satisfied',
                            '3. Not Satisfied',
                            '4. Very unsatisfied'
                        ].join('\n')
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [39,46]);
                    })
                    .run();
            });
            it("to state_servicerating_question2", function() {
                return tester
                    .setup.user.addr('0720000777')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '2'  // state_servicerating_question1 - satisfied
                    )
                    .check.interaction({
                        state: 'state_servicerating_question2',
                        reply: [
                            'How do you feel about the time you had to wait at the facility?',
                            '1. Very Satisfied',
                            '2. Satisfied',
                            '3. Not Satisfied',
                            '4. Very unsatisfied'
                        ].join('\n')
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [39,40,46]);
                    })
                    .run();
            });
            it("to state_servicerating_question3", function() {
                return tester
                    .setup.user.addr('0720000777')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '2'  // state_servicerating_question1 - satisfied
                        , '2'  // state_servicerating_question2 - satisfied
                    )
                    .check.interaction({
                        state: 'state_servicerating_question3',
                        reply: [
                            'How long did you wait to be helped at the clinic?',
                            '1. Less than an hour',
                            '2. Between 1 and 3 hours',
                            '3. More than 4 hours',
                            '4. All day'
                        ].join('\n')
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [39,40,41,46]);
                    })
                    .run();
            });
            it("to state_servicerating_question4", function() {
                return tester
                    .setup.user.addr('0720000777')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '2'  // state_servicerating_question1 - satisfied
                        , '2'  // state_servicerating_question2 - satisfied
                        , '3'  // state_servicerating_question3 - more than 4hours
                    )
                    .check.interaction({
                        state: 'state_servicerating_question4',
                        reply: [
                            'Was the facility clean?',
                            '1. Very Satisfied',
                            '2. Satisfied',
                            '3. Not Satisfied',
                            '4. Very unsatisfied'
                        ].join('\n')
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [39,40,41,42,46]);
                    })
                    .run();
            });
            it("to state_servicerating_question5", function() {
                return tester
                    .setup.user.addr('0720000777')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '2'  // state_servicerating_question1 - satisfied
                        , '2'  // state_servicerating_question2 - satisfied
                        , '3'  // state_servicerating_question3 - more than 4hours
                        , '4'  // state_servicerating_question4 - very unsatisfied
                    )
                    .check.interaction({
                        state: 'state_servicerating_question5',
                        reply: [
                            'Did you feel that your privacy was respected by the staff?',
                            '1. Very Satisfied',
                            '2. Satisfied',
                            '3. Not Satisfied',
                            '4. Very unsatisfied'
                        ].join('\n')
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [39,40,41,42,43,46]);
                    })
                    .run();
            });

            it("to state_end_servicerating", function() {
                return tester
                    .setup.user.addr('0720000777')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '2'  // state_servicerating_question1 - satisfied
                        , '2'  // state_servicerating_question2 - satisfied
                        , '3'  // state_servicerating_question3 - more than 4hours
                        , '4'  // state_servicerating_question4 - very unsatisfied
                        , '1'  // state_servicerating_question5 - very satisfied
                    )
                    .check.interaction({
                        state: 'state_end_servicerating',
                        reply: "Thank you for rating the FamilyConnect service."
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [39,40,41,42,43,44,46,47]);
                    })
                    .check.reply.ends_session()
                    .run();
            });
        });

    });

});

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
                    },
                    no_timeout_redirects: [
                        'state_start',
                        'state_end_baby',
                        'state_end_language',
                        'state_end_recipient',
                        'state_end_loss_subscription',
                        'state_end_optout',
                        'state_end_thank_you',
                    ],
                    timeout_redirects: [
                        // registration states
                        'state_msg_receiver',
                        'state_last_period_month',
                        'state_last_period_day',
                        'state_hiv_messages',
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
                it("should restart at state C (state_permission)", function() {
                    return tester
                        .setup.user.addr('0720000222')
                        .inputs(
                            {session_event: 'new'}  // dial in
                            , '1'  // state_permission - yes
                            , '3'  // state_change_menu - change number
                            , {session_event: 'close'}
                            , {session_event: 'new'}
                        )
                        .check.interaction({
                            state: 'state_permission',
                            reply: [
                                "Welcome to FamilyConnect. Do you have permission to manage the number 0720000222?",
                                "1. Yes",
                                "2. No",
                                "3. Change the number I'd like to manage"
                            ].join('\n')
                        })
                        .run();
                });
                it("should restart after two time-outs", function() {
                    return tester
                        .setup.user.addr('0720000222')
                        .inputs(
                            {session_event: 'new'}  // dial in
                            , '1'  // state_permission - yes
                            , '3'  // state_change_menu - change number
                            , {session_event: 'close'}
                            , {session_event: 'new'}
                            , '1'  // state_permission - yes
                            , '3'  // state_change_menu - change number
                            , '0720000111'  // state_change_number
                            , {session_event: 'close'}
                            , {session_event: 'new'}
                        )
                        .check.interaction({
                            state: 'state_permission',
                            reply: [
                                "Welcome to FamilyConnect. Do you have permission to manage the number 0720000222?",
                                "1. Yes",
                                "2. No",
                                "3. Change the number I'd like to manage"
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
                            , '1'  // state_permission - has_permission
                            , '1'  // state_msg_receiver - head of household
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
                            go.utils.check_fixtures_used(api, [0,1,11]);
                        })
                        .run();
                });
                it("should continue", function() {
                    return tester
                        .setup.user.addr('0720000111')
                        .inputs(
                            {session_event: 'new'}  // dial in
                            , '1'  // state_language - english
                            , '1'  // state_permission - has_permission
                            , '1'  // state_msg_receiver - head of household
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
                            , '1'  // state_permission - has_permission
                            , '1'  // state_msg_receiver - head of household
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
            it("to state_permission (via state_language)", function() {
                return tester
                    .setup.user.addr('0720000111')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , "2"  // state_language - Runyakore
                    )
                    .check.interaction({
                        state: 'state_permission',
                        reply: [
                            "Welcome to FamilyConnect. Do you have permission to manage the number 0720000111?",
                            "1. Yes",
                            "2. No",
                            "3. Change the number I'd like to manage"
                        ].join('\n')
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [0,1]);
                    })
                    .run();
            });
            it("to state_permission (recognised user)", function() {
                return tester
                    .setup.user.addr('0720000222')
                    .inputs(
                        {session_event: 'new'}  // dial in
                    )
                    .check.interaction({
                        state: 'state_permission',
                        reply: [
                            "Welcome to FamilyConnect. Do you have permission to manage the number 0720000222?",
                            "1. Yes",
                            "2. No",
                            "3. Change the number I'd like to manage"
                        ].join('\n')
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [2]);
                    })
                    .run();
            });
            it("to state_manage_msisdn", function() {
                return tester
                    .setup.user.addr('0720000222')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , "3"  // state_permission - change number to manage
                    )
                    .check.interaction({
                        state: 'state_manage_msisdn',
                        reply: "Please enter the number you would like to manage. For example 0803304899.  Note: You should permission from the owner to manage this number."
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [2]);
                    })
                    .run();
            });
            it("to state_msg_receiver", function() {
                return tester
                    .setup.user.addr('0720000222')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , "3"  // state_permission - change number to manage
                        , "0720000333"  // state_manage_msisdn - unregistered user
                    )
                    .check.interaction({
                        state: 'state_msg_receiver',
                        reply: [
                            "Who will receive these messages?",
                            "1. Head of the Household",
                            "2. Mother to be",
                            "3. Family member",
                            "4. Trusted friend"
                        ].join('\n')
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [2,3,4]);
                    })
                    .run();
            });
            it("to state_change_menu", function() {
                return tester
                    .setup.user.addr('0720000222')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , "1"  // state_permission - change number to manage
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
                        go.utils.check_fixtures_used(api, [2]);
                    })
                    .run();
            });
            it("to state_permission_required", function() {
                return tester
                    .setup.user.addr('0720000222')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , "2"  // state_permission - change number to manage
                    )
                    .check.interaction({
                        state: 'state_permission_required',
                        reply: "Sorry, you need permission."
                    })
                    .check.reply.ends_session()
                    .run();
            });
        });

        // TEST REGISTRATION FLOW

        describe("Registration testing", function() {
            it("to state_last_period_month", function() {
                return tester
                    .setup.user.addr('0720000222')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , "3"  // state_permission - change number to manage
                        , "0720000333"  // state_manage_msisdn - unregistered user
                        , "4"  // state_msg_receiver - trusted friend
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
                        go.utils.check_fixtures_used(api, [2,3,4,6,9]);
                    })
                    .run();
            });
            it("to state_last_period_day", function() {
                return tester
                    .setup.user.addr('0720000222')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , "3"  // state_permission - change number to manage
                        , "0720000333"  // state_manage_msisdn - unregistered user
                        , "4"  // state_msg_receiver - trusted friend
                        , "3"  // state_last_period_month - may
                    )
                    .check.interaction({
                        state: 'state_last_period_day',
                        reply: "What day of the month did the woman start her last period? For example, 12."
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [2,3,4,6,9]);
                    })
                    .run();
            });
            it("to state_hiv_messages", function() {
                return tester
                    .setup.user.addr('0720000222')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , "3"  // state_permission - change number to manage
                        , "0720000333"  // state_manage_msisdn - unregistered user
                        , "4"  // state_msg_receiver - trusted friend
                        , "3"  // state_last_period_month - may
                        , "22"  // state_last_period_day
                    )
                    .check.interaction({
                        state: 'state_hiv_messages',
                        reply: [
                            "Would they like to receive additional messages about HIV?",
                            "1. Yes",
                            "2. No"
                        ].join('\n')
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [2,3,4,6,9,10]);
                    })
                    .check.user.answer('state_msg_receiver', 'trusted_friend')
                    .check.user.answer('receiver_id', 'cb245673-aa41-4302-ac47-0000000333')
                    .check.user.answer('mother_id', 'identity-uuid-09')
                    .check.user.answer('hoh_id', 'identity-uuid-06')
                    .check.user.answer('ff_id', 'cb245673-aa41-4302-ac47-0000000333')
                    .run();
            });

            it("complete flow - trusted_friend", function() {
                return tester
                    .setup.user.addr('0720000222')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , "3"  // state_permission - change number to manage
                        , "0720000333"  // state_manage_msisdn - unregistered user
                        , "4"  // state_msg_receiver - trusted friend
                        , "3"  // state_last_period_month - feb 15
                        , "22"  // state_last_period_day - 22
                        , "1"  // state_hiv_messages - yes
                    )
                    .check.user.answer('state_msg_receiver', 'trusted_friend')
                    .check.user.answer('receiver_id', 'cb245673-aa41-4302-ac47-0000000333')
                    .check.user.answer('mother_id', 'identity-uuid-09')
                    .check.user.answer('hoh_id', 'identity-uuid-06')
                    .check.user.answer('ff_id', 'cb245673-aa41-4302-ac47-0000000333')
                    .check.interaction({
                        state: 'state_end_thank_you',
                        reply: "Thank you. Your FamilyConnect ID is 9999999999. You will receive an SMS with it shortly."
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [2,3,4,5,6,8,9,10,12,13,14,15]);
                    })
                    .run();
            });
            it("complete flow - mother_to_be", function() {
                return tester
                    .setup.user.addr('0720000222')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , "3"  // state_permission - change number to manage
                        , "0720000555"  // state_manage_msisdn - unregistered user
                        , "2"  // state_msg_receiver - mother_to_be
                        , "3"  // state_last_period_month - feb 15
                        , "22"  // state_last_period_day - 22
                        , "1"  // state_hiv_messages - yes
                    )
                    .check.user.answer('state_msg_receiver', 'mother_to_be')
                    .check.user.answer('receiver_id', 'cb245673-aa41-4302-ac47-0000000555')
                    .check.user.answer('mother_id', 'cb245673-aa41-4302-ac47-0000000555')
                    .check.user.answer('hoh_id', 'identity-uuid-06')
                    .check.user.answer('ff_id', undefined)
                    .check.interaction({
                        state: 'state_end_thank_you',
                        reply: "Thank you. Your FamilyConnect ID is 5555555555. You will receive an SMS with it shortly."
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [2,6,8,16,17,18,19,20,21]);
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
                        , "1"  // state_permission - change number to manage
                        , "1"  // state_change_menu - baby
                    )
                    .check.interaction({
                        state: 'state_end_baby',
                        reply: "You will receive baby messages."
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [2,26,27,28]);
                    })
                    .run();
            });
            it("to state_already_baby", function() {
                return tester
                    .setup.user.addr('0720000222')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , "3"  // state_permission - change number to manage
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
                        go.utils.check_fixtures_used(api, [2,29,30,31]);
                    })
                    .run();
            });
            it("to state_end_general", function() {
                return tester
                    .setup.user.addr('0720000222')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , "3"  // state_permission - change number to manage
                        , "0720000666"  // state_change_menu - baby
                        , "1"  // state_change_menu - baby
                        , "2"  // state_already_baby - exit
                    )
                    .check.interaction({
                        state: 'state_end_general',
                        reply: "Thank you for using the FamilyConnect service"
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [2,29,30,31]);
                    })
                    .run();
            });
            it("back to state_change_menu", function() {
                return tester
                    .setup.user.addr('0720000222')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , "3"  // state_permission - change number to manage
                        , "0720000666"  // state_change_menu - baby
                        , "1"  // state_change_menu - baby
                        , "1"  // state_already_baby - back to main menu
                    )
                    .check.interaction({
                        state: 'state_change_menu'
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [2,29,30,31]);
                    })
                    .run();
            });

            it("to state_change_language", function() {
                return tester
                    .setup.user.addr('0720000222')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , "1"  // state_permission - change number to manage
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
                        go.utils.check_fixtures_used(api, [2]);
                    })
                    .run();
            });
            it("to state_end_language", function() {
                return tester
                    .setup.user.addr('0720000222')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , "1"  // state_permission - change number to manage
                        , "2"  // state_change_menu - change language
                        , "3"  // state_change_language - Lusoga
                    )
                    .check.interaction({
                        state: 'state_end_language',
                        reply: "Thank you. Your language preference has been updated and you will start to receive SMSs in this language."
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [2,22,32,33]);
                    })
                    .run();
            });

            it("to state_change_number", function() {
                return tester
                    .setup.user.addr('0720000222')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '1'  // state_permission - change number to manage
                        , '3'  // state_change_menu - change number
                    )
                    .check.interaction({
                        state: 'state_change_number',
                        reply: "Please enter the new mobile number you would like to receive weekly messages on. For example 0803304899"
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [2]);
                    })
                    .run();
            });
            it("to state_change_recipient", function() {
                return tester
                    .setup.user.addr('0720000222')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '1'  // state_permission - change number to manage
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
                        go.utils.check_fixtures_used(api, [0,2,22,23]);
                    })
                    .run();
            });
            it("to state_end_recipient", function() {
                return tester
                    .setup.user.addr('0720000222')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '1'  // state_permission - change number to manage
                        , '3'  // state_change_menu - change number
                        , '0720000111'  // state_change_number
                        , '1'  // state_change_recipient - head of household
                    )
                    .check.interaction({
                        state: 'state_end_recipient',
                        reply: "Thank you. The number which receives messages has been updated."
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [0,2,22,23]);
                    })
                    .run();
            });
            it("to state_number_in_use", function() {
                return tester
                    .setup.user.addr('0720000222')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '1'  // state_permission - change number to manage
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
                        go.utils.check_fixtures_used(api, [2,24]);
                    })
                    .run();
            });
            it("to state_change_number (via state_number_in_use)", function() {
                return tester
                    .setup.user.addr('0720000222')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '1'  // state_permission - change number to manage
                        , '3'  // state_change_menu - change number
                        , '0720000444'  // state_change_number
                        , '1'  // state_number_in_use - try different number
                    )
                    .check.interaction({
                        state: 'state_change_number',
                        reply: "Please enter the new mobile number you would like to receive weekly messages on. For example 0803304899"
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [2,24]);
                    })
                    .run();
            });
            it("to state_end_general (via state_number_in_use)", function() {
                return tester
                    .setup.user.addr('0720000222')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '1'  // state_permission - change number to manage
                        , '3'  // state_change_menu - change number
                        , '0720000444'  // state_change_number
                        , '2'  // state_number_in_use - exit
                    )
                    .check.interaction({
                        state: 'state_end_general',
                        reply: "Thank you for using the FamilyConnect service"
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [2,24]);
                    })
                    .run();
            });

            it("to state_optout_reason", function() {
                return tester
                    .setup.user.addr('0720000222')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , "1"  // state_permission - change number to manage
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
                        go.utils.check_fixtures_used(api, [2]);
                    })
                    .run();
            });
            it("to state_loss_subscription", function() {
                return tester
                    .setup.user.addr('0720000222')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , "1"  // state_permission - change number to manage
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
                        go.utils.check_fixtures_used(api, [2]);
                    })
                    .run();
            });
            it("to state_end_loss_subscription", function() {
                return tester
                    .setup.user.addr('0720000222')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , "1"  // state_permission - change number to manage
                        , "4"  // state_change_menu - optout
                        , "1"  // state_optout_reason - other
                        , "1"  // state_loss_subscription - yes
                    )
                    .check.interaction({
                        state: 'state_end_loss_subscription',
                        reply: "Thank you. You will now receive messages to support you during this difficult time."
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [2,34]);
                    })
                    .run();
            });
            it("to state_end_optout (loss)", function() {
                return tester
                    .setup.user.addr('0720000222')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , "1"  // state_permission - change number to manage
                        , "4"  // state_change_menu - optout
                        , "1"  // state_optout_reason - other
                        , "2"  // state_loss_subscription - no
                    )
                    .check.interaction({
                        state: 'state_end_optout',
                        reply: "Thank you. You will no longer receive messages"
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [2,35,37]);
                    })
                    .run();
            });
            it("to state_end_optout (non-loss)", function() {
                return tester
                    .setup.user.addr('0720000222')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , "1"  // state_permission - change number to manage
                        , "4"  // state_change_menu - optout
                        , "5"  // state_optout_reason - other
                    )
                    .check.interaction({
                        state: 'state_end_optout',
                        reply: "Thank you. You will no longer receive messages"
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [2,36,38]);
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
                        go.utils.check_fixtures_used(api, [39]);
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
                        go.utils.check_fixtures_used(api, [39]);
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
                        go.utils.check_fixtures_used(api, [39]);
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
                        go.utils.check_fixtures_used(api, [39]);
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
                        go.utils.check_fixtures_used(api, [39]);
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
                        go.utils.check_fixtures_used(api, [39]);
                    })
                    .check.reply.ends_session()
                    .run();
            });
        });

    });

});

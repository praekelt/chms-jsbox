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
                    testing_today: '2015-04-03',
                    country_code: '256',  // uganda
                    metric_store: 'chms_uganda_test',  // _env at the end
                    services: {
                        identities: {
                            api_token: 'test_token_identities',
                            url: "http://localhost:8001/api/v1/"
                        },
                        subscriptions: {
                            api_token: 'test_token_subscriptions',
                            url: "http://localhost:8002/api/v1/"
                        }
                    },
                    no_timeout_redirects: [
                        'state_start',
                        'state_end_thank_you',
                    ],
                })
                .setup(function(api) {
                    fixtures().forEach(api.http.fixtures.add);
                })
                .setup(function(api) {
                    api.metrics.stores = {'chms_uganda_test': {}};
                })
                ;
        });

        // TEST TIMEOUTS

        describe.skip("Timeout testing", function() {
            describe("in State Change", function() {
                it("should ask about continuing", function() {
                    return tester
                        .setup.user.addr('0720000111')
                        .inputs(
                            {session_event: 'new'}  // dial in
                            , "3"  // state_permission - change number to manage
                            , "0720000333"  // state_manage_msisdn - unregistered user
                            , "4"  // state_msg_receiver - trusted friend
                            , "3"  // state_last_period_month - may
                            , "22"  // state_last_period_day
                            , {session_event: 'close'}
                            , {session_event: 'new'}
                        )
                        .check.interaction({
                            state: 'state_permission',
                            reply: "Welcome to FamilyConnect. Do you have permission to manage the number 0720000333?"
                        })
                        .run();
                });
            });
            describe("in Registration", function() {
                it("should continue", function() {
                    return tester
                        .setup.user.addr('0720000111')
                        .inputs(
                            {session_event: 'new'}  // dial in
                            , '1'  // state_language - english
                            , {session_event: 'close'}
                            , {session_event: 'new'}
                            , '1'  // state_timed_out - continue
                        )
                        .check.interaction({
                            state: 'state_permission'
                        })
                        .run();
                });
                it("should restart", function() {
                    return tester
                        .setup.user.addr('0720000111')
                        .inputs(
                            {session_event: 'new'}  // dial in
                            , '1'  // state_language - english
                            , {session_event: 'close'}
                            , {session_event: 'new'}
                            , '2'  // state_timed_out - restart
                        )
                        .check.interaction({
                            state: 'state_language'
                        })
                        .run();
                });
                it("should restart", function() {
                    return tester
                        .setup.user.addr('0720000111')
                        .inputs(
                            {session_event: 'new'}  // dial in
                            , '1'  // state_language - english
                            , {session_event: 'close'}
                            , {session_event: 'new'}
                            , '2'  // state_timed_out - restart
                        )
                        .check.interaction({
                            state: 'state_language'
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
                    .run();
            });

            it("complete flow - not the mother", function() {
                return tester
                    .setup.user.addr('0720000222')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , "3"  // state_permission - change number to manage
                        , "0720000333"  // state_manage_msisdn - unregistered user
                        , "4"  // state_msg_receiver - trusted friend
                        , "3"  // state_last_period_month - may
                        , "22"  // state_last_period_day
                        , "1"  // state_hiv_messages - yes
                    )
                    .check.interaction({
                        state: 'state_end_thank_you',
                        reply: "Thank you. Your FamilyConnect ID is 1234567890. You will receive an SMS with it shortly."
                    })
                    .run();
            });
        });

        describe.skip("Change testing", function() {
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
                    .run();
            });
            it("to state_already_baby", function() {
                return tester
                    .setup.user.addr('082333')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , "1"  // state_permission - change number to manage
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
                    .run();
            });
            it("to state_end_general", function() {
                return tester
                    .setup.user.addr('082333')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , "1"  // state_permission - change number to manage
                        , "1"  // state_change_menu - baby
                        , "2"  // state_already_baby - exit
                    )
                    .check.interaction({
                        state: 'state_end_general',
                        reply: "Thank you for using the FamilyConnect service"
                    })
                    .run();
            });
            it("back to state_change_menu", function() {
                return tester
                    .setup.user.addr('082333')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , "1"  // state_permission - change number to manage
                        , "1"  // state_change_menu - baby
                        , "1"  // state_already_baby - back to main menu
                    )
                    .check.interaction({
                        state: 'state_change_menu'
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
                    .run();
            });

            it("to state_change_number", function() {
                return tester
                    .setup.user.addr('0720000222')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , "1"  // state_permission - change number to manage
                        , "3"  // state_change_menu - change number
                    )
                    .check.interaction({
                        state: 'state_change_number',
                        reply: "Please enter the new mobile number you would like to receive weekly messages on. For example 0803304899"
                    })
                    .run();
            });
            it("to state_change_recipient", function() {
                return tester
                    .setup.user.addr('0720000222')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , "1"  // state_permission - change number to manage
                        , "3"  // state_change_menu - change number
                        , "0820020002"  // state_change_number
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
                    .run();
            });
            it("to state_end_recipient", function() {
                return tester
                    .setup.user.addr('0720000222')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , "1"  // state_permission - change number to manage
                        , "3"  // state_change_menu - change number
                        , "0820020002"  // state_change_number
                        , "1"  // state_change_recipient - head of household
                    )
                    .check.interaction({
                        state: 'state_end_recipient',
                        reply: "Thank you. The number which receives messages has been updated."
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
                    .run();
            });
        });

    });

});

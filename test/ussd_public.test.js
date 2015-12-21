var vumigo = require('vumigo_v02');
var fixtures = require('./fixtures');
var AppTester = vumigo.AppTester;
var _ = require('lodash');
var assert = require('assert');

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
                    // registered user 082222
                    api.contacts.add({
                        msisdn: '+082222',
                        extra: {},
                        key: "contact_key_082222",
                        user_account: "contact_user_account"
                    });
                })
                .setup(function(api) {
                    // registered user 082333 - existing baby subscription
                    api.contacts.add({
                        msisdn: '+082333',
                        extra: {},
                        key: "contact_key_082333",
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
                        , '1'  // state_language - english
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
                    .setup.user.addr('082111')
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

        // TEST ROUTING

        describe("Routing testing", function() {
            it("to state_language", function() {
                return tester
                    .setup.user.addr('082111')
                    .inputs(
                        {session_event: 'new'}  // dial in
                    )
                    .check.interaction({
                        state: 'state_language',
                        reply: [
                            "Welcome to FamilyConnect. Please choose your language:",
                            "1. English",
                            "2. Runyakore",
                            "3. Lusoga"
                        ].join('\n')
                    })
                    .run();
            });
            it("to state_permission (via state_language)", function() {
                return tester
                    .setup.user.addr('082111')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , "2"  // state_language - Runyakore
                    )
                    .check.interaction({
                        state: 'state_permission',
                        reply: [
                            "Welcome to FamilyConnect. Do you have permission?",
                            "1. Yes",
                            "2. No",
                            "3. Change the number I'd like to manage"
                        ].join('\n')
                    })
                    .run();
            });
            it("to state_permission (recognised user)", function() {
                return tester
                    .setup.user.addr('082222')
                    .inputs(
                        {session_event: 'new'}  // dial in
                    )
                    .check.interaction({
                        state: 'state_permission',
                        reply: [
                            "Welcome to FamilyConnect. Do you have permission?",
                            "1. Yes",
                            "2. No",
                            "3. Change the number I'd like to manage"
                        ].join('\n')
                    })
                    .run();
            });
            it("to state_manage_msisdn", function() {
                return tester
                    .setup.user.addr('082222')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , "3"  // state_permission - change number to manage
                    )
                    .check.interaction({
                        state: 'state_manage_msisdn',
                        reply: "Please enter the number you would like to manage."
                    })
                    .run();
            });
            it("to state_msg_receiver", function() {
                return tester
                    .setup.user.addr('082222')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , "3"  // state_permission - change number to manage
                        , "0820010001"  // state_manage_msisdn - unregistered user
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
            it("to state_change_menu", function() {
                return tester
                    .setup.user.addr('082222')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , "1"  // state_permission - change number to manage
                    )
                    .check.interaction({
                        state: 'state_change_menu',
                        reply: [
                            "Select:",
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
                    .setup.user.addr('082222')
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
                    .setup.user.addr('082222')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , "3"  // state_permission - change number to manage
                        , "0820010001"  // state_manage_msisdn - unregistered user
                        , "4"  // state_msg_receiver - trusted friend
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
                    .setup.user.addr('082222')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , "3"  // state_permission - change number to manage
                        , "0820010001"  // state_manage_msisdn - unregistered user
                        , "4"  // state_msg_receiver - trusted friend
                        , "3"  // state_last_period_month - may
                    )
                    .check.interaction({
                        state: 'state_last_period_day',
                        reply: "What day did her last period start on? (For example, 12)"
                    })
                    .run();
            });
            it("to state_hiv_messages", function() {
                return tester
                    .setup.user.addr('082222')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , "3"  // state_permission - change number to manage
                        , "0820010001"  // state_manage_msisdn - unregistered user
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
                    .setup.user.addr('082222')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , "3"  // state_permission - change number to manage
                        , "0820010001"  // state_manage_msisdn - unregistered user
                        , "4"  // state_msg_receiver - trusted friend
                        , "3"  // state_last_period_month - may
                        , "22"  // state_last_period_day
                        , "1"  // state_hiv_messages - yes
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
                            "Welcome to FamilyConnect. 's FamilyConnect ID is 7777.  Write it down and give it to the Nurse at your next clinic visit."
                        );
                        assert.equal(sms.to_addr,'082222');
                    })
                    .run();
            });
        });

        describe.only("Change testing", function() {
            it("to state_end_baby", function() {
                return tester
                    .setup.user.addr('082222')
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
                        reply: "Thank you for using the FamilyConnect service."
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
                    .setup.user.addr('082222')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , "1"  // state_permission - change number to manage
                        , "2"  // state_change_menu - change language
                    )
                    .check.interaction({
                        state: 'state_change_language',
                        reply: [
                            "New language?",
                            "1. English",
                            "2. Runyakore",
                            "3. Lusoga"
                        ].join('\n')
                    })
                    .run();
            });
            it("to state_end_language", function() {
                return tester
                    .setup.user.addr('082222')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , "1"  // state_permission - change number to manage
                        , "2"  // state_change_menu - change language
                        , "3"  // state_change_language - Lusoga
                    )
                    .check.interaction({
                        state: 'state_end_language',
                        reply: "New language set."
                    })
                    .run();
            });

            it("to state_change_number", function() {
                return tester
                    .setup.user.addr('082222')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , "1"  // state_permission - change number to manage
                        , "3"  // state_change_menu - change number
                    )
                    .check.interaction({
                        state: 'state_change_number',
                        reply: "New number?"
                    })
                    .run();
            });
            it("to state_change_recipient", function() {
                return tester
                    .setup.user.addr('082222')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , "1"  // state_permission - change number to manage
                        , "3"  // state_change_menu - change number
                        , "0820020002"  // state_change_number
                    )
                    .check.interaction({
                        state: 'state_change_recipient',
                        reply: [
                            "New recipient?",
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
                    .setup.user.addr('082222')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , "1"  // state_permission - change number to manage
                        , "3"  // state_change_menu - change number
                        , "0820020002"  // state_change_number
                        , "1"  // state_change_recipient - head of household
                    )
                    .check.interaction({
                        state: 'state_end_recipient',
                        reply: "New recipient/number set."
                    })
                    .run();
            });

            it("to state_optout_reason", function() {
                return tester
                    .setup.user.addr('082222')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , "1"  // state_permission - change number to manage
                        , "4"  // state_change_menu - optout
                    )
                    .check.interaction({
                        state: 'state_optout_reason',
                        reply: [
                            "Select optout reason:",
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
                    .setup.user.addr('082222')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , "1"  // state_permission - change number to manage
                        , "4"  // state_change_menu - optout
                        , "1"  // state_optout_reason - other
                    )
                    .check.interaction({
                        state: 'state_loss_subscription',
                        reply: [
                            "Do you want loss messages?",
                            "1. Yes",
                            "2. No"
                        ].join('\n')
                    })
                    .run();
            });
            it("to state_end_loss_subscription", function() {
                return tester
                    .setup.user.addr('082222')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , "1"  // state_permission - change number to manage
                        , "4"  // state_change_menu - optout
                        , "1"  // state_optout_reason - other
                        , "1"  // state_loss_subscription - yes
                    )
                    .check.interaction({
                        state: 'state_end_loss_subscription',
                        reply: "Loss messages will be sent."
                    })
                    .run();
            });
            it("to state_end_optout (loss)", function() {
                return tester
                    .setup.user.addr('082222')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , "1"  // state_permission - change number to manage
                        , "4"  // state_change_menu - optout
                        , "1"  // state_optout_reason - other
                        , "2"  // state_loss_subscription - no
                    )
                    .check.interaction({
                        state: 'state_end_optout',
                        reply: "Opted out."
                    })
                    .run();
            });
            it("to state_end_optout (non-loss)", function() {
                return tester
                    .setup.user.addr('082222')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , "1"  // state_permission - change number to manage
                        , "4"  // state_change_menu - optout
                        , "5"  // state_optout_reason - other
                    )
                    .check.interaction({
                        state: 'state_end_optout',
                        reply: "Opted out."
                    })
                    .run();
            });
        });

    });

});

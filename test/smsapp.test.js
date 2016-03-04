var vumigo = require('vumigo_v02');
var fixtures = require('./fixtures');
var AppTester = vumigo.AppTester;
var assert = require('assert');
var optoutstore = require('./optoutstore');
var DummyOptoutResource = optoutstore.DummyOptoutResource;
var _ = require('lodash');

describe("FamilyConnect app", function() {
    describe("for sms use", function() {
        var app;
        var tester;

        beforeEach(function() {
            app = new go.app.GoFC();

            tester = new AppTester(app);

            tester
                .setup.char_limit(160)
                .setup.config.app({
                    name: 'smsapp',
                    testing_today: '2015-04-03',
                    metric_store: 'chms_uganda_test',  // _env at the end
                    services: {
                        identities: {
                            api_token: 'test_token_identities',
                            url: "http://localhost:8001/api/v1/"
                        }
                    },
                    control: {
                        username: 'test_user',
                        api_key: 'test_key',
                        url: "http://127.0.0.1:8000/api/v1/subscription/"
                    }
                })
                .setup(function(api) {
                    api.resources.add(new DummyOptoutResource());
                    api.resources.attach(api);
                })
                .setup(function(api) {
                    api.metrics.stores = {'chms_uganda_test': {}};
                })
                .setup(function(api) {
                    fixtures().forEach(api.http.fixtures.add);
                })
                .setup(function(api) {
                    // registered contact 064001
                    api.contacts.add({
                        msisdn: '+064001',
                        extra: {},
                        key: "contact_key",
                        user_account: "contact_user_account"
                    });
                })
                .setup(function(api) {
                    // registered contact 064003 (opted out contact)
                    api.contacts.add({
                        msisdn: '+064003',
                        extra: {
                            optout_last_attempt: '2015-01-01 01:01:01.111'
                        },
                        key: "contact_key",
                        user_account: "contact_user_account"
                    });
                });
        });


        describe("when the user sends a STOP message", function() {
            it("should opt them out", function() {
                // opt-out functionality is also being tested via fixture 01
                return tester
                    .setup.user.addr('064001')
                    .inputs('"stop" in the name of love')
                    // check navigation
                    .check.interaction({
                        state: 'state_opt_out',
                        reply:
                            'Thank you. You will no longer receive messages from us. Reply START to opt back in.'
                    })
                    // check extras
                    .check(function(api) {
                        var contact = _.find(api.contacts.store, {
                                msisdn: '+064001'
                            });
                        assert.equal(contact.extra.optout_last_attempt, '2015-04-03 12:00:00.000');
                        assert.equal(contact.extra.optin_last_attempt, undefined);
                    })
                    // check metrics
                    .check(function(api) {
                        var metrics = api.metrics.stores.chms_uganda_test;
                        assert.equal(Object.keys(metrics).length, 6);
                        assert.deepEqual(metrics['total.sms.unique_users'].values, [1]);
                        assert.deepEqual(metrics['total.sms.unique_users.transient'].values, [1]);
                        assert.deepEqual(metrics['total.optouts'].values, [1]);
                        assert.deepEqual(metrics['total.optouts.transient'].values, [1]);
                        assert.deepEqual(metrics['total.subscription_unsubscribe_success.last'].values, [1]);
                        assert.deepEqual(metrics['total.subscription_unsubscribe_success.sum'].values, [1]);
                    })
                    // check optout_store
                    .check(function(api) {
                        var optout_store = api.resources.resources.optout.optout_store;
                        assert.deepEqual(optout_store.length, 2);
                    })
                    .run();
            });
        });

        describe("when the user sends a BLOCK message", function() {
            it("should opt them out", function() {
                // opt-out functionality is also being tested via fixture 01
                return tester
                    .setup.user.addr('064001')
                    .inputs('BLOCK')
                    // check navigation
                    .check.interaction({
                        state: 'state_opt_out',
                        reply:
                            'Thank you. You will no longer receive messages from us. Reply START to opt back in.'
                    })
                    // check extras
                    .check(function(api) {
                        var contact = _.find(api.contacts.store, {
                                msisdn: '+064001'
                            });
                        assert.equal(contact.extra.optout_last_attempt, '2015-04-03 12:00:00.000');
                        assert.equal(contact.extra.optin_last_attempt, undefined);
                    })
                    // check metrics
                    .check(function(api) {
                        var metrics = api.metrics.stores.chms_uganda_test;
                        assert.equal(Object.keys(metrics).length, 6);
                        assert.deepEqual(metrics['total.sms.unique_users'].values, [1]);
                        assert.deepEqual(metrics['total.sms.unique_users.transient'].values, [1]);
                        assert.deepEqual(metrics['total.optouts'].values, [1]);
                        assert.deepEqual(metrics['total.optouts.transient'].values, [1]);
                        assert.deepEqual(metrics['total.subscription_unsubscribe_success.last'].values, [1]);
                        assert.deepEqual(metrics['total.subscription_unsubscribe_success.sum'].values, [1]);
                    })
                    // check optout_store
                    .check(function(api) {
                        var optout_store = api.resources.resources.optout.optout_store;
                        assert.deepEqual(optout_store.length, 2);
                    })
                    .run();
            });
        });

        describe("when the user sends a START message", function() {
            it("should opt them in", function() {
                // opt-in functionality is also being tested via fixtures
                return tester
                    .setup.user.addr('064003')
                    .inputs('start')
                    // check navigation
                    .check.interaction({
                        state: 'state_opt_in',
                        reply:
                            'Thank you. You will now receive messages from us again. Reply STOP to unsubscribe.'
                    })
                    // check extras
                    .check(function(api) {
                        var contact = _.find(api.contacts.store, {
                                msisdn: '+064003'
                            });
                        assert.equal(contact.extra.optout_last_attempt, '2015-01-01 01:01:01.111');
                        assert.equal(contact.extra.optin_last_attempt, '2015-04-03 12:00:00.000');
                    })
                    // check metrics
                    .check(function(api) {
                        var metrics = api.metrics.stores.chms_uganda_test;
                        assert.equal(Object.keys(metrics).length, 4);
                        assert.deepEqual(metrics['total.sms.unique_users'].values, [1]);
                        assert.deepEqual(metrics['total.sms.unique_users.transient'].values, [1]);
                        assert.deepEqual(metrics['total.optins'].values, [1]);
                        assert.deepEqual(metrics['total.optins.transient'].values, [1]);
                    })
                    // check optout_store
                    .check(function(api) {
                        var optout_store = api.resources.resources.optout.optout_store;
                        assert.deepEqual(optout_store.length, 0);
                    })
                    .run();
            });
        });

        describe("when the user sends a different message", function() {
            it("should tell them how to opt out", function() {
                return tester
                    .setup.user.addr('064001')
                    .inputs('lhr')
                    // check navigation
                    .check.interaction({
                        state: 'state_unrecognised',
                        reply:
                            'We do not recognise the message you sent us. Reply STOP to unsubscribe.'
                    })
                    // check extras
                    .check(function(api) {
                        var contact = _.find(api.contacts.store, {
                                msisdn: '+064001'
                            });
                        assert.equal(contact.extra.optout_last_attempt, undefined);
                        assert.equal(contact.extra.optin_last_attempt, undefined);
                    })
                    // check metrics
                    .check(function(api) {
                        var metrics = api.metrics.stores.chms_uganda_test;
                        assert.equal(Object.keys(metrics).length, 4);
                        assert.deepEqual(metrics['total.sms.unique_users'].values, [1]);
                        assert.deepEqual(metrics['total.sms.unique_users.transient'].values, [1]);
                        assert.deepEqual(metrics['total.unrecognised_sms'].values, [1]);
                        assert.deepEqual(metrics['total.unrecognised_sms.transient'].values, [1]);
                    })
                    .check(function(api) {
                        var optout_store = api.resources.resources.optout.optout_store;
                        assert.deepEqual(optout_store.length, 1);
                    })
                    .run();
            });
        });

    });
});

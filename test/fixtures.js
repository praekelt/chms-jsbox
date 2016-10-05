// Contact roles
// 0820000111: registered health worker
// 0820000222: unregistered person
// 0820000333: unregistered person (with valid msisdn)
// 0820000444: registered person (with active subscriptions)
// 0820000555: registered person (without active subscriptions)

module.exports = function() {
return [

    // authentication
        // 0: get identity 0820000111 by msisdn (to validate msisdn check)
        {
            'request': {
                'method': 'GET',
                'params': {
                    'details__addresses__msisdn': '+256820000111'
                },
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8001/api/v1/identities/search/',
            },
            'response': {
                "code": 200,
                "data": {
                    "count": 1,
                    "next": null,
                    "previous": null,
                    "results": [{
                        "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-00000082111/",
                        "id": "identity-uuid-00",
                        "version": 1,
                        "details": {
                            "default_addr_type": "msisdn",
                            "personnel_code": "12345",
                            "addresses": {
                                "msisdn": {
                                    "+256820000111": {}
                                }
                            }
                        },
                        "created_at": "2015-07-10T06:13:29.693272Z",
                        "updated_at": "2015-07-10T06:13:29.693298Z"
                    }]
                }
            }
        },

        // 1: get identity 0820000111 by personnel code 12345 (passing personnel_code check st-B))
        {
            'request': {
                'method': 'GET',
                'params': {
                    'details__personnel_code': '12345'
                },
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8001/api/v1/identities/search/',
            },
            'response': {
                "code": 200,
                "data": {
                    "count": 1,
                    "next": null,
                    "previous": null,
                    "results": [{
                        "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-00000082111/",
                        "id": "cb245673-aa41-4302-ac47-00000082111",
                        "version": 1,
                        "details": {
                            "default_addr_type": "msisdn",
                            "addresses": {
                                "msisdn": {
                                    "+256820000111": {}
                                }
                            }
                        },
                        "created_at": "2015-07-10T06:13:29.693272Z",
                        "updated_at": "2015-07-10T06:13:29.693298Z"
                    }]
                }
            }
        },

        // 2: get identity 0820000111 by personnel code aaaaa (failing personnel_code check st-B))
        {
            'request': {
                'method': 'GET',
                'params': {
                    'details__personnel_code': 'aaaaa'
                },
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8001/api/v1/identities/search/',
            },
            'response': {
                "code": 200,
                "data": {
                    "count": 1,
                    "next": null,
                    "previous": null,
                    "results": []
                }
            }
        },

        // 3: get unregistered identity 0820000222 by msisdn
        {
            'repeatable': true,  // enables time-out testing
            'request': {
                'method': 'GET',
                'params': {
                    'details__addresses__msisdn': '+256820000222'
                },
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8001/api/v1/identities/search/',
            },
            'response': {
                "code": 200,
                "data": {
                    "count": 1,
                    "next": null,
                    "previous": null,
                    "results": []
                }
            }
        },

        // 4: create identity 0820000222
        {
            'repeatable': true,  // enables time-out testing
            'request': {
                'method': 'POST',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8001/api/v1/identities/',
                'data':  {
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "+256820000222": {}
                            }
                        }
                    }
                }
            },
            'response': {
                "code": 201,
                "data": {
                    "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-00000082222/",
                    "id": "cb245673-aa41-4302-ac47-00000082222",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "+256820000222": {}
                            }
                        }
                    },
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                }
            }
        },

        // 5: get unregistered identity 0820000333 by msisdn
        {
            'repeatable': true,
            'request': {
                'method': 'GET',
                'params': {
                    'details__addresses__msisdn': '+256820000333'
                },
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8001/api/v1/identities/search/',
            },
            'response': {
                "code": 200,
                "data": {
                    "count": 1,
                    "next": null,
                    "previous": null,
                    "results": []
                }
            }
        },

        // 6: create identity 0820000333
        {
            'repeatable': true,
            'request': {
                'method': 'POST',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8001/api/v1/identities/',
                'data':  {
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "+256820000333": {}
                            }
                        }
                    },
                    "operator": "identity-uuid-00"
                }
            },
            'response': {
                "code": 201,
                "data": {
                    "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-000000000333/",
                    "id": "identity-uuid-06",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "+256820000333": {}
                            }
                        }
                    },
                    "operator": "identity-uuid-00",
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                }
            }
        },

        // 7: get identity 0820000444 by msisdn
        {
            'request': {
                'method': 'GET',
                'params': {
                    'details__addresses__msisdn': '+256820000444'
                },
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8001/api/v1/identities/search/',
            },
            'response': {
                "code": 200,
                "data": {
                    "count": 1,
                    "next": null,
                    "previous": null,
                    "results": [{
                        "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-00000000444/",
                        "id": "cb245673-aa41-4302-ac47-00000000444",
                        "version": 1,
                        "details": {
                            "default_addr_type": "msisdn",
                            "addresses": {
                                "msisdn": {
                                    "+256820000444": {}
                                }
                            }
                        },
                        "created_at": "2015-07-10T06:13:29.693272Z",
                        "updated_at": "2015-07-10T06:13:29.693298Z"
                    }]
                }
            }
        },

        // 8: get identity 0820000444 subscriptions
        {
            'request': {
                'method': 'GET',
                'params': {
                    'active': 'true',
                    'identity': "cb245673-aa41-4302-ac47-00000000444"
                },
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8005/api/v1/subscriptions/',
            },
            'response': {
                "code": 200,
                "data": {
                    "count": 1,
                    "next": null,
                    "previous": null,
                    "results": [{
                        "url": "http://localhost:8005/api/v1/subscriptions/cb245673-aa41-4302-ac47-00000000444/",
                        "id": "cb245673-aa41-4302-ac47-00000000444",
                        "version": 1,
                        "details": {
                            "default_addr_type": "msisdn",
                            "addresses": {
                                "msisdn": {
                                    "+256820000444": {}
                                }
                            }
                        },
                        "created_at": "2015-07-10T06:13:29.693272Z",
                        "updated_at": "2015-07-10T06:13:29.693298Z"
                    }]
                }
            }
        },

        // 9: get identity 0820000555 by msisdn
        {
            'request': {
                'method': 'GET',
                'params': {
                    'details__addresses__msisdn': '+256820000555'
                },
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8001/api/v1/identities/search/',
            },
            'response': {
                "code": 200,
                "data": {
                    "count": 1,
                    "next": null,
                    "previous": null,
                    "results": [{
                        "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-000000000555/",
                        "id": "identity-uuid-09",
                        "version": 1,
                        "details": {
                            "default_addr_type": "msisdn",
                            "addresses": {
                                "msisdn": {
                                    "+256820000555": {}
                                }
                            }
                        },
                        "created_at": "2015-07-10T06:13:29.693272Z",
                        "updated_at": "2015-07-10T06:13:29.693298Z"
                    }]
                }
            }
        },

        // 10: get identity 0820000555 subscriptions (which doesn't exist)
        {
            'request': {
                'method': 'GET',
                'params': {
                    'active': 'true',
                    'identity': "identity-uuid-09"
                },
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8005/api/v1/subscriptions/',
            },
            'response': {
                "code": 200,
                "data": {
                    "count": 1,
                    "next": null,
                    "previous": null,
                    "results": []
                }
            }
        },

        // 11: get identity cb245673-aa41-4302-ac47-000000000333
        {
            'repeatable': true,
            'request': {
                'method': 'GET',
                'params': {},
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-000000000333/",
            },
            'response': {
                "code": 200,
                "data": {
                    "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-000000000333/",
                    "id": "cb245673-aa41-4302-ac47-000000000333",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "+2345059993333": {}
                            }
                        },
                        "health_id": 1234567890
                    },
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                }
            }
        },


    // Optout 064001
        // 12: get subscription 064001
        {
            'request': {
                'method': 'GET',
                'params': {
                    'details__addresses__msisdn': '+064001'
                },
                'headers': {
                    'Authorization': ['Token test_key']
                },
                'url': 'http://localhost:8001/api/v1/subscription/',
            },
            'response': {
                "code": 200,
                "meta": {
                    "limit": 20,
                    "next": null,
                    "offset": 0,
                    "previous": null,
                    "total_count": 2
                },
                "data": [
                    {
                        "url": "http://localhost:8001/api/v1/subscription/1/",
                        "active": false,
                        "completed": false,
                        "contact_key": "contact_key_064001",
                        "created_at": "2014-08-05T11:22:34.838969",
                        "id": 1,
                        "lang": "en",
                        "messageset": 1,
                        "next_sequence_number": 1,
                        "process_status": 0,
                        "schedule": 1,
                        "to_addr": "+064001",
                        "updated_at": "2014-08-05T11:22:34.838996",
                    },
                    {
                        "url": "http://localhost:8001/api/v1/subscription/2/",
                        "active": true,
                        "completed": false,
                        "contact_key": "contact_key_064001",
                        "created_at": "2014-08-05T11:31:50.908974",
                        "id": 2,
                        "lang": "af",
                        "messageset": 1,
                        "next_sequence_number": 1,
                        "process_status": 0,
                        "schedule": 1,
                        "to_addr": "+064001",
                        "updated_at": "2014-08-05T11:31:50.909025",
                    }
                ]
            }
        },

        // 13: patch subscription 064001
        {
            'request': {
                'method': 'PATCH',
                'headers': {
                    'Authorization': ['Token test_key']
                },
                'url': 'http://localhost:8001/api/v1/subscription/2/',
                "data": {
                    "url": "http://localhost:8001/api/v1/subscription/2/",
                    "active": false,
                    "completed": false,
                    "contact_key": "contact_key_064001",
                    "created_at": "2014-08-05T11:31:50.908974",
                    "id": 2,
                    "lang": "af",
                    "messageset": 1,
                    "next_sequence_number": 1,
                    "process_status": 0,
                    "schedule": 1,
                    "to_addr": "+064001",
                    "updated_at": "2014-08-05T11:31:50.909025",
                }
            },
            'response': {
                "code": 200,
                "data": {
                    "success": "true"
                }
            }
        },

        // 14: create identity communicate through 09093333333
        {
            'request': {
                'method': 'POST',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': "http://localhost:8001/api/v1/identities/",
                'data':  {
                    "communicate_through": "cb245673-aa41-4302-ac47-000000000333",
                }
            },
            'response': {
                "code": 201,
                "data": {
                    "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-1234567890/",
                    "id": "cb245673-aa41-4302-ac47-1234567890",
                    "version": 1,
                    "communicate_through": "cb245673-aa41-4302-ac47-000000000333",
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                }
            }
        },

        // 15: create identity communicate through identity-uuid-09
        {
            'request': {
                'method': 'POST',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8001/api/v1/identities/',
                'data':  {
                    "details": {
                        "default_addr_type": null,
                        "addresses": {}
                    },
                    "communicate_through": "identity-uuid-09",
                    "operator": "identity-uuid-00"
                }
            },
            'response': {
                "code": 201,
                "data": {
                    "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-00000082222/",
                    "id": "identity-uuid-15",
                    "version": 1,
                    "details": {
                        "default_addr_type": null,
                        "addresses": {}
                    },
                    "communicate_through": "cb245673-aa41-4302-ac47-000000000555",
                    "operator": "identity-uuid-00",
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                }
            }
        },

        // 16: create identity communicate through cb245673-aa41-4302-ac47-00000000333
        {
            'request': {
                'method': 'POST',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8001/api/v1/identities/',
                'data':  {
                    "details": {
                        "default_addr_type": null,
                        "addresses": {}
                    },
                    "communicate_through": "identity-uuid-06",
                    "operator": "identity-uuid-00"
                }
            },
            'response': {
                "code": 201,
                "data": {
                    "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-00000082222/",
                    "id": "identity-uuid-16",
                    "version": 1,
                    "details": {
                        "default_addr_type": null,
                        "addresses": {}
                    },
                    "communicate_through": "identity-uuid-06",
                    "operator": "identity-uuid-00",
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                }
            }
        },

        // 17: create identity
        {
            'request': {
                'method': 'POST',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8001/api/v1/identities/',
                'data':  {
                    "details": {
                        "default_addr_type": null,
                        "addresses": {}
                    },
                    "operator": "identity-uuid-00"
                }
            },
            'response': {
                "code": 201,
                "data": {
                    "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-00000082222/",
                    "id": "identity-uuid-17",
                    "version": 1,
                    "details": {
                        "default_addr_type": null,
                        "addresses": {}
                    },
                    "operator": "identity-uuid-00",
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                }
            }
        },

        // 18: get identity identity-uuid-16
        {
            'repeatable': true,
            'request': {
                'method': 'GET',
                'params': {},
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                "url": "http://localhost:8001/api/v1/identities/identity-uuid-16/",
            },
            'response': {
                "code": 200,
                "data": {
                    "url": "http://localhost:8001/api/v1/identities/identity-uuid-16/",
                    "id": "identity-uuid-16",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "+2345059993333": {}
                            }
                        },
                        "health_id": 1600000000
                    },
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                }
            }
        },

        // 19: get identity identity-uuid-06
        {
            'repeatable': true,
            'request': {
                'method': 'GET',
                'params': {},
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                "url": "http://localhost:8001/api/v1/identities/identity-uuid-06/",
            },
            'response': {
                "code": 200,
                "data": {
                    "url": "http://localhost:8001/api/v1/identities/identity-uuid-06/",
                    "id": "identity-uuid-06",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "+2345059993333": {}
                            }
                        },
                        "health_id": 6000000000
                    },
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                }
            }
        },

        // 20: create registration 1
        {
            'request': {
                'method': 'POST',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8002/api/v1/registration/',
                'data':  {
                    "stage": "prebirth",
                    "mother_id": "identity-uuid-16",
                    "data": {
                        "hoh_id": "identity-uuid-06",
                        "receiver_id": "identity-uuid-06",
                        "operator_id": "identity-uuid-00",
                        "language": "xog_UG",
                        "msg_type": "text",
                        "last_period_date": "20150421",
                        "msg_receiver": "head_of_household",
                        "hoh_name": "Isaac",
                        "hoh_surname": "Mbire",
                        "mama_name": "Sharon",
                        "mama_surname": "Nalule",
                        "mama_id_type": "ugandan_id",
                        "mama_id_no": "444"
                    }
                }
            },
            'response': {
                "code": 201,
                "data": {}
            }
        },

        // 21: create registration 2
        {
            'request': {
                'method': 'POST',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8002/api/v1/registration/',
                'data':  {
                    "stage": "prebirth",
                    "mother_id": "identity-uuid-06",
                    "data": {
                        "hoh_id": "identity-uuid-17",
                        "receiver_id": "identity-uuid-06",
                        "operator_id": "identity-uuid-00",
                        "language": "xog_UG",
                        "msg_type": "text",
                        "last_period_date": "20150421",
                        "msg_receiver": "mother_to_be",
                        "hoh_name": "Isaac",
                        "hoh_surname": "Mbire",
                        "mama_name": "Mary",
                        "mama_surname": "Nalule",
                        "mama_id_type": "other",
                        "mama_dob": "19820513"
                    }
                }
            },
            'response': {
                "code": 201,
                "data": {}
            }
        },

        // 22: patch identity 1
        {
            'request': {
                'method': 'PATCH',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8001/api/v1/identities/identity-uuid-06/',
                'data':  {
                    "id": "identity-uuid-06",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "+2345059993333": {}
                            }
                        },
                        "health_id": 6000000000,
                        "role": "mother",
                        "msg_receiver": "mother_to_be",
                        "hoh_id": "identity-uuid-17",
                        "preferred_language": "xog_UG",
                        "preferred_msg_type": "text",
                        "first_name": "Mary",
                        "surname": "Nalule",
                        "name": "Mary Nalule",
                        "id_type": "other",
                        "dob": "19820513"
                    },
                }
            },
            'response': {
                "code": 200,
                "data": {}
            }
        },

        // 23: get identity identity-uuid-17
        {
            'repeatable': true,
            'request': {
                'method': 'GET',
                'params': {},
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                "url": "http://localhost:8001/api/v1/identities/identity-uuid-17/",
            },
            'response': {
                "code": 200,
                "data": {
                    "url": "http://localhost:8001/api/v1/identities/identity-uuid-17/",
                    "id": "identity-uuid-17",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "+2345059993333": {}
                            }
                        },
                        "health_id": 6000000000
                    },
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                }
            }
        },

        // 24: patch identity 2
        {
            'request': {
                'method': 'PATCH',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8001/api/v1/identities/identity-uuid-17/',
                'data':  {
                    "id": "identity-uuid-17",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "+2345059993333": {}
                            }
                        },
                        "health_id": 6000000000,
                        "role": "head_of_household",
                        "mother_id": "identity-uuid-06",
                        "preferred_language": "xog_UG",
                        "preferred_msg_type": "text",
                        "first_name": "Isaac",
                        "surname": "Mbire",
                        "name": "Isaac Mbire"
                    },
                }
            },
            'response': {
                "code": 200,
                "data": {}
            }
        },

        // 25: patch identity 3
        {
            'request': {
                'method': 'PATCH',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8001/api/v1/identities/identity-uuid-16/',
                'data':  {
                    "id": "identity-uuid-16",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "+2345059993333": {}
                            }
                        },
                        "health_id": 1600000000,
                        "role": "mother",
                        "hoh_id": "identity-uuid-06",
                        "preferred_language": "xog_UG",
                        "preferred_msg_type": "text",
                        "first_name": "Sharon",
                        "surname": "Nalule",
                        "name": "Sharon Nalule",
                        "id_type": "ugandan_id",
                        "nin": "444",
                        "msg_receiver": "head_of_household"
                    },
                }
            },
            'response': {
                "code": 200,
                "data": {}
            }
        },

        // 26: patch identity 4
        {
            'request': {
                'method': 'PATCH',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8001/api/v1/identities/identity-uuid-06/',
                'data':  {
                    "id": "identity-uuid-06",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "+2345059993333": {}
                            }
                        },
                        "health_id": 6000000000,
                        "role": "head_of_household",
                        "mother_id": "identity-uuid-16",
                        "preferred_language": "xog_UG",
                        "preferred_msg_type": "text",
                        "first_name": "Isaac",
                        "surname": "Mbire",
                        "name": "Isaac Mbire"
                    },
                }
            },
            'response': {
                "code": 200,
                "data": {}
            }
        },

        // 27: create registration 2
        {
            'request': {
                'method': 'POST',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8002/api/v1/registration/',
                'data':  {
                    "stage": "prebirth",
                    "mother_id": "identity-uuid-16",
                    "data": {
                        "hoh_id": "identity-uuid-17",
                        "receiver_id": "identity-uuid-06",
                        "operator_id": "identity-uuid-00",
                        "language": "xog_UG",
                        "msg_type": "text",
                        "last_period_date": "20150421",
                        "msg_receiver": "trusted_friend",
                        "hoh_name": "Isaac",
                        "hoh_surname": "Mbire",
                        "mama_name": "Mary",
                        "mama_surname": "Nalule",
                        "mama_id_type": "other",
                        "mama_dob": "19820513"
                    }
                }
            },
            'response': {
                "code": 201,
                "data": {}
            }
        },

        // 28: patch identity 5
        {
            'request': {
                'method': 'PATCH',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8001/api/v1/identities/identity-uuid-16/',
                'data':  {
                    "id": "identity-uuid-16",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "+2345059993333": {}
                            }
                        },
                        "health_id": 1600000000,
                        "msg_receiver": "trusted_friend",
                        "role": "mother",
                        "hoh_id": "identity-uuid-17",
                        "preferred_language": "xog_UG",
                        "preferred_msg_type": "text",
                        "first_name": "Mary",
                        "surname": "Nalule",
                        "name": "Mary Nalule",
                        "id_type": "other",
                        "dob": "19820513"
                    },
                }
            },
            'response': {
                "code": 200,
                "data": {}
            }
        },

        // 29: patch identity 6
        {
            'request': {
                'method': 'PATCH',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8001/api/v1/identities/identity-uuid-17/',
                'data':  {
                    "id": "identity-uuid-17",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "+2345059993333": {}
                            }
                        },
                        "health_id": 6000000000,
                        "role": "head_of_household",
                        "mother_id": "identity-uuid-16",
                        "preferred_language": "xog_UG",
                        "preferred_msg_type": "text",
                        "first_name": "Isaac",
                        "surname": "Mbire",
                        "name": "Isaac Mbire"
                    },
                }
            },
            'response': {
                "code": 200,
                "data": {}
            }
        },

        // 30: patch identity 7
        {
            'request': {
                'method': 'PATCH',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8001/api/v1/identities/identity-uuid-06/',
                'data':  {
                    "id": "identity-uuid-06",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "+2345059993333": {}
                            }
                        },
                        "health_id": 6000000000,
                        "role": "trusted_friend",
                        "mother_id": "identity-uuid-16",
                        "preferred_language": "xog_UG",
                        "preferred_msg_type": "text"
                    },
                }
            },
            'response': {
                "code": 200,
                "data": {}
            }
        },


];
};

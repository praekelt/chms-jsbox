// Contact roles
// 082111: registered health worker
// 082222: unregistered person

module.exports = function() {
return [

    // authentication
        // get contact 082111 by msisdn (to validate msisdn check & personnel_code check st-B))
        {
            'request': {
                'method': 'GET',
                'params': {
                    'details__addresses__msisdn': '+25682111'
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
                        "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-00000000001/",
                        "id": "cb245673-aa41-4302-ac47-00000000001",
                        "version": 1,
                        "details": {
                            "default_addr_type": "msisdn",
                            "personnel_code": "12345",
                            "addresses": {
                                "msisdn": {
                                    "+25682111": {}
                                }
                            }
                        },
                        "created_at": "2015-07-10T06:13:29.693272Z",
                        "updated_at": "2015-07-10T06:13:29.693298Z"
                    }]
                }
            }
        },

        // get contact 082111 by msisdn (passing personnel_code check st-B))
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
                        "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-00000000001/",
                        "id": "cb245673-aa41-4302-ac47-00000000001",
                        "version": 1,
                        "details": {
                            "default_addr_type": "msisdn",
                            "addresses": {
                                "msisdn": {
                                    "+25682111": {}
                                }
                            }
                        },
                        "created_at": "2015-07-10T06:13:29.693272Z",
                        "updated_at": "2015-07-10T06:13:29.693298Z"
                    }]
                }
            }
        },

        // get contact 082111 by msisdn (failing personnel_code check st-B))
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


    // time-out testing
        // get unregistered contact 082222 by msisdn
        {
            'repeatable': true,  // enables time-out testing
            'request': {
                'method': 'GET',
                'params': {
                    'details__addresses__msisdn': '+25682222'
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

        // post
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
                                "+25682222": {}
                            }
                        }
                    }
                }
            },
            'response': {
                "code": 201,
                "data": {
                    "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-00000000002/",
                    "id": "cb245673-aa41-4302-ac47-00000000002",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "+25682222": {}
                            }
                        }
                    },
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                }
            }
        },

    // Optout 064001
        // #get #subscription #064001
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
                        "messageset_id": 1,
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
                        "messageset_id": 1,
                        "next_sequence_number": 1,
                        "process_status": 0,
                        "schedule": 1,
                        "to_addr": "+064001",
                        "updated_at": "2014-08-05T11:31:50.909025",
                    }
                ]
            }
        },
        // #patch #subscription #064001
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
                    "messageset_id": 1,
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
];
};

// Contact roles
// 0720000111: heretofore unseen number
// 0720000222: registered user - mother, lusoga, sms
// 0720000333: unregistered user - number entered manually

module.exports = function() {
return [

    // 0: get identity 0720000111 by msisdn - no results
    {
        'repeatable': true,
        'request': {
            'method': 'GET',
            'params': {
                'details__addresses__msisdn': '+256720000111'
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
                "count": 0,
                "next": null,
                "previous": null,
                "results": []
            }
        }
    },

    // 1: create identity 0720000111
    {
        'repeatable': true,
        'request': {
            'method': 'POST',
            'headers': {
                'Authorization': ['Token test_key'],
                'Content-Type': ['application/json']
            },
            'url': "http://localhost:8001/api/v1/identities/",
            'data': {
                "details": {
                    "default_addr_type": "msisdn",
                    "addresses": {
                        "msisdn": {
                            "+256720000111": {}
                        }
                    }
                }
            }
        },
        'response': {
            "code": 201,
            "data": {
                "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-0000000111/",
                "id": "cb245673-aa41-4302-ac47-0000000111",
                "version": 1,
                "details": {
                    "default_addr_type": "msisdn",
                    "addresses": {
                        "msisdn": {
                            "+256720000111": {}
                        }
                    }
                },
                "operator": null,
                "created_at": "2015-07-10T06:13:29.693272Z",
                "updated_at": "2015-07-10T06:13:29.693298Z"
            }
        }
    },

    // 2: get identity 0720000222 by msisdn
    {
        'repeatable': true,
        'request': {
            'method': 'GET',
            'params': {
                'details__addresses__msisdn': '+256720000222'
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
                    "url": "http://localhost:8001/api/v1/identities/3f7c8851-5204-43f7-af7f-000000000222/",
                    "id": "3f7c8851-5204-43f7-af7f-000000000222",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "+256720000222": {}
                            }
                        },
                        "role": "mother",
                        "preferred_msg_type": "sms",
                        "preferred_language": "lusoga"
                    },
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                }]
            }
        }
    },

    // 3: get identity 0720000333 by msisdn - no results
    {
        'repeatable': true,
        'request': {
            'method': 'GET',
            'params': {
                'details__addresses__msisdn': '+256720000333'
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
                "count": 0,
                "next": null,
                "previous": null,
                "results": []
            }
        }
    },

    // 4: create identity 0720000333
    {
        'repeatable': true,
        'request': {
            'method': 'POST',
            'headers': {
                'Authorization': ['Token test_key'],
                'Content-Type': ['application/json']
            },
            'url': "http://localhost:8001/api/v1/identities/",
            'data': {
                "details": {
                    "default_addr_type": "msisdn",
                    "addresses": {
                        "msisdn": {
                            "+256720000333": {}
                        }
                    }
                }
            }
        },
        'response': {
            "code": 201,
            "data": {
                "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-0000000333/",
                "id": "cb245673-aa41-4302-ac47-0000000333",
                "version": 1,
                "details": {
                    "default_addr_type": "msisdn",
                    "addresses": {
                        "msisdn": {
                            "+256720000333": {}
                        }
                    }
                },
                "operator": null,
                "created_at": "2015-07-10T06:13:29.693272Z",
                "updated_at": "2015-07-10T06:13:29.693298Z"
            }
        }
    },

    // 5: get identity cb245673-aa41-4302-ac47-0000000333
    {
        'request': {
            'method': 'GET',
            'params': {},
            'headers': {
                'Authorization': ['Token test_key'],
                'Content-Type': ['application/json']
            },
            'url': "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-0000000333/",
        },
        'response': {
            "code": 200,
            "data": {
                "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-0000000333/",
                "id": "cb245673-aa41-4302-ac47-0000000333",
                "version": 1,
                "details": {
                    "default_addr_type": "msisdn",
                    "addresses": {
                        "msisdn": {
                            "+256720000222": {}
                        }
                    },
                    "health_id": 1234567890
                },
                "created_at": "2015-07-10T06:13:29.693272Z",
                "updated_at": "2015-07-10T06:13:29.693298Z"
            }
        }
    },

    // 6: create identity
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
                    "default_addr_type": null,
                    "addresses": {}
                },
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
                "created_at": "2015-07-10T06:13:29.693272Z",
                "updated_at": "2015-07-10T06:13:29.693298Z"
            }
        }
    },

    // 7: create registration
    {
        'request': {
            'method': 'POST',
            'headers': {
                'Authorization': ['Token test_key'],
                'Content-Type': ['application/json']
            },
            'url': 'http://localhost:8002/api/v1/registrations/',
            'data':  {
                "stage": "prebirth",
                "mother_id": "identity-uuid-17",
                "data": {
                    "hoh_id": "identity-uuid-17",
                    "msg_type": "text",
                    "msg_receiver": "trusted_friend",
                }
            }
        },
        'response': {
            "code": 201,
            "data": {}
        }
    },

    // 8: get identity identity-uuid-17
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
                    "addresses": {},
                },
                "created_at": "2015-07-10T06:13:29.693272Z",
                "updated_at": "2015-07-10T06:13:29.693298Z"
            }
        }
    },

];
};

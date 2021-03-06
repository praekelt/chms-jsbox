// Contact roles
// 0720000111: heretofore unseen number
// 0720000222: registered user - mother, english, sms
// 0720000333: unregistered user - number entered manually
// 0720000444: change number - new number
// 0720000555: unregistered user - number entered manually - mother_to_be registration
// 0720000666: registered user - has baby(postbirth) subscription
// 0720000777: registered user - servicerating_unanswered flag set to true
// 0720000888: registered user - previously optedout
// 0720000999: registered VHT with personnel code and parish

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
                        "preferred_language": "eng_UG",
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
                },
                "created_at": "2015-07-10T06:13:29.693272Z",
                "updated_at": "2015-07-10T06:13:29.693298Z"
            }
        }
    },

    // 6: create identity 06
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
                "id": "identity-uuid-06",
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
            'url': 'http://localhost:8002/api/v1/registration/',
            'data':  {
                "stage": "prebirth",
                "mother_id": "identity-uuid-06",
                "data": {
                    "hoh_id": "identity-uuid-06",
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

    // 8: get identity identity-uuid-06
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
                    "addresses": {},
                },
                "created_at": "2015-07-10T06:13:29.693272Z",
                "updated_at": "2015-07-10T06:13:29.693298Z"
            }
        }
    },

    // 9: create identity 09
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
                "communicate_through": "cb245673-aa41-4302-ac47-0000000333",
            }
        },
        'response': {
            "code": 201,
            "data": {
                "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-00000082222/",
                "id": "identity-uuid-09",
                "version": 1,
                "details": {
                    "default_addr_type": null,
                    "addresses": {}
                },
                "communicate_through": "cb245673-aa41-4302-ac47-0000000333",
                "created_at": "2015-07-10T06:13:29.693272Z",
                "updated_at": "2015-07-10T06:13:29.693298Z"
            }
        }
    },

    // 10: get identity identity-uuid-09
    {
        'repeatable': true,
        'request': {
            'method': 'GET',
            'params': {},
            'headers': {
                'Authorization': ['Token test_key'],
                'Content-Type': ['application/json']
            },
            "url": "http://localhost:8001/api/v1/identities/identity-uuid-09/",
        },
        'response': {
            "code": 200,
            "data": {
                "url": "http://localhost:8001/api/v1/identities/identity-uuid-09/",
                "id": "identity-uuid-09",
                "version": 1,
                "details": {
                    "default_addr_type": "msisdn",
                    "addresses": {},
                    "health_id": 9999999999,
                },
                "communicate_through": "cb245673-aa41-4302-ac47-0000000333",
                "created_at": "2015-07-10T06:13:29.693272Z",
                "updated_at": "2015-07-10T06:13:29.693298Z"
            }
        }
    },

    // 11: create identity 11
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
                "communicate_through": "cb245673-aa41-4302-ac47-0000000111",
            }
        },
        'response': {
            "code": 201,
            "data": {
                "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-00000082222/",
                "id": "identity-uuid-09",
                "version": 1,
                "details": {
                    "default_addr_type": null,
                    "addresses": {}
                },
                "communicate_through": "cb245673-aa41-4302-ac47-0000000111",
                "created_at": "2015-07-10T06:13:29.693272Z",
                "updated_at": "2015-07-10T06:13:29.693298Z"
            }
        }
    },

    // 12: create registration 1
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
                "mother_id": "identity-uuid-09",
                "data": {
                    "hoh_id": "identity-uuid-06",
                    "receiver_id": "cb245673-aa41-4302-ac47-0000000333",
                    "operator_id": null,
                    "language": "eng_UG",
                    "msg_type": "text",
                    "last_period_date": "20150222",
                    "msg_receiver": "trusted_friend"
                }
            }
        },
        'response': {
            "code": 201,
            "data": {}
        }
    },

    // 13: patch identity 09
    {
        'request': {
            'method': 'PATCH',
            'headers': {
                'Authorization': ['Token test_key'],
                'Content-Type': ['application/json']
            },
            'url': 'http://localhost:8001/api/v1/identities/identity-uuid-09/',
            'data':  {
                "id": "identity-uuid-09",
                "version": 1,
                "details": {
                    "default_addr_type": "msisdn",
                    "addresses": {},
                    "health_id": 9999999999,
                    "msg_receiver": "trusted_friend",
                    "role": "mother",
                    "hoh_id": "identity-uuid-06",
                    "preferred_msg_type": "text",
                    "hiv_interest": "yes_hiv_msgs"
                },
                "communicate_through": "cb245673-aa41-4302-ac47-0000000333"
            }
        },
        'response': {
            "code": 200,
            "data": {}
        }
    },

    // 14: patch identity 06
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
                    "addresses": {},
                    "role": "head_of_household",
                    "mother_id": "identity-uuid-09",
                    "preferred_msg_type": "text"
                }
            }
        },
        'response': {
            "code": 200,
            "data": {}
        }
    },

    // 15: patch identity 000333
    {
        'request': {
            'method': 'PATCH',
            'headers': {
                'Authorization': ['Token test_key'],
                'Content-Type': ['application/json']
            },
            'url': 'http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-0000000333/',
            'data':  {
                "id": "cb245673-aa41-4302-ac47-0000000333",
                "version": 1,
                "details": {
                    "default_addr_type": "msisdn",
                    "addresses": {
                        "msisdn": {
                            "+256720000222": {}
                        }
                    },
                    "role": "trusted_friend",
                    "mother_id": "identity-uuid-09",
                    "preferred_msg_type": "text"
                }
            }
        },
        'response': {
            "code": 200,
            "data": {}
        }
    },

    // 16: get identity 0720000555 by msisdn - no results
    {
        'repeatable': true,
        'request': {
            'method': 'GET',
            'params': {
                'details__addresses__msisdn': '+256720000555'
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

    // 17: create identity 0720000555
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
                            "+256720000555": {}
                        }
                    }
                }
            }
        },
        'response': {
            "code": 201,
            "data": {
                "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-0000000555/",
                "id": "cb245673-aa41-4302-ac47-0000000555",
                "version": 1,
                "details": {
                    "default_addr_type": "msisdn",
                    "addresses": {
                        "msisdn": {
                            "+256720000555": {}
                        }
                    }
                },
                "operator": null,
                "created_at": "2015-07-10T06:13:29.693272Z",
                "updated_at": "2015-07-10T06:13:29.693298Z"
            }
        }
    },

    // 18: get identity cb245673-aa41-4302-ac47-0000000555
    {
        'repeatable': true,  // second time gets the health_id
        'request': {
            'method': 'GET',
            'params': {},
            'headers': {
                'Authorization': ['Token test_key'],
                'Content-Type': ['application/json']
            },
            'url': "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-0000000555/",
        },
        'response': {
            "code": 200,
            "data": {
                "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-0000000555/",
                "id": "cb245673-aa41-4302-ac47-0000000555",
                "version": 1,
                "details": {
                    "default_addr_type": "msisdn",
                    "addresses": {
                        "msisdn": {
                            "+256720000555": {}
                        }
                    },
                    "health_id": 5555555555,
                },
                "created_at": "2015-07-10T06:13:29.693272Z",
                "updated_at": "2015-07-10T06:13:29.693298Z"
            }
        }
    },

    // 19: create registration 2
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
                "mother_id": "cb245673-aa41-4302-ac47-0000000555",
                "data": {
                    "hoh_id": "identity-uuid-06",
                    "receiver_id": "cb245673-aa41-4302-ac47-0000000555",
                    "operator_id": null,
                    "language": "eng_UG",
                    "msg_type": "text",
                    "last_period_date": "20150222",
                    "msg_receiver": "mother_to_be",
                    "parish": "Kawaaga",
                    "vht_id": "3f7c8851-5204-43f7-af7f-000000000999"
                }
            }
        },
        'response': {
            "code": 201,
            "data": {}
        }
    },

    // 20: patch identity 555
    {
        'request': {
            'method': 'PATCH',
            'headers': {
                'Authorization': ['Token test_key'],
                'Content-Type': ['application/json']
            },
            'url': 'http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-0000000555/',
            'data':  {
                "id": "cb245673-aa41-4302-ac47-0000000555",
                "version": 1,
                "details": {
                    "default_addr_type": "msisdn",
                    "addresses": {
                        "msisdn": {
                            "+256720000555": {}
                        }
                    },
                    "health_id": 5555555555,
                    "msg_receiver": "mother_to_be",
                    "role": "mother",
                    "hoh_id": "identity-uuid-06",
                    "preferred_msg_type": "text"
                }
            }
        },
        'response': {
            "code": 200,
            "data": {}
        }
    },

    // 21: patch identity 06
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
                    "addresses": {},
                    "role": "head_of_household",
                    "mother_id": "cb245673-aa41-4302-ac47-0000000555",
                    "preferred_msg_type": "text"
                }
            }
        },
        'response': {
            "code": 200,
            "data": {}
        }
    },

    // 22: get identity 3f7c8851-5204-43f7-af7f-000000000222
    {
        'request': {
            'method': 'GET',
            'params': {},
            'headers': {
                'Authorization': ['Token test_key'],
                'Content-Type': ['application/json']
            },
            'url': "http://localhost:8001/api/v1/identities/3f7c8851-5204-43f7-af7f-000000000222/",
        },
        'response': {
            "code": 200,
            "data": {
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
                    "health_id": 1234567890
                },
                "created_at": "2015-07-10T06:13:29.693272Z",
                "updated_at": "2015-07-10T06:13:29.693298Z"
            }
        }
    },

    // 23: patch identity 3f7c8851-5204-43f7-af7f-000000000222
    {
        'request': {
            'method': 'PATCH',
            'params': {},
            'headers': {
                'Authorization': ['Token test_key'],
                'Content-Type': ['application/json']
            },
            'url': 'http://localhost:8001/api/v1/identities/3f7c8851-5204-43f7-af7f-000000000222/',
            'data': {
                "id": "3f7c8851-5204-43f7-af7f-000000000222",
                "version": 1,
                "details": {
                    "default_addr_type": "msisdn",
                    "addresses": {
                        "msisdn": {
                            "+256720000111": {}
                        }
                    },
                    "health_id": 1234567890,
                },
            }

        },
        'response': {
            "code": 200,
            "data": {
                "url": "http://localhost:8001/api/v1/identities/3f7c8851-5204-43f7-af7f-000000000222/",
                "id": "3f7c8851-5204-43f7-af7f-000000000222",
                "version": 1,
                "details": {
                    "default_addr_type": "msisdn",
                    "addresses": {
                        "msisdn": {
                            "+256720000111": {}
                        }
                    },
                    "health_id": 1234567890,
                    "role": "mother"
                },
                "created_at": "2015-07-10T06:13:29.693272Z",
                "updated_at": "2015-07-10T06:13:29.693298Z"
            }
        }
    },

    // 24: get identity 0720000444 by msisdn
    {
        'repeatable': true,
        'request': {
            'method': 'GET',
            'params': {
                'details__addresses__msisdn': '+256720000444'
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
                    "url": "http://localhost:8001/api/v1/identities/3f7c8851-5204-43f7-af7f-000000000444/",
                    "id": "3f7c8851-5204-43f7-af7f-000000000444",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "+256720000444": {}
                            }
                        },
                        "role": "mother"
                    },
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                }]
            }
        }
    },

    // 25: patch identity 3f7c8851-5204-43f7-af7f-000000000222
    {
        'request': {
            'method': 'PATCH',
            'params': {},
            'headers': {
                'Authorization': ['Token test_key'],
                'Content-Type': ['application/json']
            },
            'url': 'http://localhost:8001/api/v1/identities/3f7c8851-5204-43f7-af7f-000000000222/',
            'data': {
                "id": "3f7c8851-5204-43f7-af7f-000000000222",
                "version": 1,
                "details": {
                    "default_addr_type": "msisdn",
                    "addresses": {
                        "msisdn": {
                            "+256720000444": {}
                        }
                    },
                    "health_id": 1234567890,
                },
            }

        },
        'response': {
            "code": 200,
            "data": {
                "url": "http://localhost:8001/api/v1/identities/3f7c8851-5204-43f7-af7f-000000000222/",
                "id": "3f7c8851-5204-43f7-af7f-000000000222",
                "version": 1,
                "details": {
                    "default_addr_type": "msisdn",
                    "addresses": {
                        "msisdn": {
                            "+256720000111": {}
                        }
                    },
                    "health_id": 1234567890,
                    "role": "mother"
                },
                "created_at": "2015-07-10T06:13:29.693272Z",
                "updated_at": "2015-07-10T06:13:29.693298Z"
            }
        }
    },

    // 26: get subscriptions for 000222
    {
        'request': {
            'method': 'GET',
            'params': {
                'active': 'true',
                'identity': '3f7c8851-5204-43f7-af7f-000000000222'
            },
            'headers': {
                'Authorization': ['Token test_key'],
                'Content-Type': ['application/json']
            },
            'url': "http://localhost:8005/api/v1/subscriptions/",
        },
        'response': {
                "code": 200,
                "data": {
                    "count": 1,
                    "next": null,
                    "previous": null,
                    "results": [
                        {
                            'url': 'http://localhost:8005/api/v1/subscriptions/3f7c8851-5204-43f7-af7f-000000000222',
                            'id': '51fcca25-2e85-4c44-subscription-2222',
                            'version': 1,
                            'identity': '3f7c8851-5204-43f7-af7f-000000000222',
                            'messageset': 1,
                            'next_sequence_number': 1,
                            'lang': "eng_NG",
                            'active': true,
                            'completed': false,
                            'schedule': 1,
                            'process_status': 0,
                            'metadata': {},
                            'created_at': "2015-07-10T06:13:29.693272Z",
                            'updated_at': "2015-07-10T06:13:29.693272Z"
                        }
                    ]
                }
            },
        'repeatable': true
    },

    // 27: get messageset 1
    {
        'request': {
            'method': 'GET',
            'params': {},
            'headers': {
                'Authorization': ['Token test_key'],
                'Content-Type': ['application/json']
            },
            'url': 'http://localhost:8005/api/v1/messageset/1/'
        },
        'response': {
            'code': 200,
            'data': {
                'id': 1,
                'short_name': 'prebirth.mother.hw_full',
                'notes': null,
                'next_set': 2,
                'default_schedule': 1,
                'content_type': 'text',
                'created_at': "2015-07-10T06:13:29.693272Z",
                'updated_at': "2015-07-10T06:13:29.693272Z"
            }
        },
        'repeatable': true
    },

    // 28: Change to baby - 2222
    {
        'request': {
            'method': 'POST',
            'headers': {
                'Authorization': ['Token test_key'],
                'Content-Type': ['application/json']
            },
            'url': 'http://localhost:8002/api/v1/change/',
            'data': {
                "mother_id": "3f7c8851-5204-43f7-af7f-000000000222",
                "action": "change_baby",
                "data": {}
            }
        },
        'response': {
            'code': 201,
            'data': {
                'id': 1
            }
        },
        'repeatable': true
    },

    // 29: get identity 0720000555 by msisdn
    {
        'repeatable': true,
        'request': {
            'method': 'GET',
            'params': {
                'details__addresses__msisdn': '+256720000666'
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
                "results": [{
                    "url": "http://localhost:8001/api/v1/identities/3f7c8851-5204-43f7-af7f-000000000666/",
                    "id": "3f7c8851-5204-43f7-af7f-000000000666",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "+256720000666": {}
                            }
                        },
                        "role": "mother",
                        "preferred_msg_type": "text",
                        "preferred_language": "eng_UG"
                    },
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                }]
            }
        }
    },

    // 30: get subscriptions for 000666
    {
        'request': {
            'method': 'GET',
            'params': {
                'active': 'true',
                'identity': '3f7c8851-5204-43f7-af7f-000000000666'
            },
            'headers': {
                'Authorization': ['Token test_key'],
                'Content-Type': ['application/json']
            },
            'url': "http://localhost:8005/api/v1/subscriptions/",
        },
        'response': {
                "code": 200,
                "data": {
                    "count": 1,
                    "next": null,
                    "previous": null,
                    "results": [
                        {
                            'url': 'http://localhost:8005/api/v1/subscriptions/3f7c8851-5204-43f7-af7f-000000000666',
                            'id': '51fcca25-2e85-4c44-subscription-0666',
                            'version': 1,
                            'identity': '3f7c8851-5204-43f7-af7f-000000000666',
                            'messageset': 2,
                            'next_sequence_number': 1,
                            'lang': "eng_NG",
                            'active': true,
                            'completed': false,
                            'schedule': 1,
                            'process_status': 0,
                            'metadata': {},
                            'created_at': "2015-07-10T06:13:29.693272Z",
                            'updated_at': "2015-07-10T06:13:29.693272Z"
                        }
                    ]
                }
            }
    },

    // 31: get messageset 2
    {
        'request': {
            'method': 'GET',
            'params': {},
            'headers': {
                'Authorization': ['Token test_key'],
                'Content-Type': ['application/json']
            },
            'url': 'http://localhost:8005/api/v1/messageset/2/'
        },
        'response': {
            'code': 200,
            'data': {
                'id': 2,
                'short_name': 'postbirth.mother.hw_full',
                'notes': null,
                'next_set': null,
                'default_schedule': 1,
                'content_type': 'text',
                'created_at': "2015-07-10T06:13:29.693272Z",
                'updated_at': "2015-07-10T06:13:29.693272Z"
            }
        }
    },

    // 32: Change language - 000222
    {
        'request': {
            'method': 'POST',
            'headers': {
                'Authorization': ['Token test_key'],
                'Content-Type': ['application/json']
            },
            'url': 'http://localhost:8002/api/v1/change/',
            'data': {
                "mother_id": "3f7c8851-5204-43f7-af7f-000000000222",
                "action": "change_language",
                "data": {
                    "new_language": "cgg_UG"
                }
            }
        },
        'response': {
            'code': 201,
            'data': {
                'id': 1
            }
        }
    },

    // 33: patch identity 3f7c8851-5204-43f7-af7f-000000000222
    {
        'request': {
            'method': 'PATCH',
            'params': {},
            'headers': {
                'Authorization': ['Token test_key'],
                'Content-Type': ['application/json']
            },
            'url': 'http://localhost:8001/api/v1/identities/3f7c8851-5204-43f7-af7f-000000000222/',
            'data': {
                "id": "3f7c8851-5204-43f7-af7f-000000000222",
                "version": 1,
                "details": {
                    "default_addr_type": "msisdn",
                    "addresses": {
                        "msisdn": {
                            "+256720000222": {}
                        }
                    },
                    "health_id": 1234567890,
                    "preferred_language": "cgg_UG"
                }
            }

        },
        'response': {
            "code": 200,
            "data": {}
        }
    },

    // 34: Change to loss - 000222
    {
        'request': {
            'method': 'POST',
            'headers': {
                'Authorization': ['Token test_key'],
                'Content-Type': ['application/json']
            },
            'url': 'http://localhost:8002/api/v1/change/',
            'data': {
                "mother_id": "3f7c8851-5204-43f7-af7f-000000000222",
                "action": "change_loss",
                "data": {
                    "reason": "miscarriage"
                }
            }
        },
        'response': {
            'code': 201,
            'data': {
                'id': 1
            }
        }
    },

    // 35: Unsubscribe 000222
    {
        'request': {
            'method': 'POST',
            'headers': {
                'Authorization': ['Token test_key'],
                'Content-Type': ['application/json']
            },
            'url': 'http://localhost:8002/api/v1/change/',
            'data': {
                "mother_id": "3f7c8851-5204-43f7-af7f-000000000222",
                "action": "unsubscribe",
                "data": {
                    "reason": "miscarriage"
                }
            }
        },
        'response': {
            'code': 201,
            'data': {
                'id': 1
            }
        }
    },

    // 36: Unsubscribe 000222
    {
        'request': {
            'method': 'POST',
            'headers': {
                'Authorization': ['Token test_key'],
                'Content-Type': ['application/json']
            },
            'url': 'http://localhost:8002/api/v1/change/',
            'data': {
                "mother_id": "3f7c8851-5204-43f7-af7f-000000000222",
                "action": "unsubscribe",
                "data": {
                    "reason": "other"
                }
            }
        },
        'response': {
            'code': 201,
            'data': {
                'id': 1
            }
        }
    },

    // 37: Optout 000222
    {
        'request': {
            'method': 'POST',
            'headers': {
                'Authorization': ['Token test_key'],
                'Content-Type': ['application/json']
            },
            'url': 'http://localhost:8001/api/v1/optout/',
            'data': {
                "optout_type": "stop",
                "identity": "3f7c8851-5204-43f7-af7f-000000000222",
                "reason": "miscarriage",
                "address_type": "msisdn",
                "address": "+256720000222",
                "request_source": "ussd_public",
                "requestor_source_id": "0170b7bb-978e-4b8a-35d2-662af5b6daee"
            }
        },
        'response': {
            'code': 201,
            'data': {
                'id': 1
            }
        }
    },

    // 38: Optout 000222
    {
        'request': {
            'method': 'POST',
            'headers': {
                'Authorization': ['Token test_key'],
                'Content-Type': ['application/json']
            },
            'url': 'http://localhost:8001/api/v1/optout/',
            'data': {
                "optout_type": "stop",
                "identity": "3f7c8851-5204-43f7-af7f-000000000222",
                "reason": "other",
                "address_type": "msisdn",
                "address": "+256720000222",
                "request_source": "ussd_public",
                "requestor_source_id": "0170b7bb-978e-4b8a-35d2-662af5b6daee"
            }
        },
        'response': {
            'code': 201,
            'data': {
                'id': 1
            }
        }
    },

    // 39: get identity 0720000777 by msisdn
    {
        'repeatable': true,
        'request': {
            'method': 'GET',
            'params': {
                'details__addresses__msisdn': '+256720000777'
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
                    "url": "http://localhost:8001/api/v1/identities/3f7c8851-5204-43f7-af7f-000000000777/",
                    "id": "3f7c8851-5204-43f7-af7f-000000000777",
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
                        "preferred_language": "eng_UG",
                    },
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                }]
            }
        }
    },

    // 40: save servicerating question 1 feedback - 0007777
    {
        'request': {
            'method': 'POST',
            'headers': {
                'Authorization': ['Token test_key'],
                'Content-Type': ['application/json']
            },
            'url': 'http://localhost:8006/api/v1/rating/',
            'data': {
                "identity": "3f7c8851-5204-43f7-af7f-000000000777",
                "invite": "1b47bab8-1c37-44a2-94e6-85c3ee9a8c8b",
                "version": 1,
                "question_id": 1,
                "question_text": "Welcome. When you signed up, were staff at the facility friendly & helpful?",
                "answer_text": "Satisfied",
                "answer_value": "satisfied"
            }
        },
        'response': {
            'code': 201,
            'data': {
                'id': 1
            }
        }
    },

    // 41: save servicerating question 2 feedback - 0007777
    {
        'request': {
            'method': 'POST',
            'headers': {
                'Authorization': ['Token test_key'],
                'Content-Type': ['application/json']
            },
            'url': 'http://localhost:8006/api/v1/rating/',
            'data': {
                "identity": "3f7c8851-5204-43f7-af7f-000000000777",
                "invite": "1b47bab8-1c37-44a2-94e6-85c3ee9a8c8b",
                "version": 1,
                "question_id": 2,
                "question_text": "How do you feel about the time you had to wait at the facility?",
                "answer_text": "Satisfied",
                "answer_value": "satisfied"
            }
        },
        'response': {
            'code': 201,
            'data': {
                'id': 1
            }
        }
    },

    // 42: save servicerating question 3 feedback - 0007777
    {
        'request': {
            'method': 'POST',
            'headers': {
                'Authorization': ['Token test_key'],
                'Content-Type': ['application/json']
            },
            'url': 'http://localhost:8006/api/v1/rating/',
            'data': {
                "identity": "3f7c8851-5204-43f7-af7f-000000000777",
                "invite": "1b47bab8-1c37-44a2-94e6-85c3ee9a8c8b",
                "version": 1,
                "question_id": 3,
                "question_text": "How long did you wait to be helped at the clinic?",
                "answer_text": "More than 4 hours",
                "answer_value": "more-than-4-hours"
            }
        },
        'response': {
            'code': 201,
            'data': {
                'id': 1
            }
        }
    },

    // 43: save servicerating question 4 feedback - 0007777
    {
        'request': {
            'method': 'POST',
            'headers': {
                'Authorization': ['Token test_key'],
                'Content-Type': ['application/json']
            },
            'url': 'http://localhost:8006/api/v1/rating/',
            'data': {
                "identity": "3f7c8851-5204-43f7-af7f-000000000777",
                "invite": "1b47bab8-1c37-44a2-94e6-85c3ee9a8c8b",
                "version": 1,
                "question_id": 4,
                "question_text": "Was the facility clean?",
                "answer_text": "Very unsatisfied",
                "answer_value": "very-unsatisfied"
            }
        },
        'response': {
            'code': 201,
            'data': {
                'id': 1
            }
        }
    },

    // 44: save servicerating question 5 feedback - 0007777
    {
        'request': {
            'method': 'POST',
            'headers': {
                'Authorization': ['Token test_key'],
                'Content-Type': ['application/json']
            },
            'url': 'http://localhost:8006/api/v1/rating/',
            'data': {
                "identity": "3f7c8851-5204-43f7-af7f-000000000777",
                "invite": "1b47bab8-1c37-44a2-94e6-85c3ee9a8c8b",
                "version": 1,
                "question_id": 5,
                "question_text": "Did you feel that your privacy was respected by the staff?",
                "answer_text": "Very Satisfied",
                "answer_value": "very-satisfied"
            }
        },
        'response': {
            'code': 201,
            'data': {
                'id': 1
            }
        }
    },

    // 45: get identity 3f7c8851-5204-43f7-af7f-000000000222 service rating status
    {
        'repeatable': true,
        'request': {
            'method': 'GET',
            'params': {
                "identity": "3f7c8851-5204-43f7-af7f-000000000222",
                "completed": 'False',
                "expired": 'False'
            },
            'headers': {
                'Authorization': ['Token test_key'],
                'Content-Type': ['application/json']
            },
            'url': 'http://localhost:8006/api/v1/invite/',
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

    // 46: get identity 3f7c8851-5204-43f7-af7f-000000000777 service rating status
    {
        'request': {
            'method': 'GET',
            'params': {
                "identity": "3f7c8851-5204-43f7-af7f-000000000777",
                "completed": 'False',
                "expired": 'False'
            },
            'headers': {
                'Authorization': ['Token test_key'],
                'Content-Type': ['application/json']
            },
            'url': 'http://localhost:8006/api/v1/invite/',
        },
        'response': {
            "code": 200,
            "data": {
                "count": 1,
                "next": null,
                "previous": null,
                "results": [{
                    "updated_at": "2016-04-04T17:06:08.411867Z",
                    "created_at": "2016-04-04T17:06:08.411843Z",
                    "version": 1,
                    "id": "1b47bab8-1c37-44a2-94e6-85c3ee9a8c8b",
                    "identity": "3f7c8851-5204-43f7-af7f-000000000777",
                }]
            }
        }
    },

    // 47: patch service rating invite 1b47bab8-1c37-44a2-94e6-85c3ee9a8c8b
    {
        'request': {
            'method': 'PATCH',
            'headers': {
                'Authorization': ['Token test_key']
            },
            'url': 'http://localhost:8006/api/v1/invite/1b47bab8-1c37-44a2-94e6-85c3ee9a8c8b/',
            "data": {
                "completed": 'True'
            }
        },
        'response': {
            "code": 200,
            "data": {
                "success": "true"
            }
        }
    },

    // 48: get identity 0720000999 by msisdn
    {
        'repeatable': true,
        'request': {
            'method': 'GET',
            'params': {
                'details__addresses__msisdn': '+256720000999'
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
                    "url": "http://localhost:8001/api/v1/identities/3f7c8851-5204-43f7-af7f-000000000999/",
                    "id": "3f7c8851-5204-43f7-af7f-000000000999",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "+256720000222": {}
                            }
                        },
                        "role": "vht",
                        "preferred_msg_type": "sms",
                        "preferred_language": "eng_UG",
                        "parish": "Kawaaga",
                        "personnel_code": "888",
                    },
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                }]
            }
        }
    },

    // 49: search for parish "kawa" 5 results
    {
        'repeatable': true,
        'request': {
            'method': 'GET',
            'params': {
                'name': 'kawa'
            },
            'headers': {
                'Authorization': ['Token test_token_registrations'],
                'Content-Type': ['application/json']
            },
            'url': 'http://localhost:8002/api/v1/parish/',
        },
        'response': {
            'code': 200,
            'data': {
                'count': 5,
                'next': null,
                'previous': null,
                'results': [
                    { 'name': 'Kawaaga' },
                    { 'name': 'Balawoli' },
                    { 'name': 'Kagumba' },
                    { 'name': 'Kasolwe' },
                    { 'name': 'Kibuye' },
                ]
            }
        }
    },

    // 50: search for parish "foo" no results
    {
        'request': {
            'method': 'GET',
            'params': {
                'name': 'foo'
            },
            'headers': {
                'Authorization': ['Token test_token_registrations'],
                'Content-Type': ['application/json']
            },
            'url': 'http://localhost:8002/api/v1/parish/',
        },
        'response': {
            'code': 200,
            'data': {
                'count': 5,
                'next': null,
                'previous': null,
                'results': []
            }
        }
    },

    // 51: create registration 3
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
                "mother_id": "cb245673-aa41-4302-ac47-0000000555",
                "data": {
                    "hoh_id": "identity-uuid-06",
                    "receiver_id": "cb245673-aa41-4302-ac47-0000000555",
                    "operator_id": null,
                    "language": "eng_UG",
                    "msg_type": "text",
                    "last_period_date": "20150222",
                    "msg_receiver": "mother_to_be",
                    "parish": "Kawaaga",
                }
            }
        },
        'response': {
            "code": 201,
            "data": {}
        }
    },
    
    // 52: get identity 0720000888 by msisdn
    {
        'repeatable': true,
        'request': {
            'method': 'GET',
            'params': {
                'details__addresses__msisdn': '+256720000888'
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
                    "url": "http://localhost:8001/api/v1/identities/3f7c8851-5204-43f7-af7f-000000000888/",
                    "id": "3f7c8851-5204-43f7-af7f-000000000888",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "+256720000888": {
                                  "optedout": true
                                }
                            }
                        },
                        "role": "mother",
                        "preferred_msg_type": "text",
                        "msg_receiver": "mother_to_be",
                        "hoh_id": "identity-uuid-06",
                        "preferred_language": "eng_UG",
                        "health_id": 8888888888
                    },
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                }]
            }
        }
    },

    // 53: get identity 3f7c8851-5204-43f7-af7f-000000000888 service rating status
    {
        'repeatable': true,
        'request': {
            'method': 'GET',
            'params': {
                "identity": "3f7c8851-5204-43f7-af7f-000000000888",
                "completed": 'False',
                "expired": 'False'
            },
            'headers': {
                'Authorization': ['Token test_key'],
                'Content-Type': ['application/json']
            },
            'url': 'http://localhost:8006/api/v1/invite/',
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

    // 54: get identity 3f7c8851-5204-43f7-af7f-000000000888
    {
        'repeatable': true,  // second time gets the health_id
        'request': {
            'method': 'GET',
            'params': {},
            'headers': {
                'Authorization': ['Token test_key'],
                'Content-Type': ['application/json']
            },
            'url': "http://localhost:8001/api/v1/identities/3f7c8851-5204-43f7-af7f-000000000888/",
        },
        'response': {
            "code": 200,
            "data": {
                "url": "http://localhost:8001/api/v1/identities/3f7c8851-5204-43f7-af7f-000000000888/",
                "id": "3f7c8851-5204-43f7-af7f-000000000888",
                "version": 1,
                "details": {
                    "default_addr_type": "msisdn",
                    "addresses": {
                        "msisdn": {
                            "+256720000888": {
                              "optedout": true
                            }
                        }
                    },
                    "role": "mother",
                    "preferred_msg_type": "text",
                    "msg_receiver": "mother_to_be",
                    "hoh_id": "identity-uuid-06",
                    "preferred_language": "eng_UG",
                    "health_id": 8888888888
                },
                "created_at": "2015-07-10T06:13:29.693272Z",
                "updated_at": "2015-07-10T06:13:29.693298Z"
            }
        }
    },

    // 55: create registration 4
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
                "mother_id": "3f7c8851-5204-43f7-af7f-000000000888",
                "data": {
                    "hoh_id": "identity-uuid-06",
                    "receiver_id": "3f7c8851-5204-43f7-af7f-000000000888",
                    "operator_id": null,
                    "language": "eng_UG",
                    "msg_type": "text",
                    "last_period_date": "20150222",
                    "msg_receiver": "mother_to_be",
                    "parish": "Kawaaga",
                }
            }
        },
        'response': {
            "code": 201,
            "data": {}
        }
    },

    // 56: patch identity 3f7c8851-5204-43f7-af7f-000000000888
    {
        'request': {
            'method': 'PATCH',
            'headers': {
                'Authorization': ['Token test_key'],
                'Content-Type': ['application/json']
            },
            'url': 'http://localhost:8001/api/v1/identities/3f7c8851-5204-43f7-af7f-000000000888/',
            'data':  {
                "id": "3f7c8851-5204-43f7-af7f-000000000888",
                "version": 1,
                "details": {
                    "default_addr_type": "msisdn",
                    "addresses": {
                        "msisdn": {
                            "+256720000888": {}
                        }
                    },
                    "role": "mother",
                    "preferred_msg_type": "text",
                    "msg_receiver": "mother_to_be",
                    "hoh_id": "identity-uuid-06",
                    "health_id": 8888888888
                }
            }
        },
        'response': {
            "code": 200,
            "data": {}
        }
    },

    // 57: patch identity 06
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
                    "addresses": {},
                    "role": "head_of_household",
                    "mother_id": "3f7c8851-5204-43f7-af7f-000000000888",
                    "preferred_msg_type": "text"
                }
            }
        },
        'response': {
            "code": 200,
            "data": {}
        }
    },
];
};

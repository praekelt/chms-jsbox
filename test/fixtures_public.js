// Contact roles
// 0720000111: heretofore unseen number
// 0720000222: registered user - mother, english, sms
// 0720000333: unregistered user - number entered manually
// 0720000555: unregistered user - number entered manually - mother_to_be registration

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
                        "preferred_language": "eng_UG"
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
            'url': 'http://localhost:8002/api/v1/registrations/',
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
            'url': 'http://localhost:8002/api/v1/registrations/',
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

    // 14: patch identity 000333
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

    // 15: get identity 0720000555 by msisdn - no results
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

    // 16: create identity 0720000555
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

    // 17: get identity cb245673-aa41-4302-ac47-0000000555
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

    // 18: create registration 2
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
                "mother_id": "cb245673-aa41-4302-ac47-0000000555",
                "data": {
                    "hoh_id": "identity-uuid-06",
                    "receiver_id": "cb245673-aa41-4302-ac47-0000000555",
                    "operator_id": null,
                    "language": "eng_UG",
                    "msg_type": "text",
                    "last_period_date": "20150222",
                    "msg_receiver": "mother_to_be"
                }
            }
        },
        'response': {
            "code": 201,
            "data": {}
        }
    },

    // 19: patch identity 555
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
                    "preferred_msg_type": "text",
                    "hiv_interest": "yes_hiv_msgs"
                }
            }
        },
        'response': {
            "code": 200,
            "data": {}
        }
    },

    // 20: patch identity 06
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

];
};

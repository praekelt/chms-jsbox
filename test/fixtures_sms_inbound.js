// 0720000222: registered user - mother only registration, sms, prebirth, english
// 0720000333: registered user - mother only registration, sms, postbirth, english

module.exports = function() {
    return [

    // 0: get identity 0720000222 by msisdn
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
                    "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-0000000222/",
                    "id": "cb245673-aa41-4302-ac47-0000000222",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "+256720000222": {}
                            }
                        },
                        "role": "mother",
                        "linked_to": null,
                        "preferred_msg_type": "text",
                        "preferred_language": "eng_UG"
                    },
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                }]
            }
        }
    },

    // 1: Optout 0720000222
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
                "identity": "cb245673-aa41-4302-ac47-0000000222",
                "reason": "unknown",
                "address_type": "msisdn",
                "address": "+256720000222",
                "request_source": "sms_inbound",
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

    // 2: get identity 0720000111 by msisdn - no results
    {
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

    // 3: post inbound message
    {
        'request': {
            'method': 'POST',
            'params': {},
            'headers': {
                'Authorization': ['Token test_key'],
                'Content-Type': ['application/json']
            },
            'url': 'http://localhost:8006/api/v1/inbound/',
            'data': {
                "message_id": "0170b7bb-978e-4b8a-35d2-662af5b6daee",
                "in_reply_to": null,
                "to_addr": "2561234",
                "from_addr": "0720000111",
                "transport_name": "aggregator_sms",
                "transport_type": "sms",
                "helper_metadata": {}
            }
        },
        'response': {
            "code": 201,
            "data": {}
        }
    },

    // 4: get subscriptions for cb245673-aa41-4302-ac47-0000000222
    {
        'request': {
            'method': 'GET',
            'params': {
                'active': 'true',
                'identity': 'cb245673-aa41-4302-ac47-0000000222'
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
                            'id': '51fcca25-2e85-4c44-subscription-2222',
                            'version': 1,
                            'identity': 'cb245673-aa41-4302-ac47-0000000222',
                            'messageset': 1,
                            'next_sequence_number': 1,
                            'lang': "eng_UG",
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

    // 5: get messageset 1
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
        }
    },

    // 6: Change to baby - cb245673-aa41-4302-ac47-0000000222
    {
        'request': {
            'method': 'POST',
            'headers': {
                'Authorization': ['Token test_key'],
                'Content-Type': ['application/json']
            },
            'url': 'http://localhost:8002/api/v1/change/',
            'data': {
                "mother_id": "cb245673-aa41-4302-ac47-0000000222",
                "action": "change_baby",
                "data": {}
            }
        },
        'response': {
            'code': 201,
            'data': {
                'id': 1
            }
        }
    },

    // 7: get identity 0720000333 by msisdn
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
                "count": 1,
                "next": null,
                "previous": null,
                "results": [{
                    "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-0000000333/",
                    "id": "cb245673-aa41-4302-ac47-0000000333",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "+256720000333": {}
                            }
                        },
                        "role": "mother",
                        "linked_to": null,
                        "preferred_msg_type": "text",
                        "preferred_language": "eng_UG"
                    },
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                }]
            }
        }
    },

    // 8: get subscriptions for cb245673-aa41-4302-ac47-0000000333
    {
        'request': {
            'method': 'GET',
            'params': {
                'active': 'true',
                'identity': 'cb245673-aa41-4302-ac47-0000000333'
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
                            'id': '51fcca25-2e85-4c44-subscription-3333',
                            'version': 1,
                            'identity': 'cb245673-aa41-4302-ac47-0000000333',
                            'messageset': 2,
                            'next_sequence_number': 1,
                            'lang': "eng_UG",
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

    // 9: get messageset 2
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
                'id': 1,
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

];
};

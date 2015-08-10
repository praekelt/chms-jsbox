module.exports = function() {
return [

    // Optout 064001
        // #get #subscription #064001
        {
            'request': {
                'method': 'GET',
                'params': {
                    'to_addr': '+064001'
                },
                'headers': {
                    'Authorization': ['Token test_key']
                },
                'url': 'http://127.0.0.1:8000/subscription/subscription/',
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
                        "url": "http://127.0.0.1:8000/subscription/subscription/1/",
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
                        "url": "http://127.0.0.1:8000/subscription/subscription/2/",
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
                'url': 'http://127.0.0.1:8000/subscription/subscription/2/',
                "data": {
                    "url": "http://127.0.0.1:8000/subscription/subscription/2/",
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

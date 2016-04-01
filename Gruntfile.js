module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.initConfig({
        paths: {
            src: {
                app: {
                    ussd_health_worker: 'src/ussd_health_worker.js',
                    ussd_public: 'src/ussd_public.js',
                    sms_inbound: 'src/sms_inbound.js'
                },
                ussd_health_worker: [
                    'src/index.js',
                    'src/utils.js',
                    'src/utils_project.js',
                    '<%= paths.src.app.ussd_health_worker %>',
                    'src/init.js'
                ],
                ussd_public: [
                    'src/index.js',
                    'src/utils.js',
                    'src/utils_project.js',
                    '<%= paths.src.app.ussd_public %>',
                    'src/init.js'
                ],
                sms_inbound: [
                    'src/index.js',
                    'src/utils.js',
                    'src/utils_project.js',
                    '<%= paths.src.app.sms_inbound %>',
                    'src/init.js'
                ],
                all: [
                    'src/**/*.js'
                ]
            },
            dest: {
                ussd_health_worker: 'go-app-ussd_health_worker.js',
                ussd_public: 'go-app-ussd_public.js',
                sms_inbound: 'go-app-sms.js'
            },
            test: {
                ussd_health_worker: [
                    'test/setup.js',
                    'src/utils.js',
                    'src/utils_project.js',
                    '<%= paths.src.app.ussd_health_worker %>',
                    'test/ussd_health_worker.test.js'
                ],
                ussd_public: [
                    'test/setup.js',
                    'src/utils.js',
                    'src/utils_project.js',
                    '<%= paths.src.app.ussd_public %>',
                    'test/ussd_public.test.js'
                ],
                sms_inbound: [
                    'test/setup.js',
                    'src/utils.js',
                    'src/utils_project.js',
                    '<%= paths.src.app.sms_inbound %>',
                    'test/sms_inbound.test.js'
                ]
            }
        },

        jshint: {
            options: {jshintrc: '.jshintrc'},
            all: [
                'Gruntfile.js',
                '<%= paths.src.all %>'
            ]
        },

        watch: {
            src: {
                files: [
                    '<%= paths.src.all %>'
                ],
                tasks: ['default'],
                options: {
                    atBegin: true
                }
            }
        },

        concat: {
            options: {
                banner: [
                    '// WARNING: This is a generated file.',
                    '//          If you edit it you will be sad.',
                    '//          Edit src/app.js instead.',
                    '\n' // Newline between banner and content.
                ].join('\n')
            },
            ussd_health_worker: {
                src: ['<%= paths.src.ussd_health_worker %>'],
                dest: '<%= paths.dest.ussd_health_worker %>'
            },
            ussd_public: {
                src: ['<%= paths.src.ussd_public %>'],
                dest: '<%= paths.dest.ussd_public %>'
            },
            sms_inbound: {
                src: ['<%= paths.src.sms_inbound %>'],
                dest: '<%= paths.dest.sms_inbound %>'
            },

        },

        mochaTest: {
            options: {
                reporter: 'spec'
            },
            test_ussd_health_worker: {
                src: ['<%= paths.test.ussd_health_worker %>']
            },
            test_ussd_public: {
                src: ['<%= paths.test.ussd_public %>']
            },
            test_sms_inbound: {
                src: ['<%= paths.test.sms_inbound %>']
            }
        }
    });

    grunt.registerTask('test', [
        'jshint',
        'build',
        'mochaTest'
    ]);

    grunt.registerTask('build', [
        'concat',
    ]);

    grunt.registerTask('default', [
        'build',
        'test'
    ]);
};

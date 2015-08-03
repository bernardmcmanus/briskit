module.exports = function( grunt ) {

  grunt.initConfig({

    pkg: grunt.file.readJSON( 'package.json' ),

    gitinfo: {},

    jshint: {
      all: [ 'Gruntfile.js' , '<%= pkg.config.src %>' ],
      options: {
        esnext: true
      }
    },

    'import-clean': {
      all: '<%= pkg.config.src %>'
    },

    clean: {
      dist: [ 'dist' ],
      tmp: [ 'tmp' ]
    },

    'release-describe': {
      build: {
        src: 'dist/<%= pkg.name %>.js',
        dest: 'dist/<%= pkg.name %>.min.js'
      }
    },

    replace: [{
      options: {
        patterns: [{
          match: /(.*"version"\:\s*).*(?=,)/i,
          replacement: '$1"<%= pkg.version %>"'
        }]
      },
      files: [{
        src: 'bower.json',
        dest: 'bower.json'
      }]
    }],

    watch: {
      debug: {
        files: [ '<%= pkg.config.src %>' , 'test/**/*' , '!tmp' , '!*/tmp' ],
        tasks: [ '_test' ],
        options: {
          interrupt: true
        }
      }
    },

    browserify: {
      dist: {
        options: {
          transform: [[ 'babelify' , { stage: 0 }]],
          plugin: [
            [ 'browserify-derequire' ]
          ],
          browserifyOptions: {
            'standalone': 'standalone',
            'debug': 'debug',
            'paths': [ 'src' ]
          }
        },
        files: {
          '<%= pkg.config.tmp %>': '<%= pkg.config.index %>'
        }
      }
    },

    wrap: {
      options: {
        wrapper: [
          '(function($global,Array,setTimeout,UNDEFINED) {\n',
          '\n}((typeof global != "undefined" ? global : typeof self != "undefined" ? self : typeof window != "undefined" ? window : {}),Array,setTimeout))'
        ]
      },
      dist: {
        files: {
          '<%= pkg.config.tmp %>': '<%= pkg.config.tmp %>'
        }
      }
    },

    concat: {
      options: {
        banner: '<%= pkg.config.banner %>\n'
      },
      dist: {
        src: '<%= pkg.config.tmp %>',
        dest: 'dist/<%= pkg.name %>.js'
      }
    },

    uglify: {
      options: {
        banner: '<%= pkg.config.banner %>'
      },
      dist: {
        files: {
          'dist/<%= pkg.name %>.min.js': '<%= pkg.config.tmp %>'
        }
      }
    },

    mochaTest: {
      node: {
        src: 'test/node'
      }
    },

    connect: {
      server: {
        options: {
          port: '<%= pkg.config.connect.port %>',
          base: '<%= pkg.config.connect.base %>',
          hostname: '<%= pkg.config.connect.hostname %>',
          interrupt: true
        }
      }
    },

    mocha_phantomjs: {
      browser: {
        options: { urls: [
          '<%= pkg.config.connect.url %>/test/browser/index.html'
        ]}
      }
    }
  });

  grunt.loadTasks( 'tasks' );
  
  [
    'grunt-contrib-jshint',
    'grunt-contrib-clean',
    'grunt-gitinfo',
    'grunt-replace',
    'grunt-contrib-concat',
    'grunt-contrib-uglify',
    'grunt-contrib-watch',
    'grunt-import-clean',
    'grunt-browserify',
    'grunt-wrap',
    'grunt-mocha-test',
    'grunt-contrib-connect',
    'grunt-mocha-phantomjs'
  ]
  .forEach( grunt.loadNpmTasks );

  grunt.registerTask( 'default' , [
    'clean',
    'build',
    'replace',
    'test',
    'release-describe'
  ]);

  grunt.registerTask( 'build' , [
    'gitinfo',
    'clean:dist',
    'browserify',
    'wrap',
    'concat',
    'uglify',
    'clean:tmp'
  ]);

  grunt.registerTask( 'test' , [
    'bower-install',
    'connect',
    '_test'
  ]);

  grunt.registerTask( '_test' , [
    'jshint',
    'import-clean',
    'build',
    'mochaTest',
    'mocha_phantomjs'
  ]);

  grunt.registerTask( 'debug' , [
    'test',
    'watch:debug'
  ]);
};

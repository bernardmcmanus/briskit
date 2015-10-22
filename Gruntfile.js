module.exports = function( grunt ) {

  grunt.initConfig({

    pkg: grunt.file.readJSON( 'package.json' ),

    gitinfo: {},

    jshint: {
      all: '<%= pkg.config.src %>',
      options: { esnext: true }
    },

    'import-clean': {
      all: '<%= pkg.config.src %>'
    },

    clean: {
      dist: [ 'dist' ],
      tmp: [ 'tmp' ]
    },

    update_json: {
      options: {
        src: 'package.json',
        indent: '  '
      },
      bower: {
        dest: 'bower.json',
        fields: [
          'name',
          'version',
          'description',
          'keywords',
          'homepage',
          'license'
        ]
      }
    },

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
            'standalone': 'briskit',
            'debug': 'debug',
            'paths': [ 'src' ]
          }
        },
        files: {
          'tmp/<%= pkg.name %>.js': 'src/index.js'
        }
      }
    },

    wrap: {
      options: {
        wrapper: [
          '(function(Array,setTimeout,UNDEFINED) {\n',
          '\n}(Array,setTimeout))'
        ]
      },
      dist: {
        files: {
          'tmp/<%= pkg.name %>.js': 'tmp/<%= pkg.name %>.js'
        }
      }
    },

    concat: {
      options: {
        banner: '<%= pkg.config.banner %>\n'
      },
      dist: {
        src: 'tmp/<%= pkg.name %>.js',
        dest: 'dist/<%= pkg.name %>.js'
      }
    },

    uglify: {
      options: {
        banner: '<%= pkg.config.banner %>'
      },
      dist: {
        files: {
          'dist/<%= pkg.name %>.min.js': 'tmp/<%= pkg.name %>.js'
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
    },

    'release-describe': {
      build: {
        files: {
          'dist/<%= pkg.name %>.min.js': 'dist/<%= pkg.name %>.js'
        }
      }
    }
  });

  grunt.loadTasks( 'tasks' );
  
  [
    'grunt-contrib-jshint',
    'grunt-contrib-clean',
    'grunt-gitinfo',
    'grunt-contrib-concat',
    'grunt-contrib-uglify',
    'grunt-contrib-watch',
    'grunt-import-clean',
    'grunt-browserify',
    'grunt-wrap',
    'grunt-mocha-test',
    'grunt-contrib-connect',
    'grunt-mocha-phantomjs',
    'grunt-update-json'
  ]
  .forEach( grunt.loadNpmTasks );

  grunt.registerTask( 'default' , [
    'clean',
    'build',
    'update_json',
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

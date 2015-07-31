module.exports = function( grunt ) {

  var cp = require( 'child_process' );
  var Promise = require( 'es6-promise' ).Promise;

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
          match: /(\"version\")(.*?)(\")(.{1,}?)(\")/i,
          replacement: '\"version\": \"<%= pkg.version %>\"'
        }]
      },
      files: [{
        src: 'bower.json',
        dest: 'bower.json'
      }]
    }],

    watch: {
      debug: {
        files: [ 'Gruntfile.js' , '<%= pkg.config.src %>' , 'test/**/*.js' , '!tmp' ],
        tasks: [ 'test' ]
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
        global: '$global',
        inject: [
          'Array',
          'setTimeout',
          [ 'UNDEFINED' ]
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
    'grunt-browserify'
  ]
  .forEach( grunt.loadNpmTasks );

  grunt.registerTask( 'runTests' , function() {
    var done = this.async();
    new Promise(function( resolve ) {
      var task = cp.spawn( 'npm' , [ 'test' ]);
      resolve( task.stdout );
    })
    .then(function( readable ) {
      readable.pipe( process.stdout );
      return new Promise(function( resolve , reject ) {
        readable.on( 'end' , resolve );
        readable.on( 'error' , reject );
      })
      .catch(function( err ) {
        return err;
      });
    })
    .then( done );
  });

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
    'jshint',
    'import-clean',
    'build',
    'runTests'
  ]);

  grunt.registerTask( 'debug' , [
    'test',
    'watch:debug'
  ]);
};

module.exports = function( grunt ) {

  var path = require( 'path' );
  var fs = require( 'fs-extra' );
  var cp = require( 'child_process' );
  var util = require( 'util' );
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
      'dist': [ 'dist' ],
      'tmp': [ 'tmp' ],
      'common-dev': [ 'dist/<%= pkg.name %>-<%= pkg.version %>.js' ],
      'common-prod': [ 'dist/<%= pkg.name %>-<%= pkg.version %>.min.js' ]
    },

    'release-describe': {
      build: {
        src: 'dist/<%= pkg.name %>-<%= pkg.version %>.js',
        dest: 'dist/<%= pkg.name %>-<%= pkg.version %>.min.js'
      }
    },

    replace: {
      npm: {
        options: {
          patterns: [
            {
              match: /(\"version\")(.*?)(\")(.{1,}?)(\")/i,
              replacement: '\"version\": \"<%= pkg.version %>\"'
            },
            {
              match: /(\"main\")(.*?)(\")(.{1,}?)(\")/i,
              replacement: '\"main\": \"dist/<%= pkg.name %>-<%= pkg.version %>.js\"'
            }
          ]
        },
        files: [{
          src: 'package.json',
          dest: 'package.json'
        }]
      },
      bower: {
        options: {
          patterns: [
            {
              match: /(\"version\")(.*?)(\")(.{1,}?)(\")/i,
              replacement: '\"version\": \"<%= pkg.version %>\"'
            },
            {
              match: /(\"main\")(.*?)(\")(.{1,}?)(\")/i,
              replacement: '\"main\": \"dist/<%= pkg.name %>-<%= pkg.version %>.min.js\"'
            }
          ]
        },
        files: [{
          src: 'bower.json',
          dest: 'bower.json'
        }]
      }
    },

    watch: {
      debug: {
        files: [ 'Gruntfile.js' , '<%= pkg.config.src %>' , 'build/*.js' , 'test/*.js' ],
        options: { interrupt: true },
        tasks: [ 'test' ]
      }
    },

    transpile: {
      common: {
        src: '<%= pkg.config.src %>',
        dest: 'tmp/<%= pkg.name %>.common.js',
        umd: '<%= pkg.config.umd %>',
        options: {
          inject: [
            'Array',
            'setTimeout',
            [ '$UNDEFINED' ]
          ]
        }
      }
    },

    concat: {
      options: {
        banner: "/*! <%= pkg.name %> - <%= pkg.version %> - <%= pkg.author.name %> - <%= grunt.config.data.gitinfo.local.branch.current.shortSHA %> - <%= grunt.template.today('yyyy-mm-dd') %> */\n\n"
      },
      common: {
        src: 'tmp/<%= pkg.name %>.common.js',
        dest: 'dist/<%= pkg.name %>-<%= pkg.version %>.js'
      }
    },

    uglify: {
      options: {
        banner: "/*! <%= pkg.name %> - <%= pkg.version %> - <%= pkg.author.name %> - <%= grunt.config.data.gitinfo.local.branch.current.shortSHA %> - <%= grunt.template.today('yyyy-mm-dd') %> */\n"
      },
      common: {
        files: {
          'dist/<%= pkg.name %>-<%= pkg.version %>.min.js': 'tmp/**/*.js'
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
    'grunt-import-clean'
  ]
  .forEach( grunt.loadNpmTasks );

  grunt.registerTask( 'build:dist' , function() {
    var pkg = fs.readJsonSync( path.join( __dirname ,  'package.json' ));
    var bower = fs.readJsonSync( path.join( __dirname ,  'bower.json' ));
    var re = /-(\d|\.)*(?=(\.min)?\.js)/;
    [
      pkg.main,
      bower.main
    ]
    .forEach(function( src ) {
      src = path.join( __dirname , src );
      fs.copySync( src , src.replace( re , '' ));
    });
  });

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
    'build:common',
    'build:dist'
  ]);

  grunt.registerTask( 'build:common' , [
    'build:common-dev',
    'build:common-prod'
  ]);

  grunt.registerTask( 'build:common-prod' , [
    'clean:common-prod',
    'transpile:common',
    'uglify:common',
    'clean:tmp'
  ]);

  grunt.registerTask( 'build:common-dev' , [
    'clean:common-dev',
    'transpile:common',
    'concat:common',
    'clean:tmp'
  ]);

  grunt.registerTask( 'test' , [
    'jshint',
    'import-clean',
    'build:common-dev',
    'runTests'
  ]);

  grunt.registerTask( 'debug' , [
    'test',
    'watch:debug'
  ]);
};

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
      'common-dev': [ 'dist/<%= pkg.name %>.js' ],
      'common-prod': [ 'dist/<%= pkg.name %>.min.js' ]
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
        files: [ 'Gruntfile.js' , '<%= pkg.config.src %>' , 'build/*.js' , 'test/*.js' ],
        options: { interrupt: true },
        tasks: [ 'test' ]
      }
    },

    transpile: {
      common: {
        src: '<%= pkg.config.src %>',
        dest: 'tmp/<%= pkg.name %>.common.js',
        index: '<%= pkg.config.umd %>'
      },
      module: {
        src: '<%= pkg.config.src %>',
        dest: 'tmp/<%= pkg.name %>.module.js',
        index: '<%= pkg.config.module %>'        
      },
      options: {
        inject: [
          'Array',
          'setTimeout',
          [ '$UNDEFINED' ]
        ]
      }
    },

    toES6Module: {
      common: {
        'dist/<%= pkg.name %>.module.js': 'dist/<%= pkg.name %>.module.js'
      }
    },

    concat: {
      options: {
        banner: "/*! <%= pkg.name %> - <%= pkg.version %> - <%= pkg.author.name %> - <%= grunt.config.data.gitinfo.local.branch.current.shortSHA %> - <%= grunt.template.today('yyyy-mm-dd') %> */\n\n"
      },
      common: {
        src: 'tmp/<%= pkg.name %>.common.js',
        dest: 'dist/<%= pkg.name %>.js'
      },
      module: {
        src: 'tmp/<%= pkg.name %>.module.js',
        dest: 'dist/<%= pkg.name %>.module.js'
      }
    },

    uglify: {
      options: {
        banner: "/*! <%= pkg.name %> - <%= pkg.version %> - <%= pkg.author.name %> - <%= grunt.config.data.gitinfo.local.branch.current.shortSHA %> - <%= grunt.template.today('yyyy-mm-dd') %> */\n"
      },
      common: {
        files: {
          'dist/<%= pkg.name %>.min.js': 'tmp/**/*.js'
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
    'transpile',
    'concat',
    'uglify',
    'toES6Module',
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

module.exports = function( grunt ) {

  var cp = require( 'child_process' );
  var fs = require( 'fs-extra' );
  var path = require( 'path' );
  var Promise = require( 'es6-promise' ).Promise;

  grunt.registerTask( 'bower-install' , function() {
    var done = this.async();
    var bower_components = path.join( __dirname , 'bower_components' );
    new Promise(function( resolve , reject ) {
      fs.stat( bower_components , function( err , stats ) {
        return err ? reject( err ) : resolve();
      });
    })
    .catch(function( err ) {
      if (err.code == 'ENOENT') {
        return new Promise(function( resolve , reject ) {
          var task = cp.spawn( 'bower' , [ 'install' ]);
          var readable = task.stdout;
          readable.pipe( process.stdout );
          readable.on( 'end' , resolve );
          readable.on( 'error' , reject );
        })
        .catch( grunt.fail.warn );
      }
      grunt.fail.warn( err );
    })
    .then( done );
  });
};

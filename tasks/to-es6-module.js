module.exports = function( grunt ) {

  var fs = require( 'fs-extra' );
  var path = require( 'path' );
  var CWD = process.cwd();

  grunt.registerMultiTask( 'toES6Module' , 'create an importable es6 module' , function() {
    var data = this.data;
    Object.keys( data ).forEach(function( dest ) {
      var src = path.join( CWD , data[dest] );
      dest = path.join( CWD , grunt.config.process( dest ));
      var content = fs.readFileSync( src , 'utf-8' );
      content = content.replace( /(\(function)/ , 'export default $1' );
      fs.writeFileSync( dest , content );
    });
  });
};

module.exports = function( grunt ) {

  var fs = require( 'fs-extra' );
  var path = require( 'path' );
  
  var globalGetter = 'typeof global != "undefined" ? global : typeof self != "undefined" ? self : typeof window != "undefined" ? window : {}';

  function getArgsString( args , index , $global ) {
    args = args.sort(function( a , b ) {
      if (Array.isArray( a ) && (a[1] === undefined || (/undefined/i).test( a[1] ))) {
        return 1;
      }
      if (Array.isArray( b ) && (b[1] === undefined || (/undefined/i).test( b[1] ))) {
        return -1;
      }
      return 0;
    })
    .map(function( arg ) {
      return Array.isArray( arg ) ? arg[index] : arg;
    })
    .filter(function( arg ) {
      return arg !== undefined;
    });
    if ($global) {
      args.unshift( $global );
    }
    return args.join( ',' );
  }

  grunt.task.registerMultiTask( 'wrap' , 'pass globals to anonymous wrapper function' , function() {
    var that = this;
    var data = grunt.task.normalizeMultiTaskFiles( that.data )[0];
    var options = that.options({ tab: '  ', global: false, inject: [] });
    var wrap$start = '(function(<%= wrap_leading_args %>) {\n';
    var wrap$end = '\n}).apply(this,[<%= wrap_trailing_args %>]);';
    var leading$args = getArgsString( options.inject , 0 , options.global );
    var trailing$args = getArgsString( options.inject , 1 , ( options.global ? globalGetter : false ));

    grunt.config.set( 'wrap_leading_args' , leading$args );
    grunt.config.set( 'wrap_trailing_args' , trailing$args );

    data.src.forEach(function( src ) {
      var content = fs.readFileSync( src , 'utf-8' ).replace( /^(.?)/gm , options.tab + '$1' );
      content = wrap$start + content + wrap$end;
      fs[( src == data.dest ? 'writeFileSync' : 'appendFileSync' )]( data.dest , content );
    });

    var content = fs.readFileSync( data.dest , 'utf-8' );
    fs.writeFileSync( data.dest , grunt.config.process( content ));
  });
};

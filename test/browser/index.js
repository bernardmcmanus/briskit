module.exports = (function() {

	var cp = require( 'child_process' );
	var path = require( 'path' );
	var phantomjs = require( 'phantomjs' );
	var binPath = phantomjs.path;

	return function( options , callback ) {

		/*var args = [
			path.resolve( __dirname , 'phantom.js' ),
			JSON.stringify({
				project_root: options.project_root,
				js: {
					mocha: path.resolve( options.project_root , 'node_modules/mocha/mocha.js' ),
					chai: path.resolve( options.project_root , 'node_modules/chai/chai.js' )
				},
				css: {
					mocha: path.resolve( options.project_root , 'node_modules/mocha/mocha.css' ),
				}
			})
		];*/

		var args = [
			path.resolve( __dirname , 'phantom.js' ),
			JSON.stringify({
				mocha: path.resolve( options.project_root , 'node_modules/mocha/mocha.js' ),
				chai: path.resolve( options.project_root , 'node_modules/chai/chai.js' ),
				briskit: options.dist,
				version: options.version
			})
		];

		console.log(JSON.parse(args[1],null,2));

		cp.execFile( binPath , args , function( err , stdout , stderr ) {
			console.log(stdout);
			callback( err );
		});

	};

}());




















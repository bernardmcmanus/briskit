(function() {


	'use strict';

	var path = require( 'path' );
	var fs = require( 'fs-extra' );

	var project_root = path.resolve( __dirname , '../..' );

	var pkg = fs.readJsonSync(
		path.join( project_root , 'package.json' )
	);

	var briskit = require(
		path.join( project_root , pkg.main )
	);

	describe( 'node.js' , function() {
		require( './tests' )( briskit );
		require( '../common/tests' )( briskit );
	});

}());


















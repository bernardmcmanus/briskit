(function() {


	'use strict';

	var path = require( 'path' );
	var fs = require( 'fs-extra' );

	var action = process.argv[2] || 'build';
	var project_root = path.resolve( __dirname , '../..' );

	var tmp_path = path.join( __dirname , 'tmp' );
	var html_path = path.join( __dirname , 'index.html' );
	var html_tmp_path = path.join( tmp_path , 'index.html' );
	var html;

	switch (action) {

		case 'build':
			html = fs.readFileSync( html_path , 'utf-8' ).replace( /\[PROJECT_ROOT\]/g , project_root );
			fs.ensureDirSync( tmp_path );
			fs.writeFileSync( html_tmp_path , html );
		break;

		case 'clean':
			fs.removeSync( tmp_path );
		break;
	}

}());


















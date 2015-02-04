(function() {

	var fs = require( 'fs-extra' );
	var path = require( 'path' );
	var browser = require( './index' );

	var project_root = path.resolve( __dirname , '../..' );

	var pkg = fs.readJsonSync(
		path.resolve( project_root , 'package.json' )
	);

	var options = {
		project_root: project_root,
		dist: path.resolve( project_root , pkg.main ),
		version: pkg.version
	};

	browser( options , function( err ) {
		console.log(err);
	});

}());




















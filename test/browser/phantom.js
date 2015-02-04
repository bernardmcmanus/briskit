var fs = require( 'fs' );
var page = require( 'webpage' ).create();
var system = require( 'system' );
var args = system.args;


var options = JSON.parse( args[1] );


page.onConsoleMessage = function( msg ) {
	console.log( msg );
};

//page.open( 'page.html' , function( status ) {
	
	try {

		page.injectJs( options.mocha );
		page.injectJs( options.chai );
		page.injectJs( options.briskit );

		page.evaluate(function( status ) {
			var expect = chai.expect;
			mocha.setup( 'bdd' );
			//mocha.reporter( 'html' );
			it( 'should call a task in the future' , function ( done ) {
				console.log('test');
				var called = false;
				briskit(function () {
					called = true;
					done();
				});
				expect( called ).to.not.be.ok;
			});
			mocha.run();
		});
	}
	catch( err ) {
		throw err;
	}
	finally {
		phantom.exit();
	}
	
//});

















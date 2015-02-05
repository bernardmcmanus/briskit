module.exports = (function() {

	'use strict';

	return function( briskit ) {

		var domain = require( 'domain' );
		var mocha = require( 'mocha' );
		var chai = require( 'chai' );
		var expect = chai.expect;


		var MAX_RECURSION = 10;
		var NORMAL_WAIT = 10;
		var ERROR_WAIT = 10;


		if (typeof window != 'undefined') {
			// give phantom a chance
			NORMAL_WAIT = 200;
			ERROR_WAIT = 200;
		}


		describe( 'general' , function() {

			it( 'should call a task in the future' , function ( done ) {
				var called = false;
				briskit(function () {
					called = true;
					done();
				});
				expect( called ).to.not.be.ok;
			});

			it( 'should maintain task order' , function ( done ) {

				var calls = [];

				briskit(function() {
					calls.push( 0 );
				});

				briskit(function() {
					calls.push( 1 );
				});
				
				briskit(function() {
					calls.push( 2 );
				});

				expect( calls ).to.eql([]);

				setTimeout(function() {
					expect( calls ).to.eql([ 0 , 1 , 2 ]);
					done();
				}, NORMAL_WAIT);
			});

			it( 'should maintain breadth-first order' , function ( done ) {

				var calls = [];

				briskit(function() {

					calls.push( 0 );

					briskit(function() {

						calls.push( 2 );

						briskit(function() {
							calls.push( 5 );
						});

						briskit(function() {
							calls.push( 6 );
						});
					});

					briskit(function() {
						calls.push( 3 );
					});
				});

				briskit(function() {

					calls.push( 1 );

					briskit(function() {
						calls.push( 4 );
					});
				});

				expect( calls ).to.eql([]);

				setTimeout(function() {
					expect( calls ).to.eql([ 0 , 1 , 2 , 3 , 4 , 5 , 6 ]);
					done();
				}, NORMAL_WAIT);
			});

		});

		describe( 'recursion' , function() {

			it( 'should allow for recursive scheduling' , function ( done ) {

				var steps = [];

				briskit(function() {
					steps.push( 0 );
					briskit(function() {
						steps.push( 2 );
						briskit(function() {
							steps.push( 4 );
						});
						steps.push( 3 );
					});
					steps.push( 1 );
				});

				setTimeout(function() {
					expect( steps ).to.eql([ 0 , 1 , 2 , 3 , 4 ]);
					done();
				}, NORMAL_WAIT);
			});

			it( 'can recurse ' + MAX_RECURSION + ' tasks deep' , function ( done ) {

				var timesRecursed = 0;

				(function go() {
					if (++timesRecursed < MAX_RECURSION) {
						briskit( go );
					}
				}());

				setTimeout(function() {
					expect( timesRecursed ).to.equal( MAX_RECURSION );
					done();
				}, NORMAL_WAIT);
			});

			it( 'can execute two branches of recursion in parallel' , function ( done ) {

				var timesRecursed1 = 0;
				var timesRecursed2 = 0;
				var calls = [];

				(function go1() {
					calls.push( timesRecursed1 * 2 );
					if (++timesRecursed1 < MAX_RECURSION) {
						briskit( go1 );
					}
				}());

				(function go2() {
					calls.push( timesRecursed2 * 2 + 1 );
					if (++timesRecursed2 < MAX_RECURSION) {
						briskit( go2 );
					}
				}());

				setTimeout(function() {
					expect( calls.length ).to.equal(MAX_RECURSION * 2);
					for (var index = 0; index < MAX_RECURSION * 2; index++) {
						expect( calls[index] ).to.equal( index );
					}
					done();
				}, NORMAL_WAIT);
			});

		});

		describe( 'errors' , function() {

			it( 'should preserve the order of thrown errors' , function ( done ) {

				var calls = [];
				var errors = [];

				var d = domain.create();

				d.on( 'error' , function( error ) {
					errors.push( error );
				});

				d.run(function() {
					briskit(function() {
						calls.push( 0 );
						throw 0;
					});
					briskit(function() {
						calls.push( 1 );
						throw 1;
					});
					briskit(function() {
						calls.push( 2 );
						throw 2;
					});
				});

				expect( calls ).to.eql([]);
				expect( errors ).to.eql([]);

				setTimeout(function () {
					expect( calls ).to.eql([ 0 , 1 , 2 ]);
					expect( errors ).to.eql([ 0 , 1 , 2 ]);
					done();
				}, ERROR_WAIT);
			});

			it( 'should preserve the respective order of errors interleaved among successes' , function ( done ) {

				var calls = [];
				var errors = [];

				var d = domain.create();

				d.on( 'error' , function( error ) {
					errors.push( error );
				});

				d.run(function() {
					briskit(function() {
						calls.push( 0 );
					});
					briskit(function() {
						calls.push( 1 );
						throw 1;
					});
					briskit(function() {
						calls.push( 2 );
					});
					briskit(function() {
						calls.push( 3 );
						throw 3;
					});
					briskit(function() {
						calls.push( 4 );
						throw 4;
					});
					briskit(function() {
						calls.push( 5 );
					});
				});

				expect( calls ).to.eql([]);
				expect( errors ).to.eql([]);

				setTimeout(function() {
					expect( calls ).to.eql([ 0 , 1 , 2 , 3 , 4 , 5 ]);
					expect( errors ).to.eql([ 1 , 3 , 4 ]);
					done();
				}, ERROR_WAIT);
			});

			it( 'should execute tasks scheduled by another task that later throws an error' , function ( done ) {
				
				var errors = [];
				var d = domain.create();

				d.on( 'error' , function( error ) {
					errors.push( error );
				});

				d.run(function () {
					briskit(function () {
						briskit(function () {
							throw 1;
						});
						throw 0;
					});
				});

				expect( errors ).to.eql([]);

				setTimeout(function() {
					expect( errors ).to.eql([ 0 , 1 ]);
					done();
				}, ERROR_WAIT);
			});

			it( 'should execute a tree of tasks in breadth-first order when some tasks throw errors' , function ( done ) {
				
				var calls = [];
				var errors = [];

				var d = domain.create();

				d.on( 'error' , function( error ) {
					errors.push( error );
				});

				d.run(function() {

					briskit(function() {

						calls.push( 0 );

						briskit(function() {

							calls.push( 2 );

							briskit(function() {
								calls.push( 5 );
								throw 5;
							});

							briskit(function() {
								calls.push( 6 );
							});
						});

						briskit(function() {
							calls.push( 3 );
						});

						throw 0;
					});

					briskit(function() {

						calls.push( 1 );

						briskit(function() {
							calls.push( 4 );
							throw 4;
						});
					});
				});

				expect( calls ).to.eql([]);
				expect( errors ).to.eql([]);

				setTimeout(function() {
					expect( calls ).to.eql([ 0 , 1 , 2 , 3 , 4 , 5 , 6 ]);
					expect( errors ).to.eql([ 0 , 4 , 5 ]);
					done();
				}, ERROR_WAIT);
			});

		});

		describe( 'errors and recursion' , function() {

			it( 'should rethrow task errors while maintaining order of recursive tasks' , function ( done ) {

				var timesRecursed = 0;
				var errors = [];

				function go() {
					if (++timesRecursed < MAX_RECURSION) {
						briskit( go );
						throw timesRecursed - 1;
					}
				}

				var d = domain.create();

				d.on( 'error' , function( error ) {
					errors.push( error );
				});

				d.run(function() {
					briskit( go );
				});

				setTimeout(function () {
					expect( timesRecursed ).to.equal( MAX_RECURSION );
					expect( errors.length ).to.equal( MAX_RECURSION - 1 );
					for (var index = 0; index < MAX_RECURSION - 1; index++) {
						expect( errors[index] ).to.equal( index );
					}
					done();
				}, ERROR_WAIT);
			});

			it( 'should handle errors and maintain order while executing multiple parallel deep recursions' , function ( done ) {

				var timesRecursed1 = 0;
				var timesRecursed2 = 0;
				var timesRecursed3 = 0;
				var calls = [];
				var errors = [];

				function go1() {
					calls.push( timesRecursed1 * 3 );
					if (++timesRecursed1 < MAX_RECURSION) {
						briskit( go1 );
					}
				}

				function go2() {
					calls.push( timesRecursed2 * 3 + 1 );
					if (++timesRecursed2 < MAX_RECURSION) {
						briskit( go2 );
					}
				}

				function go3() {
					calls.push( timesRecursed3 * 3 + 2 );
					if (++timesRecursed3 < MAX_RECURSION) {
						briskit( go3 );
						throw timesRecursed3 - 1;
					}
				}

				var d = domain.create();

				d.on( 'error' , function( error ) {
					errors.push( error );
				});

				d.run(function() {
					briskit( go1 );
					briskit( go2 );
					briskit( go3 );
				});

				setTimeout(function () {
					expect( calls.length ).to.equal( MAX_RECURSION * 3 );
					for (var index = 0; index < MAX_RECURSION * 3; index++) {
						expect( calls[index] ).to.equal( index );
					}
					expect( errors.length ).to.equal( MAX_RECURSION - 1 );
					for (var index = 0; index < MAX_RECURSION - 1; index++) {
						expect( errors[index] ).to.equal( index );
					}
					done();
				}, ERROR_WAIT);
			});

		});

	};

}());


















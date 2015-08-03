module.exports = (function() {

  'use strict';

  return function( briskit ) {

    var Promise = require( 'es6-promise' ).Promise;
    var domain = require( 'domain' );
    var mocha = require( 'mocha' );
    var chai = require( 'chai' );
    var expect = chai.expect;


    var MAX_RECURSION = 10;
    var NORMAL_WAIT = 10;
    var ERROR_WAIT = 10;
    var TAB = new Array( 9 ).join( ' ' );


    if (typeof window != 'undefined') {
      // give phantom a chance
      NORMAL_WAIT = 200;
      ERROR_WAIT = 200;
    }


    before(function() {
      // override console.error so we don't get a bunch of messy output
      console.error = function(){};
    });

    after(function() {
      delete console.error;
    });

    describe( '::stack' , function() {
      it( 'should not flush concurrently when flushProvider is synchronous' , function( done ) {
        var expected = [], actual = [];
        var i = 0, max = 9, flushProviderCalled = 0;
        var stack = briskit.stack( undefined , function( cb ) {
          flushProviderCalled++;
          cb();
        });
        for (; i <= max; i++) {
          expected.push( i );
          (function( i ) {
            stack.enqueue(function() {
              actual.push( i );
              if (i < max) {
                stack.flush();
              }
              else {
                expect( actual ).to.eql( expected );
                expect( flushProviderCalled ).to.eql( 1 );
                done();
              }
            });
          }( i ));
        }
        stack.flush();
      });
      it( 'should not flush concurrently when flushProvider is asynchronous' , function( done ) {
        var expected = [], actual = [];
        var i = 0, max = 9, flushProviderCalled = 0;
        var stack = briskit.stack( undefined , function( cb ) {
          flushProviderCalled++;
          setTimeout( cb );
        });
        for (; i <= max; i++) {
          expected.push( i );
          (function( i ) {
            stack.enqueue(function() {
              actual.push( i );
              if (i < max) {
                stack.flush();
              }
              else {
                expect( actual ).to.eql( expected );
                expect( flushProviderCalled ).to.eql( 1 );
                done();
              }
            });
          }( i ));
        }
        stack.flush();
      });
      it( 'should support defer' , function( done ) {
        var stack = briskit.stack();
        var expected = [], actual = [];
        var i = 0, max = 999;
        stack.defer();
        for (; i <= max; i++) {
          expected.push( expected.length );
          stack.enqueue(function() {
            actual.push( actual.length );
          });
        }
        expect( actual ).to.have.length( 0 );
        stack.flush();
        expect( actual ).to.have.length( expected.length );
        done();
      });
    });

    describe( '::use' , function() {
      it( 'should accept a custom provider' , function( done ) {
        var customProviderCalled = 0;
        briskit.use(function( cb ) {
          return function() {
            customProviderCalled++;
            cb();
          };
        });
        briskit(function(){
          expect( customProviderCalled ).to.equal( 1 );
        });
        briskit(function(){
          expect( customProviderCalled ).to.equal( 2 );
        });
        briskit(function(){
          expect( customProviderCalled ).to.equal( 3 );
        });
        briskit.use();
        done();
      });
      it( 'should change the async provider if a string is passed' , function( done ) {
        var provider = (typeof window != 'undefined' ? 'nextTick' : 'observer');
        briskit.use( provider );
        expect(function() {
          briskit(function(){});
        }).to.throw;
        setTimeout(function() {
          done();
        });
      });
      it( 'should use the best available async provider if nothing is passed' , function( done ) {
        briskit.use();
        expect(function() {
          briskit(function(){});
        }).to.not.throw;
        setTimeout(function() {
          done();
        });
      });
    });

    describe( '::fork' , function() {
      it( 'should fork a briskit instance' , function( done ) {
        var f1 = briskit.fork();
        var f2 = f1.fork();
        f1.use( 'timeout' );
        f2.use( typeof window != 'undefined' ? 'worker' : 'nextTick' );
        Promise.all([
          new Promise(function( resolve ) {
            f1( resolve );
          })
          .then(function() {
            return Date.now();
          }),
          new Promise(function( resolve ) {
            f2( resolve );
          })
          .then(function() {
            return Date.now();
          })
        ])
        .then(function( timestamps ) {
          try {
            expect( timestamps[0] ).to.be.gte( timestamps[1] );
          }
          catch( err ) {
            if (typeof window == 'undefined') {
              console.log( TAB + '\x1b[33mWARNING: failed to execute tick before timeout\x1b[0m' );
            }
            else {
              return Promise.reject( err );
            }
          }
          done();
        })
        .catch( done );
      });
    });

    (function() {
      var calls = 0;
      var expected = 10;
      var fork = briskit.fork();

      describe( '::defer' , function() {
        it( 'should prevent a briskit instance from flushing' , function( done ) {
          fork.defer();
          for (var i = 0; i < expected; i++) {
            fork(function() {
              calls++;
            });
          }
          setTimeout(function() {
            expect( calls ).to.equal( 0 );
            done();
          },NORMAL_WAIT);
        });
      });

      describe( '::flush' , function() {
        it( 'should flush a deferred briskit instance' , function( done ) {
          fork.flush();
          setTimeout(function() {
            expect( calls ).to.equal( expected );
            done();
          },NORMAL_WAIT);
        });
      });
    }());

    describe( 'general' , function() {

      it( 'should call a task in the future' , function( done ) {
        var called = false;
        briskit(function () {
          called = true;
          done();
        });
        expect( called ).to.not.be.ok;
      });

      it( 'should maintain task order' , function( done ) {

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

      it( 'should maintain breadth-first order' , function( done ) {

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

      it( 'should allow for recursive scheduling' , function( done ) {

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

      it( 'can recurse ' + MAX_RECURSION + ' tasks deep' , function( done ) {

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

      it( 'can execute two branches of recursion in parallel' , function( done ) {

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

      it( 'should preserve the order of thrown errors' , function( done ) {

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

      it( 'should preserve the respective order of errors interleaved among successes' , function( done ) {

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

      it( 'should execute tasks scheduled by another task that later throws an error' , function( done ) {
        
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

      it( 'should execute a tree of tasks in breadth-first order when some tasks throw errors' , function( done ) {
        
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

      it( 'should rethrow task errors while maintaining order of recursive tasks' , function( done ) {

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

      it( 'should handle errors and maintain order while executing multiple parallel deep recursions' , function( done ) {

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

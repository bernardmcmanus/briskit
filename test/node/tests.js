module.exports = (function() {

  'use strict';

  var colors = require( 'colors' );
  var chai = require( 'chai' );
  var expect = chai.expect;

  
  var TAB = new Array( 9 ).join( ' ' );


  return function( briskit ) {

    describe( 'platform-specific' , function() {

      it( 'should use setImmediate when running in node' , function ( done ) {
        var called = false, ticked = false;
        setTimeout(function() {
          if (ticked) {
            expect( called ).to.be.ok;
          }
          else {
            console.log(( TAB + 'WARNING: failed to execute tick before timeout' ).yellow );
          }
          done();
        }, 1);
        setImmediate(function() {
          ticked = true;
        });
        briskit(function () {
          called = true;
        });
      });

    });

  };

}());


















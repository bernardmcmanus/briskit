export default function Stack( $async ) {
  var queue = Array( 1024 );
  var length = 0;
  var deferred = false;
  var inprog = false;

  var $stack = function( cb ) {
    queue[length] = cb;
    length++;
    if (!deferred) {
      $async( flush );
    }
  };

  $stack.defer = function() {
    deferred = true;
  };

  $stack.release = function() {
    deferred = false;
    $async( flush );
  };

  function flush() {
    var cb, i = 0;
    if (!inprog) {
      inprog = true;
      for (; i < length; i++) {
        cb = queue[i];
        queue[i] = UNDEFINED;
        try {
          cb();
        }
        catch( err ) {
          /* jshint ignore:start */
          setTimeout(function() {
            console.error( err.stack || err );
            throw err;
          });
          /* jshint ignore:end */
        }
      }
      inprog = false;
      length = 0;
    }
  }

  return $stack;
}

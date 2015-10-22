/**
 * @class Stack
 * @param {boolean} [autoflush=false] - When true, the stack will attempt to flush as soon as a callback is enqueued.
 * @param {function} [provider] - The function used for flush calls. Synchronous by default.
 * @param {number} [prealloc=1024] - The preallocated stack size.
 */
export default function Stack( autoflush , provider , prealloc ){
  autoflush = !!autoflush;
  provider = provider || function( cb ){ cb(); };

  var queue = Array( prealloc || 1024 );
  var length = 0;
  var deferred = !autoflush;
  var inprog = false;

  var $stack = {
    enqueue: function( cb ){
      queue[length] = cb;
      length++;
      if (!deferred) {
        _flush();
      }
    },
    defer: function(){
      deferred = true;
    },
    flush: function(){
      deferred = !autoflush;
      _flush();
    }
  };

  function _flush(){
    if (!inprog) {
      inprog = true;
      provider(function(){
        var cb, i = 0;
        for (; i < length; i++) {
          cb = queue[i];
          queue[i] = UNDEFINED;
          try {
            cb();
          }
          catch( err ){
            /* jshint ignore:start */
            setTimeout(function(){
              console.error( err.stack || err );
              throw err;
            });
            /* jshint ignore:end */
          }
        }
        inprog = false;
        length = 0;
      });
    }
  }

  return $stack;
}

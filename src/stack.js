import { timeout, getProvider } from 'providers';

export var stack = Array( 1024 );
export var length = 0;
export var errors = [];

export default function scheduleTask( cb , arg ) {
  stack[length] = cb;
  stack[length+1] = arg;
  length += 2;
  if (length == 2) {
    getProvider()();
  }
}

export function flush() {
  var cb, arg;
  for (var i = 0; i < length; i += 2) {
    cb = stack[i];
    arg = stack[i+1];
    stack[i] = $UNDEFINED;
    stack[i+1] = $UNDEFINED;
    try {
      cb( arg );
    }
    catch( err ) {
      scheduleError( err );
    }
  }
  length = 0;
}

export function scheduleError( err ) {
  errors.push( err );
  timeout(function() {
    var err = errors.shift();
    if (err !== $UNDEFINED) {
      console.error( err.stack || err );
      throw err;
    }
  })();
}

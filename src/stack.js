import { $Array, $UNDEFINED } from 'static';
import async from 'async';

export var stack = new $Array( 1024 );
export var length = 0;

export function flush() {
	var callback, arg;
	for (var i = 0; i < length; i += 2) {
		callback = stack[i];
		arg = stack[i+1];
		callback( arg );
		stack[i] = $UNDEFINED;
		stack[i+1] = $UNDEFINED;
	}
	length = 0;
}

export function schedule( callback , arg ) {
	stack[length] = callback;
	stack[length+1] = arg;
	length += 2;
	if (length == 2) {
		// this 0 argument does nothing, but the transpiler
		// throws a syntax error without it
		async( 0 );
	}
}




















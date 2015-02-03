import { $global, $UNDEFINED } from 'static';
import { flush } from 'stack';

var MutationObserver = (function() {
	var observer = $global.MutationObserver || $global.WebKitMutationObserver;
	return observer ? observer : false;
}());

var MessageChannel = (function() {
	// don't use worker if this is IE10
	var channel = $global.MessageChannel;
	var Uint8ClampedArray = $global.Uint8ClampedArray;
	return Uint8ClampedArray && channel ? channel : false;
}());

var setImmediate = (function() {
	var si = $global.setImmediate;
	return si ? si : false;
}());

export default (function() {
	if (setImmediate) {
		console.log('nextTick');
		return nextTick();
	}
	else if (MutationObserver) {
		console.log('observer');
		return observer();
	}
	else if (MessageChannel) {
		console.log('channel');
		return channel();
	}
	else {
		console.log('timeout');
		return timeout();
	}
}());

export function nextTick() {
	return function() {
		setImmediate( flush );
	};
}

export function observer() {
	var iterations = 0;
	var observer = new MutationObserver( flush );
	var node = document.createTextNode( '' );
	observer.observe( node , { characterData: true });
	return function() {
		node.data = (iterations = ++iterations % 2);
	};
}

export function channel() {
	var channel = new MessageChannel();
	channel.port1.onmessage = flush;
	return function() {
		channel.port2.postMessage( 0 );
	};
}

export function timeout() {
	return function() {
		setTimeout( flush , 1 );
	};
}





















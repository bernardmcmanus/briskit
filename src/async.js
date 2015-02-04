import { $global } from 'static';
import { flush } from 'stack';

var MutationObserver = (function() {
	var m = $global.MutationObserver;
	return m ? m : false;
}());

var MessageChannel = (function() {
	// don't use worker if this is IE10
	var worker = $global.MessageChannel;
	var Uint8ClampedArray = $global.Uint8ClampedArray;
	return Uint8ClampedArray && worker ? worker : false;
}());

var setImmediate = (function() {
	var si = $global.setImmediate;
	return si ? si : false;
}());

export var scheduleFlush = (function() {
	if (setImmediate) {
		//console.log('nextTick');
		return nextTick( flush );
	}
	else if (MutationObserver) {
		//console.log('observer');
		return observer( flush );
	}
	else if (MessageChannel) {
		//console.log('channel');
		return channel( flush );
	}
	else {
		//console.log('timeout');
		return timeout( flush );
	}
}());

export function nextTick( cb ) {
	return function() {
		setImmediate( cb );
	};
}

export function observer( cb ) {
	var iterations = 0;
	var m = new MutationObserver( cb );
	var node = document.createTextNode( '' );
	m.observe( node , { characterData: true });
	return function() {
		node.data = (iterations = ++iterations % 2);
	};
}

export function channel( cb ) {
	var worker = new MessageChannel();
	worker.port1.onmessage = cb;
	return function() {
		worker.port2.postMessage( 0 );
	};
}

export function timeout( cb ) {
	return function() {
		setTimeout( cb , 1 );
	};
}





















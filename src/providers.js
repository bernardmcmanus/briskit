import { flush } from 'stack';
import { chooseProvider } from 'async';

var async$provider;

export default {
  nextTick: nextTick,
  observer: observer,
  worker: worker,
  timeout: timeout
};

export function getProvider() {
  return async$provider( flush );
}

export function setProvider( provider ) {
  if (provider) {
    async$provider = provider;
  }
  else {
    chooseProvider();
  }
}

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

export function worker( cb ) {
  var channel = new MessageChannel();
  channel.port1.onmessage = cb;
  return function() {
    channel.port2.postMessage( 0 );
  };
}

export function timeout( cb ) {
  return function() {
    setTimeout( cb , 1 );
  };
}

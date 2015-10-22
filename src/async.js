export default function AsyncProvider(){
  var $provider;
  function $async( cb ){
    $provider( cb )();
  }
  $async.use = function( arg ){
    $provider = providers[arg] || arg || chooseProvider();
  };
  return $async;
}

export var providers = { nextTick , observer , worker , timeout };

export function chooseProvider( customProvider ){
  if ($setImmediate) {
    return nextTick;
  }
  else if ($MutationObserver) {
    return observer;
  }
  else if ($MessageChannel) {
    return worker;
  }
  return timeout;
}

export function nextTick( cb ){
  return function(){
    setImmediate( cb );
  };
}

export function observer( cb ){
  var iterations = 0;
  var m = new MutationObserver( cb );
  var node = document.createTextNode( '' );
  m.observe( node , { characterData: true });
  return function(){
    node.data = (iterations = ++iterations % 2);
  };
}

export function worker( cb ){
  var channel = new MessageChannel();
  channel.port1.onmessage = cb;
  return function(){
    channel.port2.postMessage( 0 );
  };
}

export function timeout( cb ){
  return function(){
    setTimeout( cb );
  };
}

var $setImmediate = (function(){
  var si = global.setImmediate;
  return si ? si : false;
}());

var $MutationObserver = (function(){
  var m = global.MutationObserver;
  return m ? m : false;
}());

var $MessageChannel = (function(){
  // don't use worker if this is IE10
  var channel = global.MessageChannel;
  var Uint8ClampedArray = global.Uint8ClampedArray;
  return Uint8ClampedArray && channel ? channel : false;
}());

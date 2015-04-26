import { $global } from 'static';
import {
  setProvider,
  nextTick,
  observer,
  worker,
  timeout
} from 'providers';

export function chooseProvider() {
  if (setImmediate) {
    setProvider( nextTick );
  }
  else if (MutationObserver) {
    setProvider( observer );
  }
  else if (MessageChannel) {
    setProvider( worker );
  }
  else {
    setProvider( timeout );
  }
}

var setImmediate = (function() {
  var si = $global.setImmediate;
  return si ? si : false;
}());

var MutationObserver = (function() {
  var m = $global.MutationObserver;
  return m ? m : false;
}());

var MessageChannel = (function() {
  // don't use worker if this is IE10
  var channel = $global.MessageChannel;
  var Uint8ClampedArray = $global.Uint8ClampedArray;
  return Uint8ClampedArray && channel ? channel : false;
}());

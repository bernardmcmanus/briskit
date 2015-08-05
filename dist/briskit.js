/*! briskit - 1.1.0 - Bernard McManus - fce211e - 2015-08-05 */

(function($global,Array,setTimeout,UNDEFINED) {

(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.briskit = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = AsyncProvider;
exports.chooseProvider = chooseProvider;
exports.nextTick = nextTick;
exports.observer = observer;
exports.worker = worker;
exports.timeout = timeout;

function AsyncProvider() {
  var $provider;
  function $async(cb) {
    $provider(cb)();
  }
  $async.use = function (arg) {
    $provider = providers[arg] || arg || chooseProvider();
  };
  return $async;
}

var providers = { nextTick: nextTick, observer: observer, worker: worker, timeout: timeout };

exports.providers = providers;

function chooseProvider(customProvider) {
  if ($setImmediate) {
    return nextTick;
  } else if ($MutationObserver) {
    return observer;
  } else if ($MessageChannel) {
    return worker;
  }
  return timeout;
}

function nextTick(cb) {
  return function () {
    setImmediate(cb);
  };
}

function observer(cb) {
  var iterations = 0;
  var m = new MutationObserver(cb);
  var node = document.createTextNode('');
  m.observe(node, { characterData: true });
  return function () {
    node.data = iterations = ++iterations % 2;
  };
}

function worker(cb) {
  var channel = new MessageChannel();
  channel.port1.onmessage = cb;
  return function () {
    channel.port2.postMessage(0);
  };
}

function timeout(cb) {
  return function () {
    setTimeout(cb);
  };
}

var $setImmediate = (function () {
  var si = $global.setImmediate;
  return si ? si : false;
})();

var $MutationObserver = (function () {
  var m = $global.MutationObserver;
  return m ? m : false;
})();

var $MessageChannel = (function () {
  // don't use worker if this is IE10
  var channel = $global.MessageChannel;
  var Uint8ClampedArray = $global.Uint8ClampedArray;
  return Uint8ClampedArray && channel ? channel : false;
})();

},{}],2:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _stack = _dereq_('stack');

var _stack2 = _interopRequireDefault(_stack);

var _async = _dereq_('async');

var _async2 = _interopRequireDefault(_async);

exports['default'] = fork();

function Briskit() {
  var $async = new _async2['default']();
  var $stack = new _stack2['default'](true, $async);
  var $briskit = function $briskit(cb) {
    $stack.enqueue(cb);
  };
  $briskit.defer = $stack.defer;
  $briskit.flush = $stack.flush;
  $briskit.use = $async.use;
  $briskit.fork = fork;
  $briskit.use();
  return $briskit;
}

function fork() {
  var briskit = new Briskit();
  briskit.stack = _stack2['default'];
  return briskit;
}
module.exports = exports['default'];

},{"async":1,"stack":3}],3:[function(_dereq_,module,exports){
/**
 * @class Stack
 * @param {boolean} [autoflush=false] - When true, the stack will attempt to flush as soon as a callback is enqueued.
 * @param {function} [provider] - The function used for flush calls. Synchronous by default.
 * @param {number} [prealloc=1024] - The preallocated stack size.
 */
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = Stack;

function Stack(autoflush, provider, prealloc) {
  autoflush = !!autoflush;
  provider = provider || function (cb) {
    cb();
  };

  var queue = Array(prealloc || 1024);
  var length = 0;
  var deferred = !autoflush;
  var inprog = false;

  var $stack = {
    enqueue: function enqueue(cb) {
      queue[length] = cb;
      length++;
      if (!deferred) {
        _flush();
      }
    },
    defer: function defer() {
      deferred = true;
    },
    flush: function flush() {
      deferred = !autoflush;
      _flush();
    }
  };

  function _flush() {
    if (!inprog) {
      inprog = true;
      provider(function () {
        var cb,
            i = 0;
        for (; i < length; i++) {
          cb = queue[i];
          queue[i] = UNDEFINED;
          try {
            cb();
          } catch (err) {
            /* jshint ignore:start */
            setTimeout(function () {
              console.error(err.stack || err);
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

module.exports = exports["default"];

},{}]},{},[2])(2)
});
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvYm1jbWFudXMvYnJpc2tpdC9zcmMvYXN5bmMuanMiLCIvVXNlcnMvYm1jbWFudXMvYnJpc2tpdC9zcmMvaW5kZXguanMiLCIvVXNlcnMvYm1jbWFudXMvYnJpc2tpdC9zcmMvc3RhY2suanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztxQkNBd0IsYUFBYTs7Ozs7OztBQUF0QixTQUFTLGFBQWEsR0FBRztBQUN0QyxNQUFJLFNBQVMsQ0FBQztBQUNkLFdBQVMsTUFBTSxDQUFFLEVBQUUsRUFBRztBQUNwQixhQUFTLENBQUUsRUFBRSxDQUFFLEVBQUUsQ0FBQztHQUNuQjtBQUNELFFBQU0sQ0FBQyxHQUFHLEdBQUcsVUFBVSxHQUFHLEVBQUc7QUFDM0IsYUFBUyxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLElBQUksY0FBYyxFQUFFLENBQUM7R0FDdkQsQ0FBQztBQUNGLFNBQU8sTUFBTSxDQUFDO0NBQ2Y7O0FBRU0sSUFBSSxTQUFTLEdBQUcsRUFBRSxRQUFRLEVBQVIsUUFBUSxFQUFHLFFBQVEsRUFBUixRQUFRLEVBQUcsTUFBTSxFQUFOLE1BQU0sRUFBRyxPQUFPLEVBQVAsT0FBTyxFQUFFLENBQUM7Ozs7QUFFM0QsU0FBUyxjQUFjLENBQUUsY0FBYyxFQUFHO0FBQy9DLE1BQUksYUFBYSxFQUFFO0FBQ2pCLFdBQU8sUUFBUSxDQUFDO0dBQ2pCLE1BQ0ksSUFBSSxpQkFBaUIsRUFBRTtBQUMxQixXQUFPLFFBQVEsQ0FBQztHQUNqQixNQUNJLElBQUksZUFBZSxFQUFFO0FBQ3hCLFdBQU8sTUFBTSxDQUFDO0dBQ2Y7QUFDRCxTQUFPLE9BQU8sQ0FBQztDQUNoQjs7QUFFTSxTQUFTLFFBQVEsQ0FBRSxFQUFFLEVBQUc7QUFDN0IsU0FBTyxZ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RixjQUFFLEVBQUUsQ0FBQztXQUNOLENBQ0QsT0FBTyxHQUFHLEVBQUc7O0FBRVgsc0JBQVUsQ0FBQyxZQUFXO0FBQ3BCLHFCQUFPLENBQUMsS0FBSyxDQUFFLEdBQUcsQ0FBQyxLQUFLLElBQUksR0FBRyxDQUFFLENBQUM7QUFDbEMsb0JBQU0sR0FBRyxDQUFDO2FBQ1gsQ0FBQyxDQUFDOztXQUVKO1NBQ0Y7QUFDRCxjQUFNLEdBQUcsS0FBSyxDQUFDO0FBQ2YsY0FBTSxHQUFHLENBQUMsQ0FBQztPQUNaLENBQUMsQ0FBQztLQUNKO0dBQ0Y7O0FBRUQsU0FBTyxNQUFNLENBQUM7Q0FDZiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBBc3luY1Byb3ZpZGVyKCkge1xuICB2YXIgJHByb3ZpZGVyO1xuICBmdW5jdGlvbiAkYXN5bmMoIGNiICkge1xuICAgICRwcm92aWRlciggY2IgKSgpO1xuICB9XG4gICRhc3luYy51c2UgPSBmdW5jdGlvbiggYXJnICkge1xuICAgICRwcm92aWRlciA9IHByb3ZpZGVyc1thcmddIHx8IGFyZyB8fCBjaG9vc2VQcm92aWRlcigpO1xuICB9O1xuICByZXR1cm4gJGFzeW5jO1xufVxuXG5leHBvcnQgdmFyIHByb3ZpZGVycyA9IHsgbmV4dFRpY2sgLCBvYnNlcnZlciAsIHdvcmtlciAsIHRpbWVvdXQgfTtcblxuZXhwb3J0IGZ1bmN0aW9uIGNob29zZVByb3ZpZGVyKCBjdXN0b21Qcm92aWRlciApIHtcbiAgaWYgKCRzZXRJbW1lZGlhdGUpIHtcbiAgICByZXR1cm4gbmV4dFRpY2s7XG4gIH1cbiAgZWxzZSBpZiAoJE11dGF0aW9uT2JzZXJ2ZXIpIHtcbiAgICByZXR1cm4gb2JzZXJ2ZXI7XG4gIH1cbiAgZWxzZSBpZiAoJE1lc3NhZ2VDaGFubmVsKSB7XG4gICAgcmV0dXJuIHdvcmtlcjtcbiAgfVxuICByZXR1cm4gdGltZW91dDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5leHRUaWNrKCBjYiApIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHNldEltbWVkaWF0ZSggY2IgKTtcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG9ic2VydmVyKCBjYiApIHtcbiAgdmFyIGl0ZXJhdGlvbnMgPSAwO1xuICB2YXIgbSA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKCBjYiApO1xuICB2YXIgbm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCAnJyApO1xuICBtLm9ic2VydmUoIG5vZGUgLCB7IGNoYXJhY3RlckRhdGE6IHRydWUgfSk7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICBub2RlLmRhdGEgPSAoaXRlcmF0aW9ucyA9ICsraXRlcmF0aW9ucyAlIDIpO1xuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gd29ya2VyKCBjYiApIHtcbiAgdmFyIGNoYW5uZWwgPSBuZXcgTWVzc2FnZUNoYW5uZWwoKTtcbiAgY2hhbm5lbC5wb3J0MS5vbm1lc3NhZ2UgPSBjYjtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIGNoYW5uZWwucG9ydDIucG9zdE1lc3NhZ2UoIDAgKTtcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRpbWVvdXQoIGNiICkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgc2V0VGltZW91dCggY2IgKTtcbiAgfTtcbn1cblxudmFyICRzZXRJbW1lZGlhdGUgPSAoZnVuY3Rpb24oKSB7XG4gIHZhciBzaSA9ICRnbG9iYWwuc2V0SW1tZWRpYXRlO1xuICByZXR1cm4gc2kgPyBzaSA6IGZhbHNlO1xufSgpKTtcblxudmFyICRNdXRhdGlvbk9ic2VydmVyID0gKGZ1bmN0aW9uKCkge1xuICB2YXIgbSA9ICRnbG9iYWwuTXV0YXRpb25PYnNlcnZlcjtcbiAgcmV0dXJuIG0gPyBtIDogZmFsc2U7XG59KCkpO1xuXG52YXIgJE1lc3NhZ2VDaGFubmVsID0gKGZ1bmN0aW9uKCkge1xuICAvLyBkb24ndCB1c2Ugd29ya2VyIGlmIHRoaXMgaXMgSUUxMFxuICB2YXIgY2hhbm5lbCA9ICRnbG9iYWwuTWVzc2FnZUNoYW5uZWw7XG4gIHZhciBVaW50OENsYW1wZWRBcnJheSA9ICRnbG9iYWwuVWludDhDbGFtcGVkQXJyYXk7XG4gIHJldHVybiBVaW50OENsYW1wZWRBcnJheSAmJiBjaGFubmVsID8gY2hhbm5lbCA6IGZhbHNlO1xufSgpKTtcbiIsImltcG9ydCBTdGFjayBmcm9tICdzdGFjayc7XG5pbXBvcnQgQXN5bmNQcm92aWRlciBmcm9tICdhc3luYyc7XG5cbmV4cG9ydCBkZWZhdWx0IGZvcmsoKTtcblxuZnVuY3Rpb24gQnJpc2tpdCgpIHtcbiAgdmFyICRhc3luYyA9IG5ldyBBc3luY1Byb3ZpZGVyKCk7XG4gIHZhciAkc3RhY2sgPSBuZXcgU3RhY2soIHRydWUgLCAkYXN5bmMgKTtcbiAgdmFyICRicmlza2l0ID0gZnVuY3Rpb24oIGNiICkge1xuICAgICRzdGFjay5lbnF1ZXVlKCBjYiApO1xuICB9O1xuICAkYnJpc2tpdC5kZWZlciA9ICRzdGFjay5kZWZlcjtcbiAgJGJyaXNraXQuZmx1c2ggPSAkc3RhY2suZmx1c2g7XG4gICRicmlza2l0LnVzZSA9ICRhc3luYy51c2U7XG4gICRicmlza2l0LmZvcmsgPSBmb3JrO1xuICAkYnJpc2tpdC51c2UoKTtcbiAgcmV0dXJuICRicmlza2l0O1xufVxuXG5mdW5jdGlvbiBmb3JrKCkge1xuICB2YXIgYnJpc2tpdCA9IG5ldyBCcmlza2l0KCk7XG4gIGJyaXNraXQuc3RhY2sgPSBTdGFjaztcbiAgcmV0dXJuIGJyaXNraXQ7XG59XG4iLCIvKipcbiAqIEBjbGFzcyBTdGFja1xuICogQHBhcmFtIHtib29sZWFufSBbYXV0b2ZsdXNoPWZhbHNlXSAtIFdoZW4gdHJ1ZSwgdGhlIHN0YWNrIHdpbGwgYXR0ZW1wdCB0byBmbHVzaCBhcyBzb29uIGFzIGEgY2FsbGJhY2sgaXMgZW5xdWV1ZWQuXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBbcHJvdmlkZXJdIC0gVGhlIGZ1bmN0aW9uIHVzZWQgZm9yIGZsdXNoIGNhbGxzLiBTeW5jaHJvbm91cyBieSBkZWZhdWx0LlxuICogQHBhcmFtIHtudW1iZXJ9IFtwcmVhbGxvYz0xMDI0XSAtIFRoZSBwcmVhbGxvY2F0ZWQgc3RhY2sgc2l6ZS5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gU3RhY2soIGF1dG9mbHVzaCAsIHByb3ZpZGVyICwgcHJlYWxsb2MgKSB7XG4gIGF1dG9mbHVzaCA9ICEhYXV0b2ZsdXNoO1xuICBwcm92aWRlciA9IHByb3ZpZGVyIHx8IGZ1bmN0aW9uKCBjYiApeyBjYigpOyB9O1xuXG4gIHZhciBxdWV1ZSA9IEFycmF5KCBwcmVhbGxvYyB8fCAxMDI0ICk7XG4gIHZhciBsZW5ndGggPSAwO1xuICB2YXIgZGVmZXJyZWQgPSAhYXV0b2ZsdXNoO1xuICB2YXIgaW5wcm9nID0gZmFsc2U7XG5cbiAgdmFyICRzdGFjayA9IHtcbiAgICBlbnF1ZXVlOiBmdW5jdGlvbiggY2IgKSB7XG4gICAgICBxdWV1ZVtsZW5ndGhdID0gY2I7XG4gICAgICBsZW5ndGgrKztcbiAgICAgIGlmICghZGVmZXJyZWQpIHtcbiAgICAgICAgX2ZsdXNoKCk7XG4gICAgICB9XG4gICAgfSxcbiAgICBkZWZlcjogZnVuY3Rpb24oKSB7XG4gICAgICBkZWZlcnJlZCA9IHRydWU7XG4gICAgfSxcbiAgICBmbHVzaDogZnVuY3Rpb24oKSB7XG4gICAgICBkZWZlcnJlZCA9ICFhdXRvZmx1c2g7XG4gICAgICBfZmx1c2goKTtcbiAgICB9XG4gIH07XG5cbiAgZnVuY3Rpb24gX2ZsdXNoKCkge1xuICAgIGlmICghaW5wcm9nKSB7XG4gICAgICBpbnByb2cgPSB0cnVlO1xuICAgICAgcHJvdmlkZXIoZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBjYiwgaSA9IDA7XG4gICAgICAgIGZvciAoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBjYiA9IHF1ZXVlW2ldO1xuICAgICAgICAgIHF1ZXVlW2ldID0gVU5ERUZJTkVEO1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjYigpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjYXRjaCggZXJyICkge1xuICAgICAgICAgICAgLyoganNoaW50IGlnbm9yZTpzdGFydCAqL1xuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgY29uc29sZS5lcnJvciggZXJyLnN0YWNrIHx8IGVyciApO1xuICAgICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIC8qIGpzaGludCBpZ25vcmU6ZW5kICovXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlucHJvZyA9IGZhbHNlO1xuICAgICAgICBsZW5ndGggPSAwO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuICRzdGFjaztcbn1cbiJdfQ==


}((typeof global != "undefined" ? global : typeof self != "undefined" ? self : typeof window != "undefined" ? window : {}),Array,setTimeout))
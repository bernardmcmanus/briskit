/*! briskit - 1.1.0 - Bernard McManus - 3391f21 - 2015-08-03 */

(function($global,Array,setTimeout,UNDEFINED) {

(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.standalone = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvYm1jbWFudXMvYnJpc2tpdC9zcmMvYXN5bmMuanMiLCIvVXNlcnMvYm1jbWFudXMvYnJpc2tpdC9zcmMvaW5kZXguanMiLCIvVXNlcnMvYm1jbWFudXMvYnJpc2tpdC9zcmMvc3RhY2suanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztxQkNBd0IsYUFBYTtRQWFyQixjQUFjLEdBQWQsY0FBYztRQWFkLFFBQVEsR0FBUixRQUFRO1FBTVIsUUFBUSxHQUFSLFFBQVE7UUFVUixNQUFNLEdBQU4sTUFBTTtRQVFOLE9BQU8sR0FBUCxPQUFPOztBQWxEUixTQUFTLGFBQWEsR0FBRztBQUN0QyxNQUFJLFNBQVMsQ0FBQztBQUNkLFdBQVMsTUFBTSxDQUFFLEVBQUUsRUFBRztBQUNwQixhQUFTLENBQUUsRUFBRSxDQUFFLEVBQUUsQ0FBQztHQUNuQjtBQUNELFFBQU0sQ0FBQyxHQUFHLEdBQUcsVUFBVSxHQUFHLEVBQUc7QUFDM0IsYUFBUyxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLElBQUksY0FBYyxFQUFFLENBQUM7R0FDdkQsQ0FBQztBQUNGLFNBQU8sTUFBTSxDQUFDO0NBQ2Y7O0FBRU0sSUFBSSxTQUFTLEdBQUcsRUFBRSxRQUFRLEVBQVIsUUFBUSxFQUFHLFFBQVEsRUFBUixRQUFRLEVBQUcsTUFBTSxFQUFOLE1BQU0sRUFBRyxPQUFPLEVBQVAsT0FBTyxFQUFFLENBQUM7O1FBQXZELFNBQVMsR0FBVCxTQUFTOztBQUViLFNBQVMsY0FBYyxDQUFFLGNBQWMsRUFBRztBQUMvQyxNQUFJLGFBQWEsRUFBRTtBQUNqQixXQUFPLFFBQVEsQ0FBQztHQUNqQixNQUNJLElBQUksaUJBQWlCLEVBQUU7QUFDMUIsV0FBTyxRQUFRLENBQUM7R0FDakIs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RUFBRSxDQUFDLEVBQUUsRUFBRTtBQUN0QixZQUFFLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2QsZUFBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQztBQUNyQixjQUFJO0FBQ0YsY0FBRSxFQUFFLENBQUM7V0FDTixDQUNELE9BQU8sR0FBRyxFQUFHOztBQUVYLHNCQUFVLENBQUMsWUFBVztBQUNwQixxQkFBTyxDQUFDLEtBQUssQ0FBRSxHQUFHLENBQUMsS0FBSyxJQUFJLEdBQUcsQ0FBRSxDQUFDO0FBQ2xDLG9CQUFNLEdBQUcsQ0FBQzthQUNYLENBQUMsQ0FBQzs7V0FFSjtTQUNGO0FBQ0QsY0FBTSxHQUFHLEtBQUssQ0FBQztBQUNmLGNBQU0sR0FBRyxDQUFDLENBQUM7T0FDWixDQUFDLENBQUM7S0FDSjtHQUNGOztBQUVELFNBQU8sTUFBTSxDQUFDO0NBQ2YiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gQXN5bmNQcm92aWRlcigpIHtcbiAgdmFyICRwcm92aWRlcjtcbiAgZnVuY3Rpb24gJGFzeW5jKCBjYiApIHtcbiAgICAkcHJvdmlkZXIoIGNiICkoKTtcbiAgfVxuICAkYXN5bmMudXNlID0gZnVuY3Rpb24oIGFyZyApIHtcbiAgICAkcHJvdmlkZXIgPSBwcm92aWRlcnNbYXJnXSB8fCBhcmcgfHwgY2hvb3NlUHJvdmlkZXIoKTtcbiAgfTtcbiAgcmV0dXJuICRhc3luYztcbn1cblxuZXhwb3J0IHZhciBwcm92aWRlcnMgPSB7IG5leHRUaWNrICwgb2JzZXJ2ZXIgLCB3b3JrZXIgLCB0aW1lb3V0IH07XG5cbmV4cG9ydCBmdW5jdGlvbiBjaG9vc2VQcm92aWRlciggY3VzdG9tUHJvdmlkZXIgKSB7XG4gIGlmICgkc2V0SW1tZWRpYXRlKSB7XG4gICAgcmV0dXJuIG5leHRUaWNrO1xuICB9XG4gIGVsc2UgaWYgKCRNdXRhdGlvbk9ic2VydmVyKSB7XG4gICAgcmV0dXJuIG9ic2VydmVyO1xuICB9XG4gIGVsc2UgaWYgKCRNZXNzYWdlQ2hhbm5lbCkge1xuICAgIHJldHVybiB3b3JrZXI7XG4gIH1cbiAgcmV0dXJuIHRpbWVvdXQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBuZXh0VGljayggY2IgKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICBzZXRJbW1lZGlhdGUoIGNiICk7XG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBvYnNlcnZlciggY2IgKSB7XG4gIHZhciBpdGVyYXRpb25zID0gMDtcbiAgdmFyIG0gPSBuZXcgTXV0YXRpb25PYnNlcnZlciggY2IgKTtcbiAgdmFyIG5vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSggJycgKTtcbiAgbS5vYnNlcnZlKCBub2RlICwgeyBjaGFyYWN0ZXJEYXRhOiB0cnVlIH0pO1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgbm9kZS5kYXRhID0gKGl0ZXJhdGlvbnMgPSArK2l0ZXJhdGlvbnMgJSAyKTtcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHdvcmtlciggY2IgKSB7XG4gIHZhciBjaGFubmVsID0gbmV3IE1lc3NhZ2VDaGFubmVsKCk7XG4gIGNoYW5uZWwucG9ydDEub25tZXNzYWdlID0gY2I7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICBjaGFubmVsLnBvcnQyLnBvc3RNZXNzYWdlKCAwICk7XG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0aW1lb3V0KCBjYiApIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHNldFRpbWVvdXQoIGNiICk7XG4gIH07XG59XG5cbnZhciAkc2V0SW1tZWRpYXRlID0gKGZ1bmN0aW9uKCkge1xuICB2YXIgc2kgPSAkZ2xvYmFsLnNldEltbWVkaWF0ZTtcbiAgcmV0dXJuIHNpID8gc2kgOiBmYWxzZTtcbn0oKSk7XG5cbnZhciAkTXV0YXRpb25PYnNlcnZlciA9IChmdW5jdGlvbigpIHtcbiAgdmFyIG0gPSAkZ2xvYmFsLk11dGF0aW9uT2JzZXJ2ZXI7XG4gIHJldHVybiBtID8gbSA6IGZhbHNlO1xufSgpKTtcblxudmFyICRNZXNzYWdlQ2hhbm5lbCA9IChmdW5jdGlvbigpIHtcbiAgLy8gZG9uJ3QgdXNlIHdvcmtlciBpZiB0aGlzIGlzIElFMTBcbiAgdmFyIGNoYW5uZWwgPSAkZ2xvYmFsLk1lc3NhZ2VDaGFubmVsO1xuICB2YXIgVWludDhDbGFtcGVkQXJyYXkgPSAkZ2xvYmFsLlVpbnQ4Q2xhbXBlZEFycmF5O1xuICByZXR1cm4gVWludDhDbGFtcGVkQXJyYXkgJiYgY2hhbm5lbCA/IGNoYW5uZWwgOiBmYWxzZTtcbn0oKSk7XG4iLCJpbXBvcnQgU3RhY2sgZnJvbSAnc3RhY2snO1xuaW1wb3J0IEFzeW5jUHJvdmlkZXIgZnJvbSAnYXN5bmMnO1xuXG5leHBvcnQgZGVmYXVsdCBmb3JrKCk7XG5cbmZ1bmN0aW9uIEJyaXNraXQoKSB7XG4gIHZhciAkYXN5bmMgPSBuZXcgQXN5bmNQcm92aWRlcigpO1xuICB2YXIgJHN0YWNrID0gbmV3IFN0YWNrKCB0cnVlICwgJGFzeW5jICk7XG4gIHZhciAkYnJpc2tpdCA9IGZ1bmN0aW9uKCBjYiApIHtcbiAgICAkc3RhY2suZW5xdWV1ZSggY2IgKTtcbiAgfTtcbiAgJGJyaXNraXQuZGVmZXIgPSAkc3RhY2suZGVmZXI7XG4gICRicmlza2l0LmZsdXNoID0gJHN0YWNrLmZsdXNoO1xuICAkYnJpc2tpdC51c2UgPSAkYXN5bmMudXNlO1xuICAkYnJpc2tpdC5mb3JrID0gZm9yaztcbiAgJGJyaXNraXQudXNlKCk7XG4gIHJldHVybiAkYnJpc2tpdDtcbn1cblxuZnVuY3Rpb24gZm9yaygpIHtcbiAgdmFyIGJyaXNraXQgPSBuZXcgQnJpc2tpdCgpO1xuICBicmlza2l0LnN0YWNrID0gU3RhY2s7XG4gIHJldHVybiBicmlza2l0O1xufVxuIiwiLyoqXG4gKiBAY2xhc3MgU3RhY2tcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW2F1dG9mbHVzaD1mYWxzZV0gLSBXaGVuIHRydWUsIHRoZSBzdGFjayB3aWxsIGF0dGVtcHQgdG8gZmx1c2ggYXMgc29vbiBhcyBhIGNhbGxiYWNrIGlzIGVucXVldWVkLlxuICogQHBhcmFtIHtmdW5jdGlvbn0gW3Byb3ZpZGVyXSAtIFRoZSBmdW5jdGlvbiB1c2VkIGZvciBmbHVzaCBjYWxscy4gU3luY2hyb25vdXMgYnkgZGVmYXVsdC5cbiAqIEBwYXJhbSB7bnVtYmVyfSBbcHJlYWxsb2M9MTAyNF0gLSBUaGUgcHJlYWxsb2NhdGVkIHN0YWNrIHNpemUuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIFN0YWNrKCBhdXRvZmx1c2ggLCBwcm92aWRlciAsIHByZWFsbG9jICkge1xuICBhdXRvZmx1c2ggPSAhIWF1dG9mbHVzaDtcbiAgcHJvdmlkZXIgPSBwcm92aWRlciB8fCBmdW5jdGlvbiggY2IgKXsgY2IoKTsgfTtcblxuICB2YXIgcXVldWUgPSBBcnJheSggcHJlYWxsb2MgfHwgMTAyNCApO1xuICB2YXIgbGVuZ3RoID0gMDtcbiAgdmFyIGRlZmVycmVkID0gIWF1dG9mbHVzaDtcbiAgdmFyIGlucHJvZyA9IGZhbHNlO1xuXG4gIHZhciAkc3RhY2sgPSB7XG4gICAgZW5xdWV1ZTogZnVuY3Rpb24oIGNiICkge1xuICAgICAgcXVldWVbbGVuZ3RoXSA9IGNiO1xuICAgICAgbGVuZ3RoKys7XG4gICAgICBpZiAoIWRlZmVycmVkKSB7XG4gICAgICAgIF9mbHVzaCgpO1xuICAgICAgfVxuICAgIH0sXG4gICAgZGVmZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgZGVmZXJyZWQgPSB0cnVlO1xuICAgIH0sXG4gICAgZmx1c2g6IGZ1bmN0aW9uKCkge1xuICAgICAgZGVmZXJyZWQgPSAhYXV0b2ZsdXNoO1xuICAgICAgX2ZsdXNoKCk7XG4gICAgfVxuICB9O1xuXG4gIGZ1bmN0aW9uIF9mbHVzaCgpIHtcbiAgICBpZiAoIWlucHJvZykge1xuICAgICAgaW5wcm9nID0gdHJ1ZTtcbiAgICAgIHByb3ZpZGVyKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgY2IsIGkgPSAwO1xuICAgICAgICBmb3IgKDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgY2IgPSBxdWV1ZVtpXTtcbiAgICAgICAgICBxdWV1ZVtpXSA9IFVOREVGSU5FRDtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgY2IoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY2F0Y2goIGVyciApIHtcbiAgICAgICAgICAgIC8qIGpzaGludCBpZ25vcmU6c3RhcnQgKi9cbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoIGVyci5zdGFjayB8fCBlcnIgKTtcbiAgICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAvKiBqc2hpbnQgaWdub3JlOmVuZCAqL1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpbnByb2cgPSBmYWxzZTtcbiAgICAgICAgbGVuZ3RoID0gMDtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiAkc3RhY2s7XG59XG4iXX0=


}((typeof global != "undefined" ? global : typeof self != "undefined" ? self : typeof window != "undefined" ? window : {}),Array,setTimeout))
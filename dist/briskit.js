/*! briskit - 1.1.1 - Bernard McManus - 6e36d33 - 2015-10-22 */

(function(Array,setTimeout,UNDEFINED) {

(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.briskit = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
(function (global){
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
  var si = global.setImmediate;
  return si ? si : false;
})();

var $MutationObserver = (function () {
  var m = global.MutationObserver;
  return m ? m : false;
})();

var $MessageChannel = (function () {
  // don't use worker if this is IE10
  var channel = global.MessageChannel;
  var Uint8ClampedArray = global.Uint8ClampedArray;
  return Uint8ClampedArray && channel ? channel : false;
})();

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvYm1jbWFudXMvYnJpc2tpdC9zcmMvYXN5bmMuanMiLCIvVXNlcnMvYm1jbWFudXMvYnJpc2tpdC9zcmMvaW5kZXguanMiLCIvVXNlcnMvYm1jbWFudXMvYnJpc2tpdC9zcmMvc3RhY2suanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7cUJDQXdCLGFBQWE7Ozs7Ozs7QUFBdEIsU0FBUyxhQUFhLEdBQUU7QUFDckMsTUFBSSxTQUFTLENBQUM7QUFDZCxXQUFTLE1BQU0sQ0FBRSxFQUFFLEVBQUU7QUFDbkIsYUFBUyxDQUFFLEVBQUUsQ0FBRSxFQUFFLENBQUM7R0FDbkI7QUFDRCxRQUFNLENBQUMsR0FBRyxHQUFHLFVBQVUsR0FBRyxFQUFFO0FBQzFCLGFBQVMsR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxJQUFJLGNBQWMsRUFBRSxDQUFDO0dBQ3ZELENBQUM7QUFDRixTQUFPLE1BQU0sQ0FBQztDQUNmOztBQUVNLElBQUksU0FBUyxHQUFHLEVBQUUsUUFBUSxFQUFSLFFBQVEsRUFBRyxRQUFRLEVBQVIsUUFBUSxFQUFHLE1BQU0sRUFBTixNQUFNLEVBQUcsT0FBTyxFQUFQLE9BQU8sRUFBRSxDQUFDOzs7O0FBRTNELFNBQVMsY0FBYyxDQUFFLGNBQWMsRUFBRTtBQUM5QyxNQUFJLGFBQWEsRUFBRTtBQUNqQixXQUFPLFFBQVEsQ0FBQztHQUNqQixNQUNJLElBQUksaUJBQWlCLEVBQUU7QUFDMUIsV0FBTyxRQUFRLENBQUM7R0FDakIsTUFDSSxJQUFJLGVBQWUsRUFBRTtBQUN4QixXQUFPLE1BQU0sQ0FBQztHQUNmO0FBQ0QsU0FBTyxPQUFPLENBQUM7Q0FDaEI7O0FBRU0sU0FBUyxRQUFRLENBQUUsRUFBRSxFQUFFO0FBQzVCLFNBQU8s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QUUsRUFBRSxDQUFDO1dBQ04sQ0FDRCxPQUFPLEdBQUcsRUFBRTs7QUFFVixzQkFBVSxDQUFDLFlBQVU7QUFDbkIscUJBQU8sQ0FBQyxLQUFLLENBQUUsR0FBRyxDQUFDLEtBQUssSUFBSSxHQUFHLENBQUUsQ0FBQztBQUNsQyxvQkFBTSxHQUFHLENBQUM7YUFDWCxDQUFDLENBQUM7O1dBRUo7U0FDRjtBQUNELGNBQU0sR0FBRyxLQUFLLENBQUM7QUFDZixjQUFNLEdBQUcsQ0FBQyxDQUFDO09BQ1osQ0FBQyxDQUFDO0tBQ0o7R0FDRjs7QUFFRCxTQUFPLE1BQU0sQ0FBQztDQUNmIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIEFzeW5jUHJvdmlkZXIoKXtcbiAgdmFyICRwcm92aWRlcjtcbiAgZnVuY3Rpb24gJGFzeW5jKCBjYiApe1xuICAgICRwcm92aWRlciggY2IgKSgpO1xuICB9XG4gICRhc3luYy51c2UgPSBmdW5jdGlvbiggYXJnICl7XG4gICAgJHByb3ZpZGVyID0gcHJvdmlkZXJzW2FyZ10gfHwgYXJnIHx8IGNob29zZVByb3ZpZGVyKCk7XG4gIH07XG4gIHJldHVybiAkYXN5bmM7XG59XG5cbmV4cG9ydCB2YXIgcHJvdmlkZXJzID0geyBuZXh0VGljayAsIG9ic2VydmVyICwgd29ya2VyICwgdGltZW91dCB9O1xuXG5leHBvcnQgZnVuY3Rpb24gY2hvb3NlUHJvdmlkZXIoIGN1c3RvbVByb3ZpZGVyICl7XG4gIGlmICgkc2V0SW1tZWRpYXRlKSB7XG4gICAgcmV0dXJuIG5leHRUaWNrO1xuICB9XG4gIGVsc2UgaWYgKCRNdXRhdGlvbk9ic2VydmVyKSB7XG4gICAgcmV0dXJuIG9ic2VydmVyO1xuICB9XG4gIGVsc2UgaWYgKCRNZXNzYWdlQ2hhbm5lbCkge1xuICAgIHJldHVybiB3b3JrZXI7XG4gIH1cbiAgcmV0dXJuIHRpbWVvdXQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBuZXh0VGljayggY2IgKXtcbiAgcmV0dXJuIGZ1bmN0aW9uKCl7XG4gICAgc2V0SW1tZWRpYXRlKCBjYiApO1xuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gb2JzZXJ2ZXIoIGNiICl7XG4gIHZhciBpdGVyYXRpb25zID0gMDtcbiAgdmFyIG0gPSBuZXcgTXV0YXRpb25PYnNlcnZlciggY2IgKTtcbiAgdmFyIG5vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSggJycgKTtcbiAgbS5vYnNlcnZlKCBub2RlICwgeyBjaGFyYWN0ZXJEYXRhOiB0cnVlIH0pO1xuICByZXR1cm4gZnVuY3Rpb24oKXtcbiAgICBub2RlLmRhdGEgPSAoaXRlcmF0aW9ucyA9ICsraXRlcmF0aW9ucyAlIDIpO1xuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gd29ya2VyKCBjYiApe1xuICB2YXIgY2hhbm5lbCA9IG5ldyBNZXNzYWdlQ2hhbm5lbCgpO1xuICBjaGFubmVsLnBvcnQxLm9ubWVzc2FnZSA9IGNiO1xuICByZXR1cm4gZnVuY3Rpb24oKXtcbiAgICBjaGFubmVsLnBvcnQyLnBvc3RNZXNzYWdlKCAwICk7XG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0aW1lb3V0KCBjYiApe1xuICByZXR1cm4gZnVuY3Rpb24oKXtcbiAgICBzZXRUaW1lb3V0KCBjYiApO1xuICB9O1xufVxuXG52YXIgJHNldEltbWVkaWF0ZSA9IChmdW5jdGlvbigpe1xuICB2YXIgc2kgPSBnbG9iYWwuc2V0SW1tZWRpYXRlO1xuICByZXR1cm4gc2kgPyBzaSA6IGZhbHNlO1xufSgpKTtcblxudmFyICRNdXRhdGlvbk9ic2VydmVyID0gKGZ1bmN0aW9uKCl7XG4gIHZhciBtID0gZ2xvYmFsLk11dGF0aW9uT2JzZXJ2ZXI7XG4gIHJldHVybiBtID8gbSA6IGZhbHNlO1xufSgpKTtcblxudmFyICRNZXNzYWdlQ2hhbm5lbCA9IChmdW5jdGlvbigpe1xuICAvLyBkb24ndCB1c2Ugd29ya2VyIGlmIHRoaXMgaXMgSUUxMFxuICB2YXIgY2hhbm5lbCA9IGdsb2JhbC5NZXNzYWdlQ2hhbm5lbDtcbiAgdmFyIFVpbnQ4Q2xhbXBlZEFycmF5ID0gZ2xvYmFsLlVpbnQ4Q2xhbXBlZEFycmF5O1xuICByZXR1cm4gVWludDhDbGFtcGVkQXJyYXkgJiYgY2hhbm5lbCA/IGNoYW5uZWwgOiBmYWxzZTtcbn0oKSk7XG4iLCJpbXBvcnQgU3RhY2sgZnJvbSAnc3RhY2snO1xuaW1wb3J0IEFzeW5jUHJvdmlkZXIgZnJvbSAnYXN5bmMnO1xuXG5leHBvcnQgZGVmYXVsdCBmb3JrKCk7XG5cbmZ1bmN0aW9uIEJyaXNraXQoKXtcbiAgdmFyICRhc3luYyA9IG5ldyBBc3luY1Byb3ZpZGVyKCk7XG4gIHZhciAkc3RhY2sgPSBuZXcgU3RhY2soIHRydWUgLCAkYXN5bmMgKTtcbiAgdmFyICRicmlza2l0ID0gZnVuY3Rpb24oIGNiICl7XG4gICAgJHN0YWNrLmVucXVldWUoIGNiICk7XG4gIH07XG4gICRicmlza2l0LmRlZmVyID0gJHN0YWNrLmRlZmVyO1xuICAkYnJpc2tpdC5mbHVzaCA9ICRzdGFjay5mbHVzaDtcbiAgJGJyaXNraXQudXNlID0gJGFzeW5jLnVzZTtcbiAgJGJyaXNraXQuZm9yayA9IGZvcms7XG4gICRicmlza2l0LnVzZSgpO1xuICByZXR1cm4gJGJyaXNraXQ7XG59XG5cbmZ1bmN0aW9uIGZvcmsoKXtcbiAgdmFyIGJyaXNraXQgPSBuZXcgQnJpc2tpdCgpO1xuICBicmlza2l0LnN0YWNrID0gU3RhY2s7XG4gIHJldHVybiBicmlza2l0O1xufVxuIiwiLyoqXG4gKiBAY2xhc3MgU3RhY2tcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW2F1dG9mbHVzaD1mYWxzZV0gLSBXaGVuIHRydWUsIHRoZSBzdGFjayB3aWxsIGF0dGVtcHQgdG8gZmx1c2ggYXMgc29vbiBhcyBhIGNhbGxiYWNrIGlzIGVucXVldWVkLlxuICogQHBhcmFtIHtmdW5jdGlvbn0gW3Byb3ZpZGVyXSAtIFRoZSBmdW5jdGlvbiB1c2VkIGZvciBmbHVzaCBjYWxscy4gU3luY2hyb25vdXMgYnkgZGVmYXVsdC5cbiAqIEBwYXJhbSB7bnVtYmVyfSBbcHJlYWxsb2M9MTAyNF0gLSBUaGUgcHJlYWxsb2NhdGVkIHN0YWNrIHNpemUuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIFN0YWNrKCBhdXRvZmx1c2ggLCBwcm92aWRlciAsIHByZWFsbG9jICl7XG4gIGF1dG9mbHVzaCA9ICEhYXV0b2ZsdXNoO1xuICBwcm92aWRlciA9IHByb3ZpZGVyIHx8IGZ1bmN0aW9uKCBjYiApeyBjYigpOyB9O1xuXG4gIHZhciBxdWV1ZSA9IEFycmF5KCBwcmVhbGxvYyB8fCAxMDI0ICk7XG4gIHZhciBsZW5ndGggPSAwO1xuICB2YXIgZGVmZXJyZWQgPSAhYXV0b2ZsdXNoO1xuICB2YXIgaW5wcm9nID0gZmFsc2U7XG5cbiAgdmFyICRzdGFjayA9IHtcbiAgICBlbnF1ZXVlOiBmdW5jdGlvbiggY2IgKXtcbiAgICAgIHF1ZXVlW2xlbmd0aF0gPSBjYjtcbiAgICAgIGxlbmd0aCsrO1xuICAgICAgaWYgKCFkZWZlcnJlZCkge1xuICAgICAgICBfZmx1c2goKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGRlZmVyOiBmdW5jdGlvbigpe1xuICAgICAgZGVmZXJyZWQgPSB0cnVlO1xuICAgIH0sXG4gICAgZmx1c2g6IGZ1bmN0aW9uKCl7XG4gICAgICBkZWZlcnJlZCA9ICFhdXRvZmx1c2g7XG4gICAgICBfZmx1c2goKTtcbiAgICB9XG4gIH07XG5cbiAgZnVuY3Rpb24gX2ZsdXNoKCl7XG4gICAgaWYgKCFpbnByb2cpIHtcbiAgICAgIGlucHJvZyA9IHRydWU7XG4gICAgICBwcm92aWRlcihmdW5jdGlvbigpe1xuICAgICAgICB2YXIgY2IsIGkgPSAwO1xuICAgICAgICBmb3IgKDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgY2IgPSBxdWV1ZVtpXTtcbiAgICAgICAgICBxdWV1ZVtpXSA9IFVOREVGSU5FRDtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgY2IoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY2F0Y2goIGVyciApe1xuICAgICAgICAgICAgLyoganNoaW50IGlnbm9yZTpzdGFydCAqL1xuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCBlcnIuc3RhY2sgfHwgZXJyICk7XG4gICAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgLyoganNoaW50IGlnbm9yZTplbmQgKi9cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaW5wcm9nID0gZmFsc2U7XG4gICAgICAgIGxlbmd0aCA9IDA7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gJHN0YWNrO1xufVxuIl19


}(Array,setTimeout))
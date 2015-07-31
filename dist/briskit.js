/*! briskit - 1.0.1 - Bernard McManus - 992dd2e - 2015-07-31 */

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
    var that = this;
    var $provider;
    var $async = function $async(cb) {
      $provider(cb)();
    };
    $async.use = function (name) {
      $provider = providers[name] || chooseProvider();
    };
    return $async;
  }
  
  var providers = { nextTick: nextTick, observer: observer, worker: worker, timeout: timeout };
  
  exports.providers = providers;
  
  function chooseProvider() {
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
  	var $stack = new _stack2['default']($async);
  	var $briskit = function $briskit(cb) {
  		$stack(cb);
  	};
  	$briskit.defer = $stack.defer;
  	$briskit.release = $stack.release;
  	$briskit.use = $async.use;
  	$briskit.fork = fork;
  	$briskit.use();
  	return $briskit;
  }
  
  function fork() {
  	return new Briskit();
  }
  module.exports = exports['default'];
  
  },{"async":1,"stack":3}],3:[function(_dereq_,module,exports){
  "use strict";
  
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports["default"] = Stack;
  
  function Stack($async) {
    var queue = Array(1024);
    var length = 0;
    var deferred = false;
    var inprog = false;
  
    var $stack = function $stack(cb) {
      queue[length] = cb;
      length++;
      if (!deferred) {
        $async(flush);
      }
    };
  
    $stack.defer = function () {
      deferred = true;
    };
  
    $stack.release = function () {
      deferred = false;
      $async(flush);
    };
  
    function flush() {
      var cb,
          i = 0;
      if (!inprog) {
        inprog = true;
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
      }
    }
  
    return $stack;
  }
  
  module.exports = exports["default"];
  
  },{}]},{},[2])(2)
  });
  //# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvYm1jbWFudXMvYnJpc2tpdC9zcmMvYXN5bmMuanMiLCIvVXNlcnMvYm1jbWFudXMvYnJpc2tpdC9zcmMvaW5kZXguanMiLCIvVXNlcnMvYm1jbWFudXMvYnJpc2tpdC9zcmMvc3RhY2suanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztxQkNBd0IsYUFBYTtRQWNyQixjQUFjLEdBQWQsY0FBYztRQWFkLFFBQVEsR0FBUixRQUFRO1FBTVIsUUFBUSxHQUFSLFFBQVE7UUFVUixNQUFNLEdBQU4sTUFBTTtRQVFOLE9BQU8sR0FBUCxPQUFPOztBQW5EUixTQUFTLGFBQWEsR0FBRztBQUN0QyxNQUFJLElBQUksR0FBRyxJQUFJLENBQUM7QUFDaEIsTUFBSSxTQUFTLENBQUM7QUFDZCxNQUFJLE1BQU0sR0FBRyxTQUFULE1BQU0sQ0FBYSxFQUFFLEVBQUc7QUFDMUIsYUFBUyxDQUFFLEVBQUUsQ0FBRSxFQUFFLENBQUM7R0FDbkIsQ0FBQztBQUNGLFFBQU0sQ0FBQyxHQUFHLEdBQUcsVUFBVSxJQUFJLEVBQUc7QUFDNUIsYUFBUyxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxjQUFjLEVBQUUsQ0FBQztHQUNqRCxDQUFDO0FBQ0YsU0FBTyxNQUFNLENBQUM7Q0FDZjs7QUFFTSxJQUFJLFNBQVMsR0FBRyxFQUFFLFFBQVEsRUFBUixRQUFRLEVBQUcsUUFBUSxFQUFSLFFBQVEsRUFBRyxNQUFNLEVBQU4sTUFBTSxFQUFHLE9BQU8sRUFBUCxPQUFPLEVBQUUsQ0FBQzs7UUFBdkQsU0FBUyxHQUFULFNBQVM7O0FBRWIsU0FBUyxjQUFjLEdBQUc7QUFDL0IsTUFBSSxhQUFhLEVBQUU7QUFDakIsV0FBTyxRQUFRLENBQUM7R0FDakIsTUFDSSxJQUFJLGlCQUFpQixF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QU8sQ0FBQyxLQUFLLENBQUUsR0FBRyxDQUFDLEtBQUssSUFBSSxHQUFHLENBQUUsQ0FBQztBQUNsQyxrQkFBTSxHQUFHLENBQUM7V0FDWCxDQUFDLENBQUM7O1NBRUo7T0FDRjtBQUNELFlBQU0sR0FBRyxLQUFLLENBQUM7QUFDZixZQUFNLEdBQUcsQ0FBQyxDQUFDO0tBQ1o7R0FDRjs7QUFFRCxTQUFPLE1BQU0sQ0FBQztDQUNmIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIEFzeW5jUHJvdmlkZXIoKSB7XG4gIHZhciB0aGF0ID0gdGhpcztcbiAgdmFyICRwcm92aWRlcjtcbiAgdmFyICRhc3luYyA9IGZ1bmN0aW9uKCBjYiApIHtcbiAgICAkcHJvdmlkZXIoIGNiICkoKTtcbiAgfTtcbiAgJGFzeW5jLnVzZSA9IGZ1bmN0aW9uKCBuYW1lICkge1xuICAgICRwcm92aWRlciA9IHByb3ZpZGVyc1tuYW1lXSB8fCBjaG9vc2VQcm92aWRlcigpO1xuICB9O1xuICByZXR1cm4gJGFzeW5jO1xufVxuXG5leHBvcnQgdmFyIHByb3ZpZGVycyA9IHsgbmV4dFRpY2sgLCBvYnNlcnZlciAsIHdvcmtlciAsIHRpbWVvdXQgfTtcblxuZXhwb3J0IGZ1bmN0aW9uIGNob29zZVByb3ZpZGVyKCkge1xuICBpZiAoJHNldEltbWVkaWF0ZSkge1xuICAgIHJldHVybiBuZXh0VGljaztcbiAgfVxuICBlbHNlIGlmICgkTXV0YXRpb25PYnNlcnZlcikge1xuICAgIHJldHVybiBvYnNlcnZlcjtcbiAgfVxuICBlbHNlIGlmICgkTWVzc2FnZUNoYW5uZWwpIHtcbiAgICByZXR1cm4gd29ya2VyO1xuICB9XG4gIHJldHVybiB0aW1lb3V0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbmV4dFRpY2soIGNiICkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgc2V0SW1tZWRpYXRlKCBjYiApO1xuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gb2JzZXJ2ZXIoIGNiICkge1xuICB2YXIgaXRlcmF0aW9ucyA9IDA7XG4gIHZhciBtID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoIGNiICk7XG4gIHZhciBub2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoICcnICk7XG4gIG0ub2JzZXJ2ZSggbm9kZSAsIHsgY2hhcmFjdGVyRGF0YTogdHJ1ZSB9KTtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIG5vZGUuZGF0YSA9IChpdGVyYXRpb25zID0gKytpdGVyYXRpb25zICUgMik7XG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3b3JrZXIoIGNiICkge1xuICB2YXIgY2hhbm5lbCA9IG5ldyBNZXNzYWdlQ2hhbm5lbCgpO1xuICBjaGFubmVsLnBvcnQxLm9ubWVzc2FnZSA9IGNiO1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgY2hhbm5lbC5wb3J0Mi5wb3N0TWVzc2FnZSggMCApO1xuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdGltZW91dCggY2IgKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICBzZXRUaW1lb3V0KCBjYiApO1xuICB9O1xufVxuXG52YXIgJHNldEltbWVkaWF0ZSA9IChmdW5jdGlvbigpIHtcbiAgdmFyIHNpID0gJGdsb2JhbC5zZXRJbW1lZGlhdGU7XG4gIHJldHVybiBzaSA/IHNpIDogZmFsc2U7XG59KCkpO1xuXG52YXIgJE11dGF0aW9uT2JzZXJ2ZXIgPSAoZnVuY3Rpb24oKSB7XG4gIHZhciBtID0gJGdsb2JhbC5NdXRhdGlvbk9ic2VydmVyO1xuICByZXR1cm4gbSA/IG0gOiBmYWxzZTtcbn0oKSk7XG5cbnZhciAkTWVzc2FnZUNoYW5uZWwgPSAoZnVuY3Rpb24oKSB7XG4gIC8vIGRvbid0IHVzZSB3b3JrZXIgaWYgdGhpcyBpcyBJRTEwXG4gIHZhciBjaGFubmVsID0gJGdsb2JhbC5NZXNzYWdlQ2hhbm5lbDtcbiAgdmFyIFVpbnQ4Q2xhbXBlZEFycmF5ID0gJGdsb2JhbC5VaW50OENsYW1wZWRBcnJheTtcbiAgcmV0dXJuIFVpbnQ4Q2xhbXBlZEFycmF5ICYmIGNoYW5uZWwgPyBjaGFubmVsIDogZmFsc2U7XG59KCkpO1xuIiwiaW1wb3J0IFN0YWNrIGZyb20gJ3N0YWNrJztcbmltcG9ydCBBc3luY1Byb3ZpZGVyIGZyb20gJ2FzeW5jJztcblxuZXhwb3J0IGRlZmF1bHQgZm9yaygpO1xuXG5mdW5jdGlvbiBCcmlza2l0KCkge1xuXHR2YXIgJGFzeW5jID0gbmV3IEFzeW5jUHJvdmlkZXIoKTtcblx0dmFyICRzdGFjayA9IG5ldyBTdGFjayggJGFzeW5jICk7XG5cdHZhciAkYnJpc2tpdCA9IGZ1bmN0aW9uKCBjYiApIHtcblx0XHQkc3RhY2soIGNiICk7XG5cdH07XG5cdCRicmlza2l0LmRlZmVyID0gJHN0YWNrLmRlZmVyO1xuXHQkYnJpc2tpdC5yZWxlYXNlID0gJHN0YWNrLnJlbGVhc2U7XG5cdCRicmlza2l0LnVzZSA9ICRhc3luYy51c2U7XG5cdCRicmlza2l0LmZvcmsgPSBmb3JrO1xuXHQkYnJpc2tpdC51c2UoKTtcblx0cmV0dXJuICRicmlza2l0O1xufVxuXG5mdW5jdGlvbiBmb3JrKCkge1xuXHRyZXR1cm4gbmV3IEJyaXNraXQoKTtcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIFN0YWNrKCAkYXN5bmMgKSB7XG4gIHZhciBxdWV1ZSA9IEFycmF5KCAxMDI0ICk7XG4gIHZhciBsZW5ndGggPSAwO1xuICB2YXIgZGVmZXJyZWQgPSBmYWxzZTtcbiAgdmFyIGlucHJvZyA9IGZhbHNlO1xuXG4gIHZhciAkc3RhY2sgPSBmdW5jdGlvbiggY2IgKSB7XG4gICAgcXVldWVbbGVuZ3RoXSA9IGNiO1xuICAgIGxlbmd0aCsrO1xuICAgIGlmICghZGVmZXJyZWQpIHtcbiAgICAgICRhc3luYyggZmx1c2ggKTtcbiAgICB9XG4gIH07XG5cbiAgJHN0YWNrLmRlZmVyID0gZnVuY3Rpb24oKSB7XG4gICAgZGVmZXJyZWQgPSB0cnVlO1xuICB9O1xuXG4gICRzdGFjay5yZWxlYXNlID0gZnVuY3Rpb24oKSB7XG4gICAgZGVmZXJyZWQgPSBmYWxzZTtcbiAgICAkYXN5bmMoIGZsdXNoICk7XG4gIH07XG5cbiAgZnVuY3Rpb24gZmx1c2goKSB7XG4gICAgdmFyIGNiLCBpID0gMDtcbiAgICBpZiAoIWlucHJvZykge1xuICAgICAgaW5wcm9nID0gdHJ1ZTtcbiAgICAgIGZvciAoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY2IgPSBxdWV1ZVtpXTtcbiAgICAgICAgcXVldWVbaV0gPSBVTkRFRklORUQ7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY2IoKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCggZXJyICkge1xuICAgICAgICAgIC8qIGpzaGludCBpZ25vcmU6c3RhcnQgKi9cbiAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvciggZXJyLnN0YWNrIHx8IGVyciApO1xuICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIC8qIGpzaGludCBpZ25vcmU6ZW5kICovXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlucHJvZyA9IGZhbHNlO1xuICAgICAgbGVuZ3RoID0gMDtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gJHN0YWNrO1xufVxuIl19
  
}).apply(this,[typeof global != "undefined" ? global : typeof self != "undefined" ? self : typeof window != "undefined" ? window : {},Array,setTimeout]);
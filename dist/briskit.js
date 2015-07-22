/*! briskit - 0.2.2 - Bernard McManus - 25f1d00 - 2015-07-22 */

(function($global,Array,setTimeout,$UNDEFINED) {
  (function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.standalone = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
  'use strict';
  
  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.chooseProvider = chooseProvider;
  
  var _providers = require('./providers');
  
  function chooseProvider() {
    if (setImmediate) {
      (0, _providers.setProvider)(_providers.nextTick);
    } else if (MutationObserver) {
      (0, _providers.setProvider)(_providers.observer);
    } else if (MessageChannel) {
      (0, _providers.setProvider)(_providers.worker);
    } else {
      (0, _providers.setProvider)(_providers.timeout);
    }
  }
  
  var setImmediate = (function () {
    var si = $global.setImmediate;
    return si ? si : false;
  })();
  
  var MutationObserver = (function () {
    var m = $global.MutationObserver;
    return m ? m : false;
  })();
  
  var MessageChannel = (function () {
    // don't use worker if this is IE10
    var channel = $global.MessageChannel;
    var Uint8ClampedArray = $global.Uint8ClampedArray;
    return Uint8ClampedArray && channel ? channel : false;
  })();
  
  },{"./providers":3}],2:[function(require,module,exports){
  'use strict';
  
  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }
  
  var _stack = require('./stack');
  
  var _stack2 = _interopRequireDefault(_stack);
  
  var _providers = require('./providers');
  
  var _providers2 = _interopRequireDefault(_providers);
  
  _stack2['default'].providers = _providers2['default'];
  _stack2['default'].use = _providers.setProvider;
  (0, _providers.setProvider)();
  
  exports['default'] = _stack2['default'];
  module.exports = exports['default'];
  
  },{"./providers":3,"./stack":4}],3:[function(require,module,exports){
  'use strict';
  
  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.getProvider = getProvider;
  exports.setProvider = setProvider;
  exports.nextTick = nextTick;
  exports.observer = observer;
  exports.worker = worker;
  exports.timeout = timeout;
  
  var _stack = require('./stack');
  
  var _async = require('./async');
  
  var async$provider;
  
  exports['default'] = {
    nextTick: nextTick,
    observer: observer,
    worker: worker,
    timeout: timeout
  };
  
  function getProvider() {
    return async$provider(_stack.flush);
  }
  
  function setProvider(provider) {
    if (provider) {
      async$provider = provider;
    } else {
      (0, _async.chooseProvider)();
    }
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
      setTimeout(cb, 1);
    };
  }
  
  },{"./async":1,"./stack":4}],4:[function(require,module,exports){
  'use strict';
  
  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports['default'] = scheduleTask;
  exports.flush = flush;
  exports.scheduleError = scheduleError;
  
  var _providers = require('./providers');
  
  var stack = Array(1024);
  exports.stack = stack;
  var length = 0;
  exports.length = length;
  var errors = [];
  
  exports.errors = errors;
  
  function scheduleTask(cb, arg) {
    stack[length] = cb;
    stack[length + 1] = arg;
    exports.length = length += 2;
    if (length == 2) {
      (0, _providers.getProvider)()();
    }
  }
  
  function flush() {
    var cb, arg;
    for (var i = 0; i < length; i += 2) {
      cb = stack[i];
      arg = stack[i + 1];
      stack[i] = $UNDEFINED;
      stack[i + 1] = $UNDEFINED;
      try {
        cb(arg);
      } catch (err) {
        scheduleError(err);
      }
    }
    exports.length = length = 0;
  }
  
  function scheduleError(err) {
    errors.push(err);
    (0, _providers.timeout)(function () {
      var err = errors.shift();
      if (err != $UNDEFINED) {
        console.error(err.stack || err);
        throw err;
      }
    })();
  }
  
  },{"./providers":3}]},{},[2])(2)
  });
  //# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvYm1jbWFudXMvYnJpc2tpdC9zcmMvYXN5bmMuanMiLCIvVXNlcnMvYm1jbWFudXMvYnJpc2tpdC9zcmMvaW5kZXguanMiLCIvVXNlcnMvYm1jbWFudXMvYnJpc2tpdC9zcmMvcHJvdmlkZXJzLmpzIiwiL1VzZXJzL2JtY21hbnVzL2JyaXNraXQvc3JjL3N0YWNrLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7UUNRZ0IsY0FBYyxHQUFkLGNBQWM7O3lCQUZ2QixhQUFhOztBQUViLFNBQVMsY0FBYyxHQUFHO0FBQy9CLE1BQUksWUFBWSxFQUFFO0FBQ2hCLG1CQVRGLFdBQVcsYUFDWCxRQUFRLENBUWlCLENBQUM7R0FDekIsTUFDSSxJQUFJLGdCQUFnQixFQUFFO0FBQ3pCLG1CQVpGLFdBQVcsYUFFWCxRQUFRLENBVWlCLENBQUM7R0FDekIsTUFDSSxJQUFJLGNBQWMsRUFBRTtBQUN2QixtQkFmRixXQUFXLGFBR1gsTUFBTSxDQVlpQixDQUFDO0dBQ3ZCLE1BQ0k7QUFDSCxtQkFsQkYsV0FBVyxhQUlYLE9BQU8sQ0FjaUIsQ0FBQztHQUN4QjtDQUNGOztBQUVELElBQUksWUFBWSxHQUFJLENBQUEsWUFBVztBQUM3QixNQUFJLEVBQUUsR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDO0FBQzlCLFNBQU8sRUFBRSxHQUFHLEVBQUUsR0FBRyxLQUFLLENBQUM7Q0FDeEIsQ0FBQSxFQUFFLEFBQUMsQ0FBQzs7QUFFTCxJQUFJLGdCQUFnQixHQUFJLENBQUEsWUFBVztBQUNqQyxNQUFJLENBQUMsR0FBRyxPQUFPLENBQUMsZ0JBQWdCLENBQUM7QUFDakMsU0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEtBQUssQ0FBQztDQUN0QixDQUFBLEVBQUUsQUFBQyxDQUFDOztBQUVMLElBQUksY0FBYyxHQUFJLENBQUEsWUFBVzs7QUFFL0IsTUFBSSxPQUFPLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQztBQUNyQyxNQUFJLGlCQUFpQixHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQztBQUNsRCxTQUFPLGlCQUFpQixJQUFJLE9BQU8sR0FBRyxPQUFPLEdBQUcsS0FBSyxDQUFDO0NBQ3ZELENBQUEsRUFBRSxBQUFDLENBQUM7Ozs7Ozs7Ozs7O3FCQ3RDZSxTQUFTOzs7O3lCQUNxQixhQUFhOzs7O0FBQy9ELG1CQUFRLFNBQVMseUJBQVksQ0FBQztBQUM5QixtQkFBUSxHQUFHLGNBRm9CLFdBQVcsQUFFakIsQ0FBQztBQUMxQixlQUgrQixXQUFXLEdBRzdCLENBQUM7Ozs7Ozs7Ozs7O1FDUUUsV0FBVyxHQUFYLFdBQVc7UUFJWCxXQUFXLEdBQVgsV0FBVztRQVNYLFFBQVEsR0FBUixRQUFRO1FBTVIsUUFBUSxHQUFSLFFBQVE7UUFVUixNQUFNLEdBQU4sTUFBTTtRQVFOLE9BQU8sR0FBUCxPQUFPOztxQkFqREQsU0FBUzs7cUJBQ0EsU0FBUzs7QUFFeEMsSUFBSSxjQUFjLENBQUM7O3FCQUVKO0FBQ2IsVUFBUSxFQUFFLFFBQVE7QUFDbEIsVUFBUSxFQUFFLFFBQVE7QUFDbEIsUUFBTSxFQUFFLE1BQU07QUFDZCxTQUFPLEVBQUUsT0FBTztDQUNqQjs7QUFFTSxTQUFTLFdBQVcsR0FBRztBQUM1QixTQUFPLGNBQWMsUUFiZCxLQUFLLENBYWtCLENBQUM7Q0FDaEM7O0FBRU0sU0FBUyxXQUFXLENBQUUsUUFBUSxFQUFHO0FBQ3RDLE1BQUksUUFBUSxFQUFFO0FBQ1osa0JBQWMsR0FBRyxRQUFRLENBQUM7R0FDM0IsTUFDSTtBQUNILGVBcEJLLGNBQWMsR0FvQkgsQ0FBQztHQUNsQjtDQUNGOztBQUVNLFNBQVMsUUFBUSxDQUFFLEVBQUUsRUFBRztBQUM3QixTQUFPLFlBQVc7QUFDaEIsZ0JBQVksQ0FBRSxFQUFFLENBQUUsQ0FBQztHQUNwQixDQUFDO0NBQ0g7O0FBRU0sU0FBUyxRQUFRLENBQUUsRUFBRSxFQUFHO0FBQzdCLE1BQUksVUFBVSxHQUFHLENBQUMsQ0FBQztBQUNuQixNQUFJLENBQUMsR0FBRyxJQUFJLGdCQUFnQixDQUFFLEVBQUUsQ0FBRSxDQUFDO0FBQ25DLE1BQUksSUFBSSxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUUsRUFBRSxDQUFFLENBQUM7QUFDekMsR0FBQyxDQUFDLE9BQU8sQ0FBRSxJQUFJLEVBQUcsRUFBRSxhQUFhLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztBQUMzQyxTQUFPLFlBQVc7QUFDaEIsUUFBSSxDQUFDLElBQUksR0FBSSxVQUFVLEdBQUcsRUFBRSxVQUFVLEdBQUcsQ0FBQyxBQUFDLENBQUM7R0FDN0MsQ0FBQztDQUNIOztBQUVNLFNBQVMsTUFBTSxDQUFFLEVBQUUsRUFBRztBQUMzQixNQUFJLE9BQU8sR0FBRyxJQUFJLGNBQWMsRUFBRSxDQUFDO0FBQ25DLFNBQU8sQ0FBQyxLQUFLLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQztBQUM3QixTQUFPLFlBQVc7QUFDaEIsV0FBTyxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUUsQ0FBQyxDQUFFLENBQUM7R0FDaEMsQ0FBQztDQUNIOztBQUVNLFNBQVMsT0FBTyxDQUFFLEVBQUUsRUFBRztBQUM1QixTQUFPLFlBQVc7QUFDaEIsY0FBVSxDQUFFLEVBQUUsRUFBRyxDQUFDLENBQUUsQ0FBQztHQUN0QixDQUFDO0NBQ0g7Ozs7Ozs7O3FCQy9DdUIsWUFBWTtRQVNwQixLQUFLLEdBQUwsS0FBSztRQWlCTCxhQUFhLEdBQWIsYUFBYTs7eUJBaENRLGFBQWE7O0FBRTNDLElBQUksS0FBSyxHQUFHLEtBQUssQ0FBRSxJQUFJLENBQUUsQ0FBQztRQUF0QixLQUFLLEdBQUwsS0FBSztBQUNULElBQUksTUFBTSxHQUFHLENBQUMsQ0FBQztRQUFYLE1BQU0sR0FBTixNQUFNO0FBQ1YsSUFBSSxNQUFNLEdBQUcsRUFBRSxDQUFDOztRQUFaLE1BQU0sR0FBTixNQUFNOztBQUVGLFNBQVMsWUFBWSxDQUFFLEVBQUUsRUFBRyxHQUFHLEVBQUc7QUFDL0MsT0FBSyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUNuQixPQUFLLENBQUMsTUFBTSxHQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQztBQUN0QixVQU5TLE1BQU0sR0FNZixNQUFNLElBQUksQ0FBQyxDQUFDO0FBQ1osTUFBSSxNQUFNLElBQUksQ0FBQyxFQUFFO0FBQ2YsbUJBWGMsV0FBVyxHQVdaLEVBQUUsQ0FBQztHQUNqQjtDQUNGOztBQUVNLFNBQVMsS0FBSyxHQUFHO0FBQ3RCLE1BQUksRUFBRSxFQUFFLEdBQUcsQ0FBQztBQUNaLE9BQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRTtBQUNsQyxNQUFFLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2QsT0FBRyxHQUFHLEtBQUssQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUM7QUFDakIsU0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLFVBQVUsQ0FBQztBQUN0QixTQUFLLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxHQUFHLFVBQVUsQ0FBQztBQUN4QixRQUFJO0FBQ0YsUUFBRSxDQUFFLEdBQUcsQ0FBRSxDQUFDO0tBQ1gsQ0FDRCxPQUFPLEdBQUcsRUFBRztBQUNYLG1CQUFhLENBQUUsR0FBRyxDQUFFLENBQUM7S0FDdEI7R0FDRjtBQUNELFVBMUJTLE1BQU0sR0EwQmYsTUFBTSxHQUFHLENBQUMsQ0FBQztDQUNaOztBQUVNLFNBQVMsYUFBYSxDQUFFLEdBQUcsRUFBRztBQUNuQyxRQUFNLENBQUMsSUFBSSxDQUFFLEdBQUcsQ0FBRSxDQUFDO0FBQ25CLGlCQWxDTyxPQUFPLEVBa0NOLFlBQVc7QUFDakIsUUFBSSxHQUFHLEdBQUcsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQ3pCLFFBQUksR0FBRyxJQUFJLFVBQVUsRUFBRTtBQUNyQixhQUFPLENBQUMsS0FBSyxDQUFFLEdBQUcsQ0FBQyxLQUFLLElBQUksR0FBRyxDQUFFLENBQUM7QUFDbEMsWUFBTSxHQUFHLENBQUM7S0FDWDtHQUNGLENBQUMsRUFBRSxDQUFDO0NBQ04iLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0IHtcbiAgc2V0UHJvdmlkZXIsXG4gIG5leHRUaWNrLFxuICBvYnNlcnZlcixcbiAgd29ya2VyLFxuICB0aW1lb3V0XG59IGZyb20gJy4vcHJvdmlkZXJzJztcblxuZXhwb3J0IGZ1bmN0aW9uIGNob29zZVByb3ZpZGVyKCkge1xuICBpZiAoc2V0SW1tZWRpYXRlKSB7XG4gICAgc2V0UHJvdmlkZXIoIG5leHRUaWNrICk7XG4gIH1cbiAgZWxzZSBpZiAoTXV0YXRpb25PYnNlcnZlcikge1xuICAgIHNldFByb3ZpZGVyKCBvYnNlcnZlciApO1xuICB9XG4gIGVsc2UgaWYgKE1lc3NhZ2VDaGFubmVsKSB7XG4gICAgc2V0UHJvdmlkZXIoIHdvcmtlciApO1xuICB9XG4gIGVsc2Uge1xuICAgIHNldFByb3ZpZGVyKCB0aW1lb3V0ICk7XG4gIH1cbn1cblxudmFyIHNldEltbWVkaWF0ZSA9IChmdW5jdGlvbigpIHtcbiAgdmFyIHNpID0gJGdsb2JhbC5zZXRJbW1lZGlhdGU7XG4gIHJldHVybiBzaSA/IHNpIDogZmFsc2U7XG59KCkpO1xuXG52YXIgTXV0YXRpb25PYnNlcnZlciA9IChmdW5jdGlvbigpIHtcbiAgdmFyIG0gPSAkZ2xvYmFsLk11dGF0aW9uT2JzZXJ2ZXI7XG4gIHJldHVybiBtID8gbSA6IGZhbHNlO1xufSgpKTtcblxudmFyIE1lc3NhZ2VDaGFubmVsID0gKGZ1bmN0aW9uKCkge1xuICAvLyBkb24ndCB1c2Ugd29ya2VyIGlmIHRoaXMgaXMgSUUxMFxuICB2YXIgY2hhbm5lbCA9ICRnbG9iYWwuTWVzc2FnZUNoYW5uZWw7XG4gIHZhciBVaW50OENsYW1wZWRBcnJheSA9ICRnbG9iYWwuVWludDhDbGFtcGVkQXJyYXk7XG4gIHJldHVybiBVaW50OENsYW1wZWRBcnJheSAmJiBjaGFubmVsID8gY2hhbm5lbCA6IGZhbHNlO1xufSgpKTtcbiIsImltcG9ydCBicmlza2l0IGZyb20gJy4vc3RhY2snO1xuaW1wb3J0IHsgZGVmYXVsdCBhcyBwcm92aWRlcnMsIHNldFByb3ZpZGVyIH0gZnJvbSAnLi9wcm92aWRlcnMnO1xuYnJpc2tpdC5wcm92aWRlcnMgPSBwcm92aWRlcnM7XG5icmlza2l0LnVzZSA9IHNldFByb3ZpZGVyO1xuc2V0UHJvdmlkZXIoKTtcblxuZXhwb3J0IGRlZmF1bHQgYnJpc2tpdDtcbiIsImltcG9ydCB7IGZsdXNoIH0gZnJvbSAnLi9zdGFjayc7XG5pbXBvcnQgeyBjaG9vc2VQcm92aWRlciB9IGZyb20gJy4vYXN5bmMnO1xuXG52YXIgYXN5bmMkcHJvdmlkZXI7XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgbmV4dFRpY2s6IG5leHRUaWNrLFxuICBvYnNlcnZlcjogb2JzZXJ2ZXIsXG4gIHdvcmtlcjogd29ya2VyLFxuICB0aW1lb3V0OiB0aW1lb3V0XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0UHJvdmlkZXIoKSB7XG4gIHJldHVybiBhc3luYyRwcm92aWRlciggZmx1c2ggKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldFByb3ZpZGVyKCBwcm92aWRlciApIHtcbiAgaWYgKHByb3ZpZGVyKSB7XG4gICAgYXN5bmMkcHJvdmlkZXIgPSBwcm92aWRlcjtcbiAgfVxuICBlbHNlIHtcbiAgICBjaG9vc2VQcm92aWRlcigpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBuZXh0VGljayggY2IgKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICBzZXRJbW1lZGlhdGUoIGNiICk7XG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBvYnNlcnZlciggY2IgKSB7XG4gIHZhciBpdGVyYXRpb25zID0gMDtcbiAgdmFyIG0gPSBuZXcgTXV0YXRpb25PYnNlcnZlciggY2IgKTtcbiAgdmFyIG5vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSggJycgKTtcbiAgbS5vYnNlcnZlKCBub2RlICwgeyBjaGFyYWN0ZXJEYXRhOiB0cnVlIH0pO1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgbm9kZS5kYXRhID0gKGl0ZXJhdGlvbnMgPSArK2l0ZXJhdGlvbnMgJSAyKTtcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHdvcmtlciggY2IgKSB7XG4gIHZhciBjaGFubmVsID0gbmV3IE1lc3NhZ2VDaGFubmVsKCk7XG4gIGNoYW5uZWwucG9ydDEub25tZXNzYWdlID0gY2I7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICBjaGFubmVsLnBvcnQyLnBvc3RNZXNzYWdlKCAwICk7XG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0aW1lb3V0KCBjYiApIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHNldFRpbWVvdXQoIGNiICwgMSApO1xuICB9O1xufVxuIiwiaW1wb3J0IHsgdGltZW91dCwgZ2V0UHJvdmlkZXIgfSBmcm9tICcuL3Byb3ZpZGVycyc7XG5cbmV4cG9ydCB2YXIgc3RhY2sgPSBBcnJheSggMTAyNCApO1xuZXhwb3J0IHZhciBsZW5ndGggPSAwO1xuZXhwb3J0IHZhciBlcnJvcnMgPSBbXTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gc2NoZWR1bGVUYXNrKCBjYiAsIGFyZyApIHtcbiAgc3RhY2tbbGVuZ3RoXSA9IGNiO1xuICBzdGFja1tsZW5ndGgrMV0gPSBhcmc7XG4gIGxlbmd0aCArPSAyO1xuICBpZiAobGVuZ3RoID09IDIpIHtcbiAgICBnZXRQcm92aWRlcigpKCk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZsdXNoKCkge1xuICB2YXIgY2IsIGFyZztcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkgKz0gMikge1xuICAgIGNiID0gc3RhY2tbaV07XG4gICAgYXJnID0gc3RhY2tbaSsxXTtcbiAgICBzdGFja1tpXSA9ICRVTkRFRklORUQ7XG4gICAgc3RhY2tbaSsxXSA9ICRVTkRFRklORUQ7XG4gICAgdHJ5IHtcbiAgICAgIGNiKCBhcmcgKTtcbiAgICB9XG4gICAgY2F0Y2goIGVyciApIHtcbiAgICAgIHNjaGVkdWxlRXJyb3IoIGVyciApO1xuICAgIH1cbiAgfVxuICBsZW5ndGggPSAwO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2NoZWR1bGVFcnJvciggZXJyICkge1xuICBlcnJvcnMucHVzaCggZXJyICk7XG4gIHRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgdmFyIGVyciA9IGVycm9ycy5zaGlmdCgpO1xuICAgIGlmIChlcnIgIT0gJFVOREVGSU5FRCkge1xuICAgICAgY29uc29sZS5lcnJvciggZXJyLnN0YWNrIHx8IGVyciApO1xuICAgICAgdGhyb3cgZXJyO1xuICAgIH1cbiAgfSkoKTtcbn1cbiJdfQ==
  
}).apply(this,[typeof global != "undefined" ? global : typeof self != "undefined" ? self : typeof window != "undefined" ? window : {},Array,setTimeout]);
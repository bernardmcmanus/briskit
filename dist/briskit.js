/*! briskit - 0.2.1 - Bernard McManus - 2b5c46e - 2015-07-12 */

(function(Array,setTimeout,$UNDEFINED) {
    "use strict";
    var static$$$global = (typeof global != '' + $UNDEFINED ? global : window);
    function async$$chooseProvider() {
      if (async$$setImmediate) {
        providers$$setProvider( providers$$nextTick );
      }
      else if (async$$MutationObserver) {
        providers$$setProvider( providers$$observer );
      }
      else if (async$$MessageChannel) {
        providers$$setProvider( providers$$worker );
      }
      else {
        providers$$setProvider( providers$$timeout );
      }
    }

    var async$$setImmediate = (function() {
      var si = static$$$global.setImmediate;
      return si ? si : false;
    }());

    var async$$MutationObserver = (function() {
      var m = static$$$global.MutationObserver;
      return m ? m : false;
    }());

    var async$$MessageChannel = (function() {
      // don't use worker if this is IE10
      var channel = static$$$global.MessageChannel;
      var Uint8ClampedArray = static$$$global.Uint8ClampedArray;
      return Uint8ClampedArray && channel ? channel : false;
    }());

    var providers$$async$provider;

    var providers$$default = {
      nextTick: providers$$nextTick,
      observer: providers$$observer,
      worker: providers$$worker,
      timeout: providers$$timeout
    };

    function providers$$getProvider() {
      return providers$$async$provider( stack$$flush );
    }

    function providers$$setProvider( provider ) {
      if (provider) {
        providers$$async$provider = provider;
      }
      else {
        async$$chooseProvider();
      }
    }

    function providers$$nextTick( cb ) {
      return function() {
        setImmediate( cb );
      };
    }

    function providers$$observer( cb ) {
      var iterations = 0;
      var m = new MutationObserver( cb );
      var node = document.createTextNode( '' );
      m.observe( node , { characterData: true });
      return function() {
        node.data = (iterations = ++iterations % 2);
      };
    }

    function providers$$worker( cb ) {
      var channel = new MessageChannel();
      channel.port1.onmessage = cb;
      return function() {
        channel.port2.postMessage( 0 );
      };
    }

    function providers$$timeout( cb ) {
      return function() {
        setTimeout( cb , 1 );
      };
    }
    var stack$$stack = Array( 1024 );
    var stack$$length = 0;
    var stack$$errors = [];

    function stack$$scheduleTask( cb , arg ) {
      stack$$stack[stack$$length] = cb;
      stack$$stack[stack$$length+1] = arg;
      stack$$length += 2;
      if (stack$$length == 2) {
        providers$$getProvider()();
      }
    }

    var stack$$default = stack$$scheduleTask;
    function stack$$flush() {
      var cb, arg;
      for (var i = 0; i < stack$$length; i += 2) {
        cb = stack$$stack[i];
        arg = stack$$stack[i+1];
        stack$$stack[i] = $UNDEFINED;
        stack$$stack[i+1] = $UNDEFINED;
        try {
          cb( arg );
        }
        catch( err ) {
          stack$$scheduleError( err );
        }
      }
      stack$$length = 0;
    }

    function stack$$scheduleError( err ) {
      stack$$errors.push( err );
      providers$$timeout(function() {
        var err = stack$$errors.shift();
        if (err !== $UNDEFINED) {
          console.error( err.stack || err );
          throw err;
        }
      })();
    }
    stack$$default.providers = providers$$default;
    stack$$default.use = providers$$setProvider;
    providers$$setProvider();
    var $$index$$default = stack$$default;

    if (typeof exports == 'object') {
      module.exports = $$index$$default;
    }
    else {
      this.briskit = $$index$$default;
    }
}).apply(this,[Array,setTimeout,]);
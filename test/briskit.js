/*! briskit - 0.1.0 - Bernard McManus -  -  - 2015-02-03 */

(function() {
    "use strict";
    var static$$$UNDEFINED;
    var static$$$global = (typeof global != '' + static$$$UNDEFINED ? global : window);
    var static$$$Array = Array;

    var async$$MutationObserver = (function() {
        var m = static$$$global.MutationObserver/* || $global.WebKitMutationObserver*/;
        return m ? m : false;
    }());

    var async$$MessageChannel = (function() {
        // don't use worker if this is IE10
        var worker = static$$$global.MessageChannel;
        var Uint8ClampedArray = static$$$global.Uint8ClampedArray;
        return Uint8ClampedArray && worker ? worker : false;
    }());

    var async$$setImmediate = (function() {
        var si = static$$$global.setImmediate;
        return si ? si : false;
    }());

    var async$$async = (function() {
        if (async$$setImmediate) {
            return async$$nextTick( stack$$flush );
        }
        else if (async$$MutationObserver) {
            return async$$observer( stack$$flush );
        }
        else if (async$$MessageChannel) {
            return async$$channel( stack$$flush );
        }
        else {
            return async$$timeout( stack$$flush );
        }
    }());

    function async$$nextTick( cb ) {
        return function() {
            async$$setImmediate( cb );
        };
    }

    function async$$observer( cb ) {
        var iterations = 0;
        var m = new async$$MutationObserver( cb );
        var node = document.createTextNode( '' );
        m.observe( node , { characterData: true });
        return function() {
            node.data = (iterations = ++iterations % 2);
        };
    }

    function async$$channel( cb ) {
        var worker = new async$$MessageChannel();
        worker.port1.onmessage = cb;
        return function() {
            worker.port2.postMessage( 0 );
        };
    }

    function async$$timeout( cb ) {
        return function() {
            setTimeout( cb , 1 );
        };
    }

    var stack$$stack = static$$$Array( 1024 );
    var stack$$length = 0;
    var stack$$errors = [];

    /*function throwFirstError() {
        if (errors.length) {
            throw errors.shift();
        }
    }*/

    //var requestErrorThrow = rawAsap.makeRequestCallFromTimer(throwFirstError);
    function stack$$requestErrorThrow() {
        //async( throwFirstError );
        async$$timeout(function() {
            //if (errors[0]) {
            /*console.log('before throw',errors);
            timeout(function() {
                console.log('after throw',errors);
            })();*/
            if (stack$$errors.length) {
                throw stack$$errors.shift();
            }
        })();
    }

    function stack$$flush() {
        //console.log('flush requested');
        var callback, arg;
        for (var i = 0; i < stack$$length; i += 2) {
            callback = stack$$stack[i];
            arg = stack$$stack[i+1];
            stack$$stack[i] = static$$$UNDEFINED;
            stack$$stack[i+1] = static$$$UNDEFINED;
            try {
                callback( arg );
            }
            catch( err ) {
                stack$$errors.push( err );
                stack$$requestErrorThrow();
            }
            /*finally {
                console.log('finally',errors);
            }*/
        }
        stack$$length = 0;
    }

    function stack$$schedule( callback , arg ) {
        stack$$stack[stack$$length] = callback;
        stack$$stack[stack$$length+1] = arg;
        stack$$length += 2;
        if (stack$$length == 2) {
            // this 0 argument does nothing, but the transpiler
            // throws a syntax error without it
            async$$async( 0 );
        }
    }

    function main$$briskit( callback , arg ) {
        stack$$schedule( callback , arg );
    }

    var main$$default = main$$briskit;
    var $$index$$default = main$$default;

    if (typeof define == 'function' && define.amd) {
        define([], function() { return $$index$$default });
    }
    else if (typeof exports == 'object') {
        module.exports = $$index$$default;
    }
    else {
        this.briskit = $$index$$default;
    }
}).call(this);


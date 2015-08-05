# briskit

> a high-priority asynchronous task queue.

> _<sup>(adapted from [kriskowal/asap](https://github.com/kriskowal/asap))</sup>_

## usage
assuming we have access to a high-priority async method (like `MutationObserver`, `MessageChannel`, or `setImmediate`):
```javascript
setTimeout(function() {
  console.log('this will print third');
});
briskit(function() {
  console.log('this will print second');
});
(function() {
  console.log('this will print first');
}());
```
<sub>`briskit` will use `setTimeout` as the async provider if nothing better is available.</sub>

## instances
multiple `briskit` instances can be created with the `fork` method. each instance will independently execute its own stack.
```javascript
var $briskit = briskit.fork();
```

## execution
execution of a `briskit` instance's stack can be stopped and started with the `defer` and `flush` methods, respectively.
```javascript
var $briskit = briskit.fork();
$briskit.defer();
$briskit(function(){ console.log( "I'm deferred!" ) });
briskit(function(){ console.log( "I'm not!" ) }); // -> I'm not!
$briskit.flush(); // -> I'm deferred!
```

## providers
`briskit` will use the best possible async provider for its environment, but if for whatever reason you would like to override that choice:
```javascript
briskit.use( 'name' );
```
| Name | Native Method |
| ---- | ------------- |
| `nextTic` | `setImmediate` |
| `observer` | `MutationObserver` |
| `worker` | `MessageChannel` |
| `timeout` | `setTimeout` |

`use` will also accept a function that returns a custom provider. a custom, synchronous provider might look something like:
```javascript
briskit.use(function() {
  return function( cb ) {
    cb();
  };
});
```

## stack
the briskit stack can be used as a standalone class. all parameters are optional:

| Parameter | Type | Default | Description |
| --------- | ---- | ------- | ----------- |
| `autoflush` | `boolean` | `false` | When true, the stack will attempt to flush as soon as a callback is enqueued. |
| `provider` | `function` | `asdf` | The function used for flush calls. Synchronous by default. |
| `provider` | `number` | `1024` | The preallocated stack size. |

```javascript
// commonjs
var stack = briskit.stack( true );

// ES6 (requires compilation)
var Stack = reqire( 'briskit/src/stack' );
stack = new Stack( true );

// usage
stack.defer();
stack.enqueue(function() {
  // ...
});
stack.flush();
```

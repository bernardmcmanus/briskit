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

## providers
`briskit` will use the best possible async provider for its environment, but if for whatever reason you would like to override that choice:
```javascript
briskit.use( briskit.providers.name );
```
| Name | Native Method |
| ---- | ------------- |
| `nextTic` | `setImmediate` |
| `observer` | `MutationObserver` |
| `worker` | `MessageChannel` |
| `timeout` | `setTimeout` |


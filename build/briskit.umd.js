import briskit from './index';

if (typeof define == 'function' && define.amd) {
  define([], function() { return briskit });
}
else if (typeof exports == 'object') {
  module.exports = briskit;
}
else {
  this.briskit = briskit;
}

import briskit from './index';

if (typeof exports == 'object') {
  module.exports = briskit;
}
else {
  this.briskit = briskit;
}

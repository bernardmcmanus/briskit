import Stack from 'stack';
import AsyncProvider from 'async';

export default fork();

function Briskit() {
  var $async = new AsyncProvider();
  var $stack = new Stack( true , $async );
  var $briskit = function( cb ) {
    $stack.enqueue( cb );
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
  briskit.stack = Stack;
  return briskit;
}

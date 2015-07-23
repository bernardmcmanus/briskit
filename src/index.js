import Stack from 'stack';
import AsyncProvider from 'async';

export default fork();

function Briskit() {
	var $async = new AsyncProvider();
	var $stack = new Stack( $async );
	var $briskit = function( cb ) {
		$stack( cb );
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

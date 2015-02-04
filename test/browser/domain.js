define([ 'zone' ], function( zone ) {

	function Domain() {
		var that = this;
		that.handlers = {
			error: function() {}
		};
		that.z = zone.fork({
			onError: function() {
				that.handlers.error.apply( that , arguments );
			}
		});
	}

	Domain.prototype = {
		on: function( evt , handler ) {
			var that = this;
			that.handlers[evt] = handler;
		},
		run: function( func ) {
			var that = this;
			that.z.run( func );
		}
	};

	return {
		create: function() {
			return new Domain();
		}
	};

});




















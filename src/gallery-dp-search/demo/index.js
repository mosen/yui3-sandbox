YUI().use('gallery-dp-search', 'console', function(Y) {

	var yconsole = new Y.Console({
		newestOnTop: false,
		height: '600px'
	});
	yconsole.render('#log');


	var dps = new Y.DP.Search({
            timeout: 1000
        });
        dps.render('#gallery-dp-search');
});
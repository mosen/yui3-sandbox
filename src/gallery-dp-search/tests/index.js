YUI().use('console', 'dp-search-test', function(Y) {

	var yconsole = new Y.Console({
		newestOnTop: false,
		height: '600px'
	});
	yconsole.render('#log');
	
	Y.Test.Runner.run();
	
});
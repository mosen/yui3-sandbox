YUI().use('console', 'dp-table-test', function(Y) {

	var yconsole = new Y.Console({
		newestOnTop: false,
		height: '600px'
	});
	yconsole.render('#log');
	
	Y.Test.Runner.run();
	
});
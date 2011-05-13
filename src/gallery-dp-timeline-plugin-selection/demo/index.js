YUI({
    filter: 'debug'
}).use('gallery-dp-timeline', 'gallery-dp-timeline-plugin-selection', 'console', function(Y) {
        /*
	var yconsole = new Y.Console({
		newestOnTop: false,
		height: '600px'
	});*/
	//yconsole.render('#log');

        
        var dptimeline = new Y.DP.Timeline({
            date: new Date(),
            length: 9,
            children : [
                {start: '2011-03-25', finish: '2011-03-27', summary: 'Project A'},
                {start: '2011-03-24', finish: '2011-03-25', summary: 'Project B'},
                {start: '2011-03-22', finish: '2011-03-27', summary: 'Project C'},
                {start: '2011-03-23', finish: '2011-03-29', summary: 'Project D'},
                {start: '2011-03-24', finish: '2011-03-25', summary: 'Project E'},
                {start: '2011-03-28', finish: '2011-03-28', summary: 'Project F'},
                {start: '2011-03-28', finish: '2011-03-28', summary: 'Project G'}                
            ],
            plugins: [Y.DP.TimelineSelection]
        });
        
        dptimeline.render('#gallery-dp-timeline');

});
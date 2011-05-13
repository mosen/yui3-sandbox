YUI({
    /* filter: 'debug' */
}).use('gallery-dp-timeline', 'gallery-dp-timeline-plugin-headings', 'console', function(Y) {
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
                {start: '2011-03-29', finish: '2011-04-03', summary: 'Project A', category: 'leave'},
                {start: '2011-04-01', finish: '2011-04-01', summary: 'Project B', category: 'sku'},
                {start: '2011-04-01', finish: '2011-04-10', summary: 'Project C', category: 'booked'}              
            ],
            plugins: [Y.DP.TimelineHeadings]
        });
        
        dptimeline.render('#gallery-dp-timeline');


        
        Y.one('#setdate').on('click', function(e) {
           dptimeline.set('date', Y.one('#date').get('value'));
        })
});
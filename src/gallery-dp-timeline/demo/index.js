YUI({
   /* filter: 'debug' */
}).use('gallery-dp-timeline', 'console', function(Y) {
        /*
	var yconsole = new Y.Console({
		newestOnTop: false,
		height: '600px'
	});*/
	//yconsole.render('#log');
        
        var dptimeline = new Y.DP.Timeline({
            date: new Date(),
            children: [
                {start: '2011-03-29', finish: '2011-04-03', summary: 'Project A', category: 'leave'},
                {start: '2011-04-01', finish: '2011-04-01', summary: 'Project B', category: 'sku'},
                {start: '2011-04-01', finish: '2011-04-10', summary: 'Project C', category: 'booked'}
            ]
        });

        dptimeline.render('#gallery-dp-timeline');
        
        Y.one('#add').on('click', function(e) {
           dptimeline.add( { 
               start: Y.one('#start').get('value'), 
               finish: Y.one('#finish').get('value'),
               summary: Y.one('#summary').get('value'),
               category: Y.one('#category').get('value')
            });
        });
        
        Y.one('#delete').on('click', function(e) {
           dptimeline.removeSelected(); 
        });
        
        Y.one('#setdate').on('click', function(e) {
           dptimeline.set('date', Y.one('#date').get('value'));
        })
});
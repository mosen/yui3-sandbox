YUI({
    /* filter: 'debug' */
}).use('gallery-dp-timeline', 'gallery-dp-timeline-plugin-insertion', 'overlay', 'console', function(Y) {
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
            plugins: [Y.DP.TimelineInsertion]
        });
        
        dptimeline.render('#gallery-dp-timeline');

        var ol = new Y.Overlay({
            contentBox: '#editor',
            width: "10em",
            height: "15em",
            visible: false,
            shim: false
        });
        ol.render();

        dptimeline.on('selectionChange', function(e) {
           var selectedItem = e.newVal,
               selectedSummary = selectedItem.get('summary'),
               bb = this.get('boundingBox');
               
           //Y.log(selectedSummary);
           //Y.log(bb);
           
           this.align(selectedItem.get('boundingBox'), [Y.WidgetPositionAlign.TL, Y.WidgetPositionAlign.BC]);
           
           
           
           Y.one('input#summary').set('value', selectedSummary);
           Y.one('input#category').set('value', selectedItem.get('category'));
           Y.one('input#start').set('value', selectedItem.get('start'));
           Y.one('input#finish').set('value', selectedItem.get('finish'));
           
           this.set('visible', true);

           
           
        }, ol);
        
        dptimeline.on('removeChild', function(e) {
            this.set('visible', false);
        }, ol);
        
        Y.one('#cancel').on('click', function(e) {
            this.set('visible', false);
        }, ol);
});
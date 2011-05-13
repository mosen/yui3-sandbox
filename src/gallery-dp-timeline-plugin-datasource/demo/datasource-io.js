YUI().use('gallery-dp-timeline', 'gallery-dp-timeline-plugin-datasource', 'console', function(Y) {
        /*
	var yconsole = new Y.Console({
		newestOnTop: false,
		height: '600px'
	});*/
	//yconsole.render('#log');
        
        var dpTimelineSourceUrl = "http://x/json/schedule";
        
        var dsEvents = new Y.DataSource.IO({source: dpTimelineSourceUrl});
        dsEvents.plug({fn: Y.Plugin.DataSourceJSONSchema, cfg: {
            schema: {
                resultListLocator: "results",
                resultFields: ["myField"]
            }
        }})
        
        var dptimeline = new Y.DP.Timeline({
            date: new Date(),
            length: 9,
            datasource: dsEvents,
            plugins: [{ fn: Y.DP.TimelineDataSource, cfg: { datasource: dsEvents }}]
        });
        
        
        dptimeline.render('#gallery-dp-timeline');
        dptimeline.datasource.load();

});
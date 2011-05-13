YUI().use('datasource-io', 'datasource-jsonschema', function(Y) {
//'datatable', 'datatable-sort', 'gallery-dp-datatable', 'gallery-dp-datatype', 'gallery-dp-datatable-formatters', 'console', function(Y) {
//
//	var yconsole = new Y.Console({
//		newestOnTop: false,
//		height: '600px'
//	});
	//yconsole.render('#log');

        var data = [
                    { id: 1, start: '2010-01-01 00:00:00', category: 'T', price: 100, tax: 10, name: "test item" }
                ];

        var ds = new Y.DataSource.IO({ 
            source: "/json",
            plugins: [
                { fn: Y.Plugin.DataSourceJSONSchema, cfg: { 
                   schema: {
                       resultListLocator: "response",
                       resultFields: [ 'id', 'start', 'category' ]
                   }                    
                }}
            ]
        });
        
        /*
        	
	var dataSource = new Y.DataSource.IO({ source: "/energi-svn/json/revenue" });
	dataSource.plug(Y.Plugin.DataSourceJSONSchema, {
		schema: {
			resultListLocator: "response.items",
			resultFields: fields
		}
	});*/
        
        ds.sendRequest({
            callback: {
                success: function(e) {
                    Y.log(e);
                }
            }
        });

/*
        var cols = [
            {
                key: "id",
                label: "ID",
                formatter: Y.DP.DataTableFormatters.getLinkFormatter('/test/id/{objectid}', { objectid: "id" }, "name")
            },
            {
                key: "start",
                label: "Start",
                formatter: Y.DP.DataTableFormatters.getDateFormatter('%d %m %Y'),
                sortable: true
            }
        ];

        var dt = new Y.DP.DataTable({
            columnset: cols
        });
        
        dt.plug(Y.DP.DataTableDataSource, {
            datasource: ds
        });
        
        dt.plug(Y.Plugin.DataTableSort);
        
        dt.render('#gallery-dp-datatable');*/
        
});
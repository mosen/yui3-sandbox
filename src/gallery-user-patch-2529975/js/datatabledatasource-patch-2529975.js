/**
 * This patch addresses YUI ticket #2529975
 * 
 * The DataTableDataSource plugin creates a new RecordSet instance whenever a
 * response is returned from the server, causing all plugins to be lost (Including
 * the RecordSet.Sort plugin).
 * 
 * This patch clones the RecordSet object to preserve the plugin configuration of
 * the original RecordSet instance.
 *
 * @module gallery-user-patch-2529975
 * @requires DataTable.Base, Y.Plugin.DataTableDataSource
 */

Y.Plugin.DataTableDataSource.prototype.onDataReturnInitializeTable = function(e) {
        // Clone retains original plugin functionality. must be a separate instance
        // In order to trigger the host's recordsetChange event.
        var prevRecordSet = this.get('host').get('recordset'),
            newRecordSet = Y.Object(prevRecordSet); 
            
        newRecordSet.set('records', e.response.results);
        this.get("host").set("recordset", newRecordSet);    
};
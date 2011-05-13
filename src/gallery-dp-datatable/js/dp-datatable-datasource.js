/**
 *
 *
 * @module DP.DataTableDataSource
 * @requires Y.Plugin.DataTableDataSource
 * @deprecated Use gallery-user-patch-2529975 instead
 */

/**
 * Extension to DataTableDataSource plugin which clones the recordset to preserve combinations of plugins
 * such as DataSource/DataSort and Scroll
 * 
 * bugs addressed:
 * DataSource / DataSort : Ticket #2529975 http://yuilibrary.com/projects/yui3/ticket/2529975
 * 
 *
 * @class DataTableDataSource
 * @extends Y.Plugin.DataTableDataSource
 */
function DPDataTableDataSource() {
    DPDataTableDataSource.superclass.constructor.apply(this, arguments);
}

/////////////////////////////////////////////////////////////////////////////
//
// STATIC PROPERTIES
//
/////////////////////////////////////////////////////////////////////////////
Y.mix(DPDataTableDataSource, {
    /**
     * The namespace for the plugin. This will be the property on the host which
     * references the plugin instance.
     *
     * @property NS
     * @type String
     * @static
     * @final
     * @value "datasource"
     */
    NS: "datasource",

    /**
     * Class name.
     *
     * @property NAME
     * @type String
     * @static
     * @final
     * @value "dataTableDataSource"
     */
    NAME: "dataTableDataSource",

/////////////////////////////////////////////////////////////////////////////
//
// ATTRIBUTES
//
/////////////////////////////////////////////////////////////////////////////
    ATTRS: {
        /**
        * @attribute datasource
        * @description Pointer to DataSource instance.
        * @type Y.DataSource
        */
        datasource: {
            setter: "_setDataSource"
        },
        
        /**
        * @attribute initialRequest
        * @description Request sent to DataSource immediately upon initialization.
        * @type Object
        */
        initialRequest: {
            setter: "_setInitialRequest"
        }
    }
});


Y.extend( DPDataTableDataSource, Y.Plugin.DataTableDataSource, {
    
    /**
     * Callback function passed to DataSource's sendRequest() method populates
     * an entire DataTable with new data, clearing previous data, if any.
     *
     * @method onDataReturnInitializeTable
     * @param e {Event.Facade} DataSource Event Facade object.
     */
    onDataReturnInitializeTable : function(e) {
        var prevrecords = this.get('host').get('recordset'),
            newrecords = Y.Object(prevrecords); // Clone retains original plugin functionality.
            
        newrecords.set('records', e.response.results);
        this.get("host").set("recordset", newrecords);
    }
});

Y.namespace('DP').DataTableDataSource = DPDataTableDataSource;
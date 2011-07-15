/**
 *
 *
 * @module DatatableUpdates
 * @author eamonb
 * @requires plugin
 */

/**
 * DatatableUpdates
 * 
 * Allows the DataTable to react to incremental changes in the underlying recordset,
 * rather than re-rendering the entire set.
 *
 * @namespace Y.DP
 * @class DatatableUpdates
 * @extends Plugin.Base
 */
function DatatableUpdates(config) {
    DatatableUpdates.superclass.constructor.apply(this, arguments);
}

Y.mix(DatatableUpdates, {

    NS : "updater",

    NAME : "updater",

    /**
     * The attribute configuration represents the core user facing state of 
     * the plugin.
     *
     * @property ATTRS
     * @type Object
     * @protected
     * @static
     */
    ATTRS : {}    
});

Y.extend(DatatableUpdates, Y.Plugin.Base, {

    /**
     * Initializer runs when the plugin is constructed or plugged into the host instance.
     *
     * @method initializer
     */
    initializer : function () {
        Y.log("DatatableUpdates:init", "info", "DatatableUpdates");
        

        this.afterHostEvent("recordset:add", this._afterRecordsetAdd);
        this.afterHostEvent("recordset:remove", this._afterRecordsetRemove);
        this.afterHostEvent("recordset:empty", this._afterRecordsetEmpty);
        this.afterHostEvent("recordset:update", this._afterRecordsetUpdate);
    },

    /**
     * Destructor runs when the plugin is unplugged
     * Base will automatically detach afterHostEvent/afterHostMethod methods.
     *
     * @method destructor
     */
    destructor: function() {},
    
    /**
     * Update the host DataTable with a new row for the new record
     *
     * @method _afterRecordsetAdd
     * @param
     * @returns
     * @protected
     */
    _afterRecordsetAdd : function() {
        Y.log("_afterRecordsetAdd", "info", "gallery-dp-datatable-updates");
        this.get('host')._uiSetRecordset(this.get('host').get('recordset'));
    },
    
    /**
     * Update the host DataTable with the removed record deleted from the table
     *
     * @method _afterRecordsetRemove
     * @param
     * @returns
     * @protected
     */
    _afterRecordsetRemove : function() {
        Y.log("_afterRecordsetRemove", "info", "gallery-dp-datatable-updates");
        this.get('host')._uiSetRecordset(this.get('host').get('recordset'));
    },
    
    /**
     * Empty the host DataTable
     *
     * @method _afterRecordsetEmpty
     * @param
     * @returns
     * @protected
     */
    _afterRecordsetEmpty : function() {
        Y.log("_afterRecordsetEmpty", "info", "gallery-dp-datatable-updates");
        this.get('host')._uiSetRecordset(this.get('host').get('recordset'));
    },
    
    /**
     * Update the host DataTable with the updated record(s)
     *
     * @method _afterRecordsetUpdate
     * @param
     * @returns
     * @protected
     */
    _afterRecordsetUpdate : function() {
        Y.log("_afterRecordsetUpdate", "info", "gallery-dp-datatable-updates");
        this.get('host')._uiSetRecordset(this.get('host').get('recordset'));
    }
});

Y.namespace("DP").DatatableUpdates = DatatableUpdates;
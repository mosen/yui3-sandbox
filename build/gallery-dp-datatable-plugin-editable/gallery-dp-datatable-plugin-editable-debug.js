YUI.add('gallery-dp-datatable-plugin-editable', function(Y) {

/**
 *
 * @module gallery-dp-datatable-plugin-editable
 * @author eamonb
 * @requires datatable, gallery-plugin-datatable-events, plugin
 */
var Lang = Y.Lang;

/**
 * Provides an API and user interface for editing table row data.
 *
 * @namespace DP
 * @class DatatableEditor
 * @extends Plugin.Base
 */
function DatatableEditor(config) {
    DatatableEditor.superclass.constructor.apply(this, arguments);
}

Y.mix(DatatableEditor, {

    NS : "editor",

    NAME : "editor",

    /**
     * The attribute configuration represents the core user facing state of 
     * the plugin.
     *
     * @property ATTRS
     * @type Object
     * @protected
     * @static
     */
    ATTRS : {

    }    
});

Y.extend(DatatableEditor, Y.Plugin.Base, {

    /**
     * Initializer runs when the plugin is constructed or plugged into the host instance.
     *
     * @method initializer
     * @param config {Object} Configuration object
     */
    initializer : function (config) {
        Y.log("init", "info", this.NAME);
        
        // See Y.Do.before, Y.Do.after
        //this.beforeHostMethod("show", this._beforeHostShowMethod);
        //this.afterHostMethod("show", this._afterHostShowMethod);

        // See Y.EventTarget.on, Y.EventTarget.after
        //this.onHostEvent("render", this._onHostRenderEvent);             
        //this.afterHostEvent("render", this._afterHostRenderEvent);
    },

    /**
     * Destructor runs when the plugin is unplugged
     * Base will automatically detach afterHostEvent/afterHostMethod methods.
     *
     * @method destructor
     */
    destructor: function() { 
    
    },
    
    /**
     * Add a record to the table.
     * 
     * Should support array, Y.Record, null value (empty row)
     *
     * @method add
     * @param record {Array|Y.Record|null}
     * @param index {Number} [optional] the index where the new record will be added
     * @returns undefined
     * @public
     */
    add : function(record, index) {
        Y.log("add", "info", this.NAME);
        
        // Add Array/Record
        if (Lang.isArray(record) || record instanceof Y.Record || Lang.isObject(record)) {
            this.get('host').get('recordset').add(record, index);
            
        // Add Empty Row    
        } else if (Lang.isNull(record) || Lang.isUndefined(record)) {
            this.get('host').get('recordset').add({}, index); // Blank row
        }
    },
    
    /**
     * Remove a record from the table.
     * 
     * Should support TR element, record id, Y.record, index
     *
     * @method remove
     * @param item {TRElement|Record ID|Y.Record|Index}
     * @returns undefined
     * @public
     */
    remove : function(item) {
        var rs = this.get('host').get('recordset'),
            record, records, i = 0;
        
        Y.log("delete", "info", this.NAME);
        
        record = this._resolveRecord(item);
        
        if (Lang.isValue(record)) {
            records = rs.get('records');
            
            for (; i <= records.length; i++) {
                if (records[i] == record) {
                    rs.remove(i);
                    break;
                }
            }
        }
    },
    
    /**
     * Update record(s)
     *
     * @method update
     * @param item {Array|Y.Record|Node} The record to update
     * @param values {Object} Object literal of field : value to update
     * @returns undefined
     * @public
     */
    update : function(item, values) {
        var rs = this.get('host').get('recordset'),
            records = rs.get('records'),
            record,
            vk;

        Y.log("update", "info", this.NAME);

        record = this._resolveRecord(item);
        
        // TODO: find record index for update operation
        if (Lang.isValue(record)) {
            record.set('data', values);
            rs.update(record, records.indexOf(record)); // TODO: recordset.update creates a new record id?
        }
    },
    
    
    /**
     * Resolve the intended record from any number of types of parameters.
     *
     * @method _resolveRecord
     * @param v {Node(TR)|Record ID|TR.id|Y.Record|index}
     * @returns Y.Record The intended record
     * @protected
     */
    _resolveRecord : function(v) {
        var record, record_id,
            rs = this.get('host').get('recordset'),
            hashtable = rs.get('table');
            
        Y.log("_resolveRecord", "info", 'gallery-dp-datatable-plugin-editable');
        
        // Record
        if (v instanceof Y.Record) {
            record = v;
            
        // Record/TR ID
        } else if (Lang.isString(v) && /yui_/.test(v)) {
            record = hashtable[v];
        
        // HTMLTRElement
        } else if (v instanceof Y.Node) {
            record_id = v.get('id');
            record = rs.getRecord(record_id);
            
        // Record Index
        } else if (Lang.isNumber(v)) {
            record = rs.getRecord(v);
        
        } else if (Lang.isArray(v)) {
            // recursive call to resolve multiple specifiers.
        }
        
        return record;
    }
});

Y.namespace("DP").DatatableEditor = DatatableEditor;
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


}, '@VERSION@' ,{requires:['datatable', 'gallery-datatable-tableevents']});

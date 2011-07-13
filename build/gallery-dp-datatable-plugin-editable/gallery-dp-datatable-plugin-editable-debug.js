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

    /**
     * The plugin namespace identifies the property on the host
     * which will be used to refer to this plugin instance.
     *
     * @property NS
     * @type String
     * @static
     */
    NS : "editor",

    /**
     * The plugin name identifies the event prefix and is a basis for generating
     * class names.
     * 
     * @property NAME
     * @type String
     * @static
     */
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
        
/*
         * Attribute properties:
         *  
         * , valueFn: "_defAttrAVal"      // Can be used as a substitute for "value", when you need access to "this" to set the default value.
         *   
         * , setter: "_setAttrA"          // Used to normalize attrA's value while during set. Refers to a prototype method, to make customization easier
         * , getter: "_getAttrA"          // Used to normalize attrA's value while during get. Refers to a prototype method, to make customization easier
         * , validator: "_validateAttrA"  // Used to validate attrA's value before updating it. Refers to a prototype method, to make customization easier
         * , readOnly: true               // Cannot be set by the end user. Can be set by the component developer at any time, using _set
         * , writeOnce: true              // Can only be set once by the end user (usually during construction). Can be set by the component developer at any time, using _set
         * 
         * , lazyAdd: false               // Add (configure) the attribute during initialization. 
         * 
         *                                // You only need to set lazyAdd to false if your attribute is
         *                                // setting some other state in your setter which needs to be set during initialization 
         *                                // (not generally recommended - the setter should be used for normalization. 
         *                                // You should use listeners to update alternate state). 
         * , broadcast: 1                 // Whether the attribute change event should be broadcast or not.
         */
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
            hashtable = rs.get('table'),
            record, record_id, records, i = 0;
        
        Y.log("delete", "info", this.NAME);
        
        // Remove record
        if (item instanceof Y.Record) {
            record = item;
            
        // Remove record ID
        } else if (Lang.isString(item) && /yui_/.test(item)) {
            record = hashtable[item];
        
        // Remove TRElement
        } else if (item instanceof Y.Node) {
            record_id = item.get('id');
            record = rs.getRecord(record_id);
            
        // Remove at index
        } else if (Lang.isNumber(item)) {
            rs.remove(item);
        }
        
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
     * Replace record(s)
     *
     * @method replace
     * @param item {Array|Y.Record} The item to replace at the specified location
     * @param index {Number|String hash key} [optional] Index in the recordset or hash key
     * @returns undefined
     * @public
     */
    replace : function(item, index) {
        Y.log("replace", "info", this.NAME);
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


}, '@VERSION@' ,{requires:['datatable', 'gallery-plugin-datatable-events']});

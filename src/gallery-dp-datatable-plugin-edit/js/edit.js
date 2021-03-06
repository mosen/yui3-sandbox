/**
 *
 * @module gallery-dp-datatable-plugin-edit
 * @author eamonb
 * @requires datatable, gallery-plugin-datatable-events, plugin
 */
var Lang = Y.Lang;

/**
 * Provides an API and user interface for editing table row data.
 *
 * @namespace DP
 * @class DatatableEdit
 * @extends Plugin.Base
 */
function DatatableEdit() {
    DatatableEdit.superclass.constructor.apply(this, arguments);
}



Y.mix(DatatableEdit, {

    NS : "edit",

    NAME : "edit",

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

        /**
         * Access to all of the changes/delta made through the editor api
         *
         * @attribute changes
         * @type Object
         */
        changes : {
            readOnly : true,
            getter : '_getChanges'
        }
    }    
});

Y.extend(DatatableEdit, Y.Plugin.Base, {

    /**
     * A Recordset which holds only the changes made through the editor api.
     * 
     * These can later be retrieved to update the state with the server.
     *
     * @property _changes
     * @type Object
     * @value {}
     */
    _changes: {},

    /**
     * Initializer runs when the plugin is constructed or plugged into the host instance.
     *
     * @method initializer
     * @param config {Object} Configuration object
     */
    initializer : function (config) {
        Y.log("init", "debug", "gallery-dp-datatable-plugin-edit");
        
        var hostRecords = this.get('host').get('recordset');
        
        this._changes.added = new Y.Recordset();
        this._changes.removed = new Y.Recordset();
        this._changes.updated = new Y.Recordset();
        
        this.publish('add', {defaultFn: this._defFnAdd});
        this.publish('remove', {defaultFn: this._defFnRemove});
        this.publish('update', {defaultFn: this._defFnUpdate});
        
        // Host recordset changes are recorded
        hostRecords.on('add', this._recordsAdded, this);
        hostRecords.on('remove', this._recordsRemoved, this);
        hostRecords.on('update', this._recordsUpdated, this);
        hostRecords.on('empty', this._recordsEmptied, this);
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
        
        this.fire('add', {record: record, index: index});
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
        
        this.fire('remove', {record: record, index: i});
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
            record, record_index;

        Y.log("update", "info", this.NAME);

        record = this._resolveRecord(item);
        
        // TODO: find record index for update operation
        if (Lang.isValue(record)) {
            record.set('data', values);
            record_index = records.indexOf(record);
            rs.update(record, record_index); // TODO: recordset.update creates a new record id?
        }
        
        this.fire('update', {record: record, index: record_index});
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
    },
    
    // CUSTOM EVENTS
    
    /**
     * Default handler for the add event
     *
     * @method _defFnAdd
     * @param e {Event} Event facade
     * @returns undefined
     * @protected
     */
    _defFnAdd : function(e) {
        Y.log("_defFnAdd", "info", "gallery-dp-datatable-plugin-editable");

    },
    
    /**
     * Default handler for the remove event
     *
     * @method _defFnRemove
     * @param e {Event} Event facade
     * @returns undefined
     * @protected
     */
    _defFnRemove : function(e) {
        Y.log("_defFnRemove", "info", "gallery-dp-datatable-plugin-editable");

    },
    
    /**
     * Default handler for the update event
     *
     * @method _defFnUpdate
     * @param e {Event} Event facade
     * @returns undefined
     * @protected
     */
    _defFnUpdate : function(e) {
        Y.log("_defFnUpdate", "info", "gallery-dp-datatable-plugin-editable");

    },
    
    // RECORDSET EVENTS
    
    /**
     * Host record(s) added
     *
     * @method _recordsAdded
     * @param e {Event} Event facade with .added and .index properties
     * @returns
     * @public
     */
    _recordsAdded : function(e) {
        var deletedRecords; 
        
        Y.log("_recordsAdded", "info", "gallery-dp-datatable-plugin-editable");

        this._changes.added.add(e.added);
    },
    
    /**
     * Host record(s) Removed
     *
     * @method _recordsRemoved
     * @param e {Event} Event facade with .removed and .index properties
     * @returns
     * @public
     */
    _recordsRemoved : function(e) {
        var editorUpdated = this._changes.updated.get('records'),
            editorAdded = this._changes.added.get('records'),
            updatedIndex, addedIndex;
        
        Y.log("_recordsRemoved", "info", "gallery-dp-datatable-plugin-editable");
        
        Y.Array.each(e.removed, function(v) {
            addedIndex = editorAdded.indexOf(v);
            
            if (addedIndex > -1) {
                this._changes.added.remove(addedIndex);
                return;
            }
            
            updatedIndex = editorUpdated.indexOf(v);
            
            if (updatedIndex > -1) {
                this._changes.updated.remove(updatedIndex);
            }
            
            this._changes.removed.add(v);
        }, this);

    },

    /**
     * Host record(s) Updated
     * 
     * Recordsets .overwritten property is slightly misleading in that it identifies
     * the records from a range of supplied indexes to start updating.
     *
     * @method _recordsUpdated
     * @param e {Event} Event facade with .updated / .overwritten, and .index properties
     * @returns
     * @public
     */
    _recordsUpdated : function(e) {
        var updatedCount = 0,
            overwrittenCount = 0,
            editorUpdated = this._changes.updated.get('records'),
            editorAdded = this._changes.added.get('records'),
            updatedIndex, addedIndex;
        
        Y.log("_recordsUpdated", "info", "gallery-dp-datatable-plugin-editable");
        
        Y.Array.each(e.updated, function(v) {
            addedIndex = editorAdded.indexOf(v);
            if (addedIndex > -1) {
                this._changes.added.update(v, addedIndex);
                return;
            }
            
            updatedIndex = editorUpdated.indexOf(v);
            
            if (updatedIndex > -1) {
                this._changes.updated.update(v, updatedIndex);
                updatedCount++;
            } else {
                this._changes.updated.add(v);
                overwrittenCount++;
            }
        }, this);
        
        Y.log("_recordsUpdated update count: " + updatedCount + " overwrite count: " + overwrittenCount, "debug", "gallery-dp-datatable-plugin-editable");
        //console.dir(this._changes.updated.get('records'));
    },

    /**
     * Host record(s) Emptied
     *
     * @method _recordsEmptied
     * @param
     * @returns
     * @public
     */
    _recordsEmptied : function() {
        Y.log("_recordsEmptied", "info", "gallery-dp-datatable-plugin-editable");
    },
    
    /**
     * Get changes made to the hosts recordset so far.
     *
     * @method _getChanges
     * @param
     * @returns {Object} A hash of changes with properties for .added .removed and .updated
     * @protected
     */
    _getChanges : function() {
        var changes = {
            added : this._changes.added.get('records'),
            removed : this._changes.removed.get('records'),
            updated : this._changes.updated.get('records')
        };
        
        Y.log("_getChanges", "info", "gallery-dp-datatable-plugin-editable");
        
        return changes;
    }
});

Y.namespace("DP").DatatableEdit = DatatableEdit;
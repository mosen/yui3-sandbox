YUI.add('gallery-dp-datalist-plugin-editing', function(Y) {

/**
 * 
 *
 * @module gallery-dp-datalist-plugin-editing
 * @author eamonb
 * @requires plugin, gallery-dp-datalist
 */
var Node = Y.Node,
    YGetClassName = Y.ClassNameManager.getClassName;


/**
 * Editing plugin for the Datalist (Data driven list element)
 *
 * @class DatalistEditing
 * @namespace Y.DP
 * @extends Plugin.Base
 */
function DatalistEditing(config) {
    DatalistEditing.superclass.constructor.apply(this, arguments);
}

Y.mix(DatalistEditing, {

    /**
     * The plugin namespace identifies the property on the host
     * which will be used to refer to this plugin instance.
     *
     * @property NS
     * @type String
     * @static
     */
    NS : "editing",

    /**
     * The plugin name identifies the event prefix and is a basis for generating
     * class names.
     * 
     * @property NAME
     * @type String
     * @static
     */
    NAME : "datalistEditing",

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
         * The URI to use for the create/add operation
         *
         * @attribute uriCreate
         * @type type
         */
        uriCreate : {
            value : null
        },
        
        /**
         * The URI to use for the edit/update operation
         *
         * @attribute uriEdit
         * @type String
         */
        uriEdit : {
            value : null
        },
        
        /**
         * Temporary function to get the desired value for a token in the edit or create URI's
         * This is bad design really, but stretched for time
         * 
         * The function takes the object of values as the first parameter,
         * and the desired token as the second
         *
         * @attribute fnGetValue
         * @type String
         */
        fnGetValue : {
            value : null,
            validator : Y.Lang.isFunction
        },

        /**
         * Strings for i18n
         */
        strings : {
            value : {
                add : 'Add an item'
            }
        }
    }    
});

Y.extend(DatalistEditing, Y.Plugin.Base, {

    /**
     * Initializer runs when the plugin is constructed or plugged into the host instance.
     *
     * @method initializer
     * @param config {Object} Configuration object
     */
    initializer : function (config) {

        
        this.afterHostEvent("render", this._renderEditingTools);
        this.afterHostMethod("_renderItems", this._repositionEditingTools); // Host will append items below our editor
        
        this.publish('add', {defaultFn: this._defFnAdd}); // When a placeholder is successfully saved
        
        //this.get('host').get('contentBox').delegate('click', Y.bind(this._handleRemoveItemClicked, this), '.remove');
        //this.get('contentBox').delegate('click', Y.bind(this._handleRemoveItemClicked, this), '.remove');
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
     * Render the editing tools into the markup
     *
     * @method _renderEditingTools
     * @param
     * @returns
     * @public
     */
    _renderEditingTools : function() {
        
        var list = this.get('host').get('contentBox'),
            phlistitem = Y.Node.create(Y.substitute(this.ITEM_ADD_TEMPLATE, {
                className: this.get('host').getClassName('add'),
                label: this.get('strings.add'),
                wrapperClassName: this.get('host').getClassName('add', 'wrapper'),
                id: Y.guid()
            })),
        /*
            phlistitem = this.get('host')._renderItem(this._renderAddControl, {
                value : { 
                    className: this.get('host').getClassName('add'), 
                    label: this.get('strings.add'), 
                    template: this.ITEM_ADD_TEMPLATE 
                }
            }),*/
            placeholder = phlistitem.one('span'),
            uriEdit = this.get('uriEdit');
        
        this._phlistitem = phlistitem;
        
        list.append(phlistitem);
        placeholder.plug(Y.DP.EditablePlugin, { 
            submitto: this.get('uriCreate'),
            loadfrom: function(n) {return '';}
        });
        placeholder.editable.on('save', Y.bind(this._newItemAdded, this));
        this._placeholder = placeholder;
        
        list.plug(Y.DP.EditablePlugin, {
            delegate: '.' + this.get('host').getClassName('item'),
            event: 'dblclick',
            loadfrom: function(n) {return n.one('a').get('textContent');},
            submitto: Y.bind(function(li) {
                var record = this.get('host').get('recordset').getRecord(li.get('id')),
                    recordValue = record.getValue(),
                    fnGetValue = this.get('fnGetValue');
                
                
                Y.io(Y.substitute(uriEdit, {value: li.one('input').get('value'), id: fnGetValue(recordValue, 'id')}), {
                    on : {
                        start: function(id, o, args) {
                        },
                        success: function(id, o, args) { 
                            this._itemSaved(o, args);
                        },
                        failure: function(id, o, args) { 
                            // TODO: display a warning
                        }
                    },
                    context : this,
                    arguments : {
                        node : li,
                        record : record
                    }
                });
            }, this)
        });
        list.editable.on('save', Y.bind(this._itemSaved, this));

    },
    
    /**
     * Reposition the editing tools below the list of items
     *
     * @method _repositionEditingTools
     * @param
     * @returns
     * @protected
     */
    _repositionEditingTools : function() {
        
        var listNodes = this.get('host').get('contentBox').all('li.'+this.get('host').getClassName('item')),
            lastNode = listNodes.pop();
        
        this.get('host').get('contentBox').append(this._phlistitem);
    },
    
    /**
     * Render the add item control
     *
     * @method _renderAddControl
     * @param config {Object} Configuration object passed through the host's _renderItem method
     * @returns {String} to be added to a list element.
     * @protected
     */
    _renderAddControl : function(config) {
        
        return Y.substitute(config.template, config);
    },
    
    /**
     * Handle the remove link being clicked.
     *
     * @method _handleRemoveItemClicked
     * @param e {Object} Event facade
     * @returns undefined
     * @protected
     */
    _handleRemoveItemClicked : function(e) {
        
        this.remove(e.target);
    },
    
    /**
     * Fired when an existing item is saved
     *
     * @method _itemSaved
     * @param o {Object} Y.IO Response
     * @param args {Object} Additional IO Arguments { li: list node saved, record: record changed }
     * @returns
     * @public
     */
    _itemSaved : function(o, args) {
        
        
        var updatedItem = Y.JSON.parse(o.responseText),
            records = this.get('host').get('recordset'),
            recordId = args.node.get('id'),
            rec;
        
        // = ,
        
        records.after('tableChange', function(e) {
        });
        
        records.update(updatedItem.record);
        //records.add(updatedItem.record, recordId);
        //newNode = this.get('host')._renderItem(Y.bind(this.get('host').get('fnRender'), this.get('host')), { value: updatedItem.record })
        
        //args.record.setValue(updatedItem);
        //args.node.replace(newNode);
        var hashTable = records.get('table'); // Force table update?
        
        this.get('host').set('recordset', records);
    },
    
    /**
     * Fired when a new item is saved by the underlying placeholder editor.
     *
     * @method _newItemAdded
     * @param o {Object} Response from Y.IO
     * @returns
     * @protected
     */
    _newItemAdded : function(o) {
        
        var newItem = Y.JSON.parse(o.details[0].responseText),
            records = this.get('host').get('recordset');

        records.add(newItem);
        this.get('host').set('recordset', records);
        
        this._placeholder.editable.clear();
    },
    
    /**
     * Remove an item from the list.
     *
     * @method remove
     * @param n {Node} Remove link that was clicked
     * @returns
     * @public
     */
    remove : function(n) {
    },
    
    /**
     * Add an item to the list.
     *
     * @method add
     * @param item {Object} Item to add to the datalist
     * @returns
     * @public
     */
    add : function(item) {
    },
    
    /**
     * Update the details of an item
     *
     * @method update
     * @param
     * @returns
     * @public
     */
    update : function(n, item) {
    },
    
    /**
     * Template for the add item link
     *
     * @property ITEM_ADD_TEMPLATE
     * @type String
     * @value '<span class="{className}"></span>'
     */
    ITEM_ADD_TEMPLATE : '<li class="{className}" id="{id}"><span class="{wrapperClassName}"></span></li>',
    
    /**
     * Reference to the placeholder element, used to add new items.
     *
     * @property _placeholder
     * @type Node
     * @value 
     */
    _placeholder: null,
    
    /**
     * Reference to the list item holding the placeholder.
     *
     * @property _phlistitem
     * @type Node
     * @value 
     */
    _phlistitem: null


});

Y.namespace("DP").DatalistEditing = DatalistEditing;


}, '@VERSION@' ,{requires:['plugin', 'substitute', 'json-parse', 'gallery-dp-datalist', 'gallery-dp-editable']});
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

        
        //this.afterHostEvent("render", this._renderEditingTools);
        this.afterHostMethod("_renderItems", this._renderEditingTools);
        
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
            phlistitem = this.get('host')._renderItem(this._renderAddControl, {
                value : { 
                    className: this.get('host').getClassName('add'), 
                    label: this.get('strings.add'), 
                    template: this.ITEM_ADD_TEMPLATE 
                }
            }),
            placeholder = phlistitem.one('span'),
            uriEdit = this.get('uriEdit');
        
        this._phlistitem = phlistitem;
        
        list.append(phlistitem);
        placeholder.plug(Y.DP.EditablePlugin, { 
            submitto: this.get('uriCreate')
        });
        placeholder.editable.on('save', Y.bind(this._newItemAdded, this));
        this._placeholder = placeholder;
        
        list.plug(Y.DP.EditablePlugin, {
            delegate: '.' + this.get('host').getClassName('item'),
            event: 'dblclick',
            loadfrom: function(n) { return n.one('a').get('textContent'); },
            submitto: function(li) {
                Y.io(Y.substitute(uriEdit, { value: li.one('input').get('value'), id: 1 }), {
                on : {
                    success: function(id, o, args) { 
                    },
                    failure: function(id, o, args) { 
                        // TODO: display a warning
                    }
                },
                context : this,
                arguments : {
                    node : li
                }
            });
            }
        });
        list.editable.on('save', Y.bind(this._itemSaved, this));

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
     * Fired when a new item is saved by the underlying placeholder editor.
     *
     * @method _newItemAdded
     * @param o {Object} Response from Y.IO
     * @returns
     * @protected
     */
    _newItemAdded : function(o) {
        
        var newItem = Y.JSON.parse(o.details[0].responseText),
            newNode = this.get('host')._renderItem(Y.bind(this.get('host').get('fnRender'), this.get('host')), { value: newItem });

        this._placeholder.set('innerHTML', '');
        this.get('host').get('contentBox').insert(newNode, this._phlistitem);
        
        this._placeholder.append(Node.create(Y.substitute(this.ITEM_ADD_TEMPLATE, {
            className: this.get('host').getClassName('add'), 
            label: this.get('strings.add')           
        })));
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
    ITEM_ADD_TEMPLATE : '<span class="{className}"></span>',
    
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

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
        }

        
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
        Y.log("_renderEditingTools", "info", this.NAME);
        
        var list = this.get('host').get('contentBox');
        
        list.append(this.get('host')._renderItem(this._renderAddControl, { 
            className: this.get('host').getClassName('add'), 
            label: 'Add an item', 
            template: this.ITEM_ADD_TEMPLATE 
        }));
        
        Y.one('.' + this.get('host').getClassName('add')).plug(Y.DP.EditablePlugin, { 
            submitto: this.get('uriCreate'), 
            loadfrom: function(n) {return '';} // Placeholder becomes nothing.
        });
        
        list.plug(Y.DP.EditablePlugin, {
            delegate: '.' + this.get('host').getClassName('item'),
            submitto: this.get('uriCreate'),
            fnNodeToEditor: function(o) {
                return o.one('a').get('textContent');
            },
            fnEditorToNode: Y.bind(function(o) {
                return this.get('host')._renderItem(Y.bind(this.get('host').get('fnRender'), this.get('host')), { title: o.get('value') });
            }, this)
        })

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
        Y.log("_renderAddControl", "info", this.NAME);
        
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
        Y.log("_handleRemoveItemClicked", "info", this.NAME);
        
        this.remove(e.target);
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
        Y.log("remove " + n.get('id'), "info", this.NAME);
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
        Y.log("add", "info", this.NAME);
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
        Y.log("update", "info", this.NAME);
    },
    
    /**
     * Template for the add item link
     *
     * @property ITEM_ADD_TEMPLATE
     * @type String
     * @value '<span class="{className}">{label}</span>'
     */
    ITEM_ADD_TEMPLATE : '<span class="{className}">{label}</span>'
});

Y.namespace("DP").DatalistEditing = DatalistEditing;


}, '@VERSION@' ,{requires:['plugin', 'substitute', 'gallery-dp-datalist', 'gallery-dp-editable']});

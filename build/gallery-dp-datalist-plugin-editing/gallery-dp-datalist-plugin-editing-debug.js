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

    NS : "editing",

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
         * Strings for i18n
         */
        strings : {
            value : {
                add : 'Add an item' // Placeholder string
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
        Y.log("_renderEditingTools", "info", "gallery-dp-datalist-plugin-editing");
        
        var list = this.get('host').get('contentBox'),
            phlistitem = Y.Node.create(Y.substitute(this.ITEM_ADD_TEMPLATE, {
                className: this.get('host').getClassName('add'),
                label: this.get('strings.add'),
                wrapperClassName: this.get('host').getClassName('add', 'wrapper'),
                id: Y.guid()
            })),
            placeholder = phlistitem.one('span');
        
        this._phlistitem = phlistitem;
        
        
        list.append(phlistitem);
        placeholder.plug(Y.DP.EditablePlugin, { 
            submitto: Y.bind(this._createItemFromPlaceholder, this),
            loadfrom: function(n) {return '';}
        });
        placeholder.editable.on('save', Y.bind(this._newItemSaved, this));
        this._placeholder = placeholder;
        
        list.plug(Y.DP.EditablePlugin, {
            delegate: '.' + this.get('host').getClassName('item'),
            event: 'dblclick',
            loadfrom: function(n) {return n.one('a').get('textContent');},
            submitto: Y.bind(function(li, fnSavedCallback) {
                console.log(li.get('id'));
                var model = this.get('host').get('models').getByClientId(li.get('id'));
                
                model.set('title', li.one('input').get('value'));
                model.save(function(err, response) {
                    fnSavedCallback();
                });
                
            }, this)
        });
        
        //list.editable.on('save', Y.bind(this._itemSaved, this));
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
        Y.log("_repositionEditingTools", "info", "gallery-dp-datalist-plugin-editing");
        
        this.get('host').get('contentBox').append(this._phlistitem); // automatically shifts parentNode
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
        Y.log("_renderAddControl", "info", "gallery-dp-datalist-plugin-editing");
        
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
        Y.log("_handleRemoveItemClicked", "info", "gallery-dp-datalist-plugin-editing");
        
        this.remove(e.target);
    },
    
    /**
     * 
     *
     * @method _newItemSaved
     * @param e {Object} Event facade
     * @returns
     * @public
     */
    _newItemSaved : function(e) {
        Y.log("_newItemSaved", "info", "gallery-dp-datalist-plugin-editing");
        
        this._placeholder.editable.clear(); // TODO: subscribe to editable save event
        //this.fire('add'); // TODO: just for now this forces editor repositioning.
    },
    
    /**
     * Create an item when placeholder is saved
     *
     * @method _createItemFromPlaceholder
     * @param
     * @returns
     * @protected
     */
    _createItemFromPlaceholder : function(li, fnCallback) {
        Y.log("_createItemFromPlaceholder", "info", "gallery-dp-datalist-plugin-editing");
        
        var added = this.get('host').get('models').add({title: li.one('input').get('value')});
        added.save(Y.bind(function(err, data) {
            fnCallback();
            this.fire('add', { model: added });
        }, this)); 
    },
    
    /**
     * Default handler for 'add' event
     *
     * @method _defFnAdd
     * @param e
     * @returns
     * @protected
     */
    _defFnAdd : function(e) {
        Y.log("_defFnAdd", "info", "gallery-dp-datalist-plugin-editing");
        
        this._repositionEditingTools();
        this.get('host').set('selection', [e.model]);
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

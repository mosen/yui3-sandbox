YUI.add('gallery-dp-datalist-plugin-editing', function(Y) {

/**
 * @module gallery-dp-datalist-plugin-editing
 * @author eamonb
 * @requires plugin, gallery-dp-datalist
 */
var Node = Y.Node,
    YGetClassName = Y.ClassNameManager.getClassName;

/**
 * Editing plugin for the Datalist (Data driven list element),
 * Create and Update list elements using a ModelList instance.
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
                tooltip : 'Add an item',
                placeholder : 'Add an item',
                cancel : 'Cancel',
                submit : 'OK',
                indicator : 'Saving...'
            }
        },

        /**
         * Function used to generate the default text whenever
         * starting a new item.
         *
         * @attribute fnDefaultText
         * @type Function
         */
        fnDefaultText : {
            value : function(n) { return ''; },
            validator : Y.Lang.isFunction
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
     * Render the editing tools into the markup.
     *
     * Create the placeholder.
     * Make list items editable.
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
        
        // Create 'New item' Placeholder
        list.append(phlistitem);
        placeholder.plug(Y.DP.EditablePlugin, { 
            submitto: Y.bind(this._fnCreateListItem, this),
            loadfrom: this.get('fnDefaultText'),
            strings: this.get('strings'),
            select: true
        });
        placeholder.editable.on('save', Y.bind(this._onItemCreated, this));
        this._placeholder = placeholder;

        // Create 'Edit existing item' editor
        list.plug(Y.DP.EditablePlugin, {
            delegate: '.' + this.get('host').getClassName('item'),
            event: 'dblclick',
            loadfrom: function(n) { return n.one('a').get('textContent'); },
            submitto: Y.bind(this._fnUpdateListItem, this),
            select: true
        });
    },
    
    /**
     * Reposition the editing tools below the list of items
     *
     * @method _repositionEditingTools
     * @returns undefined
     * @protected
     */
    _repositionEditingTools : function() {
        Y.log("_repositionEditingTools", "info", "gallery-dp-datalist-plugin-editing");
        
        this.get('host').get('contentBox').append(this._phlistitem); // automatically shifts parentNode
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
     * @method _onItemCreated
     * @param e {Object} Event facade
     * @returns
     * @public
     */
    _onItemCreated : function(e) {
        Y.log("_onItemCreated", "info", "gallery-dp-datalist-plugin-editing");
        
        this._placeholder.editable.clear(); // TODO: subscribe to editable save event
        //this.fire('add'); // TODO: just for now this forces editor repositioning.
    },
    
    /**
     * Create an item when placeholder is saved
     *
     * @method _fnCreateListItem
     * @param li {Node} HTML List Element
     * @param fnCallback {Function} Callback to complete the list item creation.
     * @returns undefined
     * @protected
     */
    _fnCreateListItem : function(li, fnCallback) {
        Y.log("_fnCreateListItem", "info", "gallery-dp-datalist-plugin-editing");
        var modelList = this.get('host').get('models'),
            self = this,
            m = new modelList.model({ title: li.one('input').get('value') }); // TODO: this assumes the model has a title ATTR


        modelList.add(m);
        m.save({}, function(err, response) {
            fnCallback(err);
            self.fire('add', { model: m });
        });
        // Need to inject default values on the model
//        modelList.create(m, function (err) {
//            fnCallback(err);
//            self.fire('add', { model: m });
//        });
    },

    /**
     * Update an item that has been edited
     *
     * @method _fnUpdateListItem
     * @param li {Node} HTML List Element
     * @param fnCallback {Function} Callback to complete the list item creation.
     * @returns undefined
     * @protected
     */
    _fnUpdateListItem : function(li, fnCallback) {
        var model = this.get('host').get('models').getByClientId(li.get('id'));

        model.set('title', li.one('input').get('value'));
        model.save(function(err, response) {
            fnCallback(err, response);
        });
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
     * The placeholder always appears at the end of the list.
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

}, '1.0.0' , {  });

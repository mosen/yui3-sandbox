/**
 * @module gallery-dp-datalist
 * @requires widget, datasource
 */
var Node = Y.Node,
    YGetClassName = Y.ClassNameManager.getClassName;

/**
 * A (unordered) list element that uses datasource to create its items.
 *
 * @class Datalist
 * @namespace Y.DP
 * @extends Widget
 */
Y.namespace('DP').DataList = Y.Base.create( 'gallery-dp-datalist', Y.Widget, [], {

    /**
     * @method initializer
     * @param config {Object} Configuration object
     * @protected
     * @constructor
     */
    initializer : function (config) {

        // IO
        //this.publish('success', {defaultFn: this._defResponseSuccessFn});
        this.publish('select');
    },
    
    // No renderUI method because CONTENT_TEMPLATE fulfills requirements.
    
    /**
     * Iterate through list items and call render on each.
     *
     * @method _renderItems
     * @param models {Y.ModelList} a list of models
     * @protected
     */
    _renderItems : function(models) {
        var fnRender = Y.bind(this.get('fnRender'), this),
            listContainer = this.get('contentBox');
        
        Y.log("_renderItems", "info", "gallery-dp-datalist");

        models.each(function(model) {
            listContainer.append(this._renderItem(fnRender, {value: model, id: model.get('id')}));
        }, this);
    },
    
    /**
     * Render a single list item
     *
     * @method _renderItem
     * @param fnRender {Function} The custom function given to us to render the item content
     * @param o {Object} The item to be rendered with .id and .value properties, the value property pointing to a Y.Model
     * @returns {Node} the created node, to append
     * @protected
     */
    _renderItem : function(fnRender, o) {
        //Y.log("_renderItem", "info", "gallery-dp-datalist");
        
        return Y.Node.create(Y.substitute(this.LISTITEM_TEMPLATE, {
            content: fnRender(o.value),
            className: this.getClassName('item'),
            wrapperClassName: this.getClassName('wrapper'),
            id: o.id || Y.guid()
        }));
    },

    /**
     * @method bindUI
     * @public
     */
    bindUI : function () {
        // ATTR
        //this.after('recordsetChange', this._uiSetItems, this);
        // TODO: after modellist read, set items
        this.after('selectionChange', this._uiSetSelected, this);
        
        this.get('models').after('add', this._uiSetItems, this);
        this.get('models').after('remove', this._uiSetItems, this);
        this.get('models').after('reset', this._uiSetItems, this);
        // model.delete() does not remove from parent list.. probably makes sense,
        // but should be configurable for auto goodness
        this.get('models').on('*:delete', this._uiRemoveItems, this);
        this.get('models').on('*:change', this._uiUpdateItems, this);
        
        // DOM
        this.get('contentBox').delegate('click', Y.bind(this._handleItemClicked, this), '.' + this.getClassName('item')); // TODO make this classname configurable
    },
    
    /**
     * @method syncUI
     * @public
     */
    syncUI : function () {
        
    },

    /**
     * Destructor lifecycle implementation for the datalist class.
     *
     * @method destructor
     * @public
     */
    destructor: function() { 
        this.get('contentBox').detach('click');
    },
    
    /**
     * Single interface for io responses, fires custom event at each stage of datasource request.
     * @method _handleResponse
     * @param type {String} Event type
     * @param e {Object} Response Object
     * @protected
     */
    _handleResponse : function (type, e) {      
        this.fire(type, {id: this._io, response: e.response});
        this._io = null;
    },
    
    /**
     * Handle a list item being clicked.
     *
     * @method _handleItemClicked
     * @param e {Object} Event facade
     * @returns undefined
     * @protected
     */
    _handleItemClicked : function(e) {
        // TODO: everything here, related to Recordset
        Y.log("_handleItemClicked", "info", "gallery-dp-datalist");
        
        var li = e.currentTarget,
            rId = li.get('id'),
            model = this.get('models').getById(rId),
            value;
            
        if (undefined === model) {
            Y.log('Couldnt get record for id:' + rId);
            this.get('recordset')._setHashTable();
            Y.log(this.get('recordset').get('table'));
            Y.log(this.get('recordset'));
        }    
        value = model;
        
        this.set('selection', [ '#'+rId ]); // CSSify the item so that the entire array can be selected by Y.all
        this.fire('select', {itemid: rId, item: value});
    },
    
    /**
     * Update the UI with new data when recordset changes.
     *
     * @method _uiSetItems
     * @param e {Object} ATTR Event facade
     * @protected
     */
    _uiSetItems : function(e) {
        // TODO: update here
        Y.log("_uiSetItems", "info", "gallery-dp-datalist");

        var models = this.get('models');
        
        // Note: clearing the content also blows away plugin content/or user content, so we use all/remove
        this.get('contentBox').all('.'+this.getClassName('item')).remove();
        
        this._renderItems(models);
        this._uiSetSelected(); // If selection state was set, but not through the UI
    },
    
    /**
     * Update the UI with the changed items
     *
     * @method _uiUpdateItems
     * @param change {Object} Changed attributes of the child model
     * @returns undefined
     * @protected
     */
    _uiUpdateItems : function(change) {
        //Y.log("_uiUpdateItems", "info", "gallery-dp-datalist");
        var fnRender, updatedItem, oldItem, model = change.target;
        
        if (change.changed.hasOwnProperty('title')) {
            Y.log("Title has changed", "info", "gallery-dp-datalist");
            
            fnRender = Y.bind(this.get('fnRender'), this),
            updatedItem = this._renderItem(fnRender, {value: model, id: model.get('id')});
            
            oldItem = this.get('contentBox').one('li#'+model.get('id'));
            oldItem.replace(updatedItem);
        }
    },
    
    /**
     * Update the UI with removed items
     *
     * @method _uiRemoveItems
     * @param e {Event} Event facade
     * @returns
     * @protected
     */
    _uiRemoveItems : function(e) {
        Y.log("_uiRemoveItems", "info", "gallery-dp-datalist");
    },
    
    /**
     * Update the UI with new selection
     *
     * @method _uiSetSelected
     * @param e {Object} ATTR change event
     * @returns
     * @protected
     */
    _uiSetSelected : function(e) {
        var selection = this.get('selection'),
            list = this.get('contentBox');
        
        Y.log("_uiSetSelected", "info", "gallery-dp-datalist");
        
        list.all('.' + this.getClassName('item', 'selected')).removeClass(this.getClassName('item', 'selected'));
        list.all(selection.join(',')).addClass(this.getClassName('item', 'selected'));
    },
    
    /**
     * Callback object for IO requests
     *
     * @property _ioCallback
     * @type Object
     * @value 
     */
    _ioCallback: {},
    
    /**
     * A tokenized template that will be used to create each list item
     *
     * @property ITEM_TEMPLATE
     * @type String
     */
    ITEM_TEMPLATE: '<a href="#{anchor}">{title}</a>',
    
    /**
     * Template for each list item, will wrap the rendered list item content.
     * 
     * I'm using an additional span wrapper so that content can be inserted inside the list item
     * but outside of the data which changes.
     *
     * @property LISTITEM_TEMPLATE
     * @type String
     * @value 
     */
    LISTITEM_TEMPLATE: '<li class="{className}" id="{id}">{content}</li>',

    /**
     * A tokenized template used to create this widget's list node.
     *
     * @property CONTENT_TEMPLATE
     * @type String
     */
    CONTENT_TEMPLATE: '<ul></ul>'

}, {

    /**
     * Required NAME static field, to identify the Widget class and
     * used as an event prefix, to generate class names etc. (set to the
     * class name in camel case).
     *
     * @property Datalist.NAME
     * @type String
     * @static
     */
    NAME : "datalist",

    /**
     * Static Object hash used to capture existing markup for progressive
     * enhancement. Keys correspond to config attribute names and values
     * are selectors used to inspect the contentBox for an existing node
     * structure.
     *
     * @property Datalist.HTML_PARSER
     * @type Object
     * @protected
     * @static
     */
    HTML_PARSER : {},

    /**
     * Static property used to define the default attribute configuration of
     * the Widget.
     *
     * @property Datalist.ATTRS
     * @type Object
     * @protected
     * @static
     */
    ATTRS : {
        
        /**
         * The Y.ModelList instance that will be used to retrieve the source items
         *
         * @attribute models
         * @type Y.ModelList
         * @default null
         */
        models : {
            value : null
        },
        
        /**
         * Function used to render each list item.
         * 
         * The default simply serves as a basis for customisation.
         *
         * @attribute fnRender
         * @type Function
         */
        fnRender : {
            value : function(item) { // Default renderer

                //Y.log("rendering item", "info", "gallery-dp-datalist");

                return Y.substitute(this.ITEM_TEMPLATE, {
                    className: this.getClassName('item'),
                    anchor: item['id'],
                    title: item['title']
                });           
            },
            validator : Y.Lang.isFunction
        },
        
        /**
         * The currently selected item(s)
         *
         * @attribute selection
         * @type Array
         */
        selection : {
            value : [],
            validator : Y.Lang.isArray
        }

    }
});

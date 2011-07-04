YUI.add('gallery-dp-datalist', function(Y) {

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
        this.publish('success', {defaultFn: this._defResponseSuccessFn});
        this.publish('select');

        // Configure single handler for IO reponses
        this._ioCallback = {
            complete: Y.bind(this._handleResponse, this, 'complete'),
            success: Y.bind(this._handleResponse, this, 'success'),
            failure: Y.bind(this._handleResponse, this, 'failure'),
            end: Y.bind(this._handleResponse, this, 'end')
        };
    },
    
    // No renderUI method because CONTENT_TEMPLATE fulfills requirements.
    
    /**
     * Iterate through list items and call render on each.
     *
     * @method _renderItems
     * @param rs {Y.Recordset} Recordset
     * @protected
     */
    _renderItems : function(rs) {
        var fnRender = Y.bind(this.get('fnRender'), this),
            listContainer = this.get('contentBox');
        
        Y.log("_renderItems", "info", this.NAME);

        rs.each(function(record) {
            listContainer.append(this._renderItem(fnRender, {value: record.get('data'), id: record.get('id')}));
        }, this);
    },
    
    /**
     * Render a single list item
     *
     * @method _renderItem
     * @param fnRender {Function} The custom function given to us to render the item content
     * @param record {Y.Record} The item record
     * @returns {Node} the created node, to append
     * @protected
     */
    _renderItem : function(fnRender, o) {
        //Y.log("_renderItem", "info", this.NAME);
        
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
        this.after('recordsetChange', this._uiSetItems, this);
        this.after('selectionChange', this._uiSetSelected, this);
        
        // DOM
        this.get('contentBox').delegate('click', Y.bind(this._handleItemClicked, this), '.' + this.getClassName('item')); // TODO make this classname configurable
    },
    
    /**
     * @method syncUI
     * @public
     */
    syncUI : function () {
        this.get('source').sendRequest({ request: this.get('initialRequest'), callback: this._ioCallback });
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
     * Default handler for table:success (DataSource.IO Response Success)
     * 
     * @method _defResponseSuccessFn
     * @param o {Object} Response object
     */
    _defResponseSuccessFn : function(o) {
        Y.log('_defResponseSuccessFn', 'info', this.NAME);

        this.set('recordset', new Y.Recordset({records: o.response.results}));
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
        Y.log("_handleItemClicked", "info", this.NAME);
        
        var li = e.currentTarget,
            rId = li.get('id'),
            record = this.get('recordset').getRecord(rId),
            value;
            
        if (undefined == record) {
            Y.log('Couldnt get record for id:' + rId);
            this.get('recordset')._setHashTable();
            Y.log(this.get('recordset').get('table'));
            Y.log(this.get('recordset'));
        }    
        value = record.getValue();
        
        this.set('selection', [ '#'+rId ]); // CSSify the item so that the entire array can be selected by Y.all
        this.fire('select', { itemid: rId, item: value });
    },
    
    /**
     * Update the UI with new data when recordset changes.
     *
     * @method _uiSetItems
     * @param e {Object} ATTR Event facade
     * @protected
     */
    _uiSetItems : function(e) {
        Y.log("_uiSetItems", "info", this.NAME);
        var rs = e.newVal;
        
        // Note: clearing the content also blows away plugin content/or user content, so we use all/remove
        this.get('contentBox').all('.'+this.getClassName('item')).remove();
        this._renderItems(rs);
        this._uiSetSelected(); // If selection state was set, but not through the UI
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
        
        Y.log("_uiSetSelected", "info", this.NAME);
        
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
         * The datasource that will be used to create the list items
         *
         * @attribute source
         * @type DataSource
         * @default null
         */
        source : {
            value : null
        },
        
        /**
         * The last set of data that was retrieved from the datasource
         *
         * @attribute recordset
         * @type Object
         * @default null
         */
        recordset : {
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

                //Y.log("rendering item", "info", this.NAME);

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


}, '@VERSION@' ,{requires:['widget', 'datasource', 'recordset']});

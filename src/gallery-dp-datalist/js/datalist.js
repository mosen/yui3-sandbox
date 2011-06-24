/**
 * @module gallery-dp-datalist
 * @requires widget, datasource
 */

/* Any frequently used shortcuts, strings and constants */
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

        // Configure single handler for IO reponses
        this._ioCallback = {
            complete: Y.bind(this._handleResponse, this, 'complete'),
            success: Y.bind(this._handleResponse, this, 'success'),
            failure: Y.bind(this._handleResponse, this, 'failure'),
            end: Y.bind(this._handleResponse, this, 'end')
        };
    },

    /**
     * Create the DOM structure for the datalist container.
     * Items will be rendered later, when the data is received.
     *
     * @method renderUI
     * @public
     */
    renderUI : function () {
        
    },
    
    /**
     * Iterate through list items and call render on each.
     *
     * @method _renderItems
     * @protected
     */
    _renderItems : function(items) {
        var i = 0,
            fnRender = Y.bind(this.get('fnRender'), this),
            listContainer = this.get('contentBox');
        
        Y.log("_renderItems", "info", this.NAME);

        for (; i < items.length; i++) {
            listContainer.append(this._renderItem(fnRender, items[i]));
        }
    },
    
    /**
     * Render a single list item
     *
     * @method _renderItem
     * @param fnRender {Function} The custom function given to us to render the item content
     * @param item {Object} The item data
     * @returns {Node} the created node, to append
     * @protected
     */
    _renderItem : function(fnRender, item) {
        //Y.log("_renderItem", "info", this.NAME);
        
        return Y.Node.create(Y.substitute(this.LISTITEM_TEMPLATE, {
            content: fnRender(item),
            className: this.getClassName('item'),
            id: item[this.get('anchorkey')]
        }));
    },

    /**
     * @method bindUI
     * @public
     */
    bindUI : function () {
        // ATTR
        this.after('dataChange', this._uiSetItems, this);
        
        // DOM
        this.get('contentBox').delegate('click', Y.bind(this._handleItemClicked, this), '.' + this.getClassName('itemlink')); // TODO make this classname configurable
    },
    
    /**
     * @method syncUI
     * @public
     */
    syncUI : function () {
        this.get('source').sendRequest({request: this.get('initialRequest'), callback: this._ioCallback});
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

        this.set('data', o.response.results);
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
    },
    
    /**
     * Update the UI with new data
     *
     * @method _uiSetItems
     * @param e {Object} ATTR Event facade
     * @protected
     */
    _uiSetItems : function(e) {
        Y.log("_uiSetItems", "info", this.NAME);
        
        this.get('contentBox').set('innerHTML', ''); // Reset content
        this._renderItems(this.get('data'));
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
     * @property LISTITEM_TEMPLATE
     * @type String
     * @value 
     */
    LISTITEM_TEMPLATE: '<li class="{className}">{content}</li>',

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
         * @attribute data
         * @type Object
         * @default null
         */
        data : {
            value : null
        },

        /**
         * The initial datasource request string.
         *
         * @attribute initialRequest
         * @type String
         * @default empty string
         */
        initialRequest : {
            value : ''
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

                Y.log("rendering item", "info", this.NAME);

                return Y.substitute(this.ITEM_TEMPLATE, {
                    className: this.getClassName('item'),
                    anchor: item['id'],
                    title: item['title']
                });           
            },
            validator : Y.Lang.isFunction
        }
    }
});

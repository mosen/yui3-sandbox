YUI.add('gallery-dp-datalist', function(Y) {

/**
 *
 *
 * @module Datalist
 * @requires widget, datasource
 */

/* Any frequently used shortcuts, strings and constants */
var Lang = Y.Lang,
    Node = Y.Node;

/**
 * A list element that uses datasource to create its items.
 *
 * @class Datalist
 * @namespace Y.DP
 * @extends Widget
 */
Y.namespace('DP').DataList = Y.Base.create( 'gallery-dp-datalist', Y.Widget, [], {

    /**
     *
     *
     * @method initializer
     * @param config {Object} Configuration object
     * @protected
     * @constructor
     */
    initializer : function (config) {

        // IO
        this.publish('success', {defaultFn: this._defResponseSuccessFn});

        // Just after sendRequest()
        this.publish('loading', {defaultFn: this._defLoadingFn});

        // Configure single handler for IO reponses
        this._ioCallback = {
                complete: Y.bind(this._handleResponse, this, 'complete'),
                success: Y.bind(this._handleResponse, this, 'success'),
                failure: Y.bind(this._handleResponse, this, 'failure'),
                end: Y.bind(this._handleResponse, this, 'end')
        };
    },

    /**
     * Create the DOM structure for the datalist.
     *
     * @method renderUI
     * @protected
     */
    renderUI : function () {
        var listContainer = Node.create(Y.substitute(this.NODE_TEMPLATE, {
            className : this.getClassName('list')
        }));
        
        this.get('contentBox').append(listContainer);
    },
    
    /**
     * Render all of the items into the list
     *
     * @method _renderItems
     * @protected
     */
    _renderItems : function(items) {
        var i = 0,
            fnRender = Y.bind(this.get('fnRender'), this),
            o = {
                ul : this.get('contentBox').one('ul')
            };
        
        Y.log("_renderItems", "info", this.NAME);

        for (; i < items.length; i++) {
            o.item = items[i];
            fnRender(o);
        }
    },

    /**
     *
     * @method bindUI
     * @protected
     */
    bindUI : function () {
        this.after('dataChange', this._uiSetItems, this);
        this.get('contentBox').delegate('click', Y.bind(this._handleItemClicked, this), 'a');
    },
    
    /**
     * Synchronizes the DOM state with the attribute settings
     *
     * @method syncUI
     */
    syncUI : function () {
        this.get('source').sendRequest({request: this.get('initialRequest'), callback: this._ioCallback});
    },

    /**
     * Destructor lifecycle implementation for the datalist class.
     *
     * @method destructor
     * @protected
     */
    destructor: function() { },
    
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
        this.set('loading', false);
    },

    /**
     * Default handler for the loading event
     * 
     * @method _defLoadingFn
     * @param e {Event} Event
     */
    _defLoadingFn : function(e) {
        Y.log('_defLoadingFn', 'info', this.NAME);

        this.set('loading', true);
    },
    
    /**
     * Handle a list item being clicked.
     *
     * @method _handleItemClicked
     * @param
     * @returns
     * @protected
     */
    _handleItemClicked : function() {
        Y.log("_handleItemClicked", "info", this.NAME);
    },
    
    /**
     * Update the UI with new data
     *
     * @method _uiSetItems
     * @private
     */
    _uiSetItems : function(e) {
        Y.log("_uiSetItems", "info", this.NAME);
        
        this.get('contentBox').one('ul').set('innerHTML', '');
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
    ITEM_TEMPLATE: '<li class="{className}"><a href="#{anchor}">{title}</a></li>',

    /**
     * A tokenized template used to create this widget's list node.
     *
     * @property NODE_TEMPLATE
     * @type String
     */
    NODE_TEMPLATE: '<ul class="{className}"></ul>'

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
         * Strings that need to be localized can be placed here
         *
         * @property Datalist.ATTRS
         * @type Object
         * @protected
         * @static
         */
        strings: {
            value: {
        
            }
        },
        
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
         * Whether the datasource is currently in a loading state
         *
         * @attribute loading
         * @type Boolean
         * @default false
         */
        loading : {
            value : false,
            readOnly : true
        },
        
        /**
         * Key to use in the datasource result for the list item title
         *
         * @attribute titlekey
         * @type String
         * @default "value"
         */
        titlekey : {
            value : 'value'
        },
        
        /**
         * Key to use for the anchor element
         *
         * @attribute anchorkey
         * @type String
         */
        anchorkey : {
            value : 'key'
        },
        
        /**
         * Function used to render each list item.
         *
         * @attribute fnRender
         * @type Function
         */
        fnRender : {
            value : function(o) { // Default renderer
                var item = o.item,
                    titlekey = this.get('titlekey'),
                    anchorkey = this.get('anchorkey');

                Y.log("rendering item", "info", this.NAME);

                o.ul.append(Y.substitute(this.ITEM_TEMPLATE, {
                    className: this.getClassName('item'),
                    anchor: item[anchorkey],
                    title: item[titlekey]
                }));           
            },
            validator : Y.Lang.isFunction
        }
    }
});


}, '@VERSION@' ,{requires:['widget', 'datasource']});

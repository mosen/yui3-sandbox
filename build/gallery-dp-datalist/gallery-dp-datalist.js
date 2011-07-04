YUI.add('gallery-dp-datalist', function(Y) {

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
     * @param rs {Y.Recordset} Recordset
     * @protected
     */
    _renderItems : function(rs) {
        var fnRender = Y.bind(this.get('fnRender'), this),
            listContainer = this.get('contentBox');
        

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
        
        var li = e.currentTarget,
            rId = li.get('id'),
            record = this.get('recordset').getRecord(rId),
            value;
            
        if (undefined == record) {
            this.get('recordset')._setHashTable();
        }    
        value = record.getValue();
        
        this.set('selection', [ '#'+rId ]); // CSSify the item so that the entire array can be selected by Y.all
    },
    
    /**
     * Update the UI with new data
     *
     * @method _uiSetItems
     * @param e {Object} ATTR Event facade
     * @protected
     */
    _uiSetItems : function(e) {
        var rs = e.newVal;
        
        //console.dir(rs);
        
        //this.get('contentBox').set('innerHTML', ''); // Reset content
        this.get('contentBox').all('.'+this.getClassName('item')).remove();
        this._renderItems(rs);
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

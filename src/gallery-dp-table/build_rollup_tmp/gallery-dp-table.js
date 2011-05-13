YUI.add('gallery-dp-table', function(Y) {

//YUI.add('dp-table-cellrenderers', function(Y) {
	
/**
 * Cell renderers are implemented as functions which return closures that are seeded with the configuration.
 * Example closure: supplying a width parameter returns a function that renders a cell, and contains that width variable 'pre-seeded'.
 */
Y.namespace('DP').CellRenderers = {

        /**
         * Format a date field
         * 
         * @param data {Object} row data
         * @param field {String} field name
         * @param cellNode {Node} TD cell reference
         */
        date : function(data, field, cellNode) {
                var d = data[field];

                if (Lang.isDate(d)) {
                        cellNode.set('innerHTML', Y.DataType.Date.format(d, { format: '%x' }));
                } 
        },

        /**
         * Format a date field, using nice words for days if the date is close to the current date.
         * 
         * @param data {Object} row data
         * @param field {String} field name
         * @param cellNode {Node} TD cell reference
         */
        niceDate : function(data, field, cellNode) {
                var d = data[field];

                if (Lang.isDate(d)) {
                        var today = new Date();
                        today.setHours(0,0,0,0); // Make sure the delta doesnt go negative when we take into account time.

                        var todayDelta = d - today,
                            todayDeltaDays = todayDelta/1000/60/60/24;

                        // Use nice format if difference is at most, a week into the future.
                        if (todayDeltaDays >= 0 && todayDeltaDays <= 6 ) {
                            if (todayDeltaDays < 1) {
                                cellNode.set('innerHTML', 'Today');
                            } else if (todayDeltaDays < 2) {
                                cellNode.set('innerHTML', 'Tomorrow');
                            } else {
                                cellNode.set('innerHTML', Y.DataType.Date.format(d, { format: '%A' }));
                            }
                        } else if (todayDeltaDays > -2 && todayDeltaDays < 0) { // Yesterday
                            cellNode.set('innerHTML', 'Yesterday');
                        } else {
                        // Use standard internationalised format.
                            cellNode.set('innerHTML', Y.DataType.Date.format(d, { format: '%x' }));
                        }
                }                  
        },

        /**
         * Format a field where the value is a key to a hash, defined as a json object on the page.
         * 
         * @param el String Selector for element holding hash values.
         * @return Function 
         */
        hash : function(el) {
                return function(data, field, cellNode) {
                    var valuesElement = el;

                    var optionsNode = Y.one(valuesElement),
                        options = Y.JSON.parse(optionsNode.get('innerHTML'));

                    cellNode.set('innerHTML', options[data[field]]);                          
                };
        },

        /**
         * Display a percentage as a visual progress bar
         */
        progress : function() {
            return function(data, field, cellNode) {

                var percentage_value = parseInt(data[field], 0),
                    TEXT_TEMPLATE = '<div class="yui3-dp-cellrenderer-progress-text">{text}</div>',
                    BAR_TEMPLATE = '<div class="yui3-dp-cellrenderer-progress" style="width: {width}%">{textnode}</div>',
                    BG_TEMPLATE = '<div class="yui3-dp-cellrenderer-progress-wrap">{bar}</div>';

                var text_percent = Y.substitute(TEXT_TEMPLATE, { text: percentage_value + '%' });
                var bar = Y.substitute(BAR_TEMPLATE, { width: percentage_value, textnode: text_percent });
                var back = Y.substitute(BG_TEMPLATE, { bar: bar });

                cellNode.append(Node.create(back));
            };
        }

};
	
//}, '1.0.0', { requires: ['lang', 'node', 'substitute', 'datatype-date', 'json-parse'] });
/**
 * @version 1.0.0
 */
// TODO: DataSource table as an extension of a basic table.
/**
 * DP Table
 *
 * @module DP.Table
 * @requires widget, substitute, classnamemanager
 * @namespace Y.DP
 */
var Lang = Y.Lang,
    Node = Y.Node;

/**
 * Dynamic table class.
 *  
 * @class DP.Table
 * @extends Y.Widget
 */
Y.namespace('DP').Table = Y.Base.create('dp-table', Y.Widget, [], {

        /**
         * Initializer, implemented for Y.Base
         * 
         * @method initializer
         */
        initializer : function() {


                // IO
                this.publish('success', {defaultFn: this._defResponseSuccessFn});

                // Just after sendRequest()
                this.publish('loading', {defaultFn: this._defLoadingFn});

                // Single handler for IO Events
                this._ioHandlers = {
                        complete: Y.bind(this._handleResponse, this, 'complete'),
                        success: Y.bind(this._handleResponse, this, 'success'),
                        failure: Y.bind(this._handleResponse, this, 'failure'),
                        end: Y.bind(this._handleResponse, this, 'end')
                };
        },

        /**
         * Destructor, implemented for Y.Base
         * 
         * @method destructor
         */
        destructor : function() {
                // detach click, enter, leave
                this._tbodyNode.detach('click');
                this._tbodyNode.detach('mouseenter');
                this._tbodyNode.detach('mouseleave');

                this._tbodyNode = null;
                this._tableNode = null;
        },

        // Y.Widget Rendering Lifecycle

        /**
         * @see Widget.renderUI
         */
        renderUI : function() {
            this._tbodyNode = Node.create(Y.substitute(this.TBODY_TEMPLATE, {
                className: this.getClassName('tbody')
            }));
            
            this._tableNode = Node.create(Y.substitute(this.TABLE_TEMPLATE, {
                className: this.getClassName('table')
            }));
            
            this._tableNode.append(this._tbodyNode);
            
            this.get('contentBox').append(this._tableNode);
        },

        /**
         * @see Widget.bindUI
         */
        bindUI : function() {
                this.after('queryUpdate', this.handleParameterChange);

                this._tbodyNode.delegate('selectstart', function(e) {
                    e.preventDefault();
                }, 'tr', this);		

                // re-render rows after data change.
                this.after('dataChange', this._afterDataChange);
                this.after('loadingChange', this._afterLoadingChange);

                this.after('queryParametersChange', this._afterQueryParametersChange);
        },

        /**
         * @see Widget.syncUI
         */
        syncUI : function() {
            this.load(""); // Just load the dataset without any query parameters
        },

        // PROTECTED VARIABLES

        /**
         * Object used for IO callback. Contains four functions to handle each stage of the IO request.
         * 
         * @property _ioHandlers
         * @type Object
         */
        _ioHandlers: null,

        /**
         * Reference to the TBODY node containing this table data.
         * 
         * @property _tbodyNode
         * @type Node
         */
        _tbodyNode : null,
        
        /**
         * Reference to the TABLE node.
         *
         * @property _tableNode
         * @type Node
         */
        _tableNode : null,

        // PROTECTED METHODS

        /**
         * Render the rows contained in the data attribute.
         * 
         * @method _renderTableRows
         * @protected
         */
        _renderTableRows : function() {

                var data = this.get('data'),
                    zebraClass,
                    cells = this.get('cells');
                    
                this._tbodyNode.set('content', '');    

                if (data.results.length > 0) {

                        for (var i=0; i < data.results.length; i++) {
                                zebraClass = (i % 2) ? 'row' : 'row-alt';

                                var tr = Node.create(Y.substitute(this.ROW_TEMPLATE, {
                                        trClassName: this.getClassName(zebraClass)
                                }));

                                for (var x=0; x < cells.length; x++) {
                                        var cell = cells[x],
                                            field = cell.field,
                                            cellWidth = cell.width,
                                            td = Node.create(Y.substitute(this.CELL_TEMPLATE, {
                                                tdClassName: this.getClassName('cell')
                                            }));

                                        // Use renderer if defined
                                        if (undefined === cell.renderer) {
                                                td.setContent(data.results[i][field]);
                                        } else {
                                                var cellContent = cell.renderer({
                                                    value: data.results[i][field]
                                                });
                                                
                                                if (cellContent !== undefined) {
                                                    td.setContent(cellContent);
                                                }
                                        }

                                        td.set('width', cellWidth);

                                        tr.append(td);
                                }

                                // Previously we created an array of nodes, and then appended them in one call.
                                // Apparently Node.append no longer supports arrays.
                                this._tbodyNode.append(tr);
                        }
                } else {
                        this._tbodyNode.append(Node.create(Y.substitute(this.ZEROROWS_TEMPLATE, {
                                colspan: this.get('cells').length,
                                message: this.get('strings.zerorows')
                        })));
                }
        },

        /**
         * Load data from the provided Y.DataSource Instance
         * 
         * @method load
         * @param requestString {String} String to be used with datasource's sendRequest method.
         * @public
         */
        load : function(requestString) {

                var ds = this.get('dataSource');

                this._io = ds.sendRequest({
                        request : requestString,
                        callback : this._ioHandlers
                });	

                this.fire('loading', {id: this._io, request: requestString});
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
         * Public handler for parameterchange events.
         * 
         * The subject supplies its list of parameters to us, which we then apply to our locally maintained list of parameters.
         * Our afterChange then applies those to a datasource request.
         * 
         * @method handleParameterChange
         * @public
         * @param e {Event} CustomEvent
         */
        handleParameterChange : function(e) {

                var params = this.get('queryParameters');
                params[e.type] = e.parameters;
                this.set('queryParameters', params);
        },

        /**
         * Default handler for table:success (DataSource.IO Response Success)
         * 
         * @method _defResponseSuccessFn
         * @param o {Object} Response object
         */
        _defResponseSuccessFn : function(o) {

                this.set('data', o.response);
                this.set('loading', false);
        },

        /**
         * Default handler for the loading event
         * 
         * @method _defLoadingFn
         * @param e {Event} Event
         */
        _defLoadingFn : function(e) {

                this.set('loading', true);
        },

        /**
         * New data handler, causes table to re-render
         * 
         * @method _afterDataChange
         * @protected
         */
        _afterDataChange : function(e) {

                this._renderTableRows();
        },

        /**
         * Update widget ui to reflect loading state change.
         * 
         * @method _afterLoadingChange
         * @protected
         * @param e {Event} custom event
         */
        _afterLoadingChange : function(e) {
                var loading = this.get('loading');
                if (loading) {
                } else {
                }
        },

        /**
         * A change in query parameters will rebuild the request string and reload the datasource.
         * 
         * @method _afterQueryParametersChange
         * @protected
         */
        _afterQueryParametersChange : function() {

                var params = this.get('queryParameters'),
                        requestHash = Array(),
                        source,
                        key;

                // Iterate through sources
                
                for (source in params) {
                        for (key in params[source]) {
                                if (params[source][key].length > 0) {
                                        requestHash.push(key + '=' + params[source][key]);
                                }
                        }
                }

                var requestString = "?" + requestHash.join("&");

                this.load(requestString);
        },

        /**
         * Row template for a status message, that spans the entire table.
         * 
         * @property ZEROROWS_TEMPLATE
         * @type String
         */
        ZEROROWS_TEMPLATE : '<tr><td colspan="{colspan}">{message}</td></tr>',

        /**
         * Standard row template.
         * 
         * @property ROW_TEMPLATE
         * @type String
         */
        ROW_TEMPLATE : '<tr class="{trClassName}"></tr>',

        /**
         * Standard cell template.
         * 
         * @property CELL_TEMPLATE
         * @type String
         */
        CELL_TEMPLATE : '<td class="{tdClassName}"></td>',
        
 
        /**
         * Template for the table node
         *
         * @property TABLE_TEMPLATE
         * @type String
         */
        TABLE_TEMPLATE : '<table class="{className}"></table>',
 
        /**
         * Template for the body section
         *
         * @attribute TBODY_TEMPLATE
         * @type String
         */
        TBODY_TEMPLATE : '<tbody class="{className}"></tbody>'
},{
        // static

        /**
         * Static property provides a string to identify the class.
         * <p>
         * Currently used to apply class identifiers to the bounding box 
         * and to classify events fired by the widget.
         * </p>
         *
         * @property Widget.NAME
         * @type String
         * @static
         */
        NAME : "dp-table",

        /**
         * Static property used to define the default attribute 
         * configuration for the Widget.
         * 
         * @property Widget.ATTRS
         * @type Object
         * @static
         */
        ATTRS : {

                // TODO: fix overflow when height is set via constructor.

                strings : {
                        value : {
                            loading : "Loading...",
                            zerorows : "No results available"
                        }
                },

                /**
                 * Array of cells to render. 
                 * Does not necessarily have a 1:1 relationship with DataSource fields, 
                 * because there can be aggregate columns or columns unrelated to the data.
                 * 
                 * cells are specified in the format { field: "fieldname", renderer: fnCellRenderer }
                 */
                cells : {
                        value: Array()
                },

                /**
                 * Active Y.DataSource instance, used to populate the table
                 * 
                 * @attribute dataSource
                 * @default null
                 * @type Y.DataSource
                 */
                dataSource : { 
                        value: null
                },

                /**
                 * The most recent set of results returned by the datasource.
                 * 
                 * @attribute data
                 * @default null
                 * @type Array
                 */
                data : {
                        value: null
                },

                /**
                 * Whether the table is loading new data or not.
                 * 
                 * @attribute loading
                 * @default false
                 * @type Boolean
                 */
                loading : {
                        value: false,
                        validator: Lang.isBoolean
                },

                /**
                 * Array of params
                 * A change in parameters causes a table reload.
                 * 
                 * @attribute queryParameters
                 * @default Empty array
                 * @type Array
                 */
                queryParameters : {
                        value: Array(),
                        validator: Lang.isArray
                }
        }
});
/**
 *
 *
 * @module Headers
 * @requires
 */

/* Any frequently used shortcuts, strings and constants */
var Lang = Y.Lang,
    SORT_ASC = 'asc',
    SORT_DESC = 'desc';

/**
 *
 *
 * @class Headers
 * @extends Plugin
 */
Y.namespace('DP').TableHeaders = Y.Base.create( 'dp-table-headers-plugin', Y.Plugin.Base, [], {

    /**
     * Lifecycle : Initializer
     *
     * @method initializer
     * @param config {Object} Configuration object
     * @protected
     * @constructor
     */
    initializer : function (config) {

        // Sort is fired after a header click
        this.publish('sort', {defaultFn: this._defSortFn});

        // Hover events
        this.publish('columnover', {defaultFn: this._uiSetColumnOver});
        this.publish('columnout', {defaultFn: this._uiSetColumnOut});

        // All subjects of table must publish this to affect the request parameters.
        // Fired when the column sorting changes
        this.publish('queryUpdate', {defaultFn: this._defQueryUpdateFn, bubbles: true});

        this.afterHostMethod('renderUI', this.renderUI, this);
        this.afterHostMethod('bindUI', this.bindUI, this);
    },

    /**
     * Lifecycle : Create the DOM structure for the headers.
     *
     * @method renderUI
     * @protected
     */
    renderUI : function () {
        this._renderTableHead();
        this._renderTableHeadColumns();
    },


    /**
     * Lifecycle : Bind event handlers to the DOM and for CustomEvents
     *
     * @method bindUI
     * @protected
     */
    bindUI : function () {

        // re-render columns after a change in sorting.
        this.after('columnsChange', this._afterColumnsChange);

        // DOM EVENTS
        // 
        // Stop accidental selection of header text.
        this._theadNode.delegate('selectstart', function(e) {
                e.preventDefault();
        }, 'th', this);

        // sort on header click
        this._theadNode.delegate('click', function(e) {
                this.fire('sort', {headerTarget: e.currentTarget});
        }, 'th', this);

        // Column header mouse hover events.
        this._theadNode.delegate('mouseenter', function(e) {
                this.fire('columnover', {headerTarget: e.currentTarget});
        }, 'th', this);

        this._theadNode.delegate('mouseleave', function(e) {
                this.fire('columnout', {headerTarget: e.currentTarget});
        }, 'th', this);
    },
    
    /**
     * Lifecycle : Synchronize the model to the DOM
     *
     * @method syncUI
     */
    syncUI : function () {
        
    },

    /**
     * Destructor lifecycle implementation for the headers class.
     *
     * @method destructor
     * @protected
     */
    destructor: function() { 
        
        this._theadNode.detach('selectstart');
        this._theadNode.detach('click');
        this._theadNode.detach('mouseenter');
        this._theadNode.detach('mouseleave');

        this._theadNode = null;

    },
    
    /**
     * Sort a column in the specified direction.
     *
     * No specified direction will alternate the sort direction.
     * This is usually called by TableHeaders._defSortFn after a custom "sort" event.
     *
     * @method sort
     * @public
     * @param node {Node} TH node to change sort direction for.
     * @param direction SORT_ASC | SORT_DESC [optional] sorting direction.
     */
    sort : function(node, direction) {

            var columns = this.get('columns');

            for (var c=0; c < columns.length; c++) {
                    if (columns[c].node == node) {
                            // Sort inverse
                            switch (columns[c].sort) {
                                    case SORT_ASC:
                                            columns[c].sort = (undefined === direction) ? SORT_DESC : direction;
                                            break;
                                    case SORT_DESC:
                                            columns[c].sort = (undefined === direction) ? '' : direction;
                                            break;
                                    default:
                                            columns[c].sort = (undefined === direction) ? SORT_ASC : direction;
                            }

                            break;
                    }
            }

            this.set('columns', columns);
    },
    
    /**
     * Handle a change in the columns attribute
     * Causes columns to be re-rendered.
     *
     * @method _afterColumnsChange
     * @param e {Event} Custom event facade
     * @protected
     */
    _afterColumnsChange : function(e) {

            var columns = this.get('columns'),
                    queryParameters = Array();

            for (var c=0; c < columns.length; c++) {
                    var col = columns[c];

                    queryParameters['sort[' + col.key + ']'] = col.sort;

                    // Column sorting switches between ascending, descending and none
                    switch (col.sort) {
                            case SORT_ASC:

                                    if (col.sortNode.hasClass(this.get('host').getClassName('sort','desc'))) {
                                            col.sortNode.removeClass(this.get('host').getClassName('sort','desc'));
                                    }

                                    col.sortNode.addClass(this.get('host').getClassName('sort','asc'));

                                    break;
                            case SORT_DESC:

                                    if (col.sortNode.hasClass(this.get('host').getClassName('sort','asc'))) {
                                            col.sortNode.removeClass(this.get('host').getClassName('sort','asc'));
                                    }

                                    col.sortNode.addClass(this.get('host').getClassName('sort','desc'));
                                    break;
                            default:

                                    if (col.sortNode.hasClass(this.get('host').getClassName('sort','desc'))) {
                                            col.sortNode.removeClass(this.get('host').getClassName('sort','desc'));
                                    }

                                    if (col.sortNode.hasClass(this.get('host').getClassName('sort','asc'))) {
                                            col.sortNode.removeClass(this.get('host').getClassName('sort','asc'));
                                    }
                    }
            }

            // Host should listen for all queryUpdate events.
            this.fire('queryUpdate', {parameters : queryParameters});
    },
    
    
    /**
     * Render the THEAD node for this plugin
     *
     * @method _renderTableHead
     * @private
     */
    _renderTableHead : function() {
        this._theadNode = Node.create(Y.substitute(this.THEAD_TEMPLATE, {
            className : this.get('host').getClassName('thead')
        }));
        
        this.get('host')._tableNode.append(this._theadNode);
    },
    
    /**
     * Enhance table columns with styling and sorting
     *
     * @method _renderTableHeadColumns
     * @protected
     */
    _renderTableHeadColumns : function() {
        
        var columns = this.get('columns'),
            columnNode;

        for (var c=0; c < columns.length; c++) {
            
            columns[c].node = Node.create(Y.substitute(this.COLUMN_TEMPLATE, {
                className : this.get('host').getClassName('th'),
                labelClassName : this.get('host').getClassName('th', 'label'),
                label : columns[c].title || ''
            }));
            
            columns[c].sortNode = Node.create(Y.substitute(this.COLUMN_SORT_INDICATOR_TEMPLATE, {
                className: this.get('host').getClassName('sort')
            }));
            
            columns[c].node.append(columns[c].sortNode);

            if (c === 0) {
                columns[c].node.addClass(this.get('host').getClassName('column', 'leftcorner'));
            } else if (c == (columns.length - 1)) {
                columns[c].node.addClass(this.get('host').getClassName('column', 'rightcorner'));
            }

            this._theadNode.append(columns[c].node);
        }
        
    },
    
    /**
     * Default handler for table:sort
     *
     * @method _defSortFn
     * @param e {Event}
     */
    _defSortFn : function(e) {

        this.sort(e.headerTarget);
    },

    /**
     * Default handler for CustomEvent queryUpdate
     * 
     * e.parameters holds an array of query strings to add to the URL
     *
     * @method _defQueryUpdateFn
     * @param e {Event}
     */
    _defQueryUpdateFn : function(e) {
    },

    /**
     * Default handler for column mouseenter
     *
     * @method _uiSetColumnOver
     * @param e {Event}
     */
    _uiSetColumnOver : function(e) {
            var node = e.headerTarget;

            if (!node.hasClass(this.get('host').getClassName('header', 'over'))) {
                    node.addClass(this.get('host').getClassName('header', 'over'));
            }
    },

    /**
     * Default handler for column mouseexit
     *
     * @method _uiSetColumnOut
     * @param e {Event}
     */
    _uiSetColumnOut : function(e) {
            var node = e.headerTarget;

            if (node.hasClass(this.get('host').getClassName('header', 'over'))) {
                    node.removeClass(this.get('host').getClassName('header', 'over'));
            }
    },


    
    /**
     * Reference to the THEAD element in the table
     *
     * @property _theadNode
     * @type Node
     * @protected
     */
    _theadNode : null,
    
    /**
     * Template used to render the table header node.
     *
     * @property THEAD_TEMPLATE
     * @type String
     */
    THEAD_TEMPLATE : '<thead class="{className}"></thead>',
    
    /**
     * Template used to render the row for headings
     *
     * @property ROW_TEMPLATE
     * @type String
     */
    ROW_TEMPLATE : '<tr class="{className}"></tr>',
    
    /**
     * Template used to render each of the headings in the head node.
     *
     * @property COLUMN_TEMPLATE
     * @type String
     */
    COLUMN_TEMPLATE : '<th class="{className}"><span class="{labelClassName}">{label}</span></th>',
    
    /**
     * Contains the sort indicator graphic
     *
     * @property COLUMN_SORT_INDICATOR_TEMPLATE
     * @type String
     * @static
     */
    COLUMN_SORT_INDICATOR_TEMPLATE : '<div class="{className}">&nbsp;</div>'
    
    
// Use NetBeans Code template "ymethod" to add methods here

}, {

    /**
     * The plugin namespace
     *
     * @property NS
     * @type String
     * @protected
     * @static
     */
    NS : "headers",
    
    /**
     * The plugin name
     *
     * @property NAME
     * @type String
     */
    NAME : "tableHeaders",

    /**
     * Static property used to define the default attribute configuration of
     * the Widget.
     *
     * @property Headers.ATTRS
     * @type Object
     * @protected
     * @static
     */
    ATTRS : {

        /**
         * Array of objects representing columns with keys for title and width
         * This will be refactored into a columns object.
         *
         * @attribute columns
         * @default Empty array
         * @type Array
         */
        columns : {
            value : Array()
        }
    }
        

});


}, '@VERSION@' ,{requires:['substitute', 'json-parse', 'node', 'widget', 'datatype', 'dataschema', 'datasource', 'node-pluginhost']});


YUI.add('gallery-dp-table', function(Y){}, '@VERSION@' ,{use:['dp-table'], skinnable:false});


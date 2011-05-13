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
            Y.log("sort", "info", "Y.DP.TableHeaders");

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

                            Y.log('Sorting ' + columns[c].title);
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
            Y.log('gallery-dp-table-headers:_afterColumnsChange');

            var columns = this.get('columns'),
                    queryParameters = Array();

            for (var c=0; c < columns.length; c++) {
                    var col = columns[c];

                    queryParameters['sort[' + col.key + ']'] = col.sort;

                    // Column sorting switches between ascending, descending and none
                    switch (col.sort) {
                            case SORT_ASC:
                                    Y.log('Adding sort ASCENDING to ' + col.title);

                                    if (col.sortNode.hasClass(this.get('host').getClassName('sort','desc'))) {
                                            col.sortNode.removeClass(this.get('host').getClassName('sort','desc'));
                                    }

                                    col.sortNode.addClass(this.get('host').getClassName('sort','asc'));

                                    break;
                            case SORT_DESC:
                                    Y.log('Adding sort DESCENDING to ' + col.title);

                                    if (col.sortNode.hasClass(this.get('host').getClassName('sort','asc'))) {
                                            col.sortNode.removeClass(this.get('host').getClassName('sort','asc'));
                                    }

                                    col.sortNode.addClass(this.get('host').getClassName('sort','desc'));
                                    break;
                            default:
                                    Y.log('Removing sort from ' + col.title);

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
        Y.log("_renderTableHead", "info", "Y.DP.TableHeaders");
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
        Y.log("_defSortFn", "info", "Y.DP.TableHeaders");

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
        Y.log("_defQueryUpdateFn", "info", "Y.DP.TableHeaders");
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
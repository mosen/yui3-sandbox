/**
 * @version 1.0.0
 */

/**
 * DP Table Headers
 * @module gallery-dp-table-headers
 * @requires widget, substitute
 * @namespace Y.DP
 */
var SORT_ASC = 'asc',
    SORT_DESC = 'desc',
    SORT_KEY = 'sortKey',
    SORT_DIRECTION = 'sortDirection';

/**
 * Table Column Headers
 * Progressive enhancement of TH elements to provide sorting functionality.
 *
 * @class TableHeaders
 */
Y.namespace('DP').TableHeaders = Y.Base.create('dp-table-headers', Y.Widget, [], {

    /**
     * Initializer, implemented for Y.Base
     *
     * @method initializer
     * @param config {Object} Configuration object.
     */
    initializer : function(config) {
        Y.log('gallery-dp-table-headers:init');

        // we require the table as srcNode because it is the only valid element to wrap in divs
        //this._theadNode = config.theadNode;

        // Sort is fired after a header click
        this.publish('sort', {defaultFn: this._defSortFn});

        // Hover events
        this.publish('columnover', {defaultFn: this._uiSetColumnOver});
        this.publish('columnout', {defaultFn: this._uiSetColumnOut});

        // All subjects of table must publish this to affect the request parameters.
        // Fired when the column sorting changes
        this.publish('queryUpdate', {defaultFn: this._defQueryUpdateFn});
    },

    destructor : function() {
        this._theadNode.detach('click');
        this._theadNode.detach('mouseenter');
        this._theadNode.detach('mouseleave');

        this._theadNode = null;
    },

    // @see Widget.renderUI
    renderUI : function() {
            this._renderTableColumns();
    },

    // @see Widget.bindUI
    bindUI : function() {
            var theadNode = this.get('theadNode');

            // re-render columns after a change in sorting.
            this.after('columnsChange', this._afterColumnsChange);

            // DOM EVENTS
            // 
            // Stop accidental selection of header text.
            theadNode.delegate('selectstart', function(e) {
                    e.preventDefault();
            }, 'th', this);

            // sort on header click
            theadNode.delegate('click', function(e) {
                    this.fire('sort', {headerTarget: e.currentTarget});
            }, 'th', this);

            // Column header mouse hover events.
            theadNode.delegate('mouseenter', function(e) {
                    this.fire('columnover', {headerTarget: e.currentTarget});
            }, 'th', this);

            theadNode.delegate('mouseleave', function(e) {
                    this.fire('columnout', {headerTarget: e.currentTarget});
            }, 'th', this);
    },

    // @see Widget.syncUI
    syncUI : function() {
        Y.log('gallery-dp-table-headers:syncUI');
    },

    /**
     * Enhance table columns with styling and sorting
     *
     * @method _renderTableColumns
     * @protected
     */
    _renderTableColumns : function() {
        var columns = this.get('columns');

        for (var c=0; c < columns.length; c++) {
            var cnode = columns[c].node;

            var label = Y.Node.create(Y.substitute(this.COLUMN_LABEL_TEMPLATE, {
                className: this.getClassName('label'),
                label: cnode.get('innerHTML')
            }));

            cnode.setContent('');
            cnode.append(label);

            columns[c].sortNode = Node.create(Y.substitute(this.COLUMN_SORT_INDICATOR_TEMPLATE, {
                className: this.getClassName('sort')
            }));

            if (c === 0) {
                columns[c].node.addClass(this.getClassName('column', 'leftcorner'));
            } else if (c == (columns.length - 1)) {
                columns[c].node.addClass(this.getClassName('column', 'rightcorner'));
            }

            cnode.append(columns[c].sortNode);
        }
    },

    /**
     * Default handler for table:sort
     *
     * @method _defSortFn
     * @param e {Event}
     */
    _defSortFn : function(e) {
            Y.log('gallery-dp-table-headers:_defSortFn');

            this.sort(e.headerTarget);
    },

    /**
     * Default handler for CustomEvent queryUpdate
     *
     * @method _defQueryUpdateFn
     * @param e {Event}
     */
    _defQueryUpdateFn : function(e) {
            Y.log('gallery-dp-table-headers:_defQueryUpdateFn');
    },

    /**
     * Default handler for column mouseenter
     *
     * @method _uiSetColumnOver
     * @param e {Event}
     */
    _uiSetColumnOver : function(e) {
            var node = e.headerTarget;

            if (!node.hasClass(this.getClassName('column', 'over'))) {
                    node.addClass(this.getClassName('column', 'over'));
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

            if (node.hasClass(this.getClassName('column', 'over'))) {
                    node.removeClass(this.getClassName('column', 'over'));
            }
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
            Y.log('gallery-dp-table-headers:sort');

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

                                    if (col.sortNode.hasClass(this.getClassName('sort','desc'))) {
                                            col.sortNode.removeClass(this.getClassName('sort','desc'));
                                    }

                                    col.sortNode.addClass(this.getClassName('sort','asc'));

                                    break;
                            case SORT_DESC:
                                    Y.log('Adding sort DESCENDING to ' + col.title);

                                    if (col.sortNode.hasClass(this.getClassName('sort','asc'))) {
                                            col.sortNode.removeClass(this.getClassName('sort','asc'));
                                    }

                                    col.sortNode.addClass(this.getClassName('sort','desc'));
                                    break;
                            default:
                                    Y.log('Removing sort from ' + col.title);

                                    if (col.sortNode.hasClass(this.getClassName('sort','desc'))) {
                                            col.sortNode.removeClass(this.getClassName('sort','desc'));
                                    }

                                    if (col.sortNode.hasClass(this.getClassName('sort','asc'))) {
                                            col.sortNode.removeClass(this.getClassName('sort','asc'));
                                    }
                    }
            }

            this.fire('queryUpdate', {parameters : queryParameters});
    },

    /**
     * Contains the sort indicator graphic
     *
     * @property COLUMN_SORT_INDICATOR_TEMPLATE
     * @type String
     * @static
     */
    COLUMN_SORT_INDICATOR_TEMPLATE : '<div class="{className}">&nbsp;</div>',

    /**
     * Column text content will be wrapped in this element.
     *
     * @property COLUMN_LABEL_TEMPLATE
     * @type String
     * @static
     */
    COLUMN_LABEL_TEMPLATE : '<span class="{className}">{label}</span>',

    /**
     * No content template because this is encompassed by a table tag.
     *
     * @property CONTENT_TEMPLATE
     * @static
     */
    CONTENT_TEMPLATE : null
    
}, {
    
    NAME : "dp-table-headers",

    ATTRS : {

            /**
             * Reference to the table head element
             * 
             * @attribute theadNode
             * @default null
             * @type Node
             */
            theadNode : {
                value: null
            },
            
            /**
             * Reference to the table row element containing the column headers
             *
             * @attribute columnsNode
             * @default null
             * @type Node
             */
            columnsNode : {
                    value : null
            },

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
    },

    HTML_PARSER : {
        
            // Reference to the thead node which will become our contentBox
            theadNode : 'thead.yui3-gallery-dp-table-headers',
            
            // Reference to the row holding the <TH> nodes, aka column headers.
            columnsNode : 'tr.yui3-gallery-dp-table-headers-columns',

            /**
             * Parse table column headers (TH) into a columns array.
             *
             * @param srcNode {Node}
             */
            columns : function(srcNode) {
                    var cols = Array(),
                            ths = srcNode.one('.yui3-dp-table-headers-columns').all('.yui3-dp-table-headers-column');

                    ths.each(function(th) {
                            cols.push({
                                    title: th.get('innerHTML'),
                                    width: th.get('width'),
                                    key: th.getAttribute(SORT_KEY),
                                    sort: th.getAttribute(SORT_DIRECTION),
                                    node: th
                            });
                    }, this);

                    Y.log(cols);
                    return cols;
            }
    }
});
/**
 * DataTable DataSource Sort
 * 
 * Parts of this code taken from the original DataTableSort module by JHD
 *
 * @module Dp-datatable-plugin-serversort
 * @requires
 */

/* Any frequently used shortcuts, strings and constants */
var Lang = Y.Lang,
    YgetClassName = Y.ClassNameManager.getClassName,

    DATATABLE = "datatable",
    COLUMN = "column",
    ASC = "asc",
    DESC = "desc",
    
    // Constants for sort directions
    SORT_ASC = 1001,
    SORT_DESC = 1002,
    SORT_NONE = 1000,
    
    SORT_VALUES = {
        1000: 'NONE',
        1001: 'ASC',
        1002: 'DESC'
    },

    //TODO: Don't use hrefs - use tab/arrow/enter
    TEMPLATE = '<a class="{link_class}" title="{link_title}" href="{link_href}">{value}</a>';
/**
 * Server side sorting plugin for DataTable+DataTableDataSource
 * 
 * Keeps sorting state and sends query string to the server to perform the sorting.
 * Add a cache plugin to the datasource to reduce the number of server connections
 *
 * @class DP.DataTableServerSort
 * @extends Plugin
 */
Y.namespace('DP').DataTableServerSort = Y.Base.create( 'gallery-dp-datatable-plugin-serversort', Y.Plugin.Base, [], {

    /**
     * Initialize the plugin
     * 
     * No interaction with recordset here as we are replacing the recordset upon query.
     * That is taken care of by the DataSource
     *
     * @method initializer
     * @param config {Object} Configuration object
     * @protected
     * @constructor
     */
    initializer : function (config) {
        Y.log("init", "info", "DataTableServerSort");
        
        var dt = this.get('host'),
            dtsource = dt.datasource;

        // Wrap link around TH value
        this.beforeHostMethod("_createTheadThNode", this._beforeCreateTheadThNode, this);
        
        // Add class
        this.beforeHostMethod("_attachTheadThNode", this._beforeAttachTheadThNode, this);
        this.beforeHostMethod("_attachTbodyTdNode", this._beforeAttachTbodyTdNode, this);
        
        dt.delegate("click", Y.bind(this._handleHeaderClick, this), "th");
        
        this.publish('sort', {defaultFn: this._uiSetSort});
    },

    /**
     * Destructor lifecycle implementation for the dp-datatable-plugin-serversort class.
     *
     * @method destructor
     * @protected
     */
    destructor: function() { },
    
    
   /**
    * Before header cell element is created, inserts link markup around {value}.
    * 
    * Incorporates patch #2529943 : title is hardcoded.
    * Now defaults to key if title is not supplied.
    *
    * @method _beforeCreateTheadThNode
    * @param o {Object} {value, column, tr}.
    * @protected
    */
    _beforeCreateTheadThNode: function(o) {
        if(o.column.get("sortable")) {
            o.value = Y.substitute(this.get("template"), {
                link_class: o.link_class || "",
                link_title: o.column.get("title") || o.column.get("key"),
                link_href: "#",
                value: o.value
            });
        }
    },

    /**
    * Before header cell element is attached, sets applicable class names.
    *
    * @method _beforeAttachTheadThNode
    * @param o {Object} {value, column, tr}.
    * @protected
    */
    _beforeAttachTheadThNode: function(o) {
        var lastSortedBy = this.get("lastSortedBy"),
            key = lastSortedBy && lastSortedBy.key,
            dir = lastSortedBy && lastSortedBy.dir,
            notdir = lastSortedBy && lastSortedBy.notdir;

        // This Column is sortable
        if(o.column.get("sortable")) {
            o.th.addClass(YgetClassName(DATATABLE, "sortable"));
        }
        // This Column is currently sorted
        if(key && (key === o.column.get("key"))) {
            o.th.replaceClass(YgetClassName(DATATABLE, notdir), YgetClassName(DATATABLE, dir));
        }
    },

    /**
    * Before header cell element is attached, sets applicable class names.
    *
    * @method _before_beforeAttachTbodyTdNode
    * @param o {Object} {record, column, tr, headers, classnames, value}.
    * @protected
    */
    _beforeAttachTbodyTdNode: function(o) {
        var lastSortedBy = this.get("lastSortedBy"),
            key = lastSortedBy && lastSortedBy.key,
            dir = lastSortedBy && lastSortedBy.dir,
            notdir = lastSortedBy && lastSortedBy.notdir;

        // This Column is sortable
        if(o.column.get("sortable")) {
            o.td.addClass(YgetClassName(DATATABLE, "sortable"));
        }
        // This Column is currently sorted
        if(key && (key === o.column.get("key"))) {
            o.td.replaceClass(YgetClassName(DATATABLE, notdir), YgetClassName(DATATABLE, dir));
        }
    },
    
    /**
     * Handle a click in a header node.
     *
     * @method _handleHeaderClick
     * @private
     * @param e {Event} Event facade
     */
    _handleHeaderClick : function(e) {
        Y.log("_handleHeaderClick", "info", "DataTableServerSort");
        
        e.halt();
        //TODO: normalize e.currentTarget to TH
        var dt = this.get("host"),
            column = dt.get("columnset").idHash[e.currentTarget.get("id")];
            
        if (column.get("sortable")) {
            this.sort(column);
        }
    },
    
    /**
     * Sort the given column, in the given direction (if specified)
     * Otherwise, rotate sorting through none, ascending, descending.
     *
     * @method sort
     * @public
     * @param column {Object} Column to sort
     * @param dir {Integer} Direction to sort, one of SORT_ASC, SORT_DESC, SORT_NONE
     */
    sort : function(column, dir) {
        var sorting = this.get('sorting'),
            columnId = column.get('id'),
            currentDir = sorting[columnId];
        
        Y.log("sort", "info", "DataTableServerSort");
        Y.log("dir:" + currentDir, "info", this.NS);
        
        if (dir !== undefined) {
            sorting[column.get('id')] = dir;
        } else { // Rotate through states
            if (currentDir === undefined || currentDir === SORT_NONE) {
                sorting[columnId] = SORT_ASC;
            } else if (currentDir === SORT_ASC) {
                sorting[columnId] = SORT_DESC;
            } else if (currentDir === SORT_DESC) {
                delete sorting[columnId];
            }
        }
        
        this.fire("sort", { column: column, direction: sorting[columnId] });
    },
    
    /**
     * Update the UI with the sort state
     * 
     * @method _uiSetSort
     * @protected
     * @param e {Event} Event facade
     */
    _uiSetSort : function(e) {
        Y.log("_uiSetSort direction:" + e.direction, "info", "DataTableServerSort");
        
        var col = e.column.thNode;
        
        switch(e.direction) {
            case SORT_ASC:
                Y.log("sort ascending", "info", "DataTableServerSort");
                col.removeClass(YgetClassName(DATATABLE, DESC));
                col.addClass(YgetClassName(DATATABLE, ASC));
                break;
            case SORT_DESC:
                col.removeClass(YgetClassName(DATATABLE, ASC));
                col.addClass(YgetClassName(DATATABLE, DESC));
                break;
            default:
                col.removeClass(YgetClassName(DATATABLE, DESC));
                col.removeClass(YgetClassName(DATATABLE, ASC));
        }
    },
    
    /**
     * Grab a set of query parameters as a joinable array
     * 
     * eg. [ key, value, key, value ] becomes key=value&key=value
     *
     * @method getQueryParameters
     * @returns Array
     * @public
     */
    getQueryParameters : function() {
        var sorting = this.get('sorting'),
            params = [],
            column;
          
        Y.log("getQueryParameters", "info", this.NS);
        
        for (key in sorting) {
            column = this.get('host').get('columnset').idHash[key];
            Y.log("sort " + column.get('key') + "=" + sorting[key], "info", this.NS);
            params.push('sort[' + column.get('key') + "]=" + SORT_VALUES[sorting[key]]);
        }
        
        return params;
    }
    
}, {

    /**
     * The plugin namespace
     * 
     * Clashes with DataTableSort on purpose. You cannot have
     * both sort plugins active on one instance.
     *
     * @property NS
     * @type String
     * @protected
     * @static
     */
    NS : "sort",


    /**
     * Static property used to define the default attribute configuration of
     * the Widget.
     *
     * @property ATTRS
     * @type Object
     * @protected
     * @static
     */
    ATTRS : {

        sorting : {
            value : []
        },
        
        template : {
            value : TEMPLATE
        }
        
    }
});
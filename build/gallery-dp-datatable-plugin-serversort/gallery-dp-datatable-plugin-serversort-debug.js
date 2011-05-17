YUI.add('gallery-dp-datatable-plugin-serversort', function(Y) {

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
     */
    _handleHeaderClick : function() {
        Y.log("_handleHeaderClick", "info", "DataTableServerSort");
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
        
        /**
         * An object literal of columns to their sort state
         * 
         * @attribute sortlist
         * @default Object
         */
        sortlist : {
            value : undefined
        },
        
        template : {
            value : TEMPLATE
        }
    }
        

});


}, '@VERSION@' ,{requires:['datatable', 'datatable-datasource']});

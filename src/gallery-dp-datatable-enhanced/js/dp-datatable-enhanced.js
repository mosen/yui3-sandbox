/**
 * 
 *
 * @module gallery-dp-datatable-enhanced
 * @requires datatable
 */

/* Any frequently used shortcuts, strings and constants */
var Lang = Y.Lang,
    YgetClassName = Y.ClassNameManager.getClassName,
    DATATABLE = "datatable",
    CLASS_LINER = YgetClassName(DATATABLE, "liner"),
    TD_TEMPLATE = '<td headers="{headers}" class="{classnames}"><div class="'+CLASS_LINER+'"></div></td>';


/**
 * DataTable which has been enhanced with extra features.
 * 
 * The features implemented here are to override behaviour found in DataTable.Base.
 * That is, an extension was necessary to implement the feature. All other enhancement
 * features will be released as plugins.
 *
 * @class DP.DataTableEnhanced
 * @extends DataTable.Base
 */
Y.namespace('DP').DataTableEnhanced = Y.Base.create( 'gallery-dp-datatable-enhanced', Y.DataTable.Base, [], {


    /**
     *
     *
     * @method initializer
     * @param config {Object} Configuration object
     * @protected
     * @constructor
     */
//    initializer : function (config) {
//
//
//    },

    /**
     * Create the DOM structure for the dp-datatable-enhanced.
     *
     * @method renderUI
     * @protected
     */
//    renderUI : function () {
//
//    },


    /**
     *
     * @method bindUI
     * @protected
     */
//    bindUI : function () {
//
//    },
    
    /**
     * Synchronizes the DOM state with the attribute settings
     *
     * @method syncUI
     */
//    syncUI : function () {
//        
//    },

    /**
     * Destructor lifecycle implementation for the dp-datatable-enhanced class.
     *
     * @method destructor
     * @protected
     */
//    destructor: function() { }
    
    
    // Use NetBeans Code template "ymethod" to add methods here

    /**
     * Create DataTable TD Nodes
     * 
     * Enhanced to provide text-align specification in the column.
     * Columns can have an align attribute which will determine how the content is
     * aligned.
     * 
     * Incorporates fix from patch #2529920/#2529921
     * 
     * @method _createTbodyTdNode
     * @protected
     * @param o {Object} Object
     * @return {Node} TD Node
     */
    _createTbodyTdNode : function(o) {
        var column = o.column,
            formatvalue = null;

        //TODO: attributes? or methods?
        o.headers = column.headers;
        o.classnames = column.get("classnames");
        o.align = column.get("align");
        o.td = Y.Node.create(Y.substitute(TD_TEMPLATE, o));
        o.liner = o.td.one('div');
        
        if (o.align == 'left' || o.align == 'right' || o.align == 'center') {
            o.liner.setStyle('textAlign', o.align);
        }

        formatvalue = this.formatDataCell(o);

        // Formatters should return a string value to be appended, lack of a string here indicates that the formatter has utilised 
        // the o.td reference to populate the cell.
        if (Y.Lang.isString(formatvalue)) {
            o.value = formatvalue;
            o.liner.append(formatvalue);
        }

        return o.td;
    }


}, {

    /**
     * Required NAME static field, to identify the Widget class and
     * used as an event prefix, to generate class names etc. (set to the
     * class name in camel case).
     *
     * @property NAME
     * @type String
     * @static
     */
    NAME : "DataTableEnhanced",

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
         * Strings that need to be localized can be placed here
         *
         * @property ATTRS
         * @type Object
         * @protected
         * @static
         */
//        strings: {
//            value: {
//                //yourkey:your String value
//            }
//        }

        // Use NetBeans Code Template "yattr" to add attributes here
    }
});

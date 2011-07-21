YUI.add('gallery-dp-datatable-enhanced', function(Y) {

/**
 * TODO: specifying all column widths should result in table-layout: fixed
 * 
 * NOTE: width is applied to the liner element child of TD. This is because in table-layout: auto mode
 * the content can still adjust the TD width even with a specific value.
 *
 * @module gallery-dp-datatable-enhanced
 * @requires datatable
 */

/* Any frequently used shortcuts, strings and constants */
var Lang = Y.Lang,
    YNode = Y.Node,
    YgetClassName = Y.ClassNameManager.getClassName,
    Ycreate = YNode.create,
    Ysubstitute = Y.substitute,
    
    DATATABLE = "datatable",
    CLASS_MSG = YgetClassName(DATATABLE, "msg"),
    CLASS_LINER = YgetClassName(DATATABLE, "liner"),
    TD_TEMPLATE = '<td headers="{headers}" class="{classnames}"><div class="'+CLASS_LINER+'"></div></td>',
    TEMPLATE_TH = '<th id="{id}" rowspan="{rowspan}" colspan="{colspan}" class="{classnames}" abbr="{abbr}"><div class="'+CLASS_LINER+'">{value}</div></th>',
    COLUMN_TEMPLATE_EXT = '<col></col>';


/**
 * DataTable which has been enhanced with extra features.
 * 
 * The features implemented here are to override behaviour found in DataTable.Base.
 * That is, an extension was necessary to implement the feature. All other enhancement
 * features will be released as plugins.
 * 
 * New features found in DTE, some which existed in YUI2:
 * 
 * - sortFn attribute on the column allows you to define your own sorting method for the column data.
 * - align attribute on the column allows you to quickly set text alignment within the cell liner.
 * - width attribute on the column will correctly set width now.
 * 
 * 
 * @namespace Y.DP
 * @class DataTableEnhanced
 * @extends DataTable.Base
 */
Y.namespace('DP').DataTableEnhanced = Y.Base.create( 'gallery-dp-datatable-enhanced', Y.DataTable.Base, [], {
    
    initializer : function() {
        this.after('recordsetChange', this._uiSetMessage);
    },

    /**
     * Set the message if the recordset contains no rows
     *
     * @method _uiSetMessage
     * @param e {Object} Event ATTR change
     * @returns
     * @protected
     */
    _uiSetMessage : function(e) {
        
        if (e.newVal.getLength() == 0) {
            this._tableNode.one('.'+CLASS_MSG).setContent('There are no rows here');
        } else {
            this._tableNode.one('.'+CLASS_MSG).setContent('');
        }
    },

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
        
        if (column.get('width') !== undefined) {
            o.liner.setStyle('width', column.get('width'));
        }

        formatvalue = this.formatDataCell(o);

        // Formatters should return a string value to be appended, lack of a string here indicates that the formatter has utilised 
        // the o.td reference to populate the cell.
        if (Y.Lang.isString(formatvalue)) {
            o.value = formatvalue;
            o.liner.append(formatvalue);
        }

        return o.td;
    },
    
   /**
    * Creates header cell element.
    *
    * Enhanced to set width on header cell elements.
    *
    * @method _createTheadThNode
    * @param o {Object} {value, column, tr}.
    * @protected
    * @returns Y.Node
    */
    _createTheadThNode: function(o) {
        var column = o.column,
            thNode;
        
        // Populate template object
        o.id = column.get("id");//TODO: validate 1 column ID per document
        o.colspan = column.colSpan;
        o.rowspan = column.rowSpan;
        o.abbr = column.get("abbr");
        o.classnames = column.get("classnames");
        o.value = Ysubstitute(this.get("thValueTemplate"), o);
        
        thNode = Ycreate(Ysubstitute(this.thTemplate, o));
        
        o.liner = thNode.one('div');
        
        if (column.get('width') !== undefined) {
            o.liner.setStyle('width', column.get('width'));
        }

        /*TODO
        // Clear minWidth on hidden Columns
        if(column.get("hidden")) {
            //this._clearMinWidth(column);
        }
        */
        
        return thNode;
    },
    
   /**
    * Creates and attaches COLGROUP element to given TABLE.
    * 
    * Note that col elements can sometimes be used to specify width, but the type of
    * attributes understood varies greatly between browsers, making this not an
    * ideal choice.
    *
    * @method _addColgroupNode
    * @param tableNode {Y.Node} Parent node.
    * @protected
    * @returns Y.Node
    */
    _addColgroupNode: function(tableNode) {
        // Add COLs to DOCUMENT FRAGMENT
        var len = this.get("columnset").keys.length,
            columnSet = this.get("columnset"),
            column,
            i = 0,
            colgroupNode = Y.Node.create('<colgroup></colgroup>');

        //for(; i<len; ++i) {
        for (; i < columnSet.keys.length; i++) {
            column = columnSet.keys[i];

            // Set column desired width using liner node as per YUI2
            var colNode = Y.Node.create('<col></col>');
            
            colgroupNode.append(colNode);
        }

        // Create COLGROUP
        this._colgroupNode = tableNode.insertBefore(colgroupNode, tableNode.get("firstChild"));

        return this._colgroupNode;
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
    NAME : "dataTableEnhanced"

});
Y.mix(Y.Column, {
   ATTRS : {
       /**
        * Alignment of cell contents, applied to the liner div element.
        *
        * @attribute align
        * @default undefined
        */
       align : {
           value : undefined
       },
       
       /**
        * Function used for sorting column values, applied to recordset.
        * 
        * This is mentioned but not implemented in DataTable.Base
        * 
        * @attribute sortFn
        * @default null
        */
       sortFn : {
           value : null
       }
   } 
}, false, null, 0, true); // Mix with merge


}, '@VERSION@' ,{requires:['datatable']});

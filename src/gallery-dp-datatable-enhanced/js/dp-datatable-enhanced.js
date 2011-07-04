/**
 * 
 * TODO: specifying all column widths should result in table-layout: fixed
 * NOTE: DataTable in YUI2 sets column widths by applying the width property to the liner,
 * so that table layout: auto will not resize that column depending on content. seems like a better way.
 * jquery datatable applies width to TH, but not to TD elements (we can't do that because of DataTableScroll's dual layout)
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
 * @class DP.DataTableEnhanced
 * @extends DataTable.Base
 */
Y.namespace('DP').DataTableEnhanced = Y.Base.create( 'gallery-dp-datatable-enhanced', Y.DataTable.Base, [], {

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
    * Enhanced to provide column attributes that were defined in the host configuration. namely:
    * column width and minimum width
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
            
            //Y.log('Setting column width to ' + column.get('width'));
            // TODO: FF supports width and nothing else, making colgroup a really bad mechanism for column manipulation
            /*
            var colNode = Y.Node.create(Y.substitute('<col width="{columnWidth}"></col>', {
                columnWidth : column.get('width') || ''
            }));*/
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

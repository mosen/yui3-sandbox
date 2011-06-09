YUI.add('gallery-dp-datatable-enhanced', function(Y) {

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
    
    DATATABLE = "datatable",
    CLASS_LINER = YgetClassName(DATATABLE, "liner"),
    TD_TEMPLATE = '<td headers="{headers}" class="{classnames}"><div class="'+CLASS_LINER+'"></div></td>',
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
    
    // Attempt to speed this up by limiting the number of dom modifications happening inside the loop
    /**
     * Updates TBODY.
     *
     * @method _uiSetRecordset
     * @param rs {Y.Recordset} New Recordset.
     * @protected
     */
    /*
    _uiSetRecordset: function(rs) {
        var i = 0,//TODOthis.get("state.offsetIndex")
            len = rs.getLength(), //TODOthis.get("state.pageLength")
            oldTbody = this._tbodyNode,
            parent = oldTbody.get("parentNode"),
            nextSibling = oldTbody.next(),
            o = {},
            trNodes = [];

        o.tbody = this._tbodyNode;
        this._tbodyNode.set('innerHTML', '');
        
        // Iterate Recordset to use existing TR when possible or add new TR
        for(; i<len; ++i) {
            o.record = rs.getRecord(i);
            o.rowindex = i;
            trNodes.push(this._addTbodyTrNode(o)); //TODO: sometimes rowindex != recordindex
        }
        
        //console.dir(trNodes);
        
        Y.Array.each(trNodes, function(v) {
            this._tbodyNode.append(v);
        }, this);

        
        // TBODY to DOM
        //parent.insert(this._tbodyNode, nextSibling);
    },*/
    
   /**
    * Creates and attaches data row element.
    *
    * @method _addTbodyTrNode
    * @param o {Object} {tbody, record}
    * @protected
    */
   /*
    _addTbodyTrNode: function(o) {
        var tbody = o.tbody,
            record = o.record;
        o.tr = tbody.one("#"+record.get("id")) || this._createTbodyTrNode(o);
        //this._attachTbodyTrNode(o);
        
        return o.tr;
    }*/
    
   /**
    * Attaches data row element.
    *
    * @method _attachTbodyTrNode
    * @param o {Object} {tbody, record, tr}.
    * @protected
    */
   /*
    _attachTbodyTrNode: function(o) {
        var tbody = o.tbody,
            tr = o.tr,
            index = o.rowindex,
            nextSibling = tbody.get("children").item(index) || null,
            isEven = (index%2===0);
            
        if(isEven) {
            tr.replaceClass(CLASS_ODD, CLASS_EVEN);
        }
        else {
            tr.replaceClass(CLASS_EVEN, CLASS_ODD);
        }
        
        tbody.insertBefore(tr, nextSibling);
    }*/


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

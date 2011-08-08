var Lang = Y.Lang,
    YNode = Y.Node,
    YgetClassName = Y.ClassNameManager.getClassName,
    Ycreate = YNode.create,
    Ysubstitute = Y.substitute,
    
    DATATABLE = "datatable",
    CLASS_MSG = YgetClassName(DATATABLE, "msg"),
    CLASS_LINER = YgetClassName(DATATABLE, "liner"),
    TD_TEMPLATE = '<td headers="{headers}"><div class="'+CLASS_LINER+'">{value}</div></td>',
    TEMPLATE_TH = '<th id="{id}" rowspan="{rowspan}" colspan="{colspan}" class="{classnames}" abbr="{abbr}"><div class="'+CLASS_LINER+'">{value}</div></th>',
    COLUMN_TEMPLATE_EXT = '<col></col>';


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
    Y.DataTable.Base.prototype._createTbodyTdNode = function(o) {
        var column = o.column,
            formatvalue = null;
            
        //Y.log("_createTbodyTdNode", "info", "DTTest");

        //TODO: attributes? or methods?
        o.headers = column.headers;
        //o.classnames = column.get("classnames");
        //o.align = column.get("align");
        //formatvalue = this.formatDataCell(o);
        formatvalue = "rec";
        o.value = formatvalue;
        o.td_template = Y.substitute(TD_TEMPLATE, o);
        /*
        o.liner = o.td.one('div');
        
        if (o.align == 'left' || o.align == 'right' || o.align == 'center') {
            o.liner.setStyle('textAlign', o.align);
        }
        
        if (column.get('width') !== undefined) {
            o.liner.setStyle('width', column.get('width'));
        }*/

        

        // Formatters should return a string value to be appended, lack of a string here indicates that the formatter has utilised 
        // the o.td reference to populate the cell.
//        if (Y.Lang.isString(formatvalue)) {
//            o.value = formatvalue;
//            o.td_template = Y.substitute(o.td_template)
//        }
//
//        return o.td_template;
        return o.td_template;
    };

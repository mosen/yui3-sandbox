/**
 * This patch addresses YUI ticket #2530026
 * 
 * The tr node inside the thead section of datatable has a bogus id. The id attribute is
 * not supplied to the template upon creation, and so the TR receives an id of
 * "{id}".
 *
 * @module gallery-user-patch-2530026
 * @requires DataTable.Base
 */

var YgetClassName = Y.ClassNameManager.getClassName,
    
    DATATABLE = "datatable",
    
    CLASS_FIRST = YgetClassName(DATATABLE, "first"),
    CLASS_LAST = YgetClassName(DATATABLE, "last");

Y.DataTable.Base.prototype._createTheadTrNode = function(o, isFirst, isLast) {
    //TODO: custom classnames

    // FIX: generate a guid for the TR element
    o.id = Y.guid();

    var tr = Y.Node.create(Y.substitute(this.get("trTemplate"), o)),
        i = 0,
        columns = o.columns,
        len = columns.length,
        column;

     // Set FIRST/LAST class
    if(isFirst) {
        tr.addClass(CLASS_FIRST);
    }
    if(isLast) {
        tr.addClass(CLASS_LAST);
    }

    for(; i<len; ++i) {
        column = columns[i];
        this._addTheadThNode({value:column.get("label"), column: column, tr:tr});
    }

    return tr;
};
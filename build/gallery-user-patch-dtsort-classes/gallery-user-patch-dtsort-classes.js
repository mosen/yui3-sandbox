YUI.add('gallery-user-patch-dtsort-classes', function(Y) {

/**
 * This patch addresses an issue with DataTableSort and DataTableScroll combined
 * @todo cannot replicate again? check original code
 * 
 * The DataTableSort plugin highlights the sorted column after the sort has been made.
 * The problem is that the selector for the rows does not work when DataTableScroll has been
 * applied to the table instance, because the headings and the body are now distinctly different
 * sections of the table.
 * 
 * Additionally, the source refers to a non-existent class for cells in a specific column, and adds a new
 * attribute 'header=' to each TD node.
 * 
 * The fix here is to query for the 'header' attribute, though a custom class should be considered.
 *
 * @module gallery-user-patch-dtsort-classes
 * @requires DataTable.Base, Y.Plugin.DataTableSort, Y.Plugin.DataTableScroll
 */

var YgetClassName = Y.ClassNameManager.getClassName,

    DATATABLE = "datatable",
    COLUMN = "column";


Y.Plugin.DataTableSort.prototype._uiSetLastSortedBy = function(prevVal, newVal, dt) {
        
    var prevKey = prevVal && prevVal.key,
        prevDir = prevVal && prevVal.dir,
        newKey = newVal && newVal.key,
        newDir = newVal && newVal.dir,
        cs = dt.get("columnset"),
        prevColumn = cs.keyHash[prevKey],
        newColumn = cs.keyHash[newKey],
        tbodyNode = dt._tbodyNode,
        prevRowList, newRowList;

    // Clear previous UI
    if(prevColumn) {
        prevColumn.thNode.removeClass(YgetClassName(DATATABLE, prevDir));

        // This NodeList would be empty in the current version 3.3.0
        //prevRowList = tbodyNode.all("."+YgetClassName(COLUMN, prevColumn.get("id")));
        prevRowList = tbodyNode.all('td[headers="' + prevColumn.get('id') + '"]');

        prevRowList.removeClass(YgetClassName(DATATABLE, prevDir));
    }

    // Add new sort UI
    if(newColumn) {
        newColumn.thNode.addClass(YgetClassName(DATATABLE, newDir));

        // This NodeList would be empty in the current version 3.3.0            
        //newRowList = tbodyNode.all("."+YgetClassName(COLUMN, newColumn.get("id")));
        newRowList = tbodyNode.all('td[headers="' + newColumn.get('id') + '"]');

        newRowList.addClass(YgetClassName(DATATABLE, newDir));
    }
};


}, '@VERSION@' ,{skinnable:false, requires:['datatable']});

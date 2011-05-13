YUI.add('gallery-user-patch-2529943', function(Y) {

/**
 * This patch addresses YUI ticket #2529943
 * 
 * http://yuilibrary.com/projects/yui3/ticket/2529943
 * 
 * The DataTableSort plugin creates a link for each column heading to allow the user to sort datatable rows.
 * The title attribute is hard coded to the value 'title', this patch allows the title to be configurable, or by default
 * uses the column key as the title.
 *
 * @module gallery-user-patch-2529943
 * @requires DataTable.Base, Y.Plugin.DataTableSort
 */

Y.Plugin.DataTableSort.prototype._beforeCreateTheadThNode = function(o) {
        if(o.column.get("sortable")) {
            o.value = Y.substitute(this.get("template"), {
                link_class: o.link_class || "",
                link_title: o.column.get("title") || o.column.get("key"),
                link_href: "#",
                value: o.value
            });
        }
};


}, '@VERSION@' ,{requires:['datatable', 'datasource'], skinnable:false});

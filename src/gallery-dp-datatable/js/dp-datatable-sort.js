/**
 * @deprecated use gallery user patch instead
 */

function DPDataTableSort() {
    DPDataTableSort.superclass.constructor.apply(this, arguments);
}

Y.mix(DPDataTableSort, Y.Plugin.DataTableSort);

Y.extend( DPDataTableSort, Y.Plugin.DataTableSort, {
   /**
    * Before header cell element is created, inserts link markup around {value}.
    * 
    * Fix static "title" in TH node
    * Ticket #2529943 / http://yuilibrary.com/projects/yui3/ticket/2529943
    *
    * @method _beforeCreateTheadThNode
    * @param o {Object} {value, column, tr}.
    * @protected
    * @deprecated Use gallery-user-patch-2529943
    */
    _beforeCreateTheadThNode: function(o) {
        Y.log("augmented sort th node", "info", "object");
        if(o.column.get("sortable")) {
            o.value = Y.substitute(this.get("template"), {
                link_class: o.link_class || "",
                link_title: o.column.get("title") || "title",
                link_href: "#",
                value: o.value
            });
        }
    },
    
    /**
     * Updates sort UI.
     *
     * @method _uiSetLastSortedBy
     * @param val {Object} New lastSortedBy object {key,dir}.
     * @param dt {Y.DataTable.Base} Host.
     * @protected
     */
    
    _uiSetLastSortedBy: function(prevVal, newVal, dt) {
        
        
        var prevKey = prevVal && prevVal.key,
            prevDir = prevVal && prevVal.dir,
            newKey = newVal && newVal.key,
            newDir = newVal && newVal.dir,
            cs = dt.get("columnset"),
            prevColumn = cs.keyHash[prevKey],
            newColumn = cs.keyHash[newKey],
            tbodyNode = dt._tbodyNode,
            prevRowList, newRowList;

            //Y.log('prev:' + prevDir + ' new:' + newDir, 'error', 'SORT');
        // Clear previous UI
        if(prevColumn) {
            //Y.log('previous column:');
            //Y.log(prevColumn);
            
            prevColumn.thNode.removeClass(YgetClassName(DATATABLE, prevDir));
            
            //Y.log("."+YgetClassName(COLUMN, prevColumn.get("id")));
            
            //prevRowList = tbodyNode.all("."+YgetClassName(COLUMN, prevColumn.get("id")));
            prevRowList = tbodyNode.all('td[headers="' + prevColumn.get('id') + '"]');
            
            prevRowList.removeClass(YgetClassName(DATATABLE, prevDir));
        }

        // Add new sort UI
        if(newColumn) {
            //Y.log(newColumn);
            
            newColumn.thNode.addClass(YgetClassName(DATATABLE, newDir));
            
            //Y.log("."+YgetClassName(COLUMN, newColumn.get("id")));
            newRowList = tbodyNode.all('td[headers="' + newColumn.get('id') + '"]');
            //newRowList = tbodyNode.all("."+YgetClassName(COLUMN, newColumn.get("id")));
            
            //Y.log(newRowList);
            newRowList.addClass(YgetClassName(DATATABLE, newDir));
        }
    }
});

Y.namespace('DP').DataTableSort = DPDataTableSort;
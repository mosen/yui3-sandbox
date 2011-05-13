YUI.add('gallery-dp-datatable', function(Y) {

/**
 * 
 *
 * @namespace DP
 * @module DataTable
 * @requires datatable
 */

var YLang = Y.Lang,
    YisValue = YLang.isValue,
    Ysubstitute = Y.Lang.substitute,
    YNode = Y.Node,
    Ycreate = YNode.create,
    YgetClassName = Y.ClassNameManager.getClassName,

    DATATABLE = "datatable",
    COLUMN = "column",
    
    FOCUS = "focus",
    KEYDOWN = "keydown",
    MOUSEENTER = "mouseenter",
    MOUSELEAVE = "mouseleave",
    MOUSEUP = "mouseup",
    MOUSEDOWN = "mousedown",
    CLICK = "click",
    DBLCLICK = "dblclick",

    CLASS_COLUMNS = YgetClassName(DATATABLE, "columns"),
    CLASS_DATA = YgetClassName(DATATABLE, "data"),
    CLASS_MSG = YgetClassName(DATATABLE, "msg"),
    CLASS_LINER = YgetClassName(DATATABLE, "liner"),
    
    // Added by mosen
    CLASS_LINER_LEFTALIGN = YgetClassName(DATATABLE, "liner", "leftalign"),
    CLASS_LINER_CENTERALIGN = YgetClassName(DATATABLE, "liner", "centeralign"),
    CLASS_LINER_RIGHTALIGN = YgetClassName(DATATABLE, "liner", "rightalign"),
    
    CLASS_FIRST = YgetClassName(DATATABLE, "first"),
    CLASS_LAST = YgetClassName(DATATABLE, "last"),
    CLASS_EVEN = YgetClassName(DATATABLE, "even"),
    CLASS_ODD = YgetClassName(DATATABLE, "odd"),

    TEMPLATE_TABLE = '<table></table>',
    TEMPLATE_COL = '<col></col>',
    TEMPLATE_THEAD = '<thead class="'+CLASS_COLUMNS+'"></thead>',
    TEMPLATE_TBODY = '<tbody class="'+CLASS_DATA+'"></tbody>',
    TEMPLATE_TH = '<th id="{id}" rowspan="{rowspan}" colspan="{colspan}" class="{classnames}" abbr="{abbr}"><div class="'+CLASS_LINER+'">{value}</div></th>',
    TEMPLATE_TR = '<tr id="{id}"></tr>',
    TEMPLATE_TD = '<td headers="{headers}" class="{classnames}"><div class="'+CLASS_LINER+'">{value}</div></td>',
    TEMPLATE_VALUE = '{value}',
    TEMPLATE_MSG = '<tbody class="'+CLASS_MSG+'"></tbody>';

/**
 * DP.DataTable extends Y.DataTable.Base to fix many of the bugs reported on DT, in the interim.
 *
 * @class DataTable
 * @extends DataTable.Base
 */
Y.namespace('DP').DataTable = Y.Base.create( 'dp-datatable', Y.DataTable.Base, [], {

    /**
    * Creates data cell element. 
    * Supports td reference to correct node YUI 
    * Ticket #2529920 http://yuilibrary.com/projects/yui3/ticket/2529920 td reference
    * Ticket #2529921 http://yuilibrary.com/projects/yui3/ticket/2529921 {value} shown when data is "undefined" type
    *
    * @method _createTbodyTdNode
    * @param o {Object} {record, column, tr}.
    * @protected
    * @returns Y.Node
    */
    _createTbodyTdNode: function(o) {
        var column = o.column,
            formatvalue = null;
        //TODO: attributes? or methods?
        o.headers = column.headers;
        o.classnames = column.get("classnames");
        o.align = column.get("align");
        if (!o.align) {
            o.align = 'left';
        }
        o.td = Y.Node.create(Y.substitute(this.tdTemplate, o));
        o.liner = o.td.one('div');
        
        formatvalue = this.formatDataCell(o);
        
        if (Y.Lang.isString(formatvalue)) {
            o.value = formatvalue;
            o.liner.append(o.value);
        }
        
        return o.td;
    },
    
   /**
    * Creates header row element.
    *
    * @method _createTheadTrNode
    * @param o {Object} {thead, columns}.
    * @param isFirst {Boolean} Is first row.
    * @param isLast {Boolean} Is last row.
    * @protected
    * @returns Y.Node
    */
    _createTheadTrNode: function(o, isFirst, isLast) {
        //TODO: custom classnames
        o.id = Y.guid();
        
        var tr = Ycreate(Ysubstitute(this.get("trTemplate"), o)),
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
    },
    
   /**
    * @property tdTemplate
    * @description Tokenized markup template for TD node creation. removed {value} so that we can append to TD when there is no return value from the formatter
    * @type String
    * @default '<td headers="{headers}"><div class="'+CLASS_LINER+'">{value}</div></td>'
    */
    tdTemplate: '<td headers="{headers}"><div class="'+CLASS_LINER+'" style="text-align:{align};"></div></td>'

}, {

});
/**
 *
 *
 * @module DP.DataTableDataSource
 * @requires Y.Plugin.DataTableDataSource
 */

/**
 * Extension to DataTableDataSource plugin which clones the recordset to preserve combinations of plugins
 * such as DataSource/DataSort and Scroll
 * 
 * bugs addressed:
 * DataSource / DataSort : Ticket #2529975 http://yuilibrary.com/projects/yui3/ticket/2529975
 * 
 *
 * @class DataTableDataSource
 * @extends Y.Plugin.DataTableDataSource
 */
function DPDataTableDataSource() {
    DPDataTableDataSource.superclass.constructor.apply(this, arguments);
}

/////////////////////////////////////////////////////////////////////////////
//
// STATIC PROPERTIES
//
/////////////////////////////////////////////////////////////////////////////
Y.mix(DPDataTableDataSource, {
    /**
     * The namespace for the plugin. This will be the property on the host which
     * references the plugin instance.
     *
     * @property NS
     * @type String
     * @static
     * @final
     * @value "datasource"
     */
    NS: "datasource",

    /**
     * Class name.
     *
     * @property NAME
     * @type String
     * @static
     * @final
     * @value "dataTableDataSource"
     */
    NAME: "dataTableDataSource",

/////////////////////////////////////////////////////////////////////////////
//
// ATTRIBUTES
//
/////////////////////////////////////////////////////////////////////////////
    ATTRS: {
        /**
        * @attribute datasource
        * @description Pointer to DataSource instance.
        * @type Y.DataSource
        */
        datasource: {
            setter: "_setDataSource"
        },
        
        /**
        * @attribute initialRequest
        * @description Request sent to DataSource immediately upon initialization.
        * @type Object
        */
        initialRequest: {
            setter: "_setInitialRequest"
        }
    }
});


Y.extend( DPDataTableDataSource, Y.Plugin.DataTableDataSource, {
    
    /**
     * Callback function passed to DataSource's sendRequest() method populates
     * an entire DataTable with new data, clearing previous data, if any.
     *
     * @method onDataReturnInitializeTable
     * @param e {Event.Facade} DataSource Event Facade object.
     */
    onDataReturnInitializeTable : function(e) {
        var prevrecords = this.get('host').get('recordset'),
            newrecords = Y.Object(prevrecords); // Clone retains original plugin functionality.
            
        newrecords.set('records', e.response.results);
        this.get("host").set("recordset", newrecords);
    }
});

Y.namespace('DP').DataTableDataSource = DPDataTableDataSource;
/**
 * Extension to DataTableScroll plugin to fix issues specific to combining with a datasource.
 *
 * Addresses Ticket #2529808 http://yuilibrary.com/projects/yui3/ticket/2529808
 *
 * @module DP.DataTableScroll
 * @requires Y.Plugin.DataTableDataSource
 */

// Need to re-add shortcuts to get them into this scope.

var YNode = Y.Node,
    YLang = Y.Lang,
    YUA = Y.UA,
    YgetClassName = Y.ClassNameManager.getClassName,
    DATATABLE = "datatable",
    CLASS_HEADER = YgetClassName(DATATABLE, "hd"),
    CLASS_BODY = YgetClassName(DATATABLE, "bd"),
    CLASS_DATA = YgetClassName(DATATABLE, "data"),
    CLASS_SCROLLABLE = YgetClassName(DATATABLE, "scrollable"),
    CONTAINER_HEADER = '<div class="'+CLASS_HEADER+'"></div>',
    CONTAINER_BODY = '<div class="'+CLASS_BODY+'"></div>',
    TEMPLATE_TABLE = '<table></table>';

/**
 * Extension to DataTableScroll
 * 
 * @class DataTableDataSource
 * @extends Y.Plugin.DataTableDataSource
 */
function DPDataTableScroll() {
    DPDataTableScroll.superclass.constructor.apply(this, arguments);
}

/////////////////////////////////////////////////////////////////////////////
//
// STATIC PROPERTIES
//
/////////////////////////////////////////////////////////////////////////////
Y.mix(DPDataTableScroll, {
    
    NS: "scroll",

    NAME: "dataTableScroll",

    ATTRS: {
    
        /**
        * @description The width for the table. Set to a string (ex: "200px", "20em") if you want the table to scroll in the x direction.
        *
        * @attribute width
        * @public
        * @type string
        */
        width: {
            value: undefined,
            writeOnce: "initOnly"
        },
        
        /**
        * @description The height for the table. Set to a string (ex: "200px", "20em") if you want the table to scroll in the y-direction.
        *
        * @attribute height
        * @public
        * @type string
        */
        height: {
            value: undefined,
            writeOnce: "initOnly"
        },
        
        
        /**
        * @description The scrolling direction for the table.
        *
        * @attribute scroll
        * @private
        * @type string
        */
        _scroll: {
            //value: 'y',
            valueFn: function() {
                var w = this.get('width'),
                h = this.get('height');
                
                if (w && h) {
                    return 'xy';
                }
                else if (w) {
                    return 'x';
                }
                else if (h) {
                    return 'y';
                }
                else {
                    return null;
                }
            }
        },
        
        
        /**
        * @description The hexadecimal colour value to set on the top-right of the table if a scrollbar exists. 
        *
        * @attribute COLOR_COLUMNFILLER
        * @public
        * @type string
        */
        COLOR_COLUMNFILLER: {
            value: '#f2f2f2',
            validator: YLang.isString,
            setter: function(param) {
                if (this._headerContainerNode) {
                    this._headerContainerNode.setStyle('backgroundColor', param);
                }
            }
        }
    }  
});


Y.extend( DPDataTableScroll, Y.Plugin.DataTableScroll, {
    /**
    * @description Post rendering method that is responsible for creating a column
    * filler, and performing width and scroll synchronization between the &lt;th&gt; 
    * elements and the &lt;td&gt; elements.
    * This method fires after syncUI is called on datatable-base
    * 
    * @method syncUI
    * @public
    */
    syncUI: function() {
        //Y.Profiler.start('sync');
        this._removeCaptionNode();
        //this._syncWidths();
        this._syncScroll();
        //Y.Profiler.stop('sync');
        //console.log(Y.Profiler.getReport("sync"));
        this.afterHostEvent('recordsetChange', this._syncWidths);
    },
    
   /**
    * @description Adjusts the width of the TH and the TDs to make sure that the two are in sync
    * 
    * Implementation Details: 
    *   Compares the width of the TH liner div to the the width of the TD node. The TD liner width
    *   is not actually used because the TD often stretches past the liner if the parent DIV is very
    *   large. Measuring the TD width is more accurate.
    *   
    *   Instead of measuring via .get('width'), 'clientWidth' is used, as it returns a number, whereas
    *   'width' returns a string, In IE6, 'clientWidth' is not supported, so 'offsetWidth' is used.
    *   'offsetWidth' is not as accurate on Chrome,FF as 'clientWidth' - thus the need for the fork.
    * 
    * @method _syncWidths
    * @private
    */
    _syncWidths: function() {
        var th = YNode.all('#'+this._parentContainer.get('id')+ ' .' + CLASS_HEADER + ' table thead th'), //nodelist of all THs
            td = YNode.one('#'+this._parentContainer.get('id')+ ' .' + CLASS_BODY + ' table .' + CLASS_DATA).get('firstChild').get('children'), //nodelist of all TDs in 1st row
            i,
            len,
            thWidth, tdWidth, thLiner, tdLiner,
            ie = YUA.ie;
            //stylesheet = new YStyleSheet('columnsSheet'),
            //className;
            
            /*
            This for loop goes through the first row of TDs in the table.
            In a table, the width of the row is equal to the width of the longest cell in that column.
            Therefore, we can observe the widths of the cells in the first row only, as they will be the same in all the cells below (in each respective column)
            */
            for (i=0, len = th.size(); i<len; i++) { 
                
                //className = '.'+td.item(i).get('classList')._nodes[0];
                //If a width has not been already set on the TD:
                //if (td.item(i).get('firstChild').getStyle('width') === "auto") {
                    
                    //Get the liners for the TH and the TD cell in question
                    thLiner = th.item(i).get('firstChild'); //TODO: use liner API - how? this is a node.
                    tdLiner = td.item(i).get('firstChild');
                    
                    /*
                    If browser is not IE - get the clientWidth of the Liner div and the TD.
                    Note:   We are not getting the width of the TDLiner, we are getting the width of the actual cell.
                            Why? Because when the table is set to auto width, the cell will grow to try to fit the table in its container.
                            The liner could potentially be much smaller than the cell width.
                            
                            TODO: Explore if there is a better way using only LINERS widths
                    */
                    if (!ie) {
                        thWidth = thLiner.get('clientWidth'); //TODO: this should actually be done with getComputedStyle('width') but this messes up columns. Explore this option.
                        tdWidth = td.item(i).get('clientWidth');
                    }
                    
                    //IE wasn't recognizing clientWidths, so we are using offsetWidths.
                    //TODO: should use getComputedStyle('width') because offsetWidth will screw up when padding is changed.
                    else {
                        thWidth = thLiner.get('offsetWidth');
                        tdWidth = td.item(i).get('offsetWidth');
                        //thWidth = parseFloat(thLiner.getComputedStyle('width').split('px')[0]);
                        //tdWidth = parseFloat(td.item(i).getComputedStyle('width').split('px')[0]); /* TODO: for some reason, using tdLiner.get('clientWidth') doesn't work - why not? */
                    }
                                        
                    //if TH is bigger than TD, enlarge TD Liner
                    if (thWidth > tdWidth) {
                        tdLiner.setStyle('width', (thWidth - 20 + 'px'));
                        //thLiner.setStyle('width', (tdWidth - 20 + 'px'));
                        //stylesheet.set(className,{'width': (thWidth - 20 + 'px')});
                    }
                    
                    //if TD is bigger than TH, enlarge TH Liner
                    else if (tdWidth > thWidth) {
                        thLiner.setStyle('width', (tdWidth - 20 + 'px'));
                        tdLiner.setStyle('width', (tdWidth - 20 + 'px')); //if you don't set an explicit width here, when the width is set in line 368, it will auto-shrink the widths of the other cells (because they dont have an explicit width)
                        //stylesheet.set(className,{'width': (tdWidth - 20 + 'px')});
                    }
                    
                //}

            }
            
            //stylesheet.enable();

    }
});

Y.namespace('DP').DataTableScroll = DPDataTableScroll;
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
    */
    _beforeCreateTheadThNode: function(o) {
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

        // Clear previous UI
        if(prevColumn) {
            
            prevColumn.thNode.removeClass(YgetClassName(DATATABLE, prevDir));
            
            
            //prevRowList = tbodyNode.all("."+YgetClassName(COLUMN, prevColumn.get("id")));
            prevRowList = tbodyNode.all('td[headers="' + prevColumn.get('id') + '"]');
            
            prevRowList.removeClass(YgetClassName(DATATABLE, prevDir));
        }

        // Add new sort UI
        if(newColumn) {
            
            newColumn.thNode.addClass(YgetClassName(DATATABLE, newDir));
            
            newRowList = tbodyNode.all('td[headers="' + newColumn.get('id') + '"]');
            //newRowList = tbodyNode.all("."+YgetClassName(COLUMN, newColumn.get("id")));
            
            newRowList.addClass(YgetClassName(DATATABLE, newDir));
        }
    }
});

Y.namespace('DP').DataTableSort = DPDataTableSort;
Y.mix(Y.Column, {
   ATTRS : {
       align : {
           value : 'left'
       },
       
       /**
        * Function used for sorting column values, applied to recordset.
        */
       sortFn : {
           value : null
       }
   } 
}, false, null, 0, true); // Mix with merge


}, '@VERSION@' ,{requires:['datatable', 'datatable-datasource']});

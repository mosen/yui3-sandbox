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
                        Y.log("thWidth:" + thWidth + " > tdWidth:" + tdWidth, "info", "DPDataTableScroll");
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
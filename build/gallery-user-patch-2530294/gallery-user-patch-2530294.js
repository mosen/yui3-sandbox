YUI.add('gallery-user-patch-2530294', function(Y) {

/**
 * This patch addresses YUI ticket #2530294
 * http://yuilibrary.com/projects/yui3/ticket/2530294
 * 
 * Combining DataTableSort and DataTableScroll can cause a column width mismatch
 * because sort adds padding to one part of the scroll table only. (the header table)
 * This is fixed by adding a CSS rule to match the data section with the header section padding rule
 * of 4 20 4 10px.
 * 
 * _syncWidths also needs to be patched because it does not take into account padding when computing
 * the difference between column widths.
 * 
 * Additionally, sorting records causes the DataTable to re-render the body section, causing specific
 * td adjustments to be lost (and automatic layout takes over), 
 * so we need to re-run _syncWidths after those items have been rendered.
 *
 * @module gallery-user-patch-2530294
 * @requires datatable, datatable-scroll
 */

var YNode = Y.Node,
    YgetClassName = Y.ClassNameManager.getClassName,
    DATATABLE = "datatable",
    CLASS_HEADER = YgetClassName(DATATABLE, "hd"),
    CLASS_BODY = YgetClassName(DATATABLE, "bd"),
    CLASS_DATA = YgetClassName(DATATABLE, "data");

// TODO create syncwidths which resolves the issue with extra padding being added after Scroll is plugged in
Y.Plugin.DataTableScroll.prototype.orig_syncWidths = function() {
    var th = YNode.all('#'+this._parentContainer.get('id')+ ' .' + CLASS_HEADER + ' table thead th'), //nodelist of all THs
        tbodyData = YNode.one('#'+this._parentContainer.get('id')+ ' .' + CLASS_BODY + ' table .' + CLASS_DATA),
        td = tbodyData.get('firstChild').get('children'), //nodelist of all TDs in 1st row
        i,
        len,
        thWidth, tdWidth, thLiner, tdLiner, thLinerPadding, tdLinerPadding, tdColumnMembers, newLinerWidth,
        px = function(v) {return parseFloat(v.split('px')[0]);}; // Easy string pixel count to float conversion
        
        
        // TODO this loop assumes that headers and content have a 1:1 relationship. DTv2 allowed column groups to span multiple child columns, check
        // this with groups - eamonb
        for (i=0, len = th.size(); i<len; i++) { 

            // Get the liners for the TH and the TD cell in question
            thLiner = th.item(i).get('firstChild');
            tdLiner = td.item(i).get('firstChild');
            
            thWidth = px(thLiner.getComputedStyle('width'));
            tdWidth = px(td.item(i).getComputedStyle('width'));

            thLinerPadding = px(thLiner.getComputedStyle('paddingLeft')) + px(thLiner.getComputedStyle('paddingRight'));
            tdLinerPadding = px(tdLiner.getComputedStyle('paddingLeft')) + px(tdLiner.getComputedStyle('paddingRight'));
            

            // if TH liner (with padding) is bigger than TD, enlarge TD Liner
            if ((thWidth + thLinerPadding) > tdWidth) {
                newLinerWidth = (thWidth + 'px');
                tdLiner.setStyle('width', newLinerWidth);
            }

            // if TD cell is bigger than TH liner (without padding), enlarge TH Liner
            // Padding not compared here because if td was larger than th liner with padding it
            // would set width on th liner that would compromise the padding, causing sort arrows
            // to show up inside the sort label
            else if (tdWidth > thWidth) {
                newLinerWidth = (tdWidth - tdLinerPadding + 'px');

                thLiner.setStyle('width', newLinerWidth);
                
                if (Y.UA.ie) {
                    // IE8 expects explicit widths on every liner.
                    // TODO: explore possibility of setting width on COL elements instead. IE8 respects these too.
                    tdColumnMembers = tbodyData.all('.yui3-column-' + th.item(i).get('id'));
                    tdColumnMembers.get('firstChild').setStyle('width', (tdWidth - tdLinerPadding + 'px'));
                } else {
                    // Only first liner matters
                    tdLiner.setStyle('width', (tdWidth - tdLinerPadding + 'px'));
                }
            }
        }
};

// Override init again to sync TD's after sort happens
Y.Plugin.DataTableScroll.prototype.initializer_for_gup2530294 = Y.Plugin.DataTableScroll.prototype.initializer;
Y.Plugin.DataTableScroll.prototype.initializer = function(config) {
    this.initializer_for_gup2530294();

    this.get('host').after('recordsetSort:sort', Y.bind(this._syncWidths, this));
};


}, '@VERSION@' ,{requires:['datatable', 'datatable-scroll'], skinnable:true});

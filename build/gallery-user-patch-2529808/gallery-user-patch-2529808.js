YUI.add('gallery-user-patch-2529808', function(Y) {

// patch for YUI 3.3.0 DataTable bug
// forum post: http://yuilibrary.com/forum/viewtopic.php?f=92&t=6355
// bug ticket: http://yuilibrary.com/projects/yui3/ticket/2529808
// also see: https://github.com/mosen/yui3-gallery/tree/master/sandbox/mosen/src/gallery-dp-datatable
//
var YNode = Y.Node,
    YLang = Y.Lang,
    YgetClassName = Y.ClassNameManager.getClassName,
    DATATABLE = "datatable",
    CLASS_HEADER = YgetClassName(DATATABLE, "hd"),
    CLASS_BODY = YgetClassName(DATATABLE, "bd"),
    CLASS_DATA = YgetClassName(DATATABLE, "data"),
    CLASS_SCROLLABLE = YgetClassName(DATATABLE, "scrollable"),
    CONTAINER_HEADER = '<div class="'+CLASS_HEADER+'"></div>',
    CONTAINER_BODY = '<div class="'+CLASS_BODY+'"></div>',
    TEMPLATE_TABLE = '<table></table>';


Y.Plugin.DataTableScroll.prototype.injected_initializer = Y.Plugin.DataTableScroll.prototype.initializer;

Y.Plugin.DataTableScroll.prototype.initializer = function(config) {
    this.get('host').after('recordsetChange', Y.bind(this.syncUI, this));
    this.injected_initializer(config);
};

// Original patch for issue #2529808, before we discovered the column size mismatch when sort is plugged in

//Y.Plugin.DataTableScroll.prototype.injected_syncWidths = Y.Plugin.DataTableScroll.prototype._syncWidths;
Y.Plugin.DataTableScroll.prototype._syncWidths = function() {
    
    var dt = this.get('host'),
        rs = dt.get('recordset'),
        rsLength = rs.getLength();

    if (rsLength === 0) {
        return false;
    } else {
        this.injected_syncWidths();
    }
};
// TODO create syncwidths which resolves the issue with extra padding being added after Scroll is plugged in
Y.Plugin.DataTableScroll.prototype.injected_syncWidths = function() {
    var th = YNode.all('#'+this._parentContainer.get('id')+ ' .' + CLASS_HEADER + ' table thead th'), //nodelist of all THs
        td = YNode.one('#'+this._parentContainer.get('id')+ ' .' + CLASS_BODY + ' table .' + CLASS_DATA).get('firstChild').get('children'), //nodelist of all TDs in 1st row
        i,
        len,
        thWidth, tdWidth, thLiner, tdLiner, thLinerPadding, tdLinerPadding
        ie = Y.UA.ie;

        // TODO this loop assumes that headers and content have a 1:1 relationship. DTv2 allowed column groups to span multiple child columns, check
        // this with groups - eamonb
        for (i=0, len = th.size(); i<len; i++) { 

            //Get the liners for the TH and the TD cell in question
            thLiner = th.item(i).get('firstChild');
            tdLiner = td.item(i).get('firstChild');

            /*
            If browser is not IE - get the clientWidth of the Liner div and the TD.
            Note:   We are not getting the width of the TDLiner, we are getting the width of the actual cell.
                    Why? Because when the table is set to auto width, the cell will grow to try to fit the table in its container.
                    The liner could potentially be much smaller than the cell width.

                    TODO: Explore if there is a better way using only LINERS widths
            */
            var px = function(v) { return parseFloat(v.split('px')[0]); };

            thWidth = px(thLiner.getComputedStyle('width'));
            tdWidth = px(td.item(i).getComputedStyle('width'));

            thLinerPadding = px(thLiner.getComputedStyle('paddingLeft')) + px(thLiner.getComputedStyle('paddingRight'));
            tdLinerPadding = px(tdLiner.getComputedStyle('paddingLeft')) + px(tdLiner.getComputedStyle('paddingRight'));

            //if TH is bigger than TD, enlarge TD Liner
            if (thWidth > tdWidth) {
                tdLiner.setStyle('width', (thWidth - thLinerPadding + 'px'));
            }

            //if TD is bigger than TH, enlarge TH Liner
            else if (tdWidth > thWidth) {
                thLiner.setStyle('width', (tdWidth - tdLinerPadding + 'px'));
                tdLiner.setStyle('width', (tdWidth - tdLinerPadding + 'px')); //if you don't set an explicit width here, when the width is set in line 368, it will auto-shrink the widths of the other cells (because they dont have an explicit width)
            }
        }
    };


}, '@VERSION@' ,{skinnable:false, requires:['datatable']});

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

// TODO create syncwidths which resolves the issue with extra padding being added after Scroll is plugged in
Y.Plugin.DataTableScroll.prototype.injected_syncWidths = function() {
    var th = YNode.all('#'+this._parentContainer.get('id')+ ' .' + CLASS_HEADER + ' table thead th'), //nodelist of all THs
        tbodyData = YNode.one('#'+this._parentContainer.get('id')+ ' .' + CLASS_BODY + ' table .' + CLASS_DATA),
        td = tbodyData.get('firstChild').get('children'), //nodelist of all TDs in 1st row
        i,
        len,
        thWidth, tdWidth, thLiner, tdLiner, thLinerPadding, tdLinerPadding, tdColumnMembers;
        
        // Easy string pixel count to floating point conversion
        var px = function(v) { return parseFloat(v.split('px')[0]); };
        
        // TODO this loop assumes that headers and content have a 1:1 relationship. DTv2 allowed column groups to span multiple child columns, check
        // this with groups - eamonb
        for (i=0, len = th.size(); i<len; i++) { 

            //Get the liners for the TH and the TD cell in question
            thLiner = th.item(i).get('firstChild');
            tdLiner = td.item(i).get('firstChild');
            
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
YUI.add('gallery-user-patch-2529808', function(Y) {

/**
* Patch for YUI 3.3.0 DataTableScroll plugin bug #2529808
* Enables support for using DataTableScroll plugin when data is lazy loaded (e.g. when using a datasource).
* Ticket URL - http://yuilibrary.com/projects/yui3/ticket/2529808
*
* Thanks to eamonb a.k.a mosen for his peer review and help testing
* @requires datatable-scroll
*/


// added automatically by build system
//YUI.add('gallery-user-patch-2529808', function(Y) {

var DTScroll = Y.Plugin.DataTableScroll;

if (!DTScroll.prototype.orig_syncWidths) {

    // wrap initializer and _syncWidths with custom functions
    // can't use bindUI because it is never called for this plugin
    
    DTScroll.prototype.orig_initializer = DTScroll.prototype.initializer;
    DTScroll.prototype.initializer = function () {
        this.orig_initializer();
        // trigger UI refresh when data changes so _syncWidths will be called
        this.afterHostEvent('recordsetChange', this.syncUI);
    };

    DTScroll.prototype.orig_syncWidths = DTScroll.prototype._syncWidths;
    DTScroll.prototype._syncWidths = function () {
        var dt = this.get('host'),
            set = dt.get('recordset');

        // original _syncWidths assumes non-empty recordset and will throw error if empty
        if (set.getLength() === 0) {
            return;
        }

        this.orig_syncWidths();
    };
}

// added automatically by build system
//}, '1.0.0', {requires:['datatable-scroll']});


}, '@VERSION@' ,{skinnable:false, requires:['datatable']});
YUI.add('gallery-user-patch-2529920-2529921', function(Y) {

/**
 * This patch addresses YUI tickets #2529920, #2529921
 * 
 * #2529920 - Documentation refers to the cell formatter function having access to the TD element, but the TD reference is not passed.
 * http://yuilibrary.com/projects/yui3/ticket/2529920
 * 
 * #2529921 - {value} template is shown when the record data is null or undefined
 * http://yuilibrary.com/projects/yui3/ticket/2529921
 * 
 * The {value} token remains because Y.substitute does not delete invalid tokens, in case that they
 * are later used for recursive substitutions. One possible fix could be to have substitute delete tokens
 * if the recursive option is not set.
 *
 * @module gallery-user-patch-2529920-2529921
 * @requires datatable
 */

// Default: '<td headers="{headers}"><div class="'+CLASS_LINER+'">{value}</div></td>'
// Changed in this fix because the value is not supplied at the Ysubstitute stage, it is appended to the liner.
var YgetClassName = Y.ClassNameManager.getClassName,
    DATATABLE = "datatable",
    CLASS_LINER = YgetClassName(DATATABLE, "liner"),
    TD_TEMPLATE = '<td headers="{headers}" class="{classnames}"><div class="'+CLASS_LINER+'"></div></td>';

Y.DataTable.Base.prototype._createTbodyTdNode = function(o) {
    var column = o.column,
        formatvalue = null;
        
    //TODO: attributes? or methods?
    o.headers = column.headers;
    o.classnames = column.get("classnames");
    o.td = Y.Node.create(Y.substitute(TD_TEMPLATE, o));
    o.liner = o.td.one('div');

    formatvalue = this.formatDataCell(o);

    // Formatters should return a string value to be appended, lack of a string here indicates that the formatter has utilised 
    // the o.td reference to populate the cell.
    if (Y.Lang.isString(formatvalue)) {
        o.value = formatvalue;
        o.liner.append(formatvalue);
    }

    return o.td;
};

// Use a custom function in the substitution to omit null results
// Realistically, Y.sub should have an option to remove and not preserve tokens.
Y.DataTable.Base.prototype.formatDataCell = function(o) {
    var record = o.record,
        column = o.column,
        formatter = column.get("formatter"),
        fnSubstituteNulls = function(key, v, meta) {
            return Y.Lang.isNull(v) || Y.Lang.isUndefined(v) ? "" : v;
        };
    
    o.data = record.get("data");
    o.value = record.getValue(column.get("field"));
    return Y.Lang.isString(formatter) ?
        Y.substitute(formatter, o, fnSubstituteNulls) : // Custom template
        Y.Lang.isFunction(formatter) ?
            formatter.call(this, o) :  // Custom function
            Y.substitute(this.get("tdValueTemplate"), o, fnSubstituteNulls);  // Default template
};


}, '@VERSION@' ,{skinnable:false, requires:['datatable']});
YUI.add('gallery-user-patch-2529943', function(Y) {

/**
 * This patch addresses YUI ticket #2529943
 * http://yuilibrary.com/projects/yui3/ticket/2529943
 * 
 * The DataTableSort plugin creates a link for each column heading to allow the user to sort datatable rows.
 * The title attribute is hard coded to the value 'title', this patch allows the title to be configurable, and by default
 * uses the column key as the title.
 *
 * @module gallery-user-patch-2529943
 * @requires datatable, datatable-sort
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


}, '@VERSION@' ,{skinnable:false, requires:['datatable', 'datasource']});
YUI.add('gallery-user-patch-2529968', function(Y) {

/**
 * This patch addresses YUI ticket #2529968
 * http://yuilibrary.com/projects/yui3/ticket/2529968
 * 
 * Creating a table with no caption still creates the caption node.
 * The main problem is that the caption node is styled with 1em padding, which
 * causes unwanted whitespace.
 * 
 * In this fix we prevent the node from being created. Another option would be 
 * to remove the padding from the caption, and use a liner element with its own
 * padding to display the caption.
 *
 * @module gallery-user-patch-2529968
 * @requires datatable
 */

// tableNode parameter isn't used because we dont use the createCaption() function on the tableNode
Y.DataTable.Base.prototype._addCaptionNode = function(tableNode) {
    // Changed to Y.Node.create because the DataTableScroll plugin will reference the property, causing an error if it isn't a node instance.
    this._captionNode = Y.Node.create('<caption></caption>');
    
    // Node isn't appended to DOM until we syncUI with the caption attribute
    return this._captionNode;
};

// Caption can still be set or synced after the constructor, so we need to patch the uiSet method also.
Y.DataTable.Base.prototype._uiSetCaption = function(val) {
    
    if (!Y.Lang.isValue(val)) {
        
        this._captionNode.remove();
    } else {
        
        this._captionNode.setContent(val);
        
        this._tableNode.append(this._captionNode);
    }
};


}, '@VERSION@' ,{skinnable:false, requires:['datatable']});
YUI.add('gallery-user-patch-2529975', function(Y) {

/**
 * This patch addresses YUI ticket #2529975
 * http://yuilibrary.com/projects/yui3/ticket/2529975
 * 
 * The DataTableDataSource plugin creates a new RecordSet instance whenever a
 * response is returned from the server, causing all plugins to be lost (Including
 * the RecordSet.Sort plugin, which will cause sort to stop working after the second result).
 * 
 * This patch clones the RecordSet object to preserve the plugin configuration of
 * the original RecordSet instance.
 *
 * @module gallery-user-patch-2529975
 * @requires datatable, datatable-datasource
 */

Y.Plugin.DataTableDataSource.prototype.onDataReturnInitializeTable = function(e) {
        // Clone retains original plugin functionality. must be a separate instance
        // In order to trigger the host's recordsetChange event.
        // TODO: fire attr change without cloning recordset
        
        var prevRecordSet = this.get('host').get('recordset'),
            newRecordSet = Y.Object(prevRecordSet); 
            
        newRecordSet.set('records', e.response.results);
        this.get("host").set("recordset", newRecordSet);    
};


}, '@VERSION@' ,{skinnable:false, requires:['datatable', 'datasource']});
YUI.add('gallery-user-patch-2530026', function(Y) {

/**
 * This patch addresses YUI ticket #2530026
 * http://yuilibrary.com/projects/yui3/ticket/2530026
 * 
 * The tr node inside the thead section of datatable has a bogus id. The id attribute is
 * not supplied to the template upon creation, and so the TR receives an id of
 * "{id}".
 *
 * @module gallery-user-patch-2530026
 * @requires datatable
 */
var YgetClassName = Y.ClassNameManager.getClassName,
    
    DATATABLE = "datatable",
    
    CLASS_FIRST = YgetClassName(DATATABLE, "first"),
    CLASS_LAST = YgetClassName(DATATABLE, "last");

Y.DataTable.Base.prototype._createTheadTrNode = function(o, isFirst, isLast) {

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


}, '@VERSION@' ,{skinnable:false, requires:['datatable']});
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


YUI.add('gallery-user-patch-datatable-rollup', function(Y){}, '@VERSION@' ,{use:['gallery-user-patch-2529808','gallery-user-patch-2529920-2529921','gallery-user-patch-2529943','gallery-user-patch-2529968','gallery-user-patch-2529975','gallery-user-patch-2530026','gallery-user-patch-2530294'], skinnable:true});


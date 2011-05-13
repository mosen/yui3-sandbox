YUI.add('gallery-user-patch-datatable-rollup', function(Y) {

// patch for YUI 3.3.0 DataTable bug
// forum post: http://yuilibrary.com/forum/viewtopic.php?f=92&t=6355
// bug ticket: http://yuilibrary.com/projects/yui3/ticket/2529808
// also see: https://github.com/mosen/yui3-gallery/tree/master/sandbox/mosen/src/gallery-dp-datatable
//

Y.Plugin.DataTableScroll.prototype.injected_initializer = Y.Plugin.DataTableScroll.prototype.initializer;

Y.Plugin.DataTableScroll.prototype.initializer = function(config) {
    this.get('host').after('recordsetChange', Y.bind(this.syncUI, this));
    this.injected_initializer(config);
};

Y.Plugin.DataTableScroll.prototype.injected_syncWidths = Y.Plugin.DataTableScroll.prototype._syncWidths;
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
/**
 * This patch addresses YUI tickets #2529920, #2529921
 * 
 * #2529920 - Documentation refers to the cell formatter function having access to the TD element, but the TD reference is not passed.
 * #2529921 - {value} template is shown when the record data is null or undefined
 * TODO #2529894 setting value using innerHTML could potentially expose a XSS exploit.
 * 
 * The {value} token remains because Y.substitute does not delete invalid tokens, in case that they
 * are later used for recursive substitutions. One possible fix could be to have substitute delete tokens
 * if the recursive option is not set.
 *
 * @module gallery-user-patch-2529920-2529921
 * @requires DataTable.Base
 */

// Default: '<td headers="{headers}"><div class="'+CLASS_LINER+'">{value}</div></td>'
// Changed in this fix because the value is not supplied at the Ysubstitute stage, it is appended to the liner.
var YgetClassName = Y.ClassNameManager.getClassName,
    DATATABLE = "datatable",
    CLASS_LINER = YgetClassName(DATATABLE, "liner"),
    TD_TEMPLATE = '<td headers="{headers}"><div class="'+CLASS_LINER+'" style="text-align:{align};"></div></td>';

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
/**
 * This patch addresses YUI ticket #2529968
 * 
 * Creating a table with no caption still creates the caption node.
 * The main problem is that the caption node is styled with 1em padding.
 * 
 * In this fix we prevent the node from being created. The CSS should be altered
 * to remove the padding and apply it to an inner element only.
 *
 * @module gallery-user-patch-2529968
 * @requires DataTable.Base
 */

Y.DataTable.Base.prototype._addCaptionNode = function(tableNode) {
    var caption = this.get('caption');
    
    if (caption) {
        //this._captionNode = tableNode.createCaption();
        // Changed to Y.Node.create because the DataTableScroll plugin will reference the property, causing an error if it isn't a node.
        this._captionNode = Y.Node.create('<caption></caption>');
        return this._captionNode;
    } else {
        this._captionNode = Y.Node.create('<caption></caption>');
        return this._captionNode;
    }
};

// Caption can still be set or synced after the constructor, so we need to patch the uiSet method also.
Y.DataTable.Base.prototype._uiSetCaption = function(val) {
    val = Y.Lang.isValue(val) ? val : "";
    if (val == "") {
        if (Y.Lang.isValue(this._captionNode)) {
            this._captionNode.remove();
        }
    } else {
        if (!Y.Lang.isValue(this._captionNode)) {
            this._captionNode = this._tableNode.createCaption();
        }
        
        this._captionNode.setContent(val);
    }
};
/**
 * This patch addresses YUI ticket #2529975
 * 
 * The DataTableDataSource plugin creates a new RecordSet instance whenever a
 * response is returned from the server, causing all plugins to be lost (Including
 * the RecordSet.Sort plugin).
 * 
 * This patch clones the RecordSet object to preserve the plugin configuration of
 * the original RecordSet instance.
 *
 * @module gallery-user-patch-2529975
 * @requires DataTable.Base, Y.Plugin.DataTableDataSource
 */

Y.Plugin.DataTableDataSource.prototype.onDataReturnInitializeTable = function(e) {
        // Clone retains original plugin functionality. must be a separate instance
        // In order to trigger the host's recordsetChange event.
        var prevRecordSet = this.get('host').get('recordset'),
            newRecordSet = Y.Object(prevRecordSet); 
            
        newRecordSet.set('records', e.response.results);
        this.get("host").set("recordset", newRecordSet);    
};
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


}, '@VERSION@' );

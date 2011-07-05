/**
 * This patch addresses YUI ticket #2529808
 * 
 * forum post: http://yuilibrary.com/forum/viewtopic.php?f=92&t=6355
 * bug ticket: http://yuilibrary.com/projects/yui3/ticket/2529808
 *
 * @module gallery-user-patch-2529808
 * @requires datatable, datatable-scroll
 */

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
        Y.log('Calling unpatched _syncWidths', 'info', 'gallery-user-patch-2529808');
        this.injected_syncWidths();
    }
};

YUI.add('gallery-user-patch-2529968', function(Y) {

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


}, '@VERSION@' ,{skinnable:false, requires:['datatable']});

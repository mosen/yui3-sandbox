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
    var caption = this.get('caption');
    
    if (caption) {
        // Changed to Y.Node.create because the DataTableScroll plugin will reference the property, causing an error if it isn't a node instance.
        this._captionNode = Y.Node.create('<caption></caption>');
        tableNode.append(this._captionNode);
        return this._captionNode;
    } else {
        // The property still needs to exist regardless
        //this._captionNode = Y.Node.create('<caption></caption>');
        this._captionNode = Y.Node.create('<caption></caption>');
        return this._captionNode;
    }
};

// Caption can still be set or synced after the constructor, so we need to patch the uiSet method also.
Y.DataTable.Base.prototype._uiSetCaption = function(val) {
    val = Y.Lang.isValue(val) ? val : "";
    
    if (val.length == 0) {
        Y.log("Removing caption", "info", "gallery-user-patch-2529968");
        
        if (Y.Lang.isValue(this._captionNode)) {
            this._captionNode.remove();
        }
    } else {
        if (!Y.Lang.isValue(this._captionNode)) {
            this._captionNode = Y.Node.create('<caption></caption>');
            this._tableNode.append(this._captionNode);
        }
        
        Y.log("Setting caption title", "info", "gallery-user-patch-2529968");
        this._captionNode.setContent(val);
    }
};
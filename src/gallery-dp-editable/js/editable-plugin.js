/**
 *
 *
 * @module gallery-dp-editable
 * @author eamonb
 * @requires plugin
 */

/**
 * Editable creates an in-place editor for html element text content.
 * It is loosely based on jEditable for jquery.
 * 
 * This is the node plugin version of editable
 *
 * @class EditablePlugin
 * @namespace Y.DP
 * @extends Plugin.Base
 */
EditablePlugin = Y.Base.create('editablePlugin', Y.Plugin.Base, [Y.DP.EditableBase], {
    
    initializer : function(config) {
        Y.log("init", "info", this.NAME);

        this.set('targetnode', config.host);
        
        if (!config.delegate) {
            this.set('editingnode', config.host);
        }
        
        this._bindEditableBase();
        this._syncEditableBase();
    }
}, {
    /**
     * The plugin namespace identifies the property on the host
     * which will be used to refer to this plugin instance.
     *
     * @property NS
     * @type String
     * @static
     */
    NS : "editable",

    /**
     * The plugin name identifies the event prefix and is a basis for generating
     * class names.
     * 
     * @property NAME
     * @type String
     * @static
     */
    NAME : "editable"      
});

Y.namespace("DP").EditablePlugin = EditablePlugin;
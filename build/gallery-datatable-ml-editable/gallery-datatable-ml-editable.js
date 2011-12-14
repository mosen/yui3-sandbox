YUI.add('gallery-datatable-ml-editable', function(Y) {
/**
 *
 *
 * @module DatatableMlEditable
 * @author admin
 * @requires plugin
 */

/* Frequently used shortcuts, strings and constants */
var Lang = Y.Lang;

/**
 * DatatableMlEditable
 *
 * @class DatatableMlEditable
 * @extends Plugin.Base
 */
function DatatableMlEditable(config) {
    DatatableMlEditable.superclass.constructor.apply(this, arguments);
}

Y.mix(DatatableMlEditable, {

    /**
     * The plugin namespace identifies the property on the host
     * which will be used to refer to this plugin instance.
     *
     * @property NS
     * @type String
     * @static
     */
    NS : "edit",

    /**
     * The plugin name identifies the event prefix and is a basis for generating
     * class names.
     * 
     * @property NAME
     * @type String
     * @static
     */
    NAME : "DatatableMlEditable",

    /**
     * The attribute configuration represents the core user facing state of 
     * the plugin.
     *
     * @property ATTRS
     * @type Object
     * @protected
     * @static
     */
    ATTRS : {
        
        /*
         * Attribute properties:
         *  
         * , valueFn: "_defAttrAVal"      // Can be used as a substitute for "value", when you need access to "this" to set the default value.
         *   
         * , setter: "_setAttrA"          // Used to normalize attrA's value while during set. Refers to a prototype method, to make customization easier
         * , getter: "_getAttrA"          // Used to normalize attrA's value while during get. Refers to a prototype method, to make customization easier
         * , validator: "_validateAttrA"  // Used to validate attrA's value before updating it. Refers to a prototype method, to make customization easier
         * , readOnly: true               // Cannot be set by the end user. Can be set by the component developer at any time, using _set
         * , writeOnce: true              // Can only be set once by the end user (usually during construction). Can be set by the component developer at any time, using _set
         * 
         * , lazyAdd: false               // Add (configure) the attribute during initialization. 
         * 
         *                                // You only need to set lazyAdd to false if your attribute is
         *                                // setting some other state in your setter which needs to be set during initialization 
         *                                // (not generally recommended - the setter should be used for normalization. 
         *                                // You should use listeners to update alternate state). 
         * , broadcast: 1                 // Whether the attribute change event should be broadcast or not.
         */
    }    
});

Y.extend(DatatableMlEditable, Y.Plugin.Base, {

    /**
     * Initializer runs when the plugin is constructed or plugged into the host instance.
     *
     * @method initializer
     * @param config {Object} Configuration object
     */
    initializer : function (config) {

        
        this.afterHostMethod("render", this._afterHostRender);
        // See Y.Do.before, Y.Do.after
        //this.beforeHostMethod("show", this._beforeHostShowMethod);
        //this.afterHostMethod("show", this._afterHostShowMethod);

        // See Y.EventTarget.on, Y.EventTarget.after
        //this.onHostEvent("render", this._onHostRenderEvent);             
        //this.afterHostEvent("render", this._afterHostRenderEvent);
    },
    
    /**
     * Plug the editor
     *
     * @method _afterHostRender
     * @param
     * @returns
     * @public
     */
    _afterHostRender : function() {
        
        this.get('host').get('contentBox').plug(Y.DP.EditablePlugin, {
            delegate: '.yui3-datatable-liner',
            type: 'textarea',
            submitto: Y.bind(this._onEditorSave)
        });
    },
    
    /**
     * When editable calls back
     *
     * @method _onEditorSave
     * @param node {Node} Containing the editor
     * @param callback {Function} To indicate that save has completed.
     * @returns
     * @protected
     */
    _onEditorSave : function(node, callback) {
        
        var v = node.one('textarea').get('value');
        
        callback();
    },

    /**
     * Destructor runs when the plugin is unplugged
     * Base will automatically detach afterHostEvent/afterHostMethod methods.
     *
     * @method destructor
     */
    destructor: function() { 
    
    }    
});

Y.namespace("Plugin").DatatableMlEditable = DatatableMlEditable;
}, '1.0.0' , {requires: ['gallery-datatable-ml', 'gallery-dp-editable']});
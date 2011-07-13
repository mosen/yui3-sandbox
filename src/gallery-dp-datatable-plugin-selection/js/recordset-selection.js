/**
 *
 *
 * @module RecordsetSelection
 * @author admin
 * @requires plugin, recordset
 */

/* Frequently used shortcuts, strings and constants */
var Lang = Y.Lang;

/**
 * RecordsetSelection
 * 
 * Provides a selection interface for recordset which maintains an internal
 * hash of selected items.
 * 
 * We could use recordset-index but i felt this was specialised enough to justify
 * a separately maintained hash
 *
 * @class RecordsetSelection
 * @extends Plugin.Base
 */
function RecordsetSelection(config) {
    RecordsetSelection.superclass.constructor.apply(this, arguments);
}

Y.mix(RecordsetSelection, {

    /**
     * The plugin namespace identifies the property on the host
     * which will be used to refer to this plugin instance.
     *
     * @property NS
     * @type String
     * @static
     */
    NS : "selection",

    /**
     * The plugin name identifies the event prefix and is a basis for generating
     * class names.
     * 
     * @property NAME
     * @type String
     * @static
     */
    NAME : "selection",

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
        
        selection : {
            getter: "_getAttrSelection",
            setter: "_setAttrSelection"
        }
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

Y.extend(RecordsetSelection, Y.Plugin.Base, {

    /**
     * Initializer runs when the plugin is constructed or plugged into the host instance.
     *
     * @method initializer
     * @param config {Object} Configuration object
     */
    initializer : function (config) {

        // See Y.Do.before, Y.Do.after
        //this.beforeHostMethod("show", this._beforeHostShowMethod);
        //this.afterHostMethod("show", this._afterHostShowMethod);

        // See Y.EventTarget.on, Y.EventTarget.after
        //this.onHostEvent("render", this._onHostRenderEvent);             
        //this.afterHostEvent("render", this._afterHostRenderEvent);
    },

    /**
     * Destructor runs when the plugin is unplugged
     * Base will automatically detach afterHostEvent/afterHostMethod methods.
     *
     * @method destructor
     */
    destructor: function() { 
    
    },
    
    /**
     * Select the specified record(s)
     *
     * @method select
     * @param selector {Array(containing any of the following)|Y.Record|Record ID|HTMLTRElement ID|HTMLTRElement|Record Index(Number)|Hash Record Value Key}
     * @param filter {String} String value to match, if using the record value for selection.
     * @returns
     * @public
     */
    select : function() {
        Y.log("select", "info", "gallery-dp-recordset-selection");
    }
});

Y.namespace("Plugin").RecordsetSelection = RecordsetSelection;
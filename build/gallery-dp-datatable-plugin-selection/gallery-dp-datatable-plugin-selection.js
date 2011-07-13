YUI.add('gallery-dp-datatable-plugin-selection', function(Y) {

/**
 *
 *
 * @module DatatableSelection
 * @author eamonb
 * @requires plugin, datatable, gallery-datatable-tableevents
 */
var Lang = Y.Lang;

/**
 * DataTable selection plugin
 * 
 * Provides an API to make selections and get the current selection.
 * Uses recordset-selection to maintain the underlying selection
 * TODO: use recordset-filter to select by attribute
 * TODO: support inverse, select by value (eg. result set contains tag property), none
 *
 * @namespace Y.DP
 * @class DatatableSelection
 * @extends Plugin.Base
 */
function DatatableSelection() {
    DatatableSelection.superclass.constructor.apply(this, arguments);
}

Y.mix(DatatableSelection, {

    NS : "selection",

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

Y.extend(DatatableSelection, Y.Plugin.Base, {

    /**
     * Initializer runs when the plugin is constructed or plugged into the host instance.
     *
     * @method initializer
     * @param config {Object} Configuration object
     */
    initializer : function (config) {
        
        this.onHostEvent("rowClick", this._onHostRowClick);
        
        this.onHostEvent("rowMouseenter", this._onHostRowMouseenter);
        this.onHostEvent("rowMouseleave", this._onHostRowMouseleave);
        
        
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
     * Change item selection on host row click
     *
     * @method _onHostRowClick
     * @param e {Event} attrChange event facade
     * @returns undefined
     * @protected
     */
    _onHostRowClick : function(e) {
        
        // recordset.selection.toggle(trId|tr)
        // on recordset selectionChange update ui
        
    },
    
    /**
     * Highlight row on mouse enter
     *
     * @method _onHostRowMouseenter
     * @param e {Event} attrChange event facade
     * @returns
     * @protected
     */
    _onHostRowMouseenter : function(e) {
        
        e.currentTarget.addClass(this.get('host').getClassName('row', 'over'));
    },
    
    /**
     * Remove highlighting on row mouse leave
     *
     * @method _onHostRowMouseleave
     * @param e {Event} attrChange event facade
     * @returns
     * @protected
     */
    _onHostRowMouseleave : function(e) {
        
        e.currentTarget.removeClass(this.get('host').getClassName('row', 'over'));
    }
});

Y.namespace("DP").DatatableSelection = DatatableSelection;


}, '@VERSION@' ,{requires:['datatable', 'gallery-datatable-tableevents']});

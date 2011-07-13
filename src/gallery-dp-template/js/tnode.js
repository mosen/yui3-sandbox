/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * 
 *
 * @module Tnode
 * @author admin
 * @requires widget
 */

/* Frequently used shortcuts, strings and constants */
var Lang = Y.Lang;

/**
 * Tnode
 *
 * @class Tnode
 * @extends Widget
 * @constructor
 */
function Tnode(config) {
    Tnode.superclass.constructor.apply(this, arguments);
}

Y.mix(Tnode, {

    /**
     * The widget name identifies the event prefix and is a basis for generating
     * class names.
     * 
     * @property NAME
     * @type String
     * @static
     */
    NAME : "tnode",

    /**
     * The attribute configuration represents the core user facing state of 
     * the widget.
     *
     * @property ATTRS
     * @type Object
     * @protected
     * @static
     */
    ATTRS : {
        
        /**
         * The collection of strings to be used for the widget UI
         * If using the intl module, strings can be shipped separately.
         *
         * @attribute strings
         * @type Array
         */
        strings : {
            value : {
        // The string below can be accessed using this widget's 
        // .get('strings.title')
        // title : "myWidget"
        }
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
    },
    
    /**
     * The HTML_PARSER attribute is used if the Widget supports progressive enhancement.
     * It is used to populate the widget attribute configuration from existing markup.
     * 
     * @property HTML_PARSER
     * @type Object
     * @static
     */
    HTML_PARSER : {
    
// attrA : '#nodeselector' or
// attrA : function(srcNode) { do something and return attrA value }
}
});

Tnode.prototype = {

    
    
};

Y.namespace("DP").Tnode = Tnode;
/**
 * 
 *
 * @module Tnode
 * @author eamonb
 * @requires widget
 */

/**
 * Tnode
 * A model that behaves like a Y.Node instance but does not interact with the DOM
 * at all.
 * 
 * It contains a toString() method which prints the template for the node, to
 * be used with Node.create() or Node.setContent()
 *
 * @class Tnode
 * @extends Widget
 * @constructor
 */

Y.namespace("DP").TNode = Y.Base.create('gallery-dp-tnode', Y.Base, [], {
    
    /**
     * Create a TNode using a template
     *
     * @method create
     * @param v {String} Template string
     * @returns
     * @public
     */
    create : function(v) {
        Y.log("create", "info", "gallery-dp-tnode");
        
        this.set('template', v);
    },
    
    /**
     * Append a template
     *
     * @method append
     * @param
     * @returns
     * @public
     */
    append : function() {
        Y.log("append", "info", "gallery-dp-tnode");
    },
    
    /**
     * Set the initial template value
     *
     * @method _setAttrTemplate
     * @param v {String} Template string
     * @returns
     * @protected
     */
    _setAttrTemplate : function(v) {
        Y.log("_setAttrTemplate", "info", "gallery-dp-tnode");
        
        //TD_TEMPLATE = '<td headers="{headers}" class="{classnames}"><div class="'+CLASS_LINER+'"></div></td>',
        
    }
    
}, {

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
        
        attributes : {
            value : {
                
            }
        },
        /**
         * The complete TNode as a template
         * Setting this value parses the template
         *
         * @attribute template
         * @type String
         */
        template : {
            value : "",
            setter : this._setAttrTemplate
        },
        
        
        /**
         * Child TNodes
         *
         * @attribute children
         * @type TNodeList
         */
        children : {
            value : []
        }

    }
});


YUI.add('gallery-dp-tnode', function(Y) {

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

var Lang = Y.Lang,
    YNode = Y.Node,
    YgetClassName = Y.ClassNameManager.getClassName,
    Ycreate = YNode.create,
    Ysubstitute = Y.substitute,
    
    DATATABLE = "datatable",
    CLASS_MSG = YgetClassName(DATATABLE, "msg"),
    CLASS_LINER = YgetClassName(DATATABLE, "liner"),
    TD_TEMPLATE = '<td headers="{headers}" class="{classnames}"><div class="'+CLASS_LINER+'">{value}</div></td>',
    TEMPLATE_TH = '<th id="{id}" rowspan="{rowspan}" colspan="{colspan}" class="{classnames}" abbr="{abbr}"><div class="'+CLASS_LINER+'">{value}</div></th>',
    COLUMN_TEMPLATE_EXT = '<col></col>';


function DTTest() {}
DTTest.NAME = "dttest";
DTTest.prototype = {
    /**
     * Create DataTable TD Nodes
     * 
     * Enhanced to provide text-align specification in the column.
     * Columns can have an align attribute which will determine how the content is
     * aligned.
     * 
     * Incorporates fix from patch #2529920/#2529921
     * 
     * @method _createTbodyTdNode
     * @protected
     * @param o {Object} Object
     * @return {Node} TD Node
     */
    _createTbodyTdNode : function(o) {
        var column = o.column,
            formatvalue = null;
            

        //TODO: attributes? or methods?
        o.headers = column.headers;
        o.classnames = column.get("classnames");
        o.align = column.get("align");
        formatvalue = this.formatDataCell(o);
        o.value = formatvalue;
        o.td_template = Y.substitute(TD_TEMPLATE, o);
        /*
        o.liner = o.td.one('div');
        
        if (o.align == 'left' || o.align == 'right' || o.align == 'center') {
            o.liner.setStyle('textAlign', o.align);
        }
        
        if (column.get('width') !== undefined) {
            o.liner.setStyle('width', column.get('width'));
        }*/

        

        // Formatters should return a string value to be appended, lack of a string here indicates that the formatter has utilised 
        // the o.td reference to populate the cell.
//        if (Y.Lang.isString(formatvalue)) {
//            o.value = formatvalue;
//            o.td_template = Y.substitute(o.td_template)
//        }
//
//        return o.td_template;
        return o.td_template;
    }
};

Y.Base.mix(Y.DataTable.Base, [DTTest]);


}, '@VERSION@' ,{requires:['datatable']});

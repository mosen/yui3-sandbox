YUI.add('gallery-dp-selectable', function(Y) {

/**
 *
 *
 * @module Selectable
 * @requires
 */

/* Any frequently used shortcuts, strings and constants */
var Lang = Y.Lang,
    YgetClassName = Y.ClassNameManager.getClassName;

/**
 *
 *
 * @class Selectable
 * @extends Plugin
 */
Y.namespace('DP').Selectable = Y.Base.create( 'gallery-dp-selectable', Y.Plugin.Base, [], {

    /**
     * Lifecycle : Initializer
     *
     * @method initializer
     * @param config {Object} Configuration object
     * @protected
     * @constructor
     */
    initializer : function (config) {
        Y.log(config, "info", this.NS);
        
        this.get('host').delegate("mouseover", Y.bind(this._handleOver, this), this.get('itemNode'));
        this.get('host').delegate("click", Y.bind(this._handleClick, this), this.get('itemNode'));
        this.get('host').delegate("mouseout", Y.bind(this._handleOut, this), this.get('itemNode'));
        
        this.after('selectionChange', this._uiSetSelection);
    },

    /**
     * Destructor lifecycle implementation for the selectable class.
     *
     * @method destructor
     * @protected
     */
    destructor: function() { 
        this.get('host').detach("mouseover");
        this.get('host').detach("mouseout");
        this.get('host').detach("click");
    },
    
    /**
     * Handle mouseover the selection item
     *
     * @method _handleOver
     * @param e {Event} Event facade of the mouseover event
     * @returns
     * @public
     */
    _handleOver : function(e) {
        Y.log("_handleOver", "info", this.NS);
        
        var target = e.target;
        target.addClass(YgetClassName('node', 'highlighted'));
    },
    
    
    /**
     * Handle mouseout on the selection item
     *
     * @method _handleOut
     * @param e {Event} Event facade of the mouseout event
     * @returns
     * @public
     */
    _handleOut : function(e) {
        Y.log("_handleOut", "info", this.NS);
        
        var target = e.currentTarget;
        target.removeClass(YgetClassName('node', 'highlighted'))
    },
    
    /**
     * Handle click on the selection item
     *
     * @method _handleClick
     * @param e {Event} Event facade of the click event
     * @returns
     * @public
     */
    _handleClick : function(e) {
        Y.log("_handleClick", "info", this.NS);
        
        var target = e.currentTarget,
            selection = this.get('selection'),
            allowMultiple = this.get('allowMultiple'),
            allowDeselect = this.get('allowDeselect'),
            i = 0,
            removed = false;
        
        if (allowDeselect) {
            for (; i < selection.length; i++) {
                if (target === selection[i]) {
                    selection.splice(i, 1);
                    removed = true;
                }
            }
        }
        
        if (!removed) {
            if (allowMultiple) {
                selection.unshift(target);
            } else {
                selection = [target];
            }
        }
        
        this.set('selection', selection);
    },
    
    /**
     * Update the UI with the selection
     *
     * @method _uiSetSelection
     * @param e {Event} Event facade from ATTR change
     * @returns
     * @public
     */
    _uiSetSelection : function(e) {
        var selection = this.get('selection');
        Y.log("_uiSetSelection", "info", this.NS);
        
        this.get('host').all(this.get('itemNode')).removeClass(YgetClassName('node', 'selected'));
        
        Y.Array.each(selection, function(v) {
            v.addClass(YgetClassName('node', 'selected'));
        }, this);
    },
    
    /**
     * Clear the selection
     *
     * @method clear
     * @param
     * @returns
     * @public
     */
    clear : function() {
        Y.log("clear", "info", this.NS);
        
        this.set('selection', []);
    },
    
    /**
     * Invert the selection
     *
     * @method invert
     * @param
     * @returns
     * @public
     */
    invert : function() {
        Y.log("invert", "info", this.NS);
        
        // TODO: implement
    }

}, {

    /**
     * The plugin namespace
     *
     * @property Selectable.NS
     * @type String
     * @protected
     * @static
     */
    NS : "selectable",

    /**
     * Static property used to define the default attribute configuration of
     * the Widget.
     *
     * @property Selectable.ATTRS
     * @type Object
     * @protected
     * @static
     */
    ATTRS : {
        
        /**
         * Selector to use for delegating events
         * 
         * @attribute itemNode
         */
        itemNode : {
            value : 'li'
        },
        
        /**
         * Attribute containing the current selection
         * 
         * @attribute selection
         */
        selection : {
            value : []
        },
        
        /**
         * Whether to allow multiple selections
         *
         * @attribute allowMultiple
         */
        allowMultiple : {
            value : true,
            validator : Y.Lang.isBoolean
        },
        
        /**
         * Whether to allow deselection of an element on click
         *
         * @attribute allowDeselect
         * @type Boolean
         */
        allowDeselect : {
            value : true,
            validator : Y.Lang.isBoolean
        }
    }
});


}, '@VERSION@' ,{requires:['base', 'node', 'plugin'], skinnable:true});

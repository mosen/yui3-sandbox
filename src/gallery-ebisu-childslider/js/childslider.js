/**
 * 
 *
 * @module Childslider
 * @requires Plugin, Slider
 */
var Lang = Y.Lang;

/**
 * Ebisu ChildSlider provides a customised version of the Y.Slider widget which will attach
 * itself to another widget's rail.
 * 
 * This gives you the ability to create a dual slider in order to specify a 'range'
 * 
 * The child slider will inherit values from the master where it would change the value outcome
 * of the slider.
 *
 * @class Childslider
 * @extends Plugin
 */
Y.namespace('Ebisu').ChildSlider = Y.Base.create( 'gallery-ebisu-childslider', Y.Plugin.Base, [], {

    /**
     * Lifecycle : Initializer
     *
     * @method initializer
     * @param config {Object} Configuration object
     * @protected
     * @constructor
     */
    initializer : function (config) {
        // TODO: ensure that clickableRail is disabled for both sliders, this doesn't make sense in the context of 2 sliders.
        // can't set clickablerail false if we have no rail.
        this.get('host').set('clickableRail', false);
        
        this.beforeHostMethod('renderUI', this.renderUI);
        this.afterHostMethod('bindUI', this._bindConstraints);
        
        // Cannot unbind from a rail that does not exist in the host instance.
        // Raises an error after destroy();
        this.beforeHostMethod('_unbindClickableRail', this._preventUnbindClickableRail);

        // Bind constraints before or after parent rendering.
        if (this.get('parent')._dd) {
            this._bindParentConstraints();
        } else {
            this.get('parent').after('render', this._bindParentConstraints, this);
        }
        
        // Bind host values to parent values to prevent different ranges of values on our slider
        this.get('parent').after('maxChange', this._syncHostMax());
        this.get('parent').after('minChange', this._syncHostMin());
        this.get('parent').after('lengthChange', this._syncHostLength());
        
        // TODO: need to prevent .set('value') on host or parent that goes out of each others constraining range.
    },

    /**
     * Lifecycle : Create the DOM structure for the childslider.
     *
     * @method renderUI
     * @protected
     */
    renderUI : function () {
        Y.log("renderUI", "info", "Y.Ebisu.ChildSlider");
        
        var host = this.get('host');
        // We don't use our own rail.
        host.rail = this.get('parent').rail;
        
        // Render as normal
        /**
         * The Node instance of the Slider's thumb element.  Do not write to
         * this property.
         *
         * @property thumbs
         * @type {Node}
         */
        host.thumb = host.renderThumb();
        
        if (Y.Lang.isString(this.get('extraClass'))) {
            host.thumb.addClass(this.get('extraClass'));
        }
        
        host.rail.appendChild( host.thumb );


        host.get('contentBox').addClass( host.getClassName( host.axis ) );
        
        // Do not run the original renderUI
        return new Y.Do.Prevent();
    },

    /**
     * Destructor lifecycle implementation for the childslider class.
     *
     * @method destructor
     * @protected
     */
    destructor: function() { 
    
    },
    
    /**
     * Add an event handler for the host's DD drag:align event
     *
     * @method _bindConstraints
     * @private
     */
    _bindConstraints : function() {
        Y.log("_bindConstraints", "info", "Y.Ebisu.ChildSlider");
        
        this.get('host')._dd.after('drag:align', this._constrainSlider, this);
    },
    
    /**
     * Add an event handler for the parent's DD drag:align event
     *
     * @method _bindParentConstraints
     * @private
     */
    _bindParentConstraints : function() {
        Y.log("_bindParentConstraints", "info", "Y.Ebisu.ChildSlider");
        
        this.get('parent')._dd.after('drag:align', this._constrainParentSlider, this);
    },    
    
    /**
     * Handle a DD drag:align event and check to see if
     * our host slider will exceed the bounds of the parent slider.
     *
     * @method _constrainSlider
     * @private
     */
    _constrainSlider : function(e) {
        Y.log("_constrainSlider", "info", "Y.Ebisu.ChildSlider");
        
        var parent = this.get('parent'),
            host = this.get('host'),
            parentValue = parent.get('value'),
            myValue = host.get('value'),
            parentOffset = host._valueToOffset(parentValue),
            myOffset = host._valueToOffset(myValue),
            dd = host._dd,
            thumbWidth = this.get('thumbwidth');

            // TODO : proper thumb detection
            // TODO : specify which thumb is the upper bound
            //if (dd.actXY[0] < (parentOffset + thumbWidth + (thumbWidth / 2))) {
            if (myOffset < (parentOffset + thumbWidth + (thumbWidth / 2))) {
                dd.actXY[0] = parent._dd.actXY[0] + thumbWidth + (thumbWidth / 2);
            }
    },
    
    /**
     * Handle a DD drag:align event and check to see if
     * the parent slider will exceed the bounds of our hosts slider
     *
     * TODO: merge constrain functions, no need for doubling up
     *
     * @method _constrainParentSlider
     * @private
     */
    _constrainParentSlider : function(e) {
        Y.log("_constrainParentSlider", "info", "Y.Ebisu.ChildSlider");
        
        var parent = this.get('parent'),
            host = this.get('host'),
            parentValue = parent.get('value'),
            myValue = host.get('value'),
            parentOffset = host._valueToOffset(parentValue),
            myOffset = host._valueToOffset(myValue),
            dd = parent._dd,
            thumbWidth = this.get('thumbwidth');


            // TODO : proper thumb detection
            // TODO : specify which thumb is the upper bound
            if (parentOffset > (myOffset - (thumbWidth / 2))) {
                  Y.log("parentActX: " + dd.actXY[0] + " > myValueToOffset: " + myOffset, "info", this.NS);
                Y.log("parentNodeX:" + dd.nodeXY[0]);
                Y.log("parentDeltaX:" + dd.deltaXY[0]);
                Y.log("parentRealX:" + dd.realXY[0]);              

                
               
                dd.actXY[0] = (host._dd.actXY[0] - (thumbWidth / 2));
            }
    },

    /**
     * Synchronise our max when the parents max value changes.
     *
     * @method _syncHostMax
     * @protected
     */
    _syncHostMax : function() {
        var parent = this.get('parent'),
            host = this.get('host');
        
        Y.log("_syncHostMax", "info", "Y.Ebisu.ChildSlider");
        
        host.set('max', parent.get('max'));
    },
    
    /**
     * Synchronise our min when the parents min value changes.
     *
     * @method _syncHostMin
     * @protected
     */
    _syncHostMin : function() {
        var parent = this.get('parent'),
            host = this.get('host');
        
        Y.log("_syncHostMin", "info", "Y.Ebisu.ChildSlider");
        
        host.set('min', parent.get('min'));
    },
    
    /**
     * Synchronise our max when the parents max value changes.
     *
     * @method _syncHostLength
     * @protected
     */
    _syncHostLength : function() {
        var parent = this.get('parent'),
            host = this.get('host');
        
        Y.log("_syncHostLength", "info", "Y.Ebisu.ChildSlider");
        
        host.set('length', parent.get('length'));
    },
    
    /**
     * Prevent the host rail from double unbinding, which causes an error.
     *
     * @method _preventUnbindClickableRail
     * @private
     */
    _preventUnbindClickableRail : function() {
        //var host = this.get('host');
        
        Y.log("this._preventUnbindClickableRail", "info", "Y.Ebisu.ChildSlider");
        
        return Y.Do.Prevent();
    }
}, {

    /**
     * The plugin namespace
     *
     * @property NS
     * @type String
     * @protected
     * @static
     */
    NS : "child",

    /**
     * The plugin name
     *
     * @property NAME
     * @type String
     */
    NAME : "childSlider",

    /**
     * Static property used to define the default attribute configuration of
     * the Widget.
     *
     * @property ATTRS
     * @type Object
     * @protected
     * @static
     */
    ATTRS : {
        
        /**
         * The parent slider that will constrain the movement of the slider attached to this plugin.
         * 
         * @attribute parent
         * @type Object
         */
        parent : {
            value : null
        },
        
        /**
         * Whether or not this host slider will be constrained by the parent slider.
         * 
         * TODO: implement
         * 
         * @attribute constrained
         * @type Boolean
         */
        constrained : {
            value : true
        },
        
        /**
         * Width of the thumbs in the host slider and parent slider.
         * 
         * Because of the variation between sprites used to render the thumb, 
         * we need to manually specify their width here.
         * 
         * TODO: find a sensible way of detecting thumb width
         *
         * @attribute thumbwidth
         * @type Number
         */
        thumbwidth : {
            value : 14
        },
        
        /**
         * Additional class for the thumb node owned by the host
         *
         * @attribute extraClass
         * @type String
         */
        extraClass : {
            value : null
        }
    }
});
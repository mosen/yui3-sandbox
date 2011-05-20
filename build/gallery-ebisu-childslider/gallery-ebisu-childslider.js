YUI.add('gallery-ebisu-childslider', function(Y) {

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
 * TODO: observe master slider's values such as maxvalue which this one should reflect.
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
        this.get('host').set('clickableRail', false);
        
        this.beforeHostMethod('renderUI', this.renderUI);
        this.afterHostMethod('bindUI', this._bindConstraints);
        
        // Bind constraints before or after parent rendering.
        if (this.get('parent')._dd !== undefined) {
            this._bindParentConstraints();
        } else {
            this.get('parent').after('render', this._bindParentConstraints());
        }
    },

    /**
     * Lifecycle : Create the DOM structure for the childslider.
     *
     * @method renderUI
     * @protected
     */
    renderUI : function () {
        
        // We don't use our own rail.
        this.get('host').rail = this.get('parent').rail;

        // Render as normal
        /**
         * The Node instance of the Slider's thumb element.  Do not write to
         * this property.
         *
         * @property thumbs
         * @type {Node}
         */
        this.get('host').thumb = this.get('host').renderThumb();
        this.get('host').rail.appendChild( this.get('host').thumb );


        this.get('host').get('contentBox').addClass( this.get('host').getClassName( this.get('host').axis ) );
        
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
        
        this.get('host')._dd.after('drag:align', this._constrainSlider, this);
    },
    
    /**
     * Add an event handler for the parent's DD drag:align event
     *
     * @method _bindParentConstraints
     * @private
     */
    _bindParentConstraints : function() {
        
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
            if (dd.actXY[0] < (parentOffset + thumbWidth + (thumbWidth / 2))) {
                dd.actXY[0] = parentOffset + thumbWidth + (thumbWidth / 2);
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
            if (dd.actXY[0] > (myOffset - (thumbWidth / 2))) {
                dd.actXY[0] = (myOffset - (thumbWidth / 2));
            }
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
        }
    }
});


}, '@VERSION@' ,{requires:['base', 'dd', 'slider']});

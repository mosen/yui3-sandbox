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
        this.beforeHostMethod('renderUI', this.renderUI);
        this.afterHostMethod('bindUI', this._bindConstraints);   
    },

    /**
     * Lifecycle : Create the DOM structure for the childslider.
     *
     * @method renderUI
     * @protected
     */
    renderUI : function () {
        Y.log("renderUI", "info", "Y.Ebisu.ChildSlider");
        
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
        Y.log("_bindConstraints", "info", "Y.Ebisu.ChildSlider");
        
        this.get('host')._dd.after('drag:align', this._constrainSlider, this);
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
        
        var parentValue = this.get('parent').get('value'),
            myValue = this.get('host').get('value'),
            parentOffset = this.get('host')._valueToOffset(parentValue),
            dd = this.get('host')._dd,
            thumbWidth = 15;

            // TODO : proper thumb detection
            // TODO : specify which thumb is the upper bound
            if (dd.actXY[0] < (parentOffset + thumbWidth) + 5) {
                dd.actXY[0] = parentOffset + thumbWidth + 5;
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
        }
    }
});


}, '@VERSION@' ,{requires:['base', 'dd', 'slider']});

/**
 *
 *
 * @module gallery-ebisu-dualslider
 * @requires Base, Slider
 */

/* Any frequently used shortcuts, strings and constants */
var Lang = Y.Lang,
    classMgr = Y.ClassNameManager,
    NODE = 'node',
    MIN       = 'min',
    MAX       = 'max',
    LEFT_VALUE = 'leftvalue',
    RIGHT_VALUE = 'rightvalue',

    round = Math.round;

/**
 * Extends Slider to provide a second thumb which cannot cross-over the first thumb.
 *
 * @class Ebisu.DualSlider
 * @extends Slider
 */
Y.namespace('Ebisu').ChildSlider = Y.Base.create( 'Slider', Y.Slider, [], {


    /**
     * Lifecycle : Create the DOM structure for the ebisu-dualslider.
     *
     * @method renderUI
     * @protected
     */
    renderUI : function () {
        
        var contentBox = this.get( 'contentBox' );

        /**
         * The Node instance of the Slider's rail element.  Do not write to
         * this property.
         *
         * @property rail
         * @type {Node}
         */
        this.rail = this.get('parent').rail;

        /**
         * The Node instance of the Slider's thumb element.  Do not write to
         * this property.
         *
         * @property thumbs
         * @type {Node}
         */
        this.thumb = this.renderThumb();
//this.thumbs = this.renderThumbs();

        this.rail.appendChild( this.thumb );
        this.rail.appendChild( this.rightThumb );
        // @TODO: insert( contentBox, 'replace' ) or setContent?


        // <span class="yui3-slider-x">
        contentBox.addClass( this.getClassName( this.axis ) );
    }
}, {
    NAME: "Slider",

    ATTRS : {
        parent: null
    }
});
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
Y.namespace('Ebisu').DualSlider = Y.Base.create( 'ebisu-dualslider', Y.Slider, [], {


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
        this.rail = this.renderRail();

        this._uiSetRailLength( this.get( 'length' ) );

        /**
         * The Node instance of the Slider's thumb element.  Do not write to
         * this property.
         *
         * @property thumbs
         * @type {Node}
         */
        this.thumb = this.renderThumb();
        this.thumb.addClass(this.getClassName('thumb', 'left'));
        
        this.rightThumb = this.renderThumb();
        this.thumb.addClass(this.getClassName('thumb', 'right'));
//this.thumbs = this.renderThumbs();

        this.rail.appendChild( this.thumb );
        this.rail.appendChild( this.rightThumb );
        // @TODO: insert( contentBox, 'replace' ) or setContent?
        contentBox.appendChild( this.rail );

        // <span class="yui3-slider-x">
        contentBox.addClass( this.getClassName( this.axis ) );
    },

    /**
     * Render markup for both thumbs.
     *
     * @method renderThumbs
     * @private
     * @return Array containing both thumbs
     */
    renderThumbs : function() {
        Y.log("renderThumbs", "info", "Ebisu.DualSlider");
        
        // Left Thumb
        this._initThumbUrl();

        var imageUrl = this.get( 'thumbUrl' ),
            tplThumb = Y.substitute( this.THUMB_TEMPLATE, {
                    thumbClass      : this.getClassName( 'thumb' ),
                    thumbShadowClass: this.getClassName( 'thumb', 'shadow' ),
                    thumbImageClass : this.getClassName( 'thumb', 'image' ),
                    thumbShadowUrl  : imageUrl,
                    thumbImageUrl   : imageUrl
                }), 
            leftThumb = Y.Node.create( tplThumb ),
            rightThumb = Y.Node.create( tplThumb );
            
            leftThumb.addClass(this.getClassName( 'thumb', 'left' ));
            rightThumb.addClass(this.getClassName( 'thumb', 'right' ));
            
        return [ leftThumb, rightThumb ];     
    },
    
    /**
     * Makes the thumb draggable and constrains it to the rail.
     *
     * @method _bindThumbDD
     * @protected
     */
    _bindThumbDD: function () {
        var config = { constrain: this.rail };
        
        // { constrain: rail, stickX: true }
        config[ 'stick' + this.axis.toUpperCase() ] = true;

        /** 
         * The DD.Drag instance linked to the left thumb node.
         *
         * @property _dd
         * @type {DD.Drag}
         * @protected
         */
        this._dd = new Y.DD.Drag( {
            node   : this.thumb,
            bubble : false,
            on     : {
                'drag:start': Y.bind( this._onDragStart, this )
            },
            after  : {
                'drag:drag': Y.bind( this._afterDrag,    this ),
                'drag:end' : Y.bind( this._afterDragEnd, this ),
                'drag:align' : Y.bind( this._afterDragAlign, this )
            }
        } );
        
        
        /** 
         * The DD.Drag instance linked to the right thumb node.
         *
         * @property _ddr
         * @type {DD.Drag}
         * @protected
         */
        this._ddr = new Y.DD.Drag( {
            node   : this.rightThumb,
            bubble : false,
            on     : {
                'drag:start': Y.bind( this._onDragStart, this )
            },
            after  : {
                'drag:drag': Y.bind( this._afterDrag,    this ),
                'drag:end' : Y.bind( this._afterDragEnd, this ),
                'drag:align' : Y.bind( this._afterDragAlign, this )
            }
        } );
        

        // Constrain the thumb to the rail
        this._dd.plug( Y.Plugin.DDConstrained, config );
        this._ddr.plug( Y.Plugin.DDConstrained, config );
    },
    
    /**
     * Dispatches the <code>thumbMove</code> event.
     * 
     * Prevent thumbmove from being dispatched if the thumb movement has been restricted.
     *
     * @method _afterDrag
     * @param e {Event} the <code>drag:drag</code> event from the thumb
     * @protected
     */
    _afterDrag: function ( e ) {
        var thumbXY = e.info.xy[ this._key.xyIndex ],
            railXY  = e.target.con._regionCache[ this._key.minEdge ],
            offset = (thumbXY - railXY);
            
        //console.dir(this._dd);
        
        if (offset > 20) {
            //this._dd.actXY = [0, this._dd.actXY[1]];
            //this._dd.stopDrag();
            e.preventDefault();
        }

        Y.log("Thumb position: " + thumbXY + ", Rail position: " + railXY, "info", "slider");
        this.fire( 'thumbMove', {
            offset : offset,
            ddEvent: e
        } );
    },
    
    /**
     * Handles the drag align event to prevent nodes from being dragged outside of the range.
     *
     * @method _afterDragAlign
     * @param e {Event} the <code>drag:align</code> event from the thumb
     * @protected
     */
    _afterDragAlign: function ( e ) {
        Y.log('drag:align thumb');

        if (e.currentTarget == this._ddr) {
            
        }
        
        
        if (e.currentTarget.actXY[0] > 100) {
            this._dd.actXY = [99, this._dd.actXY[1]];
            //this._dd.stopDrag();
            //e.preventDefault();
        }
    },
    
    /**
     * Verifies that the current value is within the min - max range.  If
     * not, value is set to either min or max, depending on which is
     * closer.
     *
     * @method _verifyValue
     * @protected
     */
    _verifyValue: function () {
        var value   = this.get( VALUE ),
            nearest = this._nearestValue( value );

        if ( value !== nearest ) {
            // @TODO Can/should valueChange, minChange, etc be queued
            // events? To make dd.set( 'min', n ); execute after minChange
            // subscribers before on/after valueChange subscribers.
            this.set( VALUE, nearest );
        }
    }
}, {

    /**
     * Namespace
     *
     * @property NAME
     * @type String
     * @protected
     * @static
     */
    NAME : "dualSlider",

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
         * The value associated with the thumb's current position on the
         * rail. Defaults to the value inferred from the thumb's current
         * position. Specifying value in the constructor will move the
         * thumb to the position that corresponds to the supplied value.
         *
         * @attribute value
         * @type { Number }
         * @default (inferred from current thumb position)
         */
        value: {
            value : 0,
            setter: '_setNewValue'
        },
        
        
        /**
         * The value associated with the thumb's current position on the
         * rail. Defaults to the value inferred from the thumb's current
         * position. Specifying value in the constructor will move the
         * thumb to the position that corresponds to the supplied value.
         *
         * @attribute rightValue
         * @type { Number }
         * @default (inferred from current thumb position)
         */
        rightValue: {
            value : 0,
            setter: '_setNewValue'
        }
    }
        

});
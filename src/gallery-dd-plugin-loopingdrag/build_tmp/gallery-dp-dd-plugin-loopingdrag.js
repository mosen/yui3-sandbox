YUI.add('gallery-dp-dd-plugin-loopingdrag', function(Y) {


/**
 * 
 *
 * @module LoopingDrag
 * @requires Plugin
 */

/* Any frequently used shortcuts, strings and constants */


/**
 * 
 *
 * @class Y.DP.LoopingDrag
 * @extends Plugin
 */
Y.namespace('DP').LoopingDrag = Y.Base.create( 'gallery-dp-dd-plugin-loopingdrag', Y.Plugin.Base, [], {

    
    initializer: function(config) {

        this.afterHostEvent('drag:align', Y.bind(this.align, this));
        this.afterHostEvent('drag:drag', Y.bind(this.drag, this));

        this.publish('viewLoop', { defaultFn: this._defViewLoop });

    },

    destructor : function() {

    },
    
    
    /**
     * Called when host fires drag:align
     * 
     * @method align
     * @param e {Event} Event facade for drag:align - { pageX:, pageY: }
     * @private
     */
    align : function(e) {
        
        var dragNode = this.get('host').get('dragNode'),
            dragNodeXY = dragNode.getXY(),
            actXY = this.get('host').actXY,
            deltaXY = this.get('host').deltaXY,
            totalWidth = this.get('width'),
            leftBound = this.get('leftOffset'),
            rightBound = this.get('rightOffset'),
            newActXY;
        
        
        
        
        if (actXY[0] < rightBound) {
            newActXY = [(e.pageX - deltaXY[0]) % totalWidth + totalWidth, actXY[1]];
            this.get('host').actXY = newActXY;
        }
        
        if (actXY[0] > leftBound) {
            newActXY = [(e.pageX - deltaXY[0]) % totalWidth, actXY[1]];
            this.get('host').actXY = newActXY;
        }
        
        if (newActXY) {
 
            var loopAbs = newActXY[0] - this.get('loopedXY')[0];

            if (loopAbs > 100) {
                this.fire('viewLoop', { edge: this.LOOP_LEFTEDGE });
            }
            
            if (loopAbs < -100) {
                this.fire('viewLoop', { edge: this.LOOP_RIGHTEDGE });
            }


            this.set('loopedXY', newActXY);
        }
    },
    
    /**
     * Called when host fires drag:drag
     * 
     * @method drag
     * @private
     */
    drag : function() {
    },
    
    
    /**
     * Default handler for view looping
     * 
     * @method _defViewLoop
     * @param e {Event} Event facade
     * @private
     */
    _defViewLoop : function(e) {
        
    },


    /**
     * Width of the host object's drag node
     * 
     * @property _dragNodeWidth
     */
    _dragNodeWidth : 0,

    /**
     * Used to indicate via viewloop event which side went past the threshhold.
     * 
     * @property LOOP_LEFTEDGE
     * @static
     */
    LOOP_LEFTEDGE : 'leftedge',
    
    /**
     * Used to indicate via viewloop event which side went past the threshhold.
     * 
     * @property LOOP_RIGHTEDGE
     * @static
     */    
    LOOP_RIGHTEDGE : 'rightedge'

}, {



    /**
     * The plugin namespace
     * 
     * @property Loop.NS
     * @type String
     * @protected
     * @static
     */
    NS : "loopingDrag",
    
    ATTRS : {
        
        
        /**
         * Width of the view loop used to calculate the absolute position when resetting.
         *
         * @attribute width
         * @type Integer
         */
        width : {
            value : null
        },
        
        /**
         * The offset (from the left or right side of the draggable node), that will trigger the object
         * to loop back to its initial position.
         * 
         * @attribute offset
         * @type Integer
         */
        offset : {
            value : null
        },
        
        
        /**
         * The offset from the left side of the object that will trigger its absolute position to be reset.
         *
         * @attribute leftOffset
         * @type Integer
         */
        leftOffset : {
            value : null
        },
        
        
        /**
         * The offset from the right side of the object that will trigger its absolute position to be reset.
         *
         * @attribute rightOffset
         * @type Integer
         */
        rightOffset : {
            value : null
        },
        
        
        /**
         * The calculated XY values after looping the view around
         * 
         * @attribute loopedXY
         * @type Integer
         */
        loopedXY : {
            value : 1
        }
    }
    
});



}, '@VERSION@' ,{requires:['plugin', 'dd-drag', 'dd-constrain']});

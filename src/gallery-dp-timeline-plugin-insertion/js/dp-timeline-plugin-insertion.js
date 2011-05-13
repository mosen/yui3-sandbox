/**
 *
 * @module gallery-dp-timeline-plugin-insertion
 * @requires Base, Plugin
 */

/* Any frequently used shortcuts, strings and constants */
var Lang = Y.Lang,
    Node = Y.Node;

/**
 * Timeline insertion plugin allows you to react to insert events, which are initiated by clicking an empty area at the date you want
 * the event inserted.
 *
 * @class DP.TimelineInsertion
 * @extends Plugin
 */
Y.namespace('DP').TimelineInsertion = Y.Base.create( 'gallery-dp-timeline-plugin-insertion', Y.Plugin.Base, [], {

    /**
     * Y.Widget LifeCycle : Initializer
     *
     * @method initializer
     * @param config {Object} Configuration object
     * @protected
     * @constructor
     */
    initializer : function (config) {
        Y.log("init", "info", "Y.DP.TimelineInsertion");
        // this.afterHostEvent('render', this.onHostRenderEvent);
       
        this.afterHostMethod('render', this.renderUI);
        this.afterHostMethod('bindUI', this.bindUI);
    },

    /**
     * Create the DOM structure for the gallery-dp-timeline-plugin-insertion.
     *
     * @method renderUI
     * @protected
     */
    renderUI : function () {
        Y.log("renderUI", "info", "Y.DP.TimelineInsertion");
        
        this.set('insertionNode', this._renderBackgroundInsertionHighlight());
        this.get('insertionNode').on("click",
            Y.bind(this.onInsertionClick, this));
        
        this.get('host')._nodeBackgroundContainer.append(this.get('insertionNode'));
    },


    /**
     *
     * @method bindUI
     * @protected
     */
    bindUI : function () {
        
        // Display insertion area over current date
        this.get('host')._nodeBackgroundContainer.on("mousemove",
            Y.bind(this.onBackgroundHover, this));
        
    },

    /**
     * Destructor lifecycle implementation for the gallery-dp-timeline-plugin-insertion class.
     *
     * @method destructor
     * @protected
     */
    destructor: function() { },
    
    /**
     * Render the highlight object which indicates to the end-user where events may be inserted
     * 
     * @method _renderBackgroundInsertionHighlight
     * @return Node Highlight node
     * @private
     */
    _renderBackgroundInsertionHighlight : function() {
        Y.log("_renderBackgroundInsertionHighlight", "info", "Y.DP.Timeline");

        var nodeBgInsert = Node.create(Y.substitute(this.get('tplBackgroundInsertionHighlight'), {
            className : this.get('host').getClassName('background', 'hlinsert'),
            tipClassName : this.get('host').getClassName('background', 'hlinsert', 'tip'),
            tip: this.get('strings.tip')
        }));
        
        nodeBgInsert.set('width', this.get('host').get('dayWidth'));

        return nodeBgInsert;
    },


    /**
     * Mouse hover over the background container displays highlight at nearest date,
     * indicating that the user may add something on that date.
     * 
     * @method onBackgroundHover
     * @param e {Event} Event facade
     * @private
     */
    onBackgroundHover : function(e) {

    

        var distanceToMid,
            i,
            scrollOffset = this.get('host').get('contentBox').get('offsetLeft'),
            mouseOffsetGlobal = e.clientX - scrollOffset;
            
        //Y.log("bgHover:" + mouseOffsetLocal, "info", "Y.DP.TimelineInsertion");

        for (i = 0; i < this.get('host')._dates.length; i++) {

            distanceToMid = Math.abs(mouseOffsetGlobal - this.get('host')._dates[i].mid);
            //Y.log(distanceToMid);

            if (distanceToMid < (this.get('host').get('dayWidth')/2)) {
                //Y.log("Distance < width/2: " + this.get('host')._dates[i].date, "info", "onBackgroundHover");
                //Y.log("Date global offset:" + this.get('host')._dates[i].left, "info", "onBackgroundHover");

                this.get('insertionNode').set('style.left', this.get('host')._dates[i].leftLocal + 'px');
                this.set('hoverDate', this.get('host')._dates[i].date);
            }
        }
    },
    
    /**
     * Click on the insertion area which initiates a new child being added to the timeline.
     * 
     * 
     * @method onInsertionClick
     * @param e {Event} Event facade
     * @private
     */
    onInsertionClick : function(e) {
        Y.log("onInsertionClick", "info", "Y.DP.Timeline");

        var p = this.get('childPrototype'),
            selectedDate = this.get('hoverDate');

        p.start = selectedDate;
        p.finish = selectedDate;

        var child = this.get('host').add(p);
        child.item(0).set('selected', 1);
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
    NS : "insertion",


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
         * Template for the area highlighted for event insertion.
         * 
         * @attribute tplBackgroundInsertionHighlight
         * @type String
         */
        tplBackgroundInsertionHighlight : {
            value : '<div class="{className}"><div class="{tipClassName}">&nbsp;</div></div>'
        },
        
        
        /**
         * Node reference to the insertion highlight node, which gives feedback as to where
         * the next event will be inserted if the user clicks.
         * 
         * @attribute insertionNode
         * @type Node
         */
        insertionNode : {
            value : undefined
        },
        
        /**
         * The date being hovered in the timeline, used for inserting new items
         * 
         * @attribute hoverDate
         * @type Date
         */
        hoverDate : {
            value : Date()
        },
        
        
        /**
         * Prototype object for child objects
         * 
         * @attribute childPrototype
         * @type Object
         */
        childPrototype : {
            readonly: true,
            getter: function() {
                return {start: this.get('date'), 
                        finish: this.get('date'), 
                        summary: 'Title', 
                        category: 'booked'};
            }
        },
        
        /**
         * Widget strings
         * 
         * @attribute strings
         * @type Object
         */
        strings : {
            value : {
                'tip' : 'Click to add event'
            }
        }
    }
        

});


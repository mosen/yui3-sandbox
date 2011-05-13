YUI.add('gallery-dp-timeline', function(Y) {

var Lang = Y.Lang;

/**
 * Utility methods used to calculate dates and times for timeline
 * 
 * @class DP.TimelineUtil
 */
var TimelineUtil = {
    
        /**
         * @method rangeToDuration
         * @description Convert a range (2 dates) into a duration. Negative durations are possible. Finish date inclusive
         * @param start {Date} Starting date
         * @param finish {Date} Finishing date
         * @return Number Duration in days, may be negative
         * @public
         * @static
         */
        rangeToDuration : function(start, finish) {

            if (!Lang.isDate(start) || !Lang.isDate(finish)) {
                return 0;
            } else {

                // Adding a day to the duration because when we say start now finish now, we mean one day of duration
                // Because that is the minimum duration on the timeline
                var dayInMilliseconds = 1000*60*60*24,
                    tzOffsetDiff = (finish.getTimezoneOffset() - start.getTimezoneOffset()) * 60*1000, // Daylight savings taken into account
                    timeDiff = finish.getTime() - start.getTime() - tzOffsetDiff,
                    timeDiffDays = Math.ceil(timeDiff/dayInMilliseconds) + 1;

                return timeDiffDays;
            }
        },
        
        /**
         * @description Convert a range (2 dates) into a duration. Negative durations are possible. Finish date not inclusive
         * @method rangeToDifference
         * @param start {Date} Starting date
         * @param finish {Date} Finishing date
         * @return Number Duration in days, may be negative
         * @public
         * @static
         */        
        rangeToDifference : function(start, finish) {
            
            if (!Lang.isDate(start) || !Lang.isDate(finish)) {
            
                return 0;
            } else {

                var dayInMilliseconds = 1000*60*60*24,
                    tzOffsetDiff = (finish.getTimezoneOffset() - start.getTimezoneOffset()) * 60*1000, // Daylight savings taken into account
                    timeDiff = finish.getTime() - start.getTime() - tzOffsetDiff,
                    timeDiffDays = timeDiff/dayInMilliseconds;
                    

                return Math.floor(timeDiffDays);
            }
        },
        
        
        /**
         * @method zeroTime
         * @description Clear the time from a date
         * @param d {Date} Date to set time back to 00:00
         * @return Date date with time cleared
         * @public
         * @static
         */
        zeroTime : function(d) {
            
            d.setHours(0);
            d.setMinutes(0);
            d.setSeconds(0);
            d.setMilliseconds(0);
            
            return d;
        },
        
        /**
         * @description Get a new date object with days added
         * @method addDays
         * @param d {Date} Date used as basis
         * @param days {Number} Number of days to add
         * @return Date Date with days added
         * @public
         * @static
         */
        addDays : function(d, days) {
            
            var returnDate = new Date();
            returnDate.setTime(d.getTime());
            returnDate.setDate(returnDate.getDate() + days);

            return returnDate;
        },
        
        /**
         * @description Get a new date object with days subtracted
         * 
         * @method subDays
         * @param d {Date} Date used as basis
         * @param days {Number} Number of days to sub
         * @return Date Date with days subtracted
         * @public
         * @static
         */
        subDays : function(d, days) {
            
            var returnDate = new Date();
            returnDate.setTime(d.getTime());
            returnDate.setDate(returnDate.getDate() - days);

            return returnDate;
        }
};


Y.namespace('DP').TimelineUtil = TimelineUtil;


/* Any frequently used shortcuts, strings and constants */
var Lang = Y.Lang,
    Node = Y.Node,
    contentClassName = Y.ClassNameManager.getClassName('gallery-dp-timeline-event', 'content'),
    boundingClassName = Y.ClassNameManager.getClassName('gallery-dp-timeline-event', 'bounding');

/**
 * Timeline event represents a single event on a Y.DP.Timeline
 *
 * @class DP.TimelineEvent
 * @extends Widget
 */
Y.namespace('DP').TimelineEvent = Y.Base.create( 'gallery-dp-timeline-event', Y.Widget, [Y.WidgetChild], {

    /**
     * Content Template
     * 
     * @property CONTENT_TEMPLATE
     * @protected
     */
    CONTENT_TEMPLATE : '<div class="' + contentClassName + '"></div>',
    
    /**
     * Bounding Template
     * 
     * @property BOUNDING_TEMPLATE
     * @protected
     */
    BOUNDING_TEMPLATE : "<div></div>",

    /**
     * Y.Widget Lifecycle : Initializer
     *
     * @method initializer
     * @param config {Object} Configuration object
     * @constructor
     * @protected
     */
    initializer : function (config) {

        this._afterDateChange(); // Calculate Duration
    },

    /**
     * Create the DOM structure for the dp-timeline-event.
     *
     * @method renderUI
     * @protected
     */
    renderUI : function () {
        
        
        var parent = this.get('parent'),
            width = parent.getEventWidth(this),
            myStartDate = this.get('start'),
            leftOffset = parent.dateToLocalOffset(myStartDate),
            slot = parent._getChildFreeSlot(this, leftOffset),
            topOffset = parent.slotToOffset(slot),
            rightOffset = leftOffset + width,
            slots = parent.get('slots');
            
            
        var evt = Node.create(Y.substitute('<span class="{titleClassName}">{title}</span>', {
            titleClassName : parent.getClassName('event', 'title'),
            title : this.get('summary')
        }));
        
        this.get('contentBox').append(evt);
        
        this.set('slot', slot);
        
        
        this.get('boundingBox').set('style.left', leftOffset + 'px');
        this.get('boundingBox').set('style.top', topOffset + 'px');
        this.set('width', width + 'px');
        
        slots[slot] = rightOffset;
        this.get('parent').set('slots', slots);        
        
    },


    /**
     * Y.Widget Lifecycle
     *
     * @method bindUI
     * @protected
     */
    bindUI : function () {
        this._parentEventHandles = [
            this.after('startChange', this._afterDateChange),
            this.after('finishChange', this._afterDateChange),
            this.after('slotChange', this._afterSlotChange),
            this.get('parent').after('offsetChange', this._afterParentDateChange, this)
        ];
        
        this.after('parentChange', this._afterParentChange); // Disconnect Events
    },
    
    /**
     * Synchronizes the DOM state with the attribute settings
     *
     * @method syncUI
     * @protected
     */
    syncUI : function () {
        this.get('contentBox').addClass(this.getClassName(this.get('category')));
    },

    /**
     * Destructor lifecycle implementation for the dp-timeline-event class.
     *
     * @method destructor
     * @protected
     */
    destructor: function() { 
    },
    
    /**
     * Recalculate duration and width after date changes
     * @method _afterDateChange
     * @private
     */
    _afterDateChange : function() {
        
        // Update calculated duration
        this.set('duration', Y.DP.TimelineUtil.rangeToDuration(this.get('start'), this.get('finish')));
    },
    
    /**
     * Recalculate offset after parent date changes
     * 
     * @method _afterParentDateChange
     * @param e {Event} ATTR Change Event
     * @private
     */
    _afterParentDateChange : function(e) {
        
        var parent = this.get('parent'), 
            leftOffset = parent.dateToLocalOffset(this.get('start'));
                     
                     
        this.get('boundingBox').set('style.left', leftOffset + 'px');
    },
    
    /**
     * Reset the Y position when the slot attribute changes
     * 
     * @method _afterSlotChange
     * @private
     */
    _afterSlotChange : function(e) {
        
        var topOffset = this.get('parent').slotToOffset(this.get('slot'));
        this.get('boundingBox').set('style.top', topOffset + 'px');
    },
    
    /**
     * Detach events when parent changes.
     * 
     * @method _afterParentChange
     * @private
     */
    _afterParentChange : function() {
        
        Y.Array.each(this._parentEventHandles, function(h) { h.detach(); });
    },
    
    /**
     * Array of handles to parent events.
     * 
     * @property _parentEventHandles
     * @type Array
     */
    _parentEventHandles : []

}, {

    /**
     * Required NAME static field, to identify the Widget class and 
     * used as an event prefix, to generate class names etc. (set to the 
     * class name in camel case).
     *
     * @property NAME
     * @type String
     * @static
     */
    NAME : "timelineEvent",

    /**
     * Static Object hash used to capture existing markup for progressive
     * enhancement.  Keys correspond to config attribute names and values
     * are selectors used to inspect the contentBox for an existing node
     * structure.
     *
     * @property HTML_PARSER
     * @type Object
     * @protected
     * @static
     */
    HTML_PARSER : {},

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
         * Starting date of the event (inclusive)
         * 
         * @attribute start
         * @type Date
         */
        start : {
            value : new Date(),
            setter : function(v) {
                return Lang.isDate(v) ? v : new Date(Date.parse(v));
                //return Lang.isString(v) ? Y.DataType.Date.parse(v) : v;
            }
        },
        
        /**
         * Ending date of the event (non inclusive)
         * 
         * @attribute finish
         * @type Date
         */
        finish : {
            value : new Date(),
            setter : function(v) {
                return Lang.isDate(v) ? v : new Date(Date.parse(v));
                //return Lang.isString(v) ? Y.DataType.Date.parse(v) : v;
            }
        },

        /**
         * Duration (in days) of the event
         * 
         * @attribute duration
         * @type Number
         */
        duration : {
            value : 0,
            validator : Lang.isNumber
        },
        
        /**
         * Title of the event
         * 
         * @attribute summary
         * @type String
         */
        summary : {
            value : '',
            validator : Lang.isString
        },
        
        /**
         * Category of the event, used for colouring
         * 
         * @attribute category
         * @type String
         */
        category : {
            value : '',
            validator : Lang.isString
        },
        
        /**
         * Vertical slot to fit this event into, parent will calculate this
         * 
         * @attribute slot
         * @type Number
         */
        slot : {
            value : undefined
        }

        // Use NetBeans Code Template "yattr" to add attributes here
    }
});

//YUI.add('dp-timeline', function(Y) {

/**
 * The timeline module produces a graphical representation of a timeline with events marked on the timeline
 * Similar to a gantt-chart but more generic.
 * 
 * @module gallery-dp-timeline
 */

    // shortcuts and constants
    var Lang = Y.Lang,
        Node = Y.Node,
        DataType = Y.DataType;

    /**
     * The timeline module produces a graphical representation of a timeline with events marked on the timeline,
     * Similar to a gantt-chart but more generic.
     * 
     * @class DP.Timeline
     * @extends Widget
     */
    Y.namespace('DP').Timeline = Y.Base.create( 'gallery-dp-timeline', Y.Widget, [Y.WidgetParent], {
        
        /**
         * Y.Widget Lifecycle: Initializer
         * 
         * @method initializer
         * @param config {Object} Configuration object
         * @constructor
         * @protected
         */
        initializer: function() {
                     
            this.calculateDateOffsets();
            this.publish("offsetChange", {});
        },

        /**
         * Destructor lifecycle implementation
         *
         * @method destructor
         * @protected
         */
        destructor : function() { },

        /**
         * Create the DOM structure.
         *
         * @method renderUI
         * @protected
         */
        renderUI : function() {
           
            // Background, Background highlights / markers
            this._nodeBackgroundContainer = this._renderBackgroundContainer();
            
            this._nodeHighlightsContainer = this._renderHighlightsContainer();
            this._renderBackgroundHighlights(this._nodeHighlightsContainer);
            this._nodeBackgroundContainer.append(this._nodeHighlightsContainer);

            // Events
            this._nodeEventContainer = this._renderEventContainer();
            
            // Instruct Y.WidgetChild to render child nodes to this container
            this._childrenContainer = this._nodeEventContainer; 
            
            // Append created nodes to this widget
            this.get('contentBox').append(this._nodeBackgroundContainer);
            //this.get('contentBox').append(this._nodeEventContainer);
            this._nodeBackgroundContainer.append(this._nodeEventContainer);
        },

        /**
         * Bind events to the ui
         * 
         * @method bindUI
         * @protected
         */
        bindUI : function() {
            
            // DOM EVENTS
            
            // Selection Highlighting
            
            this.get('contentBox').delegate("mouseenter", 
                Y.bind(this.onEventMouseEnter, this), 
                'div.yui3-gallery-dp-timeline-event-content');
            
            
            this.get('contentBox').delegate("mouseleave", 
                Y.bind(this.onEventMouseLeave, this), 
                'div.yui3-gallery-dp-timeline-event-content');
            
            
            //Y.on("key", Y.bind(this.onEventKeyDelete, this), document, "down:46, 8");

            // Set selection on mousedown
            this.on("gallery-dp-timeline-event:mousedown", this.onEventMouseClick);
            
            // ATTR EVENTS
            this.after('dateChange', this._afterDateChange);
            this.after('selectionChange', this._afterSelectionChange);
            
            // Y.WidgetParent CustomEvents
            this.after('addChild', this._afterChildrenChange);
            this.after('removeChild', this._afterChildrenChange);       
            
            this._ddNodeBackgroundContainer = new Y.DD.Drag({
                node: this.get('contentBox'),
                haltDown: false
            }).plug(Y.Plugin.DDConstrained, {
                constrain: 'view',
                stickX: true
            }).plug(Y.DP.LoopingDrag, {
                leftOffset: 700,
                rightOffset: 100,
                width: 600
            });
            
            
            this._ddNodeBackgroundContainer.loopingDrag.after("viewLoop", this._onViewLoop, this);
            
            //this._ddNodeBackgroundContainer.on("drag:align", this._onBackgroundDrag, this);
                          
            this.on("offsetChange", this.reflowEvents());
            
            this.on("offsetChange", function() {
                this._resetBackgroundHighlights();
                this._renderBackgroundHighlights(this._nodeHighlightsContainer);
            });
        },

        /**
         * Synchronizes the DOM state with the attribute settings
         *
         * @method syncUI
         */
        syncUI : function() {
            
            this.get('boundingBox').set('style.width', this.get('viewLength') * this.get('dayWidth') + 'px');
            this.get('contentBox').set('style.left', '400px'); // TODO temporary
        },
        
        // Rendering Stage
        
        /**
         * Render the container that will hold events
         *
         * @method _renderEventContainer
         * @return Node Event container, holding child events
         * @private
         */
        _renderEventContainer : function() {
            
            var eventContainer = Node.create(Y.substitute(this.get('tplEventContainer'), {
                className : this.getClassName('event', 'container')
            }));
            
            return eventContainer;
        },
        
        /**
         * Render the background objects
         *
         * @method _renderBackgroundContainer
         * @return Node Container for background (timeline static) objects
         * @private
         */
        _renderBackgroundContainer : function() {
            
            var nodeBg = Node.create(Y.substitute(this.get('tplBackgroundContainer'), {
                className : this.getClassName('background')
            }));
            nodeBg.set('style.width', this.get('length') * this.get('dayWidth') + 'px');
            nodeBg.set('style.left', this.dateToGlobalOffset(this.get('startDate')) + 'px');
            
            return nodeBg;
        },
                 
        /**
         * Render the background objects
         *
         * @method _renderHighlightsContainer
         * @return Node Container for highlights
         * @private
         */
        _renderHighlightsContainer : function() {
            
            var nodeBg = Node.create(Y.substitute(this.get('tplHighlightContainer'), {
                className : this.getClassName('highlights')
            }));
            nodeBg.set('style.width', this.get('length') * this.get('dayWidth') + 'px');
            nodeBg.set('style.left', this.dateToGlobalOffset(this.get('startDate')) + 'px');
            
            return nodeBg;
        },       
        
        /**
         * Render highlight objects on the background which indicate holidays.
         *
         * @method _renderBackgroundHighlights
         * @param parent {Node} Parent node to render into
         * @private
         */
        _renderBackgroundHighlights : function(parent) {
            
            Y.Array.each(this._dates, function(d){
            
                if (this.isDatePublicHoliday(d.date)) {

                    var nodeBgHl = Node.create(Y.substitute(this.get('tplBackgroundHighlight'), {
                        className : this.getClassName('background', 'highlight')
                    }));
                    nodeBgHl.set('style.left', this.dateToLocalOffset(d.date) + 'px');
                    nodeBgHl.set('style.width', this.get('dayWidth') + 'px');

                    parent.append(nodeBgHl);
                }
            
            }, this);
        },
        
        /**
         * Reset the background highlight container for new objects to be added.
         * 
         * 
         * @method _resetBackgroundHighlights
         * @private
         */
        _resetBackgroundHighlights : function() {
            
            this._nodeHighlightsContainer.set('innerHTML', '');
        },
        
        // Child Event Calculation / Modification
        
        /**
         * Get the first available slot if this event overlaps, WidgetChild version
         *
         * @method _getChildFreeSlot
         * @param e {Y.DP.TimelineEvent} Child event
         * @param leftedge {Number} Left edge of the child event
         * @return Number next available slot at the left edge
         * @private
         */
        _getChildFreeSlot : function(e, leftedge) {
            
            var slots = this.get('slots'),
                i;
            
            if (Lang.isNumber(e.get('slot'))) {
                return e.get('slot');
            }
            
            for (i = 0; i < slots.length; i++) {
                if (slots[i] <= leftedge) {
                    break;
                } else {
                }
            }
            
            return i;
        },
        
        /**
         * Re-flow events so that they are stacked where possible
         * 
         * @method reflowEvents
         * @public
         */
        reflowEvents : function() {
            
            var childLeftOffset,
                childSlot,
                slots;
            
            this.set('slots', []);
            
            this.each(function(c) {
                
                c.set('slot', undefined);
                childLeftOffset = this.dateToLocalOffset(c.get('start'));
                childSlot = this._getChildFreeSlot(c, childLeftOffset);
                
                c.set('slot', childSlot);
                slots = this.get('slots');
                slots[childSlot] = childLeftOffset + this.getEventWidth(c);
                
                this.set('slots', slots);
            }, this);
        },
        
        /**
         * Get the calculated width of an event object
         *
         * @method getEventWidth
         * @param e {Y.DP.TimelineEvent} Event child object
         * @private
         */
        getEventWidth : function(e) {
            
            return this.get('dayWidth') * e.get('duration');
        },
  
        
        /**
         * Remove the currently selected item (if any)
         *
         * @method removeSelected
         * @private
         */
        removeSelected : function() {
            
            // TODO this does not correctly determine whether the selection is a node or not.
            if (this.get('selection') !== undefined) {
                this.get('selection').remove();
            }
        },  

        // ATTR change hooks
        
        /**
         * Handle a change in child objects, from WidgetParent
         * 
         * @method _afterChildrenChange
         * @private
         */
        _afterChildrenChange : function() {
            
            this.reflowEvents();
        },
        
        /**
         * Handle date change, update UI
         *
         * @method afterDateChange
         * @param e {Event} Event facade (ATTR Change)
         * @private
         */
        _afterDateChange : function(e) {
            
            this.calculateDateOffsets();
        },
        
        /**
         * Handle selection change, update UI
         *
         * @method afterSelectionChange
         * @param e {Event} Event facade
         * @private
         */
        afterSelectionChange : function(e) {
        },
        
        /**
         * Handle the DD loopingdrag looping around on itself. This causes the date to shuffle by the amount that the
         * looping element is re-centered.
         * 
         * @method _onViewLoop
         * @param e {Event} Event facade
         * @private
         */
        _onViewLoop : function(e) {
            
            var loopSizeDays = 6;
            
            e.edge == 'rightedge' ? loopSizeDays = loopSizeDays * -1 : loopSizeDays;
            
            var adjustedDate = Y.DP.TimelineUtil.addDays(this.get('date'), loopSizeDays);
            this.set('date', adjustedDate);
        },
        
        /**
         * Handle drag events on the background node.
         * 
         * @method _onBackgroundDrag
         * @todo Investigate why DD.Drag will not allow interruption or reset of the pageX/offset
         * @param e {Event} Event facade { "pageX":"", "pageY":"", "scroll":"", "info":{start, xy, delta, offset}
         * @private
         */
        _onBackgroundDrag : function(e) {
            
            var midpointOffset = Math.ceil((this.get('dayWidth') * this.get('length')) / 2),
                leftTriggerOffset = midpointOffset,
                rightTriggerOffset = 0,
                myOffset = this.get('contentBox').getXY();
            
            if (myOffset[0] > leftTriggerOffset) {
                
                e.preventDefault();
                
               
                //this.get('contentBox').setXY(400,1);
                //this.get('contentBox').set('style.left', '400px');
                
                //
                this._ddNodeBackgroundContainer.actXY = [400,77];
                
                //this._ddNodeBackgroundContainer.stopDrag();
                this.get('contentBox').setXY([400,1]);
                


                var adjustedDate = Y.DP.TimelineUtil.subDays(this.get('date'), 4);
                this.set('date', adjustedDate);
                
                
                
                
            } else if (myOffset[1] < (rightTriggerOffset + 20)) { // +20 pixels because usually the drag goes past the rightedge before re-centering
                
                e.preventDefault();
                
                this.get('contentBox').set('style.left', '400px');
               
                this._ddNodeBackgroundContainer.stopDrag();
               
                this.set('date', Y.DP.TimelineUtil.addDays(this.get('date'), 4));
                
                this._ddNodeBackgroundContainer.start();
                
            }
        },
        
        // DOM EVENT HANDLERS
        
        /**
         * Handle mouse click on a child event, causing it to be selected
         * 
         * @method onEventMouseClick
         * @param e {Event} Event facade
         * @private
         */
        onEventMouseClick : function(e) {
               
           var item = e.target,
           domEvent = e.domEvent;

           if (this.get("multiple")) {
               if (domEvent.metaKey) {
                   item.set("selected", 1);
               } else {
                   this.deselectAll();
                   item.set("selected", 1);
               }
           } else {
               item.set("selected", 1);
           } 
        },
        
        /**
         * Handle mouse entering an event
         *
         * @method onEventMouseEnter
         * @private
         */
        onEventMouseEnter : function(e) {
            e.currentTarget.addClass(this.getClassName('event', 'over'));
        },
        
        /**
         * Handle mouse leaving an event
         *
         * @method onEventMouseLeave
         * @private
         */
        onEventMouseLeave : function(e) {
            e.currentTarget.removeClass(this.getClassName('event', 'over'));
        },
        
        /**
         * Delete selected event when a delete/backspace key is pressed
         *
         * @method onEventKeyDelete
         * @param e {Event} Event facade
         * @private
         */
        onEventKeyDelete : function(e) {
            
            this.get('selection').remove();
        },
        
        /**
         * Handle mouse doubleclick on background
         * 
         * @method onEventMouseDblClick
         * @private
         */
        onEventMouseDblClick : function() {
            
            this.add(this.get('childPrototype'));
        },
        
        // Date math functions
        
        /**
         * Re-calculate offsets after a date change or during initialization.
         * 
         * Pre-calculating dates and offsets allows plugins to easily place items along date boundaries or see when the cursor
         * hovers a certain date.
         * 
         * Local offsets are relative to the container, starting from 0px at the left hand side.
         * Global offsets are relative to the contentBox. 
         * 
         * @method calculateDateOffsets
         * @private
         */
        calculateDateOffsets : function() {
             
            var currentDate = this.get('startDate'),
                currentLength = this.get('length'),
                calcDate,
                dateLeftOffset,
                dateLeftOffsetLocal,
                i;
                
                
            this._dates = Array();

            // Iterate from date set + number of days in "length"
            for (i = 0; i < currentLength; i++) {

                calcDate = new Date(currentDate.getTime());
                calcDate.setDate(calcDate.getDate() + i);
                
                dateLeftOffset = this.dateToGlobalOffset(calcDate);
                dateLeftOffsetLocal = this.dateToLocalOffset(calcDate);

                this._dates.push({ 
                    date: calcDate, 
                    left: dateLeftOffset,
                    leftLocal: dateLeftOffsetLocal,
                    mid: dateLeftOffset + Math.ceil(this.get('dayWidth') / 2),
                    midLocal: dateLeftOffsetLocal + Math.ceil(this.get('dayWidth') / 2)
                });
                
            }
            
            
            this.fire('offsetChange');
        },
        
        /**
         * Get the last date that should be shown on the timeline
         *
         * @method getEndDate
         * @return Date Ending date for the timeline
         * @public
         */
        getEndDate : function() {
            
            // One day is deducted because the word length implies that the starting day is included in that range
            return Y.DP.TimelineUtil.addDays(this.get('date'), (this.get('length') - 1));
        },
        
        /**
         * Convert the supplied date into an x offset
         *
         * @method dateToOffset
         * @param d {Date} Date which will be compared to our date attribute
         * @deprecated In favour of dateToGlobalOffset (Relative to x:0 of the container/bounding box) and dateToLocalOffset (Relative to x:0 of the content)
         * @private
         */
        dateToOffset : function(d) {
            
            var originDate = this.get('date'),
                duration = Y.DP.TimelineUtil.rangeToDifference(originDate, d),
                offset = duration * this.get('dayWidth');
            
            
            return offset;
        },
        
        /**
         * Convert the supplied date into a global x offset
         * 
         * The offset will be relative to the viewport (the bounding box). Not the
         * starting date of the timeline itself.
         * 
         * This is used to calculate the size and length of backgrounds and day headings. Events should use
         * offsets relative to the background container with the method dateToLocalOffset()
         * 
         * @method dateToGlobalOffset
         * @param d {Date} Date which will be compared to our date attribute
         * @public
         */
        dateToGlobalOffset : function(d) {

            var originDate = this.get('date'),
                duration = Y.DP.TimelineUtil.rangeToDifference(originDate, d),
                offset = duration * this.get('dayWidth');
            
            
            return offset;
        },
        
        
        /**
         * Convert the supplied date into a local x offset
         * 
         * The offset will be relative to the container (event container, or day headings container). Not the
         * viewport.
         * 
         * This is used to calculate the size and offset of events, highlights, and generally any item that is a subnode of the containers
         * 
         * @method dateToLocalOffset
         * @param d {Date} Date which will be compared to our date attribute
         * @public
         */
        dateToLocalOffset : function(d) {
            
            var originDate = this.get('startDate'),
                duration = Y.DP.TimelineUtil.rangeToDifference(originDate, d),
                offset = duration * this.get('dayWidth');
            
            
            return offset;            
        },
        
        
        /**
         * Convert the supplied slot number into a y offset
         *
         * @method slotToOffset
         * @param slot {Number} Slot number
         * @private
         */
        slotToOffset : function(slot) {
            
            return slot * (this.get('eventHeight')) + slot * this.get('gutter');
        },

        /**
         * Determine if the given date is a public holiday or not
         *
         * @method isDatePublicHoliday
         * @param d {Date} Date to examine
         * @todo Support alternate datasource for public holidays in addition to fixed holidays
         * @return boolean True if date is a public holiday
         * @private
         */
        isDatePublicHoliday : function(d) {
            
            if (d.getDay() === 0 || d.getDay() === 6) {
                return true;
            } else {
                return false;
            }
        },
        
        /**
         * Array of dates included in the current view, with calculated offsets.
         *
         * @property _dates
         * @private
         */
        _dates : Array()

    }, {
        // @see Y.Widget.NAME
        NAME : "timeline",

        ATTRS : {
            
            // Y.WidgetParent Configuration
            
            /**
             * Default child class to use
             * 
             * @attribute defaultChildType
             * @type String
             * @readonly
             * @private
             */
            defaultChildType: {
                value: Y.DP.TimelineEvent
            },
            
            // DOM Creation Templates
            
            /**
             * Container for events that may span days
             *
             * @attribute tplEventContainer
             * @type String
             */
            tplEventContainer : {
                value : '<div class="{className}"></div>'
            },
            
            /**
             * Template for the background container which defines background style
             *
             * @attribute tplBackgroundContainer
             * @type String
             */
            tplBackgroundContainer : {
                value : '<div class="{className}"></div>'
            },
            
            
            /**
             * Template for the highlight container which holds highlighted days
             *
             * @attribute tplHighlightContainer
             * @type String
             */
            tplHighlightContainer : {
                value : '<div class="{className}"></div>'
            },
            
            /**
             * Template for background highlights, used for weekends
             *
             * @attribute tplBackgroundHighlight
             * @type String
             */
            tplBackgroundHighlight : {
                value : '<div class="{className}">&nbsp;</div>'
            },
            
            // Timeline Properties
            
            /**
             * Width of each day label
             *
             * @attribute dayWidth
             * @type Number
             */
            dayWidth : {
                value : 100,
                validator : Lang.isNumber
            },
            
            /**
             * Height of each event
             *
             * @attribute eventHeight
             * @type Number
             */
            eventHeight : {
                value : 20,
                validator : Lang.isNumber
            },
            
            /**
             * Starting date of the timeline
             * 
             * @attribute startDate
             * @type Date
             */
            startDate : {
                getter : function() {
                    var sd = Y.DP.TimelineUtil.subDays(this.get('date'), Math.ceil(this.get('length') / 2));
                    return sd;
                }
            },
            
            /**
             * Origin date of the timeline
             * This is the intended shown date.
             *
             * @attribute date
             * @type Date
             */
            date : {
                value : Date(),
                setter : function(v) {
                    var d = Lang.isDate(v) ? v : new Date(Date.parse(v));
                    return Y.DP.TimelineUtil.zeroTime(d);
                }
            },
            
            /**
             * The last date shown in the timeline
             *
             * @attribute endDate
             * @type Date
             */
            endDate : {
                getter : function() {
                    return Y.DP.TimelineUtil.addDays(this.get('date'), Math.ceil(this.get('length') / 2));
                }
            },
            
            /**
             * length of the timeline in days
             *
             * @attribute length
             * @type Number
             */
            length : {
                value : 16,
                validator : Lang.isNumber
            },
            
            /**
             * Number of days shown in the view
             * 
             * @attribute viewLength
             * @type Number
             */
            viewLength : {
                value : 8,
                validator : Lang.isNumber
            },
            
            /**
             * Number of days the viewport must scroll from the center date in order to
             * trigger a resetdate and reflow.
             * 
             * @attribute triggerLength
             * @type Number
             */
            triggerLength : {
                value : 4,
                validator : Lang.isNumber
            },
            
            /**
             * Hold the leftmost pixel of the rightmost event per slot to determine free slots
             *
             * @attribute slots
             * @type Array
             */
            slots : {
                value : Array(),
                validator : Lang.isArray
            },
            
            /**
             * Size of the gutter in pixels that lies between each slot
             *
             * @attribute gutter
             * @type Number
             */
            gutter : {
                value : 3,
                validator : Lang.isNumber
            }
        },

        HTML_PARSER : {

        }
    });
            
//}, '@VERSION@' ,{requires:['base']});


}, '@VERSION@' ,{requires:['base', 'widget', 'widget-parent', 'widget-child', 'widget-position', 'substitute', 'node', 'datatype', 'dd-drag', 'dd-constrain']});

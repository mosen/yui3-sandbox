YUI.add('gallery-dp-timeline-plugin-headings', function(Y) {

/**
 *
 *
 * @module gallery-dp-timeline-plugin-headings
 * @requires gallery-dp-timeline
 */

/* Any frequently used shortcuts, strings and constants */
var Lang = Y.Lang,
    Node = Y.Node,
    DataType = Y.DataType;

/**
 * Headings plugin for DP.Timeline provides headings which show dates at fixed intervals
 *
 * @class DP.TimelineHeadings
 * @extends Plugin
 */
Y.namespace('DP').TimelineHeadings = Y.Base.create( 'gallery-dp-timeline-plugin-headings', Y.Plugin.Base, [], {

    /**
     * Init
     *
     * @method initializer
     * @param config {Object} Configuration object
     * @protected
     * @constructor
     */
    initializer : function (config) {

        this.beforeHostMethod('render', this.onHostRender);
        this.afterHostEvent('offsetChange', Y.bind(this._afterDateChange, this));
    },

    /**
     * Render headings into host container.
     * 
     * @method onHostRender
     * @private
     */
    onHostRender : function() {
        Y.log("onHostRender", "info", "Y.DP.TimelineHeadings");
        
        this._nodeDayContainer = this._renderHeadings();
        this._renderHeadingsDays(this._nodeDayContainer);
        
        this.get('host').get('contentBox').insert(this._nodeDayContainer);
    },
    
    /**
     * Handle a date change and reset all the labels inside the headings
     * 
     * @method _afterDateChange
     * @private
     */
    _afterDateChange : function() {
        Y.log("_afterDateChange", "info", "Y.DP.TimelineHeadings");
        
        this._reflowHeadingsDays();
    },

    /**
     * Destructor lifecycle implementation for the dp-timeline-plugin-headings class.
     *
     * @method destructor
     * @protected
     */
    destructor: function() { },

    /**
     * Render the containers for the headings
     *
     * @method _renderHeadings
     * @return Y.Node Heading Container
     * @private
     */
    _renderHeadings : function() {
        //Y.log("_renderHeadings", "info", "Y.DP.Timeline");

        var nodeDayContainer = Node.create(Y.substitute(this.get('tplDayContainer'), {
           className : this.get('host').getClassName('day', 'container')
        }));

        return nodeDayContainer;
    },
    
    
    /**
     * Render all of the day labels
     *
     * @method _renderHeadingsDays
     * @param parent {Node} Parent to render into
     * @private
     */
    _renderHeadingsDays : function(parent) {
        //Y.log("_renderHeadingsDays", "info", "Y.DP.Timeline");

        var host = this.get('host'),
            datesShown = host._dates;

        Y.Array.each(datesShown, function(d) {
            
            var lblDay = Node.create(Y.substitute(this.get('tplDay'), {
                className : host.getClassName('day'),
                labelClassName : host.getClassName('day', 'label'),
                label : DataType.Date.format(d.date, {format:"%a %e"})
            }));

            lblDay.set('style.left', d.left + 'px');
            lblDay.set('style.width', host.get('dayWidth') + 'px');

            this._dates.push(lblDay);

            parent.append(lblDay);
        }, this);
    },
    
    /**
     * Recalculate the date labels, leaving the original containers intact
     * 
     * @method _reflowHeadingsDays
     * @private
     */
    _reflowHeadingsDays : function() {
        Y.log("_reflowHeadingsDays", "info", "Y.DP.TimelineHeadings");
        
        var host = this.get('host'),
            datesShown = host._dates,
            labelNode;
            

        for (i = 0; i < datesShown.length; i++) {
            labelNode = this._dates[i];
            
            //Y.log("_reflowLabelNode:HostDate:" + datesShown[i].date, "info", "Y.DP.TimelineHeadings");
            //Y.log("_reflowLabelNode:" + labelNode, "info", "Y.DP.TimelineHeadings");
            
            if (labelNode !== undefined) {
                var newLabel = DataType.Date.format(datesShown[i].date, {format:"%a %e"});
                //Y.log("_reflowHeadingsDays:newVal:" + newLabel , "info", "Y.DP.TimelineHeadings");
                labelNode.one('span').set('innerHTML', DataType.Date.format(datesShown[i].date, {format:"%a %e"}));
            }
                //one('span').set('content', DataType.Date.format(datesShown[i].date, {format:"%a %e"}))
        }
    },
    
    /**
     * Array of object literals containing dates to node references for headings
     * 
     * @property _dates
     * @type Array
     */
    _dates : Array()

}, {

    /**
     * The plugin namespace
     * 
     * @property Dp-timeline-plugin-headings.NS
     * @type String
     * @protected
     * @static
     */
    NS : "headings",


    /**
     * Static property used to define the default attribute configuration of
     * the Widget.
     *
     * @property Dp-timeline-plugin-headings.ATTRS
     * @type Object
     * @protected
     * @static
     */
    ATTRS : {
        
        /**
         * Container for days of the week labels
         *
         * @attribute tplDayContainer
         * @type String
         */
        tplDayContainer : {
            value : '<div class="{className}"></div>'
        },
        
        /**
         * Box containing label for day of the week
         *
         * @attribute tplDay
         * @type String
         */
        tplDay : {
            value : '<div class="{className}"><span class="{labelClassName}">{label}</span></div>'
        }
       // Use NetBeans Code Template "yattr" to add attributes here
    }
        

});



}, '@VERSION@' ,{requires:['base', 'plugin', 'gallery-dp-timeline']});

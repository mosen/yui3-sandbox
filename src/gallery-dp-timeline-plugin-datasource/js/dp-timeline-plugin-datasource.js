/**
 * The timeline datasource plugin allows you to use datasources with the timeline in order to supply events to be rendered
 * on the timeline.
 * 
 * @module dp-timeline-plugin-datasource
 * @requires gallery-dp-timeline, datasource
 */

//YUI.add('gallery-dp-timeline-plugin-datasource', function(Y) {
	
	var Lang = Y.Lang,
            Node = Y.Node;


	/**
         * The TimelineDataSource plugin allows you to get events from any supported datasource and render them on the timeline.
	 * 
	 * @class TimelineDataSource
	 * @extends Y.Base.Plugin
	 * @augments Y.DP.Timeline
	 * @param config {Object} Configuration object literal with initial attribute values
	 * @constructor
	 */
	Y.namespace('DP').TimelineDataSource = Y.Base.create( 'gallery-dp-timeline-plugin-datasource', Y.Plugin.Base, [], {
            
            initializer: function(config) {
                Y.log("init", "info", "Y.DP.TimelineDataSource");

                if(!Lang.isUndefined(config.initialRequest)) {
                    this.load({request:config.initialRequest});
                }
            },

            destructor : function() {},
            
            /**
             * Load the data from the specified datasource
             * 
             * @method load
             * @param config {Object} [optional] datasource configuration
             * @public
             */
            load : function(config) {
                
                config = config || {};
                config.request = config.request || this.get("initialRequest");
                config.callback = config.callback || {
                    success: Y.bind(this.onDataReturnInitializeTimeline, this),
                    failure: Y.bind(this.onDataReturnInitializeTimeline, this),
                    argument: this.get("host").get("state") //TODO
                };

                var ds = (config.datasource || this.get("datasource"));
                if(ds) {
                    ds.sendRequest(config);
                }
            },
            
            /**
             * Set the host data from a datasource response
             * 
             * @method onDataReturnInitializeTimeline
             * @param o {Object} datasource response object
             * @public
             */
            onDataReturnInitializeTimeline : function(o) {
                Y.log("onDataReturnInitializeTimeline", "info", "Y.DP.TimelineDataSource");
                
                this.get('host').add(o.response.results);
            }
            
        }, {
            
            NAME : "timelineDataSource",
            
            /**
             * @description Plugin namespace
             * @property NS
             * @type String
             * @protected
             */            
            NS : "datasource",
            
            ATTRS : {
            
                /**
                 * @description Initial request sent when the host is rendered.
                 * @attribute initialRequest
                 * @type String
                 */
                initialRequest : {
                    value : ""
                },

                /**
                 * @description Reference to the datasource instance being used for event data
                 * @attribute dataSource
                 * @type Y.DataSource
                 */
                datasource : {
                    value : null
                }
            
            }
            
        });
            
//}, '@VERSION@' ,{requires:['gallery-dp-timeline', 'datasource']});
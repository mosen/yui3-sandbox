/**
 * @module datatable-events
 * @author lsmith, eamonb
 * @requires datatable, plugin
 * 
 * Plugins by luke:
 * https://gist.github.com/1070837
 * https://gist.github.com/755582
 */

var Lang = Y.Lang;

/**
 * DataTableEvents extends the DataTable with cell/row/column click events
 *
 * @class DataTableEvents
 * @extends Plugin.Base
 */
function DataTableEvents() {
    DataTableEvents.superclass.constructor.apply(this, arguments);
}

Y.mix(DataTableEvents, {

    NS : "events",

    NAME : "events",

    ATTRS : {
        
        // Default events to listen to
        events: {
            value: ['keydown', 'keyup', 'mousedown', 'mouseup', 'click'], //'mouseover', 'mouseout', 'mouseenter', 'mouseleave'
            setter: function (val) {
                
                // All this wrangling is to prevent after subscription from
                // executing when replacing the current value with a new
                // array containing the same events.
                var current = this.get('events'),
                    keys = current ? Y.Array.hash(current) : {},
                    is_different = false,
                    newKeys, k;

                val = Y.Array(val);
                newKeys = Y.Array.hash(val);

                for (k in newKeys) {
                    if (keys.hasOwnProperty(k)) {
                        delete keys[k];
                    } else {
                        is_different = true;
                        break;
                    }
                }

                is_different || (is_different = Y.Object.size(keys));

                if (!is_different) {
                    Y.log("new value for events is identical, not setting", "debug", "gallery-plugin-datatable-events");
                    return Y.Attribute.INVALID_VALUE; // This is seemingly the only way to prevent attrChange from happening in a setter
                } else {
                    return val;
                }
            }
        },

        // Elements that we will broadcast for
        tags: {
            value: [
                'table', 'thead', 'tbody',
                {tag: 'tr', name: 'row'},
                {tag: 'th', name: 'cell'},
                {tag: 'td', name: 'cell'}
            ]
        }
    }    
});

Y.extend(DataTableEvents, Y.Plugin.Base, {

    /**
     * Initializer runs when the plugin is constructed or plugged into the host instance.
     *
     * @method initializer
     * @protected
     */
    initializer : function () {
        this.afterHostEvent('render', this._bindEvents, this);
        this.after('eventsChange', this._afterEventsChange);
    },

    /**
     * Destructor runs when the plugin is unplugged
     * Base will automatically detach afterHostEvent/afterHostMethod methods.
     *
     * @method destructor
     * @public
     */
    destructor: function() { 
        this._handle && this._handle.detach();
        delete this._handle;    
    },
    
    /**
     * Publish node events
     * 
     * This is required to enable bubbling to the host
     *
     * @method _publishEvents
     * @protected
     */
    _publishEvents : function() {
        Y.log("_publishEvents", "info", this.NAME);
    },

    /**
     * Delegate valid table events to the DataTable content box.
     * 
     * We delegate the contentBox because there may be multiple table nodes
     * eg. DataTableScroll
     * 
     * @method _bindEvents
     * @protected
     */
    _bindEvents: function () {
        var events  = this.get('events'),
            tags    = this.get('tags'), // filters?
            tag_map = {},
            filter  = [],
            i, tag;
            
        for (i = tags.length - 1; i >= 0; --i) {
            tag = tags[i];
            if (Lang.isString(tag)) {
                tag = {tag: tag, name: tag};
            }
            tag_map[tag.tag] = tag;
            filter.push(tag.tag);
        }

        this._tag_map = tag_map;
        this._handle = this.get('host').get('contentBox')
            .delegate(events, this._handleEvent, filter.join(','), this);
    },

    /**
     * Handle a change in event spec
     * 
     * @method _afterEventsChange
     * @param e {Event} ATTR change event
     * @protected
     */
    _afterEventsChange: function (e) {
        this._bindEvents(e.newVal);
    },
    
    /**
     * Handle an event being fired
     * 
     * @method _handleEvent
     * @param e {Event} Event facade
     * @protected
     */
    _handleEvent: function (e) {
        if (/^mouse(?:over|out|enter|leave)$/.test(e.type)) {
            this._handleHoverEvent(e);
        } else {
            this._notify(e);
        }
    },

    /**
     * Handle a hover event being fired
     * 
     * @method _handleHoverEvent
     * @param e {Event} Event facade
     * @protected
     */
    _handleHoverEvent: function (e) {
        Y.log("hover event", "info", this.NAME);
    },
    
    /**
     * Fire custom DataTable events
     * 
     * @method _notify
     * @param e {Event} Event facade
     * @protected
     */
    _notify: function (e) {
        var node    = e.currentTarget,
            table   = this.get('host'),
            thead   = table._theadNode,
            type    = e.type.charAt(0).toUpperCase() + e.type.slice(1),
            tag     = node.get('tagName').toLowerCase(),
            inThead = node.getData('inThead'),
            //inThead = thead.contains(node),
            tag_map = this._tag_map,
            payload = {
                event: e,
                target: e.target,
                currentTarget: node
            };
        
        // consider re-adding thead data to prevent node.contains taking too long
        if (!inThead && inThead !== false) {
            inThead = (node !== thead && thead.contains(node));

            node.setData('inThead', inThead);
        }

        if (tag_map[tag]) {
            tag = tag_map[tag].name;
        }

        if (inThead) {
            tag = 'thead' + tag.charAt(0).toUpperCase() + tag.slice(1);
        }

        // Extra convenience payload
        switch (tag) {
            case 'cell':
                payload.record = table.get('recordset').getRecord(node.get('parentNode').get('id'));
                payload.column = table.get('columnset').idHash[node.getAttribute('headers')];
                payload.value = payload.record.getValue(payload.column.get('key'));                    
                break;
                
            case 'row':
                payload.record = table.get('recordset').getRecord(node.get('id'));
                break;
                
            case 'theadCell':
                payload.column = table.get('columnset').idHash[node.get('id')];
                break;
        }
        
        // In gist #1, preventing cellClick also prevents rowClick etc, maybe we can have this kind of cascading relationship here?
        // Somehow cancelling a custom event here will also stop the DOM propagation, which indicates that
        // delegated custom events are forced to be processed sequentially, or bubble sequentially.

        // cellClick, theadCellClick, tableKeydown etc
        Y.log("Emitting " + tag + type);
        //console.log(payload);
        
        // Fire the event, stop DOM propagation if the handler cancels
        this.fire(tag + type, payload) || e.stopPropagation(); // or fire(.., { event: e })? or new EventFacade?
    }
});

Y.namespace("Plugin").DataTableEvents = DataTableEvents;

if (Y.Plugin.addHostAttr) {
    
    // This will be supported in 3.4.0 
    Y.Plugin.addHostAttr('tableEvents', Y.DataTable.Base,
        Y.Plugin.DataTableEvents,
        function (val) {
            if (Y.Lang.isString(val) || Y.Lang.isArray(val)) {
                return {events: Y.Array(val)};
            }
            return val;
        });
}
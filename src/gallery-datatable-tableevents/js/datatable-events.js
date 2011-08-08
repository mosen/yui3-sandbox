/**
 * @module gallery-datatable-tableevents
 * @author lsmith, eamonb
 * @requires datatable
 * 
 * Based upon proof of concepts by lsmith:
 * 
 * https://gist.github.com/1070837
 * https://gist.github.com/755582
 */

var Lang = Y.Lang;

/**
 * DataTableEvents extends the DataTable with cell/row/column events
 *
 * @class DataTableEvents
 * @extends DataTable.Base
 */
function DataTableEvents() {
    
}

DataTableEvents.ATTRS = {
        
    // Default events to listen to
    events: {
        value: ['keydown', 'keyup', 'mousedown', 'mouseup', 'click', 'mouseover', 'mouseout', 'mouseenter', 'mouseleave', 'hover'],
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
};

DataTableEvents.prototype = {

    /**
     * @method initializer
     * @protected
     */
    initializer : function () {
        Y.log("init", "debug", "gallery-datatable-tableevents");
        
        this.after('render', this._bindTableEvents, this);
        this.after('eventsChange', this._afterEventsChange);
    },

    /**
     * @method destructor
     * @protected
     */
    destructor: function() { 
        this._handle && this._handle.detach();
        delete this._handle;    
    },

    /**
     * Delegate valid table events to the DataTable content box.
     * 
     * We delegate the contentBox because there may be multiple table nodes
     * eg. DataTableScroll
     * 
     * @method _bindTableEvents
     * @protected
     */
    _bindTableEvents: function () {
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
        
        Y.log("Delegating table events", "info", "gallery-datatable-tableevents");

        this._tag_map = tag_map;
        this._handle = this.get('contentBox')
            .delegate(events, this._handleTableEvent, filter.join(','), this);
    },

    /**
     * Handle a change in event spec
     * 
     * @method _afterEventsChange
     * @param e {Event} ATTR change event
     * @protected
     */
    _afterEventsChange: function (e) {
        this._bindTableEvents(e.newVal);
    },
    
    /**
     * Handle an event being fired
     * 
     * @method _handleTableEvent
     * @param e {Event} Event facade
     * @return undefined
     * @protected
     */
    _handleTableEvent: function (e) {
        Y.log(e.type, "debug", "gallery-datatable-tableevents");
        
        // We need to generate more information about the node in order to use the
        // correct event name and set up the payload, this is done here.
        var tag_map = this._tag_map,
            tag = e.currentTarget.get('tagName').toLowerCase(),
            info = {
                node: e.currentTarget, // duplicate, not really needed
                type: e.type.charAt(0).toUpperCase() + e.type.slice(1), // Titlecase event
                tag: tag,
                tagHuman: tag_map[tag] ? tag_map[tag].name : tag,
                relatedTag: (e.relatedTarget === null) ? '' : e.relatedTarget.get('tagName').toLowerCase(),
                inThead : e.currentTarget.getData('inThead'),
                isHover :  /^mouse(?:over|out|enter|leave)$/.test(e.type) ? true : false
            };
            
        if (!info.inThead && info.inThead !== false) {
            info.inThead = (info.node !== this._theadNode && this._theadNode.contains(info.node));
            info.node.setData('inThead', info.inThead);
        }
        
        this._notifySubscribers(e, info);
    },
    
    /**
     * Fire the Table Event
     *
     * @method _fireTableEvent
     * @param type {String} Event type to fire
     * @param payload {Object} Payload for event facade
     * @returns {Boolean} false if event propagation was stopped.
     * @protected
     */
    _fireTableEvent : function(type, payload) {
       Y.log("Emitting " + type, "debug", "Y.DataTable.Features.TableEvents");
        
       // Fire the event, stop DOM propagation if the handler cancels
       if (this.fire(type, payload) === true) {
               return true;
       } else {
               payload.event.stopPropagation();
               return false;
       }
    },
    
    /**
     * Determine table events to fire, and notify subscribers
     *
     * @method _notifySubscribers
     * @param e {Event} Event facade
     * @param info {Object} Extra information extracted from the event
     * @returns undefined
     * @protected
     */
    _notifySubscribers : function(e, info) {
        var columnId, relatedColumnId,
            payload = {
                event: e,
                currentTarget: e.currentTarget,
                node: info.node,
                inThead: info.inThead,
                header: (info.tag == 'th')
            }, eventWillPropagate;

        Y.log("_notifySubscribers", "info", "gallery-datatable-tableevents");
        
        // For hover events, resolve the relatedTarget parent column
        if (info.isHover) {
            if (info.tag == 'td' || info.tag == 'th') {
                if (this._fireTableEvent(info.tagHuman + info.type, payload)) {
                    // continue if cellEvent did not stop propagation

                    // Fire columnHover if relatedTarget resolves to different column
                    columnId = (info.tag == 'td') ? info.node.getAttribute('headers') : info.node.get('id');
                    relatedColumnId = this.resolveRelatedColumn(e.relatedTarget);

                    if (columnId != relatedColumnId) {
                        this._fireTableEvent('column' + info.type, payload);
                    }               
                }
                
            } else if (info.tag == 'tr') {
                if (e.relatedTarget === null || info.node !== e.relatedTarget.ancestor('tr')) {
                    this._fireTableEvent(info.tagHuman + info.type, payload);
                }
            }
        } else {
            eventWillPropagate = this._fireTableEvent(info.tagHuman + info.type, payload);
            if (eventWillPropagate && (info.tag == 'td' || info.tag == 'th')) {
                this._fireTableEvent('column' + info.type, payload);
            }
        }
    },
    
    /**
     * Given a relatedTarget, resolve the column id that it belongs to.
     *
     * @method resolveRelatedColumn
     * @param relatedTarget {Node} related target that was supplied with hover event.
     * @returns {String} Column ID or null if no related column was found
     * @public
     */
    resolveRelatedColumn : function(relatedTarget) {
        var relParent,
            relTag = (relatedTarget !== null) ? relatedTarget.get('tagName').toLowerCase() : null,
            relColumnId = null;

        switch (relTag) {
            case 'td':
                relColumnId = relatedTarget.getAttribute('headers');
                break;
                
            case 'th':
                relColumnId = relatedTarget.get('id');
                break;
                
            case 'div':
                relParent = relatedTarget.get('parentNode');

                if (relParent.get('tagName').toLowerCase() == 'th') {
                    relColumnId = relParent.get('id');
                } else if (relParent.get('tagName').toLowerCase() == 'td') {
                    relColumnId = relParent.getAttribute('headers');
                }

                break;       
        }

        return relColumnId;
    }
};

Y.namespace('DataTable.Features').TableEvents = DataTableEvents;

Y.Base.mix(Y.DataTable.Base, [Y.DataTable.Features.TableEvents]);
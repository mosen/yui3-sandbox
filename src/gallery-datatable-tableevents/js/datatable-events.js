/**
 * @module datatable-events
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
     * Initializer runs when the plugin is constructed or plugged into the host instance.
     *
     * @method initializer
     * @protected
     */
    initializer : function () {
        this.after('render', this._bindEvents, this);
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
        this._handle = this.get('contentBox')
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
        //Y.log(e.type, "debug", "gallery-datatable-tableevents");
        
        // We need to generate more information about the node in order to use the
        // correct event name and set up the payload, this is done here.
        var tag_map = this._tag_map,
            tag = e.currentTarget.get('tagName').toLowerCase(),
            info = {
                node: e.currentTarget, // duplicate, not really needed
                type: e.type.charAt(0).toUpperCase() + e.type.slice(1), // Titlecase event
                tag: tag,
                tagHuman: tag_map[tag] ? tag_map[tag].name : tag,
                relatedTag: (e.relatedTarget == null) ? '' : e.relatedTarget.get('tagName').toLowerCase(),
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
     * @param
     * @returns
     * @protected
     */
    _fireTableEvent : function(type, payload) {
       Y.log("Emitting " + type, "debug", "Y.DataTable.Features.TableEvents");
        
       // Fire the event, stop DOM propagation if the handler cancels
       this.fire(type, payload) || payload.event.stopPropagation(); // or fire(.., { event: e })? or new EventFacade?        
    },
    
    /**
     * 
     *
     * @method _notifySubscribers
     * @param e {Event} Event facade
     * @param info {Hash} Extra information extracted from the event
     * @returns
     * @protected
     */
    _notifySubscribers : function(e, info) {
        var table = this,
            extra = this._getRelatedObjects(e, info),
            columnId, relatedColumnId,
            payload = {
                event: e,
                currentTarget: e.currentTarget,
                extra: extra,
                inThead: info.inThead,
                header: (info.tag == 'th')
            };

        //Y.log("_notifySubscribers", "info", "gallery-datatable-tableevents");
        
        // For hover events, resolve the relatedTarget parent column
        if (info.isHover) {
            if (info.tag == 'td' || info.tag == 'th') {
                this._fireTableEvent(info.tagHuman + info.type, payload); // cellEvent
                // TODO: if cell event stops propagation, do not broadcast column
                
                // Fire columnHover if relatedTarget resolves to different column
                columnId = (info.tag == 'td') ? info.node.getAttribute('headers') : info.node.get('id');
                relatedColumnId = this.resolveRelatedColumn(e.relatedTarget);
                
                if (columnId != relatedColumnId) {
                    payload.cells = function() { // Convenience closure gives access to column cells
                        return table.get('contentBox').all('td[headers=' + columnId + ']');
                    }
                    
                    this._fireTableEvent('column' + info.type, payload);
                }               
                
            } else if (info.tag == 'tr') {
                if (e.relatedTarget == null || info.node !== e.relatedTarget.ancestor('tr')) {
                    this._fireTableEvent(info.tagHuman + info.type, payload);
                }
            }
        } else {
            this._fireTableEvent(info.tagHuman + info.type, payload);
            if (info.tag == 'td' || info.tag == 'th') {
                // TODO: if previous event stops propagation, do not broadcast column
                this._fireTableEvent('column' + info.type, payload);
            }
        }
    },
    
    /**
     * Grab object references for related items depending on the node firing the event.
     *
     * Provides a convenient way of retrieving associated data without invoking
     * selectors/api
     *
     * @method _getRelatedObjects
     * @param e {Event} Event facade
     * @param info {Hash} Extra information generated from the event
     * @returns {Hash} associated objects and values
     * @protected
     */
    _getRelatedObjects : function(e, info) {
        var tag = info.tagHuman,
            node = info.node,
            table = this,
            payload = {};
        
        //Y.log("_getRelatedObjects", "info", "gallery-datatable-tableevents");
        
        // Extra convenience payload
        switch (tag) {
            case 'cell':
                payload.record = table.get('recordset').getRecord(node.get('parentNode').get('id'));
                
                if (info.inThead) { // thead cells and tbody cells are treated equally
                    payload.column = table.get('columnset').idHash[node.get('id')];
                } else {
                    payload.column = table.get('columnset').idHash[node.getAttribute('headers')];
                    payload.value = payload.record.getValue(payload.column.get('key'));
                }
                break;
                
            case 'row':
                payload.record = table.get('recordset').getRecord(node.get('id'));
                break;
        }
        
        return payload;
    },
    
    /**
     * Given a relatedTarget, resolve the column id that it belongs to.
     *
     * @method resolveRelatedColumn
     * @param relatedTarget {Node} related target that was supplied with hover event.
     * @returns {String} Column ID
     * @public
     */
    resolveRelatedColumn : function(relatedTarget) {
        var relParent,
            relTag = (relatedTarget != null) ? relatedTarget.get('tagName').toLowerCase() : null,
            relColumnId = null;
        
        //Y.log("_resolveRelatedColumn", "info", "gallery-datatable-tableevents");
        
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
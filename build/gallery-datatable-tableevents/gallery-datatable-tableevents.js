YUI.add('gallery-datatable-tableevents', function(Y) {

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
        
        if (/^mouse(?:over|out|enter|leave)$/.test(e.type)) {
            this._handleHoverEvent(e);
        } else {
            this._notify(e);
        }
    },

    /**
     * Handle a hover event being fired
     * 
     * rowHover will fire on every delegated cellHover event, so
     * we need to detect when the row has changed, lsn says use
     * relatedTarget
     * 
     * @method _handleHoverEvent
     * @param e {Event} Event facade
     * @protected
     */
    _handleHoverEvent: function (e) {
        
        var node        = e.currentTarget,
            relTarget   = e.relatedTarget,
            type        = e.type.charAt(0).toUpperCase() + e.type.slice(1),
            tag         = node.get('tagName').toLowerCase(),
            relTag      = (relTarget == null) ? '' : relTarget.get('tagName').toLowerCase(),
            columnId    = '',
            relColumnId = '',
            relParent, column, payload, table;
        
        // cell|theadCell event
        if (tag == 'td' || tag == 'th') {

            this._notify(e);

            // columnEvent

            // Resolve Column ID for relatedTarget:
            // I'm testing all possible related targets here because the div
            // liner may not exist (maybe using some custom formatter)
            
            switch (relTag) {
                case 'td':
                    relColumnId = relTarget.getAttribute('headers');
                    break;
                case 'th':
                    relColumnId = relTarget.get('id');
                    break;
                case 'div':
                    relParent = relTarget.get('parentNode');

                    if (relParent.get('tagName').toLowerCase() == 'th') {
                        relColumnId = relParent.get('id');
                    } else if (relParent.get('tagName').toLowerCase() == 'td') {
                        relColumnId = relParent.getAttribute('headers');
                    }

                    break;       
            }
            

            columnId = (tag == 'td') ? node.getAttribute('headers') : node.get('id');

            if (columnId != relColumnId) {
                column = this.get('columnset').idHash[columnId];
                
                
                table = this;
                
                payload = {
                    event: e,
                    target: e.target,
                    currentTarget: node,
                    column: column,
                    cells: function() { // Convenience closure to retrieve cells by selector
                        return table.get('contentBox').all('td[headers=' + columnId + ']');
                    }
                };

                // Fire the event, stop DOM propagation if the handler cancels
                this.fire('column' + type, payload) || e.stopPropagation(); // or fire(.., { event: e })? or new EventFacade?
            }
            
        // rowEvent       
        } else if (tag == 'tr') {
            if (relTarget == null || node !== relTarget.ancestor('tr')) {
                this._notify(e);
            }            
        }
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
            table   = this,
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
        // TODO: no columnClick|columnKey etc? can't yet see a use case
        //console.log(payload);
        
        // Fire the event, stop DOM propagation if the handler cancels
        this.fire(tag + type, payload) || e.stopPropagation(); // or fire(.., { event: e })? or new EventFacade?
    }
};

Y.namespace('DataTable.Features').TableEvents = DataTableEvents;

Y.Base.mix(Y.DataTable.Base, [Y.DataTable.Features.TableEvents]);


}, '@VERSION@' ,{optional:['pluginattr'], requires:['datatable']});

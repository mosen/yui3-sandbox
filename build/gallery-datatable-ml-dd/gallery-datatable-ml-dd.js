YUI.add('gallery-datatable-ml-dd', function(Y) {
/**
 * @module DatatableMlDd
 * @author eamonb
 * @requires gallery-datatable-ml, dd, dd-drag, dd-drop, dd-proxy, dd-delegate
 */
var YgetClassName = Y.ClassNameManager.getClassName,

    DATATABLE = "datatable",
    DATATABLE_TBODY_DRAGGING = YgetClassName(DATATABLE, 'tbody', 'dragging'),

    DATATABLE_ROW_DROPTARGET = YgetClassName(DATATABLE, 'row', 'droptarget'),
    DATATABLE_DIV_DROPTARGET = YgetClassName(DATATABLE, 'droptarget'),
    DATATABLE_DIV_DROPTARGET_OVER = YgetClassName(DATATABLE, 'droptarget', 'over'),

    // Drop target template
    DROP_TEMPLATE = '<tr class="{className}"><td colspan="{colSpan}"><div class="{divClassName}">&nbsp;</div></td></tr>';

/**
 * DataTable DragDrop plugin
 * 
 * Allows the user to drag and drop rows
 *
 * @namespace Y.DP
 * @class DatatableMlDd
 * @extends Plugin.Base
 */
function DatatableMlDd() {
    DatatableMlDd.superclass.constructor.apply(this, arguments);
}

Y.mix(DatatableMlDd, {

    NS : "dd",

    NAME : "datatableMlDd",

    /**
     * The attribute configuration represents the core user facing state of 
     * the plugin.
     *
     * @property ATTRS
     * @type Object
     * @protected
     * @static
     */
    ATTRS : {

    }    
});

Y.extend(DatatableMlDd, Y.Plugin.Base, {

    /**
     * Initializer runs when the plugin is constructed or plugged into the host instance.
     *
     * @method initializer
     * @param config {Object} Configuration object
     */
    initializer : function (config) {

        // Fired when a row is dropped, by default re-orders the modellist
        this.publish('rowDropped', { defaultFn: Y.bind(this._defFnRowDropped, this) });

        // Fired when the modellist has been re-ordered
        this.publish('reorder');

        this._initDelegates();
        this.get('host').after('modelsRendered', this._syncDelegates, this); // Re-sync event delegate on Re-render
        this.get('host').after('render', this._bindDelegates, this);
    },

    /**
     * Destructor runs when the plugin is unplugged
     * Base will automatically detach afterHostEvent/afterHostMethod methods.
     *
     * @method destructor
     */
    destructor: function() { 
        this._delegate.destroy();
    },

    /**
     * Initialize delegate DD objects.
     *
     * @method _initDelegates
     * @return undefined
     * @protected
     */
    _initDelegates : function() {

        var dtContentNode = this.get('host').get('contentBox'); //.one('.yui3-datatable-data')

        this._delegate = new Y.DD.Delegate({
            container: dtContentNode,
            nodes: '.yui3-datatable-data tr', // TODO: tr nodes in body need class name to avoid selecting head nodes.
            target: true, // Drag nodes are also targets
            dragConfig : {
                plugins: [
                    { fn: Y.Plugin.DDProxy, cfg: { moveOnEnd: false }},
                    { fn: Y.Plugin.DDConstrained, cfg: { constrain2node: dtContentNode }}
                ]
            }
        });
    },

    /**
     * Bind delegate DD Drag object to event handlers.
     *
     * @method _bindDelegates
     * @return undefined
     * @protected
     */
    _bindDelegates : function() {
        this._delegate.on('drag:start', this._uiSetDragging, this); // Highlight drop targets when we start dragging
        this._delegate.on('drag:end', this._uiSetNotDragging, this); // Remove highlights
        this._delegate.on('drag:over', this._uiSetOver, this);
        this._delegate.on('drag:exit', this._uiSetOut, this);
        this._delegate.on('drag:drophit', this._updateOrder, this);
    },

    /**
     * Re-sync delegate drag objects when the parent table re-renders.
     *
     * @method _syncDelegates
     * @protected
     */
    _syncDelegates : function() {
        this._delegate && this._delegate.syncTargets();
    },

    /**
     * Row has been dropped on a valid target. Update the list order.
     *
     * @method _updateOrder
     * @param e {Object} Event facade of Y.DD.Delegate
     * @private
     */
    _updateOrder : function(e) {
        e.drop.get('node').insert(e.drag.get('node'), 'before');
        e.drop.get('node').removeClass(DATATABLE_DIV_DROPTARGET_OVER);

        this.fire('rowDropped', {
            drag: e.drag,
            drop: e.drop,
            source: e.drag.get('node'),
            dest: e.drop.get('node')
        });
    },

    /**
     * A table row has been dragged over a valid target.
     * Highlight the target.
     *
     * @method _uiSetOver
     * @param e {Object} Event facade of Y.DD.Delegate
     * @private
     */
    _uiSetOver : function(e) {
        e.drop.get('node').addClass(DATATABLE_DIV_DROPTARGET_OVER);
    },

    /**
     * A table row has exited a valid drop target.
     * Un-highlight that target if required.
     *
     * @method _uiSetOut
     * @param e {Object} Event facade of Y.DD.Delegate
     * @private
     */
    _uiSetOut : function(e) {
        e.drop.get('node').removeClass(DATATABLE_DIV_DROPTARGET_OVER);
    },

    /**
     * Dragging has started.
     * Apply a class to the container to indicate this.
     *
     * @method _uiSetDragging
     * @param e {Object} Event facade of Y.DD.Delegate
     * @private
     */
    _uiSetDragging : function(e) {

        var tbody = this.get('host').get('contentBox').one('tbody.yui3-datatable-data');
        tbody.addClass(DATATABLE_TBODY_DRAGGING);
    },

    /**
     * Dragging has stopped.
     * Remove class from container.
     *
     * @method _uiSetNotDragging
     * @param e {Object} Event facade of Y.DD.Delegate
     * @private
     */
    _uiSetNotDragging : function(e) {

        var tbody = this.get('host').get('contentBox').one('tbody.yui3-datatable-data');
        tbody.removeClass(DATATABLE_TBODY_DRAGGING);
    },

    /**
     * Default handler when the datatable has been reordered due to a drag-drop
     *
     * @method _defFnRowDropped
     * @param e {Object} Event facade (ours)
     * @private
     */
    _defFnRowDropped : function(e) {
        var ml = this.get('host').get('models');

        // Gather the order represented by the datatable (Which is what the user expects).
        var tbodyNode = this.get('host').get('contentBox').one('tbody.yui3-datatable-data'),
            trNodes = tbodyNode.all('tr'),
            i = 0;

        trNodes.each(function(tr) {
            ml.getByClientId(tr.get('id')).set('order', i);
            i++;
        });

        this.fire('reorder');
    }
});

Y.namespace("DP").DatatableMlDd = DatatableMlDd;
}, '1.0.0' , {requires: ['gallery-datatable-ml', 'dd', 'dd-drag', 'dd-proxy', 'dd-delegate']});
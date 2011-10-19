/**
 *
 * @module DatatableMlSelection
 * @author eamonb
 * @requires gallery-datatable-ml
 */
var YgetClassName = Y.ClassNameManager.getClassName;

/**
 * DataTable selection plugin
 * 
 * Provides an API to make selections and get the current selection.
 * 
 * Originally designed to use recordset-indexer which was found to be unsuitable
 * for carrying the selection.
 *
 * @namespace Y.DP
 * @class DatatableMlSelection
 * @extends Plugin.Base
 */
function DatatableMlSelection() {
    DatatableMlSelection.superclass.constructor.apply(this, arguments);
}

Y.mix(DatatableMlSelection, {

    NS : "selection",

    NAME : "selection",

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
        
        selection : {
            value : [],
            validator : Y.Lang.isArray
        },

        multiple : {
            value : false,
            validator : Y.Lang.isBoolean
        }
    }    
});

Y.extend(DatatableMlSelection, Y.Plugin.Base, {

    /**
     * Initializer runs when the plugin is constructed or plugged into the host instance.
     *
     * @method initializer
     * @param config {Object} Configuration object
     */
    initializer : function (config) {
        
        Y.log("init", "debug", "gallery-datatable-ml-selection");
        
        this.onHostEvent("rowClick", this._onHostRowClick);
        
        this.onHostEvent("rowMouseover", this._onHostRowMouseenter);
        this.onHostEvent("rowMouseout", this._onHostRowMouseleave);
        
        this.after('selectionChange', this._uiSetSelection);
    },

    /**
     * Destructor runs when the plugin is unplugged
     * Base will automatically detach afterHostEvent/afterHostMethod methods.
     *
     * @method destructor
     */
    destructor: function() { 
    
    },
    
    /**
     * Change item selection on host row click
     *
     * @method _onHostRowClick
     * @param e {Event} attrChange event facade
     * @returns undefined
     * @protected
     */
    _onHostRowClick : function(e) {        
        var rowClicked = e.node;

        Y.log("_onHostRowClick", "info", "gallery-datatable-ml-selection");

        if (!e.inThead) {
            this.select(rowClicked);
        }
    },
    
    /**
     * Highlight row on mouse enter
     *
     * @method _onHostRowMouseenter
     * @param e {Event} attrChange event facade
     * @returns
     * @protected
     */
    _onHostRowMouseenter : function(e) {
        Y.log("_onHostRowMouseenter", "info", "gallery-datatable-ml-selection");

        e.event.currentTarget.addClass(YgetClassName('datatable', 'row', 'over'));
    },
    
    /**
     * Remove highlighting on row mouse leave
     *
     * @method _onHostRowMouseleave
     * @param e {Event} attrChange event facade
     * @returns
     * @protected
     */
    _onHostRowMouseleave : function(e) {
        Y.log("_onHostRowMouseleave", "info", "gallery-datatable-ml-selection");
        
        e.event.currentTarget.removeClass(YgetClassName('datatable', 'row', 'over'));
    },
    
    /**
     * Update the UI to reflect the selection
     *
     * @method _uiSetSelection
     * @param e {Event} ATTRChange Event Facade
     * @returns
     * @protected
     */
    _uiSetSelection : function(e) {
        Y.log("_uiSetSelection", "info", "gallery-datatable-ml-selection");
        
        this.get('host')._tableNode.all('.'+YgetClassName('datatable', 'row', 'selected')).removeClass(YgetClassName('datatable', 'row', 'selected'));
        
        Y.Array.each(e.newVal, function(trId) {
            Y.Node.one('TR#' + trId).addClass(YgetClassName('datatable', 'row', 'selected'));
        }, this);
    },
    
    /**
     * Select row(s)/record(s)
     * 
     * By default does not invert your selection when selected twice
     *
     * @method select
     * @param selector {String|Array} What to select
     * @param isInverted {Boolean} Whether to invert the selection of things that are already selected
     * @returns undefined
     * @public
     */
    select : function(selector, isInverted) {
        Y.log("select", "info", "gallery-datatable-ml-selection");
        
        var currentSelection = this.get('selection'),
            selectedIds;
        
        if (selector instanceof Y.Node) {
            selectedIds = [ selector.get('id') ];
        }

        if (this.get('multiple') === true) {
            Y.Array.each(selectedIds, function(v) {
                var idx = currentSelection.indexOf(v);
                if (idx > -1) {
                    currentSelection.splice(idx, 1);
                } else {
                    currentSelection.push(v);
                }
            }, this);
        } else {
            currentSelection = selectedIds;
        }
        
        this.set('selection', currentSelection);
    }
});

Y.namespace("DP").DatatableMlSelection = DatatableMlSelection;
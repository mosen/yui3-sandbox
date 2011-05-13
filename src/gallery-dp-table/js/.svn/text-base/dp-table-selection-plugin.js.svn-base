/* dp-table selection plugin
 * 
 * allows for selection of rows.
 */
var	Lang = Y.Lang,
        Node = Y.Node;

Y.namespace('DP').SelectionPlugin = Y.Base.create('dp-table-selection-plugin', Y.Plugin.Base, [], {
  
    /*
     * @property _host Object Host Instance
     */
    _host : null,
  
    initializer : function() {
        Y.log('initializer', 'info', 'dp-table-selection-plugin');
        
        this._host = this.get('host');
        
        // Row selection
        this.publish('rowSelect', {defaultFn: this._defRowSelectFn});
        this.publish('rowOver', {defaultFn: this._uiSetRowHoverStyle});
        this.publish('rowOut', {defaultFn: this._uiRemoveRowHoverStyle});
        
        this._bindMouseEvents();
        
        this.after('rowSelectionChange', this._uiSetRowSelection);
    },
    
    destructor : function() {
        
    },
    
    _bindMouseEvents : function() {
                                                
        this._host._tbodyNode.delegate('click', function(e) {
                this.fire('rowSelect', {rowTarget: e.currentTarget});
        }, 'tr', this);

        this._host._tbodyNode.delegate('mouseenter', function(e) {
                this.fire('rowOver', {rowTarget: e.currentTarget});
        }, 'tr', this);

        this._host._tbodyNode.delegate('mouseleave', function(e) {
                this.fire('rowOut', {rowTarget: e.currentTarget});
        }, 'tr', this);
    },
    
    /**
     * Default handler for "rowSelect" event.
     * TODO: afterSelectionChange implementation of this.
     * 
     * @method _defRowSelectFn
     * @param e {Event}
     */
    _defRowSelectFn : function(e) {

            var selection = this.get('rowSelection'),
                    newSelection,
                    inverted = false;

            newSelection = Y.Array(selection);

            for (var i=0; i < newSelection.length; i++) {
                    if (newSelection[i] == e.rowTarget) {
                            Y.log('Invert selection');
                            newSelection.splice(i, 1);
                            e.rowTarget.removeClass(this._host.getClassName('row', 'selected'));
                            inverted = true;
                    }
            }

            if (inverted === false) {
                    Y.log('add selection');
                    newSelection.push(e.rowTarget);
                    e.rowTarget.addClass(this._host.getClassName('row', 'selected'));
            }

            this.set('rowSelection', newSelection);
    },

    /**
     * Set the row selection based on the selection attribute.
     * 
     * TODO: this algorithm needs brain surgery.
     * 
     * The Y.Widget lifecycle doesn't seem to make sense in the case of row selection because we need to save the selected row nodes, then
     * enumerate them for new selections, then add the classes sequentially.
     * 
     * So the uiSetXXXX convention does not apply here.
     * 
     * @method _uiSetRowSelection
     * @protected
     */
    _uiSetRowSelection : function(e) {
            Y.log('_defRowSelectFn');

            // Profiled 2.288 ms to remove all classes and add again
            // Profiled 0.400 ms to calculate array difference and act upon them.
            // Profiled 0.700 ms to do class change on DOM event.

    },

    /**
     * Remove the hover style from a row.
     * 
     * @param e {Event}
     * @returns
     */
    _uiRemoveRowHoverStyle : function(e) {
            //Y.log('SelectionPlugin:_uiRemoveRowHoverStyle');
            e.rowTarget.removeClass(this._host.getClassName('row', 'over'));		
    },

    /**
     * Add the hover style to a row.
     * 
     * @param e {Event}
     * @returns
     */
    _uiSetRowHoverStyle : function(e) {
            //Y.log('SelectionPlugin:_uiSetRowHoverStyle');
            e.rowTarget.addClass(this._host.getClassName('row', 'over'));
    }    
}, {
    NAME : "selectionPlugin",
    NS : "selection",

    ATTRS : {

        /*
         * Collection of selected rows.
         * 
         * @attribute rowSelection
         * @default empty array
         * @type Array
         */
        rowSelection : {
                    value: Array(),
                    validator: Lang.isArray
        }
    }   
});

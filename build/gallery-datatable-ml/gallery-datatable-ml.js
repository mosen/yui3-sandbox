YUI.add('gallery-datatable-ml', function(Y) {
// Datatable.Base ModelList Mixin

// Dirty vars copypasta
var YLang = Y.Lang,
    YisValue = YLang.isValue,
    fromTemplate = Y.Lang.sub,
    YNode = Y.Node,
    Ycreate = YNode.create,
    YgetClassName = Y.ClassNameManager.getClassName,

    DATATABLE = "datatable",
    COLUMN = "column",
    
    FOCUS = "focus",
    KEYDOWN = "keydown",
    MOUSEENTER = "mouseenter",
    MOUSELEAVE = "mouseleave",
    MOUSEUP = "mouseup",
    MOUSEDOWN = "mousedown",
    CLICK = "click",
    DBLCLICK = "dblclick",

    CLASS_COLUMNS = YgetClassName(DATATABLE, "columns"),
    CLASS_DATA = YgetClassName(DATATABLE, "data"),
    CLASS_MSG = YgetClassName(DATATABLE, "msg"),
    CLASS_LINER = YgetClassName(DATATABLE, "liner"),
    CLASS_FIRST = YgetClassName(DATATABLE, "first"),
    CLASS_LAST = YgetClassName(DATATABLE, "last"),
    CLASS_EVEN = YgetClassName(DATATABLE, "even"),
    CLASS_ODD = YgetClassName(DATATABLE, "odd"),

    TEMPLATE_TABLE = '<table></table>',
    TEMPLATE_COL = '<col></col>',
    TEMPLATE_THEAD = '<thead class="'+CLASS_COLUMNS+'"></thead>',
    TEMPLATE_TBODY = '<tbody class="'+CLASS_DATA+'"></tbody>',
    TEMPLATE_TH = '<th id="{id}" rowspan="{rowspan}" colspan="{colspan}" class="{classnames}" abbr="{abbr}"><div class="'+CLASS_LINER+'">{value}</div></th>',
    TEMPLATE_TR = '<tr id="{id}"></tr>',
    TEMPLATE_TD = '<td headers="{headers}" class="{classnames}"><div class="'+CLASS_LINER+'">{value}</div></td>',
    TEMPLATE_VALUE = '{value}',
    TEMPLATE_MSG = '<tbody class="'+CLASS_MSG+'"></tbody>';

function DatatableMl() {
    
}

DatatableMl.prototype = {
    
    /**
     * Destructor - prevent detachment from Recordset, because it doesn't exist.
     *
     * @method destructor
     * @param
     * @returns
     * @public
     */
    destructor : function() {
    },
    
   /**
    * Binds events.
    *
    * @method bindUI
    * @private
    */
    bindUI: function() {
        this.after({
            columnsetChange: this._afterColumnsetChange,
            modelListChange: this._afterModelListChange,
            summaryChange  : this._afterSummaryChange,
            captionChange  : this._afterCaptionChange
        });

        // Atomic changes
        this.get('models').after('add', this._afterModelListAdd, this);
        this.get('models').after('remove', this._afterModelListRemove, this);
        this.get('models').after('reset', this._afterModelListChange, this); // Just rerender
    },
    
   /**
    * Syncs UI to intial state.
    *
    * @method syncUI
    * @private
    */
    syncUI: function() {
        // THEAD ROWS
        this._uiSetColumnset(this.get("columnset"));
        // DATA ROWS
        this._uiSetModelList(this.get("models"));
        // SUMMARY
        this._uiSetSummary(this.get("summary"));
        // CAPTION
        this._uiSetCaption(this.get("caption"));
    },
    
   /**
     * Updates TBODY.
     *
     * @method _uiSetModelList
     * @param list {ModelList} New ModelList.
     * @protected
     */
    _uiSetModelList: function(list) {
        // TODO: everything
        var oldTbody = this._tbodyNode,
            parent = oldTbody.get("parentNode"),
            nextSibling = oldTbody.next(),
            columns = this.get('columnset').keys,
            cellValueTemplate = this.get('tdValueTemplate'),
            o = {},
            newTbody, i, len, column, formatter;

        // Replace TBODY with a new one
        //TODO: split _addTbodyNode into create/attach
        oldTbody.remove();
        oldTbody = null;
        newTbody = this._addTbodyNode(this._tableNode);
        newTbody.remove();
        this._tbodyNode = newTbody;
        o.tbody = newTbody;

        o.rowTemplate = this.get('trTemplate');
        o.columns = [];

        // Build up column data to avoid passing through Attribute APIs inside
        // render loops for rows and cells
        for (i = columns.length - 1; i >= 0; --i) {
            column = columns[i];
            o.columns[i] = {
                column : column,
                fields : column.get('field'),
                classes: column.get('classnames')
            };

            formatter = column.get('formatter');
            if (!YLang.isFunction(formatter)) {
                // Convert non-function formatters into functions
                // String formatters are treated as alternate value templates
                // Any other value for formatter is ignored, falling back to
                // to the configured tdValueTemplate attribute value.
                if (!YLang.isString(formatter)) {
                    formatter = cellValueTemplate;
                }
                formatter = Y.bind(fromTemplate, this, formatter);
            }

            o.columns[i].formatter = formatter;
        }

        list.each(Y.bind(function(model) {
           //o.model = model;
           o.data = model.getAttrs();
           o.rowindex = list.indexOf(model);
           this._addTbodyTrNode(o);
        }, this));
 
        // TBODY to DOM
        parent.insert(this._tbodyNode, nextSibling);
    }, 
    
    // addTbodyTrNode still works with the same signature.

   /**
    * Creates header cell element.
    *
    * @method _createTheadThNode
    * @param o {Object} {value, column, tr}.
    * @protected
    * @return Y.Node
    */
    _createTheadThNode: function(o) {
        var column = o.column;

        // Populate template object
        o.id = column.get("id");//TODO: validate 1 column ID per document
        o.colspan = column.colSpan;
        o.rowspan = column.rowSpan;
        o.abbr = column.get("abbr");
        o.classnames = column.get("classnames");
        o.value = fromTemplate(this.get("thValueTemplate"), o);

        var thNode = Ycreate(fromTemplate(this.thTemplate, o));

        if (column.get('width') !== undefined) {
            thNode.one('.'+CLASS_LINER).setStyle('width', column.get('width'));
        }

        return thNode;
    },


   /**
    * Creates data row element.
    *
    * @method _createTbodyTrNode
    * @param o {Object} {tbody, model}
    * @protected
    * @return Y.Node
    */
    _createTbodyTrNode: function(o) {
        var columns = o.columns,
            i, len, columnInfo;

        o.tr = Ycreate(fromTemplate(o.rowTemplate, {id: o.data.id || Y.guid()}));
        //o.tr = Ycreate(fromTemplate(o.rowTemplate, {id: o.model.get('clientId')}));
        for (i = 0, len = columns.length; i < len; ++i) {
            columnInfo = columns[i];
            o.column = columnInfo.column;
            o.field  = columnInfo.fields;
            o.classnames = columnInfo.classes;
            o.formatter = columnInfo.formatter;

            this._addTbodyTdNode(o);
        }
        
        return o.tr;
    },
    

    /**
    * Creates and attaches data row element.
    *
    * @method _addTbodyTrNode
    * @param o {Object} {tbody, record}
    * @protected
    */
    _addTbodyTrNode: function(o) {
        var row = o.tbody.one("#" + Y.guid());
//o.model.get("clientId")
        o.tr = row || this._createTbodyTrNode(o);

        this._attachTbodyTrNode(o);
    },
    
   /**
    * Creates data cell element.
    *
    * @method _createTbodyTdNode
    * @param o {Object} {record, column, tr}.
    * @protected
    * @return Y.Node
    */
    _createTbodyTdNode: function(o) {
        o.headers = o.column.headers;
        o.value   = this.formatDataCell(o);

        var tdNode = Ycreate(fromTemplate(this.tdTemplate, o));
       
        if (o.column.get('width') !== undefined) {
            tdNode.one('.'+CLASS_LINER).setStyle('width', o.column.get('width'));
        }

        if (o.column.get('align') === 'left' || o.column.get('align') === 'right' || o.column.get('align') === 'center') {
            tdNode.one('.'+CLASS_LINER).setStyle('textAlign', o.column.get('align'));
        }
       
        return tdNode;
    },
    
    /**
     * Returns markup to insert into data cell element.
     *
     * @method formatDataCell
     * @param @param o {Object} {record, column, tr, headers, classnames}.
     */
    formatDataCell: function(o) {
        //o.value = o.model.get(o.field);
        o.value = o.data[o.field];

        return o.formatter.call(this, o);
    },
    
    /**
     * Add a row to the table, given a specified model
     *
     * @method _addModel
     * @param model {Model} Model instance to render
     * @returns
     * @protected
     */
    _addModel : function(model) {

        // TODO: everything
        var oldTbody = this._tbodyNode,
            parent = oldTbody.get("parentNode"),
            columns = this.get('columnset').keys,
            cellValueTemplate = this.get('tdValueTemplate'),
            o = {},
            i, column, formatter;


        o.tbody = this._tbodyNode;

        o.rowTemplate = this.get('trTemplate');
        o.columns = [];

        // Build up column data to avoid passing through Attribute APIs inside
        // render loops for rows and cells
        for (i = columns.length - 1; i >= 0; --i) {
            column = columns[i];
            o.columns[i] = {
                column : column,
                fields : column.get('field'),
                classes: column.get('classnames')
            };

            formatter = column.get('formatter');
            if (!YLang.isFunction(formatter)) {
                // Convert non-function formatters into functions
                // String formatters are treated as alternate value templates
                // Any other value for formatter is ignored, falling back to
                // to the configured tdValueTemplate attribute value.
                if (!YLang.isString(formatter)) {
                    formatter = cellValueTemplate;
                }
                formatter = Y.bind(fromTemplate, this, formatter);
            }

            o.columns[i].formatter = formatter;
        }


       o.model = model;
       o.data = model.getAttrs();
       o.rowindex = this.get('models').indexOf(model);
       this._addTbodyTrNode(o);
 
    },
    
    /**
     * After a model is added to the modellist, add this row to the Datatable
     *
     * @method _afterModelListAdd
     * @param e {Event} With .model property
     * @returns
     * @protected
     */
    _afterModelListAdd : function(e) {
        this._addModel(e.model);
    },
    
    /**
     * After a model is removed from the modellist, remove the corresponding row.
     *
     * @method _afterModelListRemove
     * @param
     * @returns
     * @protected
     */
    _afterModelListRemove : function() {
    },
    
    /**
     * After an entire model list is swapped
     *
     * @method _afterModelListChange
     * @param
     * @returns
     * @protected
     */
    _afterModelListChange : function() {
        
        this._uiSetModelList(this.get('models'));
    }
};

DatatableMl.ATTRS = {
        /**
         * Instance of Y.ModelList used to model the table rows.
         *
         * @attribute models
         * @type Y.ModelList
         * @default null
         */
        models : {
            value : null
        },
        
        // @deprecated This supersedes the recordset based table
        recordset : {
            value : null
        }
};

Y.Base.mix(Y.DataTable.Base, [DatatableMl]);
Y.mix(Y.Column, {
   ATTRS : {
       /**
        * Alignment of cell contents, applied to the liner div element.
        *
        * @attribute align
        * @default undefined
        */
       align : {
           value : undefined
       },
       
       /**
        * Function used for sorting column values, applied to recordset.
        * 
        * This is mentioned but not implemented in DataTable.Base
        * 
        * @attribute sortFn
        * @default null
        */
       sortFn : {
           value : null
       }
   } 
}, false, null, 0, true); // Mix with merge
}, '1.0.0' , {requires: ['datatable']});
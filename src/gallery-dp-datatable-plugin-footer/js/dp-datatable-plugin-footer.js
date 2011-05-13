/**
 * The DataTable footer plugin allows you to display any value in the footer section of the table.
 * You can do simple calculations or provide a function to render content based on the recordset.
 * 
 * @module dp-datatable-plugin-footer
 * @requires lang, array, base, node
 */

//YUI.add('dp-datatable-plugin-footer', function(Y) {
	
	var Lang = Y.Lang,
            Node = Y.Node;
	
	/**
	 * The DataTable footer plugin allows you to display any value in the footer section of the table.
	 * You can do simple calculations or provide a function to render content based on the recordset.
	 * 
	 * The footer columnset definition is different to the DataTable columnset definition because there are use cases for
	 * footer columns not based on data, or aggregated from multiple columns.
	 * 
	 * @class DataTableFooter
	 * @extends Y.Base.Plugin
	 * @augments Y.DataTable
	 * @param config {Object} Configuration object literal with initial attribute values
	 * @constructor
	 */
	Y.namespace('DP').DataTableFooter = Y.Base.create( 'gallery-dp-datatable-plugin-footer', Y.Plugin.Base, [], {
		
		initializer: function(config) {
			Y.log('initializer', 'info', 'DataTableFooter');
			
			this.afterHostMethod("render", this._renderFooter);        
                        this.afterHostEvent("recordsetChange", this._renderColumnValues);
		},
		
		destructor : function() {
			
		},
		
		/**
		 * @method _renderFooter
		 * @description Renders the initial markup for the footer.
		 * @private
		 */
		_renderFooter : function() {
			var columnset = this.get('columnset');
			
			Y.log('_afterHostRenderMethod', 'info', 'DataTableFooter');
			
			this._tfoot = Node.create(Y.substitute(this.get('tfootTemplate'), {
				tfootClassName: this.get('host').getClassName('footer', 'tfoot'),
				trClassName: this.get('host').getClassName('footer', 'tr')
			}));
			
			this.get('host').get('contentBox').one('table').append(this._tfoot);
		},
		
		/**
		 * @method _renderColumnValues
		 * @description Render the footer definition. Occurs every time the recordSetChange event is fired by the host.
                 * @private
		 * @return undefined
		 */
		_renderColumnValues : function() {
			Y.log('_renderColumnValues', 'info', 'DataTableFooter');
			
			var columns = this.get('columnset'),
                            columnNode,
                            trContainer = this._tfoot.one('tr'),
                            v = "",
                            span = 1;
                            
                        trContainer.set('content', '');
			
			Y.Array.each(columns, function(c) {
				
				if (Lang.isFunction(c.value)) {
					v = c.value(this.get('host').get('recordset'));
				} else {
					v = c.value;
				}
				
				if (c.span !== undefined) {
					span = c.span;
				} else {
					span = 1;
				}
				
				columnNode = Node.create(Y.substitute(this.get('tdTemplate'), {
					tdClassName: this.get('host').getClassName('footer', 'col'),
					linerClassName: this.get('host').getClassName('liner'),
					tdColSpan: span,
					value: v
				}));

				trContainer.append(columnNode);
			}, this);
		}
		
	},{
		
		/**
		 * @property _tfoot
		 * @description Reference to the created TFOOT node
		 * @type Node
		 * @default undefined
                 * @private
		 */
		_tfoot : undefined,
		
		/**
		 * @property NAME
		 * @type String
                 * @protected
		 */
		NAME : "datatableFooter",
		
		/**
		 * @property NS
		 * @type String
                 * @protected
		 */
		NS : "dtfoot",
		
		
		ATTRS : {
			
			/**
                         * A couple of example values for this configuration attribute: <br />
                         * <br />
                         * One column that contains only the word "String" but spans 2 columns of the table. <br />
                         * <code>
                         * [ { value: "String", span: 2 } ] 
                         * </code>
                         * <br /><br />
                         * One column that executes a function to get its contents, the function takes the RecordSet instance of the Y.DataTable as its only parameter <br />
                         * <code>
                         * [ { value: fnCalculateTotal } ]
                         * </code>
                         *
			 * @attribute columnset
			 * @type Array
			 */
			columnset : {
				value : Array()
			},
			
			/**
			 * @attribute tfootTemplate
			 * @description Template for the footer minus the columns
			 * @type String
			 */
			tfootTemplate : {
				value : "<tfoot class=\"{tfootClassName}\"><tr class=\"{trClassName}\"></tr></tfoot>"
			},
			
			/**
			 * @attribute tdTemplate
			 * @description Template for every footer cell
			 * @type String
			 */
			tdTemplate : {
				value : "<td class=\"{tdClassName}\" colspan=\"{tdColSpan}\"><div class=\"{linerClassName}\">{value}</div></td>"
			}
		},
                
                /**
                 * @method calculatePriceTotal
                 * @description Helper method that totals all values for one column, and then presents the result as a monetary value.
                 * @param {String} key Key to use in the recordset for calculating the total
                 * @param {Object} format Literal object of options to Y.DataType.Number.format that will be used, defaults to a standard dollars output
                 * @return Function A function seeded with the specified key that will calculate the column total and present it as a monetary value.
                 */
                calculatePriceTotal : function(key, format) {
                    return function(o) {
			Y.log('calculatePriceTotal', 'info', 'DataTableFooter');
			
			var total = 0,
                            vals = o.getValuesByKey(key);
		
			Y.Array.each(vals, function(v) { 
				total += Y.DataType.Number.parse(v); 
			});
                        
                        if (!Lang.isObject(format)) {
                            format = {
				prefix: "$",
				thousandsSeparator: ",",
				decimalSeparator: ".",
				decimalPlaces: 2
                            };
                        }
			
			return Y.DataType.Number.format(total, format);			
                    };
                }
	});
//}, '@VERSION@' ,{requires:['base']});
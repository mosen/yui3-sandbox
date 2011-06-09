YUI.add('gallery-dp-datasource-input', function(Y) {

/**
 * Provides a DataSource implementation which uses JSON encoded text contained within an input element to provide data.
 *
 * @module datasource-input
 * @requires datasource
 */

/* Frequently used shortcuts, strings and constants */
var Lang = Y.Lang;

/**
 * DatasourceInput
 *
 * @class DatasourceInput
 * @extends Widget
 * @constructor
 */
function DataSourceInput(config) {
    DataSourceInput.superclass.constructor.apply(this, arguments);
}

Y.mix(DataSourceInput, {

    /**
     * The widget name identifies the event prefix and is a basis for generating
     * class names.
     * 
     * @property NAME
     * @type String
     * @static
     */
    NAME : "dataSourceInput",

    /**
     * The attribute configuration represents the core user facing state of 
     * the widget.
     *
     * @property ATTRS
     * @type Object
     * @protected
     * @static
     */
    ATTRS : {
        
        /**
         * Reference to the input node which contains the JSON encoded data.
         *
         * @attribute node
         * @type Node
         */
        node : {
            value : null,
            setter : function(v) {
                if (Lang.isString(v)) {
                    return Y.one(v);
                } else {
                    return v;
                }
            }
        }

    }
});

Y.extend(DataSourceInput, Y.DataSource.Local, {

    /**
     * Initializer runs when the widget is constructed.
     *
     * @method initializer
     * @param config {Object} Configuration object
     */
    initializer : function (config) {
        
    },
    
    /**
     * Destructor runs when destroy() is called.
     * 
     * Anything under the widgets bounding box will be cleaned up.
     * We only need to clean up nodes/events attached outside of the bounding Box
     *
     * @method destructor
     * @protected
     */
    destructor: function() { 
    
    },

    /**
     * 
     *
     * @method _defRequestFn
     * @param e {Event.Facade} Event Facade
     * @protected
     */
    _defRequestFn: function(e) {
        var node = this.get('node'),
            jsonDataText,
            jsonData,
            resultData = [],
            query = e.request;
        
        if (node.get('nodeName') == 'TEXTAREA') {
            jsonDataText = node.get('text');
        } else if (node.get('nodeName') == 'INPUT') {
            jsonDataText = node.get('value');
        }

        try {
            jsonData = Y.JSON.parse(jsonDataText);
        } catch (ex) {
        }
        
        if (query) {
            
            var regex = new RegExp(query, 'i');
            
            Y.Array.each(jsonData, function(v) {
                //console.dir(v);
                
                if (regex.test(v['CardName'])) {
                    resultData.push(v);
                }
            }, this);
        } else {
            resultData = jsonData;
        }
        
        this.fire("data", Y.mix({data:resultData}, e));
        
    }   
    
});

Y.namespace("DP").DataSourceInput = DataSourceInput;


}, '@VERSION@' ,{requires:['datasource', 'json-parse']});

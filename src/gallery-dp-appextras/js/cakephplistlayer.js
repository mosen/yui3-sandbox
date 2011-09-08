/**
 * Parse JSON responses from the CakePHP framework into Y.ModelList
 *
 * @class CakePHPListLayer
 * @constructor
 */

function CakePhpListLayer() {

}

CakePhpListLayer.ATTRS = {

    /**
     * Name of the model in CakePHP
     *
     * This will be used to process incoming JSON data for the ModelList
     *
     * @attribute cakeModel
     * @type String
     */
    cakeModel : {
        value : 'Model'
    }
};

CakePhpListLayer.prototype = {

    /**
     * Parse JSON data from CakePHP.
     * CakePHP nests attributes by model name, so we need to "unwrap"
     * the model name to get our attributes.
     *
     * Expects that the JSON will be structured a certain way:
     * { "response" : { "items" : [] } }
     *
     * @param response {Object} XHR Response
     * @method parseCakePhpJSONData
     * @public
     */
        parseCakePhpJSONData : function(response) {
            var json = Y.JSON.parse(response.responseText);

            if (json.response.error === true) {
                this.fire('error', {
                    type: 'parse',
                    error: 'Server side error'
                });
            } else {
                var items = json.response.items,
                    decapsulated = [],
                    modelName = this.get('cakeModel');

                decapsulated = Y.Array.map(items, function(e) {
                   return e[modelName];
                });

                return decapsulated;
            }
        }
};

Y.namespace('DP').CakePhpListLayer = CakePhpListLayer;
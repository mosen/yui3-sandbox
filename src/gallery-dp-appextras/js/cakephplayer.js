/**
 * Allow the model to be serialised to a POST format that the CakePHP
 * framework understands.
 *
 * @class CakePHPLayer
 * @constructor
 */

function CakePhpLayer() {

}

CakePhpLayer.ATTRS = {

    /**
     * Name of the model in CakePHP
     *
     * This will be used to create the POST data, which
     * CakePHP will use to populate $this->data in the controller.
     *
     * @attribute cakeModel
     * @type String
     */
    cakeModel : {
        value : 'Model'
    },

    /**
     * Fields (Attributes) which will be sent to the server.
     *
     * Not all attributes necessarily relate to the server model, so they must be listed in this array.
     *
     * @attribute cakeAttrs
     * @type Array
     */
    cakeAttrs : {
        value : []
    }
};

CakePhpLayer.prototype = {

      /**
       * Transform the attribute state into CakePHP data format.
       *
       * You can supply the keys of the .changed property to do incremental posts/to avoid posting
       * the entire model state.
       *
       * @method toCakePhpData
       * @param attrs {Array} Attributes to return in CakePHP format, if undefined will return all attributes.
       * @public
       * @return {Object} Hash containing keys that match the CakePHP Model[attribute] form.
       */
        toCakePhpData : function(attrs) {
            var prefix = 'data[' + this.get('cakeModel') + ']',
                dataAttributes = this.get('cakeAttrs'),
                data = {};

            if (attrs !== undefined) {
                dataAttributes = Y.Array.filter(attrs, function(attr) {
                    return (dataAttributes.indexOf(attr) > -1);
                }, this);
            }

            if (Y.Lang.isValue(this.get('id'))) {
                data[prefix + '[id]'] = this.get('id');
            }

            Y.Array.each(dataAttributes, function(attr) {
               data[prefix + '[' + attr + ']'] = this.get(attr);
            }, this);

            return data;
        },

    /**
     * Parse JSON data from CakePHP.
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
                var cakeModel = json.response.items[0][this.get('cakeModel')];
                return cakeModel;
            }
        }
};

Y.namespace('DP').CakePhpLayer = CakePhpLayer;
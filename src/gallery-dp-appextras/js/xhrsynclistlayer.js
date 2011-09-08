/**
 * Generic XHR Sync Layer for YUI's App Framework
 */

function XHRSyncListLayer() {

}

/**
 * Transaction ID for the current XHR operation
 *
 * @property _tId
 * @type Number
 */
XHRSyncListLayer._tId = null;

XHRSyncListLayer.ATTRS = {

    /**
     * Attribute which indicates whether the model is currently in a transaction.
     *
     * @attribute loading
     * @type Boolean
     */
        loading : {
            value : false,
            validator : Y.Lang.isBoolean
        },

    /**
     * Name of the model to form the server side URI
     *
     * @attribute uriController
     * @type String
     */
        uriController : {
            value : 'model'
        },

      /**
       * URI to read modelList content
       *
       * @attribute TEMPLATE_URI_READ
       */
        TEMPLATE_URI_READ : {
            value : '/{model}/index.json'
        }
};

XHRSyncListLayer.prototype = {

  /**
   * Default function to execute on IO start
   *
   * @method _fnSetLoading
   * @protected
   */
    _fnSetLoading : function() {
        this.set('loading', true);
    },

  /**
   * Default function to execute on IO complete
   *
   * @method _fnSetNotLoading
   * @protected
   */
    _fnSetNotLoading : function() {
        this.set('loading', false);
    },

    // Sync layer implemented for Y.Model
    sync : function(action, options, callback) {
        var data;

        switch(action) {
            case 'read':
                var listAttrs = this.getAttrs();
                var uriRead = Y.Lang.sub(this.get('TEMPLATE_URI_READ'),
                    Y.mix({ model: this.get('uriController') }, listAttrs));

                this._tId = Y.io(uriRead, {
                    method : 'GET',
                    on : {
                        success : function(transactionId, responseObject, args) {
                            callback(null, responseObject);
                        },
                        failure : function(transactionId, responseObject, args) {
                            callback('Error retrieving the list');
                        },
                        start : this._fnSetLoading,
                        complete : this._fnSetNotLoading
                    },
                    context : this
                });
                break;

            default:
                callback('invalid action');
        }
    }
};

Y.namespace('DP').XHRSyncListLayer = XHRSyncListLayer;
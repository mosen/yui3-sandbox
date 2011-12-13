/**
 * Create a sync action for modellist which will synchronise multiple models and a specified list of changed attributes.
 * The list of models and their attributes will be posted to a specified url as json.
 */

function ModelListSyncAttrs() {

}

/**
 * Transaction ID for the current XHR operation
 *
 * @property _tId
 * @type Number
 */
ModelListSyncAttrs._tId = null;

ModelListSyncAttrs.ATTRS = {

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
     * Uri to post multiple attribute updates
     *
     * @attribute TEMPLATE_URI_UPDATE_ALL
     * @type String
     */
    TEMPLATE_URI_UPDATE_MANY : {
        value : '/{model}/update_all.json'
    }
};

ModelListSyncAttrs.prototype = {

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

    /**
     * Synchronize multiple model attributes
     *
     * The model must implement a toPostData() method
     *
     * @param action {String} operation
     * @param options {Object} options, containing attrs : [] to sync
     * @param callback {Function} callback function
     */
    syncAttrs : function(options, callback) {
        var uriUpdate = Y.Lang.sub(this.get('TEMPLATE_URI_UPDATE_MANY'),
            { model: this.get('uriController') }),
            callback = callback || function(err, response) {};

        this._tId = Y.io(uriUpdate, {
            method : 'POST',
            data : { json: Y.JSON.stringify(options.values) }, // TODO: dirty hack to avoid the scope of this.getAttrs which would return loading etc.. instead of parent
            on : {
                success : function(transactionId, responseObject, args) {
                    callback(null, responseObject);
                },
                failure : function(transactionId, responseObject, args) {
                    callback('Error updating the objects');
                },
                start : this._fnSetLoading,
                complete : this._fnSetNotLoading
            },
            context : this
        });
    }
};

Y.namespace('DP').ModelListSyncAttrs = ModelListSyncAttrs;
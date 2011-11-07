/**
 * Generic XHR Sync Layer for YUI's App Framework
 */

function XHRSyncLayer() {

}

/**
 * Transaction ID for the current XHR operation
 *
 * @property _tId
 * @type Number
 */
XHRSyncLayer._tId = null;

XHRSyncLayer.ATTRS = {

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
     * Function to determine whether the response
     * contains an error.
     *
     * @attribute fnResponseIsError
     * @type Function
     */
    fnResponseIsError : {
        value : function() {
            return false;
        }
    },

    /**
     * URI Templates for Model sync layer
     *
     * @attribute TEMPLATE_URI_CREATE
     * @type String
     */
    TEMPLATE_URI_CREATE : {
        value : '/{model}/create.json'
    },

    /**
     * @attribute TEMPLATE_URI_READ
     * @type String
     */
    TEMPLATE_URI_READ : {
        value : '/{model}/view.json?id={id}'
    },

    /**
     * @attribute TEMPLATE_URI_UPDATE
     * @type String
     */
    TEMPLATE_URI_UPDATE : {
        value : '/{model}/update.json?id={id}'
    },

    /**
     * @attribute TEMPLATE_URI_DELETE
     * @type String
     */
    TEMPLATE_URI_DELETE : {
        value : '/{model}/delete.json?id={id}'
    }
};

XHRSyncLayer.prototype = {

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
     * Synchronize a model with the server
     *
     * The model must implement a toPostData() method
     *
     * @param action {String} operation
     * @param options
     * @param callback {Function} callback function
     */
     sync : function(action, options, callback) {

        switch(action) {
            case 'create':
                var uriCreate = Y.Lang.sub(this.get('TEMPLATE_URI_CREATE'), { model: this.get('uriController') });
                // io request add, set id from response
                this._tId = Y.io(uriCreate, {
                    method : 'POST',
                    data : this.toPostData(),
                    on : {
                        success : function(transactionId, responseObject, args) {
                            if (this.get('fnResponseIsError')(responseObject)) {
                                callback('Server sent an error response');
                            } else {
                                callback(null, responseObject);
                            }
                        },
                        failure : function(transactionId, responseObject, args) {
                            callback('Error creating the object (transport error)');
                        },
                        start : this._fnSetLoading,
                        complete : this._fnSetNotLoading
                    },
                    context : this
                });
                break;

            case 'read':
                var uriRead = Y.Lang.sub(this.get('TEMPLATE_URI_READ'),
                    { id: this.get('id'), model: this.get('uriController') });

                this._tId = Y.io(uriRead, {
                    method : 'GET',
                    on : {
                        success : function(transactionId, responseObject, args) {
                            if (this.get('fnResponseIsError')(responseObject)) {
                                callback('Server sent an error response');
                            } else {
                                callback(null, responseObject);
                            }
                        },
                        failure : function(transactionId, responseObject, args) {
                            callback('Error retrieving the object (transport error)');
                        },
                        start : this._fnSetLoading,
                        complete : this._fnSetNotLoading
                    },
                    context : this
                });
                break;

            case 'update':
                var uriUpdate = Y.Lang.sub(this.get('TEMPLATE_URI_UPDATE'),
                    { id: this.get('id'), model: this.get('uriController') });

                this._tId = Y.io(uriUpdate, {
                    method : 'POST',
                    data : this.toPostData(),
                    on : {
                        success : function(transactionId, responseObject, args) {
                            if (this.get('fnResponseIsError')(responseObject)) {
                                callback('Server sent an error response');
                            } else {
                                callback(null, responseObject);
                            }
                        },
                        failure : function(transactionId, responseObject, args) {
                            callback('Error updating the object (transport error)');
                        },
                        start : this._fnSetLoading,
                        complete : this._fnSetNotLoading
                    },
                    context : this
                });
                break;

            case 'delete':
                var uriDelete = Y.Lang.sub(this.get('TEMPLATE_URI_DELETE'),
                    { id: this.get('id'), model: this.get('uriController') });

                this._tId = Y.io(uriDelete, {
                    method : 'GET',
                    on : {
                        success : function(transactionId, responseObject, args) {
                            if (this.get('fnResponseIsError')(responseObject)) {
                                callback('Server sent an error response');
                            } else {
                                callback(null, responseObject);
                            }
                        },
                        failure : function(transactionId, responseObject, args) {
                            callback('Error deleting the object (transport error)');
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

Y.namespace('DP').XHRSyncLayer = XHRSyncLayer;
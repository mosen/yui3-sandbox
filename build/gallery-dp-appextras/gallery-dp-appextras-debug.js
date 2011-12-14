YUI.add('gallery-dp-appextras', function(Y) {

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

Y.namespace('DP').XHRSyncLayer = XHRSyncLayer;/**
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
                if (json.response.items.length > 0) {
                    var cakeModel = json.response.items[0][this.get('cakeModel')];
                    return cakeModel;
                } else {
                    return null;
                }
            }
        }
};

Y.namespace('DP').CakePhpLayer = CakePhpLayer;/**
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

Y.namespace('DP').XHRSyncListLayer = XHRSyncListLayer;/**
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

Y.namespace('DP').CakePhpListLayer = CakePhpListLayer;/**
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

Y.namespace('DP').ModelListSyncAttrs = ModelListSyncAttrs;// A set of functions to deal with attribute setters and getters that deal with normalising database input or output
// to a suitable javascript variable type or structure

var DATETIME_SEPARATOR = ' ',
    DATE_SEPARATOR = '-',
    TIME_SEPARATOR = ':';

Y.namespace('DP').ModelAccessors = {

    /**
     * Standardised setter for date strings.
     *
     * @param data {Object} Instance of Date, Or String representation of date
     * @return {Date} Instance of Date.
     */
    _attrSetterDate : function(data) {
        if (data === null || data === undefined) {
            return null;
        } else {
            if (Y.Lang.isDate(data)) {
                return data;
            } else {
                // date.js was extremely slow with large numbers of objects
                // so we roll our own date parser for MSSQL DATETIME
                if (data !== null && data.match(/[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}/)) {
                        var datetimeParts = data.split(DATETIME_SEPARATOR),
                            timeParts = datetimeParts[1].split(TIME_SEPARATOR),
                            dateParts = datetimeParts[0].split(DATE_SEPARATOR),
                            y = dateParts[0],
                            m = (dateParts[1] - 1),
                            d = dateParts[2],
                            h = timeParts[0],
                            mins = timeParts[1],
                            secs = timeParts[2],
                            parsedDate = new Date(y, m, d, h, mins, secs);

                        return parsedDate;
                } else {
                        return Date.parse(data);
                }
            }
        }
    }
};

}, '1.0.0' , {  });

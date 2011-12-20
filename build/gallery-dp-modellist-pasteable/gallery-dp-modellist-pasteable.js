YUI.add('gallery-dp-modellist-pasteable', function(Y) {

/**
 * Copy and paste modelList contents using the HTML5 localStorage engine.
 *
 * You can already clone modelLists themselves, but if you would like a cross request method of
 * storing and retrieving modelLists, you can use this extension.
 *
 * The extension assumes that you are trying to paste the same sort of model as the one you are copying.
 *
 * @class ModelListPasteable
 * @namespace Y.DP
 * @constructor
 */
function ModelListPasteable() {

}

Y.extend(ModelListPasteable, Y.Base, {

    initializer: function() {

        if (typeof(localStorage) === undefined) {
            throw new TypeError('This browser does not support HTML5 localStorage.');
        }
    },

    /**
     * Copy the contents of the modelList into the storage engine.
     *
     * @method copy
     * @public
     */
    copy : function() {
        var jsonString = Y.JSON.stringify(this.toJSON());


        localStorage.setItem("model-list", jsonString);
    },

    /**
     * Paste the contents of the storage engine into this modelList. resetting the contents.
     *
     * @method pasteReplace
     * @public
     */
    pasteReplace : function() {
        var jsonString = localStorage.getItem("model-list");


        this.reset(Y.JSON.parse(jsonString));
    },

    /**
     * Paste the contents of the storage engine to this list, adding to the models.
     *
     * @param callback {Function} Callback executed with the array retrieved from the storage
     */
    paste : function(callback) {
        var jsonString = localStorage.getItem("model-list"),
            jsonObject = Y.JSON.parse(jsonString),
            callback = callback || function(){};


        callback(jsonObject);

        Y.Array.each(jsonObject, function(model) {
            if (model.hasOwnProperty('id')) {
                delete model.id;
            }
            this.create(model);
        }, this);
    }

}, {});

Y.namespace('DP').ModelListPasteable = ModelListPasteable;

}, '1.0.0' , { requires: ['json', 'base', 'model-list'] });

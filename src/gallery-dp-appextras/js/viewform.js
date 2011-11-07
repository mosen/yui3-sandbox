/**
 * An extension to Y.View which provides form value <-> model synchronisation in a semi-automated way.
 *
 * This extension makes up a few conventions in order to make the synchronisation as configuration free
 * as possible.
 *
 * With credit to apipkin's gallery-form-values as inspiration.
 *
 * @class ViewForm
 * @constructor
 */

function ViewForm() {

}

ViewForm.ATTRS = {

    /**
     * ID of the form which will be synced with the model.
     *
     * @attribute formId
     * @type String
     */
    formId : {
        value : ''
    }
};

ViewForm.prototype = {

    /**
     * Object literal of model attributes to form element references.
     *
     * @property _formCache
     * @type Object
     */
    _formCache : {},

    /**
     * Build a hash of references to valid input elements for the current model.
     *
     * after render
     *
     * @method _cacheFormElements
     * @protected
     */
    _cacheFormElements : function() {
        var formObjects = Y.one(this.get('formId')).all(['input', 'textarea', 'select']),
            modelAttrs = Y.Object.keys(this.get('model').getAttrs());

        Y.Array.each(formObjects, function(input) {
            var matchingAttributeIdx = modelAttrs.indexOf(input.get('name'));

            if (matchingAttributeIdx > -1) {
                var matchingAttribute = modelAttrs[matchingAttributeIdx];
                this._formCache[matchingAttribute] = input;
            }
        }, this);
    },

    /**
     * Convert the model attributes to form values, depending on the input type this can
     * have different outcomes
     *
     * @method _toForm
     * @protected
     */
    _toForm : function() {
        if (Y.Object.keys(this._formCache).length === 0) {
            this._cacheFormElements();
        }

        var model = this.get('model');

        Y.Array.each(Y.Object.keys(this._formCache), function(attr) {
            var element = this._formCache[attr],
                type = element.get('nodeName') + ':' + (element.get('type') || '');

            switch(type.toLowerCase()) {
                  case 'input:': // fall through intentional
                  case 'input:text':
                  case 'input:hidden':
                  case 'input:file':
                  case 'input:password':
                  case 'textarea:':
                  case 'textarea:textarea':
                  case 'select:':
                  case 'select:select-one':
                    element.set('value', model.get(attr));
                    break;

                  case 'select:select-multiple':
                    var selectedValues = model.get(attr);
                    element.all('option').each(function(opt){
                      if(selectedValues.indexOf(opt.get('value')) > -1) {
                        opt.set('selected', true);
                      }
                    });
                    break;

                  case 'input:radio': // fall through intentional
                  case 'input:checkbox':
                    if (input.get('value') === model.get(attr)) {
                        input.set('checked', true );
                    } else {
                        input.set('checked', false);
                    }
                    break;
            }
        }, this);
    },

    /**
     * Convert the form to an object literal which will be used to set the values for
     * our model.
     *
     * The form inputs must have a name attribute equal to the model attribute name.
     *
     * @method _toModel
     * @protected
     */
    _toModel : function() {
        var formObjects = Y.one(this.get('formId')).all(['input', 'textarea', 'select']),
            modelAttrs = Y.Object.keys(this.get('model').getAttrs()), // TODO: try to use ATTRS in order to avoid cost of get()
            formData = {};

        Y.Array.each(formObjects, function(input) {
            if (modelAttrs.indexOf(input.get('name') > -1)) {
                var type = input.get('nodeName') + ':' + (input.get('type') || ''),
                    name = input.get('name'),
                    value;

                switch (type.toLowerCase()) {
                      case 'input:': // fall through intentional
                      case 'input:text':
                      case 'input:hidden':
                      case 'input:file':
                      case 'input:password':
                      case 'textarea:':
                      case 'textarea:textarea':
                      case 'select:':
                      case 'select:select-one':
                        value = input.get('value');
                        break;

                      case 'select:select-multiple':
                        value = [];
                        input.all('option').each(function(opt){
                          if(opt.get('selected')) {
                            value.push(opt.get('value'));
                          }
                        });
                        break;

                      case 'input:radio': // fall through intentional
                      case 'input:checkbox':
                        value = input.get('checked') ? input.get('value') : undefined;
                        break;
                }

                if (value !== undefined) {
                    formData[name] = value;
                }
            }
        }, this);

        this.get('model').setAttrs(formData);
    }
};

Y.namespace('DP').ViewForm = ViewForm;
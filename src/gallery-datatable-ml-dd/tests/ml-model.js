YUI.add('ml-model', function(Y) {


    Y.MlModel = Y.Base.create('mlModel', Y.Model, [], {
        
    }, {
        ATTRS: {

            title : {
                value : "Model",
                validator : Y.Lang.isString
            }
        }
    });
}, '1.0.0', { requires: ['model'] });
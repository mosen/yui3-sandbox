YUI.add('ml-list', function(Y) {

    Y.MlList = Y.Base.create('mlList', Y.ModelList, [], {

        model : Y.MlModel
       
    }, {
        ATTRS: {
        }
    });
}, '1.0.0', { requires: ['model-list'] });
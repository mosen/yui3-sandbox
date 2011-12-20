YUI().use('model', 'model-list', 'gallery-dp-modellist-pasteable', function(Y) {
    Y.PieModel = Y.Base.create('pieModel', Y.Model, [], {}, {
        ATTRS : {
            slices: {
                value: 6
            }
        }
    });

    Y.PieList = Y.Base.create('pieList', Y.ModelList, [Y.DP.ModelListPasteable], {

    }, {});

    var testModelList = new Y.PieList({model: Y.PieModel}),
        pastedModelList = new Y.PieList({model: Y.PieModel});

    pastedModelList.on('error', function() {
        Y.log('pasted list raised an error');
    });

    testModelList.add({ slices: 1 });
    testModelList.copy();
    pastedModelList.paste();

    Y.log(testModelList.toJSON());
    Y.log(pastedModelList.toJSON());
});
YUI({
    modules : {
        'gallery-ebisu-childslider' : {
            'fullpath' : '../../../build/gallery-ebisu-childslider/gallery-ebisu-childslider-debug.js',
            'requires' : ['plugin', 'slider']
        }
    }
  /*,filter : 'debug' */
}).use('gallery-ebisu-childslider', 'console', function(Y) {

        // Set up the master slider, this provides the constraints/rail for the child
        var masterSlider = new Y.Slider({
            value : 0
        });
        
        //masterSlider.render('.yui3-slider');
        masterSlider.after('valueChange', function(e) {
            Y.one('#mastervalue').set('value', e.newVal);
        });
        
        var childSlider = new Y.Slider({
            value : 100,
            plugins : [{ fn: Y.Ebisu.ChildSlider, cfg: {
                    parent: masterSlider,
                    constrained: true
                }
            }]
        });
        
        
        masterSlider.render('.yui3-slider');
        
        childSlider.render('.yui3-slider');
        childSlider.after('valueChange', function(e) {
            Y.one('#childvalue').set('value', e.newVal);
        });

});
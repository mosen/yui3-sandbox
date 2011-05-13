YUI({
  /*  filter: 'debug' */
}).use('gallery-ebisu-dualslider', 'console', function(Y) {
        /*
	var yconsole = new Y.Console({
		newestOnTop: false,
		height: '600px'
	});*/
	//yconsole.render('#log');

        var slider = new Y.Slider();
        slider.render('.yui3-slider');
        
        var slidertwo = new Y.Ebisu.ChildSlider({ parent: slider });
        slidertwo.render('.yui3-slider');
        
        slider._dd.after('drag:align', function(e) {
            var limiterValue = slidertwo.get('value'),
                limiterOffset = slidertwo._valueToOffset(limiterValue);
            
            //console.dir(e);
            //Y.log('drag align', 'error', 'slider');
            if (slider._dd.actXY[0] > limiterOffset) {
                slider._dd.actXY[0] = limiterOffset - 5;
            }
        }, slider._dd);

                
        slidertwo._dd.after('drag:align', function(e) {
            var limiterValue = slidertwo.get('value'),
                limiterOffset = slidertwo._valueToOffset(limiterValue),
                limitedValue = slider.get('value'),
                limitedOffset = slider._valueToOffset(limitedValue);
                
            if (slidertwo._dd.actXY[0] < limitedOffset) {
                slider.set('value', limiterValue - 5);
            }
        }, slidertwo._dd);

        slider.on('valueChange', function(e) { 
            Y.log(slider.get('value'));
        })
        
});
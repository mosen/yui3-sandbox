YUI({
    /* filter: 'debug' */ 
}).use('dd-drag', 'dd-constrain', 'gallery-dp-dd-plugin-loopingdrag', 'console', function(Y) {
        /*
	var yconsole = new Y.Console({
		newestOnTop: false,
		height: '600px'
	});*/
	//yconsole.render('#log');
        
        var dd = new Y.DD.Drag({
                node: Y.one('#subject'),
                haltDown: false
            }).plug(Y.Plugin.DDConstrained, {
                constrain: 'view',
                stickX: true
            }).plug(Y.DP.LoopingDrag, {
                offset: 100
            });
       
});
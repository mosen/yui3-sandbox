YUI.add('tableevents-test-propagation', function (Y) {

    Y.namespace('TestCase').TableEventsCasePropagation = new Y.Test.Case({ 
        name: "gallery-datatable-tableevents test case : propagation",

        setUp: function() {

            this.data = [
                { "id" : "1", "name" : "Joe" },
                { "id" : "2", "name" : "Bob" },
                { "id" : "3", "name" : "Andrew" }
            ];

            this.testDte = new Y.DataTable.Base({
                columnset : [ 
                    { key:"id", sortable: true },
                    { key:"name", sortable: true }
                ],
                recordset : this.data
            });

            this.testDte.render();
        },

        tearDown: function() {
            this.testDte.destroy();
            delete this.testDte;
        },
        
        "test cellClick normally propagates to columnClick" : function() {
            var evtFired = false;

            this.testDte.on('columnClick', function(e) {
                evtFired = true;
            });

            this.testDte.get('contentBox').one('td').simulate('click');

            this.wait(function() {
                Y.Assert.isTrue(evtFired);
            }, 100);
        },

        "test preventing propagation after cellClick does not fire rowClick" : function() {
            var evtFired = false;

            this.testDte.on('cellClick', function(e) {
                e.event.preventPropagation();
            });

            this.testDte.on('rowClick', function(e) {
                evtFired = true;
            });
            
            this.testDte.get('contentBox').one('td').simulate('click');
            
            this.wait(function() {
                Y.Assert.isFalse(evtFired);
            },100);
        },
        
        "test preventing propagation after cellClick does not fire columnClick" : function() {
            var evtFired = false;

            this.testDte.on('cellClick', function(e) {
                e.event.preventPropagation();
            });

            this.testDte.on('columnClick', function(e) {
                evtFired = true;
            });
            
            this.testDte.get('contentBox').one('td').simulate('click');
            
            this.wait(function() {
                Y.Assert.isFalse(evtFired);
            },100);
        },
        
        "test preventing propagation after cellClick does not fire tbodyClick" : function() {
            var evtFired = false;

            this.testDte.on('cellClick', function(e) {
                e.event.preventPropagation();
            });

            this.testDte.on('tbodyClick', function(e) {
                evtFired = true;
            });
            
            this.testDte.get('contentBox').one('td').simulate('click');
            
            this.wait(function() {
                Y.Assert.isFalse(evtFired);
            },100);
        }      
    });

}, '@VERSION@', { requires: ['gallery-datatable-tableevents'] });

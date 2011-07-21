YUI.add('tableevents-test-click', function (Y) {

    Y.namespace('TestCase').TableEventsCaseClick = new Y.Test.Case({ 
        name: "gallery-datatable-tableevents test case : click",

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

        "test cell click fires on liner click": function() {
            var evtFired = false;

            this.testDte.on('cellClick', function(e) {
                evtFired = true;
            });

            this.testDte.get('contentBox').one('td').one('div').simulate('click');

            Y.Assert.isTrue(evtFired);
        },

        "test cell click fires on td click": function() {
            var evtFired = false;

            this.testDte.on('cellClick', function(e) {
                evtFired = true;
            });

            this.testDte.get('contentBox').one('td').simulate('click');

            Y.Assert.isTrue(evtFired);
        },

        "test row click fires on td click" : function() {
            var evtFired = false;

            this.testDte.on('rowClick', function(e) {
                evtFired = true;
            });

            this.testDte.get('contentBox').one('td').simulate('click');

            Y.Assert.isTrue(evtFired);      
        },

        "test column click fires on td click" : function() {
            var evtFired = false;

            this.testDte.on('columnClick', function(e) {
                evtFired = true;
            });

            this.testDte.get('contentBox').one('td').simulate('click');

            Y.Assert.isTrue(evtFired);        
        },

        "test tbody click fires on td click" : function() {
            var evtFired = false;

            this.testDte.on('tbodyClick', function(e) {
                evtFired = true;
            });

            this.testDte.get('contentBox').one('td').simulate('click');

            Y.Assert.isTrue(evtFired);        
        },
        
        "test table click fires on td click" : function() {
            var evtFired = false;

            this.testDte.on('tableClick', function(e) {
                evtFired = true;
            });

            this.testDte.get('contentBox').one('td').simulate('click');

            Y.Assert.isTrue(evtFired);              
        }
    });

}, '@VERSION@', { requires: ['gallery-datatable-tableevents'] });

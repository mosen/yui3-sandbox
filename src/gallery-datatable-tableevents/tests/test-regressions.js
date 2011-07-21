YUI.add('tableevents-test-regressions', function (Y) {

    Y.namespace('TestCase').TableEventsCaseRegressions = new Y.Test.Case({ 
        name: "gallery-datatable-tableevents test case : regressions",

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

        // This is just to make sure that the events fire sequentially.
        "test event handler on cellClick does not cause race with rowClick" : function() {
            var evtFired = false;
            
            this.testDte.on('cellClick', function(e) {
                Y.log('cellClick was fired, now ill do something else');

                // Trying to force a big processing time for cellClick
                for (i = 0; i < 100; i++) {
                    var n = Y.one('#busywork' + i);
                }

                Y.log('stopping cellClick propagation');
                e.event.stopPropagation();
            });

            this.testDte.on('rowClick', function(e) {
                evtFired = true;
            });

            this.testDte.get('contentBox').one('td').simulate('click');

            this.wait(function() { 
                Y.Assert.isFalse(evtFired);
            },100);                           
        }

    });

}, '@VERSION@', { requires: ['gallery-datatable-tableevents'] });

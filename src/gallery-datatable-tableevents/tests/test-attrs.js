YUI.add('tableevents-test-attrs', function (Y) {

    Y.namespace('TestCase').TableEventsCaseAttrs = new Y.Test.Case({ 
        name: "gallery-datatable-tableevents test case : attrs",

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

        // Make sure that setting events to the exact same values does not cause a change.
        "test setting new events with the same values does not cause eventsChange": function() {
            var defaultEvents = ['keydown', 'keyup', 'mousedown', 'mouseup', 'click', 'mouseover', 'mouseout', 'mouseenter', 'mouseleave', 'hover'],
                currentEvents = this.testDte.get('events');

            Y.ArrayAssert.itemsAreEqual(defaultEvents, currentEvents, "Check test data is the same as object data"); 

            this.eventsChanged = false;

            this.testDte.after('eventsChange', function(e) {
                Y.fail('eventsChange did fire when setting the same events');
            }, this);

            this.testDte.set('events', defaultEvents);

            this.wait(function() {  
                Y.Assert.isTrue(true, 'eventsChange event was not fired');
            }, 200);
        },

        "test setting new events with different values causes eventsChange" : function() {
            var newEvents = ['click', 'keyup', 'mousedown', 'mouseover'],
                evtFired = false;

            this.testDte.after('eventsChange', function(e) {
                evtFired = true;
            }, this);

            this.testDte.set('events', newEvents);

            Y.Assert.isTrue(evtFired, "test eventsChange event did fire after events change")
        }
    });

}, '@VERSION@', { requires: ['gallery-datatable-tableevents'] });

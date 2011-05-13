YUI().add('dp-table-test', function(Y) {

	var suite = new Y.Test.Suite("Y.DP.TableHeaders");

	// Test API before any DOM exists
	suite.add(new Y.Test.Case({

	    name: "Non PE Construction",
	    
	    setUp : function() {

            },

            tearDown : function() {

            },

            "test construction without parameters" : function() {
                var dpTableHeaders = new Y.DP.TableHeaders();
            }

	}));
		
	suite.add(new Y.Test.Case({

	    name: "PE Construction",
	    
	    setUp : function() {
                var tblNode = Y.Node.create('<table class="yui3-dp-table"></table>');
                var tHeadNode = Y.Node.create('<thead class="yui3-dp-table-headers yui3-dp-table-headers-loading"></thead>');
                var trNode = Y.Node.create('<tr class="yui3-dp-table-headers-columns">');
                var col = Y.Node.create('<th class="yui3-dp-table-headers-column" sortKey="name" width="400px">Name</th>');

                this.trNode = trNode;

                tblNode.append(tHeadNode.append(trNode.append(col)));
                Y.one('#petest').append(tblNode);

                this.dpTableHeaders = new Y.DP.TableHeaders({ srcNode: '.yui3-dp-table', boundingBox: '.yui3-dp-table-headers' });
                this.dpTableHeaders.render();
            },

            tearDown : function() {
                this.dpTableHeaders.destroy();

                Y.one('#petest').setContent('');
            },

            "test progressive enhancement does not delete markup" : function() {
                Y.Assert.areEqual(1, this.trNode.get('children').size(), "Single column still exists on page")
            },

            "test column text becomes span label" : function() {
                Y.Assert.areEqual("Name", this.trNode.one('th > span').get('innerHTML'), "Column header turned into label span");
            }

	}));


	Y.Test.Runner.add(suite);

}, '@VERSION@' ,{requires:['test', 'dp-table']});
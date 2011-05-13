YUI().add('dp-search-test', function(Y) {

	var suite = new Y.Test.Suite("Y.DP.Search");

	// Test API before any DOM exists
	suite.add(new Y.Test.Case({

	    name: "Constructed State",
	    
	    setUp : function() {
			this.dp_search = new Y.DP.Search();
		},
		
		tearDown : function() {
			this.dp_search.destroy();
		},
		
		"test default search value is empty string" : function() {
			Y.Assert.areEqual( '', this.dp_search.get('value'), "Initial value is empty string");
		}

	}));
	
	// Test API where markup is constructed
	suite.add(new Y.Test.Case({

	    name: "Non-PE Rendering",
	    
	    setUp : function() {
			this.dp_search = new Y.DP.Search();
			this.dp_search.render();
		},
		
		tearDown : function() {
			this.dp_search.destroy();
		},
		
		"test initial empty value shows tip" : function() {
			Y.Assert.areEqual( this.dp_search.get('strings.tip'), Y.one('input').get('value'), "initial empty search shows tip");
		},
		
		"test value is synchronised to input on construction" : function() {
			this.dp_search.set('value', 'testvalue');
			Y.Assert.areEqual( this.dp_search.get('value'), Y.one('input').get('value'), "Attribute value matches UI value.");
		}

	}));
	
	// Test API where markup is enhanced
	suite.add(new Y.Test.Case({

	    name: "PE Rendering",
	    
	    setUp : function() {
			// Markup required for PE
			var wrap = Y.Node.create('<div class="yui3-dp-search">');
			var fieldsNode = Y.Node.create('<select class="yui3-dp-search-fields"><option value="fieldname">fieldname</option></select>');
			var textNode = Y.Node.create('<input type="text" class="yui3-dp-search-input" value="testvalue2">');
			var searchBtn = Y.Node.create('<input type="button" class="yui3-dp-search-submit" value="search">');
			var resetBtn = Y.Node.create('<input type="button" class="yui3-dp-search-reset" value="reset">');
		
			wrap.append(fieldsNode).append(textNode).append(searchBtn).append(resetBtn);
			
			Y.one('#petest').append(wrap);

			this.inputNode = textNode;
			
			this.dp_search = new Y.DP.Search({ srcNode: '.yui3-dp-search' });
			this.dp_search.render();
		},
		
		tearDown : function() {
			this.dp_search.destroy();
		},
		
		"test value equals dom input value" : function() {
			Y.Assert.areEqual( 'testvalue2', this.dp_search.get('value'), 'Object value equals supplied dom value.');
		}

	}));
	
	// Test Post-Render Behaviour
	suite.add(new Y.Test.Case({
		
		name: "Post-Render Behaviour",

	    setUp : function() {
			this.dp_search = new Y.DP.Search();
			this.dp_search.render();
		},
		
		tearDown : function() {
			this.dp_search.destroy();
		},
		
		"test api value is reflected in dom value" : function() {
			this.dp_search.set('value', 'testvalue3');
			Y.Assert.areEqual( 'testvalue3', Y.one('input').get('value'), 'UI value matches value set via set()');
		}
		
	}));
	
	suite.add(new Y.Test.Case({
		
		name: "Dynamic Query Behaviour",

	    setUp : function() {
			this.dp_search = new Y.DP.Search();
			this.dp_search.render();
		},
		
		tearDown : function() {
			this.dp_search.destroy();
		},
		
		"test queryUpdate fired after value change" : function() {
			var test = this;
			/*
			this.dp_search.after('queryUpdate', function(e) { 
				test.resume(function(e) { 
					Y.Assert.isObject(e, "Query update fired with params.");
				});
			});
			this.dp_search.set('value', 'testvalue3');
			*/
		}
		
	}));
		

	Y.Test.Runner.add(suite);

}, '@VERSION@' ,{requires:['test', 'dp-search']});
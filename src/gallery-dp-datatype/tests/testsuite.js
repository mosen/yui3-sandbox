YUI().add('dp-datatype-test', function(Y) {

	var suite = new Y.Test.Suite("Y.DP.DataType");

	suite.add(new Y.Test.Case({

	    name: "Y.DP.DataType.DateTime Tests",

		_should: {
			error: {
				"Passing a MySQL DATE should throw TypeError" : true,
				"Passing a garbage string should throw TypeError": true		
			}
		},
	    
		setUp : function() {
			this.mysql_datetime = "2010-01-01 12:34:56";
			this.mysql_date = "2010-01-01";
			this.string_garbage = "zXe#%rfvcCd4%";
			this.valid_date = new Date();
		},

		tearDown : function() {
			this.mysql_datetime = null;
			this.mysql_date = null;
			this.string_garbage = null;
			this.valid_date = null;
		},
	    
		"Passing a MySQL DATETIME should return Date object" : function() {
			var d = Y.DP.DataType.DateTime.parse(this.mysql_datetime);
			Y.Assert.isInstanceOf(Date, d, "Parsing MySQL DATETIME returns Date object");
		},

		"Passing a MySQL DATE should throw TypeError" : function() {
			var d = Y.DP.DataType.DateTime.parse(this.mysql_date);
			Y.Assert.isInstanceOf(Date, d, "Parsing MySQL DATE returns Date object");
		},

		"Passing a garbage string should throw TypeError" : function() {
			var d = Y.DP.DataType.DateTime.parse(this.string_garbage);
			Y.Assert.isInstanceOf(Date, d, "Parsing random string returns Date object");
		},

		"Passing a date object should give us the same date object" : function() {
			var d = Y.DP.DataType.DateTime.parse(this.valid_date);
			Y.Assert.isInstanceOf(Date, d, "Parsing date object returns a date object");
			Y.Assert.areEqual(this.valid_date, d, "Returned date and passed date are the same");
		}
	}));

	Y.Test.Runner.add(suite);

}, '@VERSION@' ,{requires:['test', 'dp-datatype']});
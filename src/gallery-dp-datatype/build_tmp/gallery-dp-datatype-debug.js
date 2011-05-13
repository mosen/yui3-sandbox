YUI.add('gallery-dp-datatype', function(Y) {


	/**
	 * Cell renderers holds a set of instances which are called upon to render data into a cell in a specific way
	 */
	var Lang = Y.Lang,
		DATETIME_SEPARATOR = ' ',
		DATE_SEPARATOR = '-',
		TIME_SEPARATOR = ':';
	
	/**
	 * DataType parser for MySQL DATETIME to JS Date() object.
	 * 
	 */
	Y.namespace("DP.DataType").DateTime = {
	
            parse: function(data) {
                
                if (!(Lang.isDate(data))) {
                        // MySQL DATETIME Default Formatting, Quote:
                        // "MySQL retrieves and displays DATETIME values in 'YYYY-MM-DD HH:MM:SS' format."
                        if (data !== null && data.match(/[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}/)) {
                                var datetimeParts = data.split(DATETIME_SEPARATOR),
                                    timeParts = datetimeParts[1].split(TIME_SEPARATOR),
                                    dateParts = datetimeParts[0].split(DATE_SEPARATOR),
                                    y = dateParts[0],
                                    m = (dateParts[1] - 1),
                                    d = dateParts[2],
                                    h = timeParts[0],
                                    mins = timeParts[1],
                                    secs = timeParts[2],
                                    parsedDate = new Date(y, m, d, h, mins, secs);
                                      
                                return parsedDate;
                        } else {
                                // Fail silently
                                //throw new TypeError('Cannot parse a string that is not a MySQL DATETIME');
                        }
                }
                else {
                    return data;
                }
            }
	};


}, '@VERSION@' );

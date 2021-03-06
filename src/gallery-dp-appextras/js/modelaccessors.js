// A set of functions to deal with attribute setters and getters that deal with normalising database input or output
// to a suitable javascript variable type or structure

var DATETIME_SEPARATOR = ' ',
    DATE_SEPARATOR = '-',
    TIME_SEPARATOR = ':';

Y.namespace('DP').ModelAccessors = {

    /**
     * Standardised setter for date strings.
     *
     * @param data {Object} Instance of Date, Or String representation of date
     * @return {Date} Instance of Date.
     */
    _attrSetterDate : function(data) {
        if (data === null || data === undefined) {
            return null;
        } else {
            if (Y.Lang.isDate(data)) {
                return data;
            } else {
                // date.js was extremely slow with large numbers of objects
                // so we roll our own date parser for MSSQL DATETIME
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
                        return Date.parse(data);
                }
            }
        }
    }
};
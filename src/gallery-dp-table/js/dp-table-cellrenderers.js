//YUI.add('dp-table-cellrenderers', function(Y) {
	
/**
 * Cell renderers are implemented as functions which return closures that are seeded with the configuration.
 * Example closure: supplying a width parameter returns a function that renders a cell, and contains that width variable 'pre-seeded'.
 */
Y.namespace('DP').CellRenderers = {

        /**
         * Format a date field
         * 
         * @param data {Object} row data
         * @param field {String} field name
         * @param cellNode {Node} TD cell reference
         */
        date : function(data, field, cellNode) {
                var d = data[field];

                if (Lang.isDate(d)) {
                        cellNode.set('innerHTML', Y.DataType.Date.format(d, { format: '%x' }));
                } 
        },

        /**
         * Format a date field, using nice words for days if the date is close to the current date.
         * 
         * @param data {Object} row data
         * @param field {String} field name
         * @param cellNode {Node} TD cell reference
         */
        niceDate : function(data, field, cellNode) {
            Y.log("niceDate renderer", "info", "object");
                var d = data[field];

                if (Lang.isDate(d)) {
                        var today = new Date();
                        today.setHours(0,0,0,0); // Make sure the delta doesnt go negative when we take into account time.

                        var todayDelta = d - today,
                            todayDeltaDays = todayDelta/1000/60/60/24;

                        // Use nice format if difference is at most, a week into the future.
                        if (todayDeltaDays >= 0 && todayDeltaDays <= 6 ) {
                            if (todayDeltaDays < 1) {
                                cellNode.set('innerHTML', 'Today');
                            } else if (todayDeltaDays < 2) {
                                cellNode.set('innerHTML', 'Tomorrow');
                            } else {
                                cellNode.set('innerHTML', Y.DataType.Date.format(d, { format: '%A' }));
                            }
                        } else if (todayDeltaDays > -2 && todayDeltaDays < 0) { // Yesterday
                            cellNode.set('innerHTML', 'Yesterday');
                        } else {
                        // Use standard internationalised format.
                            cellNode.set('innerHTML', Y.DataType.Date.format(d, { format: '%x' }));
                        }
                }                  
        },

        /**
         * Format a field where the value is a key to a hash, defined as a json object on the page.
         * 
         * @param el String Selector for element holding hash values.
         * @return Function 
         */
        hash : function(el) {
                return function(data, field, cellNode) {
                    var valuesElement = el;

                    var optionsNode = Y.one(valuesElement),
                        options = Y.JSON.parse(optionsNode.get('innerHTML'));

                    cellNode.set('innerHTML', options[data[field]]);                          
                };
        },

        /**
         * Display a percentage as a visual progress bar
         */
        progress : function() {
            return function(data, field, cellNode) {

                var percentage_value = parseInt(data[field], 0),
                    TEXT_TEMPLATE = '<div class="yui3-dp-cellrenderer-progress-text">{text}</div>',
                    BAR_TEMPLATE = '<div class="yui3-dp-cellrenderer-progress" style="width: {width}%">{textnode}</div>',
                    BG_TEMPLATE = '<div class="yui3-dp-cellrenderer-progress-wrap">{bar}</div>';

                var text_percent = Y.substitute(TEXT_TEMPLATE, { text: percentage_value + '%' });
                var bar = Y.substitute(BAR_TEMPLATE, { width: percentage_value, textnode: text_percent });
                var back = Y.substitute(BG_TEMPLATE, { bar: bar });

                cellNode.append(Node.create(back));
            };
        }

};
	
//}, '1.0.0', { requires: ['lang', 'node', 'substitute', 'datatype-date', 'json-parse'] });
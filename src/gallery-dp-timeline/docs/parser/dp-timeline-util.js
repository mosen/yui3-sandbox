/**
 * Utility methods used to calculate dates and times for timeline
 * 
 * @class DP.TimelineUtil
 */
var TimelineUtil = {
    
        /**
         * @method rangeToDuration
         * @description Convert a range (2 dates) into a duration. Negative durations are possible. Finish date inclusive
         * @param start {Date} Starting date
         * @param finish {Date} Finishing date
         * @return Number Duration in days, may be negative
         * @public
         * @static
         */
        rangeToDuration : function(start, finish) {
            Y.log("rangeToDuration", "info", "Y.DP.TimelineUtil");

            // Adding a day to the duration because when we say start now finish now, we mean one day of duration
            // Because that is the minimum duration on the timeline
            var dayInMilliseconds = 1000*60*60*24,
                timeDiff = finish.getTime() - start.getTime(),
                timeDiffDays = Math.ceil(timeDiff/dayInMilliseconds) + 1;
                
            return timeDiffDays;
        },
        
        /**
         * @description Convert a range (2 dates) into a duration. Negative durations are possible. Finish date not inclusive
         * @method rangeToDifference
         * @param start {Date} Starting date
         * @param finish {Date} Finishing date
         * @return Number Duration in days, may be negative
         * @public
         * @static
         */        
        rangeToDifference : function(start, finish) {
            Y.log("rangeToDifference: " + start + " - " + finish, "info", "Y.DP.TimelineUtil");

            var dayInMilliseconds = 1000*60*60*24,
                timeDiff = finish.getTime() - start.getTime(),
                timeDiffDays = Math.floor(timeDiff/dayInMilliseconds);
                
            return timeDiffDays;
        },
        
        
        /**
         * @method zeroTime
         * @description Clear the time from a date
         * @param d {Date} Date to set time back to 00:00
         * @return Date date with time cleared
         * @public
         */
        zeroTime : function(d) {
            Y.log("clearDateTime", "info", "Y.DP.TimelineUtil");
            
            d.setHours(0);
            d.setMinutes(0);
            d.setSeconds(0);
            d.setMilliseconds(0);
            
            return d;
        },
        
        /**
         * @description Get a new date object with days added
         * @method addDays
         * @param d {Date} Date used as basis
         * @param days {Number} Number of days to add
         * @return Date Date with days added
         * @private
         */
        addDays : function(d, days) {
            Y.log("addDays", "info", "Y.DP.TimelineUtil");
            
            var returnDate = new Date();
            returnDate.setTime(d.getTime());
            returnDate.setDate(returnDate.getDate() + days);

            return returnDate;
        }
};


Y.namespace('DP').TimelineUtil = TimelineUtil;
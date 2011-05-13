YAHOO.env.classMap = {"DP.TimelineUtil": "gallery-dp-timeline", "DP.Timeline": "gallery-dp-timeline", "DP.TimelineEvent": "gallery-dp-timeline"};

YAHOO.env.resolveClass = function(className) {
    var a=className.split('.'), ns=YAHOO.env.classMap;

    for (var i=0; i<a.length; i=i+1) {
        if (ns[a[i]]) {
            ns = ns[a[i]];
        } else {
            return null;
        }
    }

    return ns;
};

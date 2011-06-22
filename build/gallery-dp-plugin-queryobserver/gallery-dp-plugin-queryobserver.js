YUI.add('gallery-dp-plugin-queryobserver', function(Y) {

/**
 *
 *
 * @module gallery-dp-plugin-queryobserver
 * @author mosen
 * @requires plugin, datasource
 */

/**
 * Observer class adds the ability for datasources to observe multiple sources that would
 * alter the results, combining the conditions provided by those sources.
 * 
 *
 * @class Observer
 * @extends Plugin.Base
 */
function QueryObserverPlugin(config) {
    QueryObserverPlugin.superclass.constructor.apply(this, arguments);
}

Y.mix(QueryObserverPlugin, {

    /**
     * The plugin namespace identifies the property on the host
     * which will be used to refer to this plugin instance.
     *
     * @property NS
     * @type String
     * @static
     */
    NS : "qobserver",

    /**
     * The plugin name identifies the event prefix and is a basis for generating
     * class names.
     * 
     * @property NAME
     * @type String
     * @static
     */
    NAME : "queryObserverPlugin",

    /**
     * The attribute configuration represents the core user facing state of 
     * the plugin.
     *
     * @property ATTRS
     * @type Object
     * @protected
     * @static
     */
    ATTRS : {
        
        /**
         * Hash of subject id's to arrays of their (generated) query parameters
         *
         * @attribute parameters
         * @type Object
         */
        parameters : {
            value : {}
        },
        
        /**
         * Callback to use when sending requests to the host.
         *
         * @attribute callback
         * @type Object
         */
        callback : {
            value : {
            }
        }
    }
   
});

Y.extend(QueryObserverPlugin, Y.Plugin.Base, {

    /**
     * Initializer runs when the plugin is constructed or plugged into the host instance.
     *
     * @method initializer
     * @param config {Object} Configuration object
     */
    initializer : function (config) {
        this.after('parametersChange', Y.bind(this._hostRequestWithNewParameters, this));
    },

    /**
     * Destructor runs when the plugin is unplugged
     * Base will automatically detach afterHostEvent/afterHostMethod methods.
     *
     * @method destructor
     */
    destructor: function() { 
    
    },
    
    /**
     * Notify this plugin that a subject's attribute has changed, as per the event hook(s) specified
     *
     * @method notify
     * @param subject_id {String} ID of the widget that changed
     * @param e {Event} CustomEvent facade
     * @param fnTransform {Function} function when applied to the subject will produce a hash of query parameters
     * @return null
     * @public
     */
    notify : function(subject, e, fnTransform) {
        
        var newParameters = fnTransform(subject, e),
            subject_id = subject.get('id') || subject.get('host').get('id'), // TODO: better way of generating identifiers for subjects.
            params = this.get('parameters');
            
        params[subject_id] = newParameters;
        
        this.set('parameters', params);
    },
    
    /**
     * Add a subject that this observer will observe.
     * 
     * By default the observer will observe changes in the subject's subjectParameters attribute.
     * You can supply a custom event hook in the configuration.
     * 
     * 
     *
     * @method observe
     * @param subject {Object} The object to observe
     * @param condition {Object} The on / after or before events that cause the state to be updated
     * @param fnTransform {Function} The function which converts widget state into query parameters, takes one parameter (the subject)
     * @returns Boolean true if added
     * @public
     */
    observe : function(subject, condition, fnTransform) {
        var evt_types = ['on', 'after', 'before'];
            
        // is this horrible unreadable junk? 
        // Iterate through each possible event type, adding a hook for that type if the supplied
        // condition object contains a key for it.
        // the property value can be a string or an array, in which case we hook all of those events to the
        // same fnTransform
        Y.Array.each(evt_types, function(v) {
           if (Y.Lang.isString(condition[v])) {
               // subject.after|on|before('attrChange|customEvent', (notify me using subject, event and xform))
               subject[v](condition[v], Y.bind(function(e) {this.notify(subject, e, fnTransform);}, this));
           } else if (Y.Lang.isArray(condition[v])) {
               Y.Array.each(condition[v], function(y) {
                   subject[v](y, Y.bind(function(e) {this.notify(subject, e, fnTransform);}, this));
               }, this);
           }
        }, this);

        // TODO: how to sync initial state?
        
        
        
        /* 
          Example case: search box causes datasource to query, no coupling between search box and datasource.
        
        - on page script connects observer to search box using observe()
        - observer gets initial state via fnTransform which returns hash of query parameters
        - observer immediately loads datasource OR waits until sync() is called after all subjects have been added
        - observer is told that it should run fnTransform on search box whenever valueChange happens.
        - valueChange -> observer, observer fnTransform(subject), observer calls datasource.sendRequest with result
        - datasource returns data, data updates (data based) widgets.
        
        - now we observe a list of tags, fnTransform gets the currently selected tag as a key=value
        - selectedTagChange -> observer, observer fnTransform(tagsubject) and fnTransform(searchbox) = all parameters, datasource.sendRequest(allparams)
        
        - cant close over fnTransform with subject included because?? no idea which subject originated the request
        - does that matter? actually can use e.target
        
        - multiple events fnTransform? how? eventspec can be array { before: [] | 'event', on: [] | 'event', after: [] | 'event' }
        
        - AutoComplete
        - observe(ac, { on: 'select' }, fnTransform( get selected item, return k:v ), datasource.sendRequest()
        - supply built-in transformers for common components
        - xfAutocomplete / xfSlider / xfTabView (filtering tabs) / gallery junk
        
        
        // this event will cause the observer to re-query every subject for state information using fnTransform...
        var eventDefault = (config.eventDefault == undefined) ? 'subjectParametersChange' : config.eventDefault, 
            fnTransformParams = config.fnTransformParams; // this function is called to transform the subject state into query parameter hashes
        
        // grab a closure that will take a subject change, transform the internal state
        subject.after(eventDefault, this._getQueryUpdateFn(this, subject));
        
        // grab initial state from subject
        // sync state only if waitForSync == false, otherwise only load datasource on sync() call
        
        // subject.on(queryParametersChange, this.updateParametersCollection THEN
        // afterParametersChange(this.datasource.sendRequest(with serialised parameters collection))

        var subjects = this.get('subjects');
        
        
        // Don't add duplicates
        if (Y.Array.indexOf(subjects, subject) !== undefined) {
            return false;
        } else {
            subjects.unshift(subject);
            this.set('subjects', subjects);
            return true;
        }*/
    },
    
    /**
     * When underlying parameters have changed, make a request to the host datasource.
     *
     * @method hostRequestWithNewParameters
     * @param
     * @returns
     * @protected
     */
    _hostRequestWithNewParameters : function(e) {
        var host = this.get('host'),
            params = this.get('parameters'),
            params_collected = [];
            
        // TODO: needs more efficient way of enumerating parameters
        for (subjectid in params) {
            var subject_params = params[subjectid];
            
            Y.Array.each(subject_params, function(v) {
                params_collected.push(v);
            }, this);
        }
            
        
        
        this.get('host').sendRequest({
            request: '?' + params_collected.join('&'),
            callback: this.get('callback')
        });
    }

    
});

Y.namespace("DP").QueryObserverPlugin = QueryObserverPlugin;


}, '@VERSION@' ,{requires:['plugin', 'datasource']});

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
 * The datasource observer differs from the normal observer pattern by defining a standard protocol
 * for the subjects.
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
         * List of subjects currently being observed.
         *
         * @attribute subjects
         * @type Array
         */
        subjects : {
            value : [],
            readOnly: true // Only add subjects via observe() method.
        }

    }
        
/*
         * Attribute properties:
         *  
         * , valueFn: "_defAttrAVal"      // Can be used as a substitute for "value", when you need access to "this" to set the default value.
         *   
         * , setter: "_setAttrA"          // Used to normalize attrA's value while during set. Refers to a prototype method, to make customization easier
         * , getter: "_getAttrA"          // Used to normalize attrA's value while during get. Refers to a prototype method, to make customization easier
         * , validator: "_validateAttrA"  // Used to validate attrA's value before updating it. Refers to a prototype method, to make customization easier
         * , readOnly: true               // Cannot be set by the end user. Can be set by the component developer at any time, using _set
         * , writeOnce: true              // Can only be set once by the end user (usually during construction). Can be set by the component developer at any time, using _set
         * 
         * , lazyAdd: false               // Add (configure) the attribute during initialization. 
         * 
         *                                // You only need to set lazyAdd to false if your attribute is
         *                                // setting some other state in your setter which needs to be set during initialization 
         *                                // (not generally recommended - the setter should be used for normalization. 
         *                                // You should use listeners to update alternate state). 
         * , broadcast: 1                 // Whether the attribute change event should be broadcast or not.
         */
   
});

Y.extend(QueryObserverPlugin, Y.Plugin.Base, {

    /**
     * Initializer runs when the plugin is constructed or plugged into the host instance.
     *
     * @method initializer
     * @param config {Object} Configuration object
     */
    initializer : function (config) {

    // See Y.Do.before, Y.Do.after
    //this.beforeHostMethod("show", this._beforeHostShowMethod);
    //this.afterHostMethod("show", this._afterHostShowMethod);

    // See Y.EventTarget.on, Y.EventTarget.after
    //this.onHostEvent("render", this._onHostRenderEvent);             
    //this.afterHostEvent("render", this._afterHostRenderEvent);
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
     * @param fnTransform {Function} The function which converts widget state into query parameters
     * @returns Boolean true if added
     * @public
     */
    observe : function(subject, condition, fnTransform) {
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
        /*
        var subjects = this.get('subjects');
        
        Y.log("observe", "info", this.NAME);
        
        // Don't add duplicates
        if (Y.Array.indexOf(subjects, subject) !== undefined) {
            return false;
        } else {
            subjects.unshift(subject);
            this.set('subjects', subjects);
            return true;
        }*/
    }

    
});

Y.namespace("DP").QueryObserverPlugin = QueryObserverPlugin;
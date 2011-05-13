YUI.add('gallery-dp-search', function(Y) {

	
/**
 * Search widget
 * 
 * @module dp-search
 * @requires widget
 */
var Lang = Y.Lang,
    Node = Y.Node;

/**
 * Search widget which allows keyword searching and a specified search field.
 * 
 * @class Y.DP.Search
 * @extends Y.Widget
 */
Y.namespace('DP').Search = Y.Base.create('dp-search', Y.Widget, [], {

        // @see Y.Base.initializer
        initializer : function(config) {
                Y.log('gallery-dp-search:init');

                this.publish('queryUpdate', {defaultFn: this._defQueryUpdateFn});
        },

        // @see Y.Base.destructor
        destructor : function() {
            
        },

        // @see Y.Widget.renderUI
        renderUI : function() {
                var contentBox = this.get('contentBox');
                this._renderInput(contentBox);
                this._renderFieldSelector(contentBox);
                this._renderButtons(contentBox);
        },

        /**
         * Render the input node for the search terms
         * 
         * @method _renderInput
         * @protected
         */
        _renderInput : function(contentBox) {
                if (!this.get('inputNode')) {
                    var inputNode = Node.create(Y.substitute(this.TEMPLATE_INPUT, { className: this.getClassName('input') }));
                    this.set('inputNode', inputNode);

                    contentBox.append(inputNode);
                }
        },

        // TODO : optional plugin api for adding a pull down which shows a field selector or previous searches.
        _renderFieldSelector : function() {

        },

        /**
         * Render the search and reset buttons
         */
        _renderButtons : function(contentBox) {

                if (!this.get('searchButtonNode')) {

                    var submitBtn = Node.create(Y.substitute(this.TEMPLATE_BUTTON, { 
                        className : this.getClassName('submit'), value : this.get('strings.submitLabel') } ));
                    contentBox.append(submitBtn);

                    this.set('searchButtonNode', submitBtn);
                }

                if (!this.get('resetButtonNode')) {
                    var resetBtn = Node.create(Y.substitute(this.TEMPLATE_BUTTON, { 
                        className : this.getClassName('reset'), value : this.get('strings.resetLabel') } ));
                    contentBox.append(resetBtn);

                    this.set('resetButtonNode', resetBtn);
                }
        },

        // @see Y.Widget.bindUI
        bindUI : function() {
                
                this.get('inputNode').on('focus', this._handleInputFocus, this);
                this.get('inputNode').on('blur', this._handleInputBlur, this);

                var keyEventSpec = (!Y.UA.opera) ? "down:" : "press:";
                keyEventSpec += "13";
                this.get('inputNode').on('key', this._handleInputEnterKey, keyEventSpec, this);

                if (this.get('timeout') > 0) {
                    this.get('inputNode').on('keypress', this._handleInputKeyPress, this);
                }

                Y.one('.yui3-dp-search-reset').on('click', this._handleResetClick, this); // Reset sets value to blank
                Y.one('.yui3-dp-search-submit').on('click', this._uiSetValue(), this);

                this.after('valueChange', this._afterValueChange);
                this.after('fieldChange', this._afterFieldChange);
        },

        // @see Y.Widget.syncUI
        syncUI : function() {
                this._uiSetValue();
        },

        /**
         * State of the search tip
         * 
         * @attribute _tipShown
         * @type Boolean
         * @private
         */
        _tipShown: false,

        /**
         * Show the search text tip
         * 
         * @method showTip
         * @public
         */
        showTip : function() {
                this.get('inputNode').addClass(this.getClassName('input', 'tip'));
                this.get('inputNode').set('value', this.get('strings.tip'));
                this._tipShown = true;
        },

        /**
         * Hide the search text tip
         * 
         * @method hideTip
         * @public
         */
        hideTip : function() {
                this.get('inputNode').removeClass(this.getClassName('input', 'tip'));
                this.get('inputNode').set('value', '');
                this._tipShown = false;
        },

        /**
         * Handle input got focus
         * 
         * @method _handleInputFocus
         * @protected
         */
        _handleInputFocus : function() {
                if (this._tipShown) {
                        this.hideTip();
                }
        },

        /**
         * Handle input got blur event
         * 
         * @method _handleInputBlur
         * @protected
         */
        _handleInputBlur : function() {
                Y.log('gallery-dp-search:_handleInputBlur');

                if (this._tipShown === false) {
                    if (this.get('searchOnBlur') === true) {
                        this.set('value', this.get('inputNode').get('value'));
                    }
                    this._uiSetValue();
                }
        },

        /**
         * Handle input got enter key event
         * 
         * @method _handleInputEnterKey
         * @protected
         */
        _handleInputEnterKey : function(e) {
                Y.log('gallery-dp-search:_handleInputKey');

                this.set('value', this.get('inputNode').get('value'));
                this.get('inputNode').blur();
        },

        /**
         * Handle input got keypress (any key)
         * 
         * Starts or resets the countdown timer to auto search
         * 
         * @method _handleInputKeyPress
         * @param {Event} e Event facade
         * @protected
         */
        _handleInputKeyPress : function(e) {
                Y.log('gallery-dp-search:_handleInputKeyPress');

                if (this._currentTimeoutID !== null || this._currentTimeoutID !== undefined) { clearTimeout(this._currentTimeoutID); }
                this._currentTimeoutID = setTimeout(Y.bind(this._handleTimeoutElapsed, this), this.get('timeout'));
        },

        /**
         * Handle timeout elapsed
         * 
         * Sets the value because the user stopped typing
         * 
         * @method _handleTimeoutElapsed
         * @param {Event} e Event facade
         * @protected
         */
        _handleTimeoutElapsed : function(e) {

            Y.log('gallery-dp-search:_handleTimeoutElapsed');
            this.set('value', this.get('inputNode').get('value'));
        },

        /**
         * Handle click on reset. Sets value back to empty.
         * 
         * @method _handleResetClick
         * @protected
         */
        _handleResetClick : function() {
                this.set('value', '');
        },

        /**
         * Handle search value changed
         * 
         * @method _afterValueChange
         * @protected
         */
        _afterValueChange : function() {
                Y.log('_afterValueChange', 'info', 'gallery-dp-search');

                this._uiSetValue();

                this.fire('queryUpdate', { parameters: { 
                        q: this.get('value') // the query string (keywords)
                }});
        },

        /**
         * Handle search field changed
         * 
         * @method_afterFieldChange
         * @protected
         */
        _afterFieldChange : function() {
                Y.log('gallery-dp-search:_afterFieldChange');

                this._uiSetField();
        },

        /**
         * Set the UI to reflect the 'value' attribute.
         * 
         * @method _uiSetValue
         */
        _uiSetValue : function() {
                var value = this.get('value');

                if ('' === value) {
                        Y.log('gallery-dp-search:Showing search tip');
                        this.showTip();
                } else {
                        this.get('inputNode').set('value', value);				
                }
        },

        /**
         * Set the UI to reflect the 'field' attribute.
         * @todo Stub method - update field selector
         */
        _uiSetField : function() {
                //var field = this.get('field');

        },

        /**
         * Default handler for queryUpdate
         * @method _defQueryUpdateFn
         * @param {Event} e Event facade
         */
        _defQueryUpdateFn : function(e) {
                Y.log('_defQueryUpdateFn', 'info', 'gallery-dp-search');
        },

        /**
         * HTML Fragment for the keyword input box
         * 
         * @property TEMPLATE_INPUT
         * @type String
         */
        TEMPLATE_INPUT : '<input type="text" class="{className}" value="">',

        /**
         * HTML Fragment for the search and reset buttons
         * 
         * @property TEMPLATE_BUTTON
         * @type String
         */
        TEMPLATE_BUTTON : '<input type="button" class="{className}" value="{value}">'

}, {
        /**
         * Holds a reference to the current keypress timeout. Used for searching automatically after an elapsed period.
         * 
         * @property _currentTimeoutID
         * @type Integer
         * @private
         */ 
        _currentTimeoutID : null,

        HTML_PARSER : {
                contentBox : '.yui3-dp-search',
                inputNode : '.yui3-dp-search-input',
                inputWrapper : '.yui3-dp-search-input-wrapper',
                resetButtonNode : '.yui3-dp-search-reset',
                searchButtonNode : '.yui3-dp-search-submit',
                value : function(srcNode) {
                        var input = srcNode.one('.yui3-dp-search-input');
                        if (input) {
                            return input.get('value');
                        } else {
                            return '';   
                        }
                }
        },

        ATTRS : {
                /**
                 * Node reference to the INPUT which holds the search term.
                 * 
                 * @attribute inputNode
                 * @type Node
                 */
                inputNode : {},

                /**
                 * Node reference to the wrapper around the input and pulldown elements.
                 * 
                 * @attribute inputWrapper
                 * @type Node
                 */
                inputWrapper : {},

                /**
                 * Node reference to the reset search terms button
                 * @attribute resetButtonNode
                 * @type Node
                 */
                resetButtonNode : {},

                /**
                 * Node reference to the search submit button
                 * @attribute searchButtonNode
                 * @type Node
                 */
                searchButtonNode : {},

                /**
                 * Timeout in milliseconds for search to submit the current terms
                 * 
                 * Submits the current search terms if the timeout specified has elapsed. Set to 0 in order to disable this function.
                 * @attribute timeout
                 * @type Integer
                 */
                timeout : {
                    value : 150,
                    validator : Lang.isNumber
                },
                
                /**
                 * Whether to fire a search event when the input box loses focus
                 * 
                 * @attribute searchOnBlur
                 * @type Boolean
                 */
                searchOnBlur : {
                    value : true,
                    validator : Lang.isBoolean
                },

                /**
                 * The field to search
                 * 
                 * @attribute field
                 * @type String
                 */
                field : {
                        value : null
                },

                /**
                 * The search keyword(s). changing this fires a queryUpdate event.
                 * 
                 * @attribute value
                 * @type String
                 */
                value : {
                        value : "",
                        validator : Lang.isString
                },
                

                /**
                 * Strings that can be used with internationalisation.
                 * 
                 * @attribute strings
                 * @type Object
                 */
                strings : {
                        value : {
                                tip: "Enter text to search",
                                submitLabel: "search",
                                resetLabel: "reset"
                        }
                }
        }
});


}, '@VERSION@' ,{requires:['base', 'widget', 'substitute']});

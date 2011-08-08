YUI.add('gallery-dp-editable', function(Y) {

/**
 * @module gallery-dp-editable
 * @author eamonb
 * @requires Node
 */

/* Frequently used shortcuts, strings and constants */
var Lang = Y.Lang,
    YGetClassName = Y.ClassNameManager.getClassName,
    
    CLASS_BASE = YGetClassName('gallery', 'dp', 'editable'),
    CLASS_FORM = CLASS_BASE + '-form',
    CLASS_INPUT = CLASS_BASE + '-input',
    CLASS_BTN_SUBMIT = CLASS_BASE + '-submit',
    CLASS_BTN_CANCEL = CLASS_BASE + '-cancel',
    CLASS_PLACEHOLDER = CLASS_BASE + '-placeholder',
    CLASS_FIELD = CLASS_BASE + '-field',
    CLASS_FIELD_SAVING = CLASS_BASE + '-field-saving';

/**
 * Editable creates an in-place editor for html element text content.
 * It is loosely based on jEditable of jQuery fame.
 *
 * @class EditableBase
 * @extends Widget
 * @constructor
 */
function EditableBase() {

    this.publish('save', {defaultFn: this._defFnSave});
    this.publish('cancel', {defaultFn: this._defFnCancel});
    
    this.after('savingChange', this._uiSetSaving, this);
    this.after('editingChange', this._uiSetEditing, this);
}

Y.mix(EditableBase, {

    NAME : "editableBase",

    ATTRS : {
        // TODO: implement the select editor
        
        /**
         * The collection of strings to be used for the widget UI
         * If using the intl module, strings can be shipped separately.
         *
         * @attribute strings
         * @type Array
         */
        strings : {
            value : {
                // added as a title attribute
                tooltip : 'Click to edit...',
                
                // caption for the cancel button
                cancel : 'Cancel',
                
                // caption for the save button
                submit : 'OK',
                
                // span is added with this text during XHR transactions
                indicator : 'Saving...',
                
                // this will be used when there is an empty field to edit, to provide somewhere to click
                placeholder : 'Click to edit...'
            }
        },
        
        /**
         * Reference to the node where the events are attached.
         * When editing a single node, this will be the same as editingnode.
         * When delegating, this will be the node where the delegate is attached.
         *
         * @attribute targetnode
         * @type Node
         * @default null
         */
        targetnode : {
            value : null
        },
  
        /**
         * Reference to the node being edited / where the editor will appear.
         * When there is no node being edited, the value will be null.
         *
         * @attribute editingnode
         * @type Node
         * @default null
         */
        editingnode : {
            value : null
        },
        
        /**
         * The DOM event which will start editing of the node.
         *
         * @attribute event
         * @type String
         * @default 'click'
         */
        event : {
            value : 'click'
        },
        
        /**
         * Contains the content of the node before editing started.
         * This provides an easy way to restore state without parsing back the
         * value
         *
         * @attribute prevContent
         * @type String
         * @default null
         */
        prevContent : {
            value : null
        },

        /**
         * The type of editing field that will be presented when in editing mode
         * 
         * Value can be one of 'text', 'textarea', 'select'
         *
         * @attribute type
         * @type String
         * @default text
         */
        type : {
            value : 'text',
            validator: '_validateAttrType'
        },
        
        /**
         * The rows attribute applied to a textarea field (if that is the selected type)
         * Not selecting a value will not add the attribute to the textarea element.
         *
         * @attribute rows
         * @type Number
         * @default null
         */
        rows : {
            value : null
        },
        
        /**
         * The cols attribute applied to a textarea field (if that is the selected type)
         * Not selecting a value will not add the attribute to the textarea element.
         *
         * @attribute cols
         * @type Number
         * @default null
         */
        cols : {
            value : null
        },

        /**
         * Where the editor data will be posted during save.
         * 
         * This can be a string or a function, or null.
         * 
         * If it is a string then the string is used as an XHR uri.
         * 
         * If it is a function then the function is executed with arguments (editing_node, callback).
         * The callback must be executed to let editable know that the save is complete
         * 
         * If it is null, then the text content will be appended to the html element
         * being edited.
         *
         * @attribute submitto
         * @type String|Function
         * @default null
         */
        submitto : {
            value : null
        },

        /**
         * HTTP method to use when submitting data.
         *
         * @attribute method
         * @type String
         * @default 'POST'
         */
        method : {
            value : 'POST'
        },

        /**
         * The source to load data from, if the html content does not contain the data.
         * eg. markdown/textile
         * 
         * If the source is a string, then we will invoke IO to get the data.
         * 
         * TODO: If the source is an instance of DataSource then that will be used.
         * 
         * TODO: if the source is a function then call the function when loading data.
         *
         * @attribute loadfrom
         * @type String|Function
         * @default null
         */
        loadfrom : {
            value : null
        },
        
        /**
         * Whether we are currently editing or not.
         *
         * @attribute editing
         * @type Boolean
         * @default false
         */
        editing : {
            value : false
        },
        
        /**
         * Whether saving is in progress
         *
         * @attribute saving
         * @type Boolean
         * @default false
         */
        saving : {
            value : false
        },
        
        /**
         * Whether the contents of the editor will be selected when editing starts.
         *
         * @attribute select
         * @type Boolean
         * @default false
         */
        select : {
            value : false
        },
        
        /**
         * Width of the input, applied to its inner style
         * If the value is 'auto' then the width is set from the width of the original element to be edited.
         *
         * @attribute inputWidth
         * @type String
         * @default 'auto'
         */
        inputWidth : {
            value : 'auto'
        },
        
        /**
         * Height of the input, applied to its inner style
         * If the value is 'auto' then the height is set from the height of the original element to be edited.
         *
         * @attribute inputHeight
         * @type String
         * @default 'auto'
         */
        inputHeight : {
            value : 'auto'
        },
        
        /**
         * What action to take when the editor receives the blur event.
         *
         * @attribute onblur
         * @type String
         * @default 'cancel'
         */
        onblur : {
            // TODO validator: in array ['cancel', 'submit', function, null?]
            value : 'cancel'
        },
        
        /**
         * Use this value if you are delegating editors to a group of sub-elements
         * 
         * The value is a selector to the elements to delegate to.
         *
         * @attribute delegate
         * @type String
         * @default null
         */
        delegate : {
            value : null
        }
    }
});

EditableBase.prototype = {
    
    /**
     * Destructor runs when destroy() is called.
     * 
     * Anything under the widgets bounding box will be cleaned up.
     * We only need to clean up nodes/events attached outside of the bounding Box
     *
     * @method destructor
     * @protected
     */
    destructor: function() { 
        this.get('targetnode').detach(this.get('event'));
    },
    
    /**
     * Bind editor events
     *
     * @method _bindEditableBase
     * @protected
     */
    _bindEditableBase : function() {
        
        // Only delegate editor if delegate contains a selector
        if (null === this.get('delegate')) {
            this.get('targetnode').on(this.get('event'), Y.bind(this._onClick, this));
        } else {
            this.get('targetnode').delegate(this.get('event'), this._onClick, this.get('delegate'), this);
        }
    },
    
    /**
     * Sync lifecycle
     * 
     * At the moment will only show the placeholder when there are no child nodes
     * on the editable node.
     *
     * @method _syncEditableBase
     * @protected
     */
    _syncEditableBase : function() {
        var editablenodes;
        
        
        if (null === this.get('delegate')) {
            editablenodes = this.get('editingnode');
        } else {
            editablenodes = this.get('targetnode').all(this.get('delegate'));
        }
        
        // Style the nodes eligable for editing
        editablenodes.set('title', this.get('strings.tooltip'));
        editablenodes.addClass(CLASS_FIELD);

        // TODO: suggest placeholder for delegated items
        if (this.get('targetnode').get('innerHTML').length === 0) {
            this.get('targetnode').append(this._renderPlaceHolder());
        }
    },
    
    /**
     * Render the placeholder
     *
     * @method _renderPlaceHolder
     * @returns {Node} Node instance of the placeholder
     * @protected
     */
    _renderPlaceHolder : function() {
        
        return Y.Node.create(Y.substitute(this.TEMPLATE_PLACEHOLDER, {
                    className: CLASS_PLACEHOLDER,
                    text: this.get('strings.placeholder')
               }));
    },
    
    /**
     * Validate the 'type' attribute as being a valid editor type.
     *
     * @method _validateAttrType
     * @param v {String} Value to validate
     * @returns {Boolean}
     * @protected
     */
    _validateAttrType : function(v) {
        return ('textarea' == v || 'text' == v || 'select' == v) ? true : false;
    },

    /**
     * Handle the editing node being clicked
     *
     * @method _onClick
     * @param e {Event} Event facade
     * @returns
     * @protected
     */
    _onClick : function(e) {
        var editNode = this.get('editingnode');
        
        
        e.halt();

        // Ignore events inside the current editor
        if (this.get('editing') === true && editNode !== null && editNode.contains(e.target)) {
            return false;
        }
        
        // If a delegate node other than the current has been clicked, save then switch to that editor
        if (this.get('editing') === true && e.currentTarget.get('id') != editNode.get('id')) {
            this.save();
        }
 
        this.edit(e.currentTarget);
    },
    
    /**
     * Cancel button clicked in editor
     *
     * @method _onClickCancel
     * @param e {Event} Event facade
     * @returns
     * @public
     */
    _onClickCancel : function(e) {
        e.stopPropagation();
        
        this.discard();
    },
    
    /**
     * Save button clicked in editor
     *
     * @method _onClickSave
     * @param
     * @returns
     * @public
     */
    _onClickSave : function(e) {
        e.stopPropagation();
        
        this.save();
    },
    
    /**
     * Handler for all key events.
     *
     * @method _onKey
     * @param e {Event} Event facade
     * @returns
     * @protected
     */
    _onKey : function(e) {

        e.halt();
        
        if (e.keyCode == 27) {
            this.discard();
        } else if (e.keyCode == 13) {
            this.save();
        }
    },
    
    /**
     * An event fired which indicated that we are saving the editor data.
     *
     * @method _uiSetSaving
     * @param e {Event} Event facade
     * @returns
     * @public
     */
    _uiSetSaving : function(e) {
        
        if (null != this.get('editingnode')) {     
            if (true === this.get('saving')) {
                this.get('editingnode').addClass(CLASS_FIELD_SAVING);
            } else {
                this.get('editingnode').removeClass(CLASS_FIELD_SAVING);
            }
        }
    },
    
    /**
     * The state of this variable determines if the editor is shown or not.
     *
     * @method _uiSetEditing
     * @param e {Event} Event facade
     * @returns
     * @public
     */
    _uiSetEditing : function(e) {
        
        if (true === this.get('editing')) {
            

            if (true === e.prevVal) {return false;} // Don't edit twice

            var form = this._renderForm(),
                editingnode = this.get('editingnode'),
                placeholder = this.get('editingnode').one('.'+CLASS_PLACEHOLDER),
                value,
                loadfrom = this.get('loadfrom');

            this.set('prevContent', editingnode.get('innerHTML'));
            
            if (placeholder) {
                placeholder.remove();
            }

            if (Y.Lang.isFunction(loadfrom)) {
                value = loadfrom(editingnode);
                
            } else if (Y.Lang.isString(loadfrom)) {
                // dispatch xhr request
                
            } else if (Y.Lang.isNull(loadfrom)) {
                value = editingnode.get('textContent');
            }

            editingnode.set('innerHTML', '');  
            editingnode.append(form);

            this._input.set('value', value);
            this._input.focus();

            if (true === this.get('select')) {
                this._input.select();
            }
            
        } else {
            // implicit save or cancel?         
        }
    },
    
    /**
     * Default function fired after save event.
     * Uses submitto attribute to determine how the change will be processed
     *
     * @method _defFnSave
     * @param e {Event} Event facade
     * @returns undefined
     * @protected
     */
    _defFnSave : function(e) {
    },
    
    /**
     * Default function fired after cancel event.
     *
     * @method _defFnCancel
     * @param
     * @returns
     * @protected
     */
    _defFnCancel : function() {
    },
    
    /**
     * Render the form element which will contain the selected editor type.
     *
     * @method _renderForm
     * @param
     * @returns
     * @protected
     */
    _renderForm : function() {
        
        var type = this.get('type'),
            frm = Y.Node.create(Y.substitute(this.TEMPLATE_FORM, {
                className : CLASS_FORM
            })),
            input,
            buttons,
            inputWidth = this.get('inputWidth'),
            inputHeight = this.get('inputHeight');

        switch(type) {
            case 'textarea':
                input = Y.Node.create(Y.substitute(this.TEMPLATE_INPUT_TEXTAREA, {className: CLASS_INPUT}));
                
                if (this.get('rows') !== null) {input.setAttribute('rows', this.get('rows'));}
                if (this.get('cols') !== null) {input.setAttribute('cols', this.get('cols'));}
                break;
                
            case 'select':
                input = Y.Node.create(Y.substitute(this.TEMPLATE_INPUT_SELECT, {className: CLASS_INPUT}));
                break;
                
            case 'text':
            default:
                input = Y.Node.create(Y.substitute(this.TEMPLATE_INPUT_TEXT, {className: CLASS_INPUT}));
                break;
        }
        
        // Consider that the settings still apply to textareas with cols and rows specified.
        if (inputWidth !== 'auto') {input.setStyle('width', inputWidth);}
        if (inputHeight !== 'auto') {input.setStyle('height', inputHeight);}
        // TODO: automatic sizing of editor based on original element?
        
        // TODO: Do we really need to keep a node reference to the input? some editors might not use inputs
        this._input = input;
        this._input.on('key', this.save, "enter", this); // Enter = save
        this._input.on('key', this.discard, "esc", this); // ESC = discard
        frm.append(this._input);
        
        buttons = Y.Node.create(Y.substitute(this.TEMPLATE_BUTTONS, { 
            classNameSubmit: CLASS_BTN_SUBMIT,
            classNameCancel: CLASS_BTN_CANCEL,
            labelSubmit: this.get('strings.submit'),
            labelCancel: this.get('strings.cancel')
        }));
        
        buttons.one('.'+CLASS_BTN_CANCEL).on('click', this._onClickCancel, this);
        buttons.one('.'+CLASS_BTN_SUBMIT).on('click', this._onClickSave, this);
        
        frm.append(buttons);
        return frm;
    },
    
    /**
     * Start editing
     *
     * @method edit
     * @param node {Node} The node to edit
     * @public
     */
    edit : function(node) {
        
        this.set('editingnode', node);
        this.set('editing', true);
    },
    
    /**
     * Save changes
     *
     * @method save
     * @param
     * @returns
     * @public
     */
    save : function() {
        var editingnode = this.get('editingnode'),
            submitto = this.get('submitto');
        

        this.set('saving', true);

        if (Y.Lang.isFunction(submitto)) {
            submitto(editingnode, Y.bind(this.saveComplete, this));
            this.set('editing', false);
            
        } else if (Y.Lang.isString(submitto)) {
            // XHR
            var value = this._input.get('value');
            this.get('editingnode').set('innerHTML', '');
            this.get('editingnode').append(value);
            
            Y.io(Y.substitute(submitto, {value: this._input.get('value')}), {
                on : {
                    start: function(id, o, args) {this.set('saving', true);},
                    success: function(id, o, args) { 
                        this.set('saving', false);
                        this.set('editing', false);
                        this.fire('save', o);
                    },
                    failure: function(id, o, args) { 
                        this.set('saving', false);
                        this.set('editing', false);
                        this.get('editingnode').set('innerHTML', this.get('prevContent'));
                        // TODO: display a warning
                    }
                },
                context : this,
                arguments : {
                    node : editingnode
                }
            });           
        } else if (null === submitto) {
            
            var value = this._input.get('value');
            this.get('editingnode').set('innerHTML', '');
            this.get('editingnode').append(value);

            this.set('editing', false);
            this.set('saving', false);
            this.set('prevContent', null);
            this.set('editingnode', null);

        }
        
        //this.fire('save', {value: editorvalue, node: editingnode});
    },
    
    /**
     * Indicate that saving is complete.
     * This is called by external functions which handle the saving of data
     * from the editor when they have completed, so that the editor
     * can clean up the UI and state.
     *
     * @method saveComplete
     * @param
     * @returns
     * @public
     */
    saveComplete : function() {
        
        this.set('saving', false);
        this.set('prevContent', null);
        this.set('editingnode', null);
    },
    
    /**
     * Request that changes be saved (async)
     *
     * @method requestSave
     * @param value {String} Value to save
     * @param node {Node} Node which is currently having its content saved.
     * @returns
     * @public
     */
    requestSave : function(value, node) {
        var submitto = this.get('submitto'),
            submitvalues = this.get('fnSubmitValues') !== null ? this.get('fnSubmitValues')(this.get('editingnode'), value) : {value : value};
        
        
        if (Y.Lang.isString(submitto)) {
            Y.io(Y.substitute(submitto, submitvalues), {
                on : {
                    start: this._uiSetSaving,
                    success: this._uiSetSaveSuccess,
                    failure: this._uiSetSaveFailure
                },
                context : this,
                arguments : {
                    value : value,
                    node : node
                }
            });
        } else if (Y.Lang.isFunction(submitto)) {
            submitto();
        }
    },
    
    /**
     * Discard changes and revert to initial state
     *
     * @method discard
     * @param
     * @returns
     * @public
     */
    discard : function() {
        var editingnode = this.get('editingnode');
        
        
        editingnode.set('innerHTML', this.get('prevContent'));
        this.set('prevContent', null);
        this.set('editingnode', null);
        this.set('editing', false);
        
        this.fire('cancel');
    },
    
    /**
     * Clear editor data and return to placeholder state
     *
     * @method clear
     * @param
     * @returns
     * @public
     */
    clear : function() {
        var editingnode = this.get('editingnode'),
            targetnode = this.get('targetnode');
        

        targetnode.set('innerHTML', '');
        targetnode.append(this._renderPlaceHolder());
        this.set('prevContent', null);
        //this.set('editingnode', null);
        this.set('editing', false);
        
    },

    /**
     * Template used to create the form which contains the editor.
     *
     * @property TEMPLATE_FORM
     * @type {$type default=String}
     * @value '<form class="{className}"></form>'
     */
    TEMPLATE_FORM: '<form class="{className}"></form>',
    
    /**
     * Template used to create the input element
     *
     * @property TEMPLATE_INPUT_TEXT
     * @type {$type default=String}
     * @value '<input type="text" class="{className}"></input>'
     */
    TEMPLATE_INPUT_TEXT: '<input type="text" class="{className}"></input>',
    
    /**
     * Template used to create the input element
     *
     * @property TEMPLATE_INPUT_TEXTAREA
     * @type {$type default=String}
     * @value '<textarea class="{className}"></textarea>'
     */
    TEMPLATE_INPUT_TEXTAREA: '<textarea class="{className}"></textarea>',
    
    /**
     * Template used to create the input element
     *
     * @property TEMPLATE_INPUT_SELECT
     * @type {$type default=String}
     * @value '<select class="{className}"></select>'
     */
    TEMPLATE_INPUT_SELECT: '<select class="{className}"></select>',

    /**
     * Template used to create the save/cancel action buttons
     *
     * @property TEMPLATE_BUTTONS
     * @type {$type default=String}
     * @value '<input type="button" value="{labelCancel}" class="{classNameCancel}"></input><input type="button" value="{labelSubmit}" class="{classNameSubmit}"></input>'
     */
    TEMPLATE_BUTTONS: '<input type="button" value="{labelCancel}" class="{classNameCancel}"></input><input type="button" value="{labelSubmit}" class="{classNameSubmit}"></input>',
    
    /**
     * Template used to display a placeholder when there is no text content.
     *
     * @property TEMPLATE_PLACEHOLDER
     * @type {$type default=String}
     * @value '<span class="{className}">{text}</span>'
     */
    TEMPLATE_PLACEHOLDER: '<span class="{className}">{text}</span>',

    /**
     * Reference to the input node currently shown in the editor.
     *
     * @property _input
     * @type {$type default=String}
     * @value null
     */
    _input: null
};

Y.namespace("DP").EditableBase = EditableBase;
/**
 *
 *
 * @module gallery-dp-editable
 * @author eamonb
 * @requires plugin
 */

/**
 * Editable creates an in-place editor for html element text content.
 * It is loosely based on jEditable for jquery.
 * 
 * This is the node plugin version of editable
 *
 * @class EditablePlugin
 * @namespace Y.DP
 * @extends Plugin.Base
 */
var EditablePlugin = Y.Base.create('editablePlugin', Y.Plugin.Base, [Y.DP.EditableBase], {
    
    initializer : function(config) {

        this.set('targetnode', config.host);
        
        if (!config.delegate) {
            this.set('editingnode', config.host);
        }
        
        this._bindEditableBase();
        this._syncEditableBase();
    }
}, {
    /**
     * The plugin namespace identifies the property on the host
     * which will be used to refer to this plugin instance.
     *
     * @property NS
     * @type String
     * @static
     */
    NS : "editable",

    /**
     * The plugin name identifies the event prefix and is a basis for generating
     * class names.
     * 
     * @property NAME
     * @type String
     * @static
     */
    NAME : "editable"      
});

Y.namespace("DP").EditablePlugin = EditablePlugin;


}, '@VERSION@' ,{requires:['node', 'base', 'event', 'plugin', 'io']});

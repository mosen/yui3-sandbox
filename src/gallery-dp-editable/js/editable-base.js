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
 * It is loosely based on jEditable/jquery
 *
 * @class EditableBase
 * @extends Widget
 * @constructor
 */
function EditableBase() {
    Y.log("init", "info", this.NAME);

    this.publish('save', {defaultFn: this._defFnSave});
    this.publish('cancel', {defaultFn: this._defFnCancel});
    
    this.after('savingChange', this._uiSetSaving, this);
    this.after('editingChange', this._uiSetEditing, this);
}

Y.mix(EditableBase, {

    /**
     * The widget name identifies the event prefix and is a basis for generating
     * class names.
     * 
     * @property NAME
     * @type String
     * @static
     */
    NAME : "editableBase",

    /**
     * The attribute configuration represents the core user facing state of 
     * the widget.
     *
     * @property ATTRS
     * @type Object
     * @protected
     * @static
     */
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
         * @type type
         */
        targetnode : {
            value : null
        },
  
        /**
         * Reference to the node being edited / where the editor will appear
         *
         * @attribute editingnode
         * @type Node
         * @default null
         */
        editingnode : {
            value : null
        },
        
        /**
         * The event which will start editing of the node.
         *
         * @attribute event
         * @type String
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
         *
         * @attribute rows
         * @type Number
         */
        rows : {
            value : null
        },
        
        /**
         * The cols attribute applied to a textarea field (if that is the selected type)
         *
         * @attribute cols
         * @type Number
         */
        cols : {
            value : null
        },

        /**
         * Where the editor data will be posted during save.
         * 
         * If this is a string then we will invoke IO.get
         * 
         * If this is a function, the function will receive the submitted data.
         * 
         * TODO: If this is a datasource, the datasource will be sent a request.
         *
         * @attribute submitto
         * @type String|Function
         */
        submitto : {
            value : null
        },

        /**
         * HTTP method to use when submitting data.
         *
         * @attribute method
         * @type String
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
         */
        saving : {
            value : true
        },
        
        /**
         * Whether the contents of the editor will be selected when editing starts.
         *
         * @attribute select
         * @type Boolean
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
         */
        inputHeight : {
            value : 'auto'
        },
        
        /**
         * What action to take when the editor receives the blur event.
         *
         * @attribute onblur
         * @type String
         */
        onblur : {
            // TODO validator: in array ['cancel', 'submit', function, null?]
            value : 'cancel'
        },
        
        /**
         * Selector to use when delegating to multiple editable elements.
         * Non-null value means we do want to delegate.
         *
         * @attribute delegate
         * @type String
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
     * Bind lifecycle
     *
     * @method _bindEditableBase
     * @param
     * @returns
     * @public
     */
    _bindEditableBase : function() {
        Y.log("_bindEditableBase", "info", this.NAME);
        
        // Only delegate editor if delegate contains a selector
        if (null == this.get('delegate')) {
            this.get('targetnode').on(this.get('event'), Y.bind(this._onClick, this));
        } else {
            this.get('targetnode').delegate(this.get('event'), this._onClick, this.get('delegate'), this);
        }
    },
    
    /**
     * Sync lifecycle
     *
     * @method _syncEditableBase
     * @param
     * @returns
     * @public
     */
    _syncEditableBase : function() {
        var editablenodes;
        
        Y.log("_syncEditableBase", "info", this.NAME);
        
        if (null == this.get('delegate')) {
            editablenodes = this.get('editingnode');
        } else {
            editablenodes = this.get('targetnode').all(this.get('delegate'));
        }
        
        editablenodes.set('title', this.get('strings.tooltip'));
        editablenodes.addClass(CLASS_FIELD);
        
        Y.log(this.get('targetnode').get('innerHTML'));
        
        // TODO: suggest placeholder for delegated items
        if (this.get('targetnode').get('innerHTML').length == 0) {
            this.get('targetnode').append(this._renderPlaceHolder());
        }
    },
    
    /**
     * Render the placeholder
     *
     * @method _renderPlaceHolder
     * @param
     * @returns
     * @protected
     */
    _renderPlaceHolder : function() {
        Y.log("_renderPlaceHolder", "info", this.NAME);
        
        return Y.Node.create(Y.substitute(this.TEMPLATE_PLACEHOLDER, {
                    className: CLASS_PLACEHOLDER,
                    text: this.get('strings.placeholder')
               }));
    },
    
    /**
     * Validate the 'type' attribute as being one of textarea|text
     *
     * @method _validateAttrType
     * @param v {String} Value to validate
     * @returns
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
        Y.log("_onClick", "info", this.NAME);
        
        e.halt();
        
        // TODO: Editing modes for multiple editors visible or single editor.
        if (this._input == e.target) {
            Y.log("Multiple editing disabled", "info", "this.NAME");
            return false;
        }
        
        // We're already editing something, so save it first
        if (this.get('editingnode') !== null && this.get('editingnode') !== e.currentTarget) {
            this.save();
        }
        
        this.set('editingnode', e.currentTarget);
        this.set('editing', true);
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
        Y.log("_onClickCancel", "info", this.NAME);
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
        Y.log("_onClickSave", "info", this.NAME);
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
        Y.log("_onKey", "info", this.NAME);

        e.halt();
        
        if (e.keyCode == 27) {
            this.discard();
        } else if (e.keyCode = 13) {
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
        Y.log("_uiSetSaving:" + e.newVal, "info", this.NAME);
        
        if (null != this.get('editingnode')) {     
            if (true == this.get('saving')) {
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
        Y.log("_uiSetEditing:" + e.newVal, "info", this.NAME);
        
        if (true == this.get('editing')) {
            
            Y.log("start editing", "info", this.NAME);

            if (true == e.prevVal) return false; // Don't edit twice

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
                Y.log("No load method found, using textContent", "info", "this.NAME");
                value = editingnode.get('textContent');
            }

            editingnode.set('innerHTML', '');  
            editingnode.append(form);

            this._input.set('value', value);
            this._input.focus();

            if (true == this.get('select')) {
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
        Y.log("_defFnSave", "info", this.NAME);
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
        Y.log("_defFnCancel", "info", this.NAME);
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
        Y.log("_renderForm", "info", this.NAME);
        
        var type = this.get('type'),
            frm = Y.Node.create(Y.substitute(this.TEMPLATE_FORM, {
                className : CLASS_FORM
            })),
            input,
            buttons,
            inputWidth = this.get('inputWidth'),
            inputHeight = this.get('inputHeight');;

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
        this._input.on('key', this._onKey, 'down:13', this); // Enter = save
        this._input.on('key', this._onKey, 'down:27', this); // ESC = discard
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
        
        Y.log("save", "info", this.NAME);

        this.set('saving', true);

        if (Y.Lang.isFunction(submitto)) {
            submitto(editingnode);
            
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
                        this.fire('save', o);
                    },
                    failure: function(id, o, args) { 
                        this.set('saving', false);
                        this.get('editingnode').set('innerHTML', this.get('prevContent'));
                        // TODO: display a warning
                    }
                },
                context : this,
                arguments : {
                    node : editingnode
                }
            });           
        } else if (null == submitto) {
            Y.log("No save method specified, converting to text", "info", this.NAME);
            
            var value = this._input.get('value');
            this.get('editingnode').set('innerHTML', '');
            this.get('editingnode').append(value);
            
            this.set('prevContent', null);
            this.set('editingnode', null);
            this.set('editing', false);
            this.set('saving', false);
        }
        
        //this.fire('save', {value: editorvalue, node: editingnode});
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
        
        Y.log("requestSave", "info", this.NAME);
        Y.log("Saving value " + value, "info", this.NAME);
        
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
        
        Y.log("discard", "info", this.NAME);
        
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
        
        Y.log("clear", "info", this.NAME);

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
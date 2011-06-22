YUI.add('gallery-dp-editable', function(Y) {

/**
 * 
 *
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
    CLASS_PLACEHOLDER = CLASS_BASE + '-placeholder';

/**
 * Editable creates an in-place editor for html element text content.
 * It is loosely based on jEditable for jquery
 *
 * @class EditableBase
 * @extends Widget
 * @constructor
 */
function EditableBase() {
    
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
    NAME : "editable-base",

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
        
        /**
         * The collection of strings to be used for the widget UI
         * If using the intl module, strings can be shipped separately.
         *
         * @attribute strings
         * @type Array
         */
        strings : {
            value : {
                tooltip : 'Click to edit...',
                cancel : 'Cancel',
                submit : 'OK',
                indicator : 'Saving...',
                placeholder : 'Click to edit...'
            }
        },
        
        /**
         * Reference to the node where the click event is attached,
         * and where the editor will appear.
         *
         * @attribute editnode
         * @type Node
         * @default null
         */
        editnode : {
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
         * The URL that the new data will be submitted to
         *
         * @attribute url
         * @type String
         */
        url : {
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
         * The URL that will provide a textual representation of the data, if the data
         * is formatted in some way
         *
         * @attribute loadUrl
         * @type String
         */
        loadurl : {
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
         *
         * @attribute inputWidth
         * @type String
         */
        inputWidth : {
            value : 'auto'
        },
        
        /**
         * Height of the input, applied to its inner style
         *
         * @attribute inputHeight
         * @type String
         */
        inputHeight : {
            value : 'auto'
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
    },
    
    /**
     * The HTML_PARSER attribute is used if the Widget supports progressive enhancement.
     * It is used to populate the widget attribute configuration from existing markup.
     * 
     * @property HTML_PARSER
     * @type Object
     * @static
     */
    HTML_PARSER : {
    
        // attrA : '#nodeselector' or
        // attrA : function(srcNode) { do something and return attrA value }
    }
});

EditableBase.prototype = {

    /**
     * Initializer runs when the widget is constructed.
     *
     * @method initializer
     * @param config {Object} Configuration object
     */
    initializer : function (config) {
        // Hook into hostChange for plugin to add the placeholder
        // Widget will add placeholder in render stage
        // remove title attribute if set
        // calculate initial width and height based on replaced element
        
        // publish save event -- instead of specified callback
        // publish cancel event
        // publish editing event
    },
    
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
        
        this.get('editnode').on('click', Y.bind(this.startEditing, this));
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
        
        this.get('editnode').set('title', this.get('strings.tooltip'));
        if (this.get('editnode').get('innerHTML').length == 0) {
            this.get('editnode').append(Y.Node.create(Y.substitute(this.TEMPLATE_PLACEHOLDER, {
                className: CLASS_PLACEHOLDER,
                text: this.get('strings.placeholder')
            })));
        }
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
            buttons;

        switch(type) {
            case 'textarea':
                input = Y.Node.create(Y.substitute(this.TEMPLATE_INPUT_TEXTAREA, {className: CLASS_INPUT}));
                break;
            case 'select':
                input = Y.Node.create(Y.substitute(this.TEMPLATE_INPUT_SELECT, {className: CLASS_INPUT}));
                break;
            case 'text':
            default:
                input = Y.Node.create(Y.substitute(this.TEMPLATE_INPUT_TEXT, {className: CLASS_INPUT}));
                break;
        }
        
        input.setStyle('width', this.get('inputWidth'));
        input.setStyle('height', this.get('inputHeight'));
        
        frm.append(input);
        this._input = input;
        
        buttons = Y.Node.create(Y.substitute(this.TEMPLATE_BUTTONS, { 
            classNameSubmit: CLASS_BTN_SUBMIT,
            classNameCancel: CLASS_BTN_CANCEL,
            labelSubmit: this.get('strings.submit'),
            labelCancel: this.get('strings.cancel')
        }));
        
        frm.append(buttons);
        
        return frm;
    },
    
    /**
     * Start editing the node
     *
     * @method startEditing
     * @param e {Event} Event facade
     * @returns
     * @public
     */
    startEditing : function(e) {
        
        if (true == this.get('editing')) return false;
        
        var form = this._renderForm(),
        
            inputWidth = this.get('inputWidth'),
            inputHeight = this.get('inputHeight'),
            
            editnode = this.get('editnode'),
            edittext = editnode.get('textContent'),
            editwidth = 'auto' == inputWidth ? editnode.get('offsetWidth') : inputWidth,
            editheight = 'auto' == inputHeight ? editnode.get('offsetHeight') : inputHeight;
            
        editnode.set('innerHTML', '');  
        editnode.append(form);
        
        this._input.set('value', edittext);
        
        // TODO should probably set these before the element is painted
        this._input.setStyle('width', editwidth);
        this._input.setStyle('height', editheight);
        this._input.focus();
        
        this.set('editing', true);
    },
    
    /**
     * Stop editing the nominated element
     *
     * @method stopEditing
     * @param
     * @returns
     * @public
     */
    stopEditing : function() {
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
EditablePlugin = Y.Base.create('editablePlugin', Y.Plugin.Base, [Y.DP.EditableBase], {
    
    initializer : function(config) {

        this.set('editnode', config.host);
        
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


}, '@VERSION@' ,{requires:['base', 'plugin']});

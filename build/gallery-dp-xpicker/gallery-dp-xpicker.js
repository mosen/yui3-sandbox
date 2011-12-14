YUI.add('gallery-dp-xpicker', function(Y) {

/*
 Xpicker
 Inspired by Timepicker Copyright (c) 2009, Stephen Woods

 Modified to support any kind of list. You can use this in any application where
 a combination of items makes sense as a value (such as a date or time).

 Added the possibility of a null option, which returns null values for all lists. (used to clear the value).

 The picker takes any number of arrays of objects and builds cells from their .title properties.
 */


/**
 * YUI3 Horizontally Stacked List Picker
 *
 * @module Xpicker
 * @requires node, base, widget, node-screen
 */

/**
 * @class Xpicker
 * @namespace Y.DP
 * @extends Widget
 */
var YCM = Y.ClassNameManager,
    PICKER_CLASS = 'gallery-dp-xpicker',
    CONTENT_CLASS = YCM.getClassName(PICKER_CLASS, 'content'),
    CELL_CLASS   = 'cell',
    LIST_CLASS   = 'list',
    NULL_CLASS   = 'null',
    ACTIVE_CLASS = 'active',
    DELAY_KEY    = 'delay',
    LEFT_PANE_CLASS = YCM.getClassName(PICKER_CLASS, 'content', 'left'),
    RIGHT_PANE_CLASS = YCM.getClassName(PICKER_CLASS, 'content', 'right');

Y.namespace('DP').Xpicker = Y.Base.create('gallery-dp-xpicker', Y.Widget, [], {

    initializer : function() {
        this.publish('select', { defaultFn: this._defFnSelect });
    },

    destructor : function() {

    },

    bindUI : function() {
        this.get('contentBox').delegate('click', Y.bind(this._handleClick, this), '.' + this.getClassName(CELL_CLASS));
        this.get('contentBox').delegate('mouseover', Y.bind(this._handleOver, this), '.' + this.getClassName(CELL_CLASS));
        this.get('contentBox').delegate('mouseout', Y.bind(this._handleOut, this), '.' + this.getClassName(CELL_CLASS));
    },

    syncUI : function() {
        Y.Array.each(Y.Object.keys(this._listIdHash), function(list_id) {
            var listNode = this.get('contentBox').one('#'+list_id);
            this._listIdSelection[list_id] = listNode.one(':first-child');
        }, this);

        this._highlight();
    },

    renderUI : function() {

        var lists = this.get('lists'),
            listIds = Y.Object.keys(this._listIdHash),
            templateItem = this.TEMPLATE_ITEM,
            templateRow = this.TEMPLATE_ROW,
            cellClassName = this.getClassName(CELL_CLASS),
            listClassName = this.getClassName(LIST_CLASS),
            listItemNodes = [];

        Y.Array.each(listIds, function(lId) {
            var listKey = this._listIdHash[lId];

            var listItemNode = Y.Node.create(Y.Lang.substitute(templateRow, {
                className: listClassName,
                id : lId
            }));

            Y.Array.each(lists[listKey], function(item) {
                var listNode = Y.Node.create(Y.Lang.substitute(templateItem, {
                    title : item.title,
                    className : cellClassName
                }));
                listNode.setData(item);
                listItemNode.append(listNode);
            });

            listItemNodes.push(listItemNode);
        }, this);

        Y.Array.each(listItemNodes, function(list) {
            this.get('contentBox').one('.' + RIGHT_PANE_CLASS).append(list);
        }, this);


        if (this.get('showNullOption') === true) {
            var nullOptionListId = Y.guid(),
                nullOptionItemClassName = this.getClassName(NULL_CLASS);

            this._nullOptionNode = Y.Node.create(Y.Lang.sub(this.TEMPLATE_ITEM_NULLOPTION, {
                listClassName : listClassName,
                itemClassName : nullOptionItemClassName + ' ' + cellClassName,
                title : 'None',
                id : nullOptionListId
            }));

            //this._listIdHash[nullOptionListId] = { "nulloption" : [{ }]};

            this.get('contentBox').one('.' + LEFT_PANE_CLASS).append(this._nullOptionNode);
        }
    },

    /**
     * Handle a click event in any of the list items.
     *
     * @method _handleClick
     * @param e {Object} Event facade
     * @protected
     */
    _handleClick : function(e) {
        if (this._nullOptionNode.contains(e.target)) {
            this.fire('select', { selection: this._getAttrNullSelection() });
        } else {
            this.fire('select', { selection: this.get('selection') });
        }
    },

    _defFnSelect : function(e) {
        this.hide();
    },

    _handleOver : function(e) {
        var targ = e.target, delay = this.get(DELAY_KEY);

        if(this._timer){
            this._timer.cancel();
            this._timer = null;
        }

        this._timer = Y.later(delay, this, this._highlight, targ);
    },

    _handleOut : function(e) {

        if(this._timer){
            this._timer.cancel();
            this._timer = null;
        }
    },

    _highlight : function(targ) {

        Y.Array.each(Y.Object.keys(this._listIdHash), function(key) {
            if (Y.one('ol#' + key).contains(targ)) {
                this._listIdSelection[key] = targ;
            }
        }, this);

        this.get('contentBox').all('li').removeClass(this.getClassName(ACTIVE_CLASS));

        Y.Array.each(Y.Object.keys(this._listIdSelection), function(key) {
            this._listIdSelection[key].addClass(this.getClassName(ACTIVE_CLASS));
        }, this);

        this._uiSetIndent();
    },

    _uiSetIndent : function() {
        var lists = this.get('contentBox').all('ol'),
            classActive = this.getClassName(ACTIVE_CLASS),
            baseLeft = lists.item(0).getX(),
            left = 0, i = 0;

        for (; i < lists.size(); i++) {
            var item = lists.item(i);

            item.transition({
                left: left + 'px',
                easing: 'ease-out',
                duration: 0.25
            });
            //item.setX(left);

            if (lists.item(i).one('.'+classActive)) {
                left = lists.item(i).one('.'+classActive).getX() - baseLeft;
            }
        }
    },

    /* allow a short delay before highlight */
    _timer: null,

    /**
     * Create a hash of client list id -> list name
     *
     * @method _initListsHash
     * @param lists
     * @private
     */
    _initListsHash : function(lists) {

        Y.Array.each(Y.Object.keys(lists), function(l) {
            this._listIdHash[Y.guid()] = l;
        }, this);
    },

    /**
     * Get the currently selected list items.
     * Invoked as a getter from the selection attribute.
     *
     * @method _getAttrSelection
     * @return Object Hash of list name to current selection value.
     * @private
     */
    _getAttrSelection : function() {
        var selection = {};

        Y.Array.each(Y.Object.keys(this._listIdHash), function(list_id) {
            selection[this._listIdHash[list_id]] = this._listIdSelection[list_id].getData();
        }, this);

        return selection;
    },

    /**
     * Generate a null selection for all lists.
     *
     * @method _getAttrNullSelection
     * @return Object Hash of list name to null selection value for all lists.
     * @private
     */
    _getAttrNullSelection : function() {
        var selection = {};

        Y.Array.each(Y.Object.keys(this._listIdHash), function(list_id) {
            selection[this._listIdHash[list_id]] = { title: "", value: null };
        }, this);

        return selection;
    },

    /**
     * Hash of client ID to list name
     *
     * @property _listIdHash
     * @type Object
     */
    _listIdHash : {},

    /**
     * Hash of list client id's to selected list item elements.
     *
     * @property _listIdSelection
     * @type Object
     */
    _listIdSelection : {}, // Selection, one per list

    /**
     * @property TEMPLATE_ROW
     * @type String
     */
    TEMPLATE_ROW : '<ol class="{className}" id="{id}"></ol>',

    /**
     * @property TEMPLATE_ITEM
     * @type String
     */
    TEMPLATE_ITEM : '<li class="{className}">{title}</li>',

    /**
     * Item shown for a null/empty selection
     * @property TEMPLATE_ITEM_NULLOPTION
     * @type String
     */
    TEMPLATE_ITEM_NULLOPTION : '<ol id="{id}" class="{listClassName}"><li class="{itemClassName}">{title}</li></ol>',

    /**
     * Widget content, split into left and right lists.
     * @property CONTENT_TEMPLATE
     * @type String
     */
    CONTENT_TEMPLATE : '<div class="' + CONTENT_CLASS + '"><div class="' + LEFT_PANE_CLASS + '"></div><div class="' + RIGHT_PANE_CLASS + '"></div></div>'

}, {
    /**
     * Name attribute, used to determine class names and event prefixes.
     *
     * @property NAME
     * @type String
     * @protected
     * @static
     */
    NAME : "xPicker",

    /**
     * The plugin namespace
     *
     * @property Y.DP.Xpicker.NS
     * @type String
     * @protected
     * @static
     */
    NS : "xpicker",

    /**
     * Attributes
     *
     * @property ATTRS
     * @type Object
     * @protected
     * @static
     */
    ATTRS : {

        /**
         * Delay before mouseOver selects an item
         *
         * @todo This might not be needed anymore? did it cause flickering before?
         * @attribute delay
         * @type Number
         */
        delay:{
            value : 15
        },

        /**
         * Pick lists as a hash of list names to list arrays.
         *
         *  { "listname" : [{ "title" : "exampleitem" }] }
         *
         * @attribute lists
         * @default {}
         * @type Object
         */
        lists : {
            value : {},
            setter : "_initListsHash"
        },

        /**
         * The selection, generated from the currently highlighted list items.
         *
         * @attribute selection
         * @readonly
         * @type Object
         */
        selection : {
            readOnly : true,
            getter : "_getAttrSelection"
        },

        /**
         * An extra option will be shown which gives a null value for all lists.
         *
         * @attribute showNullOption
         * @type Boolean
         */
        showNullOption : {
            value : true
        }
    }

});


}, '1.0.0' , { requires: ['node', 'node-screen', 'base', 'widget', 'transition'], skinnable: true });

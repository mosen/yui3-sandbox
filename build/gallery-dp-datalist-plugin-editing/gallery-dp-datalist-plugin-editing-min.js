YUI.add("gallery-dp-datalist-plugin-editing",function(d){var b=d.Node,c=d.ClassNameManager.getClassName;function a(e){a.superclass.constructor.apply(this,arguments);}d.mix(a,{NS:"editing",NAME:"datalistEditing",ATTRS:{uriCreate:{value:null}}});d.extend(a,d.Plugin.Base,{initializer:function(e){this.afterHostMethod("_renderItems",this._renderEditingTools);},destructor:function(){},_renderEditingTools:function(){var e=this.get("host").get("contentBox");e.append(this.get("host")._renderItem(this._renderAddControl,{className:this.get("host").getClassName("add"),label:"Add an item",template:this.ITEM_ADD_TEMPLATE}));d.one("."+this.get("host").getClassName("add")).plug(d.DP.EditablePlugin,{submitto:this.get("uriCreate"),loadfrom:function(f){return"";}});e.plug(d.DP.EditablePlugin,{delegate:"."+this.get("host").getClassName("item"),submitto:this.get("uriCreate"),fnNodeToEditor:function(f){return f.one("a").get("textContent");},fnEditorToNode:d.bind(function(f){return this.get("host")._renderItem(d.bind(this.get("host").get("fnRender"),this.get("host")),{title:f.get("value")});},this)});},_renderAddControl:function(e){return d.substitute(e.template,e);},_handleRemoveItemClicked:function(f){this.remove(f.target);},remove:function(e){},add:function(e){},update:function(f,e){},ITEM_ADD_TEMPLATE:'<span class="{className}">{label}</span>'});d.namespace("DP").DatalistEditing=a;},"@VERSION@",{requires:["plugin","substitute","gallery-dp-datalist","gallery-dp-editable"]});
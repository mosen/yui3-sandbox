YUI.add("gallery-ebisu-childslider",function(b){var a=b.Lang;b.namespace("Ebisu").ChildSlider=b.Base.create("gallery-ebisu-childslider",b.Plugin.Base,[],{initializer:function(c){this.get("host").set("clickableRail",false);this.beforeHostMethod("renderUI",this.renderUI);this.afterHostMethod("bindUI",this._bindConstraints);this.beforeHostMethod("_unbindClickableRail",this._preventUnbindClickableRail);if(this.get("parent")._dd){this._bindParentConstraints();}else{this.get("parent").after("render",this._bindParentConstraints,this);}this.get("parent").after("maxChange",this._syncHostMax());this.get("parent").after("minChange",this._syncHostMin());this.get("parent").after("lengthChange",this._syncHostLength());},renderUI:function(){this.get("host").rail=this.get("parent").rail;this.get("host").thumb=this.get("host").renderThumb();this.get("host").rail.appendChild(this.get("host").thumb);this.get("host").get("contentBox").addClass(this.get("host").getClassName(this.get("host").axis));return new b.Do.Prevent();},destructor:function(){},_bindConstraints:function(){this.get("host")._dd.after("drag:align",this._constrainSlider,this);},_bindParentConstraints:function(){this.get("parent")._dd.after("drag:align",this._constrainParentSlider,this);},_constrainSlider:function(d){var i=this.get("parent"),l=this.get("host"),f=i.get("value"),j=l.get("value"),c=l._valueToOffset(f),g=l._valueToOffset(j),k=l._dd,h=this.get("thumbwidth");if(k.actXY[0]<(c+h+(h/2))){k.actXY[0]=c+h+(h/2);}},_constrainParentSlider:function(d){var i=this.get("parent"),l=this.get("host"),f=i.get("value"),j=l.get("value"),c=l._valueToOffset(f),g=l._valueToOffset(j),k=i._dd,h=this.get("thumbwidth");if(k.actXY[0]>(g-(h/2))){k.actXY[0]=(g-(h/2));}},_syncHostMax:function(){var c=this.get("parent"),d=this.get("host");d.set("max",c.get("max"));},_syncHostMin:function(){var c=this.get("parent"),d=this.get("host");d.set("min",c.get("min"));},_syncHostLength:function(){var c=this.get("parent"),d=this.get("host");d.set("length",c.get("length"));},_preventUnbindClickableRail:function(){return b.Do.Prevent();}},{NS:"child",NAME:"childSlider",ATTRS:{parent:{value:null},constrained:{value:true},thumbwidth:{value:14}}});},"@VERSION@",{requires:["base","dd","slider"]});
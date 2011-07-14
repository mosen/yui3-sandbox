YUI.add("gallery-datatable-tableevents",function(c){var a=c.Lang;function b(){}b.ATTRS={events:{value:["keydown","keyup","mousedown","mouseup","click","mouseover","mouseout","mouseenter","mouseleave","hover"],setter:function(i){var h=this.get("events"),g=h?c.Array.hash(h):{},d=false,f,e;i=c.Array(i);f=c.Array.hash(i);for(e in f){if(g.hasOwnProperty(e)){delete g[e];}else{d=true;break;}}d||(d=c.Object.size(g));if(!d){return c.Attribute.INVALID_VALUE;}else{return i;}}},tags:{value:["table","thead","tbody",{tag:"tr",name:"row"},{tag:"th",name:"cell"},{tag:"td",name:"cell"}]}};b.prototype={initializer:function(){this.after("render",this._bindEvents,this);this.after("eventsChange",this._afterEventsChange);},destructor:function(){this._handle&&this._handle.detach();delete this._handle;},_bindEvents:function(){var h=this.get("events"),f=this.get("tags"),e={},j=[],g,d;for(g=f.length-1;g>=0;--g){d=f[g];if(a.isString(d)){d={tag:d,name:d};}e[d.tag]=d;j.push(d.tag);}this._tag_map=e;this._handle=this.get("contentBox").delegate(h,this._handleEvent,j.join(","),this);},_afterEventsChange:function(d){this._bindEvents(d.newVal);},_handleEvent:function(d){if(/^mouse(?:over|out|enter|leave)$/.test(d.type)){this._handleHoverEvent(d);}else{this._notify(d);}},_handleHoverEvent:function(k){var g=k.currentTarget,j=k.relatedTarget,m=k.type.charAt(0).toUpperCase()+k.type.slice(1),p=g.get("tagName").toLowerCase(),d=(j==null)?"":j.get("tagName").toLowerCase(),f="",i="",l,h,n,o;if(p=="td"||p=="th"){this._notify(k);switch(d){case"td":i=j.getAttribute("headers");break;case"th":i=j.get("id");break;case"div":l=j.get("parentNode");if(l.get("tagName").toLowerCase()=="th"){i=l.get("id");}else{if(l.get("tagName").toLowerCase()=="td"){i=l.getAttribute("headers");}}break;}f=(p=="td")?g.getAttribute("headers"):g.get("id");if(f!=i){h=this.get("columnset").idHash[f];o=this;n={event:k,target:k.target,currentTarget:g,column:h,cells:function(){return o.get("contentBox").all("td[headers="+f+"]");}};this.fire("column"+m,n)||k.stopPropagation();}}else{if(p=="tr"){if(j==null||g!==j.ancestor("tr")){this._notify(k);}}}},_notify:function(h){var g=h.currentTarget,l=this,i=l._theadNode,j=h.type.charAt(0).toUpperCase()+h.type.slice(1),m=g.get("tagName").toLowerCase(),d=g.getData("inThead"),f=this._tag_map,k={event:h,target:h.target,currentTarget:g};if(!d&&d!==false){d=(g!==i&&i.contains(g));g.setData("inThead",d);}if(f[m]){m=f[m].name;}if(d){m="thead"+m.charAt(0).toUpperCase()+m.slice(1);}switch(m){case"cell":k.record=l.get("recordset").getRecord(g.get("parentNode").get("id"));k.column=l.get("columnset").idHash[g.getAttribute("headers")];k.value=k.record.getValue(k.column.get("key"));break;case"row":k.record=l.get("recordset").getRecord(g.get("id"));break;case"theadCell":k.column=l.get("columnset").idHash[g.get("id")];break;}this.fire(m+j,k)||h.stopPropagation();}};c.namespace("DataTable.Features").TableEvents=b;c.Base.mix(c.DataTable.Base,[c.DataTable.Features.TableEvents]);},"@VERSION@",{optional:["pluginattr"],requires:["datatable"]});
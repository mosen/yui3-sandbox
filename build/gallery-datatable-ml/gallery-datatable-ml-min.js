YUI.add("gallery-datatable-ml",function(a){function I(){}var b=a.Lang,c=b.isValue,d=a.Lang.sub,e=a.Node,f=e.create,g=a.ClassNameManager.getClassName,h="datatable",i="column",j="focus",k="keydown",l="mouseenter",m="mouseleave",n="mouseup",o="mousedown",p="click",q="dblclick",r=g(h,"columns"),s=g(h,"data"),t=g(h,"msg"),u=g(h,"liner"),v=g(h,"first"),w=g(h,"last"),x=g(h,"even"),y=g(h,"odd"),z="<table></table>",A="<col></col>",B='<thead class="'+r+'"></thead>',C='<tbody class="'+s+'"></tbody>',D='<th id="{id}" rowspan="{rowspan}" colspan="{colspan}" class="{classnames}" abbr="{abbr}"><div class="'+u+'">{value}</div></th>',E='<tr id="{id}"></tr>',F='<td headers="{headers}" class="{classnames}"><div class="'+u+'">{value}</div></td>',G="{value}",H='<tbody class="'+t+'"></tbody>';I.prototype={destructor:function(){},bindUI:function(){this.after({columnsetChange:this._afterColumnsetChange,modelListChange:this._afterModelListChange,summaryChange:this._afterSummaryChange,captionChange:this._afterCaptionChange}),this.get("models").after("add",this._afterModelListAdd,this),this.get("models").after("remove",this._afterModelListRemove,this),this.get("models").after("reset",this._afterModelListChange,this),this.get("models").on("*:change",this._afterModelChange,this)},syncUI:function(){this._uiSetColumnset(this.get("columnset")),this._uiSetModelList(this.get("models")),this._uiSetSummary(this.get("summary")),this._uiSetCaption(this.get("caption"))},_uiSetMessage:function(){var b=this.get("contentBox").one("."+t),c='<tr id="{id}"><td colspan="{span}"><div class="{linerClass}">{message}</div></td></tr>';this.get("models").size()==0?b.set("innerHTML",a.Lang.sub(c,{id:a.guid(),span:this.get("columnset").keys.length,linerClass:u,message:"There are no items to show."})):b.set("innerHTML","")},_uiSetModelList:function(c){var e=this._tbodyNode,f=e.get("parentNode"),g=e.next(),h=this.get("columnset").keys,i=this.get("tdValueTemplate"),j={},k,l,m,n,o;e.remove(),e=null,k=this._addTbodyNode(this._tableNode),k.remove(),this._tbodyNode=k,j.tbody=k,j.rowTemplate=E,j.columns=[];for(l=h.length-1;l>=0;--l)n=h[l],j.columns[l]={column:n,fields:n.get("field"),classes:n.get("classnames")},o=n.get("formatter"),b.isFunction(o)||(b.isString(o)||(o=i),o=a.bind(d,this,o)),j.columns[l].formatter=o;c.each(a.bind(function(a){j.data=a.getAttrs(),j.model=a,j.rowindex=c.indexOf(a),this._addTbodyTrNode(j)},this)),f.insert(this._tbodyNode,g),this.fire("modelsRendered")},_createTheadThNode:function(b){var c=b.column;b.id=c.get("id"),b.colspan=c.colSpan,b.rowspan=c.rowSpan,b.abbr=c.get("abbr"),b.classnames=c.get("classnames"),a.Lang.isFunction(c.get("thFormatter"))?b.value=c.get("thFormatter")(c):b.value=d(this.get("thValueTemplate"),b);var e=f(d(this.thTemplate,b));return c.get("width")!==undefined&&e.one("."+u).setStyle("width",c.get("width")),e},_createTbodyTrNode:function(b){var c=b.columns,e,g,h;b.tr=f(d(b.rowTemplate,{id:b.model.get("clientId")||a.guid()}));for(e=0,g=c.length;e<g;++e)h=c[e],b.column=h.column,b.field=h.fields,b.classnames=h.classes,b.formatter=h.formatter,this._addTbodyTdNode(b);return b.tr},_addTbodyTrNode:function(b){var c=b.tbody.one("#"+a.guid());b.tr=c||this._createTbodyTrNode(b),this._attachTbodyTrNode(b)},_createTbodyTdNode:function(a){a.headers=a.column.headers,a.value=this.formatDataCell(a);var b=f(d(this.tdTemplate,a));return a.column.get("width")!==undefined&&b.one("."+u).setStyle("width",a.column.get("width")),(a.column.get("align")==="left"||a.column.get("align")==="right"||a.column.get("align")==="center")&&b.one("."+u).setStyle("textAlign",a.column.get("align")),b},formatDataCell:function(a){return a.value=a.data[a.field],a.formatter.call(this,a)},_addModel:function(c){var e=this._tbodyNode,f=e.get("parentNode"),g=this.get("columnset").keys,h=this.get("tdValueTemplate"),i={},j,k,l;i.tbody=this._tbodyNode,i.rowTemplate=this.get("trTemplate"),i.columns=[];for(j=g.length-1;j>=0;--j)k=g[j],i.columns[j]={column:k,fields:k.get("field"),classes:k.get("classnames")},l=k.get("formatter"),b.isFunction(l)||(b.isString(l)||(l=h),l=a.bind(d,this,l)),i.columns[j].formatter=l;i.model=c,i.data=c.getAttrs(),i.rowindex=this.get("models").indexOf(c),this._addTbodyTrNode(i)},_afterModelListAdd:function(a){this._addModel(a.model),this._uiSetMessage()},_afterModelListRemove:function(a){this.get("contentBox").one("tr#"+a.model.get("clientId")).remove()},_afterModelListChange:function(){this._uiSetModelList(this.get("models")),this._uiSetMessage()},_afterModelChange:function(b){if(this.get("rendered")==!0){var c=a.Object.keys(this.get("columnset").keyHash),e=a.Object.keys(b.changed),f=a.Array.filter(e,function(a){if(c.indexOf(a)!==-1)return!0}),g=this.get("columnset").keyHash;a.Array.each(f,function(c){var e=g[c],f=e.get("formatter"),h={value:b.changed[c].newVal,formatter:a.Lang.isFunction(f)?f:a.bind(d,this,this.get("tdValueTemplate"))},i="tr#"+b.target.get("clientId"),j=a.one(i);if(j!==null){var k='td[headers="'+e.get("id")+'"]',l=j.one(k),m=l.one("div");m.setContent(h.formatter.call(this,h))}},this)}}},I.ATTRS={models:{value:null},recordset:{value:null}},a.Base.mix(a.DataTable.Base,[I]),a.mix(a.Column,{ATTRS:{align:{value:undefined},title:{value:null},sortFn:{value:null},thFormatter:{value:null}}},!1,null,0,!0)},"1.0.0",{requires:["datatable"]})
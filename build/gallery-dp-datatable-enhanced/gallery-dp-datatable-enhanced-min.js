YUI.add("gallery-dp-datatable-enhanced",function(a){var f=a.Lang,j=a.Node,g=a.ClassNameManager.getClassName,h=j.create,e=a.substitute,l="datatable",k=g(l,"msg"),i=g(l,"liner"),c='<td headers="{headers}" class="{classnames}"><div class="'+i+'"></div></td>',d='<th id="{id}" rowspan="{rowspan}" colspan="{colspan}" class="{classnames}" abbr="{abbr}"><div class="'+i+'">{value}</div></th>',b="<col></col>";a.namespace("DP").DataTableEnhanced=a.Base.create("gallery-dp-datatable-enhanced",a.DataTable.Base,[],{initializer:function(){this.after("recordsetChange",this._uiSetMessage);},_uiSetMessage:function(m){if(m.newVal.getLength()==0){this._tableNode.one("."+k).setContent("There are no rows here");}else{this._tableNode.one("."+k).setContent("");}},_createTbodyTdNode:function(p){var n=p.column,m=null;p.headers=n.headers;p.classnames=n.get("classnames");p.align=n.get("align");p.td=a.Node.create(a.substitute(c,p));p.liner=p.td.one("div");if(p.align=="left"||p.align=="right"||p.align=="center"){p.liner.setStyle("textAlign",p.align);}if(n.get("width")!==undefined){p.liner.setStyle("width",n.get("width"));}m=this.formatDataCell(p);if(a.Lang.isString(m)){p.value=m;p.liner.append(m);}return p.td;},_createTheadThNode:function(p){var m=p.column,n;p.id=m.get("id");p.colspan=m.colSpan;p.rowspan=m.rowSpan;p.abbr=m.get("abbr");p.classnames=m.get("classnames");p.value=e(this.get("thValueTemplate"),p);n=h(e(this.thTemplate,p));p.liner=n.one("div");if(m.get("width")!==undefined){p.liner.setStyle("width",m.get("width"));}return n;},_addColgroupNode:function(q){var m=this.get("columnset").keys.length,p=this.get("columnset"),o,n=0,s=a.Node.create("<colgroup></colgroup>");for(;n<p.keys.length;n++){o=p.keys[n];var r=a.Node.create("<col></col>");s.append(r);}this._colgroupNode=q.insertBefore(s,q.get("firstChild"));return this._colgroupNode;}},{NAME:"dataTableEnhanced"});a.mix(a.Column,{ATTRS:{align:{value:undefined},sortFn:{value:null}}},false,null,0,true);},"@VERSION@",{requires:["datatable"]});
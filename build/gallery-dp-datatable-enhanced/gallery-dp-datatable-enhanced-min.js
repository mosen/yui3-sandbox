YUI.add("gallery-dp-datatable-enhanced",function(a){var f=a.Lang,k=a.Node,g=a.ClassNameManager.getClassName,i=k.create,e=a.substitute,m="datatable",l=g(m,"msg"),j=g(m,"liner"),c='<td headers="{headers}" class="{classnames}"><div class="'+j+'"></div></td>',d='<th id="{id}" rowspan="{rowspan}" colspan="{colspan}" class="{classnames}" abbr="{abbr}"><div class="'+j+'">{value}</div></th>',b="<col></col>",h='<tr><td colspan="{colspan}"><div class="'+j+'">{message}</div></td></tr>';a.namespace("DP").DataTableEnhanced=a.Base.create("gallery-dp-datatable-enhanced",a.DataTable.Base,[],{initializer:function(){this.after("recordsetChange",this._uiSetMessage);},_uiSetMessage:function(n){if(n.newVal.getLength()==0){this._tableNode.one("."+l).setContent(i(e(h,{colspan:this.get("columnset").keys.length,message:"There are no rows in the result set."})));}else{this._tableNode.one("."+l).setContent("");}},_createTbodyTdNode:function(q){var p=q.column,n=null;q.headers=p.headers;q.classnames=p.get("classnames");q.align=p.get("align");q.td=a.Node.create(a.substitute(c,q));q.liner=q.td.one("div");if(q.align=="left"||q.align=="right"||q.align=="center"){q.liner.setStyle("textAlign",q.align);}if(p.get("width")!==undefined){q.liner.setStyle("width",p.get("width"));}n=this.formatDataCell(q);if(a.Lang.isString(n)){q.value=n;q.liner.append(n);}return q.td;},_createTheadThNode:function(q){var n=q.column,p;q.id=n.get("id");q.colspan=n.colSpan;q.rowspan=n.rowSpan;q.abbr=n.get("abbr");q.classnames=n.get("classnames");q.value=e(this.get("thValueTemplate"),q);p=i(e(this.thTemplate,q));q.liner=p.one("div");if(n.get("width")!==undefined){q.liner.setStyle("width",n.get("width"));}return p;},_addColgroupNode:function(r){var n=this.get("columnset").keys.length,q=this.get("columnset"),p,o=0,t=a.Node.create("<colgroup></colgroup>");for(;o<q.keys.length;o++){p=q.keys[o];var s=a.Node.create("<col></col>");t.append(s);}this._colgroupNode=r.insertBefore(t,r.get("firstChild"));return this._colgroupNode;}},{NAME:"dataTableEnhanced"});a.mix(a.Column,{ATTRS:{align:{value:undefined},sortFn:{value:null}}},false,null,0,true);},"@VERSION@",{requires:["datatable"]});
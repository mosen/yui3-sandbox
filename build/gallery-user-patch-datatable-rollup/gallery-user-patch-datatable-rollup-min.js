YUI.add("gallery-user-patch-2529808",function(b){var a=b.Plugin.DataTableScroll;if(!a.prototype.orig_syncWidths){a.prototype.orig_initializer=a.prototype.initializer;a.prototype.initializer=function(){this.orig_initializer();this.afterHostEvent("recordsetChange",this.syncUI);};a.prototype.orig_syncWidths=a.prototype._syncWidths;a.prototype._syncWidths=function(){var c=this.get("host"),d=c.get("recordset");if(d.getLength()===0){return;}this.orig_syncWidths();};}},"@VERSION@",{skinnable:false,requires:["datatable"]});YUI.add("gallery-user-patch-2529920-2529921",function(d){var b=d.ClassNameManager.getClassName,e="datatable",a=b(e,"liner"),c='<td headers="{headers}" class="{classnames}"><div class="'+a+'"></div></td>';d.DataTable.Base.prototype._createTbodyTdNode=function(h){var g=h.column,f=null;h.headers=g.headers;h.classnames=g.get("classnames");h.td=d.Node.create(d.substitute(c,h));h.liner=h.td.one("div");f=this.formatDataCell(h);if(d.Lang.isString(f)){h.value=f;h.liner.append(f);}return h.td;};d.DataTable.Base.prototype.formatDataCell=function(i){var f=i.record,h=i.column,g=h.get("formatter"),j=function(l,k,m){return d.Lang.isNull(k)||d.Lang.isUndefined(k)?"":k;};i.data=f.get("data");i.value=f.getValue(h.get("field"));return d.Lang.isString(g)?d.substitute(g,i,j):d.Lang.isFunction(g)?g.call(this,i):d.substitute(this.get("tdValueTemplate"),i,j);};},"@VERSION@",{skinnable:false,requires:["datatable"]});YUI.add("gallery-user-patch-2529943",function(a){a.Plugin.DataTableSort.prototype._beforeCreateTheadThNode=function(b){if(b.column.get("sortable")){b.value=a.substitute(this.get("template"),{link_class:b.link_class||"",link_title:b.column.get("title")||b.column.get("key"),link_href:"#",value:b.value});}};},"@VERSION@",{skinnable:false,requires:["datatable","datasource"]});YUI.add("gallery-user-patch-2529968",function(a){a.DataTable.Base.prototype._addCaptionNode=function(b){this._captionNode=a.Node.create("<caption></caption>");return this._captionNode;};a.DataTable.Base.prototype._uiSetCaption=function(b){if(!a.Lang.isValue(b)){this._captionNode.remove();}else{this._captionNode.setContent(b);this._tableNode.append(this._captionNode);}};},"@VERSION@",{skinnable:false,requires:["datatable"]});YUI.add("gallery-user-patch-2529975",function(a){a.Plugin.DataTableDataSource.prototype.onDataReturnInitializeTable=function(c){var d=this.get("host").get("recordset"),b=a.Object(d);b.set("records",c.response.results);this.get("host").set("recordset",b);};},"@VERSION@",{skinnable:false,requires:["datatable","datasource"]});YUI.add("gallery-user-patch-2530026",function(d){var a=d.ClassNameManager.getClassName,e="datatable",b=a(e,"first"),c=a(e,"last");d.DataTable.Base.prototype._createTheadTrNode=function(n,g,m){n.id=d.guid();var l=d.Node.create(d.substitute(this.get("trTemplate"),n)),j=0,h=n.columns,f=h.length,k;if(g){l.addClass(b);}if(m){l.addClass(c);}for(;j<f;++j){k=h[j];this._addTheadThNode({value:k.get("label"),column:k,tr:l});}return l;};},"@VERSION@",{skinnable:false,requires:["datatable"]});YUI.add("gallery-user-patch-2530294",function(e){var d=e.Node,c=e.ClassNameManager.getClassName,g="datatable",a=c(g,"hd"),b=c(g,"bd"),f=c(g,"data");e.Plugin.DataTableScroll.prototype.orig_syncWidths=function(){var h=d.all("#"+this._parentContainer.get("id")+" ."+a+" table thead th"),v=d.one("#"+this._parentContainer.get("id")+" ."+b+" table ."+f),j=v.get("firstChild").get("children"),k,q,t,p,r,n,m,o,s,l,u=function(i){return parseFloat(i.split("px")[0]);};for(k=0,q=h.size();k<q;k++){r=h.item(k).get("firstChild");n=j.item(k).get("firstChild");t=u(r.getComputedStyle("width"));p=u(j.item(k).getComputedStyle("width"));m=u(r.getComputedStyle("paddingLeft"))+u(r.getComputedStyle("paddingRight"));o=u(n.getComputedStyle("paddingLeft"))+u(n.getComputedStyle("paddingRight"));if((t+m)>p){l=(t+"px");n.setStyle("width",l);}else{if(p>t){l=(p-o+"px");r.setStyle("width",l);if(e.UA.ie){s=v.all(".yui3-column-"+h.item(k).get("id"));s.get("firstChild").setStyle("width",(p-o+"px"));}else{n.setStyle("width",(p-o+"px"));}}}}};e.Plugin.DataTableScroll.prototype.initializer_for_gup2530294=e.Plugin.DataTableScroll.prototype.initializer;e.Plugin.DataTableScroll.prototype.initializer=function(h){this.initializer_for_gup2530294();this.get("host").after("recordsetSort:sort",e.bind(this._syncWidths,this));};},"@VERSION@",{requires:["datatable","datatable-scroll"],skinnable:true});YUI.add("gallery-user-patch-datatable-rollup",function(a){},"@VERSION@",{use:["gallery-user-patch-2529808","gallery-user-patch-2529920-2529921","gallery-user-patch-2529943","gallery-user-patch-2529968","gallery-user-patch-2529975","gallery-user-patch-2530026","gallery-user-patch-2530294"],skinnable:true});
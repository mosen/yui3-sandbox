YUI.add("gallery-dp-datatable-plugin-serversort",function(g){var e=g.Lang,f=g.ClassNameManager.getClassName,h="datatable",b="column",d="asc",c="desc",a='<a class="{link_class}" title="{link_title}" href="{link_href}">{value}</a>';g.namespace("DP").DataTableServerSort=g.Base.create("gallery-dp-datatable-plugin-serversort",g.Plugin.Base,[],{initializer:function(j){var k=this.get("host"),i=k.datasource;this.beforeHostMethod("_createTheadThNode",this._beforeCreateTheadThNode,this);this.beforeHostMethod("_attachTheadThNode",this._beforeAttachTheadThNode,this);this.beforeHostMethod("_attachTbodyTdNode",this._beforeAttachTbodyTdNode,this);k.delegate("click",g.bind(this._handleHeaderClick,this),"th");},destructor:function(){},_beforeCreateTheadThNode:function(i){if(i.column.get("sortable")){i.value=g.substitute(this.get("template"),{link_class:i.link_class||"",link_title:i.column.get("title")||i.column.get("key"),link_href:"#",value:i.value});}},_beforeAttachTheadThNode:function(m){var l=this.get("lastSortedBy"),k=l&&l.key,i=l&&l.dir,j=l&&l.notdir;if(m.column.get("sortable")){m.th.addClass(f(h,"sortable"));}if(k&&(k===m.column.get("key"))){m.th.replaceClass(f(h,j),f(h,i));}},_beforeAttachTbodyTdNode:function(m){var l=this.get("lastSortedBy"),k=l&&l.key,i=l&&l.dir,j=l&&l.notdir;if(m.column.get("sortable")){m.td.addClass(f(h,"sortable"));}if(k&&(k===m.column.get("key"))){m.td.replaceClass(f(h,j),f(h,i));}},_handleHeaderClick:function(){}},{NS:"sort",ATTRS:{sortlist:{value:undefined},template:{value:a}}});},"@VERSION@",{requires:["datatable","datatable-datasource"]});
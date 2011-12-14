YUI.add("gallery-datatable-ml-serversort",function(a){var b=a.Lang,c=a.ClassNameManager.getClassName,d="datatable",e="column",f="asc",g="desc",h=1001,i=1002,j=1e3,k={1e3:"NONE",1001:"ASC",1002:"DESC"},l='<a class="{link_class}" title="{link_title}" href="{link_href}">{value}</a>';a.namespace("DP").DatatableMlServerSort=a.Base.create("gallery-datatable-ml-serversort",a.Plugin.Base,[],{initializer:function(b){var c=this.get("host");this.beforeHostMethod("_createTheadThNode",this._beforeCreateTheadThNode,this),this.beforeHostMethod("_attachTheadThNode",this._beforeAttachTheadThNode,this),this.beforeHostMethod("_attachTbodyTdNode",this._beforeAttachTbodyTdNode,this),c.delegate("click",a.bind(this._handleHeaderClick,this),"th"),this.publish("sort",{defaultFn:this._defFnSort})},destructor:function(){},_beforeCreateTheadThNode:function(b){b.column.get("sortable")&&(b.value=a.substitute(this.get("template"),{link_class:b.link_class||"",link_title:b.column.get("title")||b.column.get("key"),link_href:"#",value:b.value}))},_beforeAttachTheadThNode:function(a){var b=this.get("initialSort");if(a.column.get("sortable")){var e=a.column.get("key");a.th.addClass(c(d,"sortable"))}},_beforeAttachTbodyTdNode:function(a){a.column.get("sortable")&&a.td.addClass(c(d,"sortable"))},_handleHeaderClick:function(a){a.halt();var b=this.get("host"),c=b.get("columnset").idHash[a.currentTarget.get("id")];c.get("sortable")&&this.sort(c)},sort:function(a,b){var c=this.get("sorting"),d=a.get("id"),e=c[d];b!==undefined?c[a.get("id")]=b:e===undefined||e===j?c[d]=i:e===i?c[d]=h:e===h&&delete c[d],this.fire("sort",{column:a,direction:c[d],columns:c})},_defFnSort:function(a){this._uiSetSort({thNode:a.column.thNode,direction:a.direction})},_uiSetSort:function(a){var b=a.thNode;switch(a.direction){case h:b.removeClass(c(d,g)),b.addClass(c(d,f));break;case i:b.removeClass(c(d,f)),b.addClass(c(d,g));break;default:b.removeClass(c(d,g)),b.removeClass(c(d,f))}},getQueryParameters:function(){var a=this.get("sorting"),b=[],c;for(key in a)c=this.get("host").get("columnset").idHash[key],b.push("sort["+c.get("key")+"]="+k[a[key]]);return b}},{NS:"sort",ATTRS:{sorting:{value:[]},initialSort:{value:[]},multiple:{value:!0,validator:a.Lang.isBoolean},template:{value:l}},SORT:{ASC:h,DESC:i,NONE:j}})},"1.0.0",{requires:["gallery-datatable-ml","plugin"]})
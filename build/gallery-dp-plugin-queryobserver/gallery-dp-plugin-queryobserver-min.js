YUI.add("gallery-dp-plugin-queryobserver",function(b){function a(c){a.superclass.constructor.apply(this,arguments);}b.mix(a,{NS:"qobserver",NAME:"queryObserverPlugin",ATTRS:{parameters:{value:{}},callback:{value:{}}}});b.extend(a,b.Plugin.Base,{initializer:function(c){this.after("parametersChange",b.bind(this._hostRequestWithNewParameters,this));},destructor:function(){},notify:function(f,g,d){var c=d(f,g),i=f.get("id")||f.get("host").get("id"),h=this.get("parameters");h[i]=c;this.set("parameters",h);},observe:function(d,f,c){var e=["on","after","before"];b.Array.each(e,function(g){if(b.Lang.isString(f[g])){d[g](f[g],b.bind(function(h){this.notify(d,h,c);},this));}else{if(b.Lang.isArray(f[g])){b.Array.each(f[g],function(h){d[g](h,b.bind(function(i){this.notify(d,i,c);},this));},this);}}},this);},_hostRequestWithNewParameters:function(g){var f=this.get("host"),h=this.get("parameters"),d=[];for(subjectid in h){var c=h[subjectid];b.Array.each(c,function(e){d.push(e);},this);}this.get("host").sendRequest({request:"?"+d.join("&"),callback:this.get("callback")});}});b.namespace("DP").QueryObserverPlugin=a;},"@VERSION@",{requires:["plugin","datasource"]});
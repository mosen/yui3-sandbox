YUI.add("gallery-dp-datatable-plugin-editable",function(c){var b=c.Lang;function a(e){a.superclass.constructor.apply(this,arguments);}c.mix(a,{NS:"editor",NAME:"editor",ATTRS:{}});c.extend(a,c.Plugin.Base,{initializer:function(e){},destructor:function(){},add:function(e,f){if(b.isArray(e)||e instanceof c.Record||b.isObject(e)){this.get("host").get("recordset").add(e,f);}else{if(b.isNull(e)||b.isUndefined(e)){this.get("host").get("recordset").add({},f);}}},remove:function(j){var g=this.get("host").get("recordset"),e,f,h=0;e=this._resolveRecord(j);if(b.isValue(e)){f=g.get("records");for(;h<=f.length;h++){if(f[h]==e){g.remove(h);break;}}}},update:function(i,h){var g=this.get("host").get("recordset"),f=g.get("records"),e,j;e=this._resolveRecord(i);if(b.isValue(e)){e.set("data",h);g.update(e,f.indexOf(e));}},_resolveRecord:function(h){var f,i,g=this.get("host").get("recordset"),e=g.get("table");if(h instanceof c.Record){f=h;}else{if(b.isString(h)&&/yui_/.test(h)){f=e[h];}else{if(h instanceof c.Node){i=h.get("id");f=g.getRecord(i);}else{if(b.isNumber(h)){f=g.getRecord(h);}else{if(b.isArray(h)){}}}}}return f;}});c.namespace("DP").DatatableEditor=a;function d(e){d.superclass.constructor.apply(this,arguments);}c.mix(d,{NS:"updater",NAME:"updater",ATTRS:{}});c.extend(d,c.Plugin.Base,{initializer:function(){this.afterHostEvent("recordset:add",this._afterRecordsetAdd);this.afterHostEvent("recordset:remove",this._afterRecordsetRemove);this.afterHostEvent("recordset:empty",this._afterRecordsetEmpty);this.afterHostEvent("recordset:update",this._afterRecordsetUpdate);},destructor:function(){},_afterRecordsetAdd:function(){this.get("host")._uiSetRecordset(this.get("host").get("recordset"));},_afterRecordsetRemove:function(){this.get("host")._uiSetRecordset(this.get("host").get("recordset"));},_afterRecordsetEmpty:function(){this.get("host")._uiSetRecordset(this.get("host").get("recordset"));},_afterRecordsetUpdate:function(){this.get("host")._uiSetRecordset(this.get("host").get("recordset"));}});c.namespace("DP").DatatableUpdates=d;},"@VERSION@",{requires:["datatable","gallery-datatable-tableevents"]});
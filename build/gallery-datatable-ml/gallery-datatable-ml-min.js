YUI.add("gallery-datatable-ml",function(c){var e=c.Lang,j=e.isValue,C=c.Lang.sub,H=c.Node,k=H.create,f=c.ClassNameManager.getClassName,s="datatable",h="column",i="focus",g="keydown",G="mouseenter",p="mouseleave",o="mouseup",t="mousedown",m="click",d="dblclick",u=f(s,"columns"),a=f(s,"data"),l=f(s,"msg"),r=f(s,"liner"),A=f(s,"first"),w=f(s,"last"),q=f(s,"even"),n=f(s,"odd"),F="<table></table>",z="<col></col>",D='<thead class="'+u+'"></thead>',I='<tbody class="'+a+'"></tbody>',B='<th id="{id}" rowspan="{rowspan}" colspan="{colspan}" class="{classnames}" abbr="{abbr}"><div class="'+r+'">{value}</div></th>',v='<tr id="{id}"></tr>',E='<td headers="{headers}" class="{classnames}"><div class="'+r+'">{value}</div></td>',x="{value}",y='<tbody class="'+l+'"></tbody>';function b(){}b.prototype={destructor:function(){},bindUI:function(){this.after({columnsetChange:this._afterColumnsetChange,modelListChange:this._afterModelListChange,summaryChange:this._afterSummaryChange,captionChange:this._afterCaptionChange});this.get("models").after("add",this._afterModelListAdd,this);this.get("models").after("remove",this._afterModelListRemove,this);this.get("models").after("reset",this._afterModelListChange,this);},syncUI:function(){this._uiSetColumnset(this.get("columnset"));this._uiSetModelList(this.get("models"));this._uiSetSummary(this.get("summary"));this._uiSetCaption(this.get("caption"));},_uiSetModelList:function(Q){var R=this._tbodyNode,U=R.get("parentNode"),M=R.next(),L=this.get("columnset").keys,O=this.get("tdValueTemplate"),J={},S,N,P,K,T;R.remove();R=null;S=this._addTbodyNode(this._tableNode);S.remove();this._tbodyNode=S;J.tbody=S;J.rowTemplate=this.get("trTemplate");J.columns=[];for(N=L.length-1;N>=0;--N){K=L[N];J.columns[N]={column:K,fields:K.get("field"),classes:K.get("classnames")};T=K.get("formatter");if(!e.isFunction(T)){if(!e.isString(T)){T=O;}T=c.bind(C,this,T);}J.columns[N].formatter=T;}Q.each(c.bind(function(V){J.data=V.getAttrs();J.rowindex=Q.indexOf(V);this._addTbodyTrNode(J);},this));U.insert(this._tbodyNode,M);},_createTbodyTrNode:function(N){var L=N.columns,K,J,M;N.tr=k(C(N.rowTemplate,{id:N.data["id"]||c.guid()}));for(K=0,J=L.length;K<J;++K){M=L[K];N.column=M.column;N.field=M.fields;N.classnames=M.classes;N.formatter=M.formatter;this._addTbodyTdNode(N);}return N.tr;},_addTbodyTrNode:function(K){var J=K.tbody.one("#"+c.guid());K.tr=J||this._createTbodyTrNode(K);this._attachTbodyTrNode(K);},_createTbodyTdNode:function(J){J.headers=J.column.headers;J.value=this.formatDataCell(J);return k(C(this.tdTemplate,J));},formatDataCell:function(J){J.value=J.data[J.field];return J.formatter.call(this,J);},_addModel:function(O){var P=this._tbodyNode,R=P.get("parentNode"),L=this.get("columnset").keys,M=this.get("tdValueTemplate"),J={},N,K,Q;J.tbody=this._tbodyNode;J.rowTemplate=this.get("trTemplate");J.columns=[];for(N=L.length-1;N>=0;--N){K=L[N];J.columns[N]={column:K,fields:K.get("field"),classes:K.get("classnames")};Q=K.get("formatter");if(!e.isFunction(Q)){if(!e.isString(Q)){Q=M;}Q=c.bind(C,this,Q);}J.columns[N].formatter=Q;}J.model=O;J.rowindex=this.get("models").indexOf(O);this._addTbodyTrNode(J);},_afterModelListAdd:function(J){this._addModel(J.model);},_afterModelListRemove:function(){},_afterModelListChange:function(){this._uiSetModelList(this.get("models"));}};b.ATTRS={models:{value:null},recordset:{value:null}};c.Base.mix(c.DataTable.Base,[b]);},"@VERSION@",{requires:["base","datatable","model-list"]});
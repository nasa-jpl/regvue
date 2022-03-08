(function(){"use strict";var e={753:function(e,t,s){var n=s(244),a=(s(938),s(963)),r=s(252),l=s(577);const o={class:"sidebar"},i={class:"view"},d={class:"app-version"},u=(0,r.Uk)(" Powered by "),c=["href"];function h(e,t,s,n,a,h){const g=(0,r.up)("Header"),p=(0,r.up)("Column"),f=(0,r.up)("TreeTable"),m=(0,r.up)("router-view");return(0,r.wg)(),(0,r.iD)(r.HY,null,[(0,r.Wm)(g,{title:h.title,links:h.links,version:h.version},null,8,["title","links","version"]),(0,r._)("div",o,[(0,r.Wm)(f,{class:"p-treetable-sm",value:a.sharedState.nodes,expandedKeys:a.expandedKeys,scrollable:!0,scrollHeight:"calc(100vh - 58px)",selectionKeys:a.selectionKeys,"onUpdate:selectionKeys":t[0]||(t[0]=e=>a.selectionKeys=e),selectionMode:"single",onNodeSelect:h.onNodeSelect},{default:(0,r.w5)((()=>[(0,r.Wm)(p,{field:"name",header:"Name",expander:!0,headerClass:"sidebar-name-header",bodyClass:"sidebar-name-body"}),(0,r.Wm)(p,{field:"addr",header:"Address",headerClass:"sidebar-addr-header",bodyClass:"sidebar-addr-body"})])),_:1},8,["value","expandedKeys","selectionKeys","onNodeSelect"])]),(0,r._)("div",i,[(0,r.Wm)(m)]),(0,r._)("div",d,[u,(0,r._)("a",{href:a.appInfo.url},(0,l.zw)(a.appInfo.name)+" v"+(0,l.zw)(a.appInfo.version),9,c)])],64)}var g=s(262),p={hex(e){return"0x"+e.toString(16)},field_value(e,t){return 1==e.nbits?t:this.hex(t)}},f={sharedState:(0,g.qj)({data:null,fields:null,nodes:null}),loaded:!1,load(e){return fetch(e).then((e=>e.json())).then((e=>{this.sharedState.data=e,this.sharedState.fields=this.get_field_map(e.elements),this.sharedState.nodes=this.get_nodes(e.elements,e.root),this.loaded=!0}))},untilLoaded(e){function t(s){e.loaded?s():setTimeout((e=>t(s)),1e3)}return new Promise(t)},get_field_map(e){let t=new Map;for(let s in e){let n=e[s];if(n.fields)for(let e of n.fields){let n=s+"."+e.name;t.set(n,s)}}return t},get_nodes(e,t){return t.children.map((t=>{let s=e[t],n={key:s["id"],styleClass:s["id"],data:{name:s["name"],addr:p.hex(s["addr"])}};return"children"in s&&(n["children"]=this.get_nodes(e,s)),n}))},first_reg(){for(let e in this.sharedState.data.elements)if("reg"==this.sharedState.data.elements[e].type)return e}},m=JSON.parse('{"u2":"regvue","i8":"0.2.0","Xh":"https://github.com/rfdonnelly/regvue"}'),_={created(){this.reg={},f.load("data.json"),this.$watch((()=>this.$route.params),((e,t)=>{e.regid&&f.untilLoaded(f).then((t=>{this.selectElement(e.regid)}))}))},data(){return{appInfo:{name:m.u2,url:m.Xh,version:m.i8},reg:null,sharedState:f.sharedState,expandedKeys:{},selectionKeys:{}}},methods:{onNodeSelect(e){this.$router.push({name:"reg",params:{regid:e.key}})},selectElement(e){this.reg=this.sharedState.data.elements[e],this.selectionKeys={},this.selectionKeys[e]=!0;let t=e;while(t.includes("."))t=t.replace(/\.\w+$/,""),this.expandedKeys[t]=!0;let s=document.getElementsByClassName(e);if(s.length){let e=s[0];e.scrollIntoView({block:"center"})}}},computed:{title(){return this.sharedState.data?.root?.display_name||"display_name undefined"},links(){let e=this.sharedState.data?.root?.links;return e?Object.entries(e).map((([e,t])=>{let s={href:t,text:e};return s})):{}},version(){return this.sharedState.data?.root?.version||"version undefined"}},name:"App"},b=s(744);const v=(0,b.Z)(_,[["render",h]]);var y=v,w=s(119);function k(e,t,s,n,a,l){return(0,r.wg)(),(0,r.iD)("span")}var x={data(){return{}},created(){f.untilLoaded(f).then((e=>{this.$router.push({name:"reg",params:{regid:f.first_reg()}})}))}};const S=(0,b.Z)(x,[["render",k]]);var C=S;const D={key:0},I={id:"doc"},K=["innerHTML"];function M(e,t,s,n,a,l){const o=(0,r.up)("RegLayout"),i=(0,r.up)("RegFields");return l.reg?((0,r.wg)(),(0,r.iD)("div",D,[(0,r.Wm)(o,{reg:l.reg,field_name:s.field_name},null,8,["reg","field_name"]),(0,r._)("div",I,[(0,r._)("span",{innerHTML:l.doc},null,8,K)]),(0,r.Wm)(i,{reg:l.reg,field_name:s.field_name},null,8,["reg","field_name"])])):(0,r.kq)("",!0)}var O={data(){return{sharedState:f.sharedState}},props:["regid","field_name"],computed:{reg(){return this.sharedState.data?this.sharedState.data.elements[this.regid]:{}},doc(){return this.reg.doc?this.reg.doc.replaceAll("\n","<br>"):""}}};const L=(0,b.Z)(O,[["render",M],["__scopeId","data-v-7dddb035"]]);var H=L;const j=[{name:"default",path:"/",component:C},{name:"reg",path:"/reg/:regid",component:H,props:!0},{name:"field",path:"/reg/:regid/field/:field_name",component:H,props:!0}],T=(0,w.p7)({history:(0,w.r5)(),routes:j}),z={class:"p-3 mb-3 border-bottom"},q={class:"container"},W={class:"navbar fixed-top navbar-light bg-light py-0"},Z={class:"container-fluid"},Y={class:"modal",id:"version-modal",tabindex:"-1","aria-labelledby":"exampleModalLabel","aria-hidden":"true"},N={class:"modal-dialog"},R={class:"modal-content"},V=(0,r._)("div",{class:"modal-header"},[(0,r._)("h5",{class:"modal-title",id:"exampleModalLabel"},"Version"),(0,r._)("button",{type:"button",class:"btn-close","data-bs-dismiss":"modal","aria-label":"Close"})],-1),$={class:"modal-body"},A=(0,r._)("div",{class:"modal-footer"},[(0,r._)("button",{type:"button",class:"btn btn-primary","data-bs-dismiss":"modal"},"Close")],-1),B={class:"col-3 mb-3 mb-lg-0 mx-auto"},E={key:0,class:"nav mb-2 justify-content-center mb-md-0"},F=["href"];function P(e,t,s,n,a,o){const i=(0,r.up)("Search");return(0,r.wg)(),(0,r.iD)("header",z,[(0,r._)("div",q,[(0,r._)("nav",W,[(0,r._)("div",Z,[(0,r._)("span",{class:"navbar-brand mb-0 ml-2 h1",onClick:t[0]||(t[0]=(...e)=>o.showVersion&&o.showVersion(...e))},(0,l.zw)(s.title),1),(0,r._)("div",Y,[(0,r._)("div",N,[(0,r._)("div",R,[V,(0,r._)("div",$,(0,l.zw)(s.version),1),A])])]),(0,r._)("form",B,[(0,r.Wm)(i)]),s.links?((0,r.wg)(),(0,r.iD)("ul",E,[((0,r.wg)(!0),(0,r.iD)(r.HY,null,(0,r.Ko)(s.links,(e=>((0,r.wg)(),(0,r.iD)("li",{key:e},[(0,r._)("a",{href:e.href,class:"nav-link px-2 link-secondary"},(0,l.zw)(e.text),9,F)])))),128))])):(0,r.kq)("",!0)])])])])}var U={data(){return{}},props:["title","links","version"],methods:{showVersion(){let e=document.getElementById("version-modal");document.body.appendChild(e);let t=new n.u_(e,{});t.show()}}};const X=(0,b.Z)(U,[["render",P]]);var J=X;const Q={class:"search-box"},G=["value"],ee={key:0},te=(0,r._)("div",{class:"suggestion-section-heading"},"Registers",-1),se=["onMousedown","onMouseenter"],ne=["href"],ae={class:"page-title"},re={key:1},le=(0,r._)("div",{class:"suggestion-section-heading"},"Fields",-1),oe=["onMousedown","onMouseenter"],ie=["href"],de={class:"page-title"};function ue(e,t,s,n,o,i){return(0,r.wg)(),(0,r.iD)("div",Q,[(0,r._)("input",{type:"search",class:"form-control","aria-label":"Search",placeholder:"Search",value:o.query,autocomplete:"off",spellcheck:"false",onInput:t[0]||(t[0]=e=>o.query=e.target.value),onFocus:t[1]||(t[1]=e=>o.focused=!0),onKeyup:t[2]||(t[2]=(0,a.D2)((e=>i.go(o.focusIndex)),["enter"]))},null,40,G),i.showSuggestions?((0,r.wg)(),(0,r.iD)("div",{key:0,class:"suggestions",onMouseleave:t[5]||(t[5]=(...e)=>i.unfocus&&i.unfocus(...e))},[i.suggestions.regs.length>0?((0,r.wg)(),(0,r.iD)("section",ee,[te,(0,r._)("ul",null,[((0,r.wg)(!0),(0,r.iD)(r.HY,null,(0,r.Ko)(i.suggestions.regs,((e,s)=>((0,r.wg)(),(0,r.iD)("li",{key:s,class:(0,l.C_)(["suggestion",{focused:s===o.focusIndex}]),onMousedown:e=>i.go(s),onMouseenter:e=>i.focus(s)},[(0,r._)("a",{href:this.$router.resolve(e.path).href,onClick:t[3]||(t[3]=(0,a.iM)((()=>{}),["prevent"]))},[(0,r._)("span",ae,(0,l.zw)(e.name),1)],8,ne)],42,se)))),128))])])):(0,r.kq)("",!0),i.suggestions.fields.length>0?((0,r.wg)(),(0,r.iD)("section",re,[le,(0,r._)("ul",null,[((0,r.wg)(!0),(0,r.iD)(r.HY,null,(0,r.Ko)(i.suggestions.fields,((e,s)=>((0,r.wg)(),(0,r.iD)("li",{key:s+i.suggestions.regs.length,class:(0,l.C_)(["suggestion",{focused:s+i.suggestions.regs.length===o.focusIndex}]),onMousedown:e=>i.go(s+i.suggestions.regs.length),onMouseenter:e=>i.focus(s+i.suggestions.regs.length)},[(0,r._)("a",{href:this.$router.resolve(e.path).href,onClick:t[4]||(t[4]=(0,a.iM)((()=>{}),["prevent"]))},[(0,r._)("span",de,(0,l.zw)(e.name),1)],8,ie)],42,oe)))),128))])])):(0,r.kq)("",!0)],32)):(0,r.kq)("",!0)])}var ce={data(){return{sharedState:f.sharedState,query:"",focused:!1,focusIndex:0}},methods:{go(e){if(!this.showSuggestions)return;let t=this.suggestions.all[e].path;this.$router.push(t),this.query="",this.focusIndex=0},focus(e){this.focusIndex=e},unfocus(){this.focusIndex=-1}},computed:{showSuggestions(){return this.focused&&this.suggestions&&this.suggestions.all.length},suggestions(){const e=this.query.trim().toLowerCase();if(!e)return;const t={regs:[],fields:[],all:[]};for(let s in this.sharedState.data.elements){let n=this.sharedState.data.elements[s];if("reg"==n.type&&n.name.toLowerCase().includes(e)){let e={name:"reg",params:{regid:s}},n={type:"Register",name:s,path:e};t.regs.push(n),t.all.push(n)}}for(let[s,n]of this.sharedState.fields){let a=s.replace(/.*\./,"");if(a.toLowerCase().includes(e)){let e={name:"field",params:{regid:n,field_name:a}},r={type:"Field",name:s,path:e};t.fields.push(r),t.all.push(r)}}return t}}};const he=(0,b.Z)(ce,[["render",ue]]);var ge=he,pe={num(e){let{str:t,base:s}=this.base(e.trim());return parseInt(t.replaceAll("_",""),s)},base(e){let t=e.toLowerCase();return t.startsWith("0x")?{str:t.slice(2),base:16}:t.startsWith("0b")?{str:t.slice(2),base:2}:{str:t,base:10}}};const fe=e=>((0,r.dD)("data-v-f90b8032"),e=e(),(0,r.Cn)(),e),me={id:"reg-layout-table"},_e=["colspan"],be=["colspan"],ve=["value"],ye={colspan:"32"},we={class:"field-checkbox"},ke=fe((()=>(0,r._)("label",{for:"byte_swap"},"Byte swap",-1))),xe=document.createElement("canvas"),Se=function(e,t){let s=xe.getContext("2d");return s.font=t,s.measureText(e).width},Ce={mounted:function(e){const t=new ResizeObserver((function(e){let t=e[0],s=t.contentRect.width,n=t.target,a=n.textContent,r=window.getComputedStyle(n).font,l=Se(a,r);l>s?n.classList.add("rotate"):n.classList.remove("rotate")}));t.observe(e)}},De={directives:{"responsive-rotate":Ce},data(){return{byte_swap:!1}},methods:{field_value(e){return p.field_value(e,e.reset)},swap_bytes(e){let t=0;for(let s=0;s<4;s++){let n=8*s,a=e>>n&255,r=8*(3-s),l=a<<r;t|=l}return t},update_fields(e){let t=pe.num(e.target.value);this.byte_swap&&(t=this.swap_bytes(t));for(const s of this.reg.fields){let e=(1n<<BigInt(s.nbits))-1n,n=BigInt(t>>s.lsb)&e;s.reset=n}}},computed:{}};var Ie=Object.assign(De,{props:["reg","field_name"],setup(e){return(t,s)=>{const n=(0,r.up)("Checkbox"),a=(0,r.Q2)("responsive-rotate");return(0,r.wg)(),(0,r.iD)(r.HY,null,[(0,r._)("table",me,[(0,r._)("thead",null,[((0,r.wg)(),(0,r.iD)(r.HY,null,(0,r.Ko)(32,(e=>(0,r._)("th",{class:"layout_bit_index",key:e},(0,l.zw)(32-e),1))),64))]),(0,r._)("tbody",null,[(0,r._)("tr",null,[((0,r.wg)(!0),(0,r.iD)(r.HY,null,(0,r.Ko)(e.reg.fields,(t=>(0,r.wy)(((0,r.wg)(),(0,r.iD)("td",{class:(0,l.C_)(["layout_field_name",{highlight:e.field_name==t.name}]),key:t,colspan:t.nbits},[(0,r.Uk)((0,l.zw)(t.name),1)],10,_e)),[[a]]))),128))]),(0,r._)("tr",null,[((0,r.wg)(!0),(0,r.iD)(r.HY,null,(0,r.Ko)(e.reg.fields,(s=>((0,r.wg)(),(0,r.iD)("td",{class:(0,l.C_)(["layout_field_input",{highlight:e.field_name==s.name}]),key:s,colspan:s.nbits},[(0,r._)("input",{type:"text",value:t.field_value(s)},null,8,ve)],10,be)))),128))]),(0,r._)("tr",null,[(0,r._)("td",ye,[(0,r._)("input",{type:"text",onInput:s[0]||(s[0]=(...e)=>t.update_fields&&t.update_fields(...e))},null,32)])])])]),(0,r._)("div",we,[(0,r.Wm)(n,{id:"byte_swap",modelValue:t.byte_swap,"onUpdate:modelValue":s[1]||(s[1]=e=>(0,g.dq)(byte_swap)?byte_swap.value=e:null),binary:!0},null,8,["modelValue"]),ke])],64)}}});const Ke=(0,b.Z)(Ie,[["__scopeId","data-v-f90b8032"]]);var Me=Ke;const Oe=e=>((0,r.dD)("data-v-188ed152"),e=e(),(0,r.Cn)(),e),Le=Oe((()=>(0,r._)("thead",null,[(0,r._)("tr",null,[(0,r._)("th",null,"Bits"),(0,r._)("th",null,"Name"),(0,r._)("th",null,"Access"),(0,r._)("th",null,"Description")])],-1))),He={class:"fields_bits"},je={class:"fields_name"},Te={class:"fields_access"},ze={class:"fields_description"},qe=["innerHTML"],We={data(){return{}},methods:{bits(e,t){return 1==t?e:t+e-1+":"+e}},computed:{}};var Ze=Object.assign(We,{props:["reg","field_name"],setup(e){return(t,s)=>((0,r.wg)(),(0,r.iD)("table",null,[Le,(0,r._)("tbody",null,[((0,r.wg)(!0),(0,r.iD)(r.HY,null,(0,r.Ko)(e.reg.fields,(s=>((0,r.wg)(),(0,r.iD)("tr",{key:s,class:(0,l.C_)({highlight:e.field_name==s.name})},[(0,r._)("td",He,(0,l.zw)(t.bits(s.lsb,s.nbits)),1),(0,r._)("td",je,(0,l.zw)(s.name),1),(0,r._)("td",Te,(0,l.zw)(s.access),1),(0,r._)("td",ze,[(0,r._)("span",{innerHTML:s.doc?.replaceAll("\n","<br>")},null,8,qe)])],2)))),128))])]))}});const Ye=(0,b.Z)(Ze,[["__scopeId","data-v-188ed152"]]);var Ne=Ye,Re=s(475),Ve=s(25),$e=s(247),Ae=s(876);(0,a.ri)(y).use(Re.Z).use(T).component("Header",J).component("Search",ge).component("RegLayout",Me).component("RegFields",Ne).component("TreeTable",Ve.Z).component("Column",$e.Z).component("Checkbox",Ae.Z).mount("#app")}},t={};function s(n){var a=t[n];if(void 0!==a)return a.exports;var r=t[n]={exports:{}};return e[n](r,r.exports,s),r.exports}s.m=e,function(){var e=[];s.O=function(t,n,a,r){if(!n){var l=1/0;for(u=0;u<e.length;u++){n=e[u][0],a=e[u][1],r=e[u][2];for(var o=!0,i=0;i<n.length;i++)(!1&r||l>=r)&&Object.keys(s.O).every((function(e){return s.O[e](n[i])}))?n.splice(i--,1):(o=!1,r<l&&(l=r));if(o){e.splice(u--,1);var d=a();void 0!==d&&(t=d)}}return t}r=r||0;for(var u=e.length;u>0&&e[u-1][2]>r;u--)e[u]=e[u-1];e[u]=[n,a,r]}}(),function(){s.d=function(e,t){for(var n in t)s.o(t,n)&&!s.o(e,n)&&Object.defineProperty(e,n,{enumerable:!0,get:t[n]})}}(),function(){s.g=function(){if("object"===typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"===typeof window)return window}}()}(),function(){s.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)}}(),function(){s.r=function(e){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})}}(),function(){var e={143:0};s.O.j=function(t){return 0===e[t]};var t=function(t,n){var a,r,l=n[0],o=n[1],i=n[2],d=0;if(l.some((function(t){return 0!==e[t]}))){for(a in o)s.o(o,a)&&(s.m[a]=o[a]);if(i)var u=i(s)}for(t&&t(n);d<l.length;d++)r=l[d],s.o(e,r)&&e[r]&&e[r][0](),e[r]=0;return s.O(u)},n=self["webpackChunkregvue"]=self["webpackChunkregvue"]||[];n.forEach(t.bind(null,0)),n.push=t.bind(null,n.push.bind(n))}();var n=s.O(void 0,[998],(function(){return s(753)}));n=s.O(n)})();
//# sourceMappingURL=app.e215b805.js.map
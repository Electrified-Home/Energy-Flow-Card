(function(){"use strict";const M=globalThis,F=M.ShadowRoot&&(M.ShadyCSS===void 0||M.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,N=Symbol(),J=new WeakMap;let K=class{constructor(t,e,i){if(this._$cssResult$=!0,i!==N)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(F&&t===void 0){const i=e!==void 0&&e.length===1;i&&(t=J.get(e)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),i&&J.set(e,t))}return t}toString(){return this.cssText}};const pt=o=>new K(typeof o=="string"?o:o+"",void 0,N),ut=(o,...t)=>{const e=o.length===1?o[0]:t.reduce(((i,s,n)=>i+(r=>{if(r._$cssResult$===!0)return r.cssText;if(typeof r=="number")return r;throw Error("Value passed to 'css' function must be a 'css' function result: "+r+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+o[n+1]),o[0]);return new K(e,o,N)},gt=(o,t)=>{if(F)o.adoptedStyleSheets=t.map((e=>e instanceof CSSStyleSheet?e:e.styleSheet));else for(const e of t){const i=document.createElement("style"),s=M.litNonce;s!==void 0&&i.setAttribute("nonce",s),i.textContent=e.cssText,o.appendChild(i)}},Z=F?o=>o:o=>o instanceof CSSStyleSheet?(t=>{let e="";for(const i of t.cssRules)e+=i.cssText;return pt(e)})(o):o;const{is:bt,defineProperty:mt,getOwnPropertyDescriptor:ft,getOwnPropertyNames:yt,getOwnPropertySymbols:$t,getPrototypeOf:_t}=Object,O=globalThis,X=O.trustedTypes,vt=X?X.emptyScript:"",wt=O.reactiveElementPolyfillSupport,S=(o,t)=>o,L={toAttribute(o,t){switch(t){case Boolean:o=o?vt:null;break;case Object:case Array:o=o==null?o:JSON.stringify(o)}return o},fromAttribute(o,t){let e=o;switch(t){case Boolean:e=o!==null;break;case Number:e=o===null?null:Number(o);break;case Object:case Array:try{e=JSON.parse(o)}catch{e=null}}return e}},I=(o,t)=>!bt(o,t),Y={attribute:!0,type:String,converter:L,reflect:!1,useDefault:!1,hasChanged:I};Symbol.metadata??=Symbol("metadata"),O.litPropertyMetadata??=new WeakMap;let _=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=Y){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const i=Symbol(),s=this.getPropertyDescriptor(t,i,e);s!==void 0&&mt(this.prototype,t,s)}}static getPropertyDescriptor(t,e,i){const{get:s,set:n}=ft(this.prototype,t)??{get(){return this[e]},set(r){this[e]=r}};return{get:s,set(r){const c=s?.call(this);n?.call(this,r),this.requestUpdate(t,c,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??Y}static _$Ei(){if(this.hasOwnProperty(S("elementProperties")))return;const t=_t(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(S("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(S("properties"))){const e=this.properties,i=[...yt(e),...$t(e)];for(const s of i)this.createProperty(s,e[s])}const t=this[Symbol.metadata];if(t!==null){const e=litPropertyMetadata.get(t);if(e!==void 0)for(const[i,s]of e)this.elementProperties.set(i,s)}this._$Eh=new Map;for(const[e,i]of this.elementProperties){const s=this._$Eu(e,i);s!==void 0&&this._$Eh.set(s,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const s of i)e.unshift(Z(s))}else t!==void 0&&e.push(Z(t));return e}static _$Eu(t,e){const i=e.attribute;return i===!1?void 0:typeof i=="string"?i:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise((t=>this.enableUpdating=t)),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach((t=>t(this)))}addController(t){(this._$EO??=new Set).add(t),this.renderRoot!==void 0&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const i of e.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return gt(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach((t=>t.hostConnected?.()))}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach((t=>t.hostDisconnected?.()))}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$ET(t,e){const i=this.constructor.elementProperties.get(t),s=this.constructor._$Eu(t,i);if(s!==void 0&&i.reflect===!0){const n=(i.converter?.toAttribute!==void 0?i.converter:L).toAttribute(e,i.type);this._$Em=t,n==null?this.removeAttribute(s):this.setAttribute(s,n),this._$Em=null}}_$AK(t,e){const i=this.constructor,s=i._$Eh.get(t);if(s!==void 0&&this._$Em!==s){const n=i.getPropertyOptions(s),r=typeof n.converter=="function"?{fromAttribute:n.converter}:n.converter?.fromAttribute!==void 0?n.converter:L;this._$Em=s;const c=r.fromAttribute(e,n.type);this[s]=c??this._$Ej?.get(s)??c,this._$Em=null}}requestUpdate(t,e,i){if(t!==void 0){const s=this.constructor,n=this[t];if(i??=s.getPropertyOptions(t),!((i.hasChanged??I)(n,e)||i.useDefault&&i.reflect&&n===this._$Ej?.get(t)&&!this.hasAttribute(s._$Eu(t,i))))return;this.C(t,e,i)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,e,{useDefault:i,reflect:s,wrapped:n},r){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,r??e??this[t]),n!==!0||r!==void 0)||(this._$AL.has(t)||(this.hasUpdated||i||(e=void 0),this._$AL.set(t,e)),s===!0&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}const t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[s,n]of this._$Ep)this[s]=n;this._$Ep=void 0}const i=this.constructor.elementProperties;if(i.size>0)for(const[s,n]of i){const{wrapped:r}=n,c=this[s];r!==!0||this._$AL.has(s)||c===void 0||this.C(s,void 0,n,c)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach((i=>i.hostUpdate?.())),this.update(e)):this._$EM()}catch(i){throw t=!1,this._$EM(),i}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach((e=>e.hostUpdated?.())),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach((e=>this._$ET(e,this[e]))),this._$EM()}updated(t){}firstUpdated(t){}};_.elementStyles=[],_.shadowRootOptions={mode:"open"},_[S("elementProperties")]=new Map,_[S("finalized")]=new Map,wt?.({ReactiveElement:_}),(O.reactiveElementVersions??=[]).push("2.1.1");const W=globalThis,R=W.trustedTypes,Q=R?R.createPolicy("lit-html",{createHTML:o=>o}):void 0,tt="$lit$",m=`lit$${Math.random().toFixed(9).slice(2)}$`,et="?"+m,At=`<${et}>`,f=document,E=()=>f.createComment(""),x=o=>o===null||typeof o!="object"&&typeof o!="function",z=Array.isArray,St=o=>z(o)||typeof o?.[Symbol.iterator]=="function",q=`[ 	
\f\r]`,C=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,it=/-->/g,st=/>/g,y=RegExp(`>|${q}(?:([^\\s"'>=/]+)(${q}*=${q}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),ot=/'/g,nt=/"/g,rt=/^(?:script|style|textarea|title)$/i,Et=o=>(t,...e)=>({_$litType$:o,strings:t,values:e}),B=Et(1),v=Symbol.for("lit-noChange"),p=Symbol.for("lit-nothing"),at=new WeakMap,$=f.createTreeWalker(f,129);function ct(o,t){if(!z(o)||!o.hasOwnProperty("raw"))throw Error("invalid template strings array");return Q!==void 0?Q.createHTML(t):t}const xt=(o,t)=>{const e=o.length-1,i=[];let s,n=t===2?"<svg>":t===3?"<math>":"",r=C;for(let c=0;c<e;c++){const a=o[c];let h,d,l=-1,u=0;for(;u<a.length&&(r.lastIndex=u,d=r.exec(a),d!==null);)u=r.lastIndex,r===C?d[1]==="!--"?r=it:d[1]!==void 0?r=st:d[2]!==void 0?(rt.test(d[2])&&(s=RegExp("</"+d[2],"g")),r=y):d[3]!==void 0&&(r=y):r===y?d[0]===">"?(r=s??C,l=-1):d[1]===void 0?l=-2:(l=r.lastIndex-d[2].length,h=d[1],r=d[3]===void 0?y:d[3]==='"'?nt:ot):r===nt||r===ot?r=y:r===it||r===st?r=C:(r=y,s=void 0);const g=r===y&&o[c+1].startsWith("/>")?" ":"";n+=r===C?a+At:l>=0?(i.push(h),a.slice(0,l)+tt+a.slice(l)+m+g):a+m+(l===-2?c:g)}return[ct(o,n+(o[e]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),i]};class P{constructor({strings:t,_$litType$:e},i){let s;this.parts=[];let n=0,r=0;const c=t.length-1,a=this.parts,[h,d]=xt(t,e);if(this.el=P.createElement(h,i),$.currentNode=this.el.content,e===2||e===3){const l=this.el.content.firstChild;l.replaceWith(...l.childNodes)}for(;(s=$.nextNode())!==null&&a.length<c;){if(s.nodeType===1){if(s.hasAttributes())for(const l of s.getAttributeNames())if(l.endsWith(tt)){const u=d[r++],g=s.getAttribute(l).split(m),b=/([.?@])?(.*)/.exec(u);a.push({type:1,index:n,name:b[2],strings:g,ctor:b[1]==="."?Pt:b[1]==="?"?Tt:b[1]==="@"?Ht:U}),s.removeAttribute(l)}else l.startsWith(m)&&(a.push({type:6,index:n}),s.removeAttribute(l));if(rt.test(s.tagName)){const l=s.textContent.split(m),u=l.length-1;if(u>0){s.textContent=R?R.emptyScript:"";for(let g=0;g<u;g++)s.append(l[g],E()),$.nextNode(),a.push({type:2,index:++n});s.append(l[u],E())}}}else if(s.nodeType===8)if(s.data===et)a.push({type:2,index:n});else{let l=-1;for(;(l=s.data.indexOf(m,l+1))!==-1;)a.push({type:7,index:n}),l+=m.length-1}n++}}static createElement(t,e){const i=f.createElement("template");return i.innerHTML=t,i}}function w(o,t,e=o,i){if(t===v)return t;let s=i!==void 0?e._$Co?.[i]:e._$Cl;const n=x(t)?void 0:t._$litDirective$;return s?.constructor!==n&&(s?._$AO?.(!1),n===void 0?s=void 0:(s=new n(o),s._$AT(o,e,i)),i!==void 0?(e._$Co??=[])[i]=s:e._$Cl=s),s!==void 0&&(t=w(o,s._$AS(o,t.values),s,i)),t}class Ct{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:i}=this._$AD,s=(t?.creationScope??f).importNode(e,!0);$.currentNode=s;let n=$.nextNode(),r=0,c=0,a=i[0];for(;a!==void 0;){if(r===a.index){let h;a.type===2?h=new T(n,n.nextSibling,this,t):a.type===1?h=new a.ctor(n,a.name,a.strings,this,t):a.type===6&&(h=new kt(n,this,t)),this._$AV.push(h),a=i[++c]}r!==a?.index&&(n=$.nextNode(),r++)}return $.currentNode=f,s}p(t){let e=0;for(const i of this._$AV)i!==void 0&&(i.strings!==void 0?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}}class T{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,i,s){this.type=2,this._$AH=p,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return e!==void 0&&t?.nodeType===11&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=w(this,t,e),x(t)?t===p||t==null||t===""?(this._$AH!==p&&this._$AR(),this._$AH=p):t!==this._$AH&&t!==v&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):St(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==p&&x(this._$AH)?this._$AA.nextSibling.data=t:this.T(f.createTextNode(t)),this._$AH=t}$(t){const{values:e,_$litType$:i}=t,s=typeof i=="number"?this._$AC(t):(i.el===void 0&&(i.el=P.createElement(ct(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===s)this._$AH.p(e);else{const n=new Ct(s,this),r=n.u(this.options);n.p(e),this.T(r),this._$AH=n}}_$AC(t){let e=at.get(t.strings);return e===void 0&&at.set(t.strings,e=new P(t)),e}k(t){z(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let i,s=0;for(const n of t)s===e.length?e.push(i=new T(this.O(E()),this.O(E()),this,this.options)):i=e[s],i._$AI(n),s++;s<e.length&&(this._$AR(i&&i._$AB.nextSibling,s),e.length=s)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){const i=t.nextSibling;t.remove(),t=i}}setConnected(t){this._$AM===void 0&&(this._$Cv=t,this._$AP?.(t))}}class U{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,i,s,n){this.type=1,this._$AH=p,this._$AN=void 0,this.element=t,this.name=e,this._$AM=s,this.options=n,i.length>2||i[0]!==""||i[1]!==""?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=p}_$AI(t,e=this,i,s){const n=this.strings;let r=!1;if(n===void 0)t=w(this,t,e,0),r=!x(t)||t!==this._$AH&&t!==v,r&&(this._$AH=t);else{const c=t;let a,h;for(t=n[0],a=0;a<n.length-1;a++)h=w(this,c[i+a],e,a),h===v&&(h=this._$AH[a]),r||=!x(h)||h!==this._$AH[a],h===p?t=p:t!==p&&(t+=(h??"")+n[a+1]),this._$AH[a]=h}r&&!s&&this.j(t)}j(t){t===p?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class Pt extends U{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===p?void 0:t}}class Tt extends U{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==p)}}class Ht extends U{constructor(t,e,i,s,n){super(t,e,i,s,n),this.type=5}_$AI(t,e=this){if((t=w(this,t,e,0)??p)===v)return;const i=this._$AH,s=t===p&&i!==p||t.capture!==i.capture||t.once!==i.once||t.passive!==i.passive,n=t!==p&&(i===p||s);s&&this.element.removeEventListener(this.name,this,i),n&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class kt{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){w(this,t)}}const Mt=W.litHtmlPolyfillSupport;Mt?.(P,T),(W.litHtmlVersions??=[]).push("3.3.1");const Ot=(o,t,e)=>{const i=e?.renderBefore??t;let s=i._$litPart$;if(s===void 0){const n=e?.renderBefore??null;i._$litPart$=s=new T(t.insertBefore(E(),n),n,void 0,e??{})}return s._$AI(o),s};const j=globalThis;class H extends _{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=Ot(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return v}}H._$litElement$=!0,H.finalized=!0,j.litElementHydrateSupport?.({LitElement:H});const Lt=j.litElementPolyfillSupport;Lt?.({LitElement:H}),(j.litElementVersions??=[]).push("4.2.1");const Rt={attribute:!0,type:String,converter:L,reflect:!1,hasChanged:I},Bt=(o=Rt,t,e)=>{const{kind:i,metadata:s}=e;let n=globalThis.litPropertyMetadata.get(s);if(n===void 0&&globalThis.litPropertyMetadata.set(s,n=new Map),i==="setter"&&((o=Object.create(o)).wrapped=!0),n.set(e.name,o),i==="accessor"){const{name:r}=e;return{set(c){const a=t.get.call(this);t.set.call(this,c),this.requestUpdate(r,a,o)},init(c){return c!==void 0&&this.C(r,void 0,o,c),c}}}if(i==="setter"){const{name:r}=e;return function(c){const a=this[r];t.call(this,c),this.requestUpdate(r,a,o)}}throw Error("Unsupported decorator location: "+i)};function lt(o){return(t,e)=>typeof e=="object"?Bt(o,t,e):((i,s,n)=>{const r=s.hasOwnProperty(n);return s.constructor.createProperty(n,i),r?Object.getOwnPropertyDescriptor(s,n):void 0})(o,t,e)}function ht(o){return lt({...o,state:!0,attribute:!1})}class Ut{constructor(){this.prevStates=new Map,this.subscriptions=new Map}get hass(){return this.currentHass}updateHass(t){this.currentHass=t;for(const e of this.subscriptions.keys()){const i=this.prevStates.get(e),s=this.currentHass?.states?.[e]?.state;s!==void 0&&s!==i&&this.dispatch(e,s),s!==void 0?this.prevStates.set(e,s):this.prevStates.delete(e)}}dispatch(t,e){const i=this.subscriptions.get(t);i&&i.forEach(s=>{try{s(e)}catch(n){console.error(`[HassObservable] Error in callback for ${t}:`,n)}})}subscribe(t,e){this.subscriptions.has(t)||this.subscriptions.set(t,new Set),this.subscriptions.get(t).add(e);const i=this.currentHass?.states?.[t]?.state;if(i!==void 0)try{e(i)}catch(s){console.error(`[HassObservable] Error in initial callback for ${t}:`,s)}return()=>{const s=this.subscriptions.get(t);s&&(s.delete(e),s.size===0&&this.subscriptions.delete(t))}}getState(t){return this.currentHass?.states?.[t]?.state}hasEntity(t){return this.currentHass?.states?.[t]!==void 0}unsubscribeAll(){this.subscriptions.clear()}get subscriptionCount(){let t=0;return this.subscriptions.forEach(e=>{t+=e.size}),t}}class Dt extends H{constructor(){super(...arguments),this._hassObservable=new Ut}set hass(t){this._hassObservable.updateHass(t),this.onHassUpdate(t)}get hass(){return this._hassObservable.hass}connectedCallback(){super.connectedCallback(),this.setupSubscriptions()}disconnectedCallback(){super.disconnectedCallback(),this._hassObservable.unsubscribeAll()}resetSubscriptions(){this._hassObservable.unsubscribeAll(),this.setupSubscriptions()}subscribe(t,e){this._hassObservable.subscribe(t,e)}getState(t){return this._hassObservable.getState(t)}hasEntity(t){return this._hassObservable.hasEntity(t)}onHassUpdate(t){}}function Ft(){return{schema:[{name:"grid_entity",label:"Grid",required:!0,selector:{entity:{domain:"sensor",device_class:"power"}}},{name:"grid_icon",selector:{icon:{}},context:{icon_entity:"grid_entity"}},{name:"grid_tap_action",label:"Grid Tap Action",selector:{"ui-action":{}}},{name:"grid_hold_action",label:"Grid Hold Action",selector:{"ui-action":{}}},{name:"load_entity",label:"Load",required:!0,selector:{entity:{domain:"sensor",device_class:"power"}}},{name:"load_icon",selector:{icon:{}},context:{icon_entity:"load_entity"}},{name:"load_tap_action",label:"Load Tap Action",selector:{"ui-action":{}}},{name:"load_hold_action",label:"Load Hold Action",selector:{"ui-action":{}}},{name:"production_entity",label:"Production",required:!0,selector:{entity:{domain:"sensor",device_class:"power"}}},{name:"production_icon",selector:{icon:{}},context:{icon_entity:"production_entity"}},{name:"production_tap_action",label:"Production Tap Action",selector:{"ui-action":{}}},{name:"production_hold_action",label:"Production Hold Action",selector:{"ui-action":{}}},{name:"battery_entity",label:"Battery",required:!0,selector:{entity:{domain:"sensor",device_class:"power"}}},{name:"battery_icon",selector:{icon:{}},context:{icon_entity:"battery_entity"}},{name:"battery_tap_action",label:"Battery Tap Action",selector:{"ui-action":{}}},{name:"battery_hold_action",label:"Battery Hold Action",selector:{"ui-action":{}}},{name:"battery_soc_entity",label:"Battery SOC (%) Entity",selector:{entity:{domain:"sensor"}}},{name:"invert_battery_data",label:"Invert Battery Data",selector:{boolean:{}}}]}}function Nt(o){if(o.load)return o;const t=r=>{const c=o[`${r}_entity`];if(!c)return;const a={entity:c},h=o[`${r}_icon`],d=o[`${r}_tap_action`],l=o[`${r}_hold_action`];return h!==void 0&&(a.icon=h),d!==void 0&&(a.tap=d),l!==void 0&&(a.hold=l),a},e=t("load"),i=t("grid"),s=t("production"),n=t("battery");if(n){const r=o.battery_soc_entity,c=o.invert_battery_data;r!==void 0&&(n.soc_entity=r),c!==void 0&&(n.invert={data:c})}return e?{load:e,grid:i,production:s,battery:n}:o}function It(o){const t=Math.max(0,o.production),e=o.grid,i=o.battery,s=Math.max(0,o.load),n={productionToLoad:0,productionToBattery:0,productionToGrid:0,gridToLoad:0,gridToBattery:0,batteryToLoad:0};let r=t,c=s;if(r>0&&c>0&&(n.productionToLoad=Math.min(r,c),r-=n.productionToLoad,c-=n.productionToLoad),i<0&&r>0&&(n.productionToBattery=Math.min(r,Math.abs(i)),r-=n.productionToBattery),i>0&&c>0&&(n.batteryToLoad=Math.min(i,c),c-=n.batteryToLoad),c>0&&e>0&&(n.gridToLoad=Math.min(e,c),c-=n.gridToLoad),i<0&&e>10){const a=Math.abs(i)-n.productionToBattery;a>1&&(n.gridToBattery=Math.min(e-n.gridToLoad,a))}return e<-10&&(n.productionToGrid=Math.abs(e)),n}function Wt(o,t,e,i){const s=o[e];return s?s.icon?s.icon:s.entity&&t?.states[s.entity]&&t.states[s.entity].attributes.icon||i:i}function zt(o,t,e,i){if(!o)return;const s=e||{action:"more-info"},n=s.action||"more-info";switch(n==="default"?"more-info":n){case"more-info":const c=s.entity||i;c&&t("hass-more-info",{entityId:c});break;case"navigate":{const a=s.path??s.navigation_path;a&&(history.pushState(null,"",a),t("location-changed",{replace:!1,path:a}),window.dispatchEvent(new CustomEvent("location-changed",{detail:{replace:!1,path:a},bubbles:!0,composed:!0})))}break;case"url":s.path&&window.open(s.path);break;case"toggle":i&&o.callService("homeassistant","toggle",{entity_id:i});break;case"call-service":if(s.service){const[a,h]=s.service.split(".");o.callService(a,h,s.service_data||{},s.target)}break}}function D(o,t,e){if(!o||!e){o?.setAttribute("data-width-px","");return}t>=80?o.setAttribute("data-width-px","show-label"):t>=40?o.setAttribute("data-width-px","show-icon"):o.setAttribute("data-width-px","")}class qt{constructor(){this.animationFrameId=null,this.loadPosition=0,this.batteryPosition=0,this.loadSpeed=0,this.batterySpeed=0,this.batteryDirection="none",this.lastAnimationTime=0}getAnimationSpeed(t){return t<=0?0:t/100*2.5}setLoadSpeed(t){this.loadSpeed=this.getAnimationSpeed(t)}setBatteryAnimation(t,e){this.batterySpeed=this.getAnimationSpeed(Math.abs(t)),e!==this.batteryDirection&&(e==="up"?this.batteryPosition=100:e==="down"&&(this.batteryPosition=-100)),this.batteryDirection=e}start(t){if(this.animationFrameId!==null||!t)return;this.loadBarElement=t.querySelector(".compact-row:not(#battery-row) .bar-container"),this.batteryBarElement=t.querySelector("#battery-row .bar-container"),this.lastAnimationTime=performance.now();const e=i=>{const s=(i-this.lastAnimationTime)/1e3;this.lastAnimationTime=i,this.loadSpeed>0&&this.loadBarElement&&(this.loadPosition+=this.loadSpeed*s,this.loadPosition>100&&(this.loadPosition=-100),this.loadBarElement.style.setProperty("--gradient-x",`${this.loadPosition}%`)),this.batterySpeed>0&&this.batteryDirection!=="none"&&this.batteryBarElement&&(this.batteryDirection==="up"?(this.batteryPosition-=this.batterySpeed*s,this.batteryPosition<-100&&(this.batteryPosition=100)):(this.batteryPosition+=this.batterySpeed*s,this.batteryPosition>100&&(this.batteryPosition=-100)),this.batteryBarElement.style.setProperty("--gradient-y",`${this.batteryPosition}%`)),this.animationFrameId=requestAnimationFrame(e)};this.animationFrameId=requestAnimationFrame(e)}stop(){this.animationFrameId!==null&&(cancelAnimationFrame(this.animationFrameId),this.animationFrameId=null),this.loadBarElement=void 0,this.batteryBarElement=void 0}isRunning(){return this.animationFrameId!==null}}function jt(o,t){const e=o||1,i=t.productionToLoad/e*100,s=t.batteryToLoad/e*100,n=t.gridToLoad/e*100,r=i+s+n;let c=i,a=s,h=n;if(r>0){const d=100/r;c=i*d,a=s*d,h=n*d}return{true:{production:i,battery:s,grid:n},visual:{production:c,battery:a,grid:h}}}function Vt(o,t){let e=0,i=0,s=0,n=0,r=0,c=0,a=!1,h="none";if(o<0){h="up",a=!0;const l=Math.abs(o)||1;e=t.gridToBattery,s=t.productionToBattery;const u=t.gridToBattery/l*100,g=t.productionToBattery/l*100,b=u+g;if(b>0){const k=100/b;n=u*k,c=g*k}}else if(o>0){h="down",a=!1;const d=o||1,l=o-t.batteryToLoad;i=t.batteryToLoad,e=l;const u=t.batteryToLoad/d*100,g=l/d*100,b=u+g;if(b>0){const k=100/b;r=u*k,n=g*k}}else h="none";return{gridWatts:e,loadWatts:i,productionWatts:s,gridPercent:n,loadPercent:r,productionPercent:c,gridIsImport:a,direction:h}}const Gt=ut`
  :host,
  compact-home-energy-flow-card {
    display: block;
    width: 100%;
    height: 100%;
  }

  .compact-card,
  ha-card.compact-card {
    padding: 16px;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .compact-card .compact-view {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .compact-card .compact-view.has-battery {
    gap: 12px;
  }

  .compact-card .compact-row {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
  }

  .compact-card .bar-container {
    flex: 1;
    height: 60px;
    background: rgb(40, 40, 40);
    border-radius: 8px;
    overflow: hidden;
    display: flex;
    position: relative;
    --gradient-x: -100%;
    --gradient-y: 0%;
  }

  .compact-card .bar-container::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0) 30%,
      rgba(255, 255, 255, 0.3) 50%,
      rgba(255, 255, 255, 0) 70%,
      rgba(255, 255, 255, 0) 100%
    );
    pointer-events: none;
    z-index: 10;
    will-change: transform, opacity;
    transform: translateX(var(--gradient-x));
    opacity: 1;
    transition: opacity 0.5s ease-out;
  }

  .compact-card .bar-container.no-flow::before {
    opacity: 0;
  }

  .compact-card #battery-row .bar-container::before {
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0) 30%,
      rgba(255, 255, 255, 0.3) 50%,
      rgba(255, 255, 255, 0) 70%,
      rgba(255, 255, 255, 0) 100%
    );
    transform: translateY(var(--gradient-y));
  }

  .compact-card .bar-segment {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    font-size: 14px;
    font-weight: 600;
    color: rgb(255, 255, 255);
    transition: width 0.5s ease-out;
    position: relative;
    cursor: pointer;
  }

  .compact-card .bar-segment:hover {
    filter: brightness(1.2);
  }

  .compact-card .bar-segment-content {
    display: flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
  }

  .compact-card .bar-segment-icon {
    width: 24px;
    height: 24px;
    flex-shrink: 0;
    opacity: 1;
    color: rgb(255, 255, 255);
  }

  .compact-card .bar-segment-label {
    text-shadow: 0 1px 2px rgba(0,0,0,0.3);
  }

  .compact-card .bar-segment[data-width-px] .bar-segment-label {
    display: none;
  }

  .compact-card .bar-segment[data-width-px="show-label"] .bar-segment-label {
    display: inline;
  }

  .compact-card .bar-segment[data-width-px] .bar-segment-icon {
    display: none;
  }

  .compact-card .bar-segment[data-width-px="show-icon"] .bar-segment-icon,
  .compact-card .bar-segment[data-width-px="show-label"] .bar-segment-icon {
    display: block;
  }

  .compact-card .row-value {
    font-size: 24px;
    font-weight: 600;
    color: rgb(255, 255, 255);
    white-space: nowrap;
    min-width: 100px;
    text-align: right;
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
  }

  .compact-card .row-value:hover {
    filter: brightness(1.1);
  }

  .compact-card .row-value.battery-discharge {
    text-align: left;
    flex-direction: row-reverse;
  }

  .compact-card .row-icon {
    width: 28px;
    height: 28px;
    flex-shrink: 0;
    color: rgb(160, 160, 160);
    display: flex;
    align-items: center;
  }

  .compact-card .row-text {
    display: flex;
    align-items: baseline;
    gap: 4px;
    line-height: 1;
  }

  .compact-card .row-unit {
    font-size: 14px;
    color: rgb(160, 160, 160);
    margin-left: 4px;
  }
`;var Jt=Object.defineProperty,V=(o,t,e,i)=>{for(var s=void 0,n=o.length-1,r;n>=0;n--)(r=o[n])&&(s=r(t,e,s)||s);return s&&Jt(t,e,s),s};const G=class G extends Dt{constructor(){super(...arguments),this.viewMode="compact",this.productionColor="#256028",this.batteryColor="#104b79",this.gridColor="#7a211b",this.returnColor="#7a6b1b",this.animation=new qt}static getStubConfig(){return{}}static getConfigForm(){return Ft()}disconnectedCallback(){super.disconnectedCallback(),this.animation.stop()}setConfig(t){this.config=Nt(t),this.isConnected&&this.resetSubscriptions()}setupSubscriptions(){this.config&&(this.config.grid?.entity&&this.subscribe(this.config.grid.entity,()=>this.updateRenderData()),this.config.load?.entity&&this.subscribe(this.config.load.entity,()=>this.updateRenderData()),this.config.production?.entity&&this.subscribe(this.config.production.entity,()=>this.updateRenderData()),this.config.battery?.entity&&this.subscribe(this.config.battery.entity,()=>this.updateRenderData()),this.config.battery?.soc_entity&&this.subscribe(this.config.battery.soc_entity,()=>this.updateRenderData()))}updateRenderData(){if(!this.config||!this.hass)return;const t=this.hass.states[this.config.grid?.entity||""],e=this.hass.states[this.config.load?.entity||""],i=this.hass.states[this.config.production?.entity||""],s=this.hass.states[this.config.battery?.entity||""],n=parseFloat(t?.state??"0")||0,r=parseFloat(e?.state??"0")||0,c=parseFloat(i?.state??"0")||0;let a=parseFloat(s?.state??"0")||0;this.config.battery?.invert?.data&&(a=-a);const h=It({grid:n,production:c,load:r,battery:a});let d=null;if(this.config.battery?.soc_entity){const l=this.hass.states[this.config.battery.soc_entity];d=parseFloat(l?.state??"0")||0}this.viewMode=d!==null?"compact-battery":"compact",this.renderData={grid:n,load:r,production:c,battery:a,flows:h,batterySoc:d}}render(){if(!this.config||!this.renderData)return B`<ha-card class="compact-card"><div style="padding:16px;">Waiting for configuration...</div></ha-card>`;const{load:t,flows:e,battery:i,batterySoc:s}=this.renderData,n=jt(t,e);return this.animation.setLoadSpeed(t),B`
      <ha-card class="compact-card">
        <div class="compact-view ${this.viewMode==="compact-battery"?"has-battery":""}">
          ${this.viewMode==="compact-battery"?this.renderBatteryRow(i,e,s):""}
          ${this.renderLoadRow(n.visual,n.true,e.productionToLoad,e.batteryToLoad,e.gridToLoad,t)}
        </div>
      </ha-card>
    `}renderLoadRow(t,e,i,s,n,r){return B`
      <div class="compact-row">
        <div class="bar-container ${this.animation.getAnimationSpeed(r)>0?"":"no-flow"}">
          <div
            id="grid-segment"
            class="bar-segment"
            style="background: ${this.gridColor}; width: ${t.grid}%;"
            @click=${()=>this.handleClick(this.config?.grid?.tap,this.config?.grid?.entity)}
          >
            <div class="bar-segment-content">
              <ha-icon class="bar-segment-icon" icon="${this.getIconFor("grid")}"></ha-icon>
              <span class="bar-segment-label">${n>0?`${Math.round(e.grid)}%`:""}</span>
            </div>
          </div>
          <div
            id="battery-segment"
            class="bar-segment"
            style="background: ${this.batteryColor}; width: ${t.battery}%;"
            @click=${()=>this.handleClick(this.config?.battery?.tap,this.config?.battery?.entity)}
          >
            <div class="bar-segment-content">
              <ha-icon class="bar-segment-icon" icon="${this.getIconFor("battery")}"></ha-icon>
              <span class="bar-segment-label">${s>0?`${Math.round(e.battery)}%`:""}</span>
            </div>
          </div>
          <div
            id="production-segment"
            class="bar-segment"
            style="background: ${this.productionColor}; width: ${t.production}%;"
            @click=${()=>this.handleClick(this.config?.production?.tap,this.config?.production?.entity)}
          >
            <div class="bar-segment-content">
              <ha-icon class="bar-segment-icon" icon="${this.getIconFor("production")}"></ha-icon>
              <span class="bar-segment-label">${i>0?`${Math.round(e.production)}%`:""}</span>
            </div>
          </div>
        </div>
        <div class="row-value" @click=${()=>this.handleClick(this.config?.load?.tap,this.config?.load?.entity)}>
          <ha-icon class="row-icon" icon="${this.getIconFor("load")}"></ha-icon>
          <div class="row-text">
            <span>${Math.round(r)}</span><span class="row-unit">W</span>
          </div>
        </div>
      </div>
    `}renderBatteryRow(t,e,i){const s=Vt(t,e);this.animation.setBatteryAnimation(t,s.direction);const n=s.gridIsImport?this.gridColor:this.returnColor,r=i!==null?i.toFixed(1):"--",c=t>0;return B`
      <div class="compact-row" id="battery-row">
        <div
          class="row-value"
          style="display: ${c?"flex":"none"};"
          @click=${()=>this.handleClick(this.config?.battery?.tap,this.config?.battery?.entity)}
        >
          <ha-icon class="row-icon" icon="${this.getIconFor("battery")}"></ha-icon>
          <div class="row-text">
            <span>${r}</span><span class="row-unit">%</span>
          </div>
        </div>
        <div class="bar-container ${this.animation.getAnimationSpeed(Math.abs(t))>0?"":"no-flow"}">
          <div
            class="bar-segment"
            style="background: ${n}; width: ${s.gridPercent}%;"
            @click=${()=>this.handleClick(this.config?.grid?.tap,this.config?.grid?.entity)}
          >
            <div class="bar-segment-content">
              <ha-icon class="bar-segment-icon" icon="${this.getIconFor("grid")}"></ha-icon>
              <span class="bar-segment-label">${s.gridWatts>0?`${Math.round(s.gridWatts)}W`:""}</span>
            </div>
          </div>
          <div
            class="bar-segment"
            style="background: ${this.batteryColor}; width: ${s.loadPercent}%;"
            @click=${()=>this.handleClick(this.config?.load?.tap,this.config?.load?.entity)}
          >
            <div class="bar-segment-content">
              <ha-icon class="bar-segment-icon" icon="${this.getIconFor("load")}"></ha-icon>
              <span class="bar-segment-label">${s.loadWatts>0?`${Math.round(s.loadWatts)}W`:""}</span>
            </div>
          </div>
          <div
            class="bar-segment"
            style="background: ${this.productionColor}; width: ${s.productionPercent}%;"
            @click=${()=>this.handleClick(this.config?.production?.tap,this.config?.production?.entity)}
          >
            <div class="bar-segment-content">
              <ha-icon class="bar-segment-icon" icon="${this.getIconFor("production")}"></ha-icon>
              <span class="bar-segment-label">${s.productionWatts>0?`${Math.round(s.productionWatts)}W`:""}</span>
            </div>
          </div>
        </div>
        <div
          class="row-value"
          style="display: ${c?"none":"flex"};"
          @click=${()=>this.handleClick(this.config?.battery?.tap,this.config?.battery?.entity)}
        >
          <ha-icon class="row-icon" icon="${this.getIconFor("battery")}"></ha-icon>
          <div class="row-text">
            <span>${r}</span><span class="row-unit">%</span>
          </div>
        </div>
      </div>
    `}getIconFor(t){const e={grid:"mdi:transmission-tower",load:"mdi:home-lightning-bolt",production:"mdi:solar-power",battery:"mdi:battery"};return Wt(this.config,this.hass,t,e[t])}handleClick(t,e){this.hass&&zt(this.hass,this.fireEvent.bind(this),t,e)}fireEvent(t,e={}){if(t==="call-service"&&this.hass){this.hass.callService(e.domain,e.service,e.service_data||{},e.target);return}const i=new CustomEvent(t,{detail:e,bubbles:!0,composed:!0});this.dispatchEvent(i)}updated(t){super.updated(t),!this.animation.isRunning()&&this.shadowRoot&&this.animation.start(this.shadowRoot),t.has("renderData")&&this.renderData&&requestAnimationFrame(()=>{this.updateSegmentVisibility()})}updateSegmentVisibility(){if(!this.shadowRoot||!this.renderData)return;const{flows:t}=this.renderData,e=this.shadowRoot.querySelector(".compact-row:not(#battery-row) .bar-container");if(e){const i=this.shadowRoot.querySelector("#production-segment"),s=this.shadowRoot.querySelector("#battery-segment"),n=this.shadowRoot.querySelector("#grid-segment");if(i){const r=parseFloat(i.style.width)/100*e.clientWidth;D(i,r,t.productionToLoad>0)}if(s){const r=parseFloat(s.style.width)/100*e.clientWidth;D(s,r,t.batteryToLoad>0)}if(n){const r=parseFloat(n.style.width)/100*e.clientWidth;D(n,r,t.gridToLoad>0)}}if(this.viewMode==="compact-battery"){const i=this.shadowRoot.querySelector("#battery-row .bar-container");i&&i.querySelectorAll(".bar-segment").forEach(n=>{const r=parseFloat(n.style.width)/100*i.clientWidth,c=n.querySelector(".bar-segment-label"),a=!!(c?.textContent&&c.textContent.trim()!=="");D(n,r,a)})}}};G.styles=Gt;let A=G;V([lt({attribute:!1})],A.prototype,"config"),V([ht()],A.prototype,"viewMode"),V([ht()],A.prototype,"renderData");const dt="compact-home-energy-flow-card";customElements.get(dt)?console.info("[CompactHomeEnergyFlowCard] custom element already defined"):(customElements.define(dt,A),console.info("[CompactHomeEnergyFlowCard] defined custom element")),window.customCards=window.customCards||[],window.customCards.push({type:"compact-home-energy-flow-card",name:"Compact Home Energy Flow Card",description:"Compact bar visualization of home energy flows"})})();

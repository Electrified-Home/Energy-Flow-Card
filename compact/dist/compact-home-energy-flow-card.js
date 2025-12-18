(function(){"use strict";const H=globalThis,F=H.ShadowRoot&&(H.ShadyCSS===void 0||H.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,I=Symbol(),Q=new WeakMap;let J=class{constructor(t,e,i){if(this._$cssResult$=!0,i!==I)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(F&&t===void 0){const i=e!==void 0&&e.length===1;i&&(t=Q.get(e)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),i&&Q.set(e,t))}return t}toString(){return this.cssText}};const pt=n=>new J(typeof n=="string"?n:n+"",void 0,I),ut=(n,...t)=>{const e=n.length===1?n[0]:t.reduce(((i,s,o)=>i+(a=>{if(a._$cssResult$===!0)return a.cssText;if(typeof a=="number")return a;throw Error("Value passed to 'css' function must be a 'css' function result: "+a+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+n[o+1]),n[0]);return new J(e,n,I)},mt=(n,t)=>{if(F)n.adoptedStyleSheets=t.map((e=>e instanceof CSSStyleSheet?e:e.styleSheet));else for(const e of t){const i=document.createElement("style"),s=H.litNonce;s!==void 0&&i.setAttribute("nonce",s),i.textContent=e.cssText,n.appendChild(i)}},K=F?n=>n:n=>n instanceof CSSStyleSheet?(t=>{let e="";for(const i of t.cssRules)e+=i.cssText;return pt(e)})(n):n;const{is:bt,defineProperty:gt,getOwnPropertyDescriptor:ft,getOwnPropertyNames:yt,getOwnPropertySymbols:$t,getPrototypeOf:_t}=Object,O=globalThis,Z=O.trustedTypes,vt=Z?Z.emptyScript:"",wt=O.reactiveElementPolyfillSupport,S=(n,t)=>n,L={toAttribute(n,t){switch(t){case Boolean:n=n?vt:null;break;case Object:case Array:n=n==null?n:JSON.stringify(n)}return n},fromAttribute(n,t){let e=n;switch(t){case Boolean:e=n!==null;break;case Number:e=n===null?null:Number(n);break;case Object:case Array:try{e=JSON.parse(n)}catch{e=null}}return e}},W=(n,t)=>!bt(n,t),X={attribute:!0,type:String,converter:L,reflect:!1,useDefault:!1,hasChanged:W};Symbol.metadata??=Symbol("metadata"),O.litPropertyMetadata??=new WeakMap;let _=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=X){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const i=Symbol(),s=this.getPropertyDescriptor(t,i,e);s!==void 0&&gt(this.prototype,t,s)}}static getPropertyDescriptor(t,e,i){const{get:s,set:o}=ft(this.prototype,t)??{get(){return this[e]},set(a){this[e]=a}};return{get:s,set(a){const c=s?.call(this);o?.call(this,a),this.requestUpdate(t,c,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??X}static _$Ei(){if(this.hasOwnProperty(S("elementProperties")))return;const t=_t(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(S("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(S("properties"))){const e=this.properties,i=[...yt(e),...$t(e)];for(const s of i)this.createProperty(s,e[s])}const t=this[Symbol.metadata];if(t!==null){const e=litPropertyMetadata.get(t);if(e!==void 0)for(const[i,s]of e)this.elementProperties.set(i,s)}this._$Eh=new Map;for(const[e,i]of this.elementProperties){const s=this._$Eu(e,i);s!==void 0&&this._$Eh.set(s,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const s of i)e.unshift(K(s))}else t!==void 0&&e.push(K(t));return e}static _$Eu(t,e){const i=e.attribute;return i===!1?void 0:typeof i=="string"?i:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise((t=>this.enableUpdating=t)),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach((t=>t(this)))}addController(t){(this._$EO??=new Set).add(t),this.renderRoot!==void 0&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const i of e.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return mt(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach((t=>t.hostConnected?.()))}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach((t=>t.hostDisconnected?.()))}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$ET(t,e){const i=this.constructor.elementProperties.get(t),s=this.constructor._$Eu(t,i);if(s!==void 0&&i.reflect===!0){const o=(i.converter?.toAttribute!==void 0?i.converter:L).toAttribute(e,i.type);this._$Em=t,o==null?this.removeAttribute(s):this.setAttribute(s,o),this._$Em=null}}_$AK(t,e){const i=this.constructor,s=i._$Eh.get(t);if(s!==void 0&&this._$Em!==s){const o=i.getPropertyOptions(s),a=typeof o.converter=="function"?{fromAttribute:o.converter}:o.converter?.fromAttribute!==void 0?o.converter:L;this._$Em=s;const c=a.fromAttribute(e,o.type);this[s]=c??this._$Ej?.get(s)??c,this._$Em=null}}requestUpdate(t,e,i){if(t!==void 0){const s=this.constructor,o=this[t];if(i??=s.getPropertyOptions(t),!((i.hasChanged??W)(o,e)||i.useDefault&&i.reflect&&o===this._$Ej?.get(t)&&!this.hasAttribute(s._$Eu(t,i))))return;this.C(t,e,i)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,e,{useDefault:i,reflect:s,wrapped:o},a){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,a??e??this[t]),o!==!0||a!==void 0)||(this._$AL.has(t)||(this.hasUpdated||i||(e=void 0),this._$AL.set(t,e)),s===!0&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}const t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[s,o]of this._$Ep)this[s]=o;this._$Ep=void 0}const i=this.constructor.elementProperties;if(i.size>0)for(const[s,o]of i){const{wrapped:a}=o,c=this[s];a!==!0||this._$AL.has(s)||c===void 0||this.C(s,void 0,o,c)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach((i=>i.hostUpdate?.())),this.update(e)):this._$EM()}catch(i){throw t=!1,this._$EM(),i}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach((e=>e.hostUpdated?.())),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach((e=>this._$ET(e,this[e]))),this._$EM()}updated(t){}firstUpdated(t){}};_.elementStyles=[],_.shadowRootOptions={mode:"open"},_[S("elementProperties")]=new Map,_[S("finalized")]=new Map,wt?.({ReactiveElement:_}),(O.reactiveElementVersions??=[]).push("2.1.1");const N=globalThis,R=N.trustedTypes,Y=R?R.createPolicy("lit-html",{createHTML:n=>n}):void 0,tt="$lit$",g=`lit$${Math.random().toFixed(9).slice(2)}$`,et="?"+g,At=`<${et}>`,f=document,E=()=>f.createComment(""),C=n=>n===null||typeof n!="object"&&typeof n!="function",z=Array.isArray,St=n=>z(n)||typeof n?.[Symbol.iterator]=="function",q=`[ 	
\f\r]`,x=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,it=/-->/g,st=/>/g,y=RegExp(`>|${q}(?:([^\\s"'>=/]+)(${q}*=${q}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),ot=/'/g,nt=/"/g,at=/^(?:script|style|textarea|title)$/i,Et=n=>(t,...e)=>({_$litType$:n,strings:t,values:e}),B=Et(1),v=Symbol.for("lit-noChange"),p=Symbol.for("lit-nothing"),rt=new WeakMap,$=f.createTreeWalker(f,129);function ct(n,t){if(!z(n)||!n.hasOwnProperty("raw"))throw Error("invalid template strings array");return Y!==void 0?Y.createHTML(t):t}const Ct=(n,t)=>{const e=n.length-1,i=[];let s,o=t===2?"<svg>":t===3?"<math>":"",a=x;for(let c=0;c<e;c++){const r=n[c];let l,d,h=-1,u=0;for(;u<r.length&&(a.lastIndex=u,d=a.exec(r),d!==null);)u=a.lastIndex,a===x?d[1]==="!--"?a=it:d[1]!==void 0?a=st:d[2]!==void 0?(at.test(d[2])&&(s=RegExp("</"+d[2],"g")),a=y):d[3]!==void 0&&(a=y):a===y?d[0]===">"?(a=s??x,h=-1):d[1]===void 0?h=-2:(h=a.lastIndex-d[2].length,l=d[1],a=d[3]===void 0?y:d[3]==='"'?nt:ot):a===nt||a===ot?a=y:a===it||a===st?a=x:(a=y,s=void 0);const m=a===y&&n[c+1].startsWith("/>")?" ":"";o+=a===x?r+At:h>=0?(i.push(l),r.slice(0,h)+tt+r.slice(h)+g+m):r+g+(h===-2?c:m)}return[ct(n,o+(n[e]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),i]};class P{constructor({strings:t,_$litType$:e},i){let s;this.parts=[];let o=0,a=0;const c=t.length-1,r=this.parts,[l,d]=Ct(t,e);if(this.el=P.createElement(l,i),$.currentNode=this.el.content,e===2||e===3){const h=this.el.content.firstChild;h.replaceWith(...h.childNodes)}for(;(s=$.nextNode())!==null&&r.length<c;){if(s.nodeType===1){if(s.hasAttributes())for(const h of s.getAttributeNames())if(h.endsWith(tt)){const u=d[a++],m=s.getAttribute(h).split(g),b=/([.?@])?(.*)/.exec(u);r.push({type:1,index:o,name:b[2],strings:m,ctor:b[1]==="."?Pt:b[1]==="?"?Tt:b[1]==="@"?kt:U}),s.removeAttribute(h)}else h.startsWith(g)&&(r.push({type:6,index:o}),s.removeAttribute(h));if(at.test(s.tagName)){const h=s.textContent.split(g),u=h.length-1;if(u>0){s.textContent=R?R.emptyScript:"";for(let m=0;m<u;m++)s.append(h[m],E()),$.nextNode(),r.push({type:2,index:++o});s.append(h[u],E())}}}else if(s.nodeType===8)if(s.data===et)r.push({type:2,index:o});else{let h=-1;for(;(h=s.data.indexOf(g,h+1))!==-1;)r.push({type:7,index:o}),h+=g.length-1}o++}}static createElement(t,e){const i=f.createElement("template");return i.innerHTML=t,i}}function w(n,t,e=n,i){if(t===v)return t;let s=i!==void 0?e._$Co?.[i]:e._$Cl;const o=C(t)?void 0:t._$litDirective$;return s?.constructor!==o&&(s?._$AO?.(!1),o===void 0?s=void 0:(s=new o(n),s._$AT(n,e,i)),i!==void 0?(e._$Co??=[])[i]=s:e._$Cl=s),s!==void 0&&(t=w(n,s._$AS(n,t.values),s,i)),t}class xt{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:i}=this._$AD,s=(t?.creationScope??f).importNode(e,!0);$.currentNode=s;let o=$.nextNode(),a=0,c=0,r=i[0];for(;r!==void 0;){if(a===r.index){let l;r.type===2?l=new T(o,o.nextSibling,this,t):r.type===1?l=new r.ctor(o,r.name,r.strings,this,t):r.type===6&&(l=new Mt(o,this,t)),this._$AV.push(l),r=i[++c]}a!==r?.index&&(o=$.nextNode(),a++)}return $.currentNode=f,s}p(t){let e=0;for(const i of this._$AV)i!==void 0&&(i.strings!==void 0?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}}class T{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,i,s){this.type=2,this._$AH=p,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return e!==void 0&&t?.nodeType===11&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=w(this,t,e),C(t)?t===p||t==null||t===""?(this._$AH!==p&&this._$AR(),this._$AH=p):t!==this._$AH&&t!==v&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):St(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==p&&C(this._$AH)?this._$AA.nextSibling.data=t:this.T(f.createTextNode(t)),this._$AH=t}$(t){const{values:e,_$litType$:i}=t,s=typeof i=="number"?this._$AC(t):(i.el===void 0&&(i.el=P.createElement(ct(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===s)this._$AH.p(e);else{const o=new xt(s,this),a=o.u(this.options);o.p(e),this.T(a),this._$AH=o}}_$AC(t){let e=rt.get(t.strings);return e===void 0&&rt.set(t.strings,e=new P(t)),e}k(t){z(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let i,s=0;for(const o of t)s===e.length?e.push(i=new T(this.O(E()),this.O(E()),this,this.options)):i=e[s],i._$AI(o),s++;s<e.length&&(this._$AR(i&&i._$AB.nextSibling,s),e.length=s)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){const i=t.nextSibling;t.remove(),t=i}}setConnected(t){this._$AM===void 0&&(this._$Cv=t,this._$AP?.(t))}}class U{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,i,s,o){this.type=1,this._$AH=p,this._$AN=void 0,this.element=t,this.name=e,this._$AM=s,this.options=o,i.length>2||i[0]!==""||i[1]!==""?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=p}_$AI(t,e=this,i,s){const o=this.strings;let a=!1;if(o===void 0)t=w(this,t,e,0),a=!C(t)||t!==this._$AH&&t!==v,a&&(this._$AH=t);else{const c=t;let r,l;for(t=o[0],r=0;r<o.length-1;r++)l=w(this,c[i+r],e,r),l===v&&(l=this._$AH[r]),a||=!C(l)||l!==this._$AH[r],l===p?t=p:t!==p&&(t+=(l??"")+o[r+1]),this._$AH[r]=l}a&&!s&&this.j(t)}j(t){t===p?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class Pt extends U{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===p?void 0:t}}class Tt extends U{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==p)}}class kt extends U{constructor(t,e,i,s,o){super(t,e,i,s,o),this.type=5}_$AI(t,e=this){if((t=w(this,t,e,0)??p)===v)return;const i=this._$AH,s=t===p&&i!==p||t.capture!==i.capture||t.once!==i.once||t.passive!==i.passive,o=t!==p&&(i===p||s);s&&this.element.removeEventListener(this.name,this,i),o&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class Mt{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){w(this,t)}}const Ht=N.litHtmlPolyfillSupport;Ht?.(P,T),(N.litHtmlVersions??=[]).push("3.3.1");const Ot=(n,t,e)=>{const i=e?.renderBefore??t;let s=i._$litPart$;if(s===void 0){const o=e?.renderBefore??null;i._$litPart$=s=new T(t.insertBefore(E(),o),o,void 0,e??{})}return s._$AI(n),s};const j=globalThis;class k extends _{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=Ot(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return v}}k._$litElement$=!0,k.finalized=!0,j.litElementHydrateSupport?.({LitElement:k});const Lt=j.litElementPolyfillSupport;Lt?.({LitElement:k}),(j.litElementVersions??=[]).push("4.2.1");const Rt={attribute:!0,type:String,converter:L,reflect:!1,hasChanged:W},Bt=(n=Rt,t,e)=>{const{kind:i,metadata:s}=e;let o=globalThis.litPropertyMetadata.get(s);if(o===void 0&&globalThis.litPropertyMetadata.set(s,o=new Map),i==="setter"&&((n=Object.create(n)).wrapped=!0),o.set(e.name,n),i==="accessor"){const{name:a}=e;return{set(c){const r=t.get.call(this);t.set.call(this,c),this.requestUpdate(a,r,n)},init(c){return c!==void 0&&this.C(a,void 0,n,c),c}}}if(i==="setter"){const{name:a}=e;return function(c){const r=this[a];t.call(this,c),this.requestUpdate(a,r,n)}}throw Error("Unsupported decorator location: "+i)};function lt(n){return(t,e)=>typeof e=="object"?Bt(n,t,e):((i,s,o)=>{const a=s.hasOwnProperty(o);return s.constructor.createProperty(o,i),a?Object.getOwnPropertyDescriptor(s,o):void 0})(n,t,e)}function ht(n){return lt({...n,state:!0,attribute:!1})}class Ut{constructor(){this.prevStates=new Map,this.subscriptions=new Map}get hass(){return this.currentHass}updateHass(t){this.currentHass=t;for(const e of this.subscriptions.keys()){const i=this.prevStates.get(e),s=this.currentHass?.states?.[e]?.state;s!==void 0&&s!==i&&this.dispatch(e,s),s!==void 0?this.prevStates.set(e,s):this.prevStates.delete(e)}}dispatch(t,e){const i=this.subscriptions.get(t);i&&i.forEach(s=>{try{s(e)}catch(o){console.error(`[HassObservable] Error in callback for ${t}:`,o)}})}subscribe(t,e){this.subscriptions.has(t)||this.subscriptions.set(t,new Set),this.subscriptions.get(t).add(e);const i=this.currentHass?.states?.[t]?.state;if(i!==void 0)try{e(i)}catch(s){console.error(`[HassObservable] Error in initial callback for ${t}:`,s)}return()=>{const s=this.subscriptions.get(t);s&&(s.delete(e),s.size===0&&this.subscriptions.delete(t))}}getState(t){return this.currentHass?.states?.[t]?.state}hasEntity(t){return this.currentHass?.states?.[t]!==void 0}unsubscribeAll(){this.subscriptions.clear()}get subscriptionCount(){let t=0;return this.subscriptions.forEach(e=>{t+=e.size}),t}}class Dt extends k{constructor(){super(...arguments),this._hassObservable=new Ut}set hass(t){this._hassObservable.updateHass(t),this.onHassUpdate(t)}get hass(){return this._hassObservable.hass}connectedCallback(){super.connectedCallback(),this.setupSubscriptions()}disconnectedCallback(){super.disconnectedCallback(),this._hassObservable.unsubscribeAll()}resetSubscriptions(){this._hassObservable.unsubscribeAll(),this.setupSubscriptions()}subscribe(t,e){this._hassObservable.subscribe(t,e)}getState(t){return this._hassObservable.getState(t)}hasEntity(t){return this._hassObservable.hasEntity(t)}onHassUpdate(t){}}function Ft(){return{schema:[{name:"grid_entity",label:"Grid",required:!0,selector:{entity:{domain:"sensor",device_class:"power"}}},{name:"grid_icon",selector:{icon:{}},context:{icon_entity:"grid_entity"}},{name:"grid_tap_action",label:"Grid Tap Action",selector:{"ui-action":{}}},{name:"grid_hold_action",label:"Grid Hold Action",selector:{"ui-action":{}}},{name:"load_entity",label:"Load",required:!0,selector:{entity:{domain:"sensor",device_class:"power"}}},{name:"load_icon",selector:{icon:{}},context:{icon_entity:"load_entity"}},{name:"load_tap_action",label:"Load Tap Action",selector:{"ui-action":{}}},{name:"load_hold_action",label:"Load Hold Action",selector:{"ui-action":{}}},{name:"production_entity",label:"Production",required:!0,selector:{entity:{domain:"sensor",device_class:"power"}}},{name:"production_icon",selector:{icon:{}},context:{icon_entity:"production_entity"}},{name:"production_tap_action",label:"Production Tap Action",selector:{"ui-action":{}}},{name:"production_hold_action",label:"Production Hold Action",selector:{"ui-action":{}}},{name:"battery_entity",label:"Battery",required:!0,selector:{entity:{domain:"sensor",device_class:"power"}}},{name:"battery_icon",selector:{icon:{}},context:{icon_entity:"battery_entity"}},{name:"battery_tap_action",label:"Battery Tap Action",selector:{"ui-action":{}}},{name:"battery_hold_action",label:"Battery Hold Action",selector:{"ui-action":{}}},{name:"battery_soc_entity",label:"Battery SOC (%) Entity",selector:{entity:{domain:"sensor"}}},{name:"invert_battery_data",label:"Invert Battery Data",selector:{boolean:{}}},{name:"animation",label:"Enable Animation",selector:{boolean:{}},default:!1}]}}function It(n){if(n.load){const c={...n};return c.animation===void 0&&(c.animation=!1),c}const t=c=>{const r=n[`${c}_entity`];if(!r)return;const l={entity:r},d=n[`${c}_icon`],h=n[`${c}_tap_action`],u=n[`${c}_hold_action`];return d!==void 0&&(l.icon=d),h!==void 0&&(l.tap=h),u!==void 0&&(l.hold=u),l},e=t("load"),i=t("grid"),s=t("production"),o=t("battery");if(o){const c=n.battery_soc_entity,r=n.invert_battery_data;c!==void 0&&(o.soc_entity=c),r!==void 0&&(o.invert={data:r})}if(!e)return n;const a={load:e,grid:i,production:s,battery:o};return n.animation!==void 0?a.animation=n.animation:a.animation=!1,a}function Wt(n){const t=Math.max(0,n.production),e=n.grid,i=n.battery,s=Math.max(0,n.load),o={productionToLoad:0,productionToBattery:0,productionToGrid:0,gridToLoad:0,gridToBattery:0,batteryToLoad:0};let a=t,c=s;if(a>0&&c>0&&(o.productionToLoad=Math.min(a,c),a-=o.productionToLoad,c-=o.productionToLoad),i<0&&a>0&&(o.productionToBattery=Math.min(a,Math.abs(i)),a-=o.productionToBattery),i>0&&c>0&&(o.batteryToLoad=Math.min(i,c),c-=o.batteryToLoad),c>0&&e>0&&(o.gridToLoad=Math.min(e,c),c-=o.gridToLoad),i<0&&e>10){const r=Math.abs(i)-o.productionToBattery;r>1&&(o.gridToBattery=Math.min(e-o.gridToLoad,r))}return e<-10&&(o.productionToGrid=Math.abs(e)),o}function Nt(n,t,e,i){const s=n[e];return s?s.icon?s.icon:s.entity&&t?.states[s.entity]&&t.states[s.entity].attributes.icon||i:i}function zt(n,t,e,i){if(!n)return;const s=e||{action:"more-info"},o=s.action||"more-info";switch(o==="default"?"more-info":o){case"more-info":const c=s.entity||i;c&&t("hass-more-info",{entityId:c});break;case"navigate":{const r=s.path??s.navigation_path;r&&(history.pushState(null,"",r),t("location-changed",{replace:!1,path:r}),window.dispatchEvent(new CustomEvent("location-changed",{detail:{replace:!1,path:r},bubbles:!0,composed:!0})))}break;case"url":s.path&&window.open(s.path);break;case"toggle":i&&n.callService("homeassistant","toggle",{entity_id:i});break;case"call-service":if(s.service){const[r,l]=s.service.split(".");n.callService(r,l,s.service_data||{},s.target)}break}}function D(n,t,e){if(!n||!e){n?.setAttribute("data-width-px","");return}t>=80?n.setAttribute("data-width-px","show-label"):t>=40?n.setAttribute("data-width-px","show-icon"):n.setAttribute("data-width-px","")}class qt{constructor(){this.animationFrameId=null,this.loadPosition=0,this.batteryPosition=0,this.loadSpeed=0,this.batterySpeed=0,this.batteryDirection="none",this.lastTickTime=0,this.minFrameMs=1e3/30,this.minAnimatedWatts=10}getAnimationSpeed(t){return t<=this.minAnimatedWatts?0:t/100*2.5}setLoadSpeed(t){this.loadSpeed=this.getAnimationSpeed(t),this.stopIfIdle()}setBatteryAnimation(t,e){this.batterySpeed=this.getAnimationSpeed(Math.abs(t)),e!==this.batteryDirection&&(e==="up"?this.batteryPosition=100:e==="down"&&(this.batteryPosition=-100)),this.batteryDirection=e,this.stopIfIdle()}start(t){if(this.animationFrameId!==null||!t||!this.hasWork())return;this.loadBarElement=t.querySelector(".compact-row:not(#battery-row) .bar-container"),this.batteryBarElement=t.querySelector("#battery-row .bar-container"),this.lastTickTime=performance.now();const e=i=>{if(!this.hasWork()){this.stop();return}const s=i-this.lastTickTime;if(s<this.minFrameMs){this.animationFrameId=requestAnimationFrame(e);return}const o=s/1e3;this.lastTickTime=i,this.loadSpeed>0&&this.loadBarElement&&(this.loadPosition+=this.loadSpeed*o,this.loadPosition>100&&(this.loadPosition=-100),this.loadBarElement.style.setProperty("--gradient-x",`${this.loadPosition}%`)),this.batterySpeed>0&&this.batteryDirection!=="none"&&this.batteryBarElement&&(this.batteryDirection==="up"?(this.batteryPosition-=this.batterySpeed*o,this.batteryPosition<-100&&(this.batteryPosition=100)):(this.batteryPosition+=this.batterySpeed*o,this.batteryPosition>100&&(this.batteryPosition=-100)),this.batteryBarElement.style.setProperty("--gradient-y",`${this.batteryPosition}%`)),this.animationFrameId=requestAnimationFrame(e)};this.animationFrameId=requestAnimationFrame(e)}stop(){this.animationFrameId!==null&&(cancelAnimationFrame(this.animationFrameId),this.animationFrameId=null),this.loadBarElement=void 0,this.batteryBarElement=void 0}isRunning(){return this.animationFrameId!==null}hasWork(){const t=this.loadSpeed>0,e=this.batterySpeed>0&&this.batteryDirection!=="none";return t||e}stopIfIdle(){this.animationFrameId!==null&&(this.hasWork()||this.stop())}}function jt(n,t){const e=n||1,i=t.productionToLoad/e*100,s=t.batteryToLoad/e*100,o=t.gridToLoad/e*100,a=i+s+o;let c=i,r=s,l=o;if(a>0){const d=100/a;c=i*d,r=s*d,l=o*d}return{true:{production:i,battery:s,grid:o},visual:{production:c,battery:r,grid:l}}}function Vt(n,t){let e=0,i=0,s=0,o=0,a=0,c=0,r=!1,l="none";if(n<0){l="up",r=!0;const h=Math.abs(n)||1;e=t.gridToBattery,s=t.productionToBattery;const u=t.gridToBattery/h*100,m=t.productionToBattery/h*100,b=u+m;if(b>0){const M=100/b;o=u*M,c=m*M}}else if(n>0){l="down",r=!1;const d=n||1,h=n-t.batteryToLoad;i=t.batteryToLoad,e=h;const u=t.batteryToLoad/d*100,m=h/d*100,b=u+m;if(b>0){const M=100/b;a=u*M,o=m*M}}else l="none";return{gridWatts:e,loadWatts:i,productionWatts:s,gridPercent:o,loadPercent:a,productionPercent:c,gridIsImport:r,direction:l}}const Gt=ut`
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

  .compact-card.animation-disabled .bar-container,
  .compact-card.animation-disabled .bar-container::before,
  .compact-card.animation-disabled .bar-segment {
    transition: none;
  }

  .compact-card.animation-disabled .bar-container::before {
    display: none;
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
`;var Qt=Object.defineProperty,V=(n,t,e,i)=>{for(var s=void 0,o=n.length-1,a;o>=0;o--)(a=n[o])&&(s=a(t,e,s)||s);return s&&Qt(t,e,s),s};const G=class G extends Dt{constructor(){super(...arguments),this.viewMode="compact",this.segmentVisibilityRaf=null,this.renderDataQueued=!1,this.productionColor="#256028",this.batteryColor="#104b79",this.gridColor="#7a211b",this.returnColor="#7a6b1b",this.animation=new qt}static getStubConfig(){return{}}static getConfigForm(){return Ft()}disconnectedCallback(){super.disconnectedCallback(),this.animation.stop(),this.segmentVisibilityRaf!==null&&(cancelAnimationFrame(this.segmentVisibilityRaf),this.segmentVisibilityRaf=null)}setConfig(t){const e=It(t);e.animation===void 0&&(e.animation=!1),this.config=e,this.isConnected&&(this.resetSubscriptions(),this.isAnimationEnabled()||this.animation.stop())}setupSubscriptions(){if(!this.config)return;const t=()=>{this.renderDataQueued||(this.renderDataQueued=!0,queueMicrotask(()=>{this.renderDataQueued=!1,this.updateRenderData()}))};this.config.grid?.entity&&this.subscribe(this.config.grid.entity,t),this.config.load?.entity&&this.subscribe(this.config.load.entity,t),this.config.production?.entity&&this.subscribe(this.config.production.entity,t),this.config.battery?.entity&&this.subscribe(this.config.battery.entity,t),this.config.battery?.soc_entity&&this.subscribe(this.config.battery.soc_entity,t)}updateRenderData(){if(!this.config||!this.hass)return;const t=this.hass.states[this.config.grid?.entity||""],e=this.hass.states[this.config.load?.entity||""],i=this.hass.states[this.config.production?.entity||""],s=this.hass.states[this.config.battery?.entity||""],o=parseFloat(t?.state??"0")||0,a=parseFloat(e?.state??"0")||0,c=parseFloat(i?.state??"0")||0;let r=parseFloat(s?.state??"0")||0;this.config.battery?.invert?.data&&(r=-r);const l=Wt({grid:o,production:c,load:a,battery:r});let d=null;if(this.config.battery?.soc_entity){const h=this.hass.states[this.config.battery.soc_entity];d=parseFloat(h?.state??"0")||0}this.viewMode=d!==null?"compact-battery":"compact",this.renderData={grid:o,load:a,production:c,battery:r,flows:l,batterySoc:d}}render(){if(!this.config||!this.renderData)return B`<ha-card class="compact-card"><div style="padding:16px;">Waiting for configuration...</div></ha-card>`;const{load:t,flows:e,battery:i,batterySoc:s}=this.renderData,o=this.isAnimationEnabled(),a=jt(t,e);return o&&this.animation.setLoadSpeed(t),B`
      <ha-card class="compact-card ${o?"":"animation-disabled"}">
        <div class="compact-view ${this.viewMode==="compact-battery"?"has-battery":""}">
          ${this.viewMode==="compact-battery"?this.renderBatteryRow(i,e,s):""}
          ${this.renderLoadRow(a.visual,a.true,e.productionToLoad,e.batteryToLoad,e.gridToLoad,t)}
        </div>
      </ha-card>
    `}renderLoadRow(t,e,i,s,o,a){return B`
      <div class="compact-row">
        <div class="bar-container ${this.animation.getAnimationSpeed(a)>0?"":"no-flow"}">
          <div
            id="grid-segment"
            class="bar-segment"
            style="background: ${this.gridColor}; width: ${t.grid}%;"
            @click=${()=>this.handleClick(this.config?.grid?.tap,this.config?.grid?.entity)}
          >
            <div class="bar-segment-content">
              <ha-icon class="bar-segment-icon" icon="${this.getIconFor("grid")}"></ha-icon>
              <span class="bar-segment-label">${o>0?`${Math.round(e.grid)}%`:""}</span>
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
            <span>${Math.round(a)}</span><span class="row-unit">W</span>
          </div>
        </div>
      </div>
    `}renderBatteryRow(t,e,i){const s=Vt(t,e);this.isAnimationEnabled()&&this.animation.setBatteryAnimation(t,s.direction);const o=s.gridIsImport?this.gridColor:this.returnColor,a=i!==null?i.toFixed(1):"--",c=t>0;return B`
      <div class="compact-row" id="battery-row">
        <div
          class="row-value"
          style="display: ${c?"flex":"none"};"
          @click=${()=>this.handleClick(this.config?.battery?.tap,this.config?.battery?.entity)}
        >
          <ha-icon class="row-icon" icon="${this.getIconFor("battery")}"></ha-icon>
          <div class="row-text">
            <span>${a}</span><span class="row-unit">%</span>
          </div>
        </div>
        <div class="bar-container ${this.animation.getAnimationSpeed(Math.abs(t))>0?"":"no-flow"}">
          <div
            class="bar-segment"
            style="background: ${o}; width: ${s.gridPercent}%;"
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
            <span>${a}</span><span class="row-unit">%</span>
          </div>
        </div>
      </div>
    `}isAnimationEnabled(){return this.config?.animation!==!1}getIconFor(t){const e={grid:"mdi:transmission-tower",load:"mdi:home-lightning-bolt",production:"mdi:solar-power",battery:"mdi:battery"};return Nt(this.config,this.hass,t,e[t])}handleClick(t,e){this.hass&&zt(this.hass,this.fireEvent.bind(this),t,e)}fireEvent(t,e={}){if(t==="call-service"&&this.hass){this.hass.callService(e.domain,e.service,e.service_data||{},e.target);return}const i=new CustomEvent(t,{detail:e,bubbles:!0,composed:!0});this.dispatchEvent(i)}updated(t){super.updated(t),this.isAnimationEnabled()?!this.animation.isRunning()&&this.shadowRoot&&this.animation.start(this.shadowRoot):this.animation.isRunning()&&this.animation.stop(),t.has("renderData")&&this.renderData&&this.segmentVisibilityRaf===null&&(this.segmentVisibilityRaf=requestAnimationFrame(()=>{this.segmentVisibilityRaf=null,this.updateSegmentVisibility()}))}updateSegmentVisibility(){if(!this.shadowRoot||!this.renderData)return;const{flows:t}=this.renderData,e=this.shadowRoot.querySelector(".compact-row:not(#battery-row) .bar-container");if(e){const i=this.shadowRoot.querySelector("#production-segment"),s=this.shadowRoot.querySelector("#battery-segment"),o=this.shadowRoot.querySelector("#grid-segment");if(i){const a=parseFloat(i.style.width)/100*e.clientWidth;D(i,a,t.productionToLoad>0)}if(s){const a=parseFloat(s.style.width)/100*e.clientWidth;D(s,a,t.batteryToLoad>0)}if(o){const a=parseFloat(o.style.width)/100*e.clientWidth;D(o,a,t.gridToLoad>0)}}if(this.viewMode==="compact-battery"){const i=this.shadowRoot.querySelector("#battery-row .bar-container");i&&i.querySelectorAll(".bar-segment").forEach(o=>{const a=parseFloat(o.style.width)/100*i.clientWidth,c=o.querySelector(".bar-segment-label"),r=!!(c?.textContent&&c.textContent.trim()!=="");D(o,a,r)})}}};G.styles=Gt;let A=G;V([lt({attribute:!1})],A.prototype,"config"),V([ht()],A.prototype,"viewMode"),V([ht()],A.prototype,"renderData");const dt="compact-home-energy-flow-card";customElements.get(dt)?console.info("[CompactHomeEnergyFlowCard] custom element already defined"):(customElements.define(dt,A),console.info("[CompactHomeEnergyFlowCard] defined custom element")),window.customCards=window.customCards||[],window.customCards.push({type:"compact-home-energy-flow-card",name:"Compact Home Energy Flow Card",description:"Compact bar visualization of home energy flows"})})();

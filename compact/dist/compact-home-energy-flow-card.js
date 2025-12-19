(function(){"use strict";const H=globalThis,z=H.ShadowRoot&&(H.ShadyCSS===void 0||H.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,N=Symbol(),Y=new WeakMap;let X=class{constructor(t,e,s){if(this._$cssResult$=!0,s!==N)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(z&&t===void 0){const s=e!==void 0&&e.length===1;s&&(t=Y.get(e)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),s&&Y.set(e,t))}return t}toString(){return this.cssText}};const pt=a=>new X(typeof a=="string"?a:a+"",void 0,N),ut=(a,...t)=>{const e=a.length===1?a[0]:t.reduce(((s,i,n)=>s+(o=>{if(o._$cssResult$===!0)return o.cssText;if(typeof o=="number")return o;throw Error("Value passed to 'css' function must be a 'css' function result: "+o+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+a[n+1]),a[0]);return new X(e,a,N)},yt=(a,t)=>{if(z)a.adoptedStyleSheets=t.map((e=>e instanceof CSSStyleSheet?e:e.styleSheet));else for(const e of t){const s=document.createElement("style"),i=H.litNonce;i!==void 0&&s.setAttribute("nonce",i),s.textContent=e.cssText,a.appendChild(s)}},Q=z?a=>a:a=>a instanceof CSSStyleSheet?(t=>{let e="";for(const s of t.cssRules)e+=s.cssText;return pt(e)})(a):a;const{is:ft,defineProperty:mt,getOwnPropertyDescriptor:bt,getOwnPropertyNames:gt,getOwnPropertySymbols:$t,getPrototypeOf:vt}=Object,L=globalThis,J=L.trustedTypes,_t=J?J.emptyScript:"",At=L.reactiveElementPolyfillSupport,S=(a,t)=>a,R={toAttribute(a,t){switch(t){case Boolean:a=a?_t:null;break;case Object:case Array:a=a==null?a:JSON.stringify(a)}return a},fromAttribute(a,t){let e=a;switch(t){case Boolean:e=a!==null;break;case Number:e=a===null?null:Number(a);break;case Object:case Array:try{e=JSON.parse(a)}catch{e=null}}return e}},W=(a,t)=>!ft(a,t),K={attribute:!0,type:String,converter:R,reflect:!1,useDefault:!1,hasChanged:W};Symbol.metadata??=Symbol("metadata"),L.litPropertyMetadata??=new WeakMap;let v=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=K){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const s=Symbol(),i=this.getPropertyDescriptor(t,s,e);i!==void 0&&mt(this.prototype,t,i)}}static getPropertyDescriptor(t,e,s){const{get:i,set:n}=bt(this.prototype,t)??{get(){return this[e]},set(o){this[e]=o}};return{get:i,set(o){const c=i?.call(this);n?.call(this,o),this.requestUpdate(t,c,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??K}static _$Ei(){if(this.hasOwnProperty(S("elementProperties")))return;const t=vt(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(S("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(S("properties"))){const e=this.properties,s=[...gt(e),...$t(e)];for(const i of s)this.createProperty(i,e[i])}const t=this[Symbol.metadata];if(t!==null){const e=litPropertyMetadata.get(t);if(e!==void 0)for(const[s,i]of e)this.elementProperties.set(s,i)}this._$Eh=new Map;for(const[e,s]of this.elementProperties){const i=this._$Eu(e,s);i!==void 0&&this._$Eh.set(i,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const s=new Set(t.flat(1/0).reverse());for(const i of s)e.unshift(Q(i))}else t!==void 0&&e.push(Q(t));return e}static _$Eu(t,e){const s=e.attribute;return s===!1?void 0:typeof s=="string"?s:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise((t=>this.enableUpdating=t)),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach((t=>t(this)))}addController(t){(this._$EO??=new Set).add(t),this.renderRoot!==void 0&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const s of e.keys())this.hasOwnProperty(s)&&(t.set(s,this[s]),delete this[s]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return yt(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach((t=>t.hostConnected?.()))}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach((t=>t.hostDisconnected?.()))}attributeChangedCallback(t,e,s){this._$AK(t,s)}_$ET(t,e){const s=this.constructor.elementProperties.get(t),i=this.constructor._$Eu(t,s);if(i!==void 0&&s.reflect===!0){const n=(s.converter?.toAttribute!==void 0?s.converter:R).toAttribute(e,s.type);this._$Em=t,n==null?this.removeAttribute(i):this.setAttribute(i,n),this._$Em=null}}_$AK(t,e){const s=this.constructor,i=s._$Eh.get(t);if(i!==void 0&&this._$Em!==i){const n=s.getPropertyOptions(i),o=typeof n.converter=="function"?{fromAttribute:n.converter}:n.converter?.fromAttribute!==void 0?n.converter:R;this._$Em=i;const c=o.fromAttribute(e,n.type);this[i]=c??this._$Ej?.get(i)??c,this._$Em=null}}requestUpdate(t,e,s){if(t!==void 0){const i=this.constructor,n=this[t];if(s??=i.getPropertyOptions(t),!((s.hasChanged??W)(n,e)||s.useDefault&&s.reflect&&n===this._$Ej?.get(t)&&!this.hasAttribute(i._$Eu(t,s))))return;this.C(t,e,s)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,e,{useDefault:s,reflect:i,wrapped:n},o){s&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,o??e??this[t]),n!==!0||o!==void 0)||(this._$AL.has(t)||(this.hasUpdated||s||(e=void 0),this._$AL.set(t,e)),i===!0&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}const t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[i,n]of this._$Ep)this[i]=n;this._$Ep=void 0}const s=this.constructor.elementProperties;if(s.size>0)for(const[i,n]of s){const{wrapped:o}=n,c=this[i];o!==!0||this._$AL.has(i)||c===void 0||this.C(i,void 0,n,c)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach((s=>s.hostUpdate?.())),this.update(e)):this._$EM()}catch(s){throw t=!1,this._$EM(),s}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach((e=>e.hostUpdated?.())),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach((e=>this._$ET(e,this[e]))),this._$EM()}updated(t){}firstUpdated(t){}};v.elementStyles=[],v.shadowRootOptions={mode:"open"},v[S("elementProperties")]=new Map,v[S("finalized")]=new Map,At?.({ReactiveElement:v}),(L.reactiveElementVersions??=[]).push("2.1.1");const F=globalThis,D=F.trustedTypes,Z=D?D.createPolicy("lit-html",{createHTML:a=>a}):void 0,tt="$lit$",m=`lit$${Math.random().toFixed(9).slice(2)}$`,et="?"+m,wt=`<${et}>`,b=document,E=()=>b.createComment(""),C=a=>a===null||typeof a!="object"&&typeof a!="function",q=Array.isArray,St=a=>q(a)||typeof a?.[Symbol.iterator]=="function",I=`[ 	
\f\r]`,x=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,it=/-->/g,st=/>/g,g=RegExp(`>|${I}(?:([^\\s"'>=/]+)(${I}*=${I}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),nt=/'/g,at=/"/g,ot=/^(?:script|style|textarea|title)$/i,Et=a=>(t,...e)=>({_$litType$:a,strings:t,values:e}),T=Et(1),_=Symbol.for("lit-noChange"),p=Symbol.for("lit-nothing"),rt=new WeakMap,$=b.createTreeWalker(b,129);function ct(a,t){if(!q(a)||!a.hasOwnProperty("raw"))throw Error("invalid template strings array");return Z!==void 0?Z.createHTML(t):t}const Ct=(a,t)=>{const e=a.length-1,s=[];let i,n=t===2?"<svg>":t===3?"<math>":"",o=x;for(let c=0;c<e;c++){const r=a[c];let l,h,d=-1,u=0;for(;u<r.length&&(o.lastIndex=u,h=o.exec(r),h!==null);)u=o.lastIndex,o===x?h[1]==="!--"?o=it:h[1]!==void 0?o=st:h[2]!==void 0?(ot.test(h[2])&&(i=RegExp("</"+h[2],"g")),o=g):h[3]!==void 0&&(o=g):o===g?h[0]===">"?(o=i??x,d=-1):h[1]===void 0?d=-2:(d=o.lastIndex-h[2].length,l=h[1],o=h[3]===void 0?g:h[3]==='"'?at:nt):o===at||o===nt?o=g:o===it||o===st?o=x:(o=g,i=void 0);const y=o===g&&a[c+1].startsWith("/>")?" ":"";n+=o===x?r+wt:d>=0?(s.push(l),r.slice(0,d)+tt+r.slice(d)+m+y):r+m+(d===-2?c:y)}return[ct(a,n+(a[e]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),s]};class P{constructor({strings:t,_$litType$:e},s){let i;this.parts=[];let n=0,o=0;const c=t.length-1,r=this.parts,[l,h]=Ct(t,e);if(this.el=P.createElement(l,s),$.currentNode=this.el.content,e===2||e===3){const d=this.el.content.firstChild;d.replaceWith(...d.childNodes)}for(;(i=$.nextNode())!==null&&r.length<c;){if(i.nodeType===1){if(i.hasAttributes())for(const d of i.getAttributeNames())if(d.endsWith(tt)){const u=h[o++],y=i.getAttribute(d).split(m),f=/([.?@])?(.*)/.exec(u);r.push({type:1,index:n,name:f[2],strings:y,ctor:f[1]==="."?Tt:f[1]==="?"?Pt:f[1]==="@"?Ot:U}),i.removeAttribute(d)}else d.startsWith(m)&&(r.push({type:6,index:n}),i.removeAttribute(d));if(ot.test(i.tagName)){const d=i.textContent.split(m),u=d.length-1;if(u>0){i.textContent=D?D.emptyScript:"";for(let y=0;y<u;y++)i.append(d[y],E()),$.nextNode(),r.push({type:2,index:++n});i.append(d[u],E())}}}else if(i.nodeType===8)if(i.data===et)r.push({type:2,index:n});else{let d=-1;for(;(d=i.data.indexOf(m,d+1))!==-1;)r.push({type:7,index:n}),d+=m.length-1}n++}}static createElement(t,e){const s=b.createElement("template");return s.innerHTML=t,s}}function A(a,t,e=a,s){if(t===_)return t;let i=s!==void 0?e._$Co?.[s]:e._$Cl;const n=C(t)?void 0:t._$litDirective$;return i?.constructor!==n&&(i?._$AO?.(!1),n===void 0?i=void 0:(i=new n(a),i._$AT(a,e,s)),s!==void 0?(e._$Co??=[])[s]=i:e._$Cl=i),i!==void 0&&(t=A(a,i._$AS(a,t.values),i,s)),t}class xt{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:s}=this._$AD,i=(t?.creationScope??b).importNode(e,!0);$.currentNode=i;let n=$.nextNode(),o=0,c=0,r=s[0];for(;r!==void 0;){if(o===r.index){let l;r.type===2?l=new O(n,n.nextSibling,this,t):r.type===1?l=new r.ctor(n,r.name,r.strings,this,t):r.type===6&&(l=new kt(n,this,t)),this._$AV.push(l),r=s[++c]}o!==r?.index&&(n=$.nextNode(),o++)}return $.currentNode=b,i}p(t){let e=0;for(const s of this._$AV)s!==void 0&&(s.strings!==void 0?(s._$AI(t,s,e),e+=s.strings.length-2):s._$AI(t[e])),e++}}class O{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,s,i){this.type=2,this._$AH=p,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=s,this.options=i,this._$Cv=i?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return e!==void 0&&t?.nodeType===11&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=A(this,t,e),C(t)?t===p||t==null||t===""?(this._$AH!==p&&this._$AR(),this._$AH=p):t!==this._$AH&&t!==_&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):St(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==p&&C(this._$AH)?this._$AA.nextSibling.data=t:this.T(b.createTextNode(t)),this._$AH=t}$(t){const{values:e,_$litType$:s}=t,i=typeof s=="number"?this._$AC(t):(s.el===void 0&&(s.el=P.createElement(ct(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===i)this._$AH.p(e);else{const n=new xt(i,this),o=n.u(this.options);n.p(e),this.T(o),this._$AH=n}}_$AC(t){let e=rt.get(t.strings);return e===void 0&&rt.set(t.strings,e=new P(t)),e}k(t){q(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let s,i=0;for(const n of t)i===e.length?e.push(s=new O(this.O(E()),this.O(E()),this,this.options)):s=e[i],s._$AI(n),i++;i<e.length&&(this._$AR(s&&s._$AB.nextSibling,i),e.length=i)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){const s=t.nextSibling;t.remove(),t=s}}setConnected(t){this._$AM===void 0&&(this._$Cv=t,this._$AP?.(t))}}class U{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,s,i,n){this.type=1,this._$AH=p,this._$AN=void 0,this.element=t,this.name=e,this._$AM=i,this.options=n,s.length>2||s[0]!==""||s[1]!==""?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=p}_$AI(t,e=this,s,i){const n=this.strings;let o=!1;if(n===void 0)t=A(this,t,e,0),o=!C(t)||t!==this._$AH&&t!==_,o&&(this._$AH=t);else{const c=t;let r,l;for(t=n[0],r=0;r<n.length-1;r++)l=A(this,c[s+r],e,r),l===_&&(l=this._$AH[r]),o||=!C(l)||l!==this._$AH[r],l===p?t=p:t!==p&&(t+=(l??"")+n[r+1]),this._$AH[r]=l}o&&!i&&this.j(t)}j(t){t===p?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class Tt extends U{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===p?void 0:t}}class Pt extends U{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==p)}}class Ot extends U{constructor(t,e,s,i,n){super(t,e,s,i,n),this.type=5}_$AI(t,e=this){if((t=A(this,t,e,0)??p)===_)return;const s=this._$AH,i=t===p&&s!==p||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,n=t!==p&&(s===p||i);i&&this.element.removeEventListener(this.name,this,s),n&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class kt{constructor(t,e,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(t){A(this,t)}}const Mt=F.litHtmlPolyfillSupport;Mt?.(P,O),(F.litHtmlVersions??=[]).push("3.3.1");const Ht=(a,t,e)=>{const s=e?.renderBefore??t;let i=s._$litPart$;if(i===void 0){const n=e?.renderBefore??null;s._$litPart$=i=new O(t.insertBefore(E(),n),n,void 0,e??{})}return i._$AI(a),i};const j=globalThis;class k extends v{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=Ht(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return _}}k._$litElement$=!0,k.finalized=!0,j.litElementHydrateSupport?.({LitElement:k});const Lt=j.litElementPolyfillSupport;Lt?.({LitElement:k}),(j.litElementVersions??=[]).push("4.2.1");const Rt={attribute:!0,type:String,converter:R,reflect:!1,hasChanged:W},Dt=(a=Rt,t,e)=>{const{kind:s,metadata:i}=e;let n=globalThis.litPropertyMetadata.get(i);if(n===void 0&&globalThis.litPropertyMetadata.set(i,n=new Map),s==="setter"&&((a=Object.create(a)).wrapped=!0),n.set(e.name,a),s==="accessor"){const{name:o}=e;return{set(c){const r=t.get.call(this);t.set.call(this,c),this.requestUpdate(o,r,a)},init(c){return c!==void 0&&this.C(o,void 0,a,c),c}}}if(s==="setter"){const{name:o}=e;return function(c){const r=this[o];t.call(this,c),this.requestUpdate(o,r,a)}}throw Error("Unsupported decorator location: "+s)};function lt(a){return(t,e)=>typeof e=="object"?Dt(a,t,e):((s,i,n)=>{const o=i.hasOwnProperty(n);return i.constructor.createProperty(n,s),o?Object.getOwnPropertyDescriptor(i,n):void 0})(a,t,e)}function ht(a){return lt({...a,state:!0,attribute:!1})}class Ut{constructor(){this.prevStates=new Map,this.subscriptions=new Map}get hass(){return this.currentHass}updateHass(t){this.currentHass=t;for(const e of this.subscriptions.keys()){const s=this.prevStates.get(e),i=this.currentHass?.states?.[e]?.state;i!==void 0&&i!==s&&this.dispatch(e,i),i!==void 0?this.prevStates.set(e,i):this.prevStates.delete(e)}}dispatch(t,e){const s=this.subscriptions.get(t);s&&s.forEach(i=>{try{i(e)}catch(n){console.error(`[HassObservable] Error in callback for ${t}:`,n)}})}subscribe(t,e){this.subscriptions.has(t)||this.subscriptions.set(t,new Set),this.subscriptions.get(t).add(e);const s=this.currentHass?.states?.[t]?.state;if(s!==void 0)try{e(s)}catch(i){console.error(`[HassObservable] Error in initial callback for ${t}:`,i)}return()=>{const i=this.subscriptions.get(t);i&&(i.delete(e),i.size===0&&this.subscriptions.delete(t))}}getState(t){return this.currentHass?.states?.[t]?.state}hasEntity(t){return this.currentHass?.states?.[t]!==void 0}unsubscribeAll(){this.subscriptions.clear()}get subscriptionCount(){let t=0;return this.subscriptions.forEach(e=>{t+=e.size}),t}}class Bt extends k{constructor(){super(...arguments),this._hassObservable=new Ut}set hass(t){this._hassObservable.updateHass(t),this.onHassUpdate(t)}get hass(){return this._hassObservable.hass}connectedCallback(){super.connectedCallback(),this.setupSubscriptions()}disconnectedCallback(){super.disconnectedCallback(),this._hassObservable.unsubscribeAll()}resetSubscriptions(){this._hassObservable.unsubscribeAll(),this.setupSubscriptions()}subscribe(t,e){this._hassObservable.subscribe(t,e)}getState(t){return this._hassObservable.getState(t)}hasEntity(t){return this._hassObservable.hasEntity(t)}onHassUpdate(t){}}function zt(){return{schema:[{name:"grid_entity",label:"Grid",required:!0,selector:{entity:{domain:"sensor",device_class:"power"}}},{name:"grid_icon",selector:{icon:{}},context:{icon_entity:"grid_entity"}},{name:"grid_tap_action",label:"Grid Tap Action",selector:{"ui-action":{}}},{name:"grid_hold_action",label:"Grid Hold Action",selector:{"ui-action":{}}},{name:"load_entity",label:"Load",required:!0,selector:{entity:{domain:"sensor",device_class:"power"}}},{name:"load_icon",selector:{icon:{}},context:{icon_entity:"load_entity"}},{name:"load_tap_action",label:"Load Tap Action",selector:{"ui-action":{}}},{name:"load_hold_action",label:"Load Hold Action",selector:{"ui-action":{}}},{name:"production_entity",label:"Production",required:!0,selector:{entity:{domain:"sensor",device_class:"power"}}},{name:"production_icon",selector:{icon:{}},context:{icon_entity:"production_entity"}},{name:"production_tap_action",label:"Production Tap Action",selector:{"ui-action":{}}},{name:"production_hold_action",label:"Production Hold Action",selector:{"ui-action":{}}},{name:"battery_entity",label:"Battery",required:!0,selector:{entity:{domain:"sensor",device_class:"power"}}},{name:"battery_icon",selector:{icon:{}},context:{icon_entity:"battery_entity"}},{name:"battery_tap_action",label:"Battery Tap Action",selector:{"ui-action":{}}},{name:"battery_hold_action",label:"Battery Hold Action",selector:{"ui-action":{}}},{name:"battery_soc_entity",label:"Battery SOC (%) Entity",selector:{entity:{domain:"sensor"}}},{name:"invert_battery_data",label:"Invert Battery Data",selector:{boolean:{}}},{name:"animation",label:"Enable Animation",selector:{boolean:{}},default:!1}]}}function Nt(a){if(a.load){const c={...a};return c.animation===void 0&&(c.animation=!1),c}const t=c=>{const r=a[`${c}_entity`];if(!r)return;const l={entity:r},h=a[`${c}_icon`],d=a[`${c}_tap_action`],u=a[`${c}_hold_action`];return h!==void 0&&(l.icon=h),d!==void 0&&(l.tap=d),u!==void 0&&(l.hold=u),l},e=t("load"),s=t("grid"),i=t("production"),n=t("battery");if(n){const c=a.battery_soc_entity,r=a.invert_battery_data;c!==void 0&&(n.soc_entity=c),r!==void 0&&(n.invert={data:r})}if(!e)return a;const o={load:e,grid:s,production:i,battery:n};return a.animation!==void 0?o.animation=a.animation:o.animation=!1,o}function Wt(a){const t=Math.max(0,a.production),e=a.grid,s=a.battery,i=Math.max(0,a.load),n={productionToLoad:0,productionToBattery:0,productionToGrid:0,gridToLoad:0,gridToBattery:0,batteryToLoad:0};let o=t,c=i;if(o>0&&c>0&&(n.productionToLoad=Math.min(o,c),o-=n.productionToLoad,c-=n.productionToLoad),s<0&&o>0&&(n.productionToBattery=Math.min(o,Math.abs(s)),o-=n.productionToBattery),s>0&&c>0&&(n.batteryToLoad=Math.min(s,c),c-=n.batteryToLoad),c>0&&e>0&&(n.gridToLoad=Math.min(e,c),c-=n.gridToLoad),s<0&&e>10){const r=Math.abs(s)-n.productionToBattery;r>1&&(n.gridToBattery=Math.min(e-n.gridToLoad,r))}return e<-10&&(n.productionToGrid=Math.abs(e)),n}function Ft(a,t,e,s){const i=a[e];return i?i.icon?i.icon:i.entity&&t?.states[i.entity]&&t.states[i.entity].attributes.icon||s:s}function qt(a,t,e,s){if(!a)return;const i=e||{action:"more-info"},n=i.action||"more-info";switch(n==="default"?"more-info":n){case"more-info":const c=i.entity||s;c&&t("hass-more-info",{entityId:c});break;case"navigate":{const r=i.path??i.navigation_path;r&&(history.pushState(null,"",r),t("location-changed",{replace:!1,path:r}),window.dispatchEvent(new CustomEvent("location-changed",{detail:{replace:!1,path:r},bubbles:!0,composed:!0})))}break;case"url":i.path&&window.open(i.path);break;case"toggle":s&&a.callService("homeassistant","toggle",{entity_id:s});break;case"call-service":if(i.service){const[r,l]=i.service.split(".");a.callService(r,l,i.service_data||{},i.target)}break}}function B(a,t,e){if(!a||!e){a?.setAttribute("data-width-px","");return}t>=80?a.setAttribute("data-width-px","show-label"):t>=40?a.setAttribute("data-width-px","show-icon"):a.setAttribute("data-width-px","")}class It{constructor(){this.loadOverlays=[],this.batteryOverlays=[],this.loadAnimations=[],this.batteryAnimations=[],this.loadSpeed=0,this.batterySpeed=0,this.batteryDirection="none",this.initialized=!1,this.minAnimatedWatts=8,this.referenceWatts=100,this.referenceSpeed=2.5,this.baseDurationMs=2e4,this.activeOpacity=.75,this.waapiSupported=typeof Element<"u"&&!!Element.prototype.animate}getAnimationSpeed(t){return t<=this.minAnimatedWatts?0:t/this.referenceWatts*this.referenceSpeed}setLoadSpeed(t){this.loadSpeed=this.getAnimationSpeed(t),this.applyLoadAnimation()}setBatteryAnimation(t,e){this.batterySpeed=this.getAnimationSpeed(Math.abs(t)),this.batteryDirection=e,this.applyBatteryAnimation()}start(t){if(!t)return;const e=typeof t.querySelectorAll=="function"?t.querySelectorAll(".load-shine"):[typeof t.querySelector=="function"?t.querySelector(".load-shine"):null],s=typeof t.querySelectorAll=="function"?t.querySelectorAll(".battery-shine"):[typeof t.querySelector=="function"?t.querySelector(".battery-shine"):null],i=this.attachOverlays("load",e,"x"),n=this.attachOverlays("battery",s,"y");this.initialized=i||n,this.initialized&&this.applyPlaybackStates()}stop(){this.cancelAnimations("load"),this.cancelAnimations("battery"),this.initialized=!1}isRunning(){return this.initialized}attachOverlays(t,e,s){const i=t==="load"?this.loadOverlays:this.batteryOverlays,n=Array.from(e).filter(r=>r instanceof HTMLElement);if(i.length===n.length&&i.every((r,l)=>r===n[l]))return n.length>0;if(this.cancelAnimations(t),n.length===0)return!1;const c=[];return n.forEach((r,l)=>{if(this.waapiSupported){const h=r.animate(s==="x"?[{transform:"translateX(-100%)"},{transform:"translateX(100%)"}]:[{transform:"translateY(-100%)"},{transform:"translateY(100%)"}],{duration:this.baseDurationMs,easing:"linear",iterations:Number.POSITIVE_INFINITY,fill:"both"});if(h.effect?.getComputedTiming){const d=l/n.length*this.baseDurationMs;h.currentTime=d}h.pause(),c.push(h)}else{const h=s==="x"?"shine-fallback-horizontal":"shine-fallback-vertical";r.classList.add(h),r.style.animationPlayState="paused",r.style.animationDelay=`-${l/n.length*this.baseDurationMs}ms`}}),t==="load"?(this.loadOverlays=n,this.loadAnimations=c):(this.batteryOverlays=n,this.batteryAnimations=c),!0}cancelAnimations(t){const e=t==="load"?this.loadAnimations:this.batteryAnimations,s=t==="load"?this.loadOverlays:this.batteryOverlays;e.forEach(i=>i.cancel()),s.forEach(i=>{i.classList.remove("shine-fallback-horizontal","shine-fallback-vertical"),i.style.animationPlayState="",i.style.animationDirection="",i.style.animationDelay=""}),t==="load"?(this.loadAnimations=[],this.loadOverlays=[]):(this.batteryAnimations=[],this.batteryOverlays=[])}applyPlaybackStates(){this.applyLoadAnimation(),this.applyBatteryAnimation()}applyLoadAnimation(){const t=this.loadSpeed>0,e=t?`${this.activeOpacity}`:"0";if(this.waapiSupported){if(this.loadAnimations.length===0)return;if(!t){this.loadAnimations.forEach(i=>i.pause());return}const s=this.getPlaybackRate(this.loadSpeed);this.loadAnimations.forEach(i=>{i.playbackRate=s,i.playState!=="running"&&i.play()})}this.loadOverlays.length&&this.loadOverlays.forEach(s=>{s.style.animationPlayState=t?"running":"paused",s.style.opacity=e})}applyBatteryAnimation(){const t=this.batterySpeed>0&&this.batteryDirection!=="none",e=t?`${this.activeOpacity}`:"0";if(this.waapiSupported){if(this.batteryAnimations.length===0)return;if(!t){this.batteryAnimations.forEach(n=>n.pause());return}const s=this.getPlaybackRate(this.batterySpeed),i=this.batteryDirection==="up";this.batteryAnimations.forEach(n=>{if(n.playbackRate=s,n.effect?.updateTiming&&n.effect.updateTiming({direction:i?"reverse":"normal"}),n.playState!=="running")try{n.play()}catch{n.pause()}})}this.batteryOverlays.length&&this.batteryOverlays.forEach(s=>{s.style.animationDirection=this.batteryDirection==="up"?"reverse":"normal",s.style.animationPlayState=t?"running":"paused",s.style.opacity=e})}getPlaybackRate(t){return t<=0?0:t/(this.referenceSpeed*3.75)}}function jt(a,t){const e=a||1,s=t.productionToLoad/e*100,i=t.batteryToLoad/e*100,n=t.gridToLoad/e*100,o=s+i+n;let c=s,r=i,l=n;if(o>0){const h=100/o;c=s*h,r=i*h,l=n*h}return{true:{production:s,battery:i,grid:n},visual:{production:c,battery:r,grid:l}}}function Vt(a,t){let e=0,s=0,i=0,n=0,o=0,c=0,r=!1,l="none";if(a<0){l="up",r=!0;const d=Math.abs(a)||1;e=t.gridToBattery,i=t.productionToBattery;const u=t.gridToBattery/d*100,y=t.productionToBattery/d*100,f=u+y;if(f>0){const M=100/f;n=u*M,c=y*M}}else if(a>0){l="down",r=!1;const h=a||1,d=a-t.batteryToLoad;s=t.batteryToLoad,e=d;const u=t.batteryToLoad/h*100,y=d/h*100,f=u+y;if(f>0){const M=100/f;o=u*M,n=y*M}}else l="none";return{gridWatts:e,loadWatts:s,productionWatts:i,gridPercent:n,loadPercent:o,productionPercent:c,gridIsImport:r,direction:l}}const Gt=ut`
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
  }

  /* Transform-only shine overlay keeps GPU-friendly movement without repainting the gradient. */
  .compact-card .shine-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 120%;
    height: 100%;
    pointer-events: none;
    z-index: 10;
    opacity: 0.75;
    will-change: transform, opacity;
    transform: translateX(-100%);
    transition: opacity 0.5s ease-out;
  }

  .compact-card .shine-overlay.shine-horizontal {
    width: 90%;
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0) 30%,
      rgba(255, 255, 255, 0.3) 50%,
      rgba(255, 255, 255, 0) 70%,
      rgba(255, 255, 255, 0) 100%
    );
  }

  .compact-card .shine-overlay.shine-vertical {
    width: 100%;
    height: 150%;
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0) 30%,
      rgba(255, 255, 255, 0.3) 50%,
      rgba(255, 255, 255, 0) 70%,
      rgba(255, 255, 255, 0) 100%
    );
    transform: translateY(-100%);
  }

  .compact-card.animation-disabled .bar-container,
  .compact-card.animation-disabled .bar-segment {
    transition: none;
  }

  .compact-card.animation-disabled .shine-overlay {
    display: none;
  }

  .compact-card .bar-container.no-flow .shine-overlay {
    opacity: 0;
  }

  @keyframes shine-horizontal {
    from { transform: translateX(-100%); }
    to { transform: translateX(100%); }
  }

  @keyframes shine-vertical {
    from { transform: translateY(-100%); }
    to { transform: translateY(100%); }
  }

  .compact-card .shine-fallback-horizontal {
    animation: shine-horizontal 75s linear infinite;
  }

  .compact-card .shine-fallback-vertical {
    animation: shine-vertical 75s linear infinite;
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
`;var Yt=Object.defineProperty,V=(a,t,e,s)=>{for(var i=void 0,n=a.length-1,o;n>=0;n--)(o=a[n])&&(i=o(t,e,i)||i);return i&&Yt(t,e,i),i};const G=class G extends Bt{constructor(){super(...arguments),this.viewMode="compact",this.segmentVisibilityRaf=null,this.renderDataQueued=!1,this.productionColor="#256028",this.batteryColor="#104b79",this.gridColor="#7a211b",this.returnColor="#7a6b1b",this.animation=new It}static getStubConfig(){return{}}static getConfigForm(){return zt()}disconnectedCallback(){super.disconnectedCallback(),this.animation.stop(),this.segmentVisibilityRaf!==null&&(cancelAnimationFrame(this.segmentVisibilityRaf),this.segmentVisibilityRaf=null)}setConfig(t){const e=Nt(t);e.animation===void 0&&(e.animation=!1),this.config=e,this.isConnected&&(this.resetSubscriptions(),this.isAnimationEnabled()||this.animation.stop())}setupSubscriptions(){if(!this.config)return;const t=()=>{this.renderDataQueued||(this.renderDataQueued=!0,queueMicrotask(()=>{this.renderDataQueued=!1,this.updateRenderData()}))};this.config.grid?.entity&&this.subscribe(this.config.grid.entity,t),this.config.load?.entity&&this.subscribe(this.config.load.entity,t),this.config.production?.entity&&this.subscribe(this.config.production.entity,t),this.config.battery?.entity&&this.subscribe(this.config.battery.entity,t),this.config.battery?.soc_entity&&this.subscribe(this.config.battery.soc_entity,t)}updateRenderData(){if(!this.config||!this.hass)return;const t=this.hass.states[this.config.grid?.entity||""],e=this.hass.states[this.config.load?.entity||""],s=this.hass.states[this.config.production?.entity||""],i=this.hass.states[this.config.battery?.entity||""],n=parseFloat(t?.state??"0")||0,o=parseFloat(e?.state??"0")||0,c=parseFloat(s?.state??"0")||0;let r=parseFloat(i?.state??"0")||0;this.config.battery?.invert?.data&&(r=-r);const l=Wt({grid:n,production:c,load:o,battery:r});let h=null;if(this.config.battery?.soc_entity){const d=this.hass.states[this.config.battery.soc_entity];h=parseFloat(d?.state??"0")||0}this.viewMode=h!==null?"compact-battery":"compact",this.renderData={grid:n,load:o,production:c,battery:r,flows:l,batterySoc:h}}render(){if(!this.config||!this.renderData)return T`<ha-card class="compact-card"><div style="padding:16px;">Waiting for configuration...</div></ha-card>`;const{load:t,flows:e,battery:s,batterySoc:i}=this.renderData,n=this.isAnimationEnabled(),o=jt(t,e);return n&&this.animation.setLoadSpeed(t),T`
      <ha-card class="compact-card ${n?"":"animation-disabled"}">
        <div class="compact-view ${this.viewMode==="compact-battery"?"has-battery":""}">
          ${this.viewMode==="compact-battery"?this.renderBatteryRow(s,e,i):""}
          ${this.renderLoadRow(o.visual,o.true,e.productionToLoad,e.batteryToLoad,e.gridToLoad,t)}
        </div>
      </ha-card>
    `}renderLoadRow(t,e,s,i,n,o){return T`
      <div class="compact-row">
        <div class="bar-container ${this.animation.getAnimationSpeed(o)>0?"":"no-flow"}">
          ${this.renderShineOverlay("horizontal")}
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
              <span class="bar-segment-label">${i>0?`${Math.round(e.battery)}%`:""}</span>
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
              <span class="bar-segment-label">${s>0?`${Math.round(e.production)}%`:""}</span>
            </div>
          </div>
        </div>
        <div class="row-value" @click=${()=>this.handleClick(this.config?.load?.tap,this.config?.load?.entity)}>
          <ha-icon class="row-icon" icon="${this.getIconFor("load")}"></ha-icon>
          <div class="row-text">
            <span>${Math.round(o)}</span><span class="row-unit">W</span>
          </div>
        </div>
      </div>
    `}renderBatteryRow(t,e,s){const i=Vt(t,e);this.isAnimationEnabled()&&this.animation.setBatteryAnimation(t,i.direction);const n=i.gridIsImport?this.gridColor:this.returnColor,o=s!==null?s.toFixed(1):"--",c=t>0;return T`
      <div class="compact-row" id="battery-row">
        <div
          class="row-value"
          style="display: ${c?"flex":"none"};"
          @click=${()=>this.handleClick(this.config?.battery?.tap,this.config?.battery?.entity)}
        >
          <ha-icon class="row-icon" icon="${this.getIconFor("battery")}"></ha-icon>
          <div class="row-text">
            <span>${o}</span><span class="row-unit">%</span>
          </div>
        </div>
        <div class="bar-container ${this.animation.getAnimationSpeed(Math.abs(t))>0?"":"no-flow"}">
          ${this.renderShineOverlay("vertical")}
          <div
            class="bar-segment"
            style="background: ${n}; width: ${i.gridPercent}%;"
            @click=${()=>this.handleClick(this.config?.grid?.tap,this.config?.grid?.entity)}
          >
            <div class="bar-segment-content">
              <ha-icon class="bar-segment-icon" icon="${this.getIconFor("grid")}"></ha-icon>
              <span class="bar-segment-label">${i.gridWatts>0?`${Math.round(i.gridWatts)}W`:""}</span>
            </div>
          </div>
          <div
            class="bar-segment"
            style="background: ${this.batteryColor}; width: ${i.loadPercent}%;"
            @click=${()=>this.handleClick(this.config?.load?.tap,this.config?.load?.entity)}
          >
            <div class="bar-segment-content">
              <ha-icon class="bar-segment-icon" icon="${this.getIconFor("load")}"></ha-icon>
              <span class="bar-segment-label">${i.loadWatts>0?`${Math.round(i.loadWatts)}W`:""}</span>
            </div>
          </div>
          <div
            class="bar-segment"
            style="background: ${this.productionColor}; width: ${i.productionPercent}%;"
            @click=${()=>this.handleClick(this.config?.production?.tap,this.config?.production?.entity)}
          >
            <div class="bar-segment-content">
              <ha-icon class="bar-segment-icon" icon="${this.getIconFor("production")}"></ha-icon>
              <span class="bar-segment-label">${i.productionWatts>0?`${Math.round(i.productionWatts)}W`:""}</span>
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
            <span>${o}</span><span class="row-unit">%</span>
          </div>
        </div>
      </div>
    `}isAnimationEnabled(){return this.config?.animation!==!1}getIconFor(t){const e={grid:"mdi:transmission-tower",load:"mdi:home-lightning-bolt",production:"mdi:solar-power",battery:"mdi:battery"};return Ft(this.config,this.hass,t,e[t])}renderShineOverlay(t){const e=t==="horizontal"?"shine-overlay shine-horizontal load-shine":"shine-overlay shine-vertical battery-shine";return T`
      <div class="${e}"></div>
      <div class="${e}"></div>
    `}handleClick(t,e){this.hass&&qt(this.hass,this.fireEvent.bind(this),t,e)}fireEvent(t,e={}){if(t==="call-service"&&this.hass){this.hass.callService(e.domain,e.service,e.service_data||{},e.target);return}const s=new CustomEvent(t,{detail:e,bubbles:!0,composed:!0});this.dispatchEvent(s)}updated(t){super.updated(t),this.isAnimationEnabled()?this.shadowRoot&&this.animation.start(this.shadowRoot):this.animation.isRunning()&&this.animation.stop(),t.has("renderData")&&this.renderData&&this.segmentVisibilityRaf===null&&(this.segmentVisibilityRaf=requestAnimationFrame(()=>{this.segmentVisibilityRaf=null,this.updateSegmentVisibility()}))}updateSegmentVisibility(){if(!this.shadowRoot||!this.renderData)return;const{flows:t}=this.renderData,e=this.shadowRoot.querySelector(".compact-row:not(#battery-row) .bar-container");if(e){const s=e.clientWidth;if(s>0){const i=this.shadowRoot.querySelector("#production-segment"),n=this.shadowRoot.querySelector("#battery-segment"),o=this.shadowRoot.querySelector("#grid-segment");if(i){const c=parseFloat(i.style.width)/100*s;B(i,c,t.productionToLoad>0)}if(n){const c=parseFloat(n.style.width)/100*s;B(n,c,t.batteryToLoad>0)}if(o){const c=parseFloat(o.style.width)/100*s;B(o,c,t.gridToLoad>0)}}}if(this.viewMode==="compact-battery"){const s=this.shadowRoot.querySelector("#battery-row .bar-container");if(s){const i=s.clientWidth;i>0&&s.querySelectorAll(".bar-segment").forEach(o=>{const c=parseFloat(o.style.width)/100*i,r=o.querySelector(".bar-segment-label"),l=!!(r?.textContent&&r.textContent.trim()!=="");B(o,c,l)})}}}};G.styles=Gt;let w=G;V([lt({attribute:!1})],w.prototype,"config"),V([ht()],w.prototype,"viewMode"),V([ht()],w.prototype,"renderData");const dt="compact-home-energy-flow-card";customElements.get(dt)?console.info("[CompactHomeEnergyFlowCard] custom element already defined"):(customElements.define(dt,w),console.info("[CompactHomeEnergyFlowCard] defined custom element")),window.customCards=window.customCards||[],window.customCards.push({type:"compact-home-energy-flow-card",name:"Compact Home Energy Flow Card",description:"Compact bar visualization of home energy flows"})})();

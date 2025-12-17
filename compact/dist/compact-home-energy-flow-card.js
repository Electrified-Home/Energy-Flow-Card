(function(){"use strict";function M(){return{schema:[{name:"grid_entity",label:"Grid",required:!0,selector:{entity:{domain:"sensor",device_class:"power"}}},{name:"grid_icon",selector:{icon:{}},context:{icon_entity:"grid_entity"}},{name:"grid_tap_action",label:"Grid Tap Action",selector:{"ui-action":{}}},{name:"grid_hold_action",label:"Grid Hold Action",selector:{"ui-action":{}}},{name:"load_entity",label:"Load",required:!0,selector:{entity:{domain:"sensor",device_class:"power"}}},{name:"load_icon",selector:{icon:{}},context:{icon_entity:"load_entity"}},{name:"load_tap_action",label:"Load Tap Action",selector:{"ui-action":{}}},{name:"load_hold_action",label:"Load Hold Action",selector:{"ui-action":{}}},{name:"production_entity",label:"Production",required:!0,selector:{entity:{domain:"sensor",device_class:"power"}}},{name:"production_icon",selector:{icon:{}},context:{icon_entity:"production_entity"}},{name:"production_tap_action",label:"Production Tap Action",selector:{"ui-action":{}}},{name:"production_hold_action",label:"Production Hold Action",selector:{"ui-action":{}}},{name:"battery_entity",label:"Battery",required:!0,selector:{entity:{domain:"sensor",device_class:"power"}}},{name:"battery_icon",selector:{icon:{}},context:{icon_entity:"battery_entity"}},{name:"battery_tap_action",label:"Battery Tap Action",selector:{"ui-action":{}}},{name:"battery_hold_action",label:"Battery Hold Action",selector:{"ui-action":{}}},{name:"battery_soc_entity",label:"Battery SOC (%) Entity",selector:{entity:{domain:"sensor"}}},{name:"invert_battery_data",label:"Invert Battery Data",selector:{boolean:{}}}]}}function $(c){if(c.load)return c;const t=s=>{const r=c[`${s}_entity`];if(!r)return;const a={entity:r},l=c[`${s}_icon`],d=c[`${s}_tap_action`],b=c[`${s}_hold_action`];return l!==void 0&&(a.icon=l),d!==void 0&&(a.tap=d),b!==void 0&&(a.hold=b),a},o=t("load"),e=t("grid"),i=t("production"),n=t("battery");if(n){const s=c.battery_soc_entity,r=c.invert_battery_data;s!==void 0&&(n.soc_entity=s),r!==void 0&&(n.invert={data:r})}return o?{load:o,grid:e,production:i,battery:n}:c}function P(c){const t=Math.max(0,c.production),o=c.grid,e=c.battery,i=Math.max(0,c.load),n={productionToLoad:0,productionToBattery:0,productionToGrid:0,gridToLoad:0,gridToBattery:0,batteryToLoad:0};let s=t,r=i;if(s>0&&r>0&&(n.productionToLoad=Math.min(s,r),s-=n.productionToLoad,r-=n.productionToLoad),e<0&&s>0&&(n.productionToBattery=Math.min(s,Math.abs(e)),s-=n.productionToBattery),e>0&&r>0&&(n.batteryToLoad=Math.min(e,r),r-=n.batteryToLoad),r>0&&o>0&&(n.gridToLoad=Math.min(o,r),r-=n.gridToLoad),e<0&&o>10){const a=Math.abs(e)-n.productionToBattery;a>1&&(n.gridToBattery=Math.min(o-n.gridToLoad,a))}return o<-10&&(n.productionToGrid=Math.abs(o)),n}function F(c,t,o,e){const i=c[o];return i?i.icon?i.icon:i.entity&&t?.states[i.entity]&&t.states[i.entity].attributes.icon||e:e}function B(c,t,o,e){if(!c)return;const i=o||{action:"more-info"},n=i.action||"more-info";switch(n==="default"?"more-info":n){case"more-info":const r=i.entity||e;r&&t("hass-more-info",{entityId:r});break;case"navigate":{const a=i.path??i.navigation_path;a&&(history.pushState(null,"",a),t("location-changed",{replace:!1,path:a}),window.dispatchEvent(new CustomEvent("location-changed",{detail:{replace:!1,path:a},bubbles:!0,composed:!0})))}break;case"url":i.path&&window.open(i.path);break;case"toggle":e&&c.callService("homeassistant","toggle",{entity_id:e});break;case"call-service":if(i.service){const[a,l]=i.service.split(".");c.callService(a,l,i.service_data||{},i.target)}break}}function S(c,t,o){if(!c||!o){c?.setAttribute("data-width-px","");return}t>=80?c.setAttribute("data-width-px","show-label"):t>=40?c.setAttribute("data-width-px","show-icon"):c.setAttribute("data-width-px","")}class H{constructor(t,o,e,i,n,s){this.productionColor="#256028",this.batteryColor="#104b79",this.gridColor="#7a211b",this.returnColor="#7a6b1b",this.animationFrameId=null,this.loadPosition=0,this.batteryPosition=0,this.loadSpeed=0,this.batterySpeed=0,this.batteryDirection="none",this.lastAnimationTime=0,this.container=t,this.config=o,this.hass=e,this.viewMode=i,this.getIconCallback=n,this.handleActionCallback=s}setConfig(t){this.config=t}render(t){(!this.container.querySelector(".compact-view")||this.lastViewMode!==this.viewMode)&&(this.initializeStructure(),this.attachEventHandlers(),this.lastViewMode=this.viewMode),this.updateSegments(t)}setViewMode(t){this.viewMode!==t&&(this.viewMode=t,this.lastViewMode=void 0)}initializeStructure(){this.container.innerHTML=`
      <ha-card>
        <style>
          :host {
            display: block;
            width: 100%;
            height: 100%;
          }
          ha-card {
            padding: 16px;
            box-sizing: border-box;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;
          }
          .compact-view {
            display: flex;
            flex-direction: column;
            gap: ${this.viewMode==="compact-battery"?"12px":"0"};
            width: 100%;
          }
          .compact-row {
            display: flex;
            align-items: center;
            gap: 12px;
            width: 100%;
          }
          .bar-container {
            flex: 1;
            height: 60px;
            background: rgb(40, 40, 40);
            border-radius: 8px;
            overflow: hidden;
            display: flex;
            position: relative;
          }
          .bar-container {
            --gradient-x: -100%;
            --gradient-y: 0%;
          }
          .bar-container::before {
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
          .bar-container.no-flow::before {
            opacity: 0;
          }
          #battery-row .bar-container::before {
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
          .bar-segment {
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
          .bar-segment:hover {
            filter: brightness(1.2);
          }
          .bar-segment-content {
            display: flex;
            align-items: center;
            gap: 6px;
            white-space: nowrap;
          }
          .bar-segment-icon {
            width: 24px;
            height: 24px;
            flex-shrink: 0;
            opacity: 1;
            color: rgb(255, 255, 255);
          }
          .bar-segment-label {
            text-shadow: 0 1px 2px rgba(0,0,0,0.3);
          }
          .bar-segment[data-width-px] .bar-segment-label {
            display: none;
          }
          .bar-segment[data-width-px="show-label"] .bar-segment-label {
            display: inline;
          }
          .bar-segment[data-width-px] .bar-segment-icon {
            display: none;
          }
          .bar-segment[data-width-px="show-icon"] .bar-segment-icon,
          .bar-segment[data-width-px="show-label"] .bar-segment-icon {
            display: block;
          }
          .row-value {
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
          .row-value:hover {
            filter: brightness(1.1);
          }
          .row-value.battery-discharge {
            text-align: left;
            flex-direction: row-reverse;
          }
          .row-icon {
            width: 28px;
            height: 28px;
            flex-shrink: 0;
            color: rgb(160, 160, 160);
            display: flex;
            align-items: center;
          }
          .row-text {
            display: flex;
            align-items: baseline;
            gap: 4px;
            line-height: 1;
          }
          .row-unit {
            font-size: 14px;
            color: rgb(160, 160, 160);
            margin-left: 4px;
          }
        </style>
        <div class="compact-view">
          ${this.viewMode==="compact-battery"?`
          <!-- Battery Row -->
          <div class="compact-row" id="battery-row">
            <div class="row-value" id="battery-soc-left" style="display: none;">
              <ha-icon class="row-icon" icon="${this.getIconCallback("battery","mdi:battery")}"></ha-icon>
              <div class="row-text">
                <span id="battery-soc-text-left">--</span><span class="row-unit">%</span>
              </div>
            </div>
            <div class="bar-container">
              <!-- Color order: red, yellow, blue, green (left to right) -->
              <div id="battery-grid-segment" class="bar-segment" style="background: ${this.gridColor}; width: 0%;">
                <div class="bar-segment-content">
                  <ha-icon class="bar-segment-icon" icon="${this.getIconCallback("grid","mdi:transmission-tower")}"></ha-icon>
                  <span class="bar-segment-label"></span>
                </div>
              </div>
              <div id="battery-load-segment" class="bar-segment" style="background: ${this.batteryColor}; width: 0%;">
                <div class="bar-segment-content">
                  <ha-icon class="bar-segment-icon" icon="${this.getIconCallback("load","mdi:home")}"></ha-icon>
                  <span class="bar-segment-label"></span>
                </div>
              </div>
              <div id="battery-production-segment" class="bar-segment" style="background: ${this.productionColor}; width: 0%;">
                <div class="bar-segment-content">
                  <ha-icon class="bar-segment-icon" icon="${this.getIconCallback("production","mdi:solar-power")}"></ha-icon>
                  <span class="bar-segment-label"></span>
                </div>
              </div>
            </div>
            <div class="row-value" id="battery-soc-right">
              <ha-icon class="row-icon" icon="${this.getIconCallback("battery","mdi:battery")}"></ha-icon>
              <div class="row-text">
                <span id="battery-soc-text-right">--</span><span class="row-unit">%</span>
              </div>
            </div>
          </div>
          `:""}
          <!-- Load Row -->
          <div class="compact-row">
            <div class="bar-container">
              <div id="grid-segment" class="bar-segment" style="background: ${this.gridColor}; width: 0%;">
                <div class="bar-segment-content">
                  <ha-icon class="bar-segment-icon" icon="${this.getIconCallback("grid","mdi:transmission-tower")}"></ha-icon>
                  <span class="bar-segment-label"></span>
                </div>
              </div>
              <div id="battery-segment" class="bar-segment" style="background: ${this.batteryColor}; width: 0%;">
                <div class="bar-segment-content">
                  <ha-icon class="bar-segment-icon" icon="${this.getIconCallback("battery","mdi:battery")}"></ha-icon>
                  <span class="bar-segment-label"></span>
                </div>
              </div>
              <div id="production-segment" class="bar-segment" style="background: ${this.productionColor}; width: 0%;">
                <div class="bar-segment-content">
                  <ha-icon class="bar-segment-icon" icon="${this.getIconCallback("production","mdi:solar-power")}"></ha-icon>
                  <span class="bar-segment-label"></span>
                </div>
              </div>
            </div>
            <div class="row-value">
              <ha-icon class="row-icon" icon="${this.getIconCallback("load","mdi:home-lightning-bolt")}"></ha-icon>
              <div class="row-text">
                <span id="load-value-text">0</span><span class="row-unit">W</span>
              </div>
            </div>
          </div>
        </div>
      </ha-card>
    `}attachEventHandlers(){requestAnimationFrame(()=>{const t=this.container.querySelector("#production-segment"),o=this.container.querySelector("#battery-segment"),e=this.container.querySelector("#grid-segment"),n=this.container.querySelectorAll(".row-value")[0];if(t&&t.addEventListener("click",()=>{this.handleActionCallback(this.config.production?.tap,this.config.production?.entity)}),o&&o.addEventListener("click",()=>{this.handleActionCallback(this.config.battery?.tap,this.config.battery?.entity)}),e&&e.addEventListener("click",()=>{this.handleActionCallback(this.config.grid?.tap,this.config.grid?.entity)}),n&&n.addEventListener("click",()=>{this.handleActionCallback(this.config.load.tap,this.config.load.entity)}),this.viewMode==="compact-battery"){const s=this.container.querySelector("#battery-production-segment"),r=this.container.querySelector("#battery-load-segment"),a=this.container.querySelector("#battery-grid-segment"),l=this.container.querySelector("#battery-soc-left"),d=this.container.querySelector("#battery-soc-right");s&&s.addEventListener("click",()=>{this.handleActionCallback(this.config.production?.tap,this.config.production?.entity)}),r&&r.addEventListener("click",()=>{this.handleActionCallback(this.config.load.tap,this.config.load.entity)}),a&&a.addEventListener("click",()=>{this.handleActionCallback(this.config.grid?.tap,this.config.grid?.entity)}),l&&l.addEventListener("click",()=>{this.handleActionCallback(this.config.battery?.tap,this.config.battery?.entity)}),d&&d.addEventListener("click",()=>{this.handleActionCallback(this.config.battery?.tap,this.config.battery?.entity)})}})}updateSegments(t){const{load:o,flows:e,battery:i,batterySoc:n}=t,s=e.productionToLoad,r=e.batteryToLoad,a=e.gridToLoad,l=o||1,d=s/l*100,b=r/l*100,g=a/l*100,h=d+b+g;let u=d,m=b,f=g;if(h>0){const _=100/h;u=d*_,m=b*_,f=g*_}let y=0,w=0,x=0,p=0,v=0,E=0;if(this.viewMode==="compact-battery"){if(i<0){const C=Math.abs(i)||1;y=e.gridToBattery,x=e.productionToBattery;const L=e.gridToBattery/C*100,T=e.productionToBattery/C*100,k=L+T;if(k>0){const A=100/k;p=L*A,E=T*A}}else if(i>0){const _=i||1,C=i-e.batteryToLoad;w=e.batteryToLoad,y=C;const L=e.batteryToLoad/_*100,T=C/_*100,k=L+T;if(k>0){const A=100/k;v=L*A,p=T*A}}}requestAnimationFrame(()=>{this.updateLoadBar(u,m,f,d,b,g,s,r,a,o),this.viewMode==="compact-battery"&&this.updateBatteryBar(p,v,E,y,w,x,i,n)})}getAnimationSpeed(t){return t<=0?0:t/100*2.5}startAnimation(){if(this.animationFrameId!==null)return;this.lastAnimationTime=performance.now();const t=o=>{const e=(o-this.lastAnimationTime)/1e3;if(this.lastAnimationTime=o,this.loadSpeed>0){this.loadPosition+=this.loadSpeed*e,this.loadPosition>100&&(this.loadPosition=-100);const i=this.container.querySelector(".compact-row:not(#battery-row) .bar-container");if(i){const n=i.querySelector("::before");n?n.style.transform=`translateX(${this.loadPosition}%)`:i.style.setProperty("--gradient-x",`${this.loadPosition}%`)}}if(this.batterySpeed>0&&this.batteryDirection!=="none"){this.batteryDirection==="up"?(this.batteryPosition-=this.batterySpeed*e,this.batteryPosition<-100&&(this.batteryPosition=100)):(this.batteryPosition+=this.batterySpeed*e,this.batteryPosition>100&&(this.batteryPosition=-100));const i=this.container.querySelector("#battery-row .bar-container");i&&i.style.setProperty("--gradient-y",`${this.batteryPosition}%`)}this.animationFrameId=requestAnimationFrame(t)};this.animationFrameId=requestAnimationFrame(t)}stopAnimation(){this.animationFrameId!==null&&(cancelAnimationFrame(this.animationFrameId),this.animationFrameId=null)}dispose(){this.stopAnimation()}updateLoadBar(t,o,e,i,n,s,r,a,l,d){const b=this.container.querySelector("#production-segment"),g=this.container.querySelector("#battery-segment"),h=this.container.querySelector("#grid-segment"),u=this.container.querySelector("#load-value-text"),m=this.container.querySelector(".bar-container");if(this.loadSpeed=this.getAnimationSpeed(d),m&&(this.loadSpeed>0?(m.classList.remove("no-flow"),this.animationFrameId===null&&this.startAnimation()):m.classList.add("no-flow")),b){b.style.width=`${t}%`;const f=b.querySelector(".bar-segment-label");f&&r>0&&(f.textContent=`${Math.round(i)}%`);const y=t/100*(m?.clientWidth||0);S(b,y,r>0)}if(g){g.style.width=`${o}%`;const f=g.querySelector(".bar-segment-label");f&&a>0&&(f.textContent=`${Math.round(n)}%`);const y=o/100*(m?.clientWidth||0);S(g,y,a>0)}if(h){h.style.width=`${e}%`;const f=h.querySelector(".bar-segment-label");f&&l>0&&(f.textContent=`${Math.round(s)}%`);const y=e/100*(m?.clientWidth||0);S(h,y,l>0)}u&&(u.textContent=String(Math.round(d)))}updateBatteryBar(t,o,e,i,n,s,r,a){const l=this.container.querySelector("#battery-grid-segment"),d=this.container.querySelector("#battery-load-segment"),b=this.container.querySelector("#battery-production-segment"),g=this.container.querySelector("#battery-soc-left"),h=this.container.querySelector("#battery-soc-right"),u=this.container.querySelector("#battery-soc-text-left"),m=this.container.querySelector("#battery-soc-text-right"),y=this.container.querySelectorAll(".bar-container")[0],w=this.container.querySelector("#battery-row");let x=!1;if(r<0){x=!0;const p=this.batteryDirection!=="up";this.batteryDirection="up",p&&(this.batteryPosition=100),w&&(w.classList.add("charging"),w.classList.remove("discharging")),g&&(g.style.display="none"),h&&(h.style.display="flex"),m&&a!==null&&(m.textContent=a.toFixed(1))}else if(r>0){x=!1;const p=this.batteryDirection!=="down";this.batteryDirection="down",p&&(this.batteryPosition=-100),w&&(w.classList.add("discharging"),w.classList.remove("charging")),g&&(g.style.display="flex"),h&&(h.style.display="none"),u&&a!==null&&(u.textContent=a.toFixed(1))}else this.batteryDirection="none",w&&w.classList.remove("charging","discharging"),g&&(g.style.display="none"),h&&(h.style.display="flex"),m&&a!==null&&(m.textContent=a.toFixed(1));if(this.batterySpeed=this.getAnimationSpeed(Math.abs(r)),y&&(this.batterySpeed>0?(y.classList.remove("no-flow"),this.animationFrameId===null&&this.startAnimation()):y.classList.add("no-flow")),l){const p=x?this.gridColor:this.returnColor;l.style.width=`${t}%`,l.style.background=p;const v=l.querySelector(".bar-segment-label");v&&i>0&&(v.textContent=`${Math.round(i)}W`);const E=t/100*(y?.offsetWidth||0);S(l,E,i>0)}if(d){d.style.width=`${o}%`;const p=d.querySelector(".bar-segment-label");p&&n>0&&(p.textContent=`${Math.round(n)}W`);const v=o/100*(y?.offsetWidth||0);S(d,v,n>0)}if(b){b.style.width=`${e}%`;const p=b.querySelector(".bar-segment-label");p&&s>0&&(p.textContent=`${Math.round(s)}W`);const v=e/100*(y?.offsetWidth||0);S(b,v,s>0)}}}class I extends HTMLElement{constructor(){super(),this._resizeObserver=null}static getStubConfig(){return{}}static getConfigForm(){return M()}connectedCallback(){this._resizeObserver=new ResizeObserver(()=>{}),this.parentElement&&this._resizeObserver.observe(this.parentElement),this._resizeObserver.observe(this)}disconnectedCallback(){this._compactRenderer&&(this._compactRenderer.dispose(),this._compactRenderer=void 0),this._resizeObserver&&(this._resizeObserver.disconnect(),this._resizeObserver=null)}setConfig(t){this._config=$(t),this._renderSafely("setConfig")}set hass(t){this._hass=t,this._renderSafely("hass update")}_renderSafely(t){try{this._render()}catch(o){console.error("[CompactHomeEnergyFlowCard] render failed during",t,o),this.innerHTML=`
        <ha-card>
          <div style="padding:16px;">
            Compact Home Energy Flow Card failed to render. Check browser console for details.
          </div>
        </ha-card>
      `}}_render(){if(!this._config||!this._hass||!this._config.load)return;const t=this._getEntityState(this._config.grid?.entity),o=this._getEntityState(this._config.load.entity),e=this._getEntityState(this._config.production?.entity),i=this._getEntityState(this._config.battery?.entity),n=parseFloat(t?.state??"0")||0,s=parseFloat(o?.state??"0")||0,r=parseFloat(e?.state??"0")||0;let a=parseFloat(i?.state??"0")||0;this._config.battery?.invert?.data&&(a=-a);const d=!!this._config.battery?.soc_entity?"compact-battery":"compact";this._compactRenderer?(this._compactRenderer.setConfig(this._config),this._compactRenderer.setViewMode(d)):this._compactRenderer=new H(this,this._config,this._hass,d,(h,u)=>F(this._config,this._hass,h,u),(h,u)=>B(this._hass,this._fireEvent.bind(this),h,u));const b=P({grid:n,production:r,load:s,battery:a});let g=null;if(this._config.battery?.soc_entity){const h=this._getEntityState(this._config.battery.soc_entity);g=parseFloat(h?.state??"0")||0}this._compactRenderer.render({grid:n,load:s,production:r,battery:a,flows:b,batterySoc:g})}_getEntityState(t){if(t)return this._hass?.states?.[t]}_fireEvent(t,o={}){if(t==="call-service"&&this._hass){this._hass.callService(o.domain,o.service,o.service_data||{},o.target);return}const e=new CustomEvent(t,{detail:o,bubbles:!0,composed:!0});this.dispatchEvent(e)}}const q="compact-home-energy-flow-card";customElements.get(q)?console.info("[CompactHomeEnergyFlowCard] custom element already defined"):(customElements.define(q,I),console.info("[CompactHomeEnergyFlowCard] defined custom element")),window.customCards=window.customCards||[],window.customCards.push({type:"compact-home-energy-flow-card",name:"Compact Home Energy Flow Card",description:"Compact bar visualization of home energy flows"}),window.dispatchEvent(new Event("ll-rebuild"))})();

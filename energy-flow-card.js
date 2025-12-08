(function(){"use strict";function rt(g){const t=Math.max(0,g.production),e=g.grid,i=g.battery,n=Math.max(0,g.load),a={productionToLoad:0,productionToBattery:0,productionToGrid:0,gridToLoad:0,gridToBattery:0,batteryToLoad:0};let o=t,s=n;if(o>0&&s>0&&(a.productionToLoad=Math.min(o,s),o-=a.productionToLoad,s-=a.productionToLoad),i<0&&o>0&&(a.productionToBattery=Math.min(o,Math.abs(i)),o-=a.productionToBattery),i>0&&s>0&&(a.batteryToLoad=Math.min(i,s),s-=a.batteryToLoad),s>0&&e>0&&(a.gridToLoad=Math.min(e,s),s-=a.gridToLoad),i<0&&e>10){const c=Math.abs(i)-a.productionToBattery;c>1&&(a.gridToBattery=Math.min(e-a.gridToLoad,c))}return e<-10&&(a.productionToGrid=Math.abs(e)),a}function ct(){return{schema:[{name:"view_mode",label:"View Mode",selector:{select:{options:[{value:"default",label:"Default"},{value:"compact",label:"Compact Bar"},{value:"compact-battery",label:"Compact with Battery"},{value:"chart",label:"Chart"}]}}},{name:"grid_entity",label:"Grid",required:!0,selector:{entity:{domain:"sensor",device_class:"power"}}},{name:"grid_name",selector:{entity_name:{}},context:{entity:"grid_entity"}},{name:"grid_icon",selector:{icon:{}},context:{icon_entity:"grid_entity"}},{name:"grid_min",label:"Grid Min (W)",selector:{number:{mode:"box"}}},{name:"grid_max",label:"Grid Max (W)",selector:{number:{mode:"box"}}},{name:"grid_tap_action",label:"Grid Tap Action",selector:{"ui-action":{}}},{name:"load_entity",label:"Load",required:!0,selector:{entity:{domain:"sensor",device_class:"power"}}},{name:"load_name",selector:{entity_name:{}},context:{entity:"load_entity"}},{name:"load_icon",selector:{icon:{}},context:{icon_entity:"load_entity"}},{name:"load_max",label:"Load Max (W)",selector:{number:{mode:"box"}}},{name:"load_tap_action",label:"Load Tap Action",selector:{"ui-action":{}}},{name:"production_entity",label:"Production",required:!0,selector:{entity:{domain:"sensor",device_class:"power"}}},{name:"production_name",selector:{entity_name:{}},context:{entity:"production_entity"}},{name:"production_icon",selector:{icon:{}},context:{icon_entity:"production_entity"}},{name:"production_max",label:"Production Max (W)",selector:{number:{mode:"box"}}},{name:"production_tap_action",label:"Production Tap Action",selector:{"ui-action":{}}},{name:"battery_entity",label:"Battery",required:!0,selector:{entity:{domain:"sensor",device_class:"power"}}},{name:"battery_name",selector:{entity_name:{}},context:{entity:"battery_entity"}},{name:"battery_icon",selector:{icon:{}},context:{icon_entity:"battery_entity"}},{name:"battery_min",label:"Battery Min (W)",selector:{number:{mode:"box"}}},{name:"battery_max",label:"Battery Max (W)",selector:{number:{mode:"box"}}},{name:"battery_tap_action",label:"Battery Tap Action",selector:{"ui-action":{}}},{name:"battery_soc_entity",label:"Battery SOC (%) Entity",selector:{entity:{domain:"sensor"}}},{name:"invert_battery_data",label:"Invert Battery Data",selector:{boolean:{}}},{name:"invert_battery_view",label:"Invert Battery View",selector:{boolean:{}}},{name:"show_plus",label:"Show + Sign",selector:{boolean:{}}}]}}function ht(g){if(g.load)return g;const t=s=>{const c=g[`${s}_entity`];if(!c)return;const r={entity:c},h=g[`${s}_name`],l=g[`${s}_icon`],u=g[`${s}_min`],d=g[`${s}_max`],y=g[`${s}_tap_action`],f=g[`${s}_hold_action`];return h!==void 0&&(r.name=h),l!==void 0&&(r.icon=l),u!==void 0&&(r.min=u),d!==void 0&&(r.max=d),y!==void 0&&(r.tap=y),f!==void 0&&(r.hold=f),r},e=t("load"),i=t("grid"),n=t("production"),a=t("battery");if(a){const s=g.battery_soc_entity,c=g.invert_battery_data,r=g.invert_battery_view,h=g.show_plus;s!==void 0&&(a.soc_entity=s),(c!==void 0||r!==void 0)&&(a.invert={data:c!==void 0?c:a.invert?.data,view:r!==void 0?r:a.invert?.view}),h!==void 0&&(a.showPlus=h)}const o=g.view_mode||g.mode;return e?{mode:o,load:e,grid:i,production:n,battery:a}:g}function lt(g,t,e,i){const n=g[e];return n?n.name?n.name:n.entity&&t?.states[n.entity]&&t.states[n.entity].attributes.friendly_name||i:i}function Q(g,t,e,i){const n=g[e];return n?n.icon?n.icon:n.entity&&t?.states[n.entity]&&t.states[n.entity].attributes.icon||i:i}function F(g,t,e,i){if(!g)return;const n=e||{action:"more-info"};switch(n.action||"more-info"){case"more-info":const o=n.entity||i;o&&t("hass-more-info",{entityId:o});break;case"navigate":n.path&&(history.pushState(null,"",n.path),t("location-changed",{replace:!1}));break;case"url":n.path&&window.open(n.path);break;case"toggle":i&&g.callService("homeassistant","toggle",{entity_id:i});break;case"call-service":if(n.service){const[s,c]=n.service.split(".");g.callService(s,c,n.service_data||{},n.target)}break}}function B(g,t,e){if(!g||!e){g?.setAttribute("data-width-px","");return}t>=80?g.setAttribute("data-width-px","show-label"):t>=40?g.setAttribute("data-width-px","show-icon"):g.setAttribute("data-width-px","")}class dt{constructor(t,e,i,n,a,o){this.productionColor="#256028",this.batteryColor="#104b79",this.gridColor="#7a211b",this.returnColor="#7a6b1b",this.container=t,this.config=e,this.hass=i,this.viewMode=n,this.getIconCallback=a,this.handleActionCallback=o}render(t){(!this.container.querySelector(".compact-view")||this.lastViewMode!==this.viewMode)&&(this.initializeStructure(),this.attachEventHandlers(),this.lastViewMode=this.viewMode),this.updateSegments(t)}setViewMode(t){this.viewMode!==t&&(this.viewMode=t,this.lastViewMode=void 0)}initializeStructure(){this.container.innerHTML=`
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
            overflow: hidden;
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
        </div>
      </ha-card>
    `}attachEventHandlers(){requestAnimationFrame(()=>{const t=this.container.querySelector("#production-segment"),e=this.container.querySelector("#battery-segment"),i=this.container.querySelector("#grid-segment"),a=this.container.querySelectorAll(".row-value")[0];if(t&&t.addEventListener("click",()=>{this.handleActionCallback(this.config.production?.tap,this.config.production?.entity)}),e&&e.addEventListener("click",()=>{this.handleActionCallback(this.config.battery?.tap,this.config.battery?.entity)}),i&&i.addEventListener("click",()=>{this.handleActionCallback(this.config.grid?.tap,this.config.grid?.entity)}),a&&a.addEventListener("click",()=>{this.handleActionCallback(this.config.load.tap,this.config.load.entity)}),this.viewMode==="compact-battery"){const o=this.container.querySelector("#battery-production-segment"),s=this.container.querySelector("#battery-load-segment"),c=this.container.querySelector("#battery-grid-segment"),r=this.container.querySelector("#battery-soc-left"),h=this.container.querySelector("#battery-soc-right");o&&o.addEventListener("click",()=>{this.handleActionCallback(this.config.production?.tap,this.config.production?.entity)}),s&&s.addEventListener("click",()=>{this.handleActionCallback(this.config.load.tap,this.config.load.entity)}),c&&c.addEventListener("click",()=>{this.handleActionCallback(this.config.grid?.tap,this.config.grid?.entity)}),r&&r.addEventListener("click",()=>{this.handleActionCallback(this.config.battery?.tap,this.config.battery?.entity)}),h&&h.addEventListener("click",()=>{this.handleActionCallback(this.config.battery?.tap,this.config.battery?.entity)})}})}updateSegments(t){const{load:e,flows:i,battery:n,batterySoc:a}=t,o=i.productionToLoad,s=i.batteryToLoad,c=i.gridToLoad,r=e||1,h=o/r*100,l=s/r*100,u=c/r*100,d=h+l+u;let y=h,f=l,p=u;if(d>0){const b=100/d;y=h*b,f=l*b,p=u*b}let m=0,v=0,w=0,C=0,A=0,x=0;if(this.viewMode==="compact-battery"){if(n<0){const _=Math.abs(n)||1;m=i.gridToBattery,w=i.productionToBattery;const M=i.gridToBattery/_*100,k=i.productionToBattery/_*100,P=M+k;if(P>0){const T=100/P;C=M*T,x=k*T}}else if(n>0){const b=n||1,_=n-i.batteryToLoad;v=i.batteryToLoad,m=_;const M=i.batteryToLoad/b*100,k=_/b*100,P=M+k;if(P>0){const T=100/P;A=M*T,C=k*T}}}requestAnimationFrame(()=>{this.updateLoadBar(y,f,p,h,l,u,o,s,c,e),this.viewMode==="compact-battery"&&this.updateBatteryBar(C,A,x,m,v,w,n,a)})}updateLoadBar(t,e,i,n,a,o,s,c,r,h){const l=this.container.querySelector("#production-segment"),u=this.container.querySelector("#battery-segment"),d=this.container.querySelector("#grid-segment"),y=this.container.querySelector("#load-value-text"),f=this.container.querySelector(".bar-container");if(l){l.style.width=`${t}%`;const p=l.querySelector(".bar-segment-label");p&&s>0&&(p.textContent=`${Math.round(n)}%`);const m=t/100*(f?.clientWidth||0);B(l,m,s>0)}if(u){u.style.width=`${e}%`;const p=u.querySelector(".bar-segment-label");p&&c>0&&(p.textContent=`${Math.round(a)}%`);const m=e/100*(f?.clientWidth||0);B(u,m,c>0)}if(d){d.style.width=`${i}%`;const p=d.querySelector(".bar-segment-label");p&&r>0&&(p.textContent=`${Math.round(o)}%`);const m=i/100*(f?.clientWidth||0);B(d,m,r>0)}y&&(y.textContent=String(Math.round(h)))}updateBatteryBar(t,e,i,n,a,o,s,c){const r=this.container.querySelector("#battery-grid-segment"),h=this.container.querySelector("#battery-load-segment"),l=this.container.querySelector("#battery-production-segment"),u=this.container.querySelector("#battery-soc-left"),d=this.container.querySelector("#battery-soc-right"),y=this.container.querySelector("#battery-soc-text-left"),f=this.container.querySelector("#battery-soc-text-right"),m=this.container.querySelectorAll(".bar-container")[1];let v=!1;if(s<0?(v=!0,u&&(u.style.display="none"),d&&(d.style.display="flex"),f&&c!==null&&(f.textContent=c.toFixed(1))):s>0?(v=!1,u&&(u.style.display="flex"),d&&(d.style.display="none"),y&&c!==null&&(y.textContent=c.toFixed(1))):(u&&(u.style.display="none"),d&&(d.style.display="flex"),f&&c!==null&&(f.textContent=c.toFixed(1))),r){const w=v?this.gridColor:this.returnColor;r.style.width=`${t}%`,r.style.background=w;const C=r.querySelector(".bar-segment-label");C&&n>0&&(C.textContent=`${Math.round(n)}W`);const A=t/100*(m?.offsetWidth||0);B(r,A,n>0)}if(h){h.style.width=`${e}%`;const w=h.querySelector(".bar-segment-label");w&&a>0&&(w.textContent=`${Math.round(a)}W`);const C=e/100*(m?.offsetWidth||0);B(h,C,a>0)}if(l){l.style.width=`${i}%`;const w=l.querySelector(".bar-segment-label");w&&o>0&&(w.textContent=`${Math.round(o)}W`);const C=i/100*(m?.offsetWidth||0);B(l,C,o>0)}}}class j{constructor(t,e,i,n,a,o,s,c,r=!1,h=!1,l,u,d){this.id=t,this._value=e,this.min=i,this.max=n,this.bidirectional=a,this.label=o,this.icon=s,this.units=c,this._invertView=r,this.showPlus=h,this.tapAction=l,this.entityId=u,this.fireEventCallback=d,this.element=null,this.radius=50,this.boxWidth=120,this.boxHeight=135,this.boxRadius=16,this.centerX=this.boxWidth/2,this.centerY=this.radius+25,this.offsetX=-this.centerX,this.offsetY=-this.centerY,this.needleState={target:0,current:0,ghost:0},this._lastAnimationTime=null,this._animationFrameId=null,this._updateNeedleAngle()}get value(){return this._value}set value(t){if(this._value!==t&&(this._value=t,this._updateNeedleAngle(),this.element)){const e=this.element.querySelector(`#value-${this.id}`);e&&(e.textContent=this._formatValueText()),this.updateDimming()}}get invertView(){return this._invertView}set invertView(t){if(this._invertView!==t&&(this._invertView=t,this._updateNeedleAngle(),this.element)){const e=this.element.querySelector(`#value-${this.id}`);e&&(e.textContent=this._formatValueText())}}get displayValue(){return this._invertView?-this._value:this._value}_formatValueText(){const t=this.displayValue,e=t.toFixed(0);return t<0?e+" ":t>0&&this.showPlus?"+"+e+" ":e}_updateNeedleAngle(){let t,e;const i=this.displayValue;if(this.bidirectional){const n=this.max-this.min;t=Math.min(Math.max((i-this.min)/n,0),1),e=180-t*180}else t=Math.min(Math.max(i/this.max,0),1),e=180-t*180;this.needleState.target=e}updateDimming(){if(!this.element)return;const t=this.element.querySelector(`#dimmer-${this.id}`);if(t){const e=Math.abs(this.value)<.5;t.setAttribute("opacity",e?"0.3":"0")}}startAnimation(){if(this._animationFrameId)return;const t=e=>{this._lastAnimationTime||(this._lastAnimationTime=e);const i=e-this._lastAnimationTime;if(this._lastAnimationTime=e,!this.element){this._animationFrameId=null;return}const n=this.radius-5,a=Math.min(i/150,1);this.needleState.current+=(this.needleState.target-this.needleState.current)*a;const o=Math.min(i/400,1);this.needleState.ghost+=(this.needleState.current-this.needleState.ghost)*o;const s=10;this.needleState.ghost<this.needleState.current-s?this.needleState.ghost=this.needleState.current-s:this.needleState.ghost>this.needleState.current+s&&(this.needleState.ghost=this.needleState.current+s);const c=this.element.querySelector(`#needle-${this.id}`);if(c){const h=this.needleState.current*Math.PI/180,l=this.centerX+n*Math.cos(h),u=this.centerY-n*Math.sin(h);c.setAttribute("x2",String(l)),c.setAttribute("y2",String(u))}const r=this.element.querySelector(`#ghost-needle-${this.id}`);if(r){const h=this.needleState.ghost*Math.PI/180,l=this.centerX+n*Math.cos(h),u=this.centerY-n*Math.sin(h);r.setAttribute("x2",String(l)),r.setAttribute("y2",String(u))}this._animationFrameId=requestAnimationFrame(t)};this._animationFrameId=requestAnimationFrame(t)}stopAnimation(){this._animationFrameId&&(cancelAnimationFrame(this._animationFrameId),this._animationFrameId=null,this._lastAnimationTime=null)}_handleTapAction(){if(!this.fireEventCallback)return;const t=this.tapAction||{action:"more-info"};switch(t.action||"more-info"){case"more-info":const i=t.entity||this.entityId;i&&this.fireEventCallback("hass-more-info",{entityId:i});break;case"navigate":t.path&&(history.pushState(null,"",t.path),this.fireEventCallback("location-changed",{replace:!1}));break;case"url":t.path&&window.open(t.path);break;case"toggle":this.entityId&&this.fireEventCallback("call-service",{domain:"homeassistant",service:"toggle",service_data:{entity_id:this.entityId}});break;case"call-service":if(t.service){const[n,a]=t.service.split(".");this.fireEventCallback("call-service",{domain:n,service:a,service_data:t.service_data||{},target:t.target})}break}}createElement(){const t=this.displayValue;let e,i;if(this.bidirectional){const _=this.max-this.min;e=Math.min(Math.max((t-this.min)/_,0),1),i=180-e*180}else e=Math.min(Math.max(t/this.max,0),1),i=180-e*180;this.needleState.target=i,this.needleState.current=i,this.needleState.ghost=i;const a=(this.bidirectional?[this.min,0,this.max]:[0,this.max/2,this.max]).map(_=>{const P=(180-(this.bidirectional?(_-this.min)/(this.max-this.min):_/this.max)*180)*Math.PI/180,T=this.radius,z=this.radius-8,W=this.centerX+T*Math.cos(P),L=this.centerY-T*Math.sin(P),S=this.centerX+z*Math.cos(P),R=this.centerY-z*Math.sin(P);return`<line x1="${W}" y1="${L}" x2="${S}" y2="${R}" stroke="rgb(160, 160, 160)" stroke-width="2" />`}).join(""),c=(180-(this.bidirectional?(0-this.min)/(this.max-this.min):0)*180)*Math.PI/180,r=this.centerX,h=this.centerY,l=this.centerX+this.radius*Math.cos(c),u=this.centerY-this.radius*Math.sin(c),d=`<line x1="${r}" y1="${h}" x2="${l}" y2="${u}" stroke="rgb(100, 100, 100)" stroke-width="2" />`,y=i*Math.PI/180,f=this.radius-5,p=this.centerX+f*Math.cos(y),m=this.centerY-f*Math.sin(y),v=this.centerY+5,w=this.centerY+this.radius*.5,C=this.centerY+this.radius*.7,A=`
      <g transform="translate(${this.offsetX}, ${this.offsetY})">
        <defs>
          <clipPath id="clip-${this.id}-local">
            <rect x="0" y="0" width="${this.boxWidth}" height="${v+2}" />
          </clipPath>
        </defs>
        
        <rect x="0" y="0" width="${this.boxWidth}" height="${this.boxHeight}" rx="${this.boxRadius}" ry="${this.boxRadius}" fill="rgb(40, 40, 40)" filter="url(#drop-shadow)" />
        
        <g clip-path="url(#clip-${this.id}-local)">
          <circle cx="${this.centerX}" cy="${this.centerY}" r="${this.radius}" fill="rgb(70, 70, 70)" />
          ${d}
        </g>
        
        ${a}
        
        <circle cx="${this.centerX}" cy="${this.centerY}" r="${this.radius}" fill="none" stroke="rgb(160, 160, 160)" stroke-width="2" />
        
        <text x="${this.centerX}" y="15" text-anchor="middle" font-size="12" fill="rgb(255, 255, 255)" font-weight="500">${this.label}</text>
        
        <!-- Icon rendered via foreignObject (for extraction source) -->
        <foreignObject id="icon-source-${this.id}" x="${this.centerX-18}" y="${this.centerY-42}" width="36" height="36">
          <div xmlns="http://www.w3.org/1999/xhtml" style="width: 36px; height: 36px;">
            <ha-icon icon="${this.icon}" style="--mdc-icon-size: 36px; color: rgb(160, 160, 160);"></ha-icon>
          </div>
        </foreignObject>
        
        <!-- Icon rendered as native SVG path (populated after extraction, will overlay) -->
        <g id="icon-display-${this.id}" transform="translate(${this.centerX-18}, ${this.centerY-42}) scale(1.5)">
          <!-- Path will be inserted here by _extractIconPaths -->
        </g>
        
        <line id="ghost-needle-${this.id}" x1="${this.centerX}" y1="${this.centerY}" x2="${p}" y2="${m}" stroke="rgb(255, 255, 255)" stroke-width="4" stroke-linecap="round" opacity="0.3" />
        
        <line id="needle-${this.id}" x1="${this.centerX}" y1="${this.centerY}" x2="${p}" y2="${m}" stroke="rgb(255, 255, 255)" stroke-width="4" stroke-linecap="round" />
        
        <circle cx="${this.centerX}" cy="${this.centerY}" r="5" fill="rgb(255, 255, 255)" />
        
        <text id="value-${this.id}" x="${this.centerX}" y="${w}" text-anchor="middle" font-size="16" fill="rgb(255, 255, 255)" font-weight="600">${this._formatValueText()}</text>
        
        <text x="${this.centerX}" y="${C}" text-anchor="middle" font-size="8" fill="rgb(160, 160, 160)" font-weight="400" letter-spacing="0.5">${this.units}</text>
        
        <rect id="dimmer-${this.id}" x="0" y="0" width="${this.boxWidth}" height="${this.boxHeight}" rx="${this.boxRadius}" ry="${this.boxRadius}" fill="black" opacity="0" pointer-events="none" style="transition: opacity 0.8s ease-in-out;" />
      </g>
    `,x=document.createElementNS("http://www.w3.org/2000/svg","svg");x.innerHTML=A;const b=x.firstElementChild;return this.element=b,(!this.tapAction||this.tapAction.action!=="none")&&(b.style.cursor="pointer",b.addEventListener("click",_=>{this._handleTapAction(),_.stopPropagation()}),b.addEventListener("mouseenter",()=>{b.style.filter="brightness(1.1)"}),b.addEventListener("mouseleave",()=>{b.style.filter=""})),b}}class ut{constructor(t,e,i,n,a,o,s,c){this.group=t,this.flowId=e,this.speedMultiplier=s,this.dotsPerFlow=c,this.dots=[],this.dotStates=[],this.pathLength=0;const r=(i.x+n.x)/2,h=(i.y+n.y)/2;this.pathData=`M ${i.x},${i.y} Q ${r},${h} ${n.x},${n.y}`;const{opacity:l,strokeWidth:u,dotRadius:d}=this.calculateStyles(a),y=this.calculateVelocity(a);this.glowPath=document.createElementNS("http://www.w3.org/2000/svg","path"),this.glowPath.setAttribute("d",this.pathData),this.glowPath.setAttribute("class","flow-line"),this.glowPath.setAttribute("stroke",o),this.glowPath.setAttribute("stroke-opacity",String(l*.5)),this.glowPath.setAttribute("stroke-width",String(u*2)),this.glowPath.setAttribute("fill","none"),this.glowPath.setAttribute("stroke-linecap","round"),this.glowPath.setAttribute("style","transition: stroke-opacity 0.5s ease-out, stroke-width 0.5s ease-out;"),this.glowPath.id=`glow-${e}`,this.group.appendChild(this.glowPath),this.mainPath=document.createElementNS("http://www.w3.org/2000/svg","path"),this.mainPath.setAttribute("d",this.pathData),this.mainPath.setAttribute("class","flow-line"),this.mainPath.setAttribute("stroke",o),this.mainPath.setAttribute("stroke-opacity",String(l)),this.mainPath.setAttribute("stroke-width",String(u)),this.mainPath.setAttribute("fill","none"),this.mainPath.setAttribute("stroke-linecap","round"),this.mainPath.setAttribute("style","transition: stroke-opacity 0.5s ease-out, stroke-width 0.5s ease-out;"),this.mainPath.id=`path-${e}`,this.group.appendChild(this.mainPath),this.pathLength=this.mainPath.getTotalLength();for(let f=0;f<this.dotsPerFlow;f++){const p=document.createElementNS("http://www.w3.org/2000/svg","circle");p.setAttribute("class","flow-dot"),p.setAttribute("id",`dot-${e}-${f}`),p.setAttribute("r",String(d)),p.setAttribute("fill",o),p.setAttribute("opacity",String(l)),p.setAttribute("style","transition: opacity 0.5s ease-out, r 0.5s ease-out;"),this.group.appendChild(p),this.dots.push(p);const m=f/this.dotsPerFlow;this.dotStates.push({progress:m,velocity:y});const v=this.mainPath.getPointAtLength(m*this.pathLength);p.setAttribute("cx",String(v.x)),p.setAttribute("cy",String(v.y))}}calculateStyles(t){let e;t<=100?e=.25:t<=200?e=.25+(t-100)/100*.75:e=1;const i=2,n=23.76,a=1e4;let o;if(t<=100)o=i;else{const l=Math.min((t-100)/(a-100),1)*(n-i);o=i+l}const s=2.5,c=3,r=s*(o/i),h=Math.max(r,c);return{opacity:e,strokeWidth:o,dotRadius:h}}calculateVelocity(t){const e=40*(t/1e3)*this.speedMultiplier;return this.pathLength>0?e/this.pathLength:0}update(t,e){const{opacity:i,strokeWidth:n,dotRadius:a}=this.calculateStyles(t),o=this.calculateVelocity(t);this.glowPath.setAttribute("stroke",e),this.glowPath.setAttribute("stroke-opacity",String(i*.5)),this.glowPath.setAttribute("stroke-width",String(n*2)),this.mainPath.setAttribute("stroke",e),this.mainPath.setAttribute("stroke-opacity",String(i)),this.mainPath.setAttribute("stroke-width",String(n)),this.dots.forEach((s,c)=>{s.setAttribute("r",String(a)),s.setAttribute("opacity",String(i)),s.setAttribute("fill",e),this.dotStates[c].velocity=o})}animate(t){this.dotStates.forEach((e,i)=>{if(e.velocity>0){e.progress+=e.velocity*(t/1e3),e.progress>=1&&(e.progress=e.progress%1);try{if(this.pathLength>0){const n=this.mainPath.getPointAtLength(e.progress*this.pathLength);this.dots[i].setAttribute("cx",String(n.x)),this.dots[i].setAttribute("cy",String(n.y))}}catch{}}})}fadeOut(t){this.glowPath.setAttribute("stroke-opacity","0"),this.mainPath.setAttribute("stroke-opacity","0"),this.dots.forEach(e=>e.setAttribute("opacity","0")),setTimeout(t,500)}}class J{constructor(t,e){this.container=t,this.positions=e,this.flowLines=new Map,this.animationFrameId=null,this.lastAnimationTime=null,this.speedMultiplier=.8,this.dotsPerFlow=3,this.animate=()=>{const i=performance.now(),n=this.lastAnimationTime?i-this.lastAnimationTime:0;this.lastAnimationTime=i,this.flowLines.forEach(a=>{a.animate(n)}),this.animationFrameId=requestAnimationFrame(this.animate)}}updateFlows(t){const e=this.container.querySelector("#flow-layer");if(!e)return;const i=0,n=10;this.updateOrCreateFlow(e,"production-to-load",this.positions.production,this.positions.load,t.productionToLoad,"#4caf50",i),this.updateOrCreateFlow(e,"production-to-battery",this.positions.production,this.positions.battery,t.productionToBattery,"#4caf50",i),this.updateOrCreateFlow(e,"battery-to-load",this.positions.battery,this.positions.load,t.batteryToLoad,"#2196f3",n),this.updateOrCreateFlow(e,"grid-to-load",this.positions.grid,this.positions.load,t.gridToLoad,"#f44336",i),this.updateOrCreateFlow(e,"grid-to-battery",this.positions.grid,this.positions.battery,t.gridToBattery,"#f44336",i),this.updateOrCreateFlow(e,"production-to-grid",this.positions.production,this.positions.grid,t.productionToGrid,"#ffeb3b",i)}start(){this.animationFrameId||(this.lastAnimationTime=performance.now(),this.animate())}stop(){this.animationFrameId&&(cancelAnimationFrame(this.animationFrameId),this.animationFrameId=null,this.lastAnimationTime=null)}clear(){this.stop(),this.flowLines.clear();const t=this.container.querySelector("#flow-layer");t&&(t.innerHTML="")}updateOrCreateFlow(t,e,i,n,a,o,s){const c=this.flowLines.get(e);if(a<=s){c&&this.fadeOutFlow(t,e);return}c?c.update(a,o):this.drawFlow(t,e,i,n,a,o)}drawFlow(t,e,i,n,a,o){const s=document.createElementNS("http://www.w3.org/2000/svg","g");s.setAttribute("id",e),t.appendChild(s);const c=new ut(s,e,i,n,a,o,this.speedMultiplier,this.dotsPerFlow);this.flowLines.set(e,c)}removeFlow(t,e){const i=t.querySelector(`#${e}`);i&&(i.remove(),this.flowLines.delete(e))}fadeOutFlow(t,e){const i=this.flowLines.get(e);i&&i.fadeOut(()=>{this.removeFlow(t,e)})}}class gt{constructor(t,e,i,n,a,o){this.container=t,this.config=e,this.hass=i,this.getDisplayNameCallback=n,this.getIconCallback=a,this.fireEventCallback=o,this.meters=new Map,this.iconsExtracted=!1,this.iconExtractionTimeouts=new Set,this.iconCache=new Map,this.canvasWidth=500,this.canvasHeight=470;const s=5,c=3;this.meterPositions={production:{x:60+s,y:80+c},battery:{x:130+s,y:240+c},grid:{x:60+s,y:400+c},load:{x:360+s,y:240+c}}}render(t){const{grid:e,load:i,production:n,battery:a,flows:o}=t,s=this.config.grid?.min??-5e3,c=this.config.grid?.max??5e3,r=this.config.load.max??5e3,h=this.config.production?.max??5e3,l=this.config.battery?.min??-5e3,u=this.config.battery?.max??5e3;if(!this.container.querySelector(".energy-flow-svg"))this.iconsExtracted=!1,this.initializeStructure(e,i,n,a,s,c,r,h,l,u),this.iconsExtracted||requestAnimationFrame(()=>{this.extractIconPaths()});else{const d=this.meters.get("production"),y=this.meters.get("battery"),f=this.meters.get("grid"),p=this.meters.get("load");if(d&&(d.value=n),y&&(y.invertView=this.config.battery?.invert?.view??!1,y.value=a),f&&(f.value=e),p&&(p.value=i),!this.flowRenderer){const m=this.container.querySelector(".energy-flow-svg");m&&(this.flowRenderer=new J(m,this.meterPositions),this.flowRenderer.start())}}this.flowRenderer&&this.flowRenderer.updateFlows(o)}stop(){this.flowRenderer&&this.flowRenderer.stop(),this.meters.forEach(t=>t.stopAnimation()),this.iconExtractionTimeouts.forEach(t=>clearTimeout(t)),this.iconExtractionTimeouts.clear()}clear(){this.stop(),this.flowRenderer&&this.flowRenderer.clear()}initializeStructure(t,e,i,n,a,o,s,c,r,h){const l=new j("production",i,0,c,!1,this.getDisplayNameCallback("production","Production"),this.getIconCallback("production","mdi:solar-power"),"WATTS",!1,!1,this.config.production?.tap,this.config.production?.entity,this.fireEventCallback),u=new j("battery",n,r,h,!0,this.getDisplayNameCallback("battery","Battery"),this.getIconCallback("battery","mdi:battery"),"WATTS",this.config.battery?.invert?.view,this.config.battery?.showPlus,this.config.battery?.tap,this.config.battery?.entity,this.fireEventCallback),d=new j("grid",t,a,o,!0,this.getDisplayNameCallback("grid","Grid"),this.getIconCallback("grid","mdi:transmission-tower"),"WATTS",!1,!1,this.config.grid?.tap,this.config.grid?.entity,this.fireEventCallback),y=new j("load",e,0,s,!1,this.getDisplayNameCallback("load","Load"),this.getIconCallback("load","mdi:home-lightning-bolt"),"WATTS",!1,!1,this.config.load.tap,this.config.load.entity,this.fireEventCallback);this.container.innerHTML=`
      <ha-card>
        <style>
          :host {
            display: block;
            width: 100%;
            height: 100%;
          }
          ha-card {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
            padding: 8px;
            box-sizing: border-box;
            overflow: hidden;
          }
          .svg-wrapper {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          svg.energy-flow-svg {
            display: block;
            width: 100%;
            height: 100%;
          }
          .flow-line {
            fill: none;
            stroke-linecap: round;
          }
          .flow-positive { stroke: var(--success-color, #4caf50); }
          .flow-negative { stroke: var(--error-color, #f44336); }
          .flow-dot {
            offset-path: attr(data-path);
            offset-distance: 0%;
            animation: flow-move var(--flow-duration, 2s) linear infinite;
          }
          @keyframes flow-move {
            from { offset-distance: 0%; }
            to { offset-distance: 100%; }
          }
        </style>
        <div class="svg-wrapper">
          <svg class="energy-flow-svg" viewBox="0 0 ${this.canvasWidth} ${this.canvasHeight}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
            <defs>
              ${this.createMeterDefs()}
            </defs>
            
            <!-- Flow lines layer (behind meters) -->
            <g id="flow-layer"></g>
            
            <!-- Production Meter (top left) -->
            <g id="production-meter" class="meter-group" transform="translate(${this.meterPositions.production.x}, ${this.meterPositions.production.y})"></g>
            
            <!-- Battery Meter (middle left, offset right) -->
            <g id="battery-meter" class="meter-group" transform="translate(${this.meterPositions.battery.x}, ${this.meterPositions.battery.y})"></g>
            
            <!-- Grid Meter (bottom left) -->
            <g id="grid-meter" class="meter-group" transform="translate(${this.meterPositions.grid.x}, ${this.meterPositions.grid.y})"></g>
            
            <!-- Load Meter (right, 2x size) -->
            <g id="load-meter" class="meter-group" transform="translate(${this.meterPositions.load.x}, ${this.meterPositions.load.y}) scale(2)"></g>
          </svg>
        </div>
      </ha-card>
    `,requestAnimationFrame(()=>{const f=this.container.querySelector("#production-meter"),p=this.container.querySelector("#battery-meter"),m=this.container.querySelector("#grid-meter"),v=this.container.querySelector("#load-meter");f&&f.appendChild(l.createElement()),p&&p.appendChild(u.createElement()),m&&m.appendChild(d.createElement()),v&&v.appendChild(y.createElement()),this.meters.set("production",l),this.meters.set("battery",u),this.meters.set("grid",d),this.meters.set("load",y),l.startAnimation(),u.startAnimation(),d.startAnimation(),y.startAnimation(),l.updateDimming(),u.updateDimming(),d.updateDimming(),y.updateDimming();const w=this.container.querySelector(".energy-flow-svg");w&&!this.flowRenderer&&(this.flowRenderer=new J(w,this.meterPositions),this.flowRenderer.start())})}createMeterDefs(){return`
      <!-- Glow filter for flow lines -->
      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
        <feFlood flood-color="currentColor" flood-opacity="0.5" result="flood" />
        <feComposite in="flood" in2="blur" operator="in" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      
      <!-- Drop shadow filter for meters -->
      <filter id="drop-shadow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur" />
        <feOffset in="blur" dx="0" dy="2" result="offsetBlur" />
        <feComponentTransfer in="offsetBlur" result="shadow">
          <feFuncA type="linear" slope="0.4" />
        </feComponentTransfer>
        <feMerge>
          <feMergeNode in="shadow" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    `}extractIconPaths(){["production","battery","grid","load"].forEach(async e=>{const i=this.container.querySelector(`#icon-${e}`),n=this.container.querySelector(`#ha-icon-${e}`);if(i&&n){const a=n.getAttribute("icon")||"unknown",o=this.iconCache.get(a);if(o){this.renderIconPath(i,o);return}const s=await this.extractIconPath(n,a);this.renderIconPath(i,s)}}),this.iconsExtracted=!0}async extractIconPath(t,e,i=10){return new Promise(n=>{const a=(o=1,s=i)=>{const c=o===1?0:100*o,r=window.setTimeout(async()=>{try{const h=t.shadowRoot;if(!h){o<s?a(o+1,s):n(null);return}const l=h.querySelector("svg");if(!l){o<s?a(o+1,s):n(null);return}const u=l.querySelector("path");if(u){const d=u.getAttribute("d");d&&this.iconCache&&this.iconCache.set(e,d),n(d)}else o<s?a(o+1,s):n(null)}catch(h){console.error(`Failed to extract icon path for ${e} (attempt ${o}):`,h),o<s?a(o+1,s):n(null)}},c);this.iconExtractionTimeouts.add(r)};a()})}renderIconPath(t,e){if(t.innerHTML="",e){const i=document.createElementNS("http://www.w3.org/2000/svg","path");i.setAttribute("d",e),i.setAttribute("fill","rgb(160, 160, 160)"),i.setAttribute("transform","scale(1)"),t.appendChild(i)}else{const i=document.createElementNS("http://www.w3.org/2000/svg","circle");i.setAttribute("cx","12"),i.setAttribute("cy","12"),i.setAttribute("r","8"),i.setAttribute("fill","rgb(160, 160, 160)"),t.appendChild(i)}}}function K(g,t,e){const i=[];for(let a=0;a<=4;a++){const o=e.top+a*t/4;i.push(`<line x1="${e.left}" y1="${o}" x2="${e.left+g}" y2="${o}" stroke="white" stroke-width="1" />`)}return i.join(`
`)}function tt(g,t,e,i){const n=[],o=new Date;for(let s=0;s<=6;s++){const c=i-s*i/6,r=new Date(o.getTime()-c*60*60*1e3),h=r.getMinutes(),l=h<15?0:h<45?30:0,u=h>=45?1:0;r.setMinutes(l),r.setSeconds(0),r.setMilliseconds(0),u&&r.setHours(r.getHours()+u);const d=e.left+s*g/6,y=e.top+t+20,f=r.getHours(),p=f===0?12:f>12?f-12:f,m=f>=12?"PM":"AM";n.push(`
      <text x="${d}" y="${y}" text-anchor="middle" fill="rgb(160, 160, 160)" font-size="11">
        ${p} ${m}
      </text>
    `)}return n.join(`
`)}function et(g,t,e,i,n,a){const o=[];return o.push(`<text x="${e.left-10}" y="${e.top+5}" text-anchor="end" fill="rgb(160, 160, 160)" font-size="11">${Math.round(i)}W</text>`),o.push(`<text x="${e.left-10}" y="${a+5}" text-anchor="end" fill="rgb(160, 160, 160)" font-size="11">0</text>`),o.push(`<text x="${e.left-10}" y="${a+t+5}" text-anchor="end" fill="rgb(160, 160, 160)" font-size="11">-${Math.round(n)}W</text>`),o.join(`
`)}function Y(g,t,e,i,n,a,o,s){const c=[],r=[];let h=!1;if(g.forEach((u,d)=>{const y=n.left+d*t,f=a(u),p=typeof o=="function"?o(u):o;f>0&&(h=!0);const m=s==="down"?-(f+p)*i:(f+p)*i,v=s==="down"?-p*i:p*i;c.push({x:y,y:e+m}),r.push({x:y,y:e+v})}),!h)return null;let l=`M ${c[0].x} ${c[0].y}`;for(let u=1;u<c.length;u++)l+=` L ${c[u].x} ${c[u].y}`;for(let u=r.length-1;u>=0;u--)l+=` L ${r[u].x} ${r[u].y}`;return l+=" Z",l}function it(g,t,e,i,n,a){if(!g||g.length===0)return"";const o=g.length>1?t/(g.length-1):0;return`<path d="${g.map((c,r)=>{const h=n.left+r*o,l=a-c.load*i;return`${r===0?"M":"L"} ${h},${l}`}).join(" ")}" fill="none" stroke="#CCCCCC" stroke-width="3" opacity="0.9" />`}class pt{constructor(t,e,i){this.iconCache=new Map,this.chartRenderPending=!1,this.lastIndicatorUpdate=0,this.hass=t,this.config=e,this.fireEvent=i}updateLiveValues(t){this.liveChartValues=t}render(t){t.querySelector(".chart-view")?this.liveChartValues&&this.throttledUpdateChartIndicators(t):this.initializeChartStructure(t)}initializeChartStructure(t){t.innerHTML=`
      <ha-card>
        <style>
          :host {
            display: block;
            width: 100%;
            height: 100%;
          }
          ha-card {
            padding: 0;
            box-sizing: border-box;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
          }
          .chart-view {
            display: flex;
            flex-direction: column;
            width: 100%;
            flex: 1;
            min-height: 0;
          }
          .chart-container {
            flex: 1;
            position: relative;
            min-height: 200px;
            overflow: hidden;
          }
          svg.chart-svg {
            width: 100%;
            height: 100%;
          }
          .loading-message {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: rgb(160, 160, 160);
            font-size: 14px;
          }
        </style>
        <div class="chart-view">
          <div class="chart-container">
            <div class="loading-message">Loading history data...</div>
            <svg class="chart-svg" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid meet">
              <!-- Chart will be rendered here -->
            </svg>
          </div>
        </div>
      </ha-card>
    `;const e=t.querySelector(".chart-svg");e&&setTimeout(()=>{this.fetchAndRenderChart(e,12)},100)}throttledUpdateChartIndicators(t){this.indicatorUpdateTimeout&&(clearTimeout(this.indicatorUpdateTimeout),this.indicatorUpdateTimeout=void 0);const e=Date.now(),i=e-this.lastIndicatorUpdate,n=250;if(i>=n){const a=t.querySelector(".chart-svg");a&&this.updateChartIndicators(a),this.lastIndicatorUpdate=e}else{const a=n-i;this.indicatorUpdateTimeout=window.setTimeout(()=>{const o=t.querySelector(".chart-svg");o&&this.updateChartIndicators(o),this.lastIndicatorUpdate=Date.now(),this.indicatorUpdateTimeout=void 0},a)}}cleanup(){this.indicatorUpdateTimeout&&(clearTimeout(this.indicatorUpdateTimeout),this.indicatorUpdateTimeout=void 0),this.chartDataCache=void 0}hideLoading(t){const i=t.parentElement?.querySelector(".loading-message");i&&(i.style.display="none")}getIcon(t,e,i){const n=this.config[t];if(n)return n;const a=this.config[e];if(a&&this.hass.states[a]){const o=this.hass.states[a].attributes.icon;if(o)return o}return i}async fetchAndRenderChart(t,e=12){if(this.chartRenderPending)return;const i=Date.now(),n=this.chartDataCache?i-this.chartDataCache.timestamp:1/0,a=300*1e3;if(this.chartDataCache&&n>=a&&(this.chartDataCache=void 0),this.chartDataCache&&n<a){requestAnimationFrame(()=>{this.renderChartFromCache(t)});return}this.chartRenderPending=!0;const o=new Date,s=new Date(o.getTime()-e*60*60*1e3);try{const[c,r,h,l]=await Promise.all([this.fetchHistory(this.config.production_entity,s,o),this.fetchHistory(this.config.grid_entity,s,o),this.fetchHistory(this.config.load_entity,s,o),this.fetchHistory(this.config.battery_entity,s,o)]),u=()=>{this.drawStackedAreaChart(t,c,r,h,l,e),this.chartRenderPending=!1};"requestIdleCallback"in window?window.requestIdleCallback(u,{timeout:2e3}):setTimeout(u,0)}catch(c){console.error("Error fetching chart data:",c),this.chartRenderPending=!1,t.innerHTML=`
        <text x="400" y="200" text-anchor="middle" fill="rgb(160, 160, 160)" font-size="14">
          Error loading chart data
        </text>
      `,this.hideLoading(t)}}async fetchHistory(t,e,i){const n=`history/period/${e.toISOString()}?filter_entity_id=${t}&end_time=${i.toISOString()}&minimal_response&no_attributes`,a=await this.hass.callApi("GET",n);return a&&a.length>0?a[0]:[]}renderChartFromCache(t){if(!this.chartDataCache)return;const e=this.chartDataCache.dataPoints,i=Math.max(...e.map(x=>x.solar+x.batteryDischarge+x.gridImport),...e.map(x=>x.load)),n=Math.max(...e.map(x=>x.batteryCharge+x.gridExport)),a=i+n,o=a>0?i/a:.5,s=a>0?n/a:.5,c=800,r=400,h={top:20,right:150,bottom:40,left:60},l=c-h.left-h.right,u=r-h.top-h.bottom,d=u*o,y=u*s,f=i>0?d/(i*1.1):1,p=n>0?y/(n*1.1):1,m=h.top+d,v=this.createStackedPaths(e,l,d,f,h,"supply",m),w=this.createStackedPaths(e,l,y,p,h,"demand",m),C=it(e,l,d,f,h,m),A=`
      <g opacity="0.1">
        ${K(l,u,h)}
      </g>
      <line x1="${h.left}" y1="${m}" x2="${h.left+l}" y2="${m}" stroke="rgb(160, 160, 160)" stroke-width="1" stroke-dasharray="4,4" />
      ${w}
      ${v}
      ${tt(l,u,h,12)}
      ${et(d,y,h,i,n,m)}
    `;t.innerHTML=A,this.updateChartIndicators(t),this.addLoadLineOnTop(t,C),this.hideLoading(t)}async drawStackedAreaChart(t,e,i,n,a,o){const r={top:20,right:150,bottom:40,left:60},h=800-r.left-r.right,l=400-r.top-r.bottom,d=o*120,f=o*12,p=10,m=new Date,v=Math.floor(m.getMinutes()/5)*5,w=new Date(m.getFullYear(),m.getMonth(),m.getDate(),m.getHours(),v,0,0),C=new Date(w.getTime()-o*60*60*1e3),A=240,x=[];for(let $=0;$<d;$+=A){const Z=Math.min($+A,d);$>0&&await new Promise(q=>setTimeout(q,0));for(let q=$;q<Z;q++){const D=new Date(C.getTime()+q*30*1e3),H=this.interpolateValue(e,D),G=this.interpolateValue(i,D),U=this.interpolateValue(n,D);let O=this.interpolateValue(a,D);this.config.invert_battery_data&&(O=-O),x.push({time:D,solar:Math.max(0,H),batteryDischarge:Math.max(0,O),batteryCharge:Math.max(0,-O),gridImport:Math.max(0,G),gridExport:Math.max(0,-G),load:Math.max(0,U)})}}const b=[];for(let $=0;$<f;$++){const Z=new Date(C.getTime()+($+1)*5*60*1e3),q=$*p,D=Math.min(q+p,x.length),H=D-q;let G=0,U=0,O=0,at=0,ot=0,st=0;for(let V=q;V<D;V++)G+=x[V].solar,U+=x[V].batteryDischarge,O+=x[V].batteryCharge,at+=x[V].gridImport,ot+=x[V].gridExport,st+=x[V].load;b.push({time:Z,solar:G/H,batteryDischarge:U/H,batteryCharge:O/H,gridImport:at/H,gridExport:ot/H,load:st/H})}this.chartDataCache={timestamp:Date.now(),dataPoints:b};const _=Math.max(...b.map($=>$.solar+$.batteryDischarge+$.gridImport),...b.map($=>$.load)),M=Math.max(...b.map($=>$.batteryCharge+$.gridExport)),k=_+M,P=k>0?_/k:.5,T=k>0?M/k:.5,z=_>0?l*P/(_*1.1):1,W=M>0?l*T/(M*1.1):1,L=Math.min(z,W),S=_*L*1.1,R=M*L*1.1,E=r.top+S,I=this.createStackedPaths(b,h,S,L,r,"supply",E),N=this.createStackedPaths(b,h,R,L,r,"demand",E),X=it(b,h,S,L,r,E),mt=`
      <g opacity="0.1">
        ${K(h,l,r)}
      </g>
      <line x1="${r.left}" y1="${E}" x2="${r.left+h}" y2="${E}" stroke="rgb(160, 160, 160)" stroke-width="1" stroke-dasharray="4,4" />
      ${N}
      ${I}
      ${tt(h,l,r,o)}
      ${et(S,R,r,_,M,E)}
      ${this.createChartIconSources()}
    `;t.innerHTML=mt,this.hideLoading(t),this.attachChartAreaClickHandlers(t),requestAnimationFrame(()=>{requestAnimationFrame(()=>{requestAnimationFrame(()=>{this.extractChartIcons(t,b,h,S,R,L,L,r,E),requestAnimationFrame(()=>{this.addLoadLineOnTop(t,X)})})})})}interpolateValue(t,e){if(t.length===0)return 0;let i=t[0],n=Math.abs(new Date(t[0].last_changed).getTime()-e.getTime());for(const a of t){const o=Math.abs(new Date(a.last_changed).getTime()-e.getTime());o<n&&(n=o,i=a)}return parseFloat(i.state)||0}createStackedPaths(t,e,i,n,a,o,s){const c=t.length,r=e/(c-1);if(o==="supply"){const h=Y(t,r,s,n,a,d=>d.solar,0,"down"),l=Y(t,r,s,n,a,d=>d.batteryDischarge,d=>d.solar,"down"),u=Y(t,r,s,n,a,d=>d.gridImport,d=>d.solar+d.batteryDischarge,"down");return`
        ${u?`<path id="chart-area-grid-import" d="${u}" fill="#c62828" opacity="0.8" style="cursor: pointer;" />`:""}
        ${l?`<path id="chart-area-battery-discharge" d="${l}" fill="#1976d2" opacity="0.8" style="cursor: pointer;" />`:""}
        ${h?`<path id="chart-area-solar" d="${h}" fill="#388e3c" opacity="0.85" style="cursor: pointer;" />`:""}
      `}else{const h=Y(t,r,s,n,a,u=>u.batteryCharge,0,"up"),l=Y(t,r,s,n,a,u=>u.gridExport,u=>u.batteryCharge,"up");return`
        ${l?`<path id="chart-area-grid-export" d="${l}" fill="#f9a825" opacity="0.8" style="cursor: pointer;" />`:""}
        ${h?`<path id="chart-area-battery-charge" d="${h}" fill="#1976d2" opacity="0.8" style="cursor: pointer;" />`:""}
      `}}createChartIconSources(){const t=this.getIcon("load_icon","load_entity","mdi:home-lightning-bolt"),e=this.getIcon("production_icon","production_entity","mdi:solar-power"),i=this.getIcon("battery_icon","battery_entity","mdi:battery"),n=this.getIcon("grid_icon","grid_entity","mdi:transmission-tower");return`
      <foreignObject id="chart-icon-source-load" x="-100" y="-100" width="24" height="24">
        <div xmlns="http://www.w3.org/1999/xhtml">
          <ha-icon icon="${t}"></ha-icon>
        </div>
      </foreignObject>
      <foreignObject id="chart-icon-source-solar" x="-100" y="-100" width="24" height="24">
        <div xmlns="http://www.w3.org/1999/xhtml">
          <ha-icon icon="${e}"></ha-icon>
        </div>
      </foreignObject>
      <foreignObject id="chart-icon-source-battery" x="-100" y="-100" width="24" height="24">
        <div xmlns="http://www.w3.org/1999/xhtml">
          <ha-icon icon="${i}"></ha-icon>
        </div>
      </foreignObject>
      <foreignObject id="chart-icon-source-grid" x="-100" y="-100" width="24" height="24">
        <div xmlns="http://www.w3.org/1999/xhtml">
          <ha-icon icon="${n}"></ha-icon>
        </div>
      </foreignObject>
    `}async extractChartIcons(t,e,i,n,a,o,s,c,r){if(e.length===0)return;const h=["load","solar","battery","grid"],l={};for(const u of h){const d=t.querySelector(`#chart-icon-source-${u}`);if(!d)continue;const y=d.querySelector("div");if(!y)continue;const f=y.querySelector("ha-icon");if(!f)continue;const p=f.getAttribute("icon");if(!p)continue;if(this.iconCache.has(p)){l[u]=this.iconCache.get(p)||null;continue}const m=await this.extractIconPath(f,p);l[u]=m,m&&this.iconCache.set(p,m)}this.renderChartIndicators(t,e,i,n,a,o,s,c,l,r)}async extractIconPath(t,e,i=10){for(let n=0;n<i;n++){try{const a=t.shadowRoot;if(!a){await new Promise(r=>setTimeout(r,100));continue}let o=a.querySelector("svg");if(!o){const r=a.querySelector("ha-svg-icon");r&&r.shadowRoot&&(o=r.shadowRoot.querySelector("svg"))}if(!o){await new Promise(r=>setTimeout(r,100));continue}const s=o.querySelector("path");if(!s){await new Promise(r=>setTimeout(r,100));continue}const c=s.getAttribute("d");if(c)return c}catch(a){console.error(`Failed to extract icon path for ${e} (attempt ${n+1}):`,a)}await new Promise(a=>setTimeout(a,100))}return null}renderChartIndicators(t,e,i,n,a,o,s,c,r,h){let l=t.querySelector("#chart-indicators");const u=!l;l||(l=document.createElementNS("http://www.w3.org/2000/svg","g"),l.setAttribute("id","chart-indicators"),t.appendChild(l)),u&&t.querySelectorAll('[id^="chart-icon-source-"]').forEach(_=>_.remove());let d;if(this.liveChartValues){const{grid:b,load:_,production:M,battery:k}=this.liveChartValues;d={load:Math.max(0,_),solar:Math.max(0,M),batteryDischarge:Math.max(0,k),batteryCharge:Math.max(0,-k),gridImport:Math.max(0,b),gridExport:Math.max(0,-b)}}else d=e[e.length-1];const y=c.left+i,f=h-d.load*o,p=h-d.solar*o,m=h-(d.solar+d.batteryDischarge)*o,v=h-(d.solar+d.batteryDischarge+d.gridImport)*o,w=h+d.batteryCharge*s,C=h+(d.batteryCharge+d.gridExport)*s,A=b=>`${Math.round(b)} W`,x=(b,_,M,k,P,T="",z=!0,W,L)=>{let S=l.querySelector(`#${b}`);if(!z){S&&S.remove();return}if(!S){S=document.createElementNS("http://www.w3.org/2000/svg","g"),S.setAttribute("id",b),S.style.cursor="pointer";const E=r[k];if(E){const N=document.createElementNS("http://www.w3.org/2000/svg","g");N.setAttribute("class","indicator-icon"),N.setAttribute("transform","translate(10, -8) scale(0.67)");const X=document.createElementNS("http://www.w3.org/2000/svg","path");X.setAttribute("d",E),X.setAttribute("fill",M),N.appendChild(X),S.appendChild(N)}const I=document.createElementNS("http://www.w3.org/2000/svg","text");I.setAttribute("class","indicator-text"),I.setAttribute("x","28"),I.setAttribute("y","4"),I.setAttribute("fill",M),I.setAttribute("font-size","12"),I.setAttribute("font-weight","600"),S.appendChild(I),W&&L&&S.addEventListener("click",()=>{F(this.hass,this.fireEvent,L,W)}),l.appendChild(S)}S.setAttribute("transform",`translate(${y+10}, ${_})`);const R=S.querySelector(".indicator-text");R&&(R.textContent=`${T}${P}`)};x("indicator-solar",p,"#388e3c","solar",A(d.solar),"",d.solar>0,this.config.production_entity,this.config.production_tap_action),x("indicator-battery-discharge",m,"#1976d2","battery",A(d.batteryDischarge),"+",d.batteryDischarge>0,this.config.battery_entity,this.config.battery_tap_action),x("indicator-grid-import",v,"#c62828","grid",A(d.gridImport),"",d.gridImport>0,this.config.grid_entity,this.config.grid_tap_action),x("indicator-battery-charge",w,"#1976d2","battery",A(d.batteryCharge),"-",d.batteryCharge>0,this.config.battery_entity,this.config.battery_tap_action),x("indicator-grid-export",C,"#f9a825","grid",A(d.gridExport),"",d.gridExport>0,this.config.grid_entity,this.config.grid_tap_action),x("indicator-load",f,"#CCCCCC","load",A(d.load),"",!0,this.config.load_entity,this.config.load_tap_action)}updateChartIndicators(t){if(!this.chartDataCache||!t)return;const e=this.chartDataCache.dataPoints,i=Math.max(...e.map(w=>w.solar+w.batteryDischarge+w.gridImport),...e.map(w=>w.load)),n=Math.max(...e.map(w=>w.batteryCharge+w.gridExport)),a=i+n,o=a>0?i/a:.5,s=a>0?n/a:.5,c=800,r=400,h={top:20,right:150,bottom:40,left:60},l=c-h.left-h.right,u=r-h.top-h.bottom,d=u*o,y=u*s,f=i>0?d/(i*1.1):1,p=n>0?y/(n*1.1):1,m=h.top+d,v={};["load","solar","battery","grid"].forEach(w=>{const C=this.getIcon(`${w}_icon`,`${w}_entity`,"");this.iconCache.has(C)&&(v[w]=this.iconCache.get(C)||null)}),this.renderChartIndicators(t,e,l,d,y,f,p,h,v,m)}addLoadLineOnTop(t,e){if(!e)return;const i=t.querySelector("#load-line");i&&i.remove();const n=e.match(/d="([^"]+)"/);if(!n)return;const a=n[1],o=document.createElementNS("http://www.w3.org/2000/svg","path");o.setAttribute("id","load-line"),o.setAttribute("d",a),o.setAttribute("fill","none"),o.setAttribute("stroke","#CCCCCC"),o.setAttribute("stroke-width","3"),o.setAttribute("opacity","0.9"),o.style.cursor="pointer",o.addEventListener("click",()=>{F(this.hass,this.fireEvent,this.config.load_tap_action,this.config.load_entity)}),t.appendChild(o)}attachChartAreaClickHandlers(t){const e=t.querySelector("#chart-area-solar");e&&e.addEventListener("click",()=>{F(this.hass,this.fireEvent,this.config.production_tap_action,this.config.production_entity)});const i=t.querySelector("#chart-area-battery-discharge");i&&i.addEventListener("click",()=>{F(this.hass,this.fireEvent,this.config.battery_tap_action,this.config.battery_entity)});const n=t.querySelector("#chart-area-battery-charge");n&&n.addEventListener("click",()=>{F(this.hass,this.fireEvent,this.config.battery_tap_action,this.config.battery_entity)});const a=t.querySelector("#chart-area-grid-import");a&&a.addEventListener("click",()=>{F(this.hass,this.fireEvent,this.config.grid_tap_action,this.config.grid_entity)});const o=t.querySelector("#chart-area-grid-export");o&&o.addEventListener("click",()=>{F(this.hass,this.fireEvent,this.config.grid_tap_action,this.config.grid_entity)})}clearCache(){this.chartDataCache=void 0}}class ft extends HTMLElement{constructor(){super(),this._resizeObserver=null}static getStubConfig(){return{}}static getConfigForm(){return ct()}connectedCallback(){this._resizeObserver=new ResizeObserver(()=>{}),this.parentElement&&this._resizeObserver.observe(this.parentElement),this._resizeObserver.observe(this)}disconnectedCallback(){this._resizeObserver&&(this._resizeObserver.disconnect(),this._resizeObserver=null),this._defaultRenderer&&this._defaultRenderer.stop(),this._chartRenderer&&this._chartRenderer.cleanup()}setConfig(t){this._config=ht(t),this._renderSafely("setConfig")}set hass(t){this._hass=t,this._renderSafely("hass update")}_renderSafely(t){try{this._render()}catch(e){console.error("[EnergyFlowCard] render failed during",t,e),this.innerHTML=`
        <ha-card>
          <div style="padding:16px;">
            Energy Flow Card failed to render. Check browser console for details.
          </div>
        </ha-card>
      `}}_render(){if(!this._config||!this._hass||!this._config.load)return;const t=this._getEntityState(this._config.grid?.entity),e=this._getEntityState(this._config.load.entity),i=this._getEntityState(this._config.production?.entity),n=this._getEntityState(this._config.battery?.entity),a=parseFloat(t?.state??"0")||0,o=parseFloat(e?.state??"0")||0,s=parseFloat(i?.state??"0")||0;let c=parseFloat(n?.state??"0")||0;this._config.battery?.invert?.data&&(c=-c);const r=this._config.mode||"default";if(this._lastViewMode==="chart"&&r!=="chart"&&this._chartRenderer&&this._chartRenderer.cleanup(),r==="compact"||r==="compact-battery"){this._renderCompactView(a,o,s,c,r),this._lastViewMode=r;return}if(r==="chart"){if(!this._chartRenderer){const l={production_entity:this._config.production?.entity||"",grid_entity:this._config.grid?.entity||"",load_entity:this._config.load.entity,battery_entity:this._config.battery?.entity||"",invert_battery_data:this._config.battery?.invert?.data,production_icon:this._config.production?.icon,grid_icon:this._config.grid?.icon,load_icon:this._config.load.icon,battery_icon:this._config.battery?.icon,production_tap_action:this._config.production?.tap,grid_tap_action:this._config.grid?.tap,load_tap_action:this._config.load.tap,battery_tap_action:this._config.battery?.tap};this._chartRenderer=new pt(this._hass,l,this._fireEvent.bind(this))}this._chartRenderer.updateLiveValues({grid:a,load:o,production:s,battery:c}),this._chartRenderer.render(this),this._lastViewMode=r;return}this._defaultRenderer||(this._defaultRenderer=new gt(this,this._config,this._hass,(l,u)=>lt(this._config,this._hass,l,u),(l,u)=>Q(this._config,this._hass,l,u),this._fireEvent.bind(this)));const h=this._calculateFlows(a,s,o,c);this._defaultRenderer.render({grid:a,load:o,production:s,battery:c,flows:h}),this._lastViewMode=r}_getEntityState(t){if(t)return this._hass?.states?.[t]}_fireEvent(t,e={}){if(t==="call-service"&&this._hass){this._hass.callService(e.domain,e.service,e.service_data||{},e.target);return}const i=new CustomEvent(t,{detail:e,bubbles:!0,composed:!0});this.dispatchEvent(i)}_calculateFlows(t,e,i,n){return rt({grid:t,production:e,load:i,battery:n})}_renderCompactView(t,e,i,n,a){if(!this._config||!this._hass)return;this._compactRenderer?this._compactRenderer.setViewMode(a):this._compactRenderer=new dt(this,this._config,this._hass,a,(c,r)=>Q(this._config,this._hass,c,r),(c,r)=>F(this._hass,this._fireEvent.bind(this),c,r));const o=this._calculateFlows(t,i,e,n);let s=null;if(this._config.battery?.soc_entity){const c=this._getEntityState(this._config.battery.soc_entity);s=parseFloat(c?.state??"0")||0}this._compactRenderer.render({grid:t,load:e,production:i,battery:n,flows:o,batterySoc:s})}}const nt="energy-flow-card";customElements.get(nt)?console.info("[EnergyFlowCard] custom element already defined"):(customElements.define(nt,ft),console.info("[EnergyFlowCard] defined custom element")),window.customCards=window.customCards||[],window.customCards.push({type:"custom:energy-flow-card",name:"Energy Flow Card",description:"A test energy-flow card."})})();

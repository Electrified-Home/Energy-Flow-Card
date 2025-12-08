(function(){"use strict";function U(y){const t=Math.max(0,y.production),e=y.grid,i=y.battery,s=Math.max(0,y.load),r={productionToLoad:0,productionToBattery:0,productionToGrid:0,gridToLoad:0,gridToBattery:0,batteryToLoad:0};let a=t,n=s;if(a>0&&n>0&&(r.productionToLoad=Math.min(a,n),a-=r.productionToLoad,n-=r.productionToLoad),i<0&&a>0&&(r.productionToBattery=Math.min(a,Math.abs(i)),a-=r.productionToBattery),i>0&&n>0&&(r.batteryToLoad=Math.min(i,n),n-=r.batteryToLoad),n>0&&e>0&&(r.gridToLoad=Math.min(e,n),n-=r.gridToLoad),i<0&&e>10){const o=Math.abs(i)-r.productionToBattery;o>1&&(r.gridToBattery=Math.min(e-r.gridToLoad,o))}return e<-10&&(r.productionToGrid=Math.abs(e)),r}function Q(){return{schema:[{name:"view_mode",label:"View Mode",selector:{select:{options:[{value:"default",label:"Default"},{value:"compact",label:"Compact Bar"},{value:"compact-battery",label:"Compact with Battery"},{value:"chart",label:"Chart"}]}}},{name:"grid_entity",label:"Grid",required:!0,selector:{entity:{domain:"sensor",device_class:"power"}}},{name:"grid_name",selector:{entity_name:{}},context:{entity:"grid_entity"}},{name:"grid_icon",selector:{icon:{}},context:{icon_entity:"grid_entity"}},{name:"grid_min",label:"Grid Min (W)",selector:{number:{mode:"box"}}},{name:"grid_max",label:"Grid Max (W)",selector:{number:{mode:"box"}}},{name:"grid_tap_action",label:"Grid Tap Action",selector:{"ui-action":{}}},{name:"grid_hold_action",label:"Grid Hold Action",selector:{"ui-action":{}}},{name:"load_entity",label:"Load",required:!0,selector:{entity:{domain:"sensor",device_class:"power"}}},{name:"load_name",selector:{entity_name:{}},context:{entity:"load_entity"}},{name:"load_icon",selector:{icon:{}},context:{icon_entity:"load_entity"}},{name:"load_max",label:"Load Max (W)",selector:{number:{mode:"box"}}},{name:"load_tap_action",label:"Load Tap Action",selector:{"ui-action":{}}},{name:"load_hold_action",label:"Load Hold Action",selector:{"ui-action":{}}},{name:"production_entity",label:"Production",required:!0,selector:{entity:{domain:"sensor",device_class:"power"}}},{name:"production_name",selector:{entity_name:{}},context:{entity:"production_entity"}},{name:"production_icon",selector:{icon:{}},context:{icon_entity:"production_entity"}},{name:"production_max",label:"Production Max (W)",selector:{number:{mode:"box"}}},{name:"production_tap_action",label:"Production Tap Action",selector:{"ui-action":{}}},{name:"production_hold_action",label:"Production Hold Action",selector:{"ui-action":{}}},{name:"battery_entity",label:"Battery",required:!0,selector:{entity:{domain:"sensor",device_class:"power"}}},{name:"battery_name",selector:{entity_name:{}},context:{entity:"battery_entity"}},{name:"battery_icon",selector:{icon:{}},context:{icon_entity:"battery_entity"}},{name:"battery_min",label:"Battery Min (W)",selector:{number:{mode:"box"}}},{name:"battery_max",label:"Battery Max (W)",selector:{number:{mode:"box"}}},{name:"battery_tap_action",label:"Battery Tap Action",selector:{"ui-action":{}}},{name:"battery_hold_action",label:"Battery Hold Action",selector:{"ui-action":{}}},{name:"battery_soc_entity",label:"Battery SOC (%) Entity",selector:{entity:{domain:"sensor"}}},{name:"invert_battery_data",label:"Invert Battery Data",selector:{boolean:{}}},{name:"invert_battery_view",label:"Invert Battery View",selector:{boolean:{}}},{name:"show_plus",label:"Show + Sign",selector:{boolean:{}}}]}}function Z(y){if(y.load)return y;const t=n=>{const o=y[`${n}_entity`];if(!o)return;const c={entity:o},g=y[`${n}_name`],h=y[`${n}_icon`],l=y[`${n}_min`],d=y[`${n}_max`],m=y[`${n}_tap_action`],u=y[`${n}_hold_action`];return g!==void 0&&(c.name=g),h!==void 0&&(c.icon=h),l!==void 0&&(c.min=l),d!==void 0&&(c.max=d),m!==void 0&&(c.tap=m),u!==void 0&&(c.hold=u),c},e=t("load"),i=t("grid"),s=t("production"),r=t("battery");if(r){const n=y.battery_soc_entity,o=y.invert_battery_data,c=y.invert_battery_view,g=y.show_plus;n!==void 0&&(r.soc_entity=n),(o!==void 0||c!==void 0)&&(r.invert={data:o!==void 0?o:r.invert?.data,view:c!==void 0?c:r.invert?.view}),g!==void 0&&(r.showPlus=g)}const a=y.view_mode||y.mode;return e?{mode:a,load:e,grid:i,production:s,battery:r}:y}function J(y,t,e,i){const s=y[e];return s?s.name?s.name:s.entity&&t?.states[s.entity]&&t.states[s.entity].attributes.friendly_name||i:i}function W(y,t,e,i){const s=y[e];return s?s.icon?s.icon:s.entity&&t?.states[s.entity]&&t.states[s.entity].attributes.icon||i:i}function E(y,t,e,i){if(!y)return;const s=e||{action:"more-info"},r=s.action||"more-info";switch(r==="default"?"more-info":r){case"more-info":const n=s.entity||i;n&&t("hass-more-info",{entityId:n});break;case"navigate":{const o=s.path??s.navigation_path;o&&(history.pushState(null,"",o),t("location-changed",{replace:!1,path:o}),window.dispatchEvent(new CustomEvent("location-changed",{detail:{replace:!1,path:o},bubbles:!0,composed:!0})))}break;case"url":s.path&&window.open(s.path);break;case"toggle":i&&y.callService("homeassistant","toggle",{entity_id:i});break;case"call-service":if(s.service){const[o,c]=s.service.split(".");y.callService(o,c,s.service_data||{},s.target)}break}}function q(y,t,e){if(!y||!e){y?.setAttribute("data-width-px","");return}t>=80?y.setAttribute("data-width-px","show-label"):t>=40?y.setAttribute("data-width-px","show-icon"):y.setAttribute("data-width-px","")}class K{constructor(t,e,i,s,r,a){this.productionColor="#256028",this.batteryColor="#104b79",this.gridColor="#7a211b",this.returnColor="#7a6b1b",this.container=t,this.config=e,this.hass=i,this.viewMode=s,this.getIconCallback=r,this.handleActionCallback=a}setConfig(t){this.config=t}render(t){(!this.container.querySelector(".compact-view")||this.lastViewMode!==this.viewMode)&&(this.initializeStructure(),this.attachEventHandlers(),this.lastViewMode=this.viewMode),this.updateSegments(t)}setViewMode(t){this.viewMode!==t&&(this.viewMode=t,this.lastViewMode=void 0)}initializeStructure(){this.container.innerHTML=`
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
    `}attachEventHandlers(){requestAnimationFrame(()=>{const t=this.container.querySelector("#production-segment"),e=this.container.querySelector("#battery-segment"),i=this.container.querySelector("#grid-segment"),r=this.container.querySelectorAll(".row-value")[0];if(t&&t.addEventListener("click",()=>{this.handleActionCallback(this.config.production?.tap,this.config.production?.entity)}),e&&e.addEventListener("click",()=>{this.handleActionCallback(this.config.battery?.tap,this.config.battery?.entity)}),i&&i.addEventListener("click",()=>{this.handleActionCallback(this.config.grid?.tap,this.config.grid?.entity)}),r&&r.addEventListener("click",()=>{this.handleActionCallback(this.config.load.tap,this.config.load.entity)}),this.viewMode==="compact-battery"){const a=this.container.querySelector("#battery-production-segment"),n=this.container.querySelector("#battery-load-segment"),o=this.container.querySelector("#battery-grid-segment"),c=this.container.querySelector("#battery-soc-left"),g=this.container.querySelector("#battery-soc-right");a&&a.addEventListener("click",()=>{this.handleActionCallback(this.config.production?.tap,this.config.production?.entity)}),n&&n.addEventListener("click",()=>{this.handleActionCallback(this.config.load.tap,this.config.load.entity)}),o&&o.addEventListener("click",()=>{this.handleActionCallback(this.config.grid?.tap,this.config.grid?.entity)}),c&&c.addEventListener("click",()=>{this.handleActionCallback(this.config.battery?.tap,this.config.battery?.entity)}),g&&g.addEventListener("click",()=>{this.handleActionCallback(this.config.battery?.tap,this.config.battery?.entity)})}})}updateSegments(t){const{load:e,flows:i,battery:s,batterySoc:r}=t,a=i.productionToLoad,n=i.batteryToLoad,o=i.gridToLoad,c=e||1,g=a/c*100,h=n/c*100,l=o/c*100,d=g+h+l;let m=g,u=h,p=l;if(d>0){const b=100/d;m=g*b,u=h*b,p=l*b}let f=0,v=0,w=0,S=0,_=0,M=0;if(this.viewMode==="compact-battery"){if(s<0){const x=Math.abs(s)||1;f=i.gridToBattery,w=i.productionToBattery;const P=i.gridToBattery/x*100,$=i.productionToBattery/x*100,C=P+$;if(C>0){const A=100/C;S=P*A,M=$*A}}else if(s>0){const b=s||1,x=s-i.batteryToLoad;v=i.batteryToLoad,f=x;const P=i.batteryToLoad/b*100,$=x/b*100,C=P+$;if(C>0){const A=100/C;_=P*A,S=$*A}}}requestAnimationFrame(()=>{this.updateLoadBar(m,u,p,g,h,l,a,n,o,e),this.viewMode==="compact-battery"&&this.updateBatteryBar(S,_,M,f,v,w,s,r)})}updateLoadBar(t,e,i,s,r,a,n,o,c,g){const h=this.container.querySelector("#production-segment"),l=this.container.querySelector("#battery-segment"),d=this.container.querySelector("#grid-segment"),m=this.container.querySelector("#load-value-text"),u=this.container.querySelector(".bar-container");if(h){h.style.width=`${t}%`;const p=h.querySelector(".bar-segment-label");p&&n>0&&(p.textContent=`${Math.round(s)}%`);const f=t/100*(u?.clientWidth||0);q(h,f,n>0)}if(l){l.style.width=`${e}%`;const p=l.querySelector(".bar-segment-label");p&&o>0&&(p.textContent=`${Math.round(r)}%`);const f=e/100*(u?.clientWidth||0);q(l,f,o>0)}if(d){d.style.width=`${i}%`;const p=d.querySelector(".bar-segment-label");p&&c>0&&(p.textContent=`${Math.round(a)}%`);const f=i/100*(u?.clientWidth||0);q(d,f,c>0)}m&&(m.textContent=String(Math.round(g)))}updateBatteryBar(t,e,i,s,r,a,n,o){const c=this.container.querySelector("#battery-grid-segment"),g=this.container.querySelector("#battery-load-segment"),h=this.container.querySelector("#battery-production-segment"),l=this.container.querySelector("#battery-soc-left"),d=this.container.querySelector("#battery-soc-right"),m=this.container.querySelector("#battery-soc-text-left"),u=this.container.querySelector("#battery-soc-text-right"),f=this.container.querySelectorAll(".bar-container")[1];let v=!1;if(n<0?(v=!0,l&&(l.style.display="none"),d&&(d.style.display="flex"),u&&o!==null&&(u.textContent=o.toFixed(1))):n>0?(v=!1,l&&(l.style.display="flex"),d&&(d.style.display="none"),m&&o!==null&&(m.textContent=o.toFixed(1))):(l&&(l.style.display="none"),d&&(d.style.display="flex"),u&&o!==null&&(u.textContent=o.toFixed(1))),c){const w=v?this.gridColor:this.returnColor;c.style.width=`${t}%`,c.style.background=w;const S=c.querySelector(".bar-segment-label");S&&s>0&&(S.textContent=`${Math.round(s)}W`);const _=t/100*(f?.offsetWidth||0);q(c,_,s>0)}if(g){g.style.width=`${e}%`;const w=g.querySelector(".bar-segment-label");w&&r>0&&(w.textContent=`${Math.round(r)}W`);const S=e/100*(f?.offsetWidth||0);q(g,S,r>0)}if(h){h.style.width=`${i}%`;const w=h.querySelector(".bar-segment-label");w&&a>0&&(w.textContent=`${Math.round(a)}W`);const S=i/100*(f?.offsetWidth||0);q(h,S,a>0)}}}class O{constructor(t,e,i,s,r,a,n,o,c=!1,g=!1,h,l,d){this.id=t,this._value=e,this.min=i,this.max=s,this.bidirectional=r,this.label=a,this.icon=n,this.units=o,this._invertView=c,this.showPlus=g,this.tapAction=h,this.entityId=l,this.fireEventCallback=d,this.element=null,this.radius=50,this.boxWidth=120,this.boxHeight=135,this.boxRadius=16,this.centerX=this.boxWidth/2,this.centerY=this.radius+25,this.offsetX=-this.centerX,this.offsetY=-this.centerY,this.needleState={target:0,current:0,ghost:0},this._lastAnimationTime=null,this._animationFrameId=null,this._updateNeedleAngle()}get value(){return this._value}set value(t){if(this._value!==t&&(this._value=t,this._updateNeedleAngle(),this.element)){const e=this.element.querySelector(`#value-${this.id}`);e&&(e.textContent=this._formatValueText()),this.updateDimming()}}get invertView(){return this._invertView}set invertView(t){if(this._invertView!==t&&(this._invertView=t,this._updateNeedleAngle(),this.element)){const e=this.element.querySelector(`#value-${this.id}`);e&&(e.textContent=this._formatValueText())}}get displayValue(){return this._invertView?-this._value:this._value}_formatValueText(){const t=this.displayValue,e=t.toFixed(0);return t<0?e+" ":t>0&&this.showPlus?"+"+e+" ":e}_updateNeedleAngle(){let t,e;const i=this.displayValue;if(this.bidirectional){const s=this.max-this.min;t=Math.min(Math.max((i-this.min)/s,0),1),e=180-t*180}else t=Math.min(Math.max(i/this.max,0),1),e=180-t*180;this.needleState.target=e}updateDimming(){if(!this.element)return;const t=this.element.querySelector(`#dimmer-${this.id}`);if(t){const e=Math.abs(this.value)<.5;t.setAttribute("opacity",e?"0.3":"0")}}startAnimation(){if(this._animationFrameId)return;const t=e=>{this._lastAnimationTime||(this._lastAnimationTime=e);const i=e-this._lastAnimationTime;if(this._lastAnimationTime=e,!this.element){this._animationFrameId=null;return}const s=this.radius-5,r=Math.min(i/150,1);this.needleState.current+=(this.needleState.target-this.needleState.current)*r;const a=Math.min(i/400,1);this.needleState.ghost+=(this.needleState.current-this.needleState.ghost)*a;const n=10;this.needleState.ghost<this.needleState.current-n?this.needleState.ghost=this.needleState.current-n:this.needleState.ghost>this.needleState.current+n&&(this.needleState.ghost=this.needleState.current+n);const o=this.element.querySelector(`#needle-${this.id}`);if(o){const g=this.needleState.current*Math.PI/180,h=this.centerX+s*Math.cos(g),l=this.centerY-s*Math.sin(g);o.setAttribute("x2",String(h)),o.setAttribute("y2",String(l))}const c=this.element.querySelector(`#ghost-needle-${this.id}`);if(c){const g=this.needleState.ghost*Math.PI/180,h=this.centerX+s*Math.cos(g),l=this.centerY-s*Math.sin(g);c.setAttribute("x2",String(h)),c.setAttribute("y2",String(l))}this._animationFrameId=requestAnimationFrame(t)};this._animationFrameId=requestAnimationFrame(t)}stopAnimation(){this._animationFrameId&&(cancelAnimationFrame(this._animationFrameId),this._animationFrameId=null,this._lastAnimationTime=null)}_handleTapAction(){if(!this.fireEventCallback)return;const t=this.tapAction||{action:"more-info"};switch(t.action||"more-info"){case"more-info":const i=t.entity||this.entityId;i&&this.fireEventCallback("hass-more-info",{entityId:i});break;case"navigate":t.path&&(history.pushState(null,"",t.path),this.fireEventCallback("location-changed",{replace:!1}));break;case"url":t.path&&window.open(t.path);break;case"toggle":this.entityId&&this.fireEventCallback("call-service",{domain:"homeassistant",service:"toggle",service_data:{entity_id:this.entityId}});break;case"call-service":if(t.service){const[s,r]=t.service.split(".");this.fireEventCallback("call-service",{domain:s,service:r,service_data:t.service_data||{},target:t.target})}break}}createElement(){const t=this.displayValue;let e,i;if(this.bidirectional){const x=this.max-this.min;e=Math.min(Math.max((t-this.min)/x,0),1),i=180-e*180}else e=Math.min(Math.max(t/this.max,0),1),i=180-e*180;this.needleState.target=i,this.needleState.current=i,this.needleState.ghost=i;const r=(this.bidirectional?[this.min,0,this.max]:[0,this.max/2,this.max]).map(x=>{const C=(180-(this.bidirectional?(x-this.min)/(this.max-this.min):x/this.max)*180)*Math.PI/180,A=this.radius,I=this.radius-8,k=this.centerX+A*Math.cos(C),D=this.centerY-A*Math.sin(C),T=this.centerX+I*Math.cos(C),F=this.centerY-I*Math.sin(C);return`<line x1="${k}" y1="${D}" x2="${T}" y2="${F}" stroke="rgb(160, 160, 160)" stroke-width="2" />`}).join(""),o=(180-(this.bidirectional?(0-this.min)/(this.max-this.min):0)*180)*Math.PI/180,c=this.centerX,g=this.centerY,h=this.centerX+this.radius*Math.cos(o),l=this.centerY-this.radius*Math.sin(o),d=`<line x1="${c}" y1="${g}" x2="${h}" y2="${l}" stroke="rgb(100, 100, 100)" stroke-width="2" />`,m=i*Math.PI/180,u=this.radius-5,p=this.centerX+u*Math.cos(m),f=this.centerY-u*Math.sin(m),v=this.centerY+5,w=this.centerY+this.radius*.5,S=this.centerY+this.radius*.7,_=`
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
        
        ${r}
        
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
        
        <line id="ghost-needle-${this.id}" x1="${this.centerX}" y1="${this.centerY}" x2="${p}" y2="${f}" stroke="rgb(255, 255, 255)" stroke-width="4" stroke-linecap="round" opacity="0.3" />
        
        <line id="needle-${this.id}" x1="${this.centerX}" y1="${this.centerY}" x2="${p}" y2="${f}" stroke="rgb(255, 255, 255)" stroke-width="4" stroke-linecap="round" />
        
        <circle cx="${this.centerX}" cy="${this.centerY}" r="5" fill="rgb(255, 255, 255)" />
        
        <text id="value-${this.id}" x="${this.centerX}" y="${w}" text-anchor="middle" font-size="16" fill="rgb(255, 255, 255)" font-weight="600">${this._formatValueText()}</text>
        
        <text x="${this.centerX}" y="${S}" text-anchor="middle" font-size="8" fill="rgb(160, 160, 160)" font-weight="400" letter-spacing="0.5">${this.units}</text>
        
        <rect id="dimmer-${this.id}" x="0" y="0" width="${this.boxWidth}" height="${this.boxHeight}" rx="${this.boxRadius}" ry="${this.boxRadius}" fill="black" opacity="0" pointer-events="none" style="transition: opacity 0.8s ease-in-out;" />
      </g>
    `,M=document.createElementNS("http://www.w3.org/2000/svg","svg");M.innerHTML=_;const b=M.firstElementChild;return this.element=b,(!this.tapAction||this.tapAction.action!=="none")&&(b.style.cursor="pointer",b.addEventListener("click",x=>{this._handleTapAction(),x.stopPropagation()}),b.addEventListener("mouseenter",()=>{b.style.filter="brightness(1.1)"}),b.addEventListener("mouseleave",()=>{b.style.filter=""})),b}}class tt{constructor(t,e,i,s,r,a,n,o){this.group=t,this.flowId=e,this.speedMultiplier=n,this.dotsPerFlow=o,this.dots=[],this.dotStates=[],this.pathLength=0;const c=(i.x+s.x)/2,g=(i.y+s.y)/2;this.pathData=`M ${i.x},${i.y} Q ${c},${g} ${s.x},${s.y}`;const{opacity:h,strokeWidth:l,dotRadius:d}=this.calculateStyles(r),m=this.calculateVelocity(r);this.glowPath=document.createElementNS("http://www.w3.org/2000/svg","path"),this.glowPath.setAttribute("d",this.pathData),this.glowPath.setAttribute("class","flow-line"),this.glowPath.setAttribute("stroke",a),this.glowPath.setAttribute("stroke-opacity",String(h*.5)),this.glowPath.setAttribute("stroke-width",String(l*2)),this.glowPath.setAttribute("fill","none"),this.glowPath.setAttribute("stroke-linecap","round"),this.glowPath.setAttribute("style","transition: stroke-opacity 0.5s ease-out, stroke-width 0.5s ease-out;"),this.glowPath.id=`glow-${e}`,this.group.appendChild(this.glowPath),this.mainPath=document.createElementNS("http://www.w3.org/2000/svg","path"),this.mainPath.setAttribute("d",this.pathData),this.mainPath.setAttribute("class","flow-line"),this.mainPath.setAttribute("stroke",a),this.mainPath.setAttribute("stroke-opacity",String(h)),this.mainPath.setAttribute("stroke-width",String(l)),this.mainPath.setAttribute("fill","none"),this.mainPath.setAttribute("stroke-linecap","round"),this.mainPath.setAttribute("style","transition: stroke-opacity 0.5s ease-out, stroke-width 0.5s ease-out;"),this.mainPath.id=`path-${e}`,this.group.appendChild(this.mainPath),this.pathLength=this.mainPath.getTotalLength();for(let u=0;u<this.dotsPerFlow;u++){const p=document.createElementNS("http://www.w3.org/2000/svg","circle");p.setAttribute("class","flow-dot"),p.setAttribute("id",`dot-${e}-${u}`),p.setAttribute("r",String(d)),p.setAttribute("fill",a),p.setAttribute("opacity",String(h)),p.setAttribute("style","transition: opacity 0.5s ease-out, r 0.5s ease-out;"),this.group.appendChild(p),this.dots.push(p);const f=u/this.dotsPerFlow;this.dotStates.push({progress:f,velocity:m});const v=this.mainPath.getPointAtLength(f*this.pathLength);p.setAttribute("cx",String(v.x)),p.setAttribute("cy",String(v.y))}}calculateStyles(t){let e;t<=100?e=.25:t<=200?e=.25+(t-100)/100*.75:e=1;const i=2,s=23.76,r=1e4;let a;if(t<=100)a=i;else{const h=Math.min((t-100)/(r-100),1)*(s-i);a=i+h}const n=2.5,o=3,c=n*(a/i),g=Math.max(c,o);return{opacity:e,strokeWidth:a,dotRadius:g}}calculateVelocity(t){const e=40*(t/1e3)*this.speedMultiplier;return this.pathLength>0?e/this.pathLength:0}update(t,e){const{opacity:i,strokeWidth:s,dotRadius:r}=this.calculateStyles(t),a=this.calculateVelocity(t);this.glowPath.setAttribute("stroke",e),this.glowPath.setAttribute("stroke-opacity",String(i*.5)),this.glowPath.setAttribute("stroke-width",String(s*2)),this.mainPath.setAttribute("stroke",e),this.mainPath.setAttribute("stroke-opacity",String(i)),this.mainPath.setAttribute("stroke-width",String(s)),this.dots.forEach((n,o)=>{n.setAttribute("r",String(r)),n.setAttribute("opacity",String(i)),n.setAttribute("fill",e),this.dotStates[o].velocity=a})}animate(t){this.dotStates.forEach((e,i)=>{if(e.velocity>0){e.progress+=e.velocity*(t/1e3),e.progress>=1&&(e.progress=e.progress%1);try{if(this.pathLength>0){const s=this.mainPath.getPointAtLength(e.progress*this.pathLength);this.dots[i].setAttribute("cx",String(s.x)),this.dots[i].setAttribute("cy",String(s.y))}}catch{}}})}fadeOut(t){this.glowPath.setAttribute("stroke-opacity","0"),this.mainPath.setAttribute("stroke-opacity","0"),this.dots.forEach(e=>e.setAttribute("opacity","0")),setTimeout(t,500)}}class Y{constructor(t,e){this.container=t,this.positions=e,this.flowLines=new Map,this.animationFrameId=null,this.lastAnimationTime=null,this.speedMultiplier=.8,this.dotsPerFlow=3,this.animate=()=>{const i=performance.now(),s=this.lastAnimationTime?i-this.lastAnimationTime:0;this.lastAnimationTime=i,this.flowLines.forEach(r=>{r.animate(s)}),this.animationFrameId=requestAnimationFrame(this.animate)}}updateFlows(t){const e=this.container.querySelector("#flow-layer");if(!e)return;const i=0,s=10;this.updateOrCreateFlow(e,"production-to-load",this.positions.production,this.positions.load,t.productionToLoad,"#4caf50",i),this.updateOrCreateFlow(e,"production-to-battery",this.positions.production,this.positions.battery,t.productionToBattery,"#4caf50",i),this.updateOrCreateFlow(e,"battery-to-load",this.positions.battery,this.positions.load,t.batteryToLoad,"#2196f3",s),this.updateOrCreateFlow(e,"grid-to-load",this.positions.grid,this.positions.load,t.gridToLoad,"#f44336",i),this.updateOrCreateFlow(e,"grid-to-battery",this.positions.grid,this.positions.battery,t.gridToBattery,"#f44336",i),this.updateOrCreateFlow(e,"production-to-grid",this.positions.production,this.positions.grid,t.productionToGrid,"#ffeb3b",i)}start(){this.animationFrameId||(this.lastAnimationTime=performance.now(),this.animate())}stop(){this.animationFrameId&&(cancelAnimationFrame(this.animationFrameId),this.animationFrameId=null,this.lastAnimationTime=null)}clear(){this.stop(),this.flowLines.clear();const t=this.container.querySelector("#flow-layer");t&&(t.innerHTML="")}updateOrCreateFlow(t,e,i,s,r,a,n){const o=this.flowLines.get(e);if(r<=n){o&&this.fadeOutFlow(t,e);return}o?o.update(r,a):this.drawFlow(t,e,i,s,r,a)}drawFlow(t,e,i,s,r,a){const n=document.createElementNS("http://www.w3.org/2000/svg","g");n.setAttribute("id",e),t.appendChild(n);const o=new tt(n,e,i,s,r,a,this.speedMultiplier,this.dotsPerFlow);this.flowLines.set(e,o)}removeFlow(t,e){const i=t.querySelector(`#${e}`);i&&(i.remove(),this.flowLines.delete(e))}fadeOutFlow(t,e){const i=this.flowLines.get(e);i&&i.fadeOut(()=>{this.removeFlow(t,e)})}}class et{constructor(t,e,i,s,r,a){this.container=t,this.config=e,this.hass=i,this.getDisplayNameCallback=s,this.getIconCallback=r,this.fireEventCallback=a,this.meters=new Map,this.iconsExtracted=!1,this.iconExtractionTimeouts=new Set,this.iconCache=new Map,this.canvasWidth=500,this.canvasHeight=470;const n=5,o=3;this.meterPositions={production:{x:60+n,y:80+o},battery:{x:130+n,y:240+o},grid:{x:60+n,y:400+o},load:{x:360+n,y:240+o}}}setConfig(t){this.config=t}render(t){const{grid:e,load:i,production:s,battery:r,flows:a}=t,n=this.config.grid?.min??-5e3,o=this.config.grid?.max??5e3,c=this.config.load.max??5e3,g=this.config.production?.max??5e3,h=this.config.battery?.min??-5e3,l=this.config.battery?.max??5e3;if(!this.container.querySelector(".energy-flow-svg"))this.iconsExtracted=!1,this.initializeStructure(e,i,s,r,n,o,c,g,h,l),this.iconsExtracted||requestAnimationFrame(()=>{this.extractIconPaths()});else{const d=this.meters.get("production"),m=this.meters.get("battery"),u=this.meters.get("grid"),p=this.meters.get("load");if(d&&(d.value=s),m&&(m.invertView=this.config.battery?.invert?.view??!1,m.value=r),u&&(u.value=e),p&&(p.value=i),!this.flowRenderer){const f=this.container.querySelector(".energy-flow-svg");f&&(this.flowRenderer=new Y(f,this.meterPositions),this.flowRenderer.start())}}this.flowRenderer&&this.flowRenderer.updateFlows(a)}stop(){this.flowRenderer&&this.flowRenderer.stop(),this.meters.forEach(t=>t.stopAnimation()),this.iconExtractionTimeouts.forEach(t=>clearTimeout(t)),this.iconExtractionTimeouts.clear()}clear(){this.stop(),this.flowRenderer&&this.flowRenderer.clear()}initializeStructure(t,e,i,s,r,a,n,o,c,g){const h=new O("production",i,0,o,!1,this.getDisplayNameCallback("production","Production"),this.getIconCallback("production","mdi:solar-power"),"WATTS",!1,!1,this.config.production?.tap,this.config.production?.entity,this.fireEventCallback),l=new O("battery",s,c,g,!0,this.getDisplayNameCallback("battery","Battery"),this.getIconCallback("battery","mdi:battery"),"WATTS",this.config.battery?.invert?.view,this.config.battery?.showPlus,this.config.battery?.tap,this.config.battery?.entity,this.fireEventCallback),d=new O("grid",t,r,a,!0,this.getDisplayNameCallback("grid","Grid"),this.getIconCallback("grid","mdi:transmission-tower"),"WATTS",!1,!1,this.config.grid?.tap,this.config.grid?.entity,this.fireEventCallback),m=new O("load",e,0,n,!1,this.getDisplayNameCallback("load","Load"),this.getIconCallback("load","mdi:home-lightning-bolt"),"WATTS",!1,!1,this.config.load.tap,this.config.load.entity,this.fireEventCallback);this.container.innerHTML=`
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
    `,requestAnimationFrame(()=>{const u=this.container.querySelector("#production-meter"),p=this.container.querySelector("#battery-meter"),f=this.container.querySelector("#grid-meter"),v=this.container.querySelector("#load-meter");u&&u.appendChild(h.createElement()),p&&p.appendChild(l.createElement()),f&&f.appendChild(d.createElement()),v&&v.appendChild(m.createElement()),this.meters.set("production",h),this.meters.set("battery",l),this.meters.set("grid",d),this.meters.set("load",m),h.startAnimation(),l.startAnimation(),d.startAnimation(),m.startAnimation(),h.updateDimming(),l.updateDimming(),d.updateDimming(),m.updateDimming();const w=this.container.querySelector(".energy-flow-svg");w&&!this.flowRenderer&&(this.flowRenderer=new Y(w,this.meterPositions),this.flowRenderer.start())})}createMeterDefs(){return`
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
    `}extractIconPaths(){["production","battery","grid","load"].forEach(async e=>{const i=this.container.querySelector(`#icon-${e}`),s=this.container.querySelector(`#ha-icon-${e}`);if(i&&s){const r=s.getAttribute("icon")||"unknown",a=this.iconCache.get(r);if(a){this.renderIconPath(i,a);return}const n=await this.extractIconPath(s,r);this.renderIconPath(i,n)}}),this.iconsExtracted=!0}async extractIconPath(t,e,i=10){return new Promise(s=>{const r=(a=1,n=i)=>{const o=a===1?0:100*a,c=window.setTimeout(async()=>{try{const g=t.shadowRoot;if(!g){a<n?r(a+1,n):s(null);return}const h=g.querySelector("svg");if(!h){a<n?r(a+1,n):s(null);return}const l=h.querySelector("path");if(l){const d=l.getAttribute("d");d&&this.iconCache&&this.iconCache.set(e,d),s(d)}else a<n?r(a+1,n):s(null)}catch(g){console.error(`Failed to extract icon path for ${e} (attempt ${a}):`,g),a<n?r(a+1,n):s(null)}},o);this.iconExtractionTimeouts.add(c)};r()})}renderIconPath(t,e){if(t.innerHTML="",e){const i=document.createElementNS("http://www.w3.org/2000/svg","path");i.setAttribute("d",e),i.setAttribute("fill","rgb(160, 160, 160)"),i.setAttribute("transform","scale(1)"),t.appendChild(i)}else{const i=document.createElementNS("http://www.w3.org/2000/svg","circle");i.setAttribute("cx","12"),i.setAttribute("cy","12"),i.setAttribute("r","8"),i.setAttribute("fill","rgb(160, 160, 160)"),t.appendChild(i)}}}function N(y,t,e){const i=[];for(let r=0;r<=4;r++){const a=e.top+r*t/4;i.push(`<line x1="${e.left}" y1="${a}" x2="${e.left+y}" y2="${a}" stroke="white" stroke-width="1" />`)}return i.join(`
`)}function G(y,t,e,i){const s=[],a=new Date;for(let n=0;n<=6;n++){const o=i-n*i/6,c=new Date(a.getTime()-o*60*60*1e3),g=c.getMinutes(),h=g<15?0:g<45?30:0,l=g>=45?1:0;c.setMinutes(h),c.setSeconds(0),c.setMilliseconds(0),l&&c.setHours(c.getHours()+l);const d=e.left+n*y/6,m=e.top+t+20,u=c.getHours(),p=u===0?12:u>12?u-12:u,f=u>=12?"PM":"AM";s.push(`
      <text x="${d}" y="${m}" text-anchor="middle" fill="rgb(160, 160, 160)" font-size="11">
        ${p} ${f}
      </text>
    `)}return s.join(`
`)}function X(y,t,e,i,s,r){const a=[];return a.push(`<text x="${e.left-10}" y="${e.top+5}" text-anchor="end" fill="rgb(160, 160, 160)" font-size="11">${Math.round(i)}W</text>`),a.push(`<text x="${e.left-10}" y="${r+5}" text-anchor="end" fill="rgb(160, 160, 160)" font-size="11">0</text>`),a.push(`<text x="${e.left-10}" y="${r+t+5}" text-anchor="end" fill="rgb(160, 160, 160)" font-size="11">-${Math.round(s)}W</text>`),a.join(`
`)}function V(y,t,e,i,s,r,a,n){const o=[],c=[];let g=!1;if(y.forEach((l,d)=>{const m=s.left+d*t,u=r(l),p=typeof a=="function"?a(l):a;u>0&&(g=!0);const f=n==="down"?-(u+p)*i:(u+p)*i,v=n==="down"?-p*i:p*i;o.push({x:m,y:e+f}),c.push({x:m,y:e+v})}),!g)return null;let h=`M ${o[0].x} ${o[0].y}`;for(let l=1;l<o.length;l++)h+=` L ${o[l].x} ${o[l].y}`;for(let l=c.length-1;l>=0;l--)h+=` L ${c[l].x} ${c[l].y}`;return h+=" Z",h}function it(y,t,e,i,s,r){if(!y||y.length===0)return"";const a=y.length>1?t/(y.length-1):0;return`<path d="${y.map((o,c)=>{const g=s.left+c*a,h=r-o.load*i;return`${c===0?"M":"L"} ${g},${h}`}).join(" ")}" fill="none" stroke="#CCCCCC" stroke-width="3" opacity="0.9" />`}class H{constructor(t,e){this.points=[],this.maxPoints=1,this.width=0,this.xOffset=0,this.zeroLineY=0,this.scale=1;const i=document.createElementNS("http://www.w3.org/2000/svg","path");e.id&&i.setAttribute("id",e.id),e.fill&&i.setAttribute("fill",e.fill),e.stroke&&i.setAttribute("stroke",e.stroke),e.strokeWidth&&i.setAttribute("stroke-width",String(e.strokeWidth)),e.opacity!==void 0&&i.setAttribute("opacity",String(e.opacity)),i.setAttribute("fill-rule","evenodd"),i.style.cursor="pointer",t.appendChild(i),this.path=i,this.mode=e.mode,this.direction=e.direction}reset(t,e,i,s,r=0){this.maxPoints=Math.max(2,t),this.width=e,this.xOffset=r,this.zeroLineY=i,this.scale=s,this.points=[],this.render()}addPoint(t,e=0){const i=this.width/(this.maxPoints-1);this.points.length===this.maxPoints&&this.points.shift(),this.points.push({x:0,top:this.toY(t+e),base:this.toY(e)});for(let s=0;s<this.points.length;s++)this.points[s].x=this.xOffset+s*i;this.render()}toY(t){return this.direction==="down"?this.zeroLineY-t*this.scale:this.zeroLineY+t*this.scale}render(){if(this.points.length===0){this.path.setAttribute("d","");return}if(this.mode==="line"){const s=this.points.map((r,a)=>`${a===0?"M":"L"} ${r.x.toFixed(2)} ${r.top.toFixed(2)}`);this.path.setAttribute("d",s.join(" ")),this.path.setAttribute("fill","none");return}const t=this.points.map((s,r)=>`${r===0?"M":"L"} ${s.x.toFixed(2)} ${s.top.toFixed(2)}`),e=[...this.points].reverse().map(s=>`L ${s.x.toFixed(2)} ${s.base.toFixed(2)}`),i=`${t.join(" ")} ${e.join(" ")} Z`;this.path.setAttribute("d",i)}}class st{constructor(t,e,i){this.iconCache=new Map,this.chartRenderPending=!1,this.lastIndicatorUpdate=0,this.fetchDeferMs=16,this.cacheMaxAgeMs=300*1e3,this.refreshIntervalMs=60*1e3,this.streamingQueue=[],this.streamingActive=!1,this.streamingHoursToShow=12,this.hass=t,this.config=e,this.fireEvent=i}getEntityId(t){return t?.entity||""}getTapAction(t){return t?.tap}ensureVisibilityListener(){this.visibilityHandler||(this.visibilityHandler=()=>{if(!this.isVisible())return;const t=this.containerRef?.querySelector(".chart-svg");t&&this.shouldRefresh()&&this.scheduleDataFetch(t,12,"visibility",!0)},document.addEventListener("visibilitychange",this.visibilityHandler))}isVisible(){return!this.containerRef||document.hidden||!this.containerRef.isConnected?!1:this.containerRef.offsetParent!==null}shouldRefresh(){return this.chartRenderPending||!this.isVisible()?!1:this.chartDataCache?Date.now()-this.chartDataCache.timestamp>this.refreshIntervalMs:!0}scheduleDataFetch(t,e,i,s=!1){this.chartRenderPending||(s&&(this.chartDataCache=void 0,this.streamingMeta=void 0),this.chartRenderPending=!0,setTimeout(()=>this.fetchAndRenderChart(t,e),this.fetchDeferMs))}setConfig(t){this.config=t}updateLiveValues(t){this.liveChartValues=t}render(t){if(this.containerRef=t,this.ensureVisibilityListener(),!t.querySelector(".chart-view"))this.initializeChartStructure(t);else{this.liveChartValues&&this.throttledUpdateChartIndicators(t);const e=t.querySelector(".chart-svg");e&&this.shouldRefresh()&&this.scheduleDataFetch(e,12,"stale",!0)}}initializeChartStructure(t){t.innerHTML=`
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
        </style>
        <div class="chart-view">
          <div class="chart-container">
            <svg class="chart-svg" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid meet">
              <!-- Chart will be rendered here -->
            </svg>
          </div>
        </div>
      </ha-card>
    `;const e=t.querySelector(".chart-svg");e&&(this.renderBaseFrame(e,12),this.scheduleDataFetch(e,12,"initial"))}throttledUpdateChartIndicators(t){this.indicatorUpdateTimeout&&(clearTimeout(this.indicatorUpdateTimeout),this.indicatorUpdateTimeout=void 0);const e=Date.now(),i=e-this.lastIndicatorUpdate,s=250;if(i>=s){const r=t.querySelector(".chart-svg");r&&this.updateChartIndicators(r),this.lastIndicatorUpdate=e}else{const r=s-i;this.indicatorUpdateTimeout=window.setTimeout(()=>{const a=t.querySelector(".chart-svg");a&&this.updateChartIndicators(a),this.lastIndicatorUpdate=Date.now(),this.indicatorUpdateTimeout=void 0},r)}}cleanup(){this.indicatorUpdateTimeout&&(clearTimeout(this.indicatorUpdateTimeout),this.indicatorUpdateTimeout=void 0),this.visibilityHandler&&(document.removeEventListener("visibilitychange",this.visibilityHandler),this.visibilityHandler=void 0),this.streamingFrameId&&(cancelAnimationFrame(this.streamingFrameId),this.streamingFrameId=void 0),this.streamingActive=!1,this.chartDataCache=void 0}hideLoading(t){}getIcon(t,e){if(t?.icon)return t.icon;const i=t?.entity;if(i&&this.hass?.states?.[i]){const s=this.hass.states[i].attributes?.icon;if(s)return s}return e}async fetchAndRenderChart(t,e=12){this.chartRenderPending||(this.chartRenderPending=!0);const i=Date.now(),s=this.chartDataCache?i-this.chartDataCache.timestamp:1/0;if(this.chartDataCache&&s>=this.cacheMaxAgeMs&&(this.chartDataCache=void 0),this.chartDataCache&&s<this.cacheMaxAgeMs){requestAnimationFrame(()=>{this.renderChartFromCache(t,e)}),this.chartRenderPending=!1;return}const r=new Date,a=new Date(r.getTime()-e*60*60*1e3);try{const[n,o,c,g]=await this.fetchHistoriesProgressively(a,r);await this.drawStackedAreaChart(t,n,o,c,g,e)}catch(n){console.error("Error fetching chart data:",n),this.chartRenderPending=!1,t.innerHTML=`
        <text x="400" y="200" text-anchor="middle" fill="rgb(160, 160, 160)" font-size="14">
          Error loading chart data
        </text>
      `,this.hideLoading(t)}}async fetchHistory(t,e,i){if(!t)return[];const s=`history/period/${e.toISOString()}?filter_entity_id=${t}&end_time=${i.toISOString()}&minimal_response&no_attributes`,r=await this.hass.callApi("GET",s);return r&&r.length>0?r[0]:[]}async fetchHistoriesProgressively(t,e){const i=[this.getEntityId(this.config.production),this.getEntityId(this.config.grid),this.getEntityId(this.config.load),this.getEntityId(this.config.battery)],s=[];for(const r of i)s.push(await this.fetchHistory(r,t,e)),await new Promise(a=>setTimeout(a,this.fetchDeferMs));return s}renderBaseFrame(t,e){const r={top:20,right:150,bottom:40,left:60},a=800-r.left-r.right,n=400-r.top-r.bottom,o=n*.5,c=r.top+o,g=`
      <g opacity="0.1">
        ${N(a,n,r)}
      </g>
      <line x1="${r.left}" y1="${c}" x2="${r.left+a}" y2="${c}" stroke="rgb(160, 160, 160)" stroke-width="1" stroke-dasharray="4,4" />
    `;t.innerHTML=`
      <g id="chart-base"></g>
      <g id="chart-content">
        <g id="chart-demand"></g>
        <g id="chart-supply"></g>
        <g id="chart-load"></g>
      </g>
      <g id="chart-icons"></g>
    `;const h=t.querySelector("#chart-base");h&&(h.innerHTML=g),this.ensureStreamingPlots(t);const l=e*12;if(this.streamingSupplyPlots&&this.streamingDemandPlots&&this.streamingLoadPlot){const d=r.left;this.streamingSupplyPlots.solar.reset(l,a,c,1,d),this.streamingSupplyPlots.batteryDischarge.reset(l,a,c,1,d),this.streamingSupplyPlots.gridImport.reset(l,a,c,1,d),this.streamingDemandPlots.batteryCharge.reset(l,a,c,1,d),this.streamingDemandPlots.gridExport.reset(l,a,c,1,d),this.streamingLoadPlot.reset(l,a,c,1,d)}}renderChartLayers(t,e,i,s,r,a,n,o,c,g,h=!0){const l=v=>{let w=t.querySelector(`#${v}`);return w||(w=document.createElementNS("http://www.w3.org/2000/svg","g"),w.setAttribute("id",v),t.appendChild(w)),w},d=l("chart-base"),m=l("chart-demand"),u=l("chart-supply"),p=l("chart-icons"),f=l("chart-load");d.innerHTML=e.baseContent,requestAnimationFrame(()=>{e.demandPaths!==null&&(m.innerHTML=e.demandPaths),e.supplyPaths!==null&&(u.innerHTML=e.supplyPaths),p.innerHTML=h?this.createChartIconSources():"",requestAnimationFrame(()=>{h&&(this.updateChartIndicators(t),this.attachChartAreaClickHandlers(t)),e.loadLine!==null&&this.addLoadLineOnTop(f,e.loadLine),this.hideLoading(t),h&&requestAnimationFrame(()=>{this.extractChartIcons(t,i,s,a,n,o,c,r,g)})})})}ensureStreamingPlots(t){const e=t.querySelector("#chart-supply"),i=t.querySelector("#chart-demand"),s=t.querySelector("#chart-load");!e||!i||!s||this.streamingSupplyPlots||(this.streamingSupplyPlots={solar:new H(e,{mode:"area",direction:"down",fill:"#388e3c",opacity:.85,id:"chart-area-solar"}),batteryDischarge:new H(e,{mode:"area",direction:"down",fill:"#1976d2",opacity:.8,id:"chart-area-battery-discharge"}),gridImport:new H(e,{mode:"area",direction:"down",fill:"#c62828",opacity:.8,id:"chart-area-grid-import"})},this.streamingDemandPlots={batteryCharge:new H(i,{mode:"area",direction:"up",fill:"#1976d2",opacity:.8,id:"chart-area-battery-charge"}),gridExport:new H(i,{mode:"area",direction:"up",fill:"#f9a825",opacity:.8,id:"chart-area-grid-export"})},this.streamingLoadPlot=new H(s,{mode:"line",direction:"down",stroke:"#CCCCCC",strokeWidth:3,opacity:.9,id:"load-line"}))}renderChartFromCache(t,e){if(!this.chartDataCache)return;const i=this.chartDataCache.dataPoints,s=Math.max(...i.map(x=>x.solar+x.batteryDischarge+x.gridImport),...i.map(x=>x.load)),r=Math.max(...i.map(x=>x.batteryCharge+x.gridExport)),a=s+r,n=a>0?s/a:.5,o=a>0?r/a:.5,c=800,g=400,h={top:20,right:150,bottom:40,left:60},l=c-h.left-h.right,d=g-h.top-h.bottom,m=d*n,u=d*o,p=s>0?m/(s*1.1):1,f=r>0?u/(r*1.1):1,v=h.top+m,w=Math.max(i.length,e*12),S=this.createStackedPaths(i,l,m,p,h,"supply",v,w),_=this.createStackedPaths(i,l,u,f,h,"demand",v,w),M=it(i,l,m,p,h,v),b=`
      <g opacity="0.1">
        ${N(l,d,h)}
      </g>
      <line x1="${h.left}" y1="${v}" x2="${h.left+l}" y2="${v}" stroke="rgb(160, 160, 160)" stroke-width="1" stroke-dasharray="4,4" />
      ${G(l,d,h,e)}
      ${X(m,u,h,s,r,v)}
    `;this.renderChartLayers(t,{baseContent:b,demandPaths:_,supplyPaths:S,loadLine:M},i,l,h,m,u,p,f,v,!0),this.chartRenderPending=!1}async drawStackedAreaChart(t,e,i,s,r,a){this.streamingMeta=void 0;const o=a*120,g=a*12,h=10,l=new Date,d=Math.floor(l.getMinutes()/5)*5,m=new Date(l.getFullYear(),l.getMonth(),l.getDate(),l.getHours(),d,0,0),u=new Date(m.getTime()-a*60*60*1e3);this.streamingQueue=[],this.streamingSvg=t,this.streamingHoursToShow=a,this.streamingActive||this.startStreamingRenderer();const p=240,f=[];for(let w=0;w<o;w+=p){const S=Math.min(w+p,o);w>0&&await new Promise(b=>setTimeout(b,0));for(let b=w;b<S;b++){const x=new Date(u.getTime()+b*30*1e3),P=this.interpolateValue(e,x),$=this.interpolateValue(i,x),C=this.interpolateValue(s,x);let A=this.interpolateValue(r,x);this.config.battery?.invert?.data&&(A=-A),f.push({time:x,solar:Math.max(0,P),batteryDischarge:Math.max(0,A),batteryCharge:Math.max(0,-A),gridImport:Math.max(0,$),gridExport:Math.max(0,-$),load:Math.max(0,C)})}const _=Math.floor((w-1)/h),M=Math.floor((S-1)/h);for(let b=Math.max(0,_);b<=M;b++){const x=b*h,P=Math.min(x+h,f.length);if(P-x===h){const $=new Date(u.getTime()+(b+1)*5*60*1e3),C=h;let A=0,I=0,k=0,D=0,T=0,F=0;for(let L=x;L<P;L++)A+=f[L].solar,I+=f[L].batteryDischarge,k+=f[L].batteryCharge,D+=f[L].gridImport,T+=f[L].gridExport,F+=f[L].load;this.streamingQueue.some(L=>L.time.getTime()===$.getTime())||this.streamingQueue.push({time:$,solar:A/C,batteryDischarge:I/C,batteryCharge:k/C,gridImport:D/C,gridExport:T/C,load:F/C})}}}const v=Math.floor((f.length-1)/h);for(let w=v+1;w<g;w++){const S=new Date(u.getTime()+(w+1)*5*60*1e3),_=w*h,M=Math.min(_+h,f.length),b=M-_;if(b>0){let x=0,P=0,$=0,C=0,A=0,I=0;for(let k=_;k<M;k++)x+=f[k].solar,P+=f[k].batteryDischarge,$+=f[k].batteryCharge,C+=f[k].gridImport,A+=f[k].gridExport,I+=f[k].load;this.streamingQueue.some(k=>k.time.getTime()===S.getTime())||this.streamingQueue.push({time:S,solar:x/b,batteryDischarge:P/b,batteryCharge:$/b,gridImport:C/b,gridExport:A/b,load:I/b})}}}interpolateValue(t,e){if(t.length===0)return 0;let i=t[0],s=Math.abs(new Date(t[0].last_changed).getTime()-e.getTime());for(const r of t){const a=Math.abs(new Date(r.last_changed).getTime()-e.getTime());a<s&&(s=a,i=r)}return parseFloat(i.state)||0}createStackedPaths(t,e,i,s,r,a,n,o){const c=o??t.length,g=Math.max(2,c),h=e/(g-1);if(a==="supply"){const l=V(t,h,n,s,r,u=>u.solar,0,"down"),d=V(t,h,n,s,r,u=>u.batteryDischarge,u=>u.solar,"down"),m=V(t,h,n,s,r,u=>u.gridImport,u=>u.solar+u.batteryDischarge,"down");return`
        ${m?`<path id="chart-area-grid-import" d="${m}" fill="#c62828" opacity="0.8" style="cursor: pointer;" />`:""}
        ${d?`<path id="chart-area-battery-discharge" d="${d}" fill="#1976d2" opacity="0.8" style="cursor: pointer;" />`:""}
        ${l?`<path id="chart-area-solar" d="${l}" fill="#388e3c" opacity="0.85" style="cursor: pointer;" />`:""}
      `}else{const l=V(t,h,n,s,r,m=>m.batteryCharge,0,"up"),d=V(t,h,n,s,r,m=>m.gridExport,m=>m.batteryCharge,"up");return`
        ${d?`<path id="chart-area-grid-export" d="${d}" fill="#f9a825" opacity="0.8" style="cursor: pointer;" />`:""}
        ${l?`<path id="chart-area-battery-charge" d="${l}" fill="#1976d2" opacity="0.8" style="cursor: pointer;" />`:""}
      `}}createChartIconSources(){const t=this.getIcon(this.config.load,"mdi:home-lightning-bolt"),e=this.getIcon(this.config.production,"mdi:solar-power"),i=this.getIcon(this.config.battery,"mdi:battery"),s=this.getIcon(this.config.grid,"mdi:transmission-tower");return`
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
          <ha-icon icon="${s}"></ha-icon>
        </div>
      </foreignObject>
    `}async extractChartIcons(t,e,i,s,r,a,n,o,c){if(e.length===0)return;const g=["load","solar","battery","grid"],h={};for(const l of g){const d=t.querySelector(`#chart-icon-source-${l}`);if(!d)continue;const m=d.querySelector("div");if(!m)continue;const u=m.querySelector("ha-icon");if(!u)continue;const p=u.getAttribute("icon");if(!p)continue;if(this.iconCache.has(p)){h[l]=this.iconCache.get(p)||null;continue}const f=await this.extractIconPath(u,p);h[l]=f,f&&this.iconCache.set(p,f)}this.renderChartIndicators(t,e,i,s,r,a,n,o,h,c)}async extractIconPath(t,e,i=10){for(let s=0;s<i;s++){try{const r=t.shadowRoot;if(!r){await new Promise(c=>setTimeout(c,100));continue}let a=r.querySelector("svg");if(!a){const c=r.querySelector("ha-svg-icon");c&&c.shadowRoot&&(a=c.shadowRoot.querySelector("svg"))}if(!a){await new Promise(c=>setTimeout(c,100));continue}const n=a.querySelector("path");if(!n){await new Promise(c=>setTimeout(c,100));continue}const o=n.getAttribute("d");if(o)return o}catch(r){console.error(`Failed to extract icon path for ${e} (attempt ${s+1}):`,r)}await new Promise(r=>setTimeout(r,100))}return null}renderChartIndicators(t,e,i,s,r,a,n,o,c,g){let h=t.querySelector("#chart-indicators");const l=!h;h||(h=document.createElementNS("http://www.w3.org/2000/svg","g"),h.setAttribute("id","chart-indicators"),t.appendChild(h)),l&&t.querySelectorAll('[id^="chart-icon-source-"]').forEach(x=>x.remove());let d;if(this.liveChartValues){const{grid:b,load:x,production:P}=this.liveChartValues,C=this.liveChartValues.battery;d={load:Math.max(0,x),solar:Math.max(0,P),batteryDischarge:Math.max(0,C),batteryCharge:Math.max(0,-C),gridImport:Math.max(0,b),gridExport:Math.max(0,-b)}}else d=e[e.length-1];const m=o.left+i,u=g-d.load*a,p=g-d.solar*a,f=g-(d.solar+d.batteryDischarge)*a,v=g-(d.solar+d.batteryDischarge+d.gridImport)*a,w=g+d.batteryCharge*n,S=g+(d.batteryCharge+d.gridExport)*n,_=b=>`${Math.round(b)} W`,M=(b,x,P,$,C,A="",I=!0,k,D)=>{let T=h.querySelector(`#${b}`);if(!I){T&&T.remove();return}if(!T){T=document.createElementNS("http://www.w3.org/2000/svg","g"),T.setAttribute("id",b),T.style.cursor="pointer";const L=c[$];if(L){const z=document.createElementNS("http://www.w3.org/2000/svg","g");z.setAttribute("class","indicator-icon"),z.setAttribute("transform","translate(10, -8) scale(0.67)");const B=document.createElementNS("http://www.w3.org/2000/svg","path");B.setAttribute("d",L),B.setAttribute("fill",P),z.appendChild(B),T.appendChild(z)}const R=document.createElementNS("http://www.w3.org/2000/svg","text");R.setAttribute("class","indicator-text"),R.setAttribute("x","28"),R.setAttribute("y","4"),R.setAttribute("fill",P),R.setAttribute("font-size","12"),R.setAttribute("font-weight","600"),T.appendChild(R),k&&D&&T.addEventListener("click",()=>{E(this.hass,this.fireEvent,D,k)}),h.appendChild(T)}T.setAttribute("transform",`translate(${m+10}, ${x})`);const F=T.querySelector(".indicator-text");F&&(F.textContent=`${A}${C}`)};M("indicator-solar",p,"#388e3c","solar",_(d.solar),"",d.solar>0,this.getEntityId(this.config.production),this.getTapAction(this.config.production)),M("indicator-battery-discharge",f,"#1976d2","battery",_(d.batteryDischarge),"+",d.batteryDischarge>0,this.getEntityId(this.config.battery),this.getTapAction(this.config.battery)),M("indicator-grid-import",v,"#c62828","grid",_(d.gridImport),"",d.gridImport>0,this.getEntityId(this.config.grid),this.getTapAction(this.config.grid)),M("indicator-battery-charge",w,"#1976d2","battery",_(d.batteryCharge),"-",d.batteryCharge>0,this.getEntityId(this.config.battery),this.getTapAction(this.config.battery)),M("indicator-grid-export",S,"#f9a825","grid",_(d.gridExport),"",d.gridExport>0,this.getEntityId(this.config.grid),this.getTapAction(this.config.grid)),M("indicator-load",u,"#CCCCCC","load",_(d.load),"",!0,this.getEntityId(this.config.load),this.getTapAction(this.config.load))}updateChartIndicators(t){if(!this.chartDataCache||!t)return;const e=this.chartDataCache.dataPoints,i=Math.max(...e.map(S=>S.solar+S.batteryDischarge+S.gridImport),...e.map(S=>S.load)),s=Math.max(...e.map(S=>S.batteryCharge+S.gridExport)),r=i+s,a=r>0?i/r:.5,n=r>0?s/r:.5,o=800,c=400,g={top:20,right:150,bottom:40,left:60},h=o-g.left-g.right,l=c-g.top-g.bottom,d=l*a,m=l*n,u=i>0?d/(i*1.1):1,p=s>0?m/(s*1.1):1,f=g.top+d,v={},w={load:this.config.load,solar:this.config.production,battery:this.config.battery,grid:this.config.grid};["load","solar","battery","grid"].forEach(S=>{const _=this.getIcon(w[S],"");this.iconCache.has(_)&&(v[S]=this.iconCache.get(_)||null)}),this.renderChartIndicators(t,e,h,d,m,u,p,g,v,f)}addLoadLineOnTop(t,e){if(!e)return;const i=t.querySelector("#load-line");i&&i.remove();const s=e.match(/d="([^"]+)"/);if(!s)return;const r=s[1],a=document.createElementNS("http://www.w3.org/2000/svg","path");a.setAttribute("id","load-line"),a.setAttribute("d",r),a.setAttribute("fill","none"),a.setAttribute("stroke","#CCCCCC"),a.setAttribute("stroke-width","3"),a.setAttribute("opacity","0.9"),a.style.cursor="pointer",a.addEventListener("click",()=>{E(this.hass,this.fireEvent,this.getTapAction(this.config.load),this.getEntityId(this.config.load))}),t.appendChild(a)}attachChartAreaClickHandlers(t){const e=t.querySelector("#chart-area-solar");e&&e.addEventListener("click",()=>{E(this.hass,this.fireEvent,this.getTapAction(this.config.production),this.getEntityId(this.config.production))});const i=t.querySelector("#chart-area-battery-discharge");i&&i.addEventListener("click",()=>{E(this.hass,this.fireEvent,this.getTapAction(this.config.battery),this.getEntityId(this.config.battery))});const s=t.querySelector("#chart-area-battery-charge");s&&s.addEventListener("click",()=>{E(this.hass,this.fireEvent,this.getTapAction(this.config.battery),this.getEntityId(this.config.battery))});const r=t.querySelector("#chart-area-grid-import");r&&r.addEventListener("click",()=>{E(this.hass,this.fireEvent,this.getTapAction(this.config.grid),this.getEntityId(this.config.grid))});const a=t.querySelector("#chart-area-grid-export");a&&a.addEventListener("click",()=>{E(this.hass,this.fireEvent,this.getTapAction(this.config.grid),this.getEntityId(this.config.grid))})}startStreamingRenderer(){if(this.streamingActive)return;this.streamingActive=!0;const t=Number(globalThis.__mockStreamStepDelayMs??0)||0;this.streamingSvg&&this.ensureStreamingPlots(this.streamingSvg);const e=()=>{if(!this.streamingActive||!this.streamingSvg)return;const i=this.streamingQueue.shift();i&&(this.streamingMeta||this.initializeStreamingMeta(),this.streamingMeta&&this.streamingSupplyPlots&&this.streamingDemandPlots&&this.streamingLoadPlot&&(this.streamingSupplyPlots.solar.addPoint(i.solar,0),this.streamingSupplyPlots.batteryDischarge.addPoint(i.batteryDischarge,i.solar),this.streamingSupplyPlots.gridImport.addPoint(i.gridImport,i.solar+i.batteryDischarge),this.streamingDemandPlots.batteryCharge.addPoint(i.batteryCharge,0),this.streamingDemandPlots.gridExport.addPoint(i.gridExport,i.batteryCharge),this.streamingLoadPlot.addPoint(i.load,0))),this.streamingQueue.length>0?t>0?setTimeout(()=>{this.streamingFrameId=requestAnimationFrame(e)},t):this.streamingFrameId=requestAnimationFrame(e):(this.streamingActive=!1,this.streamingSvg&&this.finalizeChart(this.streamingSvg,[],this.streamingHoursToShow))};this.streamingFrameId=requestAnimationFrame(e)}initializeStreamingMeta(){if(!this.streamingSvg||!this.streamingSupplyPlots)return;const t=800,e=400,i={top:20,right:150,bottom:40,left:60},s=t-i.left-i.right,r=e-i.top-i.bottom;let a=1,n=1;for(const f of this.streamingQueue){const v=f.solar+f.batteryDischarge+f.gridImport,w=f.batteryCharge+f.gridExport;a=Math.max(a,v,f.load),n=Math.max(n,w)}const o=a+n,c=o>0?a/o:.5,g=o>0?n/o:.5,h=r*c,l=r*g,d=i.top+h,m=a>0?h/(a*1.1):1,u=n>0?l/(n*1.1):1;this.streamingMeta={expectedPoints:this.streamingQueue.length,supplyScale:m,demandScale:u,zeroLineY:d,chartWidth:s};const p=i.left;this.streamingSupplyPlots.solar.reset(this.streamingMeta.expectedPoints,s,d,m,p),this.streamingSupplyPlots.batteryDischarge.reset(this.streamingMeta.expectedPoints,s,d,m,p),this.streamingSupplyPlots.gridImport.reset(this.streamingMeta.expectedPoints,s,d,m,p),this.streamingDemandPlots.batteryCharge.reset(this.streamingMeta.expectedPoints,s,d,u,p),this.streamingDemandPlots.gridExport.reset(this.streamingMeta.expectedPoints,s,d,u,p),this.streamingLoadPlot.reset(this.streamingMeta.expectedPoints,s,d,m,p)}async finalizeChart(t,e,i){if(this.streamingMeta){const a={top:20,right:150,bottom:40,left:60},n=800-a.left-a.right,o=400-a.top-a.bottom,c=this.streamingMeta.zeroLineY,g=c-a.top,h=o-g,l=g/(this.streamingMeta.supplyScale*1.1),d=h/(this.streamingMeta.demandScale*1.1),m=t.querySelector("#chart-base");if(m){const u=`
          ${G(n,o,a,i)}
          ${X(g,h,a,l,d,c)}
        `;m.insertAdjacentHTML("beforeend",u)}}await this.extractChartIcons(t,[],0,0,0,0,0,{top:0,right:0,bottom:0,left:0},0),this.updateChartIndicators(t),this.attachChartAreaClickHandlers(t),this.chartRenderPending=!1}clearCache(){this.streamingFrameId&&(cancelAnimationFrame(this.streamingFrameId),this.streamingFrameId=void 0),this.streamingActive=!1,this.streamingQueue=[],this.chartDataCache=void 0}}class rt extends HTMLElement{constructor(){super(),this._resizeObserver=null}static getStubConfig(){return{}}static getConfigForm(){return Q()}connectedCallback(){this._resizeObserver=new ResizeObserver(()=>{}),this.parentElement&&this._resizeObserver.observe(this.parentElement),this._resizeObserver.observe(this)}disconnectedCallback(){this._resizeObserver&&(this._resizeObserver.disconnect(),this._resizeObserver=null),this._defaultRenderer&&this._defaultRenderer.stop(),this._chartRenderer&&this._chartRenderer.cleanup()}setConfig(t){this._config=Z(t),this._renderSafely("setConfig")}set hass(t){this._hass=t,this._renderSafely("hass update")}_renderSafely(t){try{this._render()}catch(e){console.error("[EnergyFlowCard] render failed during",t,e),this.innerHTML=`
        <ha-card>
          <div style="padding:16px;">
            Energy Flow Card failed to render. Check browser console for details.
          </div>
        </ha-card>
      `}}_render(){if(!this._config||!this._hass||!this._config.load)return;const t=this._getEntityState(this._config.grid?.entity),e=this._getEntityState(this._config.load.entity),i=this._getEntityState(this._config.production?.entity),s=this._getEntityState(this._config.battery?.entity),r=parseFloat(t?.state??"0")||0,a=parseFloat(e?.state??"0")||0,n=parseFloat(i?.state??"0")||0;let o=parseFloat(s?.state??"0")||0;this._config.battery?.invert?.data&&(o=-o);const c=this._config.mode||"default";if(this._lastViewMode==="chart"&&c!=="chart"&&this._chartRenderer&&this._chartRenderer.cleanup(),c==="compact"||c==="compact-battery"){this._renderCompactView(r,a,n,o,c),this._lastViewMode=c;return}if(c==="chart"){this._chartRenderer?this._chartRenderer.setConfig(this._config):this._chartRenderer=new st(this._hass,this._config,this._fireEvent.bind(this)),this._chartRenderer.updateLiveValues({grid:r,load:a,production:n,battery:o}),this._chartRenderer.render(this),this._lastViewMode=c;return}this._defaultRenderer?this._defaultRenderer.setConfig(this._config):this._defaultRenderer=new et(this,this._config,this._hass,(h,l)=>J(this._config,this._hass,h,l),(h,l)=>W(this._config,this._hass,h,l),this._fireEvent.bind(this));const g=this._calculateFlows(r,n,a,o);this._defaultRenderer.render({grid:r,load:a,production:n,battery:o,flows:g}),this._lastViewMode=c}_getEntityState(t){if(t)return this._hass?.states?.[t]}_fireEvent(t,e={}){if(t==="call-service"&&this._hass){this._hass.callService(e.domain,e.service,e.service_data||{},e.target);return}const i=new CustomEvent(t,{detail:e,bubbles:!0,composed:!0});this.dispatchEvent(i)}_calculateFlows(t,e,i,s){return U({grid:t,production:e,load:i,battery:s})}_renderCompactView(t,e,i,s,r){if(!this._config||!this._hass)return;this._compactRenderer?(this._compactRenderer.setConfig(this._config),this._compactRenderer.setViewMode(r)):this._compactRenderer=new K(this,this._config,this._hass,r,(o,c)=>W(this._config,this._hass,o,c),(o,c)=>E(this._hass,this._fireEvent.bind(this),o,c));const a=this._calculateFlows(t,i,e,s);let n=null;if(this._config.battery?.soc_entity){const o=this._getEntityState(this._config.battery.soc_entity);n=parseFloat(o?.state??"0")||0}this._compactRenderer.render({grid:t,load:e,production:i,battery:s,flows:a,batterySoc:n})}}const j="energy-flow-card";customElements.get(j)?console.info("[EnergyFlowCard] custom element already defined"):(customElements.define(j,rt),console.info("[EnergyFlowCard] defined custom element")),window.customCards=window.customCards||[],window.customCards.push({type:"custom:energy-flow-card",name:"Energy Flow Card",description:"A test energy-flow card."})})();

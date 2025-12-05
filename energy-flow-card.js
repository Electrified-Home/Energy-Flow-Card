(function(){"use strict";class F{constructor(e,t,i,s,o,a,n,r,c=!1,l=!1,u,h,p){this.id=e,this._value=t,this.min=i,this.max=s,this.bidirectional=o,this.label=a,this.icon=n,this.units=r,this._invertView=c,this.showPlus=l,this.tapAction=u,this.entityId=h,this.fireEventCallback=p,this.element=null,this.radius=50,this.boxWidth=120,this.boxHeight=135,this.boxRadius=16,this.centerX=this.boxWidth/2,this.centerY=this.radius+25,this.offsetX=-this.centerX,this.offsetY=-this.centerY,this.needleState={target:0,current:0,ghost:0},this._lastAnimationTime=null,this._animationFrameId=null,this._updateNeedleAngle()}get value(){return this._value}set value(e){if(this._value!==e&&(this._value=e,this._updateNeedleAngle(),this.element)){const t=this.element.querySelector(`#value-${this.id}`);t&&(t.textContent=this._formatValueText()),this.updateDimming()}}get invertView(){return this._invertView}set invertView(e){if(this._invertView!==e&&(this._invertView=e,this._updateNeedleAngle(),this.element)){const t=this.element.querySelector(`#value-${this.id}`);t&&(t.textContent=this._formatValueText())}}get displayValue(){return this._invertView?-this._value:this._value}_formatValueText(){const e=this.displayValue,t=e.toFixed(0);return e<0?t+" ":e>0&&this.showPlus?"+"+t+" ":t}_updateNeedleAngle(){let e,t;const i=this.displayValue;if(this.bidirectional){const s=this.max-this.min;e=Math.min(Math.max((i-this.min)/s,0),1),t=180-e*180}else e=Math.min(Math.max(i/this.max,0),1),t=180-e*180;this.needleState.target=t}updateDimming(){if(!this.element)return;const e=this.element.querySelector(`#dimmer-${this.id}`);if(e){const t=Math.abs(this.value)<.5;e.setAttribute("opacity",t?"0.3":"0")}}startAnimation(){if(this._animationFrameId)return;const e=t=>{this._lastAnimationTime||(this._lastAnimationTime=t);const i=t-this._lastAnimationTime;if(this._lastAnimationTime=t,!this.element){this._animationFrameId=null;return}const s=this.radius-5,o=Math.min(i/150,1);this.needleState.current+=(this.needleState.target-this.needleState.current)*o;const a=Math.min(i/400,1);this.needleState.ghost+=(this.needleState.current-this.needleState.ghost)*a;const n=10;this.needleState.ghost<this.needleState.current-n?this.needleState.ghost=this.needleState.current-n:this.needleState.ghost>this.needleState.current+n&&(this.needleState.ghost=this.needleState.current+n);const r=this.element.querySelector(`#needle-${this.id}`);if(r){const l=this.needleState.current*Math.PI/180,u=this.centerX+s*Math.cos(l),h=this.centerY-s*Math.sin(l);r.setAttribute("x2",String(u)),r.setAttribute("y2",String(h))}const c=this.element.querySelector(`#ghost-needle-${this.id}`);if(c){const l=this.needleState.ghost*Math.PI/180,u=this.centerX+s*Math.cos(l),h=this.centerY-s*Math.sin(l);c.setAttribute("x2",String(u)),c.setAttribute("y2",String(h))}this._animationFrameId=requestAnimationFrame(e)};this._animationFrameId=requestAnimationFrame(e)}stopAnimation(){this._animationFrameId&&(cancelAnimationFrame(this._animationFrameId),this._animationFrameId=null,this._lastAnimationTime=null)}_handleTapAction(){if(!this.fireEventCallback)return;const e=this.tapAction||{action:"more-info"};switch(e.action||"more-info"){case"more-info":const i=e.entity||this.entityId;i&&this.fireEventCallback("hass-more-info",{entityId:i});break;case"navigate":e.navigation_path&&(history.pushState(null,"",e.navigation_path),this.fireEventCallback("location-changed",{replace:e.navigation_replace||!1}));break;case"url":e.url_path&&window.open(e.url_path);break;case"toggle":this.entityId&&this.fireEventCallback("call-service",{domain:"homeassistant",service:"toggle",service_data:{entity_id:this.entityId}});break;case"perform-action":if(e.perform_action){const[s,o]=e.perform_action.split(".");this.fireEventCallback("call-service",{domain:s,service:o,service_data:e.data||{},target:e.target})}break;case"assist":this.fireEventCallback("show-dialog",{dialogTag:"ha-voice-command-dialog",dialogParams:{pipeline_id:e.pipeline_id||"last_used",start_listening:e.start_listening}});break}}createElement(){const e=this.displayValue;let t,i;if(this.bidirectional){const M=this.max-this.min;t=Math.min(Math.max((e-this.min)/M,0),1),i=180-t*180}else t=Math.min(Math.max(e/this.max,0),1),i=180-t*180;this.needleState.target=i,this.needleState.current=i,this.needleState.ghost=i;const o=(this.bidirectional?[this.min,0,this.max]:[0,this.max/2,this.max]).map(M=>{const b=(180-(this.bidirectional?(M-this.min)/(this.max-this.min):M/this.max)*180)*Math.PI/180,E=this.radius,T=this.radius-8,A=this.centerX+E*Math.cos(b),k=this.centerY-E*Math.sin(b),D=this.centerX+T*Math.cos(b),W=this.centerY-T*Math.sin(b);return`<line x1="${A}" y1="${k}" x2="${D}" y2="${W}" stroke="rgb(160, 160, 160)" stroke-width="2" />`}).join(""),r=(180-(this.bidirectional?(0-this.min)/(this.max-this.min):0)*180)*Math.PI/180,c=this.centerX,l=this.centerY,u=this.centerX+this.radius*Math.cos(r),h=this.centerY-this.radius*Math.sin(r),p=`<line x1="${c}" y1="${l}" x2="${u}" y2="${h}" stroke="rgb(100, 100, 100)" stroke-width="2" />`,w=i*Math.PI/180,S=this.radius-5,g=this.centerX+S*Math.cos(w),m=this.centerY-S*Math.sin(w),f=this.centerY+5,d=this.centerY+this.radius*.5,x=this.centerY+this.radius*.7,_=`
      <g transform="translate(${this.offsetX}, ${this.offsetY})">
        <defs>
          <clipPath id="clip-${this.id}-local">
            <rect x="0" y="0" width="${this.boxWidth}" height="${f+2}" />
          </clipPath>
        </defs>
        
        <rect x="0" y="0" width="${this.boxWidth}" height="${this.boxHeight}" rx="${this.boxRadius}" ry="${this.boxRadius}" fill="rgb(40, 40, 40)" filter="url(#drop-shadow)" />
        
        <g clip-path="url(#clip-${this.id}-local)">
          <circle cx="${this.centerX}" cy="${this.centerY}" r="${this.radius}" fill="rgb(70, 70, 70)" />
          ${p}
        </g>
        
        ${o}
        
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
        
        <line id="ghost-needle-${this.id}" x1="${this.centerX}" y1="${this.centerY}" x2="${g}" y2="${m}" stroke="rgb(255, 255, 255)" stroke-width="4" stroke-linecap="round" opacity="0.3" />
        
        <line id="needle-${this.id}" x1="${this.centerX}" y1="${this.centerY}" x2="${g}" y2="${m}" stroke="rgb(255, 255, 255)" stroke-width="4" stroke-linecap="round" />
        
        <circle cx="${this.centerX}" cy="${this.centerY}" r="5" fill="rgb(255, 255, 255)" />
        
        <text id="value-${this.id}" x="${this.centerX}" y="${d}" text-anchor="middle" font-size="16" fill="rgb(255, 255, 255)" font-weight="600">${this._formatValueText()}</text>
        
        <text x="${this.centerX}" y="${x}" text-anchor="middle" font-size="8" fill="rgb(160, 160, 160)" font-weight="400" letter-spacing="0.5">${this.units}</text>
        
        <rect id="dimmer-${this.id}" x="0" y="0" width="${this.boxWidth}" height="${this.boxHeight}" rx="${this.boxRadius}" ry="${this.boxRadius}" fill="black" opacity="0" pointer-events="none" style="transition: opacity 0.8s ease-in-out;" />
      </g>
    `,$=document.createElementNS("http://www.w3.org/2000/svg","svg");$.innerHTML=_;const y=$.firstElementChild;return this.element=y,(!this.tapAction||this.tapAction.action!=="none")&&(y.style.cursor="pointer",y.addEventListener("click",M=>{this._handleTapAction(),M.stopPropagation()}),y.addEventListener("mouseenter",()=>{y.style.filter="brightness(1.1)"}),y.addEventListener("mouseleave",()=>{y.style.filter=""})),y}}function q(C){const e=Math.max(0,C.production),t=C.grid,i=C.battery,s=Math.max(0,C.load),o={productionToLoad:0,productionToBattery:0,productionToGrid:0,gridToLoad:0,gridToBattery:0,batteryToLoad:0};let a=e,n=s;if(a>0&&n>0&&(o.productionToLoad=Math.min(a,n),a-=o.productionToLoad,n-=o.productionToLoad),i<0&&a>0&&(o.productionToBattery=Math.min(a,Math.abs(i)),a-=o.productionToBattery),i>0&&n>0&&(o.batteryToLoad=Math.min(i,n),n-=o.batteryToLoad),n>0&&t>0&&(o.gridToLoad=Math.min(t,n),n-=o.gridToLoad),i<0&&t>10){const r=Math.abs(i)-o.productionToBattery;r>1&&(o.gridToBattery=Math.min(t-o.gridToLoad,r))}return t<-10&&(o.productionToGrid=Math.abs(t)),o}class L extends HTMLElement{constructor(){super(),this._resizeObserver=null,this._animationFrameId=null,this._flowDots=new Map,this._lastAnimationTime=null,this._iconCache=new Map,this._iconsExtracted=!1,this._meters=new Map,this._speedMultiplier=.8,this._dotsPerFlow=3;const e=500,t=470,i=5,s=3;this._meterPositions={production:{x:60+i,y:80+s},battery:{x:130+i,y:240+s},grid:{x:60+i,y:400+s},load:{x:360+i,y:240+s}},this._canvasWidth=e,this._canvasHeight=t}static getStubConfig(){return{}}static getConfigForm(){return{schema:[{name:"view_mode",label:"View Mode",selector:{select:{options:[{value:"default",label:"Default"},{value:"compact",label:"Compact Bar"}]}}},{name:"grid_entity",label:"Grid",required:!0,selector:{entity:{domain:"sensor",device_class:"power"}}},{name:"grid_name",selector:{entity_name:{}},context:{entity:"grid_entity"}},{name:"grid_icon",selector:{icon:{}},context:{icon_entity:"grid_entity"}},{name:"grid_min",label:"Grid Min (W)",selector:{number:{mode:"box"}}},{name:"grid_max",label:"Grid Max (W)",selector:{number:{mode:"box"}}},{name:"grid_tap_action",label:"Grid Tap Action",selector:{"ui-action":{}}},{name:"load_entity",label:"Load",required:!0,selector:{entity:{domain:"sensor",device_class:"power"}}},{name:"load_name",selector:{entity_name:{}},context:{entity:"load_entity"}},{name:"load_icon",selector:{icon:{}},context:{icon_entity:"load_entity"}},{name:"load_max",label:"Load Max (W)",selector:{number:{mode:"box"}}},{name:"load_tap_action",label:"Load Tap Action",selector:{"ui-action":{}}},{name:"production_entity",label:"Production",required:!0,selector:{entity:{domain:"sensor",device_class:"power"}}},{name:"production_name",selector:{entity_name:{}},context:{entity:"production_entity"}},{name:"production_icon",selector:{icon:{}},context:{icon_entity:"production_entity"}},{name:"production_max",label:"Production Max (W)",selector:{number:{mode:"box"}}},{name:"production_tap_action",label:"Production Tap Action",selector:{"ui-action":{}}},{name:"battery_entity",label:"Battery",required:!0,selector:{entity:{domain:"sensor",device_class:"power"}}},{name:"battery_name",selector:{entity_name:{}},context:{entity:"battery_entity"}},{name:"battery_icon",selector:{icon:{}},context:{icon_entity:"battery_entity"}},{name:"battery_min",label:"Battery Min (W)",selector:{number:{mode:"box"}}},{name:"battery_max",label:"Battery Max (W)",selector:{number:{mode:"box"}}},{name:"battery_tap_action",label:"Battery Tap Action",selector:{"ui-action":{}}},{name:"invert_battery_data",label:"Invert Battery Data",selector:{boolean:{}}},{name:"invert_battery_view",label:"Invert Battery View",selector:{boolean:{}}},{name:"show_plus",label:"Show + Sign",selector:{boolean:{}}}]}}connectedCallback(){this._resizeObserver=new ResizeObserver(()=>{if(this._lastValues){const e=this._lastValues;requestAnimationFrame(()=>{this._drawFlows(e.grid,e.production,e.load,e.battery)})}}),this.parentElement&&this._resizeObserver.observe(this.parentElement),this._resizeObserver.observe(this),this._startFlowAnimationLoop()}disconnectedCallback(){this._resizeObserver&&(this._resizeObserver.disconnect(),this._resizeObserver=null),this._meters.forEach(e=>e.stopAnimation()),this._animationFrameId&&(cancelAnimationFrame(this._animationFrameId),this._animationFrameId=null)}setConfig(e){this._config=e,this._render()}set hass(e){this._hass=e,this._render()}_render(){if(!this._config||!this._hass)return;const e=this._getEntityState(this._config.grid_entity),t=this._getEntityState(this._config.load_entity),i=this._getEntityState(this._config.production_entity),s=this._getEntityState(this._config.battery_entity),o=parseFloat(e?.state??"0")||0,a=parseFloat(t?.state??"0")||0,n=parseFloat(i?.state??"0")||0;let r=parseFloat(s?.state??"0")||0;if(this._config.invert_battery_data&&(r=-r),(this._config.view_mode||"default")==="compact"){this._renderCompactView(o,a,n,r);return}const l=this._config.grid_min!=null?this._config.grid_min:-5e3,u=this._config.grid_max!=null?this._config.grid_max:5e3,h=this._config.load_max!=null?this._config.load_max:5e3,p=this._config.production_max!=null?this._config.production_max:5e3,w=this._config.battery_min!=null?this._config.battery_min:-5e3,S=this._config.battery_max!=null?this._config.battery_max:5e3;if(this.querySelector(".energy-flow-svg")){const g=this._meters.get("production"),m=this._meters.get("battery"),f=this._meters.get("grid"),d=this._meters.get("load");g&&(g.value=n),m&&(m.invertView=this._config.invert_battery_view??!1,m.value=r),f&&(f.value=o),d&&(d.value=a)}else{this._iconsExtracted=!1;const g=(_,$)=>{this._fireEvent.call(this,_,$)},m=new F("production",n,0,p,!1,this._getDisplayName("production_name","production_entity","Production"),this._getIcon("production_icon","production_entity","mdi:solar-power"),"WATTS",!1,!1,this._config.production_tap_action,this._config.production_entity,g),f=new F("battery",r,w,S,!0,this._getDisplayName("battery_name","battery_entity","Battery"),this._getIcon("battery_icon","battery_entity","mdi:battery"),"WATTS",this._config.invert_battery_view,this._config.show_plus,this._config.battery_tap_action,this._config.battery_entity,g),d=new F("grid",o,l,u,!0,this._getDisplayName("grid_name","grid_entity","Grid"),this._getIcon("grid_icon","grid_entity","mdi:transmission-tower"),"WATTS",!1,!1,this._config.grid_tap_action,this._config.grid_entity,g),x=new F("load",a,0,h,!1,this._getDisplayName("load_name","load_entity","Load"),this._getIcon("load_icon","load_entity","mdi:home-lightning-bolt"),"WATTS",!1,!1,this._config.load_tap_action,this._config.load_entity,g);this.innerHTML=`
        <ha-card>
          <style>
            :host {
              display: block;
              height: 100%;
              min-height: 0;
              min-width: 0;
            }
            ha-card {
              display: flex;
              align-items: center;
              justify-content: center;
              width: 100%;
              height: 100%;
              min-height: 0;
              min-width: 0;
              padding: 8px;
              box-sizing: border-box;
              overflow: hidden;
              position: relative;
            }
            .svg-wrapper {
              width: 100%;
              height: 100%;
              max-width: 100%;
              max-height: 100%;
              aspect-ratio: ${this._canvasWidth} / ${this._canvasHeight};
              display: flex;
              align-items: center;
              justify-content: center;
            }
            svg.energy-flow-svg {
              display: block;
              width: 100%;
              height: 100%;
              max-width: 100%;
              max-height: 100%;
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
            <svg class="energy-flow-svg" viewBox="0 0 ${this._canvasWidth} ${this._canvasHeight}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
            <defs>
              ${this._createMeterDefs()}
            </defs>
            
            <!-- Flow lines layer (behind meters) -->
            <g id="flow-layer"></g>
            
            <!-- Production Meter (top left) -->
            <g id="production-meter" class="meter-group" transform="translate(${this._meterPositions.production.x}, ${this._meterPositions.production.y})"></g>
            
            <!-- Battery Meter (middle left, offset right) -->
            <g id="battery-meter" class="meter-group" transform="translate(${this._meterPositions.battery.x}, ${this._meterPositions.battery.y})"></g>
            
            <!-- Grid Meter (bottom left) -->
            <g id="grid-meter" class="meter-group" transform="translate(${this._meterPositions.grid.x}, ${this._meterPositions.grid.y})"></g>
            
            <!-- Load Meter (right, 2x size) -->
            <g id="load-meter" class="meter-group" transform="translate(${this._meterPositions.load.x}, ${this._meterPositions.load.y}) scale(2)"></g>
          </svg>
          </div>
        </ha-card>
      `,requestAnimationFrame(()=>{const _=this.querySelector("#production-meter"),$=this.querySelector("#battery-meter"),y=this.querySelector("#grid-meter"),M=this.querySelector("#load-meter");_&&_.appendChild(m.createElement()),$&&$.appendChild(f.createElement()),y&&y.appendChild(d.createElement()),M&&M.appendChild(x.createElement()),this._meters.set("production",m),this._meters.set("battery",f),this._meters.set("grid",d),this._meters.set("load",x),m.startAnimation(),f.startAnimation(),d.startAnimation(),x.startAnimation(),m.updateDimming(),f.updateDimming(),d.updateDimming(),x.updateDimming()})}this._lastValues={grid:o,production:n,load:a,battery:r},this._iconsExtracted||requestAnimationFrame(()=>{this._extractIconPaths()}),requestAnimationFrame(()=>{requestAnimationFrame(()=>{this._drawFlows(o,n,a,r)})})}_getEntityState(e){return this._hass?.states?.[e]}_getDisplayName(e,t,i){if(this._config?.[e])return String(this._config[e]);const s=this._config?.[t];if(s){const o=this._getEntityState(s);if(o?.attributes?.friendly_name)return o.attributes.friendly_name}return i}_getIcon(e,t,i){if(this._config?.[e])return String(this._config[e]);const s=this._config?.[t];if(s){const o=this._getEntityState(s);if(o?.attributes?.icon)return o.attributes.icon}return i}_handleAction(e,t){if(!this._hass)return;const i=e||{action:"more-info"};switch(i.action||"more-info"){case"more-info":const o=i.entity||t;this._fireEvent("hass-more-info",{entityId:o});break;case"navigate":i.navigation_path&&(history.pushState(null,"",i.navigation_path),this._fireEvent("location-changed",{replace:i.navigation_replace||!1}));break;case"url":i.url_path&&window.open(i.url_path);break;case"toggle":this._hass.callService("homeassistant","toggle",{entity_id:t});break;case"perform-action":if(i.perform_action){const[a,n]=i.perform_action.split(".");this._hass.callService(a,n,i.data||{},i.target)}break;case"assist":this._fireEvent("show-dialog",{dialogTag:"ha-voice-command-dialog",dialogParams:{pipeline_id:i.pipeline_id||"last_used",start_listening:i.start_listening}});break}}_fireEvent(e,t={}){if(e==="call-service"&&this._hass){this._hass.callService(t.domain,t.service,t.service_data||{},t.target);return}const i=new CustomEvent(e,{detail:t,bubbles:!0,composed:!0});this.dispatchEvent(i)}_createMeterDefs(){return`
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
    `}_calculateFlows(e,t,i,s){return q({grid:e,production:t,load:i,battery:s})}_drawFlows(e,t,i,s){const o=this.querySelector("#flow-layer");if(!o)return;const a=this._meterPositions.production,n=this._meterPositions.battery,r=this._meterPositions.grid,c=this._meterPositions.load,{productionToLoad:l,productionToBattery:u,productionToGrid:h,gridToLoad:p,gridToBattery:w,batteryToLoad:S}=this._calculateFlows(e,t,i,s),g=0;[{id:"production-to-load",from:a,to:c,power:l,color:"#4caf50",threshold:g},{id:"production-to-battery",from:a,to:n,power:u,color:"#4caf50",threshold:g},{id:"battery-to-load",from:n,to:c,power:S,color:"#2196f3",threshold:10},{id:"grid-to-load",from:r,to:c,power:p,color:"#f44336",threshold:g},{id:"grid-to-battery",from:r,to:n,power:w,color:"#f44336",threshold:g},{id:"production-to-grid",from:a,to:r,power:h,color:"#ffeb3b",threshold:g}].forEach(d=>{d.power>d.threshold?this._updateOrCreateFlow(o,d.id,d.from,d.to,d.power,d.color):this._fadeOutFlow(o,d.id)})}_startFlowAnimationLoop(){const e=t=>{this._lastAnimationTime||(this._lastAnimationTime=t);const i=t-(this._lastAnimationTime??t);this._lastAnimationTime=t,this._flowDots.forEach((s,o)=>{const a=this.querySelector(`#path-${o}`);a&&s&&s.length>0&&s.forEach((n,r)=>{const c=this.querySelector(`#dot-${o}-${r}`);if(c&&n.velocity>0){n.progress+=n.velocity*i/1e3,n.progress>=1&&(n.progress=n.progress%1);try{const l=a.getTotalLength();if(l>0){const u=a.getPointAtLength(n.progress*l);c.setAttribute("cx",String(u.x)),c.setAttribute("cy",String(u.y))}}catch{}}})}),this._animationFrameId=requestAnimationFrame(e)};this._animationFrameId=requestAnimationFrame(e)}_updateOrCreateFlow(e,t,i,s,o,a){let n=e.querySelector(`#${t}`),r;o<=100?r=.25:o<=200?r=.25+(o-100)/100*.75:r=1;const c=2,l=23.76,u=1e4;let h;if(o<=100)h=c;else{const v=Math.min((o-100)/(u-100),1)*(l-c);h=c+v}const p=2.5,w=3,S=p*(h/c),g=Math.max(S,w),m=document.createElementNS("http://www.w3.org/2000/svg","path"),f=(i.x+s.x)/2,d=(i.y+s.y)/2,x=`M ${i.x},${i.y} Q ${f},${d} ${s.x},${s.y}`;m.setAttribute("d",x);const _=m.getTotalLength(),M=40*(o/1e3)*this._speedMultiplier,P=_>0?M/_:0;if(n){const v=n.querySelector(`#glow-${t}`),b=n.querySelector(`#path-${t}`);if(v&&b){const T=(i.x+s.x)/2,A=(i.y+s.y)/2,k=`M ${i.x},${i.y} Q ${T},${A} ${s.x},${s.y}`;v.setAttribute("d",k),v.setAttribute("stroke-opacity",String(r*.5)),v.setAttribute("stroke-width",String(h*2)),b.setAttribute("d",k),b.setAttribute("stroke-opacity",String(r)),b.setAttribute("stroke-width",String(h))}const E=this._flowDots.get(t);E&&E.forEach((T,A)=>{const k=n.querySelector(`#dot-${t}-${A}`);k&&(k.setAttribute("r",String(g)),k.setAttribute("opacity",String(r)),k.setAttribute("fill",a)),T.velocity=P})}else{n=document.createElementNS("http://www.w3.org/2000/svg","g"),n.id=t,e.appendChild(n);const v=document.createElementNS("http://www.w3.org/2000/svg","path");v.setAttribute("d",x),v.setAttribute("class","flow-line"),v.setAttribute("stroke",a),v.setAttribute("stroke-opacity",String(r*.5)),v.setAttribute("stroke-width",String(h*2)),v.setAttribute("style","transition: stroke-opacity 0.5s ease-out, stroke-width 0.5s ease-out;"),v.id=`glow-${t}`,n.appendChild(v);const b=document.createElementNS("http://www.w3.org/2000/svg","path");b.setAttribute("d",x),b.setAttribute("class","flow-line"),b.setAttribute("stroke",a),b.setAttribute("stroke-opacity",String(r)),b.setAttribute("stroke-width",String(h)),b.setAttribute("style","transition: stroke-opacity 0.5s ease-out, stroke-width 0.5s ease-out;"),b.id=`path-${t}`,n.appendChild(b);const E=[];for(let T=0;T<this._dotsPerFlow;T++){const A=document.createElementNS("http://www.w3.org/2000/svg","circle");A.setAttribute("class","flow-dot"),A.setAttribute("id",`dot-${t}-${T}`),A.setAttribute("r",String(g)),A.setAttribute("fill",a),A.setAttribute("opacity",String(r)),A.setAttribute("style","transition: opacity 0.5s ease-out, r 0.5s ease-out;"),n.appendChild(A);const k=T/this._dotsPerFlow;E.push({progress:k,velocity:P})}this._flowDots.set(t,E)}}_removeFlow(e,t){const i=e.querySelector(`#${t}`);i&&i.remove(),this._flowDots.delete(t)}_fadeOutFlow(e,t){const i=e.querySelector(`#${t}`);if(!i)return;const s=i.querySelector(`#glow-${t}`),o=i.querySelector(`#path-${t}`);s&&s.setAttribute("stroke-opacity","0"),o&&o.setAttribute("stroke-opacity","0");const a=this._flowDots.get(t);a&&a.forEach((n,r)=>{const c=i.querySelector(`#dot-${t}-${r}`);c&&c.setAttribute("opacity","0")}),setTimeout(()=>{this._removeFlow(e,t)},500)}_extractIconPaths(){["production","battery","grid","load"].forEach(t=>{const i=this.querySelector(`#icon-source-${t}`),s=this.querySelector(`#icon-display-${t}`);if(!i||!s){console.warn(`Icon elements not found for ${t}`);return}const o=i.querySelector("div");if(!o){console.warn(`No div found in foreignObject for ${t}`);return}const a=o.querySelector("ha-icon");if(!a){console.warn(`No ha-icon found for ${t}`);return}const n=a.getAttribute("icon");if(!n){console.warn(`No icon attribute for ${t}`);return}if(this._iconCache.has(n)){const c=this._iconCache.get(n);this._renderIconPath(s,c),i.style.display="none";return}const r=(c=0,l=10)=>{const u=c*100;setTimeout(()=>{try{const h=a.shadowRoot;if(!h){c<l&&r(c+1,l);return}let p=h.querySelector("svg");if(!p){const g=h.querySelector("ha-svg-icon");g&&g.shadowRoot&&(p=g.shadowRoot.querySelector("svg"))}if(!p){c<l&&r(c+1,l);return}const w=p.querySelector("path");if(!w){c<l&&r(c+1,l);return}const S=w.getAttribute("d");S?(this._iconCache.set(n,S),this._renderIconPath(s,S),i.style.display="none"):c<l&&r(c+1,l)}catch(h){console.error(`Failed to extract icon path for ${n} (attempt ${c+1}):`,h),c<l&&r(c+1,l)}},u)};r()}),this._iconsExtracted=!0}_renderIconPath(e,t){if(e.innerHTML="",t){const i=document.createElementNS("http://www.w3.org/2000/svg","path");i.setAttribute("d",t),i.setAttribute("fill","rgb(160, 160, 160)"),i.setAttribute("transform","scale(1)"),e.appendChild(i)}else{const i=document.createElementNS("http://www.w3.org/2000/svg","circle");i.setAttribute("cx","12"),i.setAttribute("cy","12"),i.setAttribute("r","8"),i.setAttribute("fill","rgb(160, 160, 160)"),e.appendChild(i)}}_drawFlow(e,t,i,s,o){const a=document.createElementNS("http://www.w3.org/2000/svg","path"),n=(t.x+i.x)/2,r=(t.y+i.y)/2,c=`M ${t.x},${t.y} Q ${n},${r} ${i.x},${i.y}`;a.setAttribute("d",c),a.setAttribute("class",`flow-line ${o?"flow-positive":"flow-negative"}`),a.setAttribute("id",`path-${Math.random()}`),e.appendChild(a);const l=Math.min(Math.max(Math.floor(s/1e3),1),3);for(let u=0;u<l;u++){const h=document.createElementNS("http://www.w3.org/2000/svg","circle");h.setAttribute("class",`flow-dot ${o?"flow-positive":"flow-negative"}`),h.setAttribute("r","3"),h.setAttribute("fill",o?"var(--success-color, #4caf50)":"var(--error-color, #f44336)");const p=document.createElementNS("http://www.w3.org/2000/svg","animateMotion");p.setAttribute("dur","2s"),p.setAttribute("repeatCount","indefinite"),p.setAttribute("begin",`${u*.6}s`);const w=document.createElementNS("http://www.w3.org/2000/svg","mpath");w.setAttributeNS("http://www.w3.org/1999/xlink","href",`#${a.id}`),p.appendChild(w),h.appendChild(p),e.appendChild(h)}}_renderCompactView(e,t,i,s){const o=this._calculateFlows(e,i,t,s),a=o.productionToLoad,n=o.batteryToLoad,r=o.gridToLoad,c=t||1,l=a/c*100,u=n/c*100,h=r/c*100,p="#256028",w="#104b79",S="#7a211b";(!this.querySelector(".compact-view")||this._lastViewMode!=="compact")&&(this.innerHTML=`
        <ha-card>
          <style>
            :host {
              display: block;
              width: 100%;
            }
            ha-card {
              padding: 16px;
              box-sizing: border-box;
            }
            .compact-view {
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
            .load-value {
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
            .load-value:hover {
              filter: brightness(1.1);
            }
            .load-icon {
              width: 28px;
              height: 28px;
              flex-shrink: 0;
              color: rgb(160, 160, 160);
              display: flex;
              align-items: center;
            }
            .load-text {
              display: flex;
              align-items: baseline;
              gap: 4px;
              line-height: 1;
            }
            .load-unit {
              font-size: 14px;
              color: rgb(160, 160, 160);
              margin-left: 4px;
            }
          </style>
          <div class="compact-view">
            <div class="bar-container">
              <div id="grid-segment" class="bar-segment" style="background: ${S}; width: ${h}%;">
                <div class="bar-segment-content">
                  <ha-icon class="bar-segment-icon" icon="${this._getIcon("grid_icon","grid_entity","mdi:transmission-tower")}"></ha-icon>
                  <span class="bar-segment-label"></span>
                </div>
              </div>
              <div id="battery-segment" class="bar-segment" style="background: ${w}; width: ${u}%;">
                <div class="bar-segment-content">
                  <ha-icon class="bar-segment-icon" icon="${this._getIcon("battery_icon","battery_entity","mdi:battery")}"></ha-icon>
                  <span class="bar-segment-label"></span>
                </div>
              </div>
              <div id="production-segment" class="bar-segment" style="background: ${p}; width: ${l}%;">
                <div class="bar-segment-content">
                  <ha-icon class="bar-segment-icon" icon="${this._getIcon("production_icon","production_entity","mdi:solar-power")}"></ha-icon>
                  <span class="bar-segment-label"></span>
                </div>
              </div>
            </div>
            <div class="load-value">
              <ha-icon class="load-icon" icon="${this._getIcon("load_icon","load_entity","mdi:home-lightning-bolt")}"></ha-icon>
              <div class="load-text">
                <span id="load-value-text">${Math.round(t)}</span><span class="load-unit">W</span>
              </div>
            </div>
          </div>
        </ha-card>
      `,this._lastViewMode="compact",requestAnimationFrame(()=>{if(this._config){const m=this.querySelector("#production-segment"),f=this.querySelector("#battery-segment"),d=this.querySelector("#grid-segment"),x=this.querySelector(".load-value");m&&m.addEventListener("click",()=>{this._handleAction(this._config.production_tap_action,this._config.production_entity)}),f&&f.addEventListener("click",()=>{this._handleAction(this._config.battery_tap_action,this._config.battery_entity)}),d&&d.addEventListener("click",()=>{this._handleAction(this._config.grid_tap_action,this._config.grid_entity)}),x&&x.addEventListener("click",()=>{this._handleAction(this._config.load_tap_action,this._config.load_entity)})}})),requestAnimationFrame(()=>{const m=this.querySelector("#production-segment"),f=this.querySelector("#battery-segment"),d=this.querySelector("#grid-segment"),x=this.querySelector("#load-value-text");if(m){m.style.width=`${l}%`;const _=m.querySelector(".bar-segment-label");_&&a>0&&(_.textContent=`${Math.round(a)}W`);const $=this.querySelector(".bar-container"),y=l/100*($?.offsetWidth||0);this._updateSegmentVisibility(m,y,a>0)}if(f){f.style.width=`${u}%`;const _=f.querySelector(".bar-segment-label");_&&n>0&&(_.textContent=`${Math.round(n)}W`);const $=this.querySelector(".bar-container"),y=u/100*($?.offsetWidth||0);this._updateSegmentVisibility(f,y,n>0)}if(d){d.style.width=`${h}%`;const _=d.querySelector(".bar-segment-label");_&&r>0&&(_.textContent=`${Math.round(r)}W`);const $=this.querySelector(".bar-container"),y=h/100*($?.offsetWidth||0);this._updateSegmentVisibility(d,y,r>0)}x&&(x.textContent=String(Math.round(t)))})}_updateSegmentVisibility(e,t,i){if(!e||!i){e?.setAttribute("data-width-px","");return}t>=80?e.setAttribute("data-width-px","show-label"):t>=40?e.setAttribute("data-width-px","show-icon"):e.setAttribute("data-width-px","")}}customElements.define("energy-flow-card",L),window.customCards=window.customCards||[],window.customCards.push({type:"energy-flow-card",name:"Energy Flow Card",description:"A test energy-flow card."})})();

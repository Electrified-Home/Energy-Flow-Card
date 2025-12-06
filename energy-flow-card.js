(function(){"use strict";class Q{constructor(t,i,e,n,o,a,r,h,s=!1,c=!1,d,g,l){this.id=t,this._value=i,this.min=e,this.max=n,this.bidirectional=o,this.label=a,this.icon=r,this.units=h,this._invertView=s,this.showPlus=c,this.tapAction=d,this.entityId=g,this.fireEventCallback=l,this.element=null,this.radius=50,this.boxWidth=120,this.boxHeight=135,this.boxRadius=16,this.centerX=this.boxWidth/2,this.centerY=this.radius+25,this.offsetX=-this.centerX,this.offsetY=-this.centerY,this.needleState={target:0,current:0,ghost:0},this._lastAnimationTime=null,this._animationFrameId=null,this._updateNeedleAngle()}get value(){return this._value}set value(t){if(this._value!==t&&(this._value=t,this._updateNeedleAngle(),this.element)){const i=this.element.querySelector(`#value-${this.id}`);i&&(i.textContent=this._formatValueText()),this.updateDimming()}}get invertView(){return this._invertView}set invertView(t){if(this._invertView!==t&&(this._invertView=t,this._updateNeedleAngle(),this.element)){const i=this.element.querySelector(`#value-${this.id}`);i&&(i.textContent=this._formatValueText())}}get displayValue(){return this._invertView?-this._value:this._value}_formatValueText(){const t=this.displayValue,i=t.toFixed(0);return t<0?i+" ":t>0&&this.showPlus?"+"+i+" ":i}_updateNeedleAngle(){let t,i;const e=this.displayValue;if(this.bidirectional){const n=this.max-this.min;t=Math.min(Math.max((e-this.min)/n,0),1),i=180-t*180}else t=Math.min(Math.max(e/this.max,0),1),i=180-t*180;this.needleState.target=i}updateDimming(){if(!this.element)return;const t=this.element.querySelector(`#dimmer-${this.id}`);if(t){const i=Math.abs(this.value)<.5;t.setAttribute("opacity",i?"0.3":"0")}}startAnimation(){if(this._animationFrameId)return;const t=i=>{this._lastAnimationTime||(this._lastAnimationTime=i);const e=i-this._lastAnimationTime;if(this._lastAnimationTime=i,!this.element){this._animationFrameId=null;return}const n=this.radius-5,o=Math.min(e/150,1);this.needleState.current+=(this.needleState.target-this.needleState.current)*o;const a=Math.min(e/400,1);this.needleState.ghost+=(this.needleState.current-this.needleState.ghost)*a;const r=10;this.needleState.ghost<this.needleState.current-r?this.needleState.ghost=this.needleState.current-r:this.needleState.ghost>this.needleState.current+r&&(this.needleState.ghost=this.needleState.current+r);const h=this.element.querySelector(`#needle-${this.id}`);if(h){const c=this.needleState.current*Math.PI/180,d=this.centerX+n*Math.cos(c),g=this.centerY-n*Math.sin(c);h.setAttribute("x2",String(d)),h.setAttribute("y2",String(g))}const s=this.element.querySelector(`#ghost-needle-${this.id}`);if(s){const c=this.needleState.ghost*Math.PI/180,d=this.centerX+n*Math.cos(c),g=this.centerY-n*Math.sin(c);s.setAttribute("x2",String(d)),s.setAttribute("y2",String(g))}this._animationFrameId=requestAnimationFrame(t)};this._animationFrameId=requestAnimationFrame(t)}stopAnimation(){this._animationFrameId&&(cancelAnimationFrame(this._animationFrameId),this._animationFrameId=null,this._lastAnimationTime=null)}_handleTapAction(){if(!this.fireEventCallback)return;const t=this.tapAction||{action:"more-info"};switch(t.action||"more-info"){case"more-info":const e=t.entity||this.entityId;e&&this.fireEventCallback("hass-more-info",{entityId:e});break;case"navigate":t.navigation_path&&(history.pushState(null,"",t.navigation_path),this.fireEventCallback("location-changed",{replace:t.navigation_replace||!1}));break;case"url":t.url_path&&window.open(t.url_path);break;case"toggle":this.entityId&&this.fireEventCallback("call-service",{domain:"homeassistant",service:"toggle",service_data:{entity_id:this.entityId}});break;case"perform-action":if(t.perform_action){const[n,o]=t.perform_action.split(".");this.fireEventCallback("call-service",{domain:n,service:o,service_data:t.data||{},target:t.target})}break;case"assist":this.fireEventCallback("show-dialog",{dialogTag:"ha-voice-command-dialog",dialogParams:{pipeline_id:t.pipeline_id||"last_used",start_listening:t.start_listening}});break}}createElement(){const t=this.displayValue;let i,e;if(this.bidirectional){const C=this.max-this.min;i=Math.min(Math.max((t-this.min)/C,0),1),e=180-i*180}else i=Math.min(Math.max(t/this.max,0),1),e=180-i*180;this.needleState.target=e,this.needleState.current=e,this.needleState.ghost=e;const o=(this.bidirectional?[this.min,0,this.max]:[0,this.max/2,this.max]).map(C=>{const M=(180-(this.bidirectional?(C-this.min)/(this.max-this.min):C/this.max)*180)*Math.PI/180,F=this.radius,L=this.radius-8,f=this.centerX+F*Math.cos(M),P=this.centerY-F*Math.sin(M),Y=this.centerX+L*Math.cos(M),_=this.centerY-L*Math.sin(M);return`<line x1="${f}" y1="${P}" x2="${Y}" y2="${_}" stroke="rgb(160, 160, 160)" stroke-width="2" />`}).join(""),h=(180-(this.bidirectional?(0-this.min)/(this.max-this.min):0)*180)*Math.PI/180,s=this.centerX,c=this.centerY,d=this.centerX+this.radius*Math.cos(h),g=this.centerY-this.radius*Math.sin(h),l=`<line x1="${s}" y1="${c}" x2="${d}" y2="${g}" stroke="rgb(100, 100, 100)" stroke-width="2" />`,b=e*Math.PI/180,x=this.radius-5,u=this.centerX+x*Math.cos(b),m=this.centerY-x*Math.sin(b),w=this.centerY+5,S=this.centerY+this.radius*.5,E=this.centerY+this.radius*.7,$=`
      <g transform="translate(${this.offsetX}, ${this.offsetY})">
        <defs>
          <clipPath id="clip-${this.id}-local">
            <rect x="0" y="0" width="${this.boxWidth}" height="${w+2}" />
          </clipPath>
        </defs>
        
        <rect x="0" y="0" width="${this.boxWidth}" height="${this.boxHeight}" rx="${this.boxRadius}" ry="${this.boxRadius}" fill="rgb(40, 40, 40)" filter="url(#drop-shadow)" />
        
        <g clip-path="url(#clip-${this.id}-local)">
          <circle cx="${this.centerX}" cy="${this.centerY}" r="${this.radius}" fill="rgb(70, 70, 70)" />
          ${l}
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
        
        <line id="ghost-needle-${this.id}" x1="${this.centerX}" y1="${this.centerY}" x2="${u}" y2="${m}" stroke="rgb(255, 255, 255)" stroke-width="4" stroke-linecap="round" opacity="0.3" />
        
        <line id="needle-${this.id}" x1="${this.centerX}" y1="${this.centerY}" x2="${u}" y2="${m}" stroke="rgb(255, 255, 255)" stroke-width="4" stroke-linecap="round" />
        
        <circle cx="${this.centerX}" cy="${this.centerY}" r="5" fill="rgb(255, 255, 255)" />
        
        <text id="value-${this.id}" x="${this.centerX}" y="${S}" text-anchor="middle" font-size="16" fill="rgb(255, 255, 255)" font-weight="600">${this._formatValueText()}</text>
        
        <text x="${this.centerX}" y="${E}" text-anchor="middle" font-size="8" fill="rgb(160, 160, 160)" font-weight="400" letter-spacing="0.5">${this.units}</text>
        
        <rect id="dimmer-${this.id}" x="0" y="0" width="${this.boxWidth}" height="${this.boxHeight}" rx="${this.boxRadius}" ry="${this.boxRadius}" fill="black" opacity="0" pointer-events="none" style="transition: opacity 0.8s ease-in-out;" />
      </g>
    `,y=document.createElementNS("http://www.w3.org/2000/svg","svg");y.innerHTML=$;const p=y.firstElementChild;return this.element=p,(!this.tapAction||this.tapAction.action!=="none")&&(p.style.cursor="pointer",p.addEventListener("click",C=>{this._handleTapAction(),C.stopPropagation()}),p.addEventListener("mouseenter",()=>{p.style.filter="brightness(1.1)"}),p.addEventListener("mouseleave",()=>{p.style.filter=""})),p}}function U(G){const t=Math.max(0,G.production),i=G.grid,e=G.battery,n=Math.max(0,G.load),o={productionToLoad:0,productionToBattery:0,productionToGrid:0,gridToLoad:0,gridToBattery:0,batteryToLoad:0};let a=t,r=n;if(a>0&&r>0&&(o.productionToLoad=Math.min(a,r),a-=o.productionToLoad,r-=o.productionToLoad),e<0&&a>0&&(o.productionToBattery=Math.min(a,Math.abs(e)),a-=o.productionToBattery),e>0&&r>0&&(o.batteryToLoad=Math.min(e,r),r-=o.batteryToLoad),r>0&&i>0&&(o.gridToLoad=Math.min(i,r),r-=o.gridToLoad),e<0&&i>10){const h=Math.abs(e)-o.productionToBattery;h>1&&(o.gridToBattery=Math.min(i-o.gridToLoad,h))}return i<-10&&(o.productionToGrid=Math.abs(i)),o}class J extends HTMLElement{constructor(){super(),this._resizeObserver=null,this._animationFrameId=null,this._flowDots=new Map,this._lastAnimationTime=null,this._iconCache=new Map,this._iconsExtracted=!1,this._iconExtractionTimeouts=new Set,this._chartDataCache=void 0,this._chartRenderPending=!1,this._meters=new Map,this._speedMultiplier=.8,this._dotsPerFlow=3;const t=500,i=470,e=5,n=3;this._meterPositions={production:{x:60+e,y:80+n},battery:{x:130+e,y:240+n},grid:{x:60+e,y:400+n},load:{x:360+e,y:240+n}},this._canvasWidth=t,this._canvasHeight=i}static getStubConfig(){return{}}static getConfigForm(){return{schema:[{name:"view_mode",label:"View Mode",selector:{select:{options:[{value:"default",label:"Default"},{value:"compact",label:"Compact Bar"},{value:"compact-battery",label:"Compact with Battery"},{value:"chart",label:"Chart"}]}}},{name:"grid_entity",label:"Grid",required:!0,selector:{entity:{domain:"sensor",device_class:"power"}}},{name:"grid_name",selector:{entity_name:{}},context:{entity:"grid_entity"}},{name:"grid_icon",selector:{icon:{}},context:{icon_entity:"grid_entity"}},{name:"grid_min",label:"Grid Min (W)",selector:{number:{mode:"box"}}},{name:"grid_max",label:"Grid Max (W)",selector:{number:{mode:"box"}}},{name:"grid_tap_action",label:"Grid Tap Action",selector:{"ui-action":{}}},{name:"load_entity",label:"Load",required:!0,selector:{entity:{domain:"sensor",device_class:"power"}}},{name:"load_name",selector:{entity_name:{}},context:{entity:"load_entity"}},{name:"load_icon",selector:{icon:{}},context:{icon_entity:"load_entity"}},{name:"load_max",label:"Load Max (W)",selector:{number:{mode:"box"}}},{name:"load_tap_action",label:"Load Tap Action",selector:{"ui-action":{}}},{name:"production_entity",label:"Production",required:!0,selector:{entity:{domain:"sensor",device_class:"power"}}},{name:"production_name",selector:{entity_name:{}},context:{entity:"production_entity"}},{name:"production_icon",selector:{icon:{}},context:{icon_entity:"production_entity"}},{name:"production_max",label:"Production Max (W)",selector:{number:{mode:"box"}}},{name:"production_tap_action",label:"Production Tap Action",selector:{"ui-action":{}}},{name:"battery_entity",label:"Battery",required:!0,selector:{entity:{domain:"sensor",device_class:"power"}}},{name:"battery_name",selector:{entity_name:{}},context:{entity:"battery_entity"}},{name:"battery_icon",selector:{icon:{}},context:{icon_entity:"battery_entity"}},{name:"battery_min",label:"Battery Min (W)",selector:{number:{mode:"box"}}},{name:"battery_max",label:"Battery Max (W)",selector:{number:{mode:"box"}}},{name:"battery_tap_action",label:"Battery Tap Action",selector:{"ui-action":{}}},{name:"battery_soc_entity",label:"Battery SOC (%) Entity",selector:{entity:{domain:"sensor"}}},{name:"invert_battery_data",label:"Invert Battery Data",selector:{boolean:{}}},{name:"invert_battery_view",label:"Invert Battery View",selector:{boolean:{}}},{name:"show_plus",label:"Show + Sign",selector:{boolean:{}}}]}}connectedCallback(){this._resizeObserver=new ResizeObserver(()=>{if(this._lastValues){const t=this._lastValues;requestAnimationFrame(()=>{this._drawFlows(t.grid,t.production,t.load,t.battery)})}}),this.parentElement&&this._resizeObserver.observe(this.parentElement),this._resizeObserver.observe(this)}disconnectedCallback(){this._resizeObserver&&(this._resizeObserver.disconnect(),this._resizeObserver=null),this._meters.forEach(t=>t.stopAnimation()),this._animationFrameId&&(cancelAnimationFrame(this._animationFrameId),this._animationFrameId=null),this._iconExtractionTimeouts.forEach(t=>clearTimeout(t)),this._iconExtractionTimeouts.clear(),this._chartDataCache=void 0,this._iconCache.clear()}setConfig(t){this._config=t,this._render()}set hass(t){this._hass=t,this._render()}_render(){if(!this._config||!this._hass)return;const t=this._getEntityState(this._config.grid_entity),i=this._getEntityState(this._config.load_entity),e=this._getEntityState(this._config.production_entity),n=this._getEntityState(this._config.battery_entity),o=parseFloat(t?.state??"0")||0,a=parseFloat(i?.state??"0")||0,r=parseFloat(e?.state??"0")||0;let h=parseFloat(n?.state??"0")||0;this._config.invert_battery_data&&(h=-h);const s=this._config.view_mode||"default";if(this._lastViewMode==="chart"&&s!=="chart"&&(this._chartDataCache=void 0),s==="compact"||s==="compact-battery"){this._renderCompactView(o,a,r,h,s);return}if(s==="chart"){this._liveChartValues={grid:o,load:a,production:r,battery:h},this._lastViewMode!=="chart"||!this.querySelector(".chart-view")?this._renderChartView(o,a,r,h):this._updateChartIndicators();return}const c=this._config.grid_min!=null?this._config.grid_min:-5e3,d=this._config.grid_max!=null?this._config.grid_max:5e3,g=this._config.load_max!=null?this._config.load_max:5e3,l=this._config.production_max!=null?this._config.production_max:5e3,b=this._config.battery_min!=null?this._config.battery_min:-5e3,x=this._config.battery_max!=null?this._config.battery_max:5e3;if(this.querySelector(".energy-flow-svg")){const u=this._meters.get("production"),m=this._meters.get("battery"),w=this._meters.get("grid"),S=this._meters.get("load");u&&(u.value=r),m&&(m.invertView=this._config.invert_battery_view??!1,m.value=h),w&&(w.value=o),S&&(S.value=a)}else{this._iconsExtracted=!1;const u=($,y)=>{this._fireEvent.call(this,$,y)},m=new Q("production",r,0,l,!1,this._getDisplayName("production_name","production_entity","Production"),this._getIcon("production_icon","production_entity","mdi:solar-power"),"WATTS",!1,!1,this._config.production_tap_action,this._config.production_entity,u),w=new Q("battery",h,b,x,!0,this._getDisplayName("battery_name","battery_entity","Battery"),this._getIcon("battery_icon","battery_entity","mdi:battery"),"WATTS",this._config.invert_battery_view,this._config.show_plus,this._config.battery_tap_action,this._config.battery_entity,u),S=new Q("grid",o,c,d,!0,this._getDisplayName("grid_name","grid_entity","Grid"),this._getIcon("grid_icon","grid_entity","mdi:transmission-tower"),"WATTS",!1,!1,this._config.grid_tap_action,this._config.grid_entity,u),E=new Q("load",a,0,g,!1,this._getDisplayName("load_name","load_entity","Load"),this._getIcon("load_icon","load_entity","mdi:home-lightning-bolt"),"WATTS",!1,!1,this._config.load_tap_action,this._config.load_entity,u);this.innerHTML=`
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
      `,requestAnimationFrame(()=>{const $=this.querySelector("#production-meter"),y=this.querySelector("#battery-meter"),p=this.querySelector("#grid-meter"),C=this.querySelector("#load-meter");$&&$.appendChild(m.createElement()),y&&y.appendChild(w.createElement()),p&&p.appendChild(S.createElement()),C&&C.appendChild(E.createElement()),this._meters.set("production",m),this._meters.set("battery",w),this._meters.set("grid",S),this._meters.set("load",E),m.startAnimation(),w.startAnimation(),S.startAnimation(),E.startAnimation(),m.updateDimming(),w.updateDimming(),S.updateDimming(),E.updateDimming()})}this._lastValues={grid:o,production:r,load:a,battery:h},this._animationFrameId||this._startFlowAnimationLoop(),this._iconsExtracted||requestAnimationFrame(()=>{this._extractIconPaths()}),requestAnimationFrame(()=>{requestAnimationFrame(()=>{this._drawFlows(o,r,a,h)})})}_getEntityState(t){return this._hass?.states?.[t]}_getDisplayName(t,i,e){if(this._config?.[t])return String(this._config[t]);const n=this._config?.[i];if(n){const o=this._getEntityState(n);if(o?.attributes?.friendly_name)return o.attributes.friendly_name}return e}_getIcon(t,i,e){if(this._config?.[t])return String(this._config[t]);const n=this._config?.[i];if(n){const o=this._getEntityState(n);if(o?.attributes?.icon)return o.attributes.icon}return e}_handleAction(t,i){if(!this._hass)return;const e=t||{action:"more-info"};switch(e.action||"more-info"){case"more-info":const o=e.entity||i;this._fireEvent("hass-more-info",{entityId:o});break;case"navigate":e.navigation_path&&(history.pushState(null,"",e.navigation_path),this._fireEvent("location-changed",{replace:e.navigation_replace||!1}));break;case"url":e.url_path&&window.open(e.url_path);break;case"toggle":this._hass.callService("homeassistant","toggle",{entity_id:i});break;case"perform-action":if(e.perform_action){const[a,r]=e.perform_action.split(".");this._hass.callService(a,r,e.data||{},e.target)}break;case"assist":this._fireEvent("show-dialog",{dialogTag:"ha-voice-command-dialog",dialogParams:{pipeline_id:e.pipeline_id||"last_used",start_listening:e.start_listening}});break}}_fireEvent(t,i={}){if(t==="call-service"&&this._hass){this._hass.callService(i.domain,i.service,i.service_data||{},i.target);return}const e=new CustomEvent(t,{detail:i,bubbles:!0,composed:!0});this.dispatchEvent(e)}_createMeterDefs(){return`
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
    `}_calculateFlows(t,i,e,n){return U({grid:t,production:i,load:e,battery:n})}_drawFlows(t,i,e,n){const o=this.querySelector("#flow-layer");if(!o)return;const a=this._meterPositions.production,r=this._meterPositions.battery,h=this._meterPositions.grid,s=this._meterPositions.load,{productionToLoad:c,productionToBattery:d,productionToGrid:g,gridToLoad:l,gridToBattery:b,batteryToLoad:x}=this._calculateFlows(t,i,e,n),u=0;[{id:"production-to-load",from:a,to:s,power:c,color:"#4caf50",threshold:u},{id:"production-to-battery",from:a,to:r,power:d,color:"#4caf50",threshold:u},{id:"battery-to-load",from:r,to:s,power:x,color:"#2196f3",threshold:10},{id:"grid-to-load",from:h,to:s,power:l,color:"#f44336",threshold:u},{id:"grid-to-battery",from:h,to:r,power:b,color:"#f44336",threshold:u},{id:"production-to-grid",from:a,to:h,power:g,color:"#ffeb3b",threshold:u}].forEach(S=>{S.power>S.threshold?this._updateOrCreateFlow(o,S.id,S.from,S.to,S.power,S.color):this._fadeOutFlow(o,S.id)})}_startFlowAnimationLoop(){const t=i=>{this._lastAnimationTime||(this._lastAnimationTime=i);const e=i-(this._lastAnimationTime??i);this._lastAnimationTime=i,this._flowDots.forEach((n,o)=>{const a=this.querySelector(`#path-${o}`);a&&n&&n.length>0&&n.forEach((r,h)=>{const s=this.querySelector(`#dot-${o}-${h}`);if(s&&r.velocity>0){r.progress+=r.velocity*e/1e3,r.progress>=1&&(r.progress=r.progress%1);try{const c=a.getTotalLength();if(c>0){const d=a.getPointAtLength(r.progress*c);s.setAttribute("cx",String(d.x)),s.setAttribute("cy",String(d.y))}}catch{}}})}),this._animationFrameId=requestAnimationFrame(t)};this._animationFrameId=requestAnimationFrame(t)}_updateOrCreateFlow(t,i,e,n,o,a){let r=t.querySelector(`#${i}`),h;o<=100?h=.25:o<=200?h=.25+(o-100)/100*.75:h=1;const s=2,c=23.76,d=1e4;let g;if(o<=100)g=s;else{const A=Math.min((o-100)/(d-100),1)*(c-s);g=s+A}const l=2.5,b=3,x=l*(g/s),u=Math.max(x,b),m=document.createElementNS("http://www.w3.org/2000/svg","path"),w=(e.x+n.x)/2,S=(e.y+n.y)/2,E=`M ${e.x},${e.y} Q ${w},${S} ${n.x},${n.y}`;m.setAttribute("d",E);const $=m.getTotalLength(),C=40*(o/1e3)*this._speedMultiplier,I=$>0?C/$:0;if(r){const A=r.querySelector(`#glow-${i}`),M=r.querySelector(`#path-${i}`);if(A&&M){const L=(e.x+n.x)/2,f=(e.y+n.y)/2,P=`M ${e.x},${e.y} Q ${L},${f} ${n.x},${n.y}`;A.setAttribute("d",P),A.setAttribute("stroke-opacity",String(h*.5)),A.setAttribute("stroke-width",String(g*2)),M.setAttribute("d",P),M.setAttribute("stroke-opacity",String(h)),M.setAttribute("stroke-width",String(g))}const F=this._flowDots.get(i);F&&F.forEach((L,f)=>{const P=r.querySelector(`#dot-${i}-${f}`);P&&(P.setAttribute("r",String(u)),P.setAttribute("opacity",String(h)),P.setAttribute("fill",a)),L.velocity=I})}else{r=document.createElementNS("http://www.w3.org/2000/svg","g"),r.id=i,t.appendChild(r);const A=document.createElementNS("http://www.w3.org/2000/svg","path");A.setAttribute("d",E),A.setAttribute("class","flow-line"),A.setAttribute("stroke",a),A.setAttribute("stroke-opacity",String(h*.5)),A.setAttribute("stroke-width",String(g*2)),A.setAttribute("style","transition: stroke-opacity 0.5s ease-out, stroke-width 0.5s ease-out;"),A.id=`glow-${i}`,r.appendChild(A);const M=document.createElementNS("http://www.w3.org/2000/svg","path");M.setAttribute("d",E),M.setAttribute("class","flow-line"),M.setAttribute("stroke",a),M.setAttribute("stroke-opacity",String(h)),M.setAttribute("stroke-width",String(g)),M.setAttribute("style","transition: stroke-opacity 0.5s ease-out, stroke-width 0.5s ease-out;"),M.id=`path-${i}`,r.appendChild(M);const F=[];for(let L=0;L<this._dotsPerFlow;L++){const f=document.createElementNS("http://www.w3.org/2000/svg","circle");f.setAttribute("class","flow-dot"),f.setAttribute("id",`dot-${i}-${L}`),f.setAttribute("r",String(u)),f.setAttribute("fill",a),f.setAttribute("opacity",String(h)),f.setAttribute("style","transition: opacity 0.5s ease-out, r 0.5s ease-out;"),r.appendChild(f);const P=L/this._dotsPerFlow;F.push({progress:P,velocity:I})}this._flowDots.set(i,F)}}_removeFlow(t,i){const e=t.querySelector(`#${i}`);e&&e.remove(),this._flowDots.delete(i)}_fadeOutFlow(t,i){const e=t.querySelector(`#${i}`);if(!e)return;const n=e.querySelector(`#glow-${i}`),o=e.querySelector(`#path-${i}`);n&&n.setAttribute("stroke-opacity","0"),o&&o.setAttribute("stroke-opacity","0");const a=this._flowDots.get(i);a&&a.forEach((r,h)=>{const s=e.querySelector(`#dot-${i}-${h}`);s&&s.setAttribute("opacity","0")}),setTimeout(()=>{this._removeFlow(t,i)},500)}_extractIconPaths(){["production","battery","grid","load"].forEach(i=>{const e=this.querySelector(`#icon-source-${i}`),n=this.querySelector(`#icon-display-${i}`);if(!e||!n){console.warn(`Icon elements not found for ${i}`);return}const o=e.querySelector("div");if(!o){console.warn(`No div found in foreignObject for ${i}`);return}const a=o.querySelector("ha-icon");if(!a){console.warn(`No ha-icon found for ${i}`);return}const r=a.getAttribute("icon");if(!r){console.warn(`No icon attribute for ${i}`);return}if(this._iconCache.has(r)){const s=this._iconCache.get(r);this._renderIconPath(n,s),e.style.display="none";return}const h=(s=0,c=10)=>{const d=s*100,g=window.setTimeout(()=>{this._iconExtractionTimeouts.delete(g);try{const l=a.shadowRoot;if(!l){s<c&&h(s+1,c);return}let b=l.querySelector("svg");if(!b){const m=l.querySelector("ha-svg-icon");m&&m.shadowRoot&&(b=m.shadowRoot.querySelector("svg"))}if(!b){s<c&&h(s+1,c);return}const x=b.querySelector("path");if(!x){s<c&&h(s+1,c);return}const u=x.getAttribute("d");u?(this._iconCache.set(r,u),this._renderIconPath(n,u),e.style.display="none"):s<c&&h(s+1,c)}catch(l){console.error(`Failed to extract icon path for ${r} (attempt ${s+1}):`,l),s<c&&h(s+1,c)}},d);this._iconExtractionTimeouts.add(g)};h()}),this._iconsExtracted=!0}_renderIconPath(t,i){if(t.innerHTML="",i){const e=document.createElementNS("http://www.w3.org/2000/svg","path");e.setAttribute("d",i),e.setAttribute("fill","rgb(160, 160, 160)"),e.setAttribute("transform","scale(1)"),t.appendChild(e)}else{const e=document.createElementNS("http://www.w3.org/2000/svg","circle");e.setAttribute("cx","12"),e.setAttribute("cy","12"),e.setAttribute("r","8"),e.setAttribute("fill","rgb(160, 160, 160)"),t.appendChild(e)}}_drawFlow(t,i,e,n,o){const a=document.createElementNS("http://www.w3.org/2000/svg","path"),r=(i.x+e.x)/2,h=(i.y+e.y)/2,s=`M ${i.x},${i.y} Q ${r},${h} ${e.x},${e.y}`;a.setAttribute("d",s),a.setAttribute("class",`flow-line ${o?"flow-positive":"flow-negative"}`),a.setAttribute("id",`path-${Math.random()}`),t.appendChild(a);const c=Math.min(Math.max(Math.floor(n/1e3),1),3);for(let d=0;d<c;d++){const g=document.createElementNS("http://www.w3.org/2000/svg","circle");g.setAttribute("class",`flow-dot ${o?"flow-positive":"flow-negative"}`),g.setAttribute("r","3"),g.setAttribute("fill",o?"var(--success-color, #4caf50)":"var(--error-color, #f44336)");const l=document.createElementNS("http://www.w3.org/2000/svg","animateMotion");l.setAttribute("dur","2s"),l.setAttribute("repeatCount","indefinite"),l.setAttribute("begin",`${d*.6}s`);const b=document.createElementNS("http://www.w3.org/2000/svg","mpath");b.setAttributeNS("http://www.w3.org/1999/xlink","href",`#${a.id}`),l.appendChild(b),g.appendChild(l),t.appendChild(g)}}_renderCompactView(t,i,e,n,o){const a=this._calculateFlows(t,e,i,n),r=a.productionToLoad,h=a.batteryToLoad,s=a.gridToLoad,c=i||1,d=r/c*100,g=h/c*100,l=s/c*100,b=d+g+l;let x=d,u=g,m=l;if(b>0){const _=100/b;x=d*_,u=g*_,m=l*_}const w="#256028",S="#104b79",E="#7a211b",$="#7a6b1b";let y=null;if(o==="compact-battery"&&this._config?.battery_soc_entity){const _=this._getEntityState(this._config.battery_soc_entity);y=parseFloat(_?.state??"0")||0}let p=0,C=0,I=0,A=0,M=0,F=0,L=0,f=0,P=0;if(o==="compact-battery"){if(n<0){const k=Math.abs(n)||1;A=a.gridToBattery,F=a.productionToBattery,p=a.gridToBattery/k*100,I=a.productionToBattery/k*100;const q=p+I;if(q>0){const W=100/q;L=p*W,P=I*W}}else if(n>0){const _=n||1,k=n-a.batteryToLoad;M=a.batteryToLoad,A=k,C=a.batteryToLoad/_*100,p=k/_*100;const q=C+p;if(q>0){const W=100/q;f=C*W,L=p*W}}}(!this.querySelector(".compact-view")||this._lastViewMode!==o)&&(this.innerHTML=`
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
              gap: ${o==="compact-battery"?"12px":"0"};
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
                <div id="grid-segment" class="bar-segment" style="background: ${E}; width: ${l}%;">
                  <div class="bar-segment-content">
                    <ha-icon class="bar-segment-icon" icon="${this._getIcon("grid_icon","grid_entity","mdi:transmission-tower")}"></ha-icon>
                    <span class="bar-segment-label"></span>
                  </div>
                </div>
                <div id="battery-segment" class="bar-segment" style="background: ${S}; width: ${g}%;">
                  <div class="bar-segment-content">
                    <ha-icon class="bar-segment-icon" icon="${this._getIcon("battery_icon","battery_entity","mdi:battery")}"></ha-icon>
                    <span class="bar-segment-label"></span>
                  </div>
                </div>
                <div id="production-segment" class="bar-segment" style="background: ${w}; width: ${d}%;">
                  <div class="bar-segment-content">
                    <ha-icon class="bar-segment-icon" icon="${this._getIcon("production_icon","production_entity","mdi:solar-power")}"></ha-icon>
                    <span class="bar-segment-label"></span>
                  </div>
                </div>
              </div>
              <div class="row-value">
                <ha-icon class="row-icon" icon="${this._getIcon("load_icon","load_entity","mdi:home-lightning-bolt")}"></ha-icon>
                <div class="row-text">
                  <span id="load-value-text">${Math.round(i)}</span><span class="row-unit">W</span>
                </div>
              </div>
            </div>
            ${o==="compact-battery"?`
            <!-- Battery Row -->
            <div class="compact-row" id="battery-row">
              <div class="row-value" id="battery-soc-left" style="display: none;">
                <ha-icon class="row-icon" icon="${this._getIcon("battery_icon","battery_entity","mdi:battery")}"></ha-icon>
                <div class="row-text">
                  <span id="battery-soc-text-left">${y!==null?y.toFixed(1):"--"}</span><span class="row-unit">%</span>
                </div>
              </div>
              <div class="bar-container">
                <!-- Color order: red, yellow, blue, green (left to right) -->
                <div id="battery-grid-segment" class="bar-segment" style="background: ${n<0?E:$}; width: ${p}%;">
                  <div class="bar-segment-content">
                    <ha-icon class="bar-segment-icon" icon="${this._getIcon("grid_icon","grid_entity","mdi:transmission-tower")}"></ha-icon>
                    <span class="bar-segment-label"></span>
                  </div>
                </div>
                <div id="battery-load-segment" class="bar-segment" style="background: ${S}; width: ${C}%;">
                  <div class="bar-segment-content">
                    <ha-icon class="bar-segment-icon" icon="${this._getIcon("load_icon","load_entity","mdi:home")}"></ha-icon>
                    <span class="bar-segment-label"></span>
                  </div>
                </div>
                <div id="battery-production-segment" class="bar-segment" style="background: ${w}; width: ${I}%;">
                  <div class="bar-segment-content">
                    <ha-icon class="bar-segment-icon" icon="${this._getIcon("production_icon","production_entity","mdi:solar-power")}"></ha-icon>
                    <span class="bar-segment-label"></span>
                  </div>
                </div>
              </div>
              <div class="row-value" id="battery-soc-right">
                <ha-icon class="row-icon" icon="${this._getIcon("battery_icon","battery_entity","mdi:battery")}"></ha-icon>
                <div class="row-text">
                  <span id="battery-soc-text-right">${y!==null?y.toFixed(1):"--"}</span><span class="row-unit">%</span>
                </div>
              </div>
            </div>
            `:""}
          </div>
        </ha-card>
      `,this._lastViewMode=o,requestAnimationFrame(()=>{if(this._config){const _=this.querySelector("#production-segment"),k=this.querySelector("#battery-segment"),q=this.querySelector("#grid-segment"),D=this.querySelectorAll(".row-value")[0];if(_&&_.addEventListener("click",()=>{this._handleAction(this._config.production_tap_action,this._config.production_entity)}),k&&k.addEventListener("click",()=>{this._handleAction(this._config.battery_tap_action,this._config.battery_entity)}),q&&q.addEventListener("click",()=>{this._handleAction(this._config.grid_tap_action,this._config.grid_entity)}),D&&D.addEventListener("click",()=>{this._handleAction(this._config.load_tap_action,this._config.load_entity)}),o==="compact-battery"){const v=this.querySelector("#battery-production-segment"),T=this.querySelector("#battery-load-segment"),V=this.querySelector("#battery-grid-segment"),R=this.querySelector("#battery-soc-left"),H=this.querySelector("#battery-soc-right");v&&v.addEventListener("click",()=>{this._handleAction(this._config.production_tap_action,this._config.production_entity)}),T&&T.addEventListener("click",()=>{this._handleAction(this._config.load_tap_action,this._config.load_entity)}),V&&V.addEventListener("click",()=>{this._handleAction(this._config.grid_tap_action,this._config.grid_entity)}),R&&R.addEventListener("click",()=>{this._handleAction(this._config.battery_tap_action,this._config.battery_entity)}),H&&H.addEventListener("click",()=>{this._handleAction(this._config.battery_tap_action,this._config.battery_entity)})}}})),requestAnimationFrame(()=>{const _=this.querySelector("#production-segment"),k=this.querySelector("#battery-segment"),q=this.querySelector("#grid-segment"),W=this.querySelector("#load-value-text");if(_){_.style.width=`${x}%`;const D=_.querySelector(".bar-segment-label");D&&r>0&&(D.textContent=`${Math.round(d)}%`);const v=this.querySelector(".bar-container"),T=x/100*(v?.clientWidth||0);this._updateSegmentVisibility(_,T,r>0)}if(k){k.style.width=`${u}%`;const D=k.querySelector(".bar-segment-label");D&&h>0&&(D.textContent=`${Math.round(g)}%`);const v=this.querySelector(".bar-container"),T=u/100*(v?.clientWidth||0);this._updateSegmentVisibility(k,T,h>0)}if(q){q.style.width=`${m}%`;const D=q.querySelector(".bar-segment-label");D&&s>0&&(D.textContent=`${Math.round(l)}%`);const v=this.querySelector(".bar-container"),T=m/100*(v?.clientWidth||0);this._updateSegmentVisibility(q,T,s>0)}if(W&&(W.textContent=String(Math.round(i))),o==="compact-battery"){const D=this.querySelector("#battery-grid-segment"),v=this.querySelector("#battery-load-segment"),T=this.querySelector("#battery-production-segment"),V=this.querySelector("#battery-soc-left"),R=this.querySelector("#battery-soc-right"),H=this.querySelector("#battery-soc-text-left"),O=this.querySelector("#battery-soc-text-right"),X=this.querySelectorAll(".bar-container")[1];let j=!1;if(n<0?(j=!0,V&&(V.style.display="none"),R&&(R.style.display="flex"),O&&y!==null&&(O.textContent=y.toFixed(1))):n>0?(j=!1,V&&(V.style.display="flex"),R&&(R.style.display="none"),H&&y!==null&&(H.textContent=y.toFixed(1))):(V&&(V.style.display="none"),R&&(R.style.display="flex"),O&&y!==null&&(O.textContent=y.toFixed(1))),D){const B=j?"#7a211b":"#7a6b1b";D.style.width=`${L}%`,D.style.background=B;const z=D.querySelector(".bar-segment-label");z&&A>0&&(z.textContent=`${Math.round(A)}W`);const N=L/100*(X?.offsetWidth||0);this._updateSegmentVisibility(D,N,A>0)}if(v){v.style.width=`${f}%`;const B=v.querySelector(".bar-segment-label");B&&M>0&&(B.textContent=`${Math.round(M)}W`);const z=f/100*(X?.offsetWidth||0);this._updateSegmentVisibility(v,z,M>0)}if(T){T.style.width=`${P}%`;const B=T.querySelector(".bar-segment-label");B&&F>0&&(B.textContent=`${Math.round(F)}W`);const z=P/100*(X?.offsetWidth||0);this._updateSegmentVisibility(T,z,F>0)}}})}async _renderChartView(t,i,e,n){(!this.querySelector(".chart-view")||this._lastViewMode!=="chart")&&(this.innerHTML=`
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
      `,this._lastViewMode="chart"),this._liveChartValues={grid:t,load:i,production:e,battery:n},await this._fetchAndRenderChartData()}async _fetchAndRenderChartData(){if(!this._hass||!this._config||this._chartRenderPending)return;const t=12,i=Date.now(),e=this._chartDataCache?i-this._chartDataCache.timestamp:1/0,n=300*1e3;if(this._chartDataCache&&e>=n&&(this._chartDataCache=void 0),this._chartDataCache&&e<n){this._renderChartFromCache();return}this._chartRenderPending=!0;const o=new Date,a=new Date(o.getTime()-t*60*60*1e3);try{const[r,h,s,c]=await Promise.all([this._fetchHistory(this._config.production_entity,a,o),this._fetchHistory(this._config.grid_entity,a,o),this._fetchHistory(this._config.load_entity,a,o),this._fetchHistory(this._config.battery_entity,a,o)]);this._drawStackedAreaChart(r,h,s,c,t),this._chartRenderPending=!1;const d=this.querySelector(".loading-message");d&&d.remove()}catch(r){console.error("Error fetching chart data:",r),this._chartRenderPending=!1;const h=this.querySelector(".chart-svg");h&&(h.innerHTML=`
          <text x="400" y="200" text-anchor="middle" fill="rgb(160, 160, 160)" font-size="14">
            Error loading chart data
          </text>
        `)}}_renderChartFromCache(){if(!this._chartDataCache)return;const t=this.querySelector(".chart-svg");if(!t)return;const i=this._chartDataCache.dataPoints,e=Math.max(...i.map(p=>p.solar+p.batteryDischarge+p.gridImport),...i.map(p=>p.load)),n=Math.max(...i.map(p=>p.batteryCharge+p.gridExport)),o=e+n,a=o>0?e/o:.5,r=o>0?n/o:.5,h=800,s=400,c={top:20,right:150,bottom:40,left:60},d=h-c.left-c.right,g=s-c.top-c.bottom,l=g*a,b=g*r,x=e>0?l/(e*1.1):1,u=n>0?b/(n*1.1):1,m=c.top+l,w=this._createStackedPaths(i,d,l,x,c,"supply",m),S=this._createStackedPaths(i,d,b,u,c,"demand",m),E=this._createLoadLine(i,d,l,x,c,m);let $=`
      <g opacity="0.1">
        ${this._createGridLines(d,g,c,Math.max(e,n))}
      </g>
      <line x1="${c.left}" y1="${m}" x2="${c.left+d}" y2="${m}" stroke="rgb(160, 160, 160)" stroke-width="1" stroke-dasharray="4,4" />
      ${S}
      ${w}
      ${this._createTimeLabels(d,g,c,12)}
      ${this._createYAxisLabels(l,b,c,e,n,m)}
    `;t.innerHTML=$,this._updateChartIndicators(),this._addLoadLineOnTop(t,E);const y=this.querySelector(".loading-message");y&&y.remove()}_updateChartIndicators(){const t=this.querySelector(".chart-svg");if(!t||!this._chartDataCache||!this._liveChartValues)return;const i=this._chartDataCache.dataPoints,e=Math.max(...i.map(w=>w.solar+w.batteryDischarge+w.gridImport),...i.map(w=>w.load)),n=Math.max(...i.map(w=>w.batteryCharge+w.gridExport)),o=e+n,a=o>0?e/o:.5,r=o>0?n/o:.5,h=800,s=400,c={top:20,right:150,bottom:40,left:60},d=s-c.top-c.bottom,g=d*a,l=d*r,b=e>0?g/(e*1.1):1,x=n>0?l/(n*1.1):1,u=c.top+g;this._renderChartIndicators(t,i,h-c.left-c.right,g,l,b,x,c,{},u);const m=this._createLoadLine(i,h-c.left-c.right,g,b,c,u);this._addLoadLineOnTop(t,m)}async _fetchHistory(t,i,e){if(!this._hass)return[];const n=`history/period/${i.toISOString()}?filter_entity_id=${t}&end_time=${e.toISOString()}&minimal_response&no_attributes`;try{return(await this._hass.callApi("GET",n))[0]||[]}catch(o){return console.error(`Error fetching history for ${t}:`,o),[]}}_drawStackedAreaChart(t,i,e,n,o){const a=this.querySelector(".chart-svg");if(!a)return;const r=800,h=400,s={top:20,right:150,bottom:40,left:60},c=r-s.left-s.right,d=h-s.top-s.bottom,l=o*120,x=o*12,u=10,m=new Date,w=Math.floor(m.getMinutes()/5)*5,S=new Date(m.getFullYear(),m.getMonth(),m.getDate(),m.getHours(),w,0,0),E=new Date(S.getTime()-o*60*60*1e3),$=[];for(let v=0;v<l;v++){const T=new Date(E.getTime()+v*30*1e3),V=this._interpolateValue(t,T),R=this._interpolateValue(i,T),H=this._interpolateValue(e,T);let O=this._interpolateValue(n,T);this._config?.invert_battery_data&&(O=-O),$.push({time:T,solar:Math.max(0,V),batteryDischarge:Math.max(0,O),batteryCharge:Math.max(0,-O),gridImport:Math.max(0,R),gridExport:Math.max(0,-R),load:Math.max(0,H)})}const y=[];for(let v=0;v<x;v++){const T=new Date(E.getTime()+(v+1)*5*60*1e3),V=v*u,R=Math.min(V+u,$.length),H=R-V;let O=0,Z=0,X=0,j=0,B=0,z=0;for(let N=V;N<R;N++)O+=$[N].solar,Z+=$[N].batteryDischarge,X+=$[N].batteryCharge,j+=$[N].gridImport,B+=$[N].gridExport,z+=$[N].load;v===0&&console.log("Chart data sample (5-min avg of 30-sec data):",{time:T.toISOString(),windowSize:H,solar:O/H,invert_battery_data:this._config?.invert_battery_data}),y.push({time:T,solar:O/H,batteryDischarge:Z/H,batteryCharge:X/H,gridImport:j/H,gridExport:B/H,load:z/H})}$.length=0,this._chartDataCache={timestamp:Date.now(),dataPoints:y};const p=Math.max(...y.map(v=>v.solar+v.batteryDischarge+v.gridImport),...y.map(v=>v.load)),C=Math.max(...y.map(v=>v.batteryCharge+v.gridExport)),I=p+C,A=I>0?p/I:.5,M=I>0?C/I:.5,F=p>0?d*A/(p*1.1):1,L=C>0?d*M/(C*1.1):1,f=Math.min(F,L),P=p*f*1.1,Y=C*f*1.1,_=s.top+P,k=this._createStackedPaths(y,c,P,f,s,"supply",_),q=this._createStackedPaths(y,c,Y,f,s,"demand",_),W=this._createLoadLine(y,c,P,f,s,_);let D=`
      <!-- Grid lines -->
      <g opacity="0.1">
        ${this._createGridLines(c,d,s,Math.max(p,C))}
      </g>
      
      <!-- Zero line (dynamic position based on supply height) -->
      <line 
        x1="${s.left}" 
        y1="${_}" 
        x2="${s.left+c}" 
        y2="${_}" 
        stroke="rgb(160, 160, 160)" 
        stroke-width="1" 
        stroke-dasharray="4,4"
      />
      
      <!-- Demand areas (below zero line) -->
      ${q}
      
      <!-- Supply areas (above zero line) -->
      ${k}
      
      <!-- Time axis labels -->
      ${this._createTimeLabels(c,d,s,o)}
      
      <!-- Y-axis labels -->
      ${this._createYAxisLabels(P,Y,s,p,C,_)}
      
      <!-- Floating indicators with current values -->
      ${this._createFloatingIndicators(y,c,d,f,f,s,r)}
      
      <!-- Hidden icon sources for extraction -->
      ${this._createChartIconSources()}
    `;a.innerHTML=D,requestAnimationFrame(()=>{this._extractChartIcons(y,c,P,Y,f,f,s,_),this._addLoadLineOnTop(a,W)})}_interpolateValue(t,i){if(t.length===0)return 0;let e=t[0],n=Math.abs(new Date(t[0].last_changed).getTime()-i.getTime());for(const o of t){const a=Math.abs(new Date(o.last_changed).getTime()-i.getTime());a<n&&(n=a,e=o)}return parseFloat(e.state)||0}_createStackedPaths(t,i,e,n,o,a,r){const h=t.length,s=i/(h-1);if(a==="supply"){const c=this._createAreaPath(t,s,r,n,o,l=>l.solar,0,"down"),d=this._createAreaPath(t,s,r,n,o,l=>l.batteryDischarge,l=>l.solar,"down"),g=this._createAreaPath(t,s,r,n,o,l=>l.gridImport,l=>l.solar+l.batteryDischarge,"down");return`
        ${g?`<path d="${g}" fill="#c62828" opacity="0.8" />`:""}
        ${d?`<path d="${d}" fill="#1976d2" opacity="0.8" />`:""}
        ${c?`<path d="${c}" fill="#388e3c" opacity="0.85" />`:""}
      `}else{const c=this._createAreaPath(t,s,r,n,o,g=>g.batteryCharge,0,"up"),d=this._createAreaPath(t,s,r,n,o,g=>g.gridExport,g=>g.batteryCharge,"up");return`
        ${d?`<path d="${d}" fill="#f9a825" opacity="0.8" />`:""}
        ${c?`<path d="${c}" fill="#1976d2" opacity="0.8" />`:""}
      `}}_createLoadLine(t,i,e,n,o,a){if(!t||t.length===0)return"";const r=i/(t.length-1);return`<path d="${t.map((s,c)=>{const d=o.left+c*r,g=a-s.load*n;return`${c===0?"M":"L"} ${d},${g}`}).join(" ")}" fill="none" stroke="#CCCCCC" stroke-width="3" opacity="0.9" />`}_createFloatingIndicators(t,i,e,n,o,a,r){return""}_createChartIconSources(){const t=this._getIcon("load_icon","load_entity","mdi:home-lightning-bolt"),i=this._getIcon("production_icon","production_entity","mdi:solar-power"),e=this._getIcon("battery_icon","battery_entity","mdi:battery"),n=this._getIcon("grid_icon","grid_entity","mdi:transmission-tower");return`
      <foreignObject id="chart-icon-source-load" x="-100" y="-100" width="24" height="24">
        <div xmlns="http://www.w3.org/1999/xhtml">
          <ha-icon icon="${t}"></ha-icon>
        </div>
      </foreignObject>
      <foreignObject id="chart-icon-source-solar" x="-100" y="-100" width="24" height="24">
        <div xmlns="http://www.w3.org/1999/xhtml">
          <ha-icon icon="${i}"></ha-icon>
        </div>
      </foreignObject>
      <foreignObject id="chart-icon-source-battery" x="-100" y="-100" width="24" height="24">
        <div xmlns="http://www.w3.org/1999/xhtml">
          <ha-icon icon="${e}"></ha-icon>
        </div>
      </foreignObject>
      <foreignObject id="chart-icon-source-grid" x="-100" y="-100" width="24" height="24">
        <div xmlns="http://www.w3.org/1999/xhtml">
          <ha-icon icon="${n}"></ha-icon>
        </div>
      </foreignObject>
    `}async _extractChartIcons(t,i,e,n,o,a,r,h){const s=this.querySelector(".chart-svg");if(!s||!t||t.length===0)return;const c=["load","solar","battery","grid"],d={};for(const g of c){const l=s.querySelector(`#chart-icon-source-${g}`);if(!l)continue;const b=l.querySelector("div");if(!b)continue;const x=b.querySelector("ha-icon");if(!x)continue;const u=x.getAttribute("icon");if(!u)continue;if(this._iconCache.has(u)){d[g]=this._iconCache.get(u)||null;continue}const m=await this._extractIconPath(x,u);d[g]=m,m&&this._iconCache.set(u,m)}this._renderChartIndicators(s,t,i,e,n,o,a,r,d,h)}async _extractIconPath(t,i,e=10){for(let n=0;n<e;n++){try{const o=t.shadowRoot;if(!o){await new Promise(s=>setTimeout(s,100));continue}let a=o.querySelector("svg");if(!a){const s=o.querySelector("ha-svg-icon");s&&s.shadowRoot&&(a=s.shadowRoot.querySelector("svg"))}if(!a){await new Promise(s=>setTimeout(s,100));continue}const r=a.querySelector("path");if(!r){await new Promise(s=>setTimeout(s,100));continue}const h=r.getAttribute("d");if(h)return h}catch(o){console.error(`Failed to extract icon path for ${i} (attempt ${n+1}):`,o)}await new Promise(o=>setTimeout(o,100))}return null}_renderChartIndicators(t,i,e,n,o,a,r,h,s,c){let d=t.querySelector("#chart-indicators");const g=!d;d||(d=document.createElementNS("http://www.w3.org/2000/svg","g"),d.setAttribute("id","chart-indicators"),t.appendChild(d)),g&&t.querySelectorAll('[id^="chart-icon-source-"]').forEach(C=>C.remove());let l;if(this._liveChartValues){const{grid:p,load:C,production:I,battery:A}=this._liveChartValues;l={load:Math.max(0,C),solar:Math.max(0,I),batteryDischarge:Math.max(0,A),batteryCharge:Math.max(0,-A),gridImport:Math.max(0,p),gridExport:Math.max(0,-p)}}else l=i[i.length-1];const b=h.left+e,x=c-l.load*a,u=c-l.solar*a,m=c-(l.solar+l.batteryDischarge)*a,w=c-(l.solar+l.batteryDischarge+l.gridImport)*a,S=c+l.batteryCharge*r,E=c+(l.batteryCharge+l.gridExport)*r,$=p=>`${Math.round(p)} W`,y=(p,C,I,A,M,F="",L=!0)=>{let f=d.querySelector(`#${p}`);if(!L){f&&f.remove();return}if(!f){f=document.createElementNS("http://www.w3.org/2000/svg","g"),f.setAttribute("id",p);const Y=s[A];if(Y){const k=document.createElementNS("http://www.w3.org/2000/svg","g");k.setAttribute("class","indicator-icon"),k.setAttribute("transform","translate(10, -8) scale(0.67)");const q=document.createElementNS("http://www.w3.org/2000/svg","path");q.setAttribute("d",Y),q.setAttribute("fill",I),k.appendChild(q),f.appendChild(k)}const _=document.createElementNS("http://www.w3.org/2000/svg","text");_.setAttribute("class","indicator-text"),_.setAttribute("x","28"),_.setAttribute("y","4"),_.setAttribute("fill",I),_.setAttribute("font-size","12"),_.setAttribute("font-weight","600"),f.appendChild(_),d.appendChild(f)}f.setAttribute("transform",`translate(${b+10}, ${C})`);const P=f.querySelector(".indicator-text");P&&(P.textContent=`${F}${M}`)};y("indicator-solar",u,"#388e3c","solar",$(l.solar),"",l.solar>0),y("indicator-battery-discharge",m,"#1976d2","battery",$(l.batteryDischarge),"+",l.batteryDischarge>0),y("indicator-grid-import",w,"#c62828","grid",$(l.gridImport),"",l.gridImport>0),y("indicator-battery-charge",S,"#1976d2","battery",$(l.batteryCharge),"-",l.batteryCharge>0),y("indicator-grid-export",E,"#f9a825","grid",$(l.gridExport),"",l.gridExport>0),y("indicator-load",x,"#CCCCCC","load",$(l.load),"",!0)}_addLoadLineOnTop(t,i){if(!i)return;const e=t.querySelector("#load-line");e&&e.remove();const n=i.match(/d="([^"]+)"/);if(!n)return;const o=n[1],a=document.createElementNS("http://www.w3.org/2000/svg","path");a.setAttribute("id","load-line"),a.setAttribute("d",o),a.setAttribute("fill","none"),a.setAttribute("stroke","#CCCCCC"),a.setAttribute("stroke-width","3"),a.setAttribute("opacity","0.9"),t.appendChild(a)}_createAreaPath(t,i,e,n,o,a,r,h){const s=[],c=[];let d=!1;if(t.forEach((l,b)=>{const x=o.left+b*i,u=a(l),m=typeof r=="function"?r(l):r;u>0&&(d=!0);const w=h==="down"?-(u+m)*n:(u+m)*n,S=h==="down"?-m*n:m*n;s.push({x,y:e+w}),c.push({x,y:e+S})}),!d)return null;let g=`M ${s[0].x} ${s[0].y}`;for(let l=1;l<s.length;l++)g+=` L ${s[l].x} ${s[l].y}`;for(let l=c.length-1;l>=0;l--)g+=` L ${c[l].x} ${c[l].y}`;return g+=" Z",g}_createGridLines(t,i,e,n){const o=[];for(let r=0;r<=4;r++){const h=e.top+r*i/4;o.push(`<line x1="${e.left}" y1="${h}" x2="${e.left+t}" y2="${h}" stroke="white" stroke-width="1" />`)}return o.join(`
`)}_createTimeLabels(t,i,e,n){const o=[],r=new Date;for(let h=0;h<=6;h++){const s=n-h*n/6,c=new Date(r.getTime()-s*60*60*1e3),d=c.getMinutes(),g=d<15?0:d<45?30:0,l=d>=45?1:0;c.setMinutes(g),c.setSeconds(0),c.setMilliseconds(0),l&&c.setHours(c.getHours()+l);const b=e.left+h*t/6,x=e.top+i+20,u=c.getHours(),m=u===0?12:u>12?u-12:u,w=u>=12?"PM":"AM";o.push(`
        <text x="${b}" y="${x}" text-anchor="middle" fill="rgb(160, 160, 160)" font-size="11">
          ${m} ${w}
        </text>
      `)}return o.join(`
`)}_createYAxisLabels(t,i,e,n,o,a){const r=[];return r.push(`<text x="${e.left-10}" y="${e.top+5}" text-anchor="end" fill="rgb(160, 160, 160)" font-size="11">${Math.round(n)}W</text>`),r.push(`<text x="${e.left-10}" y="${a+5}" text-anchor="end" fill="rgb(160, 160, 160)" font-size="11">0</text>`),r.push(`<text x="${e.left-10}" y="${a+i+5}" text-anchor="end" fill="rgb(160, 160, 160)" font-size="11">-${Math.round(o)}W</text>`),r.join(`
`)}_createChartLegend(t,i,e){const n=[{label:"Solar",color:e.solar},{label:"Battery",color:e.batteryDischarge},{label:"Grid Import",color:e.gridImport},{label:"Grid Export",color:e.gridExport},{label:"Load",color:e.load}],o=t-i.right-10;let a=i.top;return n.map((r,h)=>{const s=a+h*20;return`
        <rect x="${o-80}" y="${s-10}" width="12" height="12" fill="${r.color}" opacity="0.8" />
        <text x="${o-64}" y="${s}" fill="rgb(200, 200, 200)" font-size="11">${r.label}</text>
      `}).join(`
`)}_updateSegmentVisibility(t,i,e){if(!t||!e){t?.setAttribute("data-width-px","");return}i>=80?t.setAttribute("data-width-px","show-label"):i>=40?t.setAttribute("data-width-px","show-icon"):t.setAttribute("data-width-px","")}}customElements.define("energy-flow-card",J),window.customCards=window.customCards||[],window.customCards.push({type:"energy-flow-card",name:"Energy Flow Card",description:"A test energy-flow card."})})();

(function(){"use strict";class Q{constructor(t,i,e,n,o,s,r,h,a=!1,c=!1,d,g,l){this.id=t,this._value=i,this.min=e,this.max=n,this.bidirectional=o,this.label=s,this.icon=r,this.units=h,this._invertView=a,this.showPlus=c,this.tapAction=d,this.entityId=g,this.fireEventCallback=l,this.element=null,this.radius=50,this.boxWidth=120,this.boxHeight=135,this.boxRadius=16,this.centerX=this.boxWidth/2,this.centerY=this.radius+25,this.offsetX=-this.centerX,this.offsetY=-this.centerY,this.needleState={target:0,current:0,ghost:0},this._lastAnimationTime=null,this._animationFrameId=null,this._updateNeedleAngle()}get value(){return this._value}set value(t){if(this._value!==t&&(this._value=t,this._updateNeedleAngle(),this.element)){const i=this.element.querySelector(`#value-${this.id}`);i&&(i.textContent=this._formatValueText()),this.updateDimming()}}get invertView(){return this._invertView}set invertView(t){if(this._invertView!==t&&(this._invertView=t,this._updateNeedleAngle(),this.element)){const i=this.element.querySelector(`#value-${this.id}`);i&&(i.textContent=this._formatValueText())}}get displayValue(){return this._invertView?-this._value:this._value}_formatValueText(){const t=this.displayValue,i=t.toFixed(0);return t<0?i+" ":t>0&&this.showPlus?"+"+i+" ":i}_updateNeedleAngle(){let t,i;const e=this.displayValue;if(this.bidirectional){const n=this.max-this.min;t=Math.min(Math.max((e-this.min)/n,0),1),i=180-t*180}else t=Math.min(Math.max(e/this.max,0),1),i=180-t*180;this.needleState.target=i}updateDimming(){if(!this.element)return;const t=this.element.querySelector(`#dimmer-${this.id}`);if(t){const i=Math.abs(this.value)<.5;t.setAttribute("opacity",i?"0.3":"0")}}startAnimation(){if(this._animationFrameId)return;const t=i=>{this._lastAnimationTime||(this._lastAnimationTime=i);const e=i-this._lastAnimationTime;if(this._lastAnimationTime=i,!this.element){this._animationFrameId=null;return}const n=this.radius-5,o=Math.min(e/150,1);this.needleState.current+=(this.needleState.target-this.needleState.current)*o;const s=Math.min(e/400,1);this.needleState.ghost+=(this.needleState.current-this.needleState.ghost)*s;const r=10;this.needleState.ghost<this.needleState.current-r?this.needleState.ghost=this.needleState.current-r:this.needleState.ghost>this.needleState.current+r&&(this.needleState.ghost=this.needleState.current+r);const h=this.element.querySelector(`#needle-${this.id}`);if(h){const c=this.needleState.current*Math.PI/180,d=this.centerX+n*Math.cos(c),g=this.centerY-n*Math.sin(c);h.setAttribute("x2",String(d)),h.setAttribute("y2",String(g))}const a=this.element.querySelector(`#ghost-needle-${this.id}`);if(a){const c=this.needleState.ghost*Math.PI/180,d=this.centerX+n*Math.cos(c),g=this.centerY-n*Math.sin(c);a.setAttribute("x2",String(d)),a.setAttribute("y2",String(g))}this._animationFrameId=requestAnimationFrame(t)};this._animationFrameId=requestAnimationFrame(t)}stopAnimation(){this._animationFrameId&&(cancelAnimationFrame(this._animationFrameId),this._animationFrameId=null,this._lastAnimationTime=null)}_handleTapAction(){if(!this.fireEventCallback)return;const t=this.tapAction||{action:"more-info"};switch(t.action||"more-info"){case"more-info":const e=t.entity||this.entityId;e&&this.fireEventCallback("hass-more-info",{entityId:e});break;case"navigate":t.navigation_path&&(history.pushState(null,"",t.navigation_path),this.fireEventCallback("location-changed",{replace:t.navigation_replace||!1}));break;case"url":t.url_path&&window.open(t.url_path);break;case"toggle":this.entityId&&this.fireEventCallback("call-service",{domain:"homeassistant",service:"toggle",service_data:{entity_id:this.entityId}});break;case"perform-action":if(t.perform_action){const[n,o]=t.perform_action.split(".");this.fireEventCallback("call-service",{domain:n,service:o,service_data:t.data||{},target:t.target})}break;case"assist":this.fireEventCallback("show-dialog",{dialogTag:"ha-voice-command-dialog",dialogParams:{pipeline_id:t.pipeline_id||"last_used",start_listening:t.start_listening}});break}}createElement(){const t=this.displayValue;let i,e;if(this.bidirectional){const _=this.max-this.min;i=Math.min(Math.max((t-this.min)/_,0),1),e=180-i*180}else i=Math.min(Math.max(t/this.max,0),1),e=180-i*180;this.needleState.target=e,this.needleState.current=e,this.needleState.ghost=e;const o=(this.bidirectional?[this.min,0,this.max]:[0,this.max/2,this.max]).map(_=>{const C=(180-(this.bidirectional?(_-this.min)/(this.max-this.min):_/this.max)*180)*Math.PI/180,I=this.radius,P=this.radius-8,v=this.centerX+I*Math.cos(C),T=this.centerY-I*Math.sin(C),W=this.centerX+P*Math.cos(C),S=this.centerY-P*Math.sin(C);return`<line x1="${v}" y1="${T}" x2="${W}" y2="${S}" stroke="rgb(160, 160, 160)" stroke-width="2" />`}).join(""),h=(180-(this.bidirectional?(0-this.min)/(this.max-this.min):0)*180)*Math.PI/180,a=this.centerX,c=this.centerY,d=this.centerX+this.radius*Math.cos(h),g=this.centerY-this.radius*Math.sin(h),l=`<line x1="${a}" y1="${c}" x2="${d}" y2="${g}" stroke="rgb(100, 100, 100)" stroke-width="2" />`,f=e*Math.PI/180,b=this.radius-5,m=this.centerX+b*Math.cos(f),u=this.centerY-b*Math.sin(f),M=this.centerY+5,x=this.centerY+this.radius*.5,k=this.centerY+this.radius*.7,$=`
      <g transform="translate(${this.offsetX}, ${this.offsetY})">
        <defs>
          <clipPath id="clip-${this.id}-local">
            <rect x="0" y="0" width="${this.boxWidth}" height="${M+2}" />
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
        
        <line id="ghost-needle-${this.id}" x1="${this.centerX}" y1="${this.centerY}" x2="${m}" y2="${u}" stroke="rgb(255, 255, 255)" stroke-width="4" stroke-linecap="round" opacity="0.3" />
        
        <line id="needle-${this.id}" x1="${this.centerX}" y1="${this.centerY}" x2="${m}" y2="${u}" stroke="rgb(255, 255, 255)" stroke-width="4" stroke-linecap="round" />
        
        <circle cx="${this.centerX}" cy="${this.centerY}" r="5" fill="rgb(255, 255, 255)" />
        
        <text id="value-${this.id}" x="${this.centerX}" y="${x}" text-anchor="middle" font-size="16" fill="rgb(255, 255, 255)" font-weight="600">${this._formatValueText()}</text>
        
        <text x="${this.centerX}" y="${k}" text-anchor="middle" font-size="8" fill="rgb(160, 160, 160)" font-weight="400" letter-spacing="0.5">${this.units}</text>
        
        <rect id="dimmer-${this.id}" x="0" y="0" width="${this.boxWidth}" height="${this.boxHeight}" rx="${this.boxRadius}" ry="${this.boxRadius}" fill="black" opacity="0" pointer-events="none" style="transition: opacity 0.8s ease-in-out;" />
      </g>
    `,y=document.createElementNS("http://www.w3.org/2000/svg","svg");y.innerHTML=$;const p=y.firstElementChild;return this.element=p,(!this.tapAction||this.tapAction.action!=="none")&&(p.style.cursor="pointer",p.addEventListener("click",_=>{this._handleTapAction(),_.stopPropagation()}),p.addEventListener("mouseenter",()=>{p.style.filter="brightness(1.1)"}),p.addEventListener("mouseleave",()=>{p.style.filter=""})),p}}function U(G){const t=Math.max(0,G.production),i=G.grid,e=G.battery,n=Math.max(0,G.load),o={productionToLoad:0,productionToBattery:0,productionToGrid:0,gridToLoad:0,gridToBattery:0,batteryToLoad:0};let s=t,r=n;if(s>0&&r>0&&(o.productionToLoad=Math.min(s,r),s-=o.productionToLoad,r-=o.productionToLoad),e<0&&s>0&&(o.productionToBattery=Math.min(s,Math.abs(e)),s-=o.productionToBattery),e>0&&r>0&&(o.batteryToLoad=Math.min(e,r),r-=o.batteryToLoad),r>0&&i>0&&(o.gridToLoad=Math.min(i,r),r-=o.gridToLoad),e<0&&i>10){const h=Math.abs(e)-o.productionToBattery;h>1&&(o.gridToBattery=Math.min(i-o.gridToLoad,h))}return i<-10&&(o.productionToGrid=Math.abs(i)),o}class J extends HTMLElement{constructor(){super(),this._resizeObserver=null,this._animationFrameId=null,this._flowDots=new Map,this._lastAnimationTime=null,this._iconCache=new Map,this._iconsExtracted=!1,this._iconExtractionTimeouts=new Set,this._chartDataCache=void 0,this._chartRenderPending=!1,this._meters=new Map,this._speedMultiplier=.8,this._dotsPerFlow=3;const t=500,i=470,e=5,n=3;this._meterPositions={production:{x:60+e,y:80+n},battery:{x:130+e,y:240+n},grid:{x:60+e,y:400+n},load:{x:360+e,y:240+n}},this._canvasWidth=t,this._canvasHeight=i}static getStubConfig(){return{}}static getConfigForm(){return{schema:[{name:"view_mode",label:"View Mode",selector:{select:{options:[{value:"default",label:"Default"},{value:"compact",label:"Compact Bar"},{value:"compact-battery",label:"Compact with Battery"},{value:"chart",label:"Chart"}]}}},{name:"grid_entity",label:"Grid",required:!0,selector:{entity:{domain:"sensor",device_class:"power"}}},{name:"grid_name",selector:{entity_name:{}},context:{entity:"grid_entity"}},{name:"grid_icon",selector:{icon:{}},context:{icon_entity:"grid_entity"}},{name:"grid_min",label:"Grid Min (W)",selector:{number:{mode:"box"}}},{name:"grid_max",label:"Grid Max (W)",selector:{number:{mode:"box"}}},{name:"grid_tap_action",label:"Grid Tap Action",selector:{"ui-action":{}}},{name:"load_entity",label:"Load",required:!0,selector:{entity:{domain:"sensor",device_class:"power"}}},{name:"load_name",selector:{entity_name:{}},context:{entity:"load_entity"}},{name:"load_icon",selector:{icon:{}},context:{icon_entity:"load_entity"}},{name:"load_max",label:"Load Max (W)",selector:{number:{mode:"box"}}},{name:"load_tap_action",label:"Load Tap Action",selector:{"ui-action":{}}},{name:"production_entity",label:"Production",required:!0,selector:{entity:{domain:"sensor",device_class:"power"}}},{name:"production_name",selector:{entity_name:{}},context:{entity:"production_entity"}},{name:"production_icon",selector:{icon:{}},context:{icon_entity:"production_entity"}},{name:"production_max",label:"Production Max (W)",selector:{number:{mode:"box"}}},{name:"production_tap_action",label:"Production Tap Action",selector:{"ui-action":{}}},{name:"battery_entity",label:"Battery",required:!0,selector:{entity:{domain:"sensor",device_class:"power"}}},{name:"battery_name",selector:{entity_name:{}},context:{entity:"battery_entity"}},{name:"battery_icon",selector:{icon:{}},context:{icon_entity:"battery_entity"}},{name:"battery_min",label:"Battery Min (W)",selector:{number:{mode:"box"}}},{name:"battery_max",label:"Battery Max (W)",selector:{number:{mode:"box"}}},{name:"battery_tap_action",label:"Battery Tap Action",selector:{"ui-action":{}}},{name:"battery_soc_entity",label:"Battery SOC (%) Entity",selector:{entity:{domain:"sensor"}}},{name:"invert_battery_data",label:"Invert Battery Data",selector:{boolean:{}}},{name:"invert_battery_view",label:"Invert Battery View",selector:{boolean:{}}},{name:"show_plus",label:"Show + Sign",selector:{boolean:{}}}]}}connectedCallback(){this._resizeObserver=new ResizeObserver(()=>{if(this._lastValues){const t=this._lastValues;requestAnimationFrame(()=>{this._drawFlows(t.grid,t.production,t.load,t.battery)})}}),this.parentElement&&this._resizeObserver.observe(this.parentElement),this._resizeObserver.observe(this)}disconnectedCallback(){this._resizeObserver&&(this._resizeObserver.disconnect(),this._resizeObserver=null),this._meters.forEach(t=>t.stopAnimation()),this._animationFrameId&&(cancelAnimationFrame(this._animationFrameId),this._animationFrameId=null),this._iconExtractionTimeouts.forEach(t=>clearTimeout(t)),this._iconExtractionTimeouts.clear(),this._chartDataCache=void 0,this._iconCache.clear()}setConfig(t){this._config=t,this._render()}set hass(t){this._hass=t,this._render()}_render(){if(!this._config||!this._hass)return;const t=this._getEntityState(this._config.grid_entity),i=this._getEntityState(this._config.load_entity),e=this._getEntityState(this._config.production_entity),n=this._getEntityState(this._config.battery_entity),o=parseFloat(t?.state??"0")||0,s=parseFloat(i?.state??"0")||0,r=parseFloat(e?.state??"0")||0;let h=parseFloat(n?.state??"0")||0;this._config.invert_battery_data&&(h=-h);const a=this._config.view_mode||"default";if(this._lastViewMode==="chart"&&a!=="chart"&&(this._chartDataCache=void 0),a==="compact"||a==="compact-battery"){this._renderCompactView(o,s,r,h,a);return}if(a==="chart"){this._liveChartValues={grid:o,load:s,production:r,battery:h},this._lastViewMode!=="chart"||!this.querySelector(".chart-view")?this._renderChartView(o,s,r,h):this._updateChartIndicators();return}const c=this._config.grid_min!=null?this._config.grid_min:-5e3,d=this._config.grid_max!=null?this._config.grid_max:5e3,g=this._config.load_max!=null?this._config.load_max:5e3,l=this._config.production_max!=null?this._config.production_max:5e3,f=this._config.battery_min!=null?this._config.battery_min:-5e3,b=this._config.battery_max!=null?this._config.battery_max:5e3;if(this.querySelector(".energy-flow-svg")){const m=this._meters.get("production"),u=this._meters.get("battery"),M=this._meters.get("grid"),x=this._meters.get("load");m&&(m.value=r),u&&(u.invertView=this._config.invert_battery_view??!1,u.value=h),M&&(M.value=o),x&&(x.value=s)}else{this._iconsExtracted=!1;const m=($,y)=>{this._fireEvent.call(this,$,y)},u=new Q("production",r,0,l,!1,this._getDisplayName("production_name","production_entity","Production"),this._getIcon("production_icon","production_entity","mdi:solar-power"),"WATTS",!1,!1,this._config.production_tap_action,this._config.production_entity,m),M=new Q("battery",h,f,b,!0,this._getDisplayName("battery_name","battery_entity","Battery"),this._getIcon("battery_icon","battery_entity","mdi:battery"),"WATTS",this._config.invert_battery_view,this._config.show_plus,this._config.battery_tap_action,this._config.battery_entity,m),x=new Q("grid",o,c,d,!0,this._getDisplayName("grid_name","grid_entity","Grid"),this._getIcon("grid_icon","grid_entity","mdi:transmission-tower"),"WATTS",!1,!1,this._config.grid_tap_action,this._config.grid_entity,m),k=new Q("load",s,0,g,!1,this._getDisplayName("load_name","load_entity","Load"),this._getIcon("load_icon","load_entity","mdi:home-lightning-bolt"),"WATTS",!1,!1,this._config.load_tap_action,this._config.load_entity,m);this.innerHTML=`
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
      `,requestAnimationFrame(()=>{const $=this.querySelector("#production-meter"),y=this.querySelector("#battery-meter"),p=this.querySelector("#grid-meter"),_=this.querySelector("#load-meter");$&&$.appendChild(u.createElement()),y&&y.appendChild(M.createElement()),p&&p.appendChild(x.createElement()),_&&_.appendChild(k.createElement()),this._meters.set("production",u),this._meters.set("battery",M),this._meters.set("grid",x),this._meters.set("load",k),u.startAnimation(),M.startAnimation(),x.startAnimation(),k.startAnimation(),u.updateDimming(),M.updateDimming(),x.updateDimming(),k.updateDimming()})}this._lastValues={grid:o,production:r,load:s,battery:h},this._animationFrameId||this._startFlowAnimationLoop(),this._iconsExtracted||requestAnimationFrame(()=>{this._extractIconPaths()}),requestAnimationFrame(()=>{requestAnimationFrame(()=>{this._drawFlows(o,r,s,h)})})}_getEntityState(t){return this._hass?.states?.[t]}_getDisplayName(t,i,e){if(this._config?.[t])return String(this._config[t]);const n=this._config?.[i];if(n){const o=this._getEntityState(n);if(o?.attributes?.friendly_name)return o.attributes.friendly_name}return e}_getIcon(t,i,e){if(this._config?.[t])return String(this._config[t]);const n=this._config?.[i];if(n){const o=this._getEntityState(n);if(o?.attributes?.icon)return o.attributes.icon}return e}_handleAction(t,i){if(!this._hass)return;const e=t||{action:"more-info"};switch(e.action||"more-info"){case"more-info":const o=e.entity||i;this._fireEvent("hass-more-info",{entityId:o});break;case"navigate":e.navigation_path&&(history.pushState(null,"",e.navigation_path),this._fireEvent("location-changed",{replace:e.navigation_replace||!1}));break;case"url":e.url_path&&window.open(e.url_path);break;case"toggle":this._hass.callService("homeassistant","toggle",{entity_id:i});break;case"perform-action":if(e.perform_action){const[s,r]=e.perform_action.split(".");this._hass.callService(s,r,e.data||{},e.target)}break;case"assist":this._fireEvent("show-dialog",{dialogTag:"ha-voice-command-dialog",dialogParams:{pipeline_id:e.pipeline_id||"last_used",start_listening:e.start_listening}});break}}_fireEvent(t,i={}){if(t==="call-service"&&this._hass){this._hass.callService(i.domain,i.service,i.service_data||{},i.target);return}const e=new CustomEvent(t,{detail:i,bubbles:!0,composed:!0});this.dispatchEvent(e)}_createMeterDefs(){return`
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
    `}_calculateFlows(t,i,e,n){return U({grid:t,production:i,load:e,battery:n})}_drawFlows(t,i,e,n){const o=this.querySelector("#flow-layer");if(!o)return;const s=this._meterPositions.production,r=this._meterPositions.battery,h=this._meterPositions.grid,a=this._meterPositions.load,{productionToLoad:c,productionToBattery:d,productionToGrid:g,gridToLoad:l,gridToBattery:f,batteryToLoad:b}=this._calculateFlows(t,i,e,n),m=0;[{id:"production-to-load",from:s,to:a,power:c,color:"#4caf50",threshold:m},{id:"production-to-battery",from:s,to:r,power:d,color:"#4caf50",threshold:m},{id:"battery-to-load",from:r,to:a,power:b,color:"#2196f3",threshold:10},{id:"grid-to-load",from:h,to:a,power:l,color:"#f44336",threshold:m},{id:"grid-to-battery",from:h,to:r,power:f,color:"#f44336",threshold:m},{id:"production-to-grid",from:s,to:h,power:g,color:"#ffeb3b",threshold:m}].forEach(x=>{x.power>x.threshold?this._updateOrCreateFlow(o,x.id,x.from,x.to,x.power,x.color):this._fadeOutFlow(o,x.id)})}_startFlowAnimationLoop(){const t=i=>{this._lastAnimationTime||(this._lastAnimationTime=i);const e=i-(this._lastAnimationTime??i);this._lastAnimationTime=i,this._flowDots.forEach((n,o)=>{const s=this.querySelector(`#path-${o}`);s&&n&&n.length>0&&n.forEach((r,h)=>{const a=this.querySelector(`#dot-${o}-${h}`);if(a&&r.velocity>0){r.progress+=r.velocity*e/1e3,r.progress>=1&&(r.progress=r.progress%1);try{const c=s.getTotalLength();if(c>0){const d=s.getPointAtLength(r.progress*c);a.setAttribute("cx",String(d.x)),a.setAttribute("cy",String(d.y))}}catch{}}})}),this._animationFrameId=requestAnimationFrame(t)};this._animationFrameId=requestAnimationFrame(t)}_updateOrCreateFlow(t,i,e,n,o,s){let r=t.querySelector(`#${i}`),h;o<=100?h=.25:o<=200?h=.25+(o-100)/100*.75:h=1;const a=2,c=23.76,d=1e4;let g;if(o<=100)g=a;else{const A=Math.min((o-100)/(d-100),1)*(c-a);g=a+A}const l=2.5,f=3,b=l*(g/a),m=Math.max(b,f),u=document.createElementNS("http://www.w3.org/2000/svg","path"),M=(e.x+n.x)/2,x=(e.y+n.y)/2,k=`M ${e.x},${e.y} Q ${M},${x} ${n.x},${n.y}`;u.setAttribute("d",k);const $=u.getTotalLength(),_=40*(o/1e3)*this._speedMultiplier,L=$>0?_/$:0;if(r){const A=r.querySelector(`#glow-${i}`),C=r.querySelector(`#path-${i}`);if(A&&C){const P=(e.x+n.x)/2,v=(e.y+n.y)/2,T=`M ${e.x},${e.y} Q ${P},${v} ${n.x},${n.y}`;A.setAttribute("d",T),A.setAttribute("stroke-opacity",String(h*.5)),A.setAttribute("stroke-width",String(g*2)),C.setAttribute("d",T),C.setAttribute("stroke-opacity",String(h)),C.setAttribute("stroke-width",String(g))}const I=this._flowDots.get(i);I&&I.forEach((P,v)=>{const T=r.querySelector(`#dot-${i}-${v}`);T&&(T.setAttribute("r",String(m)),T.setAttribute("opacity",String(h)),T.setAttribute("fill",s)),P.velocity=L})}else{r=document.createElementNS("http://www.w3.org/2000/svg","g"),r.id=i,t.appendChild(r);const A=document.createElementNS("http://www.w3.org/2000/svg","path");A.setAttribute("d",k),A.setAttribute("class","flow-line"),A.setAttribute("stroke",s),A.setAttribute("stroke-opacity",String(h*.5)),A.setAttribute("stroke-width",String(g*2)),A.setAttribute("style","transition: stroke-opacity 0.5s ease-out, stroke-width 0.5s ease-out;"),A.id=`glow-${i}`,r.appendChild(A);const C=document.createElementNS("http://www.w3.org/2000/svg","path");C.setAttribute("d",k),C.setAttribute("class","flow-line"),C.setAttribute("stroke",s),C.setAttribute("stroke-opacity",String(h)),C.setAttribute("stroke-width",String(g)),C.setAttribute("style","transition: stroke-opacity 0.5s ease-out, stroke-width 0.5s ease-out;"),C.id=`path-${i}`,r.appendChild(C);const I=[];for(let P=0;P<this._dotsPerFlow;P++){const v=document.createElementNS("http://www.w3.org/2000/svg","circle");v.setAttribute("class","flow-dot"),v.setAttribute("id",`dot-${i}-${P}`),v.setAttribute("r",String(m)),v.setAttribute("fill",s),v.setAttribute("opacity",String(h)),v.setAttribute("style","transition: opacity 0.5s ease-out, r 0.5s ease-out;"),r.appendChild(v);const T=P/this._dotsPerFlow;I.push({progress:T,velocity:L})}this._flowDots.set(i,I)}}_removeFlow(t,i){const e=t.querySelector(`#${i}`);e&&e.remove(),this._flowDots.delete(i)}_fadeOutFlow(t,i){const e=t.querySelector(`#${i}`);if(!e)return;const n=e.querySelector(`#glow-${i}`),o=e.querySelector(`#path-${i}`);n&&n.setAttribute("stroke-opacity","0"),o&&o.setAttribute("stroke-opacity","0");const s=this._flowDots.get(i);s&&s.forEach((r,h)=>{const a=e.querySelector(`#dot-${i}-${h}`);a&&a.setAttribute("opacity","0")}),setTimeout(()=>{this._removeFlow(t,i)},500)}_extractIconPaths(){["production","battery","grid","load"].forEach(i=>{const e=this.querySelector(`#icon-source-${i}`),n=this.querySelector(`#icon-display-${i}`);if(!e||!n){console.warn(`Icon elements not found for ${i}`);return}const o=e.querySelector("div");if(!o){console.warn(`No div found in foreignObject for ${i}`);return}const s=o.querySelector("ha-icon");if(!s){console.warn(`No ha-icon found for ${i}`);return}const r=s.getAttribute("icon");if(!r){console.warn(`No icon attribute for ${i}`);return}if(this._iconCache.has(r)){const a=this._iconCache.get(r);this._renderIconPath(n,a),e.style.display="none";return}const h=(a=0,c=10)=>{const d=a*100,g=window.setTimeout(()=>{this._iconExtractionTimeouts.delete(g);try{const l=s.shadowRoot;if(!l){a<c&&h(a+1,c);return}let f=l.querySelector("svg");if(!f){const u=l.querySelector("ha-svg-icon");u&&u.shadowRoot&&(f=u.shadowRoot.querySelector("svg"))}if(!f){a<c&&h(a+1,c);return}const b=f.querySelector("path");if(!b){a<c&&h(a+1,c);return}const m=b.getAttribute("d");m?(this._iconCache.set(r,m),this._renderIconPath(n,m),e.style.display="none"):a<c&&h(a+1,c)}catch(l){console.error(`Failed to extract icon path for ${r} (attempt ${a+1}):`,l),a<c&&h(a+1,c)}},d);this._iconExtractionTimeouts.add(g)};h()}),this._iconsExtracted=!0}_renderIconPath(t,i){if(t.innerHTML="",i){const e=document.createElementNS("http://www.w3.org/2000/svg","path");e.setAttribute("d",i),e.setAttribute("fill","rgb(160, 160, 160)"),e.setAttribute("transform","scale(1)"),t.appendChild(e)}else{const e=document.createElementNS("http://www.w3.org/2000/svg","circle");e.setAttribute("cx","12"),e.setAttribute("cy","12"),e.setAttribute("r","8"),e.setAttribute("fill","rgb(160, 160, 160)"),t.appendChild(e)}}_drawFlow(t,i,e,n,o){const s=document.createElementNS("http://www.w3.org/2000/svg","path"),r=(i.x+e.x)/2,h=(i.y+e.y)/2,a=`M ${i.x},${i.y} Q ${r},${h} ${e.x},${e.y}`;s.setAttribute("d",a),s.setAttribute("class",`flow-line ${o?"flow-positive":"flow-negative"}`),s.setAttribute("id",`path-${Math.random()}`),t.appendChild(s);const c=Math.min(Math.max(Math.floor(n/1e3),1),3);for(let d=0;d<c;d++){const g=document.createElementNS("http://www.w3.org/2000/svg","circle");g.setAttribute("class",`flow-dot ${o?"flow-positive":"flow-negative"}`),g.setAttribute("r","3"),g.setAttribute("fill",o?"var(--success-color, #4caf50)":"var(--error-color, #f44336)");const l=document.createElementNS("http://www.w3.org/2000/svg","animateMotion");l.setAttribute("dur","2s"),l.setAttribute("repeatCount","indefinite"),l.setAttribute("begin",`${d*.6}s`);const f=document.createElementNS("http://www.w3.org/2000/svg","mpath");f.setAttributeNS("http://www.w3.org/1999/xlink","href",`#${s.id}`),l.appendChild(f),g.appendChild(l),t.appendChild(g)}}_renderCompactView(t,i,e,n,o){const s=this._calculateFlows(t,e,i,n),r=s.productionToLoad,h=s.batteryToLoad,a=s.gridToLoad,c=i||1,d=r/c*100,g=h/c*100,l=a/c*100,f=d+g+l;let b=d,m=g,u=l;if(f>0){const S=100/f;b=d*S,m=g*S,u=l*S}const M="#256028",x="#104b79",k="#7a211b",$="#7a6b1b";let y=null;if(o==="compact-battery"&&this._config?.battery_soc_entity){const S=this._getEntityState(this._config.battery_soc_entity);y=parseFloat(S?.state??"0")||0}let p=0,_=0,L=0,A=0,C=0,I=0,P=0,v=0,T=0;if(o==="compact-battery"){if(n<0){const q=Math.abs(n)||1;A=s.gridToBattery,I=s.productionToBattery,p=s.gridToBattery/q*100,L=s.productionToBattery/q*100;const H=p+L;if(H>0){const B=100/H;P=p*B,T=L*B}}else if(n>0){const S=n||1,q=n-s.batteryToLoad;C=s.batteryToLoad,A=q,_=s.batteryToLoad/S*100,p=q/S*100;const H=_+p;if(H>0){const B=100/H;v=_*B,P=p*B}}}(!this.querySelector(".compact-view")||this._lastViewMode!==o)&&(this.innerHTML=`
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
                <div id="grid-segment" class="bar-segment" style="background: ${k}; width: ${l}%;">
                  <div class="bar-segment-content">
                    <ha-icon class="bar-segment-icon" icon="${this._getIcon("grid_icon","grid_entity","mdi:transmission-tower")}"></ha-icon>
                    <span class="bar-segment-label"></span>
                  </div>
                </div>
                <div id="battery-segment" class="bar-segment" style="background: ${x}; width: ${g}%;">
                  <div class="bar-segment-content">
                    <ha-icon class="bar-segment-icon" icon="${this._getIcon("battery_icon","battery_entity","mdi:battery")}"></ha-icon>
                    <span class="bar-segment-label"></span>
                  </div>
                </div>
                <div id="production-segment" class="bar-segment" style="background: ${M}; width: ${d}%;">
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
                <div id="battery-grid-segment" class="bar-segment" style="background: ${n<0?k:$}; width: ${p}%;">
                  <div class="bar-segment-content">
                    <ha-icon class="bar-segment-icon" icon="${this._getIcon("grid_icon","grid_entity","mdi:transmission-tower")}"></ha-icon>
                    <span class="bar-segment-label"></span>
                  </div>
                </div>
                <div id="battery-load-segment" class="bar-segment" style="background: ${x}; width: ${_}%;">
                  <div class="bar-segment-content">
                    <ha-icon class="bar-segment-icon" icon="${this._getIcon("load_icon","load_entity","mdi:home")}"></ha-icon>
                    <span class="bar-segment-label"></span>
                  </div>
                </div>
                <div id="battery-production-segment" class="bar-segment" style="background: ${M}; width: ${L}%;">
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
      `,this._lastViewMode=o,requestAnimationFrame(()=>{if(this._config){const S=this.querySelector("#production-segment"),q=this.querySelector("#battery-segment"),H=this.querySelector("#grid-segment"),D=this.querySelectorAll(".row-value")[0];if(S&&S.addEventListener("click",()=>{this._handleAction(this._config.production_tap_action,this._config.production_entity)}),q&&q.addEventListener("click",()=>{this._handleAction(this._config.battery_tap_action,this._config.battery_entity)}),H&&H.addEventListener("click",()=>{this._handleAction(this._config.grid_tap_action,this._config.grid_entity)}),D&&D.addEventListener("click",()=>{this._handleAction(this._config.load_tap_action,this._config.load_entity)}),o==="compact-battery"){const w=this.querySelector("#battery-production-segment"),E=this.querySelector("#battery-load-segment"),V=this.querySelector("#battery-grid-segment"),R=this.querySelector("#battery-soc-left"),F=this.querySelector("#battery-soc-right");w&&w.addEventListener("click",()=>{this._handleAction(this._config.production_tap_action,this._config.production_entity)}),E&&E.addEventListener("click",()=>{this._handleAction(this._config.load_tap_action,this._config.load_entity)}),V&&V.addEventListener("click",()=>{this._handleAction(this._config.grid_tap_action,this._config.grid_entity)}),R&&R.addEventListener("click",()=>{this._handleAction(this._config.battery_tap_action,this._config.battery_entity)}),F&&F.addEventListener("click",()=>{this._handleAction(this._config.battery_tap_action,this._config.battery_entity)})}}})),requestAnimationFrame(()=>{const S=this.querySelector("#production-segment"),q=this.querySelector("#battery-segment"),H=this.querySelector("#grid-segment"),B=this.querySelector("#load-value-text");if(S){S.style.width=`${b}%`;const D=S.querySelector(".bar-segment-label");D&&r>0&&(D.textContent=`${Math.round(d)}%`);const w=this.querySelector(".bar-container"),E=b/100*(w?.clientWidth||0);this._updateSegmentVisibility(S,E,r>0)}if(q){q.style.width=`${m}%`;const D=q.querySelector(".bar-segment-label");D&&h>0&&(D.textContent=`${Math.round(g)}%`);const w=this.querySelector(".bar-container"),E=m/100*(w?.clientWidth||0);this._updateSegmentVisibility(q,E,h>0)}if(H){H.style.width=`${u}%`;const D=H.querySelector(".bar-segment-label");D&&a>0&&(D.textContent=`${Math.round(l)}%`);const w=this.querySelector(".bar-container"),E=u/100*(w?.clientWidth||0);this._updateSegmentVisibility(H,E,a>0)}if(B&&(B.textContent=String(Math.round(i))),o==="compact-battery"){const D=this.querySelector("#battery-grid-segment"),w=this.querySelector("#battery-load-segment"),E=this.querySelector("#battery-production-segment"),V=this.querySelector("#battery-soc-left"),R=this.querySelector("#battery-soc-right"),F=this.querySelector("#battery-soc-text-left"),O=this.querySelector("#battery-soc-text-right"),X=this.querySelectorAll(".bar-container")[1];let j=!1;if(n<0?(j=!0,V&&(V.style.display="none"),R&&(R.style.display="flex"),O&&y!==null&&(O.textContent=y.toFixed(1))):n>0?(j=!1,V&&(V.style.display="flex"),R&&(R.style.display="none"),F&&y!==null&&(F.textContent=y.toFixed(1))):(V&&(V.style.display="none"),R&&(R.style.display="flex"),O&&y!==null&&(O.textContent=y.toFixed(1))),D){const N=j?"#7a211b":"#7a6b1b";D.style.width=`${P}%`,D.style.background=N;const z=D.querySelector(".bar-segment-label");z&&A>0&&(z.textContent=`${Math.round(A)}W`);const Y=P/100*(X?.offsetWidth||0);this._updateSegmentVisibility(D,Y,A>0)}if(w){w.style.width=`${v}%`;const N=w.querySelector(".bar-segment-label");N&&C>0&&(N.textContent=`${Math.round(C)}W`);const z=v/100*(X?.offsetWidth||0);this._updateSegmentVisibility(w,z,C>0)}if(E){E.style.width=`${T}%`;const N=E.querySelector(".bar-segment-label");N&&I>0&&(N.textContent=`${Math.round(I)}W`);const z=T/100*(X?.offsetWidth||0);this._updateSegmentVisibility(E,z,I>0)}}})}async _renderChartView(t,i,e,n){(!this.querySelector(".chart-view")||this._lastViewMode!=="chart")&&(this.innerHTML=`
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
      `,this._lastViewMode="chart"),this._liveChartValues={grid:t,load:i,production:e,battery:n},await this._fetchAndRenderChartData()}async _fetchAndRenderChartData(){if(!this._hass||!this._config||this._chartRenderPending)return;const t=12,i=Date.now(),e=this._chartDataCache?i-this._chartDataCache.timestamp:1/0,n=300*1e3;if(this._chartDataCache&&e>=n&&(this._chartDataCache=void 0),this._chartDataCache&&e<n){this._renderChartFromCache();return}this._chartRenderPending=!0;const o=new Date,s=new Date(o.getTime()-t*60*60*1e3);try{const[r,h,a,c]=await Promise.all([this._fetchHistory(this._config.production_entity,s,o),this._fetchHistory(this._config.grid_entity,s,o),this._fetchHistory(this._config.load_entity,s,o),this._fetchHistory(this._config.battery_entity,s,o)]);this._drawStackedAreaChart(r,h,a,c,t),this._chartRenderPending=!1;const d=this.querySelector(".loading-message");d&&d.remove()}catch(r){console.error("Error fetching chart data:",r),this._chartRenderPending=!1;const h=this.querySelector(".chart-svg");h&&(h.innerHTML=`
          <text x="400" y="200" text-anchor="middle" fill="rgb(160, 160, 160)" font-size="14">
            Error loading chart data
          </text>
        `)}}_renderChartFromCache(){if(!this._chartDataCache)return;const t=this.querySelector(".chart-svg");if(!t)return;const i=this._chartDataCache.dataPoints,e=Math.max(...i.map(p=>p.solar+p.batteryDischarge+p.gridImport),...i.map(p=>p.load)),n=Math.max(...i.map(p=>p.batteryCharge+p.gridExport)),o=e+n,s=o>0?e/o:.5,r=o>0?n/o:.5,h=800,a=400,c={top:20,right:150,bottom:40,left:60},d=h-c.left-c.right,g=a-c.top-c.bottom,l=g*s,f=g*r,b=e>0?l/(e*1.1):1,m=n>0?f/(n*1.1):1,u=c.top+l,M=this._createStackedPaths(i,d,l,b,c,"supply",u),x=this._createStackedPaths(i,d,f,m,c,"demand",u),k=this._createLoadLine(i,d,l,b,c,u);let $=`
      <g opacity="0.1">
        ${this._createGridLines(d,g,c,Math.max(e,n))}
      </g>
      <line x1="${c.left}" y1="${u}" x2="${c.left+d}" y2="${u}" stroke="rgb(160, 160, 160)" stroke-width="1" stroke-dasharray="4,4" />
      ${x}
      ${M}
      ${this._createTimeLabels(d,g,c,12)}
      ${this._createYAxisLabels(l,f,c,e,n,u)}
      ${k}
    `;t.innerHTML=$,this._updateChartIndicators();const y=this.querySelector(".loading-message");y&&y.remove()}_updateChartIndicators(){const t=this.querySelector(".chart-svg");if(!t||!this._chartDataCache||!this._liveChartValues)return;const i=this._chartDataCache.dataPoints,e=Math.max(...i.map(u=>u.solar+u.batteryDischarge+u.gridImport),...i.map(u=>u.load)),n=Math.max(...i.map(u=>u.batteryCharge+u.gridExport)),o=e+n,s=o>0?e/o:.5,r=o>0?n/o:.5,h=800,a=400,c={top:20,right:150,bottom:40,left:60},d=a-c.top-c.bottom,g=d*s,l=d*r,f=e>0?g/(e*1.1):1,b=n>0?l/(n*1.1):1,m=c.top+g;this._renderChartIndicators(t,i,h-c.left-c.right,g,l,f,b,c,{},m)}async _fetchHistory(t,i,e){if(!this._hass)return[];const n=`history/period/${i.toISOString()}?filter_entity_id=${t}&end_time=${e.toISOString()}&minimal_response&no_attributes`;try{return(await this._hass.callApi("GET",n))[0]||[]}catch(o){return console.error(`Error fetching history for ${t}:`,o),[]}}_drawStackedAreaChart(t,i,e,n,o){const s=this.querySelector(".chart-svg");if(!s)return;const r=800,h=400,a={top:20,right:150,bottom:40,left:60},c=r-a.left-a.right,d=h-a.top-a.bottom,l=o*120,b=o*12,m=10,u=new Date,M=Math.floor(u.getMinutes()/5)*5,x=new Date(u.getFullYear(),u.getMonth(),u.getDate(),u.getHours(),M,0,0),k=new Date(x.getTime()-o*60*60*1e3),$=[];for(let w=0;w<l;w++){const E=new Date(k.getTime()+w*30*1e3),V=this._interpolateValue(t,E),R=this._interpolateValue(i,E),F=this._interpolateValue(e,E);let O=this._interpolateValue(n,E);this._config?.invert_battery_data&&(O=-O),$.push({time:E,solar:Math.max(0,V),batteryDischarge:Math.max(0,O),batteryCharge:Math.max(0,-O),gridImport:Math.max(0,R),gridExport:Math.max(0,-R),load:Math.max(0,F)})}const y=[];for(let w=0;w<b;w++){const E=new Date(k.getTime()+(w+1)*5*60*1e3),V=w*m,R=Math.min(V+m,$.length),F=R-V;let O=0,Z=0,X=0,j=0,N=0,z=0;for(let Y=V;Y<R;Y++)O+=$[Y].solar,Z+=$[Y].batteryDischarge,X+=$[Y].batteryCharge,j+=$[Y].gridImport,N+=$[Y].gridExport,z+=$[Y].load;w===0&&console.log("Chart data sample (5-min avg of 30-sec data):",{time:E.toISOString(),windowSize:F,solar:O/F,invert_battery_data:this._config?.invert_battery_data}),y.push({time:E,solar:O/F,batteryDischarge:Z/F,batteryCharge:X/F,gridImport:j/F,gridExport:N/F,load:z/F})}$.length=0,this._chartDataCache={timestamp:Date.now(),dataPoints:y};const p=Math.max(...y.map(w=>w.solar+w.batteryDischarge+w.gridImport),...y.map(w=>w.load)),_=Math.max(...y.map(w=>w.batteryCharge+w.gridExport)),L=p+_,A=L>0?p/L:.5,C=L>0?_/L:.5,I=p>0?d*A/(p*1.1):1,P=_>0?d*C/(_*1.1):1,v=Math.min(I,P),T=p*v*1.1,W=_*v*1.1,S=a.top+T,q=this._createStackedPaths(y,c,T,v,a,"supply",S),H=this._createStackedPaths(y,c,W,v,a,"demand",S),B=this._createLoadLine(y,c,T,v,a,S);let D=`
      <!-- Grid lines -->
      <g opacity="0.1">
        ${this._createGridLines(c,d,a,Math.max(p,_))}
      </g>
      
      <!-- Zero line (dynamic position based on supply height) -->
      <line 
        x1="${a.left}" 
        y1="${S}" 
        x2="${a.left+c}" 
        y2="${S}" 
        stroke="rgb(160, 160, 160)" 
        stroke-width="1" 
        stroke-dasharray="4,4"
      />
      
      <!-- Demand areas (below zero line) -->
      ${H}
      
      <!-- Supply areas (above zero line) -->
      ${q}
      
      <!-- Time axis labels -->
      ${this._createTimeLabels(c,d,a,o)}
      
      <!-- Y-axis labels -->
      ${this._createYAxisLabels(T,W,a,p,_,S)}
      
      <!-- Floating indicators with current values -->
      ${this._createFloatingIndicators(y,c,d,v,v,a,r)}
      
      <!-- Load line (thick gray line on supply side - rendered last so it's on top) -->
      ${B}
      
      <!-- Hidden icon sources for extraction -->
      ${this._createChartIconSources()}
    `;s.innerHTML=D,requestAnimationFrame(()=>{this._extractChartIcons(y,c,T,W,v,v,a,S)})}_interpolateValue(t,i){if(t.length===0)return 0;let e=t[0],n=Math.abs(new Date(t[0].last_changed).getTime()-i.getTime());for(const o of t){const s=Math.abs(new Date(o.last_changed).getTime()-i.getTime());s<n&&(n=s,e=o)}return parseFloat(e.state)||0}_createStackedPaths(t,i,e,n,o,s,r){const h=t.length,a=i/(h-1);if(s==="supply"){const c=this._createAreaPath(t,a,r,n,o,l=>l.solar,0,"down"),d=this._createAreaPath(t,a,r,n,o,l=>l.batteryDischarge,l=>l.solar,"down"),g=this._createAreaPath(t,a,r,n,o,l=>l.gridImport,l=>l.solar+l.batteryDischarge,"down");return`
        ${g?`<path d="${g}" fill="#c62828" opacity="0.8" />`:""}
        ${d?`<path d="${d}" fill="#1976d2" opacity="0.8" />`:""}
        ${c?`<path d="${c}" fill="#388e3c" opacity="0.85" />`:""}
      `}else{const c=this._createAreaPath(t,a,r,n,o,g=>g.batteryCharge,0,"up"),d=this._createAreaPath(t,a,r,n,o,g=>g.gridExport,g=>g.batteryCharge,"up");return`
        ${d?`<path d="${d}" fill="#f9a825" opacity="0.8" />`:""}
        ${c?`<path d="${c}" fill="#1976d2" opacity="0.8" />`:""}
      `}}_createLoadLine(t,i,e,n,o,s){if(!t||t.length===0)return"";const r=i/(t.length-1);return`<path d="${t.map((a,c)=>{const d=o.left+c*r,g=s-a.load*n;return`${c===0?"M":"L"} ${d},${g}`}).join(" ")}" fill="none" stroke="#CCCCCC" stroke-width="3" opacity="0.9" />`}_createFloatingIndicators(t,i,e,n,o,s,r){return""}_createChartIconSources(){const t=this._getIcon("load_icon","load_entity","mdi:home-lightning-bolt"),i=this._getIcon("production_icon","production_entity","mdi:solar-power"),e=this._getIcon("battery_icon","battery_entity","mdi:battery"),n=this._getIcon("grid_icon","grid_entity","mdi:transmission-tower");return`
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
    `}async _extractChartIcons(t,i,e,n,o,s,r,h){const a=this.querySelector(".chart-svg");if(!a||!t||t.length===0)return;const c=["load","solar","battery","grid"],d={};for(const g of c){const l=a.querySelector(`#chart-icon-source-${g}`);if(!l)continue;const f=l.querySelector("div");if(!f)continue;const b=f.querySelector("ha-icon");if(!b)continue;const m=b.getAttribute("icon");if(!m)continue;if(this._iconCache.has(m)){d[g]=this._iconCache.get(m)||null;continue}const u=await this._extractIconPath(b,m);d[g]=u,u&&this._iconCache.set(m,u)}this._renderChartIndicators(a,t,i,e,n,o,s,r,d,h)}async _extractIconPath(t,i,e=10){for(let n=0;n<e;n++){try{const o=t.shadowRoot;if(!o){await new Promise(a=>setTimeout(a,100));continue}let s=o.querySelector("svg");if(!s){const a=o.querySelector("ha-svg-icon");a&&a.shadowRoot&&(s=a.shadowRoot.querySelector("svg"))}if(!s){await new Promise(a=>setTimeout(a,100));continue}const r=s.querySelector("path");if(!r){await new Promise(a=>setTimeout(a,100));continue}const h=r.getAttribute("d");if(h)return h}catch(o){console.error(`Failed to extract icon path for ${i} (attempt ${n+1}):`,o)}await new Promise(o=>setTimeout(o,100))}return null}_renderChartIndicators(t,i,e,n,o,s,r,h,a,c){const d=t.querySelector("#chart-indicators");d&&d.remove(),t.querySelectorAll('[id^="chart-icon-source-"]').forEach(_=>_.remove());let l;if(this._liveChartValues){const{grid:_,load:L,production:A,battery:C}=this._liveChartValues;l={load:Math.max(0,L),solar:Math.max(0,A),batteryDischarge:Math.max(0,C),batteryCharge:Math.max(0,-C),gridImport:Math.max(0,_),gridExport:Math.max(0,-_)}}else l=i[i.length-1];const f=h.left+e,b=c-l.load*s,m=c-l.solar*s,u=c-(l.solar+l.batteryDischarge)*s,M=c-(l.solar+l.batteryDischarge+l.gridImport)*s,x=c+l.batteryCharge*r,k=c+(l.batteryCharge+l.gridExport)*r,$=_=>`${Math.round(_)} W`,y=document.createElementNS("http://www.w3.org/2000/svg","g");y.setAttribute("id","chart-indicators");const p=(_,L,A,C,I="")=>{const P=document.createElementNS("http://www.w3.org/2000/svg","g");P.setAttribute("transform",`translate(${f+10}, ${_})`);const v=document.createElementNS("http://www.w3.org/2000/svg","circle");v.setAttribute("r","5"),v.setAttribute("fill",L),P.appendChild(v);const T=a[A];if(T){const S=document.createElementNS("http://www.w3.org/2000/svg","g");S.setAttribute("transform","translate(10, -8) scale(0.67)");const q=document.createElementNS("http://www.w3.org/2000/svg","path");q.setAttribute("d",T),q.setAttribute("fill",L),S.appendChild(q),P.appendChild(S)}const W=document.createElementNS("http://www.w3.org/2000/svg","text");W.setAttribute("x","28"),W.setAttribute("y","4"),W.setAttribute("fill",L),W.setAttribute("font-size","12"),W.setAttribute("font-weight","600"),W.textContent=`${I}${C}`,P.appendChild(W),y.appendChild(P)};p(b,"#CCCCCC","load",$(l.load)),l.solar>0&&p(m,"#388e3c","solar",$(l.solar)),l.batteryDischarge>0&&p(u,"#1976d2","battery",$(l.batteryDischarge),"+"),l.gridImport>0&&p(M,"#c62828","grid",$(l.gridImport)),l.batteryCharge>0&&p(x,"#1976d2","battery",$(l.batteryCharge),"-"),l.gridExport>0&&p(k,"#f9a825","grid",$(l.gridExport)),t.appendChild(y)}_createAreaPath(t,i,e,n,o,s,r,h){const a=[],c=[];let d=!1;if(t.forEach((l,f)=>{const b=o.left+f*i,m=s(l),u=typeof r=="function"?r(l):r;m>0&&(d=!0);const M=h==="down"?-(m+u)*n:(m+u)*n,x=h==="down"?-u*n:u*n;a.push({x:b,y:e+M}),c.push({x:b,y:e+x})}),!d)return null;let g=`M ${a[0].x} ${a[0].y}`;for(let l=1;l<a.length;l++)g+=` L ${a[l].x} ${a[l].y}`;for(let l=c.length-1;l>=0;l--)g+=` L ${c[l].x} ${c[l].y}`;return g+=" Z",g}_createGridLines(t,i,e,n){const o=[];for(let r=0;r<=4;r++){const h=e.top+r*i/4;o.push(`<line x1="${e.left}" y1="${h}" x2="${e.left+t}" y2="${h}" stroke="white" stroke-width="1" />`)}return o.join(`
`)}_createTimeLabels(t,i,e,n){const o=[],r=new Date;for(let h=0;h<=6;h++){const a=n-h*n/6,c=new Date(r.getTime()-a*60*60*1e3),d=c.getMinutes(),g=d<15?0:d<45?30:0,l=d>=45?1:0;c.setMinutes(g),c.setSeconds(0),c.setMilliseconds(0),l&&c.setHours(c.getHours()+l);const f=e.left+h*t/6,b=e.top+i+20,m=c.getHours(),u=m===0?12:m>12?m-12:m,M=m>=12?"PM":"AM";o.push(`
        <text x="${f}" y="${b}" text-anchor="middle" fill="rgb(160, 160, 160)" font-size="11">
          ${u} ${M}
        </text>
      `)}return o.join(`
`)}_createYAxisLabels(t,i,e,n,o,s){const r=[];return r.push(`<text x="${e.left-10}" y="${e.top+5}" text-anchor="end" fill="rgb(160, 160, 160)" font-size="11">${Math.round(n)}W</text>`),r.push(`<text x="${e.left-10}" y="${s+5}" text-anchor="end" fill="rgb(160, 160, 160)" font-size="11">0</text>`),r.push(`<text x="${e.left-10}" y="${s+i+5}" text-anchor="end" fill="rgb(160, 160, 160)" font-size="11">-${Math.round(o)}W</text>`),r.join(`
`)}_createChartLegend(t,i,e){const n=[{label:"Solar",color:e.solar},{label:"Battery",color:e.batteryDischarge},{label:"Grid Import",color:e.gridImport},{label:"Grid Export",color:e.gridExport},{label:"Load",color:e.load}],o=t-i.right-10;let s=i.top;return n.map((r,h)=>{const a=s+h*20;return`
        <rect x="${o-80}" y="${a-10}" width="12" height="12" fill="${r.color}" opacity="0.8" />
        <text x="${o-64}" y="${a}" fill="rgb(200, 200, 200)" font-size="11">${r.label}</text>
      `}).join(`
`)}_updateSegmentVisibility(t,i,e){if(!t||!e){t?.setAttribute("data-width-px","");return}i>=80?t.setAttribute("data-width-px","show-label"):i>=40?t.setAttribute("data-width-px","show-icon"):t.setAttribute("data-width-px","")}}customElements.define("energy-flow-card",J),window.customCards=window.customCards||[],window.customCards.push({type:"energy-flow-card",name:"Energy Flow Card",description:"A test energy-flow card."})})();

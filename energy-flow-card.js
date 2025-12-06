(function(){"use strict";class Q{constructor(t,i,e,n,o,a,r,l,s=!1,h=!1,g,d,c){this.id=t,this._value=i,this.min=e,this.max=n,this.bidirectional=o,this.label=a,this.icon=r,this.units=l,this._invertView=s,this.showPlus=h,this.tapAction=g,this.entityId=d,this.fireEventCallback=c,this.element=null,this.radius=50,this.boxWidth=120,this.boxHeight=135,this.boxRadius=16,this.centerX=this.boxWidth/2,this.centerY=this.radius+25,this.offsetX=-this.centerX,this.offsetY=-this.centerY,this.needleState={target:0,current:0,ghost:0},this._lastAnimationTime=null,this._animationFrameId=null,this._updateNeedleAngle()}get value(){return this._value}set value(t){if(this._value!==t&&(this._value=t,this._updateNeedleAngle(),this.element)){const i=this.element.querySelector(`#value-${this.id}`);i&&(i.textContent=this._formatValueText()),this.updateDimming()}}get invertView(){return this._invertView}set invertView(t){if(this._invertView!==t&&(this._invertView=t,this._updateNeedleAngle(),this.element)){const i=this.element.querySelector(`#value-${this.id}`);i&&(i.textContent=this._formatValueText())}}get displayValue(){return this._invertView?-this._value:this._value}_formatValueText(){const t=this.displayValue,i=t.toFixed(0);return t<0?i+" ":t>0&&this.showPlus?"+"+i+" ":i}_updateNeedleAngle(){let t,i;const e=this.displayValue;if(this.bidirectional){const n=this.max-this.min;t=Math.min(Math.max((e-this.min)/n,0),1),i=180-t*180}else t=Math.min(Math.max(e/this.max,0),1),i=180-t*180;this.needleState.target=i}updateDimming(){if(!this.element)return;const t=this.element.querySelector(`#dimmer-${this.id}`);if(t){const i=Math.abs(this.value)<.5;t.setAttribute("opacity",i?"0.3":"0")}}startAnimation(){if(this._animationFrameId)return;const t=i=>{this._lastAnimationTime||(this._lastAnimationTime=i);const e=i-this._lastAnimationTime;if(this._lastAnimationTime=i,!this.element){this._animationFrameId=null;return}const n=this.radius-5,o=Math.min(e/150,1);this.needleState.current+=(this.needleState.target-this.needleState.current)*o;const a=Math.min(e/400,1);this.needleState.ghost+=(this.needleState.current-this.needleState.ghost)*a;const r=10;this.needleState.ghost<this.needleState.current-r?this.needleState.ghost=this.needleState.current-r:this.needleState.ghost>this.needleState.current+r&&(this.needleState.ghost=this.needleState.current+r);const l=this.element.querySelector(`#needle-${this.id}`);if(l){const h=this.needleState.current*Math.PI/180,g=this.centerX+n*Math.cos(h),d=this.centerY-n*Math.sin(h);l.setAttribute("x2",String(g)),l.setAttribute("y2",String(d))}const s=this.element.querySelector(`#ghost-needle-${this.id}`);if(s){const h=this.needleState.ghost*Math.PI/180,g=this.centerX+n*Math.cos(h),d=this.centerY-n*Math.sin(h);s.setAttribute("x2",String(g)),s.setAttribute("y2",String(d))}this._animationFrameId=requestAnimationFrame(t)};this._animationFrameId=requestAnimationFrame(t)}stopAnimation(){this._animationFrameId&&(cancelAnimationFrame(this._animationFrameId),this._animationFrameId=null,this._lastAnimationTime=null)}_handleTapAction(){if(!this.fireEventCallback)return;const t=this.tapAction||{action:"more-info"};switch(t.action||"more-info"){case"more-info":const e=t.entity||this.entityId;e&&this.fireEventCallback("hass-more-info",{entityId:e});break;case"navigate":t.navigation_path&&(history.pushState(null,"",t.navigation_path),this.fireEventCallback("location-changed",{replace:t.navigation_replace||!1}));break;case"url":t.url_path&&window.open(t.url_path);break;case"toggle":this.entityId&&this.fireEventCallback("call-service",{domain:"homeassistant",service:"toggle",service_data:{entity_id:this.entityId}});break;case"perform-action":if(t.perform_action){const[n,o]=t.perform_action.split(".");this.fireEventCallback("call-service",{domain:n,service:o,service_data:t.data||{},target:t.target})}break;case"assist":this.fireEventCallback("show-dialog",{dialogTag:"ha-voice-command-dialog",dialogParams:{pipeline_id:t.pipeline_id||"last_used",start_listening:t.start_listening}});break}}createElement(){const t=this.displayValue;let i,e;if(this.bidirectional){const f=this.max-this.min;i=Math.min(Math.max((t-this.min)/f,0),1),e=180-i*180}else i=Math.min(Math.max(t/this.max,0),1),e=180-i*180;this.needleState.target=e,this.needleState.current=e,this.needleState.ghost=e;const o=(this.bidirectional?[this.min,0,this.max]:[0,this.max/2,this.max]).map(f=>{const x=(180-(this.bidirectional?(f-this.min)/(this.max-this.min):f/this.max)*180)*Math.PI/180,F=this.radius,C=this.radius-8,_=this.centerX+F*Math.cos(x),T=this.centerY-F*Math.sin(x),O=this.centerX+C*Math.cos(x),w=this.centerY-C*Math.sin(x);return`<line x1="${_}" y1="${T}" x2="${O}" y2="${w}" stroke="rgb(160, 160, 160)" stroke-width="2" />`}).join(""),l=(180-(this.bidirectional?(0-this.min)/(this.max-this.min):0)*180)*Math.PI/180,s=this.centerX,h=this.centerY,g=this.centerX+this.radius*Math.cos(l),d=this.centerY-this.radius*Math.sin(l),c=`<line x1="${s}" y1="${h}" x2="${g}" y2="${d}" stroke="rgb(100, 100, 100)" stroke-width="2" />`,v=e*Math.PI/180,$=this.radius-5,u=this.centerX+$*Math.cos(v),m=this.centerY-$*Math.sin(v),P=this.centerY+5,S=this.centerY+this.radius*.5,I=this.centerY+this.radius*.7,M=`
      <g transform="translate(${this.offsetX}, ${this.offsetY})">
        <defs>
          <clipPath id="clip-${this.id}-local">
            <rect x="0" y="0" width="${this.boxWidth}" height="${P+2}" />
          </clipPath>
        </defs>
        
        <rect x="0" y="0" width="${this.boxWidth}" height="${this.boxHeight}" rx="${this.boxRadius}" ry="${this.boxRadius}" fill="rgb(40, 40, 40)" filter="url(#drop-shadow)" />
        
        <g clip-path="url(#clip-${this.id}-local)">
          <circle cx="${this.centerX}" cy="${this.centerY}" r="${this.radius}" fill="rgb(70, 70, 70)" />
          ${c}
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
        
        <text x="${this.centerX}" y="${I}" text-anchor="middle" font-size="8" fill="rgb(160, 160, 160)" font-weight="400" letter-spacing="0.5">${this.units}</text>
        
        <rect id="dimmer-${this.id}" x="0" y="0" width="${this.boxWidth}" height="${this.boxHeight}" rx="${this.boxRadius}" ry="${this.boxRadius}" fill="black" opacity="0" pointer-events="none" style="transition: opacity 0.8s ease-in-out;" />
      </g>
    `,p=document.createElementNS("http://www.w3.org/2000/svg","svg");p.innerHTML=M;const y=p.firstElementChild;return this.element=y,(!this.tapAction||this.tapAction.action!=="none")&&(y.style.cursor="pointer",y.addEventListener("click",f=>{this._handleTapAction(),f.stopPropagation()}),y.addEventListener("mouseenter",()=>{y.style.filter="brightness(1.1)"}),y.addEventListener("mouseleave",()=>{y.style.filter=""})),y}}function U(G){const t=Math.max(0,G.production),i=G.grid,e=G.battery,n=Math.max(0,G.load),o={productionToLoad:0,productionToBattery:0,productionToGrid:0,gridToLoad:0,gridToBattery:0,batteryToLoad:0};let a=t,r=n;if(a>0&&r>0&&(o.productionToLoad=Math.min(a,r),a-=o.productionToLoad,r-=o.productionToLoad),e<0&&a>0&&(o.productionToBattery=Math.min(a,Math.abs(e)),a-=o.productionToBattery),e>0&&r>0&&(o.batteryToLoad=Math.min(e,r),r-=o.batteryToLoad),r>0&&i>0&&(o.gridToLoad=Math.min(i,r),r-=o.gridToLoad),e<0&&i>10){const l=Math.abs(e)-o.productionToBattery;l>1&&(o.gridToBattery=Math.min(i-o.gridToLoad,l))}return i<-10&&(o.productionToGrid=Math.abs(i)),o}class J extends HTMLElement{constructor(){super(),this._resizeObserver=null,this._animationFrameId=null,this._flowDots=new Map,this._lastAnimationTime=null,this._iconCache=new Map,this._iconsExtracted=!1,this._iconExtractionTimeouts=new Set,this._meters=new Map,this._speedMultiplier=.8,this._dotsPerFlow=3;const t=500,i=470,e=5,n=3;this._meterPositions={production:{x:60+e,y:80+n},battery:{x:130+e,y:240+n},grid:{x:60+e,y:400+n},load:{x:360+e,y:240+n}},this._canvasWidth=t,this._canvasHeight=i}static getStubConfig(){return{}}static getConfigForm(){return{schema:[{name:"view_mode",label:"View Mode",selector:{select:{options:[{value:"default",label:"Default"},{value:"compact",label:"Compact Bar"},{value:"compact-battery",label:"Compact with Battery"},{value:"chart",label:"Chart"}]}}},{name:"grid_entity",label:"Grid",required:!0,selector:{entity:{domain:"sensor",device_class:"power"}}},{name:"grid_name",selector:{entity_name:{}},context:{entity:"grid_entity"}},{name:"grid_icon",selector:{icon:{}},context:{icon_entity:"grid_entity"}},{name:"grid_min",label:"Grid Min (W)",selector:{number:{mode:"box"}}},{name:"grid_max",label:"Grid Max (W)",selector:{number:{mode:"box"}}},{name:"grid_tap_action",label:"Grid Tap Action",selector:{"ui-action":{}}},{name:"load_entity",label:"Load",required:!0,selector:{entity:{domain:"sensor",device_class:"power"}}},{name:"load_name",selector:{entity_name:{}},context:{entity:"load_entity"}},{name:"load_icon",selector:{icon:{}},context:{icon_entity:"load_entity"}},{name:"load_max",label:"Load Max (W)",selector:{number:{mode:"box"}}},{name:"load_tap_action",label:"Load Tap Action",selector:{"ui-action":{}}},{name:"production_entity",label:"Production",required:!0,selector:{entity:{domain:"sensor",device_class:"power"}}},{name:"production_name",selector:{entity_name:{}},context:{entity:"production_entity"}},{name:"production_icon",selector:{icon:{}},context:{icon_entity:"production_entity"}},{name:"production_max",label:"Production Max (W)",selector:{number:{mode:"box"}}},{name:"production_tap_action",label:"Production Tap Action",selector:{"ui-action":{}}},{name:"battery_entity",label:"Battery",required:!0,selector:{entity:{domain:"sensor",device_class:"power"}}},{name:"battery_name",selector:{entity_name:{}},context:{entity:"battery_entity"}},{name:"battery_icon",selector:{icon:{}},context:{icon_entity:"battery_entity"}},{name:"battery_min",label:"Battery Min (W)",selector:{number:{mode:"box"}}},{name:"battery_max",label:"Battery Max (W)",selector:{number:{mode:"box"}}},{name:"battery_tap_action",label:"Battery Tap Action",selector:{"ui-action":{}}},{name:"battery_soc_entity",label:"Battery SOC (%) Entity",selector:{entity:{domain:"sensor"}}},{name:"invert_battery_data",label:"Invert Battery Data",selector:{boolean:{}}},{name:"invert_battery_view",label:"Invert Battery View",selector:{boolean:{}}},{name:"show_plus",label:"Show + Sign",selector:{boolean:{}}}]}}connectedCallback(){this._resizeObserver=new ResizeObserver(()=>{if(this._lastValues){const t=this._lastValues;requestAnimationFrame(()=>{this._drawFlows(t.grid,t.production,t.load,t.battery)})}}),this.parentElement&&this._resizeObserver.observe(this.parentElement),this._resizeObserver.observe(this)}disconnectedCallback(){this._resizeObserver&&(this._resizeObserver.disconnect(),this._resizeObserver=null),this._meters.forEach(t=>t.stopAnimation()),this._animationFrameId&&(cancelAnimationFrame(this._animationFrameId),this._animationFrameId=null)}setConfig(t){this._config=t,this._render()}set hass(t){this._hass=t,this._render()}_render(){if(!this._config||!this._hass)return;const t=this._getEntityState(this._config.grid_entity),i=this._getEntityState(this._config.load_entity),e=this._getEntityState(this._config.production_entity),n=this._getEntityState(this._config.battery_entity),o=parseFloat(t?.state??"0")||0,a=parseFloat(i?.state??"0")||0,r=parseFloat(e?.state??"0")||0;let l=parseFloat(n?.state??"0")||0;this._config.invert_battery_data&&(l=-l);const s=this._config.view_mode||"default";if(s==="compact"||s==="compact-battery"){this._renderCompactView(o,a,r,l,s);return}if(s==="chart"){this._renderChartView(o,a,r,l);return}const h=this._config.grid_min!=null?this._config.grid_min:-5e3,g=this._config.grid_max!=null?this._config.grid_max:5e3,d=this._config.load_max!=null?this._config.load_max:5e3,c=this._config.production_max!=null?this._config.production_max:5e3,v=this._config.battery_min!=null?this._config.battery_min:-5e3,$=this._config.battery_max!=null?this._config.battery_max:5e3;if(this.querySelector(".energy-flow-svg")){const u=this._meters.get("production"),m=this._meters.get("battery"),P=this._meters.get("grid"),S=this._meters.get("load");u&&(u.value=r),m&&(m.invertView=this._config.invert_battery_view??!1,m.value=l),P&&(P.value=o),S&&(S.value=a)}else{this._iconsExtracted=!1;const u=(M,p)=>{this._fireEvent.call(this,M,p)},m=new Q("production",r,0,c,!1,this._getDisplayName("production_name","production_entity","Production"),this._getIcon("production_icon","production_entity","mdi:solar-power"),"WATTS",!1,!1,this._config.production_tap_action,this._config.production_entity,u),P=new Q("battery",l,v,$,!0,this._getDisplayName("battery_name","battery_entity","Battery"),this._getIcon("battery_icon","battery_entity","mdi:battery"),"WATTS",this._config.invert_battery_view,this._config.show_plus,this._config.battery_tap_action,this._config.battery_entity,u),S=new Q("grid",o,h,g,!0,this._getDisplayName("grid_name","grid_entity","Grid"),this._getIcon("grid_icon","grid_entity","mdi:transmission-tower"),"WATTS",!1,!1,this._config.grid_tap_action,this._config.grid_entity,u),I=new Q("load",a,0,d,!1,this._getDisplayName("load_name","load_entity","Load"),this._getIcon("load_icon","load_entity","mdi:home-lightning-bolt"),"WATTS",!1,!1,this._config.load_tap_action,this._config.load_entity,u);this.innerHTML=`
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
      `,requestAnimationFrame(()=>{const M=this.querySelector("#production-meter"),p=this.querySelector("#battery-meter"),y=this.querySelector("#grid-meter"),f=this.querySelector("#load-meter");M&&M.appendChild(m.createElement()),p&&p.appendChild(P.createElement()),y&&y.appendChild(S.createElement()),f&&f.appendChild(I.createElement()),this._meters.set("production",m),this._meters.set("battery",P),this._meters.set("grid",S),this._meters.set("load",I),m.startAnimation(),P.startAnimation(),S.startAnimation(),I.startAnimation(),m.updateDimming(),P.updateDimming(),S.updateDimming(),I.updateDimming()})}this._lastValues={grid:o,production:r,load:a,battery:l},this._animationFrameId||this._startFlowAnimationLoop(),this._iconsExtracted||requestAnimationFrame(()=>{this._extractIconPaths()}),requestAnimationFrame(()=>{requestAnimationFrame(()=>{this._drawFlows(o,r,a,l)})})}_getEntityState(t){return this._hass?.states?.[t]}_getDisplayName(t,i,e){if(this._config?.[t])return String(this._config[t]);const n=this._config?.[i];if(n){const o=this._getEntityState(n);if(o?.attributes?.friendly_name)return o.attributes.friendly_name}return e}_getIcon(t,i,e){if(this._config?.[t])return String(this._config[t]);const n=this._config?.[i];if(n){const o=this._getEntityState(n);if(o?.attributes?.icon)return o.attributes.icon}return e}_handleAction(t,i){if(!this._hass)return;const e=t||{action:"more-info"};switch(e.action||"more-info"){case"more-info":const o=e.entity||i;this._fireEvent("hass-more-info",{entityId:o});break;case"navigate":e.navigation_path&&(history.pushState(null,"",e.navigation_path),this._fireEvent("location-changed",{replace:e.navigation_replace||!1}));break;case"url":e.url_path&&window.open(e.url_path);break;case"toggle":this._hass.callService("homeassistant","toggle",{entity_id:i});break;case"perform-action":if(e.perform_action){const[a,r]=e.perform_action.split(".");this._hass.callService(a,r,e.data||{},e.target)}break;case"assist":this._fireEvent("show-dialog",{dialogTag:"ha-voice-command-dialog",dialogParams:{pipeline_id:e.pipeline_id||"last_used",start_listening:e.start_listening}});break}}_fireEvent(t,i={}){if(t==="call-service"&&this._hass){this._hass.callService(i.domain,i.service,i.service_data||{},i.target);return}const e=new CustomEvent(t,{detail:i,bubbles:!0,composed:!0});this.dispatchEvent(e)}_createMeterDefs(){return`
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
    `}_calculateFlows(t,i,e,n){return U({grid:t,production:i,load:e,battery:n})}_drawFlows(t,i,e,n){const o=this.querySelector("#flow-layer");if(!o)return;const a=this._meterPositions.production,r=this._meterPositions.battery,l=this._meterPositions.grid,s=this._meterPositions.load,{productionToLoad:h,productionToBattery:g,productionToGrid:d,gridToLoad:c,gridToBattery:v,batteryToLoad:$}=this._calculateFlows(t,i,e,n),u=0;[{id:"production-to-load",from:a,to:s,power:h,color:"#4caf50",threshold:u},{id:"production-to-battery",from:a,to:r,power:g,color:"#4caf50",threshold:u},{id:"battery-to-load",from:r,to:s,power:$,color:"#2196f3",threshold:10},{id:"grid-to-load",from:l,to:s,power:c,color:"#f44336",threshold:u},{id:"grid-to-battery",from:l,to:r,power:v,color:"#f44336",threshold:u},{id:"production-to-grid",from:a,to:l,power:d,color:"#ffeb3b",threshold:u}].forEach(S=>{S.power>S.threshold?this._updateOrCreateFlow(o,S.id,S.from,S.to,S.power,S.color):this._fadeOutFlow(o,S.id)})}_startFlowAnimationLoop(){const t=i=>{this._lastAnimationTime||(this._lastAnimationTime=i);const e=i-(this._lastAnimationTime??i);this._lastAnimationTime=i,this._flowDots.forEach((n,o)=>{const a=this.querySelector(`#path-${o}`);a&&n&&n.length>0&&n.forEach((r,l)=>{const s=this.querySelector(`#dot-${o}-${l}`);if(s&&r.velocity>0){r.progress+=r.velocity*e/1e3,r.progress>=1&&(r.progress=r.progress%1);try{const h=a.getTotalLength();if(h>0){const g=a.getPointAtLength(r.progress*h);s.setAttribute("cx",String(g.x)),s.setAttribute("cy",String(g.y))}}catch{}}})}),this._animationFrameId=requestAnimationFrame(t)};this._animationFrameId=requestAnimationFrame(t)}_updateOrCreateFlow(t,i,e,n,o,a){let r=t.querySelector(`#${i}`),l;o<=100?l=.25:o<=200?l=.25+(o-100)/100*.75:l=1;const s=2,h=23.76,g=1e4;let d;if(o<=100)d=s;else{const A=Math.min((o-100)/(g-100),1)*(h-s);d=s+A}const c=2.5,v=3,$=c*(d/s),u=Math.max($,v),m=document.createElementNS("http://www.w3.org/2000/svg","path"),P=(e.x+n.x)/2,S=(e.y+n.y)/2,I=`M ${e.x},${e.y} Q ${P},${S} ${n.x},${n.y}`;m.setAttribute("d",I);const M=m.getTotalLength(),f=40*(o/1e3)*this._speedMultiplier,k=M>0?f/M:0;if(r){const A=r.querySelector(`#glow-${i}`),x=r.querySelector(`#path-${i}`);if(A&&x){const C=(e.x+n.x)/2,_=(e.y+n.y)/2,T=`M ${e.x},${e.y} Q ${C},${_} ${n.x},${n.y}`;A.setAttribute("d",T),A.setAttribute("stroke-opacity",String(l*.5)),A.setAttribute("stroke-width",String(d*2)),x.setAttribute("d",T),x.setAttribute("stroke-opacity",String(l)),x.setAttribute("stroke-width",String(d))}const F=this._flowDots.get(i);F&&F.forEach((C,_)=>{const T=r.querySelector(`#dot-${i}-${_}`);T&&(T.setAttribute("r",String(u)),T.setAttribute("opacity",String(l)),T.setAttribute("fill",a)),C.velocity=k})}else{r=document.createElementNS("http://www.w3.org/2000/svg","g"),r.id=i,t.appendChild(r);const A=document.createElementNS("http://www.w3.org/2000/svg","path");A.setAttribute("d",I),A.setAttribute("class","flow-line"),A.setAttribute("stroke",a),A.setAttribute("stroke-opacity",String(l*.5)),A.setAttribute("stroke-width",String(d*2)),A.setAttribute("style","transition: stroke-opacity 0.5s ease-out, stroke-width 0.5s ease-out;"),A.id=`glow-${i}`,r.appendChild(A);const x=document.createElementNS("http://www.w3.org/2000/svg","path");x.setAttribute("d",I),x.setAttribute("class","flow-line"),x.setAttribute("stroke",a),x.setAttribute("stroke-opacity",String(l)),x.setAttribute("stroke-width",String(d)),x.setAttribute("style","transition: stroke-opacity 0.5s ease-out, stroke-width 0.5s ease-out;"),x.id=`path-${i}`,r.appendChild(x);const F=[];for(let C=0;C<this._dotsPerFlow;C++){const _=document.createElementNS("http://www.w3.org/2000/svg","circle");_.setAttribute("class","flow-dot"),_.setAttribute("id",`dot-${i}-${C}`),_.setAttribute("r",String(u)),_.setAttribute("fill",a),_.setAttribute("opacity",String(l)),_.setAttribute("style","transition: opacity 0.5s ease-out, r 0.5s ease-out;"),r.appendChild(_);const T=C/this._dotsPerFlow;F.push({progress:T,velocity:k})}this._flowDots.set(i,F)}}_removeFlow(t,i){const e=t.querySelector(`#${i}`);e&&e.remove(),this._flowDots.delete(i)}_fadeOutFlow(t,i){const e=t.querySelector(`#${i}`);if(!e)return;const n=e.querySelector(`#glow-${i}`),o=e.querySelector(`#path-${i}`);n&&n.setAttribute("stroke-opacity","0"),o&&o.setAttribute("stroke-opacity","0");const a=this._flowDots.get(i);a&&a.forEach((r,l)=>{const s=e.querySelector(`#dot-${i}-${l}`);s&&s.setAttribute("opacity","0")}),setTimeout(()=>{this._removeFlow(t,i)},500)}_extractIconPaths(){["production","battery","grid","load"].forEach(i=>{const e=this.querySelector(`#icon-source-${i}`),n=this.querySelector(`#icon-display-${i}`);if(!e||!n){console.warn(`Icon elements not found for ${i}`);return}const o=e.querySelector("div");if(!o){console.warn(`No div found in foreignObject for ${i}`);return}const a=o.querySelector("ha-icon");if(!a){console.warn(`No ha-icon found for ${i}`);return}const r=a.getAttribute("icon");if(!r){console.warn(`No icon attribute for ${i}`);return}if(this._iconCache.has(r)){const s=this._iconCache.get(r);this._renderIconPath(n,s),e.style.display="none";return}const l=(s=0,h=10)=>{const g=s*100,d=window.setTimeout(()=>{this._iconExtractionTimeouts.delete(d);try{const c=a.shadowRoot;if(!c){s<h&&l(s+1,h);return}let v=c.querySelector("svg");if(!v){const m=c.querySelector("ha-svg-icon");m&&m.shadowRoot&&(v=m.shadowRoot.querySelector("svg"))}if(!v){s<h&&l(s+1,h);return}const $=v.querySelector("path");if(!$){s<h&&l(s+1,h);return}const u=$.getAttribute("d");u?(this._iconCache.set(r,u),this._renderIconPath(n,u),e.style.display="none"):s<h&&l(s+1,h)}catch(c){console.error(`Failed to extract icon path for ${r} (attempt ${s+1}):`,c),s<h&&l(s+1,h)}},g);this._iconExtractionTimeouts.add(d)};l()}),this._iconsExtracted=!0}_renderIconPath(t,i){if(t.innerHTML="",i){const e=document.createElementNS("http://www.w3.org/2000/svg","path");e.setAttribute("d",i),e.setAttribute("fill","rgb(160, 160, 160)"),e.setAttribute("transform","scale(1)"),t.appendChild(e)}else{const e=document.createElementNS("http://www.w3.org/2000/svg","circle");e.setAttribute("cx","12"),e.setAttribute("cy","12"),e.setAttribute("r","8"),e.setAttribute("fill","rgb(160, 160, 160)"),t.appendChild(e)}}_drawFlow(t,i,e,n,o){const a=document.createElementNS("http://www.w3.org/2000/svg","path"),r=(i.x+e.x)/2,l=(i.y+e.y)/2,s=`M ${i.x},${i.y} Q ${r},${l} ${e.x},${e.y}`;a.setAttribute("d",s),a.setAttribute("class",`flow-line ${o?"flow-positive":"flow-negative"}`),a.setAttribute("id",`path-${Math.random()}`),t.appendChild(a);const h=Math.min(Math.max(Math.floor(n/1e3),1),3);for(let g=0;g<h;g++){const d=document.createElementNS("http://www.w3.org/2000/svg","circle");d.setAttribute("class",`flow-dot ${o?"flow-positive":"flow-negative"}`),d.setAttribute("r","3"),d.setAttribute("fill",o?"var(--success-color, #4caf50)":"var(--error-color, #f44336)");const c=document.createElementNS("http://www.w3.org/2000/svg","animateMotion");c.setAttribute("dur","2s"),c.setAttribute("repeatCount","indefinite"),c.setAttribute("begin",`${g*.6}s`);const v=document.createElementNS("http://www.w3.org/2000/svg","mpath");v.setAttributeNS("http://www.w3.org/1999/xlink","href",`#${a.id}`),c.appendChild(v),d.appendChild(c),t.appendChild(d)}}_renderCompactView(t,i,e,n,o){const a=this._calculateFlows(t,e,i,n),r=a.productionToLoad,l=a.batteryToLoad,s=a.gridToLoad,h=i||1,g=r/h*100,d=l/h*100,c=s/h*100,v=g+d+c;let $=g,u=d,m=c;if(v>0){const w=100/v;$=g*w,u=d*w,m=c*w}const P="#256028",S="#104b79",I="#7a211b",M="#7a6b1b";let p=null;if(o==="compact-battery"&&this._config?.battery_soc_entity){const w=this._getEntityState(this._config.battery_soc_entity);p=parseFloat(w?.state??"0")||0}let y=0,f=0,k=0,A=0,x=0,F=0,C=0,_=0,T=0;if(o==="compact-battery"){if(n<0){const L=Math.abs(n)||1;A=a.gridToBattery,F=a.productionToBattery,y=a.gridToBattery/L*100,k=a.productionToBattery/L*100;const H=y+k;if(H>0){const R=100/H;C=y*R,T=k*R}}else if(n>0){const w=n||1,L=n-a.batteryToLoad;x=a.batteryToLoad,A=L,f=a.batteryToLoad/w*100,y=L/w*100;const H=f+y;if(H>0){const R=100/H;_=f*R,C=y*R}}}(!this.querySelector(".compact-view")||this._lastViewMode!==o)&&(this.innerHTML=`
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
                <div id="grid-segment" class="bar-segment" style="background: ${I}; width: ${c}%;">
                  <div class="bar-segment-content">
                    <ha-icon class="bar-segment-icon" icon="${this._getIcon("grid_icon","grid_entity","mdi:transmission-tower")}"></ha-icon>
                    <span class="bar-segment-label"></span>
                  </div>
                </div>
                <div id="battery-segment" class="bar-segment" style="background: ${S}; width: ${d}%;">
                  <div class="bar-segment-content">
                    <ha-icon class="bar-segment-icon" icon="${this._getIcon("battery_icon","battery_entity","mdi:battery")}"></ha-icon>
                    <span class="bar-segment-label"></span>
                  </div>
                </div>
                <div id="production-segment" class="bar-segment" style="background: ${P}; width: ${g}%;">
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
                  <span id="battery-soc-text-left">${p!==null?p.toFixed(1):"--"}</span><span class="row-unit">%</span>
                </div>
              </div>
              <div class="bar-container">
                <!-- Color order: red, yellow, blue, green (left to right) -->
                <div id="battery-grid-segment" class="bar-segment" style="background: ${n<0?I:M}; width: ${y}%;">
                  <div class="bar-segment-content">
                    <ha-icon class="bar-segment-icon" icon="${this._getIcon("grid_icon","grid_entity","mdi:transmission-tower")}"></ha-icon>
                    <span class="bar-segment-label"></span>
                  </div>
                </div>
                <div id="battery-load-segment" class="bar-segment" style="background: ${S}; width: ${f}%;">
                  <div class="bar-segment-content">
                    <ha-icon class="bar-segment-icon" icon="${this._getIcon("load_icon","load_entity","mdi:home")}"></ha-icon>
                    <span class="bar-segment-label"></span>
                  </div>
                </div>
                <div id="battery-production-segment" class="bar-segment" style="background: ${P}; width: ${k}%;">
                  <div class="bar-segment-content">
                    <ha-icon class="bar-segment-icon" icon="${this._getIcon("production_icon","production_entity","mdi:solar-power")}"></ha-icon>
                    <span class="bar-segment-label"></span>
                  </div>
                </div>
              </div>
              <div class="row-value" id="battery-soc-right">
                <ha-icon class="row-icon" icon="${this._getIcon("battery_icon","battery_entity","mdi:battery")}"></ha-icon>
                <div class="row-text">
                  <span id="battery-soc-text-right">${p!==null?p.toFixed(1):"--"}</span><span class="row-unit">%</span>
                </div>
              </div>
            </div>
            `:""}
          </div>
        </ha-card>
      `,this._lastViewMode=o,requestAnimationFrame(()=>{if(this._config){const w=this.querySelector("#production-segment"),L=this.querySelector("#battery-segment"),H=this.querySelector("#grid-segment"),q=this.querySelectorAll(".row-value")[0];if(w&&w.addEventListener("click",()=>{this._handleAction(this._config.production_tap_action,this._config.production_entity)}),L&&L.addEventListener("click",()=>{this._handleAction(this._config.battery_tap_action,this._config.battery_entity)}),H&&H.addEventListener("click",()=>{this._handleAction(this._config.grid_tap_action,this._config.grid_entity)}),q&&q.addEventListener("click",()=>{this._handleAction(this._config.load_tap_action,this._config.load_entity)}),o==="compact-battery"){const b=this.querySelector("#battery-production-segment"),E=this.querySelector("#battery-load-segment"),V=this.querySelector("#battery-grid-segment"),W=this.querySelector("#battery-soc-left"),D=this.querySelector("#battery-soc-right");b&&b.addEventListener("click",()=>{this._handleAction(this._config.production_tap_action,this._config.production_entity)}),E&&E.addEventListener("click",()=>{this._handleAction(this._config.load_tap_action,this._config.load_entity)}),V&&V.addEventListener("click",()=>{this._handleAction(this._config.grid_tap_action,this._config.grid_entity)}),W&&W.addEventListener("click",()=>{this._handleAction(this._config.battery_tap_action,this._config.battery_entity)}),D&&D.addEventListener("click",()=>{this._handleAction(this._config.battery_tap_action,this._config.battery_entity)})}}})),requestAnimationFrame(()=>{const w=this.querySelector("#production-segment"),L=this.querySelector("#battery-segment"),H=this.querySelector("#grid-segment"),R=this.querySelector("#load-value-text");if(w){w.style.width=`${$}%`;const q=w.querySelector(".bar-segment-label");q&&r>0&&(q.textContent=`${Math.round(g)}%`);const b=this.querySelector(".bar-container"),E=$/100*(b?.clientWidth||0);this._updateSegmentVisibility(w,E,r>0)}if(L){L.style.width=`${u}%`;const q=L.querySelector(".bar-segment-label");q&&l>0&&(q.textContent=`${Math.round(d)}%`);const b=this.querySelector(".bar-container"),E=u/100*(b?.clientWidth||0);this._updateSegmentVisibility(L,E,l>0)}if(H){H.style.width=`${m}%`;const q=H.querySelector(".bar-segment-label");q&&s>0&&(q.textContent=`${Math.round(c)}%`);const b=this.querySelector(".bar-container"),E=m/100*(b?.clientWidth||0);this._updateSegmentVisibility(H,E,s>0)}if(R&&(R.textContent=String(Math.round(i))),o==="compact-battery"){const q=this.querySelector("#battery-grid-segment"),b=this.querySelector("#battery-load-segment"),E=this.querySelector("#battery-production-segment"),V=this.querySelector("#battery-soc-left"),W=this.querySelector("#battery-soc-right"),D=this.querySelector("#battery-soc-text-left"),B=this.querySelector("#battery-soc-text-right"),X=this.querySelectorAll(".bar-container")[1];let j=!1;if(n<0?(j=!0,V&&(V.style.display="none"),W&&(W.style.display="flex"),B&&p!==null&&(B.textContent=p.toFixed(1))):n>0?(j=!1,V&&(V.style.display="flex"),W&&(W.style.display="none"),D&&p!==null&&(D.textContent=p.toFixed(1))):(V&&(V.style.display="none"),W&&(W.style.display="flex"),B&&p!==null&&(B.textContent=p.toFixed(1))),q){const N=j?"#7a211b":"#7a6b1b";q.style.width=`${C}%`,q.style.background=N;const z=q.querySelector(".bar-segment-label");z&&A>0&&(z.textContent=`${Math.round(A)}W`);const Y=C/100*(X?.offsetWidth||0);this._updateSegmentVisibility(q,Y,A>0)}if(b){b.style.width=`${_}%`;const N=b.querySelector(".bar-segment-label");N&&x>0&&(N.textContent=`${Math.round(x)}W`);const z=_/100*(X?.offsetWidth||0);this._updateSegmentVisibility(b,z,x>0)}if(E){E.style.width=`${T}%`;const N=E.querySelector(".bar-segment-label");N&&F>0&&(N.textContent=`${Math.round(F)}W`);const z=T/100*(X?.offsetWidth||0);this._updateSegmentVisibility(E,z,F>0)}}})}async _renderChartView(t,i,e,n){(!this.querySelector(".chart-view")||this._lastViewMode!=="chart")&&(this.innerHTML=`
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
      `,this._lastViewMode="chart"),this._liveChartValues={grid:t,load:i,production:e,battery:n},await this._fetchAndRenderChartData()}async _fetchAndRenderChartData(){if(!this._hass||!this._config)return;const t=12,i=new Date,e=new Date(i.getTime()-t*60*60*1e3);try{const[n,o,a,r]=await Promise.all([this._fetchHistory(this._config.production_entity,e,i),this._fetchHistory(this._config.grid_entity,e,i),this._fetchHistory(this._config.load_entity,e,i),this._fetchHistory(this._config.battery_entity,e,i)]);this._drawStackedAreaChart(n,o,a,r,t);const l=this.querySelector(".loading-message");l&&l.remove()}catch(n){console.error("Error fetching chart data:",n);const o=this.querySelector(".chart-svg");o&&(o.innerHTML=`
          <text x="400" y="200" text-anchor="middle" fill="rgb(160, 160, 160)" font-size="14">
            Error loading chart data
          </text>
        `)}}async _fetchHistory(t,i,e){if(!this._hass)return[];const n=`history/period/${i.toISOString()}?filter_entity_id=${t}&end_time=${e.toISOString()}&minimal_response&no_attributes`;try{return(await this._hass.callApi("GET",n))[0]||[]}catch(o){return console.error(`Error fetching history for ${t}:`,o),[]}}_drawStackedAreaChart(t,i,e,n,o){const a=this.querySelector(".chart-svg");if(!a)return;const r=800,l=400,s={top:20,right:150,bottom:40,left:60},h=r-s.left-s.right,g=l-s.top-s.bottom,c=o*120,$=o*12,u=10,m=new Date,P=Math.floor(m.getMinutes()/5)*5,S=new Date(m.getFullYear(),m.getMonth(),m.getDate(),m.getHours(),P,0,0),I=new Date(S.getTime()-o*60*60*1e3),M=[];for(let b=0;b<c;b++){const E=new Date(I.getTime()+b*30*1e3),V=this._interpolateValue(t,E),W=this._interpolateValue(i,E),D=this._interpolateValue(e,E);let B=this._interpolateValue(n,E);this._config?.invert_battery_data&&(B=-B),M.push({time:E,solar:Math.max(0,V),batteryDischarge:Math.max(0,B),batteryCharge:Math.max(0,-B),gridImport:Math.max(0,W),gridExport:Math.max(0,-W),load:Math.max(0,D)})}const p=[];for(let b=0;b<$;b++){const E=new Date(I.getTime()+(b+1)*5*60*1e3),V=b*u,W=Math.min(V+u,M.length),D=W-V;let B=0,Z=0,X=0,j=0,N=0,z=0;for(let Y=V;Y<W;Y++)B+=M[Y].solar,Z+=M[Y].batteryDischarge,X+=M[Y].batteryCharge,j+=M[Y].gridImport,N+=M[Y].gridExport,z+=M[Y].load;b===0&&console.log("Chart data sample (5-min avg of 30-sec data):",{time:E.toISOString(),windowSize:D,solar:B/D,invert_battery_data:this._config?.invert_battery_data}),p.push({time:E,solar:B/D,batteryDischarge:Z/D,batteryCharge:X/D,gridImport:j/D,gridExport:N/D,load:z/D})}const y=Math.max(...p.map(b=>b.solar+b.batteryDischarge+b.gridImport),...p.map(b=>b.load)),f=Math.max(...p.map(b=>b.batteryCharge+b.gridExport)),k=y+f,A=k>0?y/k:.5,x=k>0?f/k:.5,F=y>0?g*A/(y*1.1):1,C=f>0?g*x/(f*1.1):1,_=Math.min(F,C),T=y*_*1.1,O=f*_*1.1,w=s.top+T,L=this._createStackedPaths(p,h,T,_,s,"supply",w),H=this._createStackedPaths(p,h,O,_,s,"demand",w),R=this._createLoadLine(p,h,T,_,s,w);let q=`
      <!-- Grid lines -->
      <g opacity="0.1">
        ${this._createGridLines(h,g,s,Math.max(y,f))}
      </g>
      
      <!-- Zero line (dynamic position based on supply height) -->
      <line 
        x1="${s.left}" 
        y1="${w}" 
        x2="${s.left+h}" 
        y2="${w}" 
        stroke="rgb(160, 160, 160)" 
        stroke-width="1" 
        stroke-dasharray="4,4"
      />
      
      <!-- Demand areas (below zero line) -->
      ${H}
      
      <!-- Supply areas (above zero line) -->
      ${L}
      
      <!-- Load line (thick gray line on supply side) -->
      ${R}
      
      <!-- Time axis labels -->
      ${this._createTimeLabels(h,g,s,o)}
      
      <!-- Y-axis labels -->
      ${this._createYAxisLabels(T,O,s,y,f,w)}
      
      <!-- Floating indicators with current values -->
      ${this._createFloatingIndicators(p,h,g,_,_,s,r)}
      
      <!-- Hidden icon sources for extraction -->
      ${this._createChartIconSources()}
    `;a.innerHTML=q,requestAnimationFrame(()=>{this._extractChartIcons(p,h,T,O,_,_,s,w)})}_interpolateValue(t,i){if(t.length===0)return 0;let e=t[0],n=Math.abs(new Date(t[0].last_changed).getTime()-i.getTime());for(const o of t){const a=Math.abs(new Date(o.last_changed).getTime()-i.getTime());a<n&&(n=a,e=o)}return parseFloat(e.state)||0}_createStackedPaths(t,i,e,n,o,a,r){const l=t.length,s=i/(l-1);if(a==="supply"){const h=this._createAreaPath(t,s,r,n,o,c=>c.solar,0,"down"),g=this._createAreaPath(t,s,r,n,o,c=>c.batteryDischarge,c=>c.solar,"down"),d=this._createAreaPath(t,s,r,n,o,c=>c.gridImport,c=>c.solar+c.batteryDischarge,"down");return`
        ${d?`<path d="${d}" fill="#c62828" opacity="0.8" />`:""}
        ${g?`<path d="${g}" fill="#1976d2" opacity="0.8" />`:""}
        ${h?`<path d="${h}" fill="#388e3c" opacity="0.85" />`:""}
      `}else{const h=this._createAreaPath(t,s,r,n,o,d=>d.batteryCharge,0,"up"),g=this._createAreaPath(t,s,r,n,o,d=>d.gridExport,d=>d.batteryCharge,"up");return`
        ${g?`<path d="${g}" fill="#f9a825" opacity="0.8" />`:""}
        ${h?`<path d="${h}" fill="#1976d2" opacity="0.8" />`:""}
      `}}_createLoadLine(t,i,e,n,o,a){if(!t||t.length===0)return"";const r=i/(t.length-1);return`<path d="${t.map((s,h)=>{const g=o.left+h*r,d=a-s.load*n;return`${h===0?"M":"L"} ${g},${d}`}).join(" ")}" fill="none" stroke="#CCCCCC" stroke-width="3" opacity="0.9" />`}_createFloatingIndicators(t,i,e,n,o,a,r){return""}_createChartIconSources(){const t=this._getIcon("load_icon","load_entity","mdi:home-lightning-bolt"),i=this._getIcon("production_icon","production_entity","mdi:solar-power"),e=this._getIcon("battery_icon","battery_entity","mdi:battery"),n=this._getIcon("grid_icon","grid_entity","mdi:transmission-tower");return`
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
    `}async _extractChartIcons(t,i,e,n,o,a,r,l){const s=this.querySelector(".chart-svg");if(!s||!t||t.length===0)return;const h=["load","solar","battery","grid"],g={};for(const d of h){const c=s.querySelector(`#chart-icon-source-${d}`);if(!c)continue;const v=c.querySelector("div");if(!v)continue;const $=v.querySelector("ha-icon");if(!$)continue;const u=$.getAttribute("icon");if(!u)continue;if(this._iconCache.has(u)){g[d]=this._iconCache.get(u)||null;continue}const m=await this._extractIconPath($,u);g[d]=m,m&&this._iconCache.set(u,m)}this._renderChartIndicators(s,t,i,e,n,o,a,r,g,l)}async _extractIconPath(t,i,e=10){for(let n=0;n<e;n++){try{const o=t.shadowRoot;if(!o){await new Promise(s=>setTimeout(s,100));continue}let a=o.querySelector("svg");if(!a){const s=o.querySelector("ha-svg-icon");s&&s.shadowRoot&&(a=s.shadowRoot.querySelector("svg"))}if(!a){await new Promise(s=>setTimeout(s,100));continue}const r=a.querySelector("path");if(!r){await new Promise(s=>setTimeout(s,100));continue}const l=r.getAttribute("d");if(l)return l}catch(o){console.error(`Failed to extract icon path for ${i} (attempt ${n+1}):`,o)}await new Promise(o=>setTimeout(o,100))}return null}_renderChartIndicators(t,i,e,n,o,a,r,l,s,h){const g=t.querySelector("#chart-indicators");g&&g.remove(),t.querySelectorAll('[id^="chart-icon-source-"]').forEach(f=>f.remove());let c;if(this._liveChartValues){const{grid:f,load:k,production:A,battery:x}=this._liveChartValues;c={load:Math.max(0,k),solar:Math.max(0,A),batteryDischarge:Math.max(0,x),batteryCharge:Math.max(0,-x),gridImport:Math.max(0,f),gridExport:Math.max(0,-f)}}else c=i[i.length-1];const v=l.left+e,$=h-c.load*a,u=h-c.solar*a,m=h-(c.solar+c.batteryDischarge)*a,P=h-(c.solar+c.batteryDischarge+c.gridImport)*a,S=h+c.batteryCharge*r,I=h+(c.batteryCharge+c.gridExport)*r,M=f=>`${Math.round(f)} W`,p=document.createElementNS("http://www.w3.org/2000/svg","g");p.setAttribute("id","chart-indicators");const y=(f,k,A,x,F="")=>{const C=document.createElementNS("http://www.w3.org/2000/svg","g");C.setAttribute("transform",`translate(${v+10}, ${f})`);const _=document.createElementNS("http://www.w3.org/2000/svg","circle");_.setAttribute("r","5"),_.setAttribute("fill",k),C.appendChild(_);const T=s[A];if(T){const w=document.createElementNS("http://www.w3.org/2000/svg","g");w.setAttribute("transform","translate(10, -8) scale(0.67)");const L=document.createElementNS("http://www.w3.org/2000/svg","path");L.setAttribute("d",T),L.setAttribute("fill",k),w.appendChild(L),C.appendChild(w)}const O=document.createElementNS("http://www.w3.org/2000/svg","text");O.setAttribute("x","28"),O.setAttribute("y","4"),O.setAttribute("fill",k),O.setAttribute("font-size","12"),O.setAttribute("font-weight","600"),O.textContent=`${F}${x}`,C.appendChild(O),p.appendChild(C)};y($,"#CCCCCC","load",M(c.load)),c.solar>0&&y(u,"#388e3c","solar",M(c.solar)),c.batteryDischarge>0&&y(m,"#1976d2","battery",M(c.batteryDischarge),"+"),c.gridImport>0&&y(P,"#c62828","grid",M(c.gridImport)),c.batteryCharge>0&&y(S,"#1976d2","battery",M(c.batteryCharge),"-"),c.gridExport>0&&y(I,"#f9a825","grid",M(c.gridExport)),t.appendChild(p)}_createAreaPath(t,i,e,n,o,a,r,l){const s=[],h=[];let g=!1;if(t.forEach((c,v)=>{const $=o.left+v*i,u=a(c),m=typeof r=="function"?r(c):r;u>0&&(g=!0);const P=l==="down"?-(u+m)*n:(u+m)*n,S=l==="down"?-m*n:m*n;s.push({x:$,y:e+P}),h.push({x:$,y:e+S})}),!g)return null;let d=`M ${s[0].x} ${s[0].y}`;for(let c=1;c<s.length;c++)d+=` L ${s[c].x} ${s[c].y}`;for(let c=h.length-1;c>=0;c--)d+=` L ${h[c].x} ${h[c].y}`;return d+=" Z",d}_createGridLines(t,i,e,n){const o=[];for(let r=0;r<=4;r++){const l=e.top+r*i/4;o.push(`<line x1="${e.left}" y1="${l}" x2="${e.left+t}" y2="${l}" stroke="white" stroke-width="1" />`)}return o.join(`
`)}_createTimeLabels(t,i,e,n){const o=[],r=new Date;for(let l=0;l<=6;l++){const s=n-l*n/6,h=new Date(r.getTime()-s*60*60*1e3),g=h.getMinutes(),d=g<15?0:g<45?30:0,c=g>=45?1:0;h.setMinutes(d),h.setSeconds(0),h.setMilliseconds(0),c&&h.setHours(h.getHours()+c);const v=e.left+l*t/6,$=e.top+i+20,u=h.getHours(),m=u===0?12:u>12?u-12:u,P=u>=12?"PM":"AM";o.push(`
        <text x="${v}" y="${$}" text-anchor="middle" fill="rgb(160, 160, 160)" font-size="11">
          ${m} ${P}
        </text>
      `)}return o.join(`
`)}_createYAxisLabels(t,i,e,n,o,a){const r=[];return r.push(`<text x="${e.left-10}" y="${e.top+5}" text-anchor="end" fill="rgb(160, 160, 160)" font-size="11">${Math.round(n)}W</text>`),r.push(`<text x="${e.left-10}" y="${a+5}" text-anchor="end" fill="rgb(160, 160, 160)" font-size="11">0</text>`),r.push(`<text x="${e.left-10}" y="${a+i+5}" text-anchor="end" fill="rgb(160, 160, 160)" font-size="11">-${Math.round(o)}W</text>`),r.join(`
`)}_createChartLegend(t,i,e){const n=[{label:"Solar",color:e.solar},{label:"Battery",color:e.batteryDischarge},{label:"Grid Import",color:e.gridImport},{label:"Grid Export",color:e.gridExport},{label:"Load",color:e.load}],o=t-i.right-10;let a=i.top;return n.map((r,l)=>{const s=a+l*20;return`
        <rect x="${o-80}" y="${s-10}" width="12" height="12" fill="${r.color}" opacity="0.8" />
        <text x="${o-64}" y="${s}" fill="rgb(200, 200, 200)" font-size="11">${r.label}</text>
      `}).join(`
`)}_updateSegmentVisibility(t,i,e){if(!t||!e){t?.setAttribute("data-width-px","");return}i>=80?t.setAttribute("data-width-px","show-label"):i>=40?t.setAttribute("data-width-px","show-icon"):t.setAttribute("data-width-px","")}}customElements.define("energy-flow-card",J),window.customCards=window.customCards||[],window.customCards.push({type:"energy-flow-card",name:"Energy Flow Card",description:"A test energy-flow card."})})();

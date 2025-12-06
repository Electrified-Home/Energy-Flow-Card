(function(){"use strict";class O{constructor(e,t,i,n,o,r,s,a,c=!1,l=!1,h,d,g){this.id=e,this._value=t,this.min=i,this.max=n,this.bidirectional=o,this.label=r,this.icon=s,this.units=a,this._invertView=c,this.showPlus=l,this.tapAction=h,this.entityId=d,this.fireEventCallback=g,this.element=null,this.radius=50,this.boxWidth=120,this.boxHeight=135,this.boxRadius=16,this.centerX=this.boxWidth/2,this.centerY=this.radius+25,this.offsetX=-this.centerX,this.offsetY=-this.centerY,this.needleState={target:0,current:0,ghost:0},this._lastAnimationTime=null,this._animationFrameId=null,this._updateNeedleAngle()}get value(){return this._value}set value(e){if(this._value!==e&&(this._value=e,this._updateNeedleAngle(),this.element)){const t=this.element.querySelector(`#value-${this.id}`);t&&(t.textContent=this._formatValueText()),this.updateDimming()}}get invertView(){return this._invertView}set invertView(e){if(this._invertView!==e&&(this._invertView=e,this._updateNeedleAngle(),this.element)){const t=this.element.querySelector(`#value-${this.id}`);t&&(t.textContent=this._formatValueText())}}get displayValue(){return this._invertView?-this._value:this._value}_formatValueText(){const e=this.displayValue,t=e.toFixed(0);return e<0?t+" ":e>0&&this.showPlus?"+"+t+" ":t}_updateNeedleAngle(){let e,t;const i=this.displayValue;if(this.bidirectional){const n=this.max-this.min;e=Math.min(Math.max((i-this.min)/n,0),1),t=180-e*180}else e=Math.min(Math.max(i/this.max,0),1),t=180-e*180;this.needleState.target=t}updateDimming(){if(!this.element)return;const e=this.element.querySelector(`#dimmer-${this.id}`);if(e){const t=Math.abs(this.value)<.5;e.setAttribute("opacity",t?"0.3":"0")}}startAnimation(){if(this._animationFrameId)return;const e=t=>{this._lastAnimationTime||(this._lastAnimationTime=t);const i=t-this._lastAnimationTime;if(this._lastAnimationTime=t,!this.element){this._animationFrameId=null;return}const n=this.radius-5,o=Math.min(i/150,1);this.needleState.current+=(this.needleState.target-this.needleState.current)*o;const r=Math.min(i/400,1);this.needleState.ghost+=(this.needleState.current-this.needleState.ghost)*r;const s=10;this.needleState.ghost<this.needleState.current-s?this.needleState.ghost=this.needleState.current-s:this.needleState.ghost>this.needleState.current+s&&(this.needleState.ghost=this.needleState.current+s);const a=this.element.querySelector(`#needle-${this.id}`);if(a){const l=this.needleState.current*Math.PI/180,h=this.centerX+n*Math.cos(l),d=this.centerY-n*Math.sin(l);a.setAttribute("x2",String(h)),a.setAttribute("y2",String(d))}const c=this.element.querySelector(`#ghost-needle-${this.id}`);if(c){const l=this.needleState.ghost*Math.PI/180,h=this.centerX+n*Math.cos(l),d=this.centerY-n*Math.sin(l);c.setAttribute("x2",String(h)),c.setAttribute("y2",String(d))}this._animationFrameId=requestAnimationFrame(e)};this._animationFrameId=requestAnimationFrame(e)}stopAnimation(){this._animationFrameId&&(cancelAnimationFrame(this._animationFrameId),this._animationFrameId=null,this._lastAnimationTime=null)}_handleTapAction(){if(!this.fireEventCallback)return;const e=this.tapAction||{action:"more-info"};switch(e.action||"more-info"){case"more-info":const i=e.entity||this.entityId;i&&this.fireEventCallback("hass-more-info",{entityId:i});break;case"navigate":e.navigation_path&&(history.pushState(null,"",e.navigation_path),this.fireEventCallback("location-changed",{replace:e.navigation_replace||!1}));break;case"url":e.url_path&&window.open(e.url_path);break;case"toggle":this.entityId&&this.fireEventCallback("call-service",{domain:"homeassistant",service:"toggle",service_data:{entity_id:this.entityId}});break;case"perform-action":if(e.perform_action){const[n,o]=e.perform_action.split(".");this.fireEventCallback("call-service",{domain:n,service:o,service_data:e.data||{},target:e.target})}break;case"assist":this.fireEventCallback("show-dialog",{dialogTag:"ha-voice-command-dialog",dialogParams:{pipeline_id:e.pipeline_id||"last_used",start_listening:e.start_listening}});break}}createElement(){const e=this.displayValue;let t,i;if(this.bidirectional){const $=this.max-this.min;t=Math.min(Math.max((e-this.min)/$,0),1),i=180-t*180}else t=Math.min(Math.max(e/this.max,0),1),i=180-t*180;this.needleState.target=i,this.needleState.current=i,this.needleState.ghost=i;const o=(this.bidirectional?[this.min,0,this.max]:[0,this.max/2,this.max]).map($=>{const f=(180-(this.bidirectional?($-this.min)/(this.max-this.min):$/this.max)*180)*Math.PI/180,P=this.radius,A=this.radius-8,v=this.centerX+P*Math.cos(f),k=this.centerY-P*Math.sin(f),j=this.centerX+A*Math.cos(f),x=this.centerY-A*Math.sin(f);return`<line x1="${v}" y1="${k}" x2="${j}" y2="${x}" stroke="rgb(160, 160, 160)" stroke-width="2" />`}).join(""),a=(180-(this.bidirectional?(0-this.min)/(this.max-this.min):0)*180)*Math.PI/180,c=this.centerX,l=this.centerY,h=this.centerX+this.radius*Math.cos(a),d=this.centerY-this.radius*Math.sin(a),g=`<line x1="${c}" y1="${l}" x2="${h}" y2="${d}" stroke="rgb(100, 100, 100)" stroke-width="2" />`,w=i*Math.PI/180,M=this.radius-5,u=this.centerX+M*Math.cos(w),m=this.centerY-M*Math.sin(w),T=this.centerY+5,y=this.centerY+this.radius*.5,E=this.centerY+this.radius*.7,I=`
      <g transform="translate(${this.offsetX}, ${this.offsetY})">
        <defs>
          <clipPath id="clip-${this.id}-local">
            <rect x="0" y="0" width="${this.boxWidth}" height="${T+2}" />
          </clipPath>
        </defs>
        
        <rect x="0" y="0" width="${this.boxWidth}" height="${this.boxHeight}" rx="${this.boxRadius}" ry="${this.boxRadius}" fill="rgb(40, 40, 40)" filter="url(#drop-shadow)" />
        
        <g clip-path="url(#clip-${this.id}-local)">
          <circle cx="${this.centerX}" cy="${this.centerY}" r="${this.radius}" fill="rgb(70, 70, 70)" />
          ${g}
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
        
        <text id="value-${this.id}" x="${this.centerX}" y="${y}" text-anchor="middle" font-size="16" fill="rgb(255, 255, 255)" font-weight="600">${this._formatValueText()}</text>
        
        <text x="${this.centerX}" y="${E}" text-anchor="middle" font-size="8" fill="rgb(160, 160, 160)" font-weight="400" letter-spacing="0.5">${this.units}</text>
        
        <rect id="dimmer-${this.id}" x="0" y="0" width="${this.boxWidth}" height="${this.boxHeight}" rx="${this.boxRadius}" ry="${this.boxRadius}" fill="black" opacity="0" pointer-events="none" style="transition: opacity 0.8s ease-in-out;" />
      </g>
    `,b=document.createElementNS("http://www.w3.org/2000/svg","svg");b.innerHTML=I;const _=b.firstElementChild;return this.element=_,(!this.tapAction||this.tapAction.action!=="none")&&(_.style.cursor="pointer",_.addEventListener("click",$=>{this._handleTapAction(),$.stopPropagation()}),_.addEventListener("mouseenter",()=>{_.style.filter="brightness(1.1)"}),_.addEventListener("mouseleave",()=>{_.style.filter=""})),_}}function Q(Y){const e=Math.max(0,Y.production),t=Y.grid,i=Y.battery,n=Math.max(0,Y.load),o={productionToLoad:0,productionToBattery:0,productionToGrid:0,gridToLoad:0,gridToBattery:0,batteryToLoad:0};let r=e,s=n;if(r>0&&s>0&&(o.productionToLoad=Math.min(r,s),r-=o.productionToLoad,s-=o.productionToLoad),i<0&&r>0&&(o.productionToBattery=Math.min(r,Math.abs(i)),r-=o.productionToBattery),i>0&&s>0&&(o.batteryToLoad=Math.min(i,s),s-=o.batteryToLoad),s>0&&t>0&&(o.gridToLoad=Math.min(t,s),s-=o.gridToLoad),i<0&&t>10){const a=Math.abs(i)-o.productionToBattery;a>1&&(o.gridToBattery=Math.min(t-o.gridToLoad,a))}return t<-10&&(o.productionToGrid=Math.abs(t)),o}class U extends HTMLElement{constructor(){super(),this._resizeObserver=null,this._animationFrameId=null,this._flowDots=new Map,this._lastAnimationTime=null,this._iconCache=new Map,this._iconsExtracted=!1,this._iconExtractionTimeouts=new Set,this._meters=new Map,this._speedMultiplier=.8,this._dotsPerFlow=3;const e=500,t=470,i=5,n=3;this._meterPositions={production:{x:60+i,y:80+n},battery:{x:130+i,y:240+n},grid:{x:60+i,y:400+n},load:{x:360+i,y:240+n}},this._canvasWidth=e,this._canvasHeight=t}static getStubConfig(){return{}}static getConfigForm(){return{schema:[{name:"view_mode",label:"View Mode",selector:{select:{options:[{value:"default",label:"Default"},{value:"compact",label:"Compact Bar"},{value:"compact-battery",label:"Compact with Battery"}]}}},{name:"grid_entity",label:"Grid",required:!0,selector:{entity:{domain:"sensor",device_class:"power"}}},{name:"grid_name",selector:{entity_name:{}},context:{entity:"grid_entity"}},{name:"grid_icon",selector:{icon:{}},context:{icon_entity:"grid_entity"}},{name:"grid_min",label:"Grid Min (W)",selector:{number:{mode:"box"}}},{name:"grid_max",label:"Grid Max (W)",selector:{number:{mode:"box"}}},{name:"grid_tap_action",label:"Grid Tap Action",selector:{"ui-action":{}}},{name:"load_entity",label:"Load",required:!0,selector:{entity:{domain:"sensor",device_class:"power"}}},{name:"load_name",selector:{entity_name:{}},context:{entity:"load_entity"}},{name:"load_icon",selector:{icon:{}},context:{icon_entity:"load_entity"}},{name:"load_max",label:"Load Max (W)",selector:{number:{mode:"box"}}},{name:"load_tap_action",label:"Load Tap Action",selector:{"ui-action":{}}},{name:"production_entity",label:"Production",required:!0,selector:{entity:{domain:"sensor",device_class:"power"}}},{name:"production_name",selector:{entity_name:{}},context:{entity:"production_entity"}},{name:"production_icon",selector:{icon:{}},context:{icon_entity:"production_entity"}},{name:"production_max",label:"Production Max (W)",selector:{number:{mode:"box"}}},{name:"production_tap_action",label:"Production Tap Action",selector:{"ui-action":{}}},{name:"battery_entity",label:"Battery",required:!0,selector:{entity:{domain:"sensor",device_class:"power"}}},{name:"battery_name",selector:{entity_name:{}},context:{entity:"battery_entity"}},{name:"battery_icon",selector:{icon:{}},context:{icon_entity:"battery_entity"}},{name:"battery_min",label:"Battery Min (W)",selector:{number:{mode:"box"}}},{name:"battery_max",label:"Battery Max (W)",selector:{number:{mode:"box"}}},{name:"battery_tap_action",label:"Battery Tap Action",selector:{"ui-action":{}}},{name:"battery_soc_entity",label:"Battery SOC (%) Entity",selector:{entity:{domain:"sensor"}}},{name:"invert_battery_data",label:"Invert Battery Data",selector:{boolean:{}}},{name:"invert_battery_view",label:"Invert Battery View",selector:{boolean:{}}},{name:"show_plus",label:"Show + Sign",selector:{boolean:{}}}]}}connectedCallback(){this._resizeObserver=new ResizeObserver(()=>{if(this._lastValues){const e=this._lastValues;requestAnimationFrame(()=>{this._drawFlows(e.grid,e.production,e.load,e.battery)})}}),this.parentElement&&this._resizeObserver.observe(this.parentElement),this._resizeObserver.observe(this)}disconnectedCallback(){this._resizeObserver&&(this._resizeObserver.disconnect(),this._resizeObserver=null),this._meters.forEach(e=>e.stopAnimation()),this._animationFrameId&&(cancelAnimationFrame(this._animationFrameId),this._animationFrameId=null)}setConfig(e){this._config=e,this._render()}set hass(e){this._hass=e,this._render()}_render(){if(!this._config||!this._hass)return;const e=this._getEntityState(this._config.grid_entity),t=this._getEntityState(this._config.load_entity),i=this._getEntityState(this._config.production_entity),n=this._getEntityState(this._config.battery_entity),o=parseFloat(e?.state??"0")||0,r=parseFloat(t?.state??"0")||0,s=parseFloat(i?.state??"0")||0;let a=parseFloat(n?.state??"0")||0;this._config.invert_battery_data&&(a=-a);const c=this._config.view_mode||"default";if(c==="compact"||c==="compact-battery"){this._renderCompactView(o,r,s,a,c);return}const l=this._config.grid_min!=null?this._config.grid_min:-5e3,h=this._config.grid_max!=null?this._config.grid_max:5e3,d=this._config.load_max!=null?this._config.load_max:5e3,g=this._config.production_max!=null?this._config.production_max:5e3,w=this._config.battery_min!=null?this._config.battery_min:-5e3,M=this._config.battery_max!=null?this._config.battery_max:5e3;if(this.querySelector(".energy-flow-svg")){const u=this._meters.get("production"),m=this._meters.get("battery"),T=this._meters.get("grid"),y=this._meters.get("load");u&&(u.value=s),m&&(m.invertView=this._config.invert_battery_view??!1,m.value=a),T&&(T.value=o),y&&(y.value=r)}else{this._iconsExtracted=!1;const u=(I,b)=>{this._fireEvent.call(this,I,b)},m=new O("production",s,0,g,!1,this._getDisplayName("production_name","production_entity","Production"),this._getIcon("production_icon","production_entity","mdi:solar-power"),"WATTS",!1,!1,this._config.production_tap_action,this._config.production_entity,u),T=new O("battery",a,w,M,!0,this._getDisplayName("battery_name","battery_entity","Battery"),this._getIcon("battery_icon","battery_entity","mdi:battery"),"WATTS",this._config.invert_battery_view,this._config.show_plus,this._config.battery_tap_action,this._config.battery_entity,u),y=new O("grid",o,l,h,!0,this._getDisplayName("grid_name","grid_entity","Grid"),this._getIcon("grid_icon","grid_entity","mdi:transmission-tower"),"WATTS",!1,!1,this._config.grid_tap_action,this._config.grid_entity,u),E=new O("load",r,0,d,!1,this._getDisplayName("load_name","load_entity","Load"),this._getIcon("load_icon","load_entity","mdi:home-lightning-bolt"),"WATTS",!1,!1,this._config.load_tap_action,this._config.load_entity,u);this.innerHTML=`
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
      `,requestAnimationFrame(()=>{const I=this.querySelector("#production-meter"),b=this.querySelector("#battery-meter"),_=this.querySelector("#grid-meter"),$=this.querySelector("#load-meter");I&&I.appendChild(m.createElement()),b&&b.appendChild(T.createElement()),_&&_.appendChild(y.createElement()),$&&$.appendChild(E.createElement()),this._meters.set("production",m),this._meters.set("battery",T),this._meters.set("grid",y),this._meters.set("load",E),m.startAnimation(),T.startAnimation(),y.startAnimation(),E.startAnimation(),m.updateDimming(),T.updateDimming(),y.updateDimming(),E.updateDimming()})}this._lastValues={grid:o,production:s,load:r,battery:a},this._animationFrameId||this._startFlowAnimationLoop(),this._iconsExtracted||requestAnimationFrame(()=>{this._extractIconPaths()}),requestAnimationFrame(()=>{requestAnimationFrame(()=>{this._drawFlows(o,s,r,a)})})}_getEntityState(e){return this._hass?.states?.[e]}_getDisplayName(e,t,i){if(this._config?.[e])return String(this._config[e]);const n=this._config?.[t];if(n){const o=this._getEntityState(n);if(o?.attributes?.friendly_name)return o.attributes.friendly_name}return i}_getIcon(e,t,i){if(this._config?.[e])return String(this._config[e]);const n=this._config?.[t];if(n){const o=this._getEntityState(n);if(o?.attributes?.icon)return o.attributes.icon}return i}_handleAction(e,t){if(!this._hass)return;const i=e||{action:"more-info"};switch(i.action||"more-info"){case"more-info":const o=i.entity||t;this._fireEvent("hass-more-info",{entityId:o});break;case"navigate":i.navigation_path&&(history.pushState(null,"",i.navigation_path),this._fireEvent("location-changed",{replace:i.navigation_replace||!1}));break;case"url":i.url_path&&window.open(i.url_path);break;case"toggle":this._hass.callService("homeassistant","toggle",{entity_id:t});break;case"perform-action":if(i.perform_action){const[r,s]=i.perform_action.split(".");this._hass.callService(r,s,i.data||{},i.target)}break;case"assist":this._fireEvent("show-dialog",{dialogTag:"ha-voice-command-dialog",dialogParams:{pipeline_id:i.pipeline_id||"last_used",start_listening:i.start_listening}});break}}_fireEvent(e,t={}){if(e==="call-service"&&this._hass){this._hass.callService(t.domain,t.service,t.service_data||{},t.target);return}const i=new CustomEvent(e,{detail:t,bubbles:!0,composed:!0});this.dispatchEvent(i)}_createMeterDefs(){return`
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
    `}_calculateFlows(e,t,i,n){return Q({grid:e,production:t,load:i,battery:n})}_drawFlows(e,t,i,n){const o=this.querySelector("#flow-layer");if(!o)return;const r=this._meterPositions.production,s=this._meterPositions.battery,a=this._meterPositions.grid,c=this._meterPositions.load,{productionToLoad:l,productionToBattery:h,productionToGrid:d,gridToLoad:g,gridToBattery:w,batteryToLoad:M}=this._calculateFlows(e,t,i,n),u=0;[{id:"production-to-load",from:r,to:c,power:l,color:"#4caf50",threshold:u},{id:"production-to-battery",from:r,to:s,power:h,color:"#4caf50",threshold:u},{id:"battery-to-load",from:s,to:c,power:M,color:"#2196f3",threshold:10},{id:"grid-to-load",from:a,to:c,power:g,color:"#f44336",threshold:u},{id:"grid-to-battery",from:a,to:s,power:w,color:"#f44336",threshold:u},{id:"production-to-grid",from:r,to:a,power:d,color:"#ffeb3b",threshold:u}].forEach(y=>{y.power>y.threshold?this._updateOrCreateFlow(o,y.id,y.from,y.to,y.power,y.color):this._fadeOutFlow(o,y.id)})}_startFlowAnimationLoop(){const e=t=>{this._lastAnimationTime||(this._lastAnimationTime=t);const i=t-(this._lastAnimationTime??t);this._lastAnimationTime=t,this._flowDots.forEach((n,o)=>{const r=this.querySelector(`#path-${o}`);r&&n&&n.length>0&&n.forEach((s,a)=>{const c=this.querySelector(`#dot-${o}-${a}`);if(c&&s.velocity>0){s.progress+=s.velocity*i/1e3,s.progress>=1&&(s.progress=s.progress%1);try{const l=r.getTotalLength();if(l>0){const h=r.getPointAtLength(s.progress*l);c.setAttribute("cx",String(h.x)),c.setAttribute("cy",String(h.y))}}catch{}}})}),this._animationFrameId=requestAnimationFrame(e)};this._animationFrameId=requestAnimationFrame(e)}_updateOrCreateFlow(e,t,i,n,o,r){let s=e.querySelector(`#${t}`),a;o<=100?a=.25:o<=200?a=.25+(o-100)/100*.75:a=1;const c=2,l=23.76,h=1e4;let d;if(o<=100)d=c;else{const p=Math.min((o-100)/(h-100),1)*(l-c);d=c+p}const g=2.5,w=3,M=g*(d/c),u=Math.max(M,w),m=document.createElementNS("http://www.w3.org/2000/svg","path"),T=(i.x+n.x)/2,y=(i.y+n.y)/2,E=`M ${i.x},${i.y} Q ${T},${y} ${n.x},${n.y}`;m.setAttribute("d",E);const I=m.getTotalLength(),$=40*(o/1e3)*this._speedMultiplier,V=I>0?$/I:0;if(s){const p=s.querySelector(`#glow-${t}`),f=s.querySelector(`#path-${t}`);if(p&&f){const A=(i.x+n.x)/2,v=(i.y+n.y)/2,k=`M ${i.x},${i.y} Q ${A},${v} ${n.x},${n.y}`;p.setAttribute("d",k),p.setAttribute("stroke-opacity",String(a*.5)),p.setAttribute("stroke-width",String(d*2)),f.setAttribute("d",k),f.setAttribute("stroke-opacity",String(a)),f.setAttribute("stroke-width",String(d))}const P=this._flowDots.get(t);P&&P.forEach((A,v)=>{const k=s.querySelector(`#dot-${t}-${v}`);k&&(k.setAttribute("r",String(u)),k.setAttribute("opacity",String(a)),k.setAttribute("fill",r)),A.velocity=V})}else{s=document.createElementNS("http://www.w3.org/2000/svg","g"),s.id=t,e.appendChild(s);const p=document.createElementNS("http://www.w3.org/2000/svg","path");p.setAttribute("d",E),p.setAttribute("class","flow-line"),p.setAttribute("stroke",r),p.setAttribute("stroke-opacity",String(a*.5)),p.setAttribute("stroke-width",String(d*2)),p.setAttribute("style","transition: stroke-opacity 0.5s ease-out, stroke-width 0.5s ease-out;"),p.id=`glow-${t}`,s.appendChild(p);const f=document.createElementNS("http://www.w3.org/2000/svg","path");f.setAttribute("d",E),f.setAttribute("class","flow-line"),f.setAttribute("stroke",r),f.setAttribute("stroke-opacity",String(a)),f.setAttribute("stroke-width",String(d)),f.setAttribute("style","transition: stroke-opacity 0.5s ease-out, stroke-width 0.5s ease-out;"),f.id=`path-${t}`,s.appendChild(f);const P=[];for(let A=0;A<this._dotsPerFlow;A++){const v=document.createElementNS("http://www.w3.org/2000/svg","circle");v.setAttribute("class","flow-dot"),v.setAttribute("id",`dot-${t}-${A}`),v.setAttribute("r",String(u)),v.setAttribute("fill",r),v.setAttribute("opacity",String(a)),v.setAttribute("style","transition: opacity 0.5s ease-out, r 0.5s ease-out;"),s.appendChild(v);const k=A/this._dotsPerFlow;P.push({progress:k,velocity:V})}this._flowDots.set(t,P)}}_removeFlow(e,t){const i=e.querySelector(`#${t}`);i&&i.remove(),this._flowDots.delete(t)}_fadeOutFlow(e,t){const i=e.querySelector(`#${t}`);if(!i)return;const n=i.querySelector(`#glow-${t}`),o=i.querySelector(`#path-${t}`);n&&n.setAttribute("stroke-opacity","0"),o&&o.setAttribute("stroke-opacity","0");const r=this._flowDots.get(t);r&&r.forEach((s,a)=>{const c=i.querySelector(`#dot-${t}-${a}`);c&&c.setAttribute("opacity","0")}),setTimeout(()=>{this._removeFlow(e,t)},500)}_extractIconPaths(){["production","battery","grid","load"].forEach(t=>{const i=this.querySelector(`#icon-source-${t}`),n=this.querySelector(`#icon-display-${t}`);if(!i||!n){console.warn(`Icon elements not found for ${t}`);return}const o=i.querySelector("div");if(!o){console.warn(`No div found in foreignObject for ${t}`);return}const r=o.querySelector("ha-icon");if(!r){console.warn(`No ha-icon found for ${t}`);return}const s=r.getAttribute("icon");if(!s){console.warn(`No icon attribute for ${t}`);return}if(this._iconCache.has(s)){const c=this._iconCache.get(s);this._renderIconPath(n,c),i.style.display="none";return}const a=(c=0,l=10)=>{const h=c*100,d=window.setTimeout(()=>{this._iconExtractionTimeouts.delete(d);try{const g=r.shadowRoot;if(!g){c<l&&a(c+1,l);return}let w=g.querySelector("svg");if(!w){const m=g.querySelector("ha-svg-icon");m&&m.shadowRoot&&(w=m.shadowRoot.querySelector("svg"))}if(!w){c<l&&a(c+1,l);return}const M=w.querySelector("path");if(!M){c<l&&a(c+1,l);return}const u=M.getAttribute("d");u?(this._iconCache.set(s,u),this._renderIconPath(n,u),i.style.display="none"):c<l&&a(c+1,l)}catch(g){console.error(`Failed to extract icon path for ${s} (attempt ${c+1}):`,g),c<l&&a(c+1,l)}},h);this._iconExtractionTimeouts.add(d)};a()}),this._iconsExtracted=!0}_renderIconPath(e,t){if(e.innerHTML="",t){const i=document.createElementNS("http://www.w3.org/2000/svg","path");i.setAttribute("d",t),i.setAttribute("fill","rgb(160, 160, 160)"),i.setAttribute("transform","scale(1)"),e.appendChild(i)}else{const i=document.createElementNS("http://www.w3.org/2000/svg","circle");i.setAttribute("cx","12"),i.setAttribute("cy","12"),i.setAttribute("r","8"),i.setAttribute("fill","rgb(160, 160, 160)"),e.appendChild(i)}}_drawFlow(e,t,i,n,o){const r=document.createElementNS("http://www.w3.org/2000/svg","path"),s=(t.x+i.x)/2,a=(t.y+i.y)/2,c=`M ${t.x},${t.y} Q ${s},${a} ${i.x},${i.y}`;r.setAttribute("d",c),r.setAttribute("class",`flow-line ${o?"flow-positive":"flow-negative"}`),r.setAttribute("id",`path-${Math.random()}`),e.appendChild(r);const l=Math.min(Math.max(Math.floor(n/1e3),1),3);for(let h=0;h<l;h++){const d=document.createElementNS("http://www.w3.org/2000/svg","circle");d.setAttribute("class",`flow-dot ${o?"flow-positive":"flow-negative"}`),d.setAttribute("r","3"),d.setAttribute("fill",o?"var(--success-color, #4caf50)":"var(--error-color, #f44336)");const g=document.createElementNS("http://www.w3.org/2000/svg","animateMotion");g.setAttribute("dur","2s"),g.setAttribute("repeatCount","indefinite"),g.setAttribute("begin",`${h*.6}s`);const w=document.createElementNS("http://www.w3.org/2000/svg","mpath");w.setAttributeNS("http://www.w3.org/1999/xlink","href",`#${r.id}`),g.appendChild(w),d.appendChild(g),e.appendChild(d)}}_renderCompactView(e,t,i,n,o){const r=this._calculateFlows(e,i,t,n),s=r.productionToLoad,a=r.batteryToLoad,c=r.gridToLoad,l=t||1,h=s/l*100,d=a/l*100,g=c/l*100,w=h+d+g;let M=h,u=d,m=g;if(w>0){const x=100/w;M=h*x,u=d*x,m=g*x}const T="#256028",y="#104b79",E="#7a211b",I="#7a6b1b";let b=null;if(o==="compact-battery"&&this._config?.battery_soc_entity){const x=this._getEntityState(this._config.battery_soc_entity);b=parseFloat(x?.state??"0")||0}let _=0,$=0,V=0,p=0,f=0,P=0,A=0,v=0,k=0;if(o==="compact-battery"){if(n<0){const C=Math.abs(n)||1;p=r.gridToBattery,P=r.productionToBattery,_=r.gridToBattery/C*100,V=r.productionToBattery/C*100;const q=_+V;if(q>0){const W=100/q;A=_*W,k=V*W}}else if(n>0){const x=n||1,C=n-r.batteryToLoad;f=r.batteryToLoad,p=C,$=r.batteryToLoad/x*100,_=C/x*100;const q=$+_;if(q>0){const W=100/q;v=$*W,A=_*W}}}(!this.querySelector(".compact-view")||this._lastViewMode!==o)&&(this.innerHTML=`
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
                <div id="grid-segment" class="bar-segment" style="background: ${E}; width: ${g}%;">
                  <div class="bar-segment-content">
                    <ha-icon class="bar-segment-icon" icon="${this._getIcon("grid_icon","grid_entity","mdi:transmission-tower")}"></ha-icon>
                    <span class="bar-segment-label"></span>
                  </div>
                </div>
                <div id="battery-segment" class="bar-segment" style="background: ${y}; width: ${d}%;">
                  <div class="bar-segment-content">
                    <ha-icon class="bar-segment-icon" icon="${this._getIcon("battery_icon","battery_entity","mdi:battery")}"></ha-icon>
                    <span class="bar-segment-label"></span>
                  </div>
                </div>
                <div id="production-segment" class="bar-segment" style="background: ${T}; width: ${h}%;">
                  <div class="bar-segment-content">
                    <ha-icon class="bar-segment-icon" icon="${this._getIcon("production_icon","production_entity","mdi:solar-power")}"></ha-icon>
                    <span class="bar-segment-label"></span>
                  </div>
                </div>
              </div>
              <div class="row-value">
                <ha-icon class="row-icon" icon="${this._getIcon("load_icon","load_entity","mdi:home-lightning-bolt")}"></ha-icon>
                <div class="row-text">
                  <span id="load-value-text">${Math.round(t)}</span><span class="row-unit">W</span>
                </div>
              </div>
            </div>
            ${o==="compact-battery"?`
            <!-- Battery Row -->
            <div class="compact-row" id="battery-row">
              <div class="row-value" id="battery-soc-left" style="display: none;">
                <ha-icon class="row-icon" icon="${this._getIcon("battery_icon","battery_entity","mdi:battery")}"></ha-icon>
                <div class="row-text">
                  <span id="battery-soc-text-left">${b!==null?b.toFixed(1):"--"}</span><span class="row-unit">%</span>
                </div>
              </div>
              <div class="bar-container">
                <!-- Color order: red, yellow, blue, green (left to right) -->
                <div id="battery-grid-segment" class="bar-segment" style="background: ${n<0?E:I}; width: ${_}%;">
                  <div class="bar-segment-content">
                    <ha-icon class="bar-segment-icon" icon="${this._getIcon("grid_icon","grid_entity","mdi:transmission-tower")}"></ha-icon>
                    <span class="bar-segment-label"></span>
                  </div>
                </div>
                <div id="battery-load-segment" class="bar-segment" style="background: ${y}; width: ${$}%;">
                  <div class="bar-segment-content">
                    <ha-icon class="bar-segment-icon" icon="${this._getIcon("load_icon","load_entity","mdi:home")}"></ha-icon>
                    <span class="bar-segment-label"></span>
                  </div>
                </div>
                <div id="battery-production-segment" class="bar-segment" style="background: ${T}; width: ${V}%;">
                  <div class="bar-segment-content">
                    <ha-icon class="bar-segment-icon" icon="${this._getIcon("production_icon","production_entity","mdi:solar-power")}"></ha-icon>
                    <span class="bar-segment-label"></span>
                  </div>
                </div>
              </div>
              <div class="row-value" id="battery-soc-right">
                <ha-icon class="row-icon" icon="${this._getIcon("battery_icon","battery_entity","mdi:battery")}"></ha-icon>
                <div class="row-text">
                  <span id="battery-soc-text-right">${b!==null?b.toFixed(1):"--"}</span><span class="row-unit">%</span>
                </div>
              </div>
            </div>
            `:""}
          </div>
        </ha-card>
      `,this._lastViewMode=o,requestAnimationFrame(()=>{if(this._config){const x=this.querySelector("#production-segment"),C=this.querySelector("#battery-segment"),q=this.querySelector("#grid-segment"),S=this.querySelectorAll(".row-value")[0];if(x&&x.addEventListener("click",()=>{this._handleAction(this._config.production_tap_action,this._config.production_entity)}),C&&C.addEventListener("click",()=>{this._handleAction(this._config.battery_tap_action,this._config.battery_entity)}),q&&q.addEventListener("click",()=>{this._handleAction(this._config.grid_tap_action,this._config.grid_entity)}),S&&S.addEventListener("click",()=>{this._handleAction(this._config.load_tap_action,this._config.load_entity)}),o==="compact-battery"){const L=this.querySelector("#battery-production-segment"),F=this.querySelector("#battery-load-segment"),B=this.querySelector("#battery-grid-segment"),D=this.querySelector("#battery-soc-left"),X=this.querySelector("#battery-soc-right");L&&L.addEventListener("click",()=>{this._handleAction(this._config.production_tap_action,this._config.production_entity)}),F&&F.addEventListener("click",()=>{this._handleAction(this._config.load_tap_action,this._config.load_entity)}),B&&B.addEventListener("click",()=>{this._handleAction(this._config.grid_tap_action,this._config.grid_entity)}),D&&D.addEventListener("click",()=>{this._handleAction(this._config.battery_tap_action,this._config.battery_entity)}),X&&X.addEventListener("click",()=>{this._handleAction(this._config.battery_tap_action,this._config.battery_entity)})}}})),requestAnimationFrame(()=>{const x=this.querySelector("#production-segment"),C=this.querySelector("#battery-segment"),q=this.querySelector("#grid-segment"),W=this.querySelector("#load-value-text");if(x){x.style.width=`${M}%`;const S=x.querySelector(".bar-segment-label");S&&s>0&&(S.textContent=`${Math.round(h)}%`);const L=this.querySelector(".bar-container"),F=M/100*(L?.clientWidth||0);this._updateSegmentVisibility(x,F,s>0)}if(C){C.style.width=`${u}%`;const S=C.querySelector(".bar-segment-label");S&&a>0&&(S.textContent=`${Math.round(d)}%`);const L=this.querySelector(".bar-container"),F=u/100*(L?.clientWidth||0);this._updateSegmentVisibility(C,F,a>0)}if(q){q.style.width=`${m}%`;const S=q.querySelector(".bar-segment-label");S&&c>0&&(S.textContent=`${Math.round(g)}%`);const L=this.querySelector(".bar-container"),F=m/100*(L?.clientWidth||0);this._updateSegmentVisibility(q,F,c>0)}if(W&&(W.textContent=String(Math.round(t))),o==="compact-battery"){const S=this.querySelector("#battery-grid-segment"),L=this.querySelector("#battery-load-segment"),F=this.querySelector("#battery-production-segment"),B=this.querySelector("#battery-soc-left"),D=this.querySelector("#battery-soc-right"),X=this.querySelector("#battery-soc-text-left"),z=this.querySelector("#battery-soc-text-right"),G=this.querySelectorAll(".bar-container")[1];let H=!1;if(n<0?(H=!0,B&&(B.style.display="none"),D&&(D.style.display="flex"),z&&b!==null&&(z.textContent=b.toFixed(1))):n>0?(H=!1,B&&(B.style.display="flex"),D&&(D.style.display="none"),X&&b!==null&&(X.textContent=b.toFixed(1))):(B&&(B.style.display="none"),D&&(D.style.display="flex"),z&&b!==null&&(z.textContent=b.toFixed(1))),S){const N=H?"#7a211b":"#7a6b1b";S.style.width=`${A}%`,S.style.background=N;const R=S.querySelector(".bar-segment-label");R&&p>0&&(R.textContent=`${Math.round(p)}W`);const Z=A/100*(G?.offsetWidth||0);this._updateSegmentVisibility(S,Z,p>0)}if(L){L.style.width=`${v}%`;const N=L.querySelector(".bar-segment-label");N&&f>0&&(N.textContent=`${Math.round(f)}W`);const R=v/100*(G?.offsetWidth||0);this._updateSegmentVisibility(L,R,f>0)}if(F){F.style.width=`${k}%`;const N=F.querySelector(".bar-segment-label");N&&P>0&&(N.textContent=`${Math.round(P)}W`);const R=k/100*(G?.offsetWidth||0);this._updateSegmentVisibility(F,R,P>0)}}})}_updateSegmentVisibility(e,t,i){if(!e||!i){e?.setAttribute("data-width-px","");return}t>=80?e.setAttribute("data-width-px","show-label"):t>=40?e.setAttribute("data-width-px","show-icon"):e.setAttribute("data-width-px","")}}customElements.define("energy-flow-card",U),window.customCards=window.customCards||[],window.customCards.push({type:"energy-flow-card",name:"Energy Flow Card",description:"A test energy-flow card."})})();

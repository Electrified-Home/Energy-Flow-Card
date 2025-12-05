(function(){"use strict";class V{constructor(e,t,i,n,o,r,s,a,c=!1,l=!1,g,h,u){this.id=e,this._value=t,this.min=i,this.max=n,this.bidirectional=o,this.label=r,this.icon=s,this.units=a,this._invertView=c,this.showPlus=l,this.tapAction=g,this.entityId=h,this.fireEventCallback=u,this.element=null,this.radius=50,this.boxWidth=120,this.boxHeight=135,this.boxRadius=16,this.centerX=this.boxWidth/2,this.centerY=this.radius+25,this.offsetX=-this.centerX,this.offsetY=-this.centerY,this.needleState={target:0,current:0,ghost:0},this._lastAnimationTime=null,this._animationFrameId=null,this._updateNeedleAngle()}get value(){return this._value}set value(e){if(this._value!==e&&(this._value=e,this._updateNeedleAngle(),this.element)){const t=this.element.querySelector(`#value-${this.id}`);t&&(t.textContent=this._formatValueText()),this.updateDimming()}}get invertView(){return this._invertView}set invertView(e){if(this._invertView!==e&&(this._invertView=e,this._updateNeedleAngle(),this.element)){const t=this.element.querySelector(`#value-${this.id}`);t&&(t.textContent=this._formatValueText())}}get displayValue(){return this._invertView?-this._value:this._value}_formatValueText(){const e=this.displayValue,t=e.toFixed(0);return e<0?t+" ":e>0&&this.showPlus?"+"+t+" ":t}_updateNeedleAngle(){let e,t;const i=this.displayValue;if(this.bidirectional){const n=this.max-this.min;e=Math.min(Math.max((i-this.min)/n,0),1),t=180-e*180}else e=Math.min(Math.max(i/this.max,0),1),t=180-e*180;this.needleState.target=t}updateDimming(){if(!this.element)return;const e=this.element.querySelector(`#dimmer-${this.id}`);if(e){const t=Math.abs(this.value)<.5;e.setAttribute("opacity",t?"0.3":"0")}}startAnimation(){if(this._animationFrameId)return;const e=t=>{this._lastAnimationTime||(this._lastAnimationTime=t);const i=t-this._lastAnimationTime;if(this._lastAnimationTime=t,!this.element){this._animationFrameId=null;return}const n=this.radius-5,o=Math.min(i/150,1);this.needleState.current+=(this.needleState.target-this.needleState.current)*o;const r=Math.min(i/400,1);this.needleState.ghost+=(this.needleState.current-this.needleState.ghost)*r;const s=10;this.needleState.ghost<this.needleState.current-s?this.needleState.ghost=this.needleState.current-s:this.needleState.ghost>this.needleState.current+s&&(this.needleState.ghost=this.needleState.current+s);const a=this.element.querySelector(`#needle-${this.id}`);if(a){const l=this.needleState.current*Math.PI/180,g=this.centerX+n*Math.cos(l),h=this.centerY-n*Math.sin(l);a.setAttribute("x2",String(g)),a.setAttribute("y2",String(h))}const c=this.element.querySelector(`#ghost-needle-${this.id}`);if(c){const l=this.needleState.ghost*Math.PI/180,g=this.centerX+n*Math.cos(l),h=this.centerY-n*Math.sin(l);c.setAttribute("x2",String(g)),c.setAttribute("y2",String(h))}this._animationFrameId=requestAnimationFrame(e)};this._animationFrameId=requestAnimationFrame(e)}stopAnimation(){this._animationFrameId&&(cancelAnimationFrame(this._animationFrameId),this._animationFrameId=null,this._lastAnimationTime=null)}_handleTapAction(){if(!this.fireEventCallback)return;const e=this.tapAction||{action:"more-info"};switch(e.action||"more-info"){case"more-info":const i=e.entity||this.entityId;i&&this.fireEventCallback("hass-more-info",{entityId:i});break;case"navigate":e.navigation_path&&(history.pushState(null,"",e.navigation_path),this.fireEventCallback("location-changed",{replace:e.navigation_replace||!1}));break;case"url":e.url_path&&window.open(e.url_path);break;case"toggle":this.entityId&&this.fireEventCallback("call-service",{domain:"homeassistant",service:"toggle",service_data:{entity_id:this.entityId}});break;case"perform-action":if(e.perform_action){const[n,o]=e.perform_action.split(".");this.fireEventCallback("call-service",{domain:n,service:o,service_data:e.data||{},target:e.target})}break;case"assist":this.fireEventCallback("show-dialog",{dialogTag:"ha-voice-command-dialog",dialogParams:{pipeline_id:e.pipeline_id||"last_used",start_listening:e.start_listening}});break}}createElement(){const e=this.displayValue;let t,i;if(this.bidirectional){const _=this.max-this.min;t=Math.min(Math.max((e-this.min)/_,0),1),i=180-t*180}else t=Math.min(Math.max(e/this.max,0),1),i=180-t*180;this.needleState.target=i,this.needleState.current=i,this.needleState.ghost=i;const o=(this.bidirectional?[this.min,0,this.max]:[0,this.max/2,this.max]).map(_=>{const d=(180-(this.bidirectional?(_-this.min)/(this.max-this.min):_/this.max)*180)*Math.PI/180,x=this.radius,f=this.radius-8,w=this.centerX+x*Math.cos(d),S=this.centerY-x*Math.sin(d),P=this.centerX+f*Math.cos(d),I=this.centerY-f*Math.sin(d);return`<line x1="${w}" y1="${S}" x2="${P}" y2="${I}" stroke="rgb(160, 160, 160)" stroke-width="2" />`}).join(""),a=(180-(this.bidirectional?(0-this.min)/(this.max-this.min):0)*180)*Math.PI/180,c=this.centerX,l=this.centerY,g=this.centerX+this.radius*Math.cos(a),h=this.centerY-this.radius*Math.sin(a),u=`<line x1="${c}" y1="${l}" x2="${g}" y2="${h}" stroke="rgb(100, 100, 100)" stroke-width="2" />`,A=i*Math.PI/180,T=this.radius-5,m=this.centerX+T*Math.cos(A),v=this.centerY-T*Math.sin(A),p=this.centerY+5,b=this.centerY+this.radius*.5,M=this.centerY+this.radius*.7,k=`
      <g transform="translate(${this.offsetX}, ${this.offsetY})">
        <defs>
          <clipPath id="clip-${this.id}-local">
            <rect x="0" y="0" width="${this.boxWidth}" height="${p+2}" />
          </clipPath>
        </defs>
        
        <rect x="0" y="0" width="${this.boxWidth}" height="${this.boxHeight}" rx="${this.boxRadius}" ry="${this.boxRadius}" fill="rgb(40, 40, 40)" filter="url(#drop-shadow)" />
        
        <g clip-path="url(#clip-${this.id}-local)">
          <circle cx="${this.centerX}" cy="${this.centerY}" r="${this.radius}" fill="rgb(70, 70, 70)" />
          ${u}
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
        
        <line id="ghost-needle-${this.id}" x1="${this.centerX}" y1="${this.centerY}" x2="${m}" y2="${v}" stroke="rgb(255, 255, 255)" stroke-width="4" stroke-linecap="round" opacity="0.3" />
        
        <line id="needle-${this.id}" x1="${this.centerX}" y1="${this.centerY}" x2="${m}" y2="${v}" stroke="rgb(255, 255, 255)" stroke-width="4" stroke-linecap="round" />
        
        <circle cx="${this.centerX}" cy="${this.centerY}" r="5" fill="rgb(255, 255, 255)" />
        
        <text id="value-${this.id}" x="${this.centerX}" y="${b}" text-anchor="middle" font-size="16" fill="rgb(255, 255, 255)" font-weight="600">${this._formatValueText()}</text>
        
        <text x="${this.centerX}" y="${M}" text-anchor="middle" font-size="8" fill="rgb(160, 160, 160)" font-weight="400" letter-spacing="0.5">${this.units}</text>
        
        <rect id="dimmer-${this.id}" x="0" y="0" width="${this.boxWidth}" height="${this.boxHeight}" rx="${this.boxRadius}" ry="${this.boxRadius}" fill="black" opacity="0" pointer-events="none" style="transition: opacity 0.8s ease-in-out;" />
      </g>
    `,L=document.createElementNS("http://www.w3.org/2000/svg","svg");L.innerHTML=k;const y=L.firstElementChild;return this.element=y,(!this.tapAction||this.tapAction.action!=="none")&&(y.style.cursor="pointer",y.addEventListener("click",_=>{this._handleTapAction(),_.stopPropagation()}),y.addEventListener("mouseenter",()=>{y.style.filter="brightness(1.1)"}),y.addEventListener("mouseleave",()=>{y.style.filter=""})),y}}function z(F){const e=Math.max(0,F.production),t=F.grid,i=F.battery,n=Math.max(0,F.load),o={productionToLoad:0,productionToBattery:0,productionToGrid:0,gridToLoad:0,gridToBattery:0,batteryToLoad:0};let r=e,s=n;if(r>0&&s>0&&(o.productionToLoad=Math.min(r,s),r-=o.productionToLoad,s-=o.productionToLoad),i<0&&r>0&&(o.productionToBattery=Math.min(r,Math.abs(i)),r-=o.productionToBattery),i>0&&s>0&&(o.batteryToLoad=Math.min(i,s),s-=o.batteryToLoad),s>0&&t>0&&(o.gridToLoad=Math.min(t,s),s-=o.gridToLoad),i<0&&t>10){const a=Math.abs(i)-o.productionToBattery;a>1&&(o.gridToBattery=Math.min(t-o.gridToLoad,a))}return t<-10&&(o.productionToGrid=Math.abs(t)),o}class G extends HTMLElement{constructor(){super(),this._resizeObserver=null,this._animationFrameId=null,this._flowDots=new Map,this._lastAnimationTime=null,this._iconCache=new Map,this._iconsExtracted=!1,this._iconExtractionTimeouts=new Set,this._meters=new Map,this._speedMultiplier=.8,this._dotsPerFlow=3;const e=500,t=470,i=5,n=3;this._meterPositions={production:{x:60+i,y:80+n},battery:{x:130+i,y:240+n},grid:{x:60+i,y:400+n},load:{x:360+i,y:240+n}},this._canvasWidth=e,this._canvasHeight=t}static getStubConfig(){return{}}static getConfigForm(){return{schema:[{name:"view_mode",label:"View Mode",selector:{select:{options:[{value:"default",label:"Default"},{value:"compact",label:"Compact Bar"},{value:"compact-battery",label:"Compact with Battery"}]}}},{name:"grid_entity",label:"Grid",required:!0,selector:{entity:{domain:"sensor",device_class:"power"}}},{name:"grid_name",selector:{entity_name:{}},context:{entity:"grid_entity"}},{name:"grid_icon",selector:{icon:{}},context:{icon_entity:"grid_entity"}},{name:"grid_min",label:"Grid Min (W)",selector:{number:{mode:"box"}}},{name:"grid_max",label:"Grid Max (W)",selector:{number:{mode:"box"}}},{name:"grid_tap_action",label:"Grid Tap Action",selector:{"ui-action":{}}},{name:"load_entity",label:"Load",required:!0,selector:{entity:{domain:"sensor",device_class:"power"}}},{name:"load_name",selector:{entity_name:{}},context:{entity:"load_entity"}},{name:"load_icon",selector:{icon:{}},context:{icon_entity:"load_entity"}},{name:"load_max",label:"Load Max (W)",selector:{number:{mode:"box"}}},{name:"load_tap_action",label:"Load Tap Action",selector:{"ui-action":{}}},{name:"production_entity",label:"Production",required:!0,selector:{entity:{domain:"sensor",device_class:"power"}}},{name:"production_name",selector:{entity_name:{}},context:{entity:"production_entity"}},{name:"production_icon",selector:{icon:{}},context:{icon_entity:"production_entity"}},{name:"production_max",label:"Production Max (W)",selector:{number:{mode:"box"}}},{name:"production_tap_action",label:"Production Tap Action",selector:{"ui-action":{}}},{name:"battery_entity",label:"Battery",required:!0,selector:{entity:{domain:"sensor",device_class:"power"}}},{name:"battery_name",selector:{entity_name:{}},context:{entity:"battery_entity"}},{name:"battery_icon",selector:{icon:{}},context:{icon_entity:"battery_entity"}},{name:"battery_min",label:"Battery Min (W)",selector:{number:{mode:"box"}}},{name:"battery_max",label:"Battery Max (W)",selector:{number:{mode:"box"}}},{name:"battery_tap_action",label:"Battery Tap Action",selector:{"ui-action":{}}},{name:"battery_soc_entity",label:"Battery SOC (%) Entity",selector:{entity:{domain:"sensor"}}},{name:"invert_battery_data",label:"Invert Battery Data",selector:{boolean:{}}},{name:"invert_battery_view",label:"Invert Battery View",selector:{boolean:{}}},{name:"show_plus",label:"Show + Sign",selector:{boolean:{}}}]}}connectedCallback(){this._resizeObserver=new ResizeObserver(()=>{if(this._lastValues){const e=this._lastValues;requestAnimationFrame(()=>{this._drawFlows(e.grid,e.production,e.load,e.battery)})}}),this.parentElement&&this._resizeObserver.observe(this.parentElement),this._resizeObserver.observe(this)}disconnectedCallback(){this._resizeObserver&&(this._resizeObserver.disconnect(),this._resizeObserver=null),this._meters.forEach(e=>e.stopAnimation()),this._animationFrameId&&(cancelAnimationFrame(this._animationFrameId),this._animationFrameId=null)}setConfig(e){this._config=e,this._render()}set hass(e){this._hass=e,this._render()}_render(){if(!this._config||!this._hass)return;const e=this._getEntityState(this._config.grid_entity),t=this._getEntityState(this._config.load_entity),i=this._getEntityState(this._config.production_entity),n=this._getEntityState(this._config.battery_entity),o=parseFloat(e?.state??"0")||0,r=parseFloat(t?.state??"0")||0,s=parseFloat(i?.state??"0")||0;let a=parseFloat(n?.state??"0")||0;this._config.invert_battery_data&&(a=-a);const c=this._config.view_mode||"default";if(c==="compact"||c==="compact-battery"){this._renderCompactView(o,r,s,a,c);return}const l=this._config.grid_min!=null?this._config.grid_min:-5e3,g=this._config.grid_max!=null?this._config.grid_max:5e3,h=this._config.load_max!=null?this._config.load_max:5e3,u=this._config.production_max!=null?this._config.production_max:5e3,A=this._config.battery_min!=null?this._config.battery_min:-5e3,T=this._config.battery_max!=null?this._config.battery_max:5e3;if(this.querySelector(".energy-flow-svg")){const m=this._meters.get("production"),v=this._meters.get("battery"),p=this._meters.get("grid"),b=this._meters.get("load");m&&(m.value=s),v&&(v.invertView=this._config.invert_battery_view??!1,v.value=a),p&&(p.value=o),b&&(b.value=r)}else{this._iconsExtracted=!1;const m=(k,L)=>{this._fireEvent.call(this,k,L)},v=new V("production",s,0,u,!1,this._getDisplayName("production_name","production_entity","Production"),this._getIcon("production_icon","production_entity","mdi:solar-power"),"WATTS",!1,!1,this._config.production_tap_action,this._config.production_entity,m),p=new V("battery",a,A,T,!0,this._getDisplayName("battery_name","battery_entity","Battery"),this._getIcon("battery_icon","battery_entity","mdi:battery"),"WATTS",this._config.invert_battery_view,this._config.show_plus,this._config.battery_tap_action,this._config.battery_entity,m),b=new V("grid",o,l,g,!0,this._getDisplayName("grid_name","grid_entity","Grid"),this._getIcon("grid_icon","grid_entity","mdi:transmission-tower"),"WATTS",!1,!1,this._config.grid_tap_action,this._config.grid_entity,m),M=new V("load",r,0,h,!1,this._getDisplayName("load_name","load_entity","Load"),this._getIcon("load_icon","load_entity","mdi:home-lightning-bolt"),"WATTS",!1,!1,this._config.load_tap_action,this._config.load_entity,m);this.innerHTML=`
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
      `,requestAnimationFrame(()=>{const k=this.querySelector("#production-meter"),L=this.querySelector("#battery-meter"),y=this.querySelector("#grid-meter"),_=this.querySelector("#load-meter");k&&k.appendChild(v.createElement()),L&&L.appendChild(p.createElement()),y&&y.appendChild(b.createElement()),_&&_.appendChild(M.createElement()),this._meters.set("production",v),this._meters.set("battery",p),this._meters.set("grid",b),this._meters.set("load",M),v.startAnimation(),p.startAnimation(),b.startAnimation(),M.startAnimation(),v.updateDimming(),p.updateDimming(),b.updateDimming(),M.updateDimming()})}this._lastValues={grid:o,production:s,load:r,battery:a},this._animationFrameId||this._startFlowAnimationLoop(),this._iconsExtracted||requestAnimationFrame(()=>{this._extractIconPaths()}),requestAnimationFrame(()=>{requestAnimationFrame(()=>{this._drawFlows(o,s,r,a)})})}_getEntityState(e){return this._hass?.states?.[e]}_getDisplayName(e,t,i){if(this._config?.[e])return String(this._config[e]);const n=this._config?.[t];if(n){const o=this._getEntityState(n);if(o?.attributes?.friendly_name)return o.attributes.friendly_name}return i}_getIcon(e,t,i){if(this._config?.[e])return String(this._config[e]);const n=this._config?.[t];if(n){const o=this._getEntityState(n);if(o?.attributes?.icon)return o.attributes.icon}return i}_handleAction(e,t){if(!this._hass)return;const i=e||{action:"more-info"};switch(i.action||"more-info"){case"more-info":const o=i.entity||t;this._fireEvent("hass-more-info",{entityId:o});break;case"navigate":i.navigation_path&&(history.pushState(null,"",i.navigation_path),this._fireEvent("location-changed",{replace:i.navigation_replace||!1}));break;case"url":i.url_path&&window.open(i.url_path);break;case"toggle":this._hass.callService("homeassistant","toggle",{entity_id:t});break;case"perform-action":if(i.perform_action){const[r,s]=i.perform_action.split(".");this._hass.callService(r,s,i.data||{},i.target)}break;case"assist":this._fireEvent("show-dialog",{dialogTag:"ha-voice-command-dialog",dialogParams:{pipeline_id:i.pipeline_id||"last_used",start_listening:i.start_listening}});break}}_fireEvent(e,t={}){if(e==="call-service"&&this._hass){this._hass.callService(t.domain,t.service,t.service_data||{},t.target);return}const i=new CustomEvent(e,{detail:t,bubbles:!0,composed:!0});this.dispatchEvent(i)}_createMeterDefs(){return`
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
    `}_calculateFlows(e,t,i,n){return z({grid:e,production:t,load:i,battery:n})}_drawFlows(e,t,i,n){const o=this.querySelector("#flow-layer");if(!o)return;const r=this._meterPositions.production,s=this._meterPositions.battery,a=this._meterPositions.grid,c=this._meterPositions.load,{productionToLoad:l,productionToBattery:g,productionToGrid:h,gridToLoad:u,gridToBattery:A,batteryToLoad:T}=this._calculateFlows(e,t,i,n),m=0;[{id:"production-to-load",from:r,to:c,power:l,color:"#4caf50",threshold:m},{id:"production-to-battery",from:r,to:s,power:g,color:"#4caf50",threshold:m},{id:"battery-to-load",from:s,to:c,power:T,color:"#2196f3",threshold:10},{id:"grid-to-load",from:a,to:c,power:u,color:"#f44336",threshold:m},{id:"grid-to-battery",from:a,to:s,power:A,color:"#f44336",threshold:m},{id:"production-to-grid",from:r,to:a,power:h,color:"#ffeb3b",threshold:m}].forEach(b=>{b.power>b.threshold?this._updateOrCreateFlow(o,b.id,b.from,b.to,b.power,b.color):this._fadeOutFlow(o,b.id)})}_startFlowAnimationLoop(){const e=t=>{this._lastAnimationTime||(this._lastAnimationTime=t);const i=t-(this._lastAnimationTime??t);this._lastAnimationTime=t,this._flowDots.forEach((n,o)=>{const r=this.querySelector(`#path-${o}`);r&&n&&n.length>0&&n.forEach((s,a)=>{const c=this.querySelector(`#dot-${o}-${a}`);if(c&&s.velocity>0){s.progress+=s.velocity*i/1e3,s.progress>=1&&(s.progress=s.progress%1);try{const l=r.getTotalLength();if(l>0){const g=r.getPointAtLength(s.progress*l);c.setAttribute("cx",String(g.x)),c.setAttribute("cy",String(g.y))}}catch{}}})}),this._animationFrameId=requestAnimationFrame(e)};this._animationFrameId=requestAnimationFrame(e)}_updateOrCreateFlow(e,t,i,n,o,r){let s=e.querySelector(`#${t}`),a;o<=100?a=.25:o<=200?a=.25+(o-100)/100*.75:a=1;const c=2,l=23.76,g=1e4;let h;if(o<=100)h=c;else{const $=Math.min((o-100)/(g-100),1)*(l-c);h=c+$}const u=2.5,A=3,T=u*(h/c),m=Math.max(T,A),v=document.createElementNS("http://www.w3.org/2000/svg","path"),p=(i.x+n.x)/2,b=(i.y+n.y)/2,M=`M ${i.x},${i.y} Q ${p},${b} ${n.x},${n.y}`;v.setAttribute("d",M);const k=v.getTotalLength(),_=40*(o/1e3)*this._speedMultiplier,C=k>0?_/k:0;if(s){const $=s.querySelector(`#glow-${t}`),d=s.querySelector(`#path-${t}`);if($&&d){const f=(i.x+n.x)/2,w=(i.y+n.y)/2,S=`M ${i.x},${i.y} Q ${f},${w} ${n.x},${n.y}`;$.setAttribute("d",S),$.setAttribute("stroke-opacity",String(a*.5)),$.setAttribute("stroke-width",String(h*2)),d.setAttribute("d",S),d.setAttribute("stroke-opacity",String(a)),d.setAttribute("stroke-width",String(h))}const x=this._flowDots.get(t);x&&x.forEach((f,w)=>{const S=s.querySelector(`#dot-${t}-${w}`);S&&(S.setAttribute("r",String(m)),S.setAttribute("opacity",String(a)),S.setAttribute("fill",r)),f.velocity=C})}else{s=document.createElementNS("http://www.w3.org/2000/svg","g"),s.id=t,e.appendChild(s);const $=document.createElementNS("http://www.w3.org/2000/svg","path");$.setAttribute("d",M),$.setAttribute("class","flow-line"),$.setAttribute("stroke",r),$.setAttribute("stroke-opacity",String(a*.5)),$.setAttribute("stroke-width",String(h*2)),$.setAttribute("style","transition: stroke-opacity 0.5s ease-out, stroke-width 0.5s ease-out;"),$.id=`glow-${t}`,s.appendChild($);const d=document.createElementNS("http://www.w3.org/2000/svg","path");d.setAttribute("d",M),d.setAttribute("class","flow-line"),d.setAttribute("stroke",r),d.setAttribute("stroke-opacity",String(a)),d.setAttribute("stroke-width",String(h)),d.setAttribute("style","transition: stroke-opacity 0.5s ease-out, stroke-width 0.5s ease-out;"),d.id=`path-${t}`,s.appendChild(d);const x=[];for(let f=0;f<this._dotsPerFlow;f++){const w=document.createElementNS("http://www.w3.org/2000/svg","circle");w.setAttribute("class","flow-dot"),w.setAttribute("id",`dot-${t}-${f}`),w.setAttribute("r",String(m)),w.setAttribute("fill",r),w.setAttribute("opacity",String(a)),w.setAttribute("style","transition: opacity 0.5s ease-out, r 0.5s ease-out;"),s.appendChild(w);const S=f/this._dotsPerFlow;x.push({progress:S,velocity:C})}this._flowDots.set(t,x)}}_removeFlow(e,t){const i=e.querySelector(`#${t}`);i&&i.remove(),this._flowDots.delete(t)}_fadeOutFlow(e,t){const i=e.querySelector(`#${t}`);if(!i)return;const n=i.querySelector(`#glow-${t}`),o=i.querySelector(`#path-${t}`);n&&n.setAttribute("stroke-opacity","0"),o&&o.setAttribute("stroke-opacity","0");const r=this._flowDots.get(t);r&&r.forEach((s,a)=>{const c=i.querySelector(`#dot-${t}-${a}`);c&&c.setAttribute("opacity","0")}),setTimeout(()=>{this._removeFlow(e,t)},500)}_extractIconPaths(){["production","battery","grid","load"].forEach(t=>{const i=this.querySelector(`#icon-source-${t}`),n=this.querySelector(`#icon-display-${t}`);if(!i||!n){console.warn(`Icon elements not found for ${t}`);return}const o=i.querySelector("div");if(!o){console.warn(`No div found in foreignObject for ${t}`);return}const r=o.querySelector("ha-icon");if(!r){console.warn(`No ha-icon found for ${t}`);return}const s=r.getAttribute("icon");if(!s){console.warn(`No icon attribute for ${t}`);return}if(this._iconCache.has(s)){const c=this._iconCache.get(s);this._renderIconPath(n,c),i.style.display="none";return}const a=(c=0,l=10)=>{const g=c*100,h=window.setTimeout(()=>{this._iconExtractionTimeouts.delete(h);try{const u=r.shadowRoot;if(!u){c<l&&a(c+1,l);return}let A=u.querySelector("svg");if(!A){const v=u.querySelector("ha-svg-icon");v&&v.shadowRoot&&(A=v.shadowRoot.querySelector("svg"))}if(!A){c<l&&a(c+1,l);return}const T=A.querySelector("path");if(!T){c<l&&a(c+1,l);return}const m=T.getAttribute("d");m?(this._iconCache.set(s,m),this._renderIconPath(n,m),i.style.display="none"):c<l&&a(c+1,l)}catch(u){console.error(`Failed to extract icon path for ${s} (attempt ${c+1}):`,u),c<l&&a(c+1,l)}},g);this._iconExtractionTimeouts.add(h)};a()}),this._iconsExtracted=!0}_renderIconPath(e,t){if(e.innerHTML="",t){const i=document.createElementNS("http://www.w3.org/2000/svg","path");i.setAttribute("d",t),i.setAttribute("fill","rgb(160, 160, 160)"),i.setAttribute("transform","scale(1)"),e.appendChild(i)}else{const i=document.createElementNS("http://www.w3.org/2000/svg","circle");i.setAttribute("cx","12"),i.setAttribute("cy","12"),i.setAttribute("r","8"),i.setAttribute("fill","rgb(160, 160, 160)"),e.appendChild(i)}}_drawFlow(e,t,i,n,o){const r=document.createElementNS("http://www.w3.org/2000/svg","path"),s=(t.x+i.x)/2,a=(t.y+i.y)/2,c=`M ${t.x},${t.y} Q ${s},${a} ${i.x},${i.y}`;r.setAttribute("d",c),r.setAttribute("class",`flow-line ${o?"flow-positive":"flow-negative"}`),r.setAttribute("id",`path-${Math.random()}`),e.appendChild(r);const l=Math.min(Math.max(Math.floor(n/1e3),1),3);for(let g=0;g<l;g++){const h=document.createElementNS("http://www.w3.org/2000/svg","circle");h.setAttribute("class",`flow-dot ${o?"flow-positive":"flow-negative"}`),h.setAttribute("r","3"),h.setAttribute("fill",o?"var(--success-color, #4caf50)":"var(--error-color, #f44336)");const u=document.createElementNS("http://www.w3.org/2000/svg","animateMotion");u.setAttribute("dur","2s"),u.setAttribute("repeatCount","indefinite"),u.setAttribute("begin",`${g*.6}s`);const A=document.createElementNS("http://www.w3.org/2000/svg","mpath");A.setAttributeNS("http://www.w3.org/1999/xlink","href",`#${r.id}`),u.appendChild(A),h.appendChild(u),e.appendChild(h)}}_renderCompactView(e,t,i,n,o){const r=this._calculateFlows(e,i,t,n),s=r.productionToLoad,a=r.batteryToLoad,c=r.gridToLoad,l=t||1,g=s/l*100,h=a/l*100,u=c/l*100,A="#256028",T="#104b79",m="#7a211b",v="#7a6b1b";let p=null;if(o==="compact-battery"&&this._config?.battery_soc_entity){const y=this._getEntityState(this._config.battery_soc_entity);p=parseFloat(y?.state??"0")||0}let b=0,M=0,k=0;if(o==="compact-battery"){if(n<0){const _=Math.abs(n)||1;b=r.gridToBattery/_*100,k=r.productionToBattery/_*100}else if(n>0){const y=n||1;M=r.batteryToLoad/y*100,b=(n-r.batteryToLoad)/y*100}}(!this.querySelector(".compact-view")||this._lastViewMode!==o)&&(this.innerHTML=`
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
                <div id="grid-segment" class="bar-segment" style="background: ${m}; width: ${u}%;">
                  <div class="bar-segment-content">
                    <ha-icon class="bar-segment-icon" icon="${this._getIcon("grid_icon","grid_entity","mdi:transmission-tower")}"></ha-icon>
                    <span class="bar-segment-label"></span>
                  </div>
                </div>
                <div id="battery-segment" class="bar-segment" style="background: ${T}; width: ${h}%;">
                  <div class="bar-segment-content">
                    <ha-icon class="bar-segment-icon" icon="${this._getIcon("battery_icon","battery_entity","mdi:battery")}"></ha-icon>
                    <span class="bar-segment-label"></span>
                  </div>
                </div>
                <div id="production-segment" class="bar-segment" style="background: ${A}; width: ${g}%;">
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
                  <span id="battery-soc-text-left">${p!==null?p.toFixed(1):"--"}</span><span class="row-unit">%</span>
                </div>
              </div>
              <div class="bar-container">
                <!-- Color order: red, yellow, blue, green (left to right) -->
                <div id="battery-grid-segment" class="bar-segment" style="background: ${n<0?m:v}; width: ${b}%;">
                  <div class="bar-segment-content">
                    <ha-icon class="bar-segment-icon" icon="${this._getIcon("grid_icon","grid_entity","mdi:transmission-tower")}"></ha-icon>
                    <span class="bar-segment-label"></span>
                  </div>
                </div>
                <div id="battery-load-segment" class="bar-segment" style="background: ${T}; width: ${M}%;">
                  <div class="bar-segment-content">
                    <ha-icon class="bar-segment-icon" icon="${this._getIcon("load_icon","load_entity","mdi:home")}"></ha-icon>
                    <span class="bar-segment-label"></span>
                  </div>
                </div>
                <div id="battery-production-segment" class="bar-segment" style="background: ${A}; width: ${k}%;">
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
      `,this._lastViewMode=o,requestAnimationFrame(()=>{if(this._config){const y=this.querySelector("#production-segment"),_=this.querySelector("#battery-segment"),C=this.querySelector("#grid-segment"),d=this.querySelectorAll(".row-value")[0];if(y&&y.addEventListener("click",()=>{this._handleAction(this._config.production_tap_action,this._config.production_entity)}),_&&_.addEventListener("click",()=>{this._handleAction(this._config.battery_tap_action,this._config.battery_entity)}),C&&C.addEventListener("click",()=>{this._handleAction(this._config.grid_tap_action,this._config.grid_entity)}),d&&d.addEventListener("click",()=>{this._handleAction(this._config.load_tap_action,this._config.load_entity)}),o==="compact-battery"){const x=this.querySelector("#battery-production-segment"),f=this.querySelector("#battery-load-segment"),w=this.querySelector("#battery-grid-segment"),S=this.querySelector("#battery-soc-left"),P=this.querySelector("#battery-soc-right");x&&x.addEventListener("click",()=>{this._handleAction(this._config.production_tap_action,this._config.production_entity)}),f&&f.addEventListener("click",()=>{this._handleAction(this._config.load_tap_action,this._config.load_entity)}),w&&w.addEventListener("click",()=>{this._handleAction(this._config.grid_tap_action,this._config.grid_entity)}),S&&S.addEventListener("click",()=>{this._handleAction(this._config.battery_tap_action,this._config.battery_entity)}),P&&P.addEventListener("click",()=>{this._handleAction(this._config.battery_tap_action,this._config.battery_entity)})}}})),requestAnimationFrame(()=>{const y=this.querySelector("#production-segment"),_=this.querySelector("#battery-segment"),C=this.querySelector("#grid-segment"),$=this.querySelector("#load-value-text");if(y){y.style.width=`${g}%`;const d=y.querySelector(".bar-segment-label");d&&s>0&&(d.textContent=`${Math.round(g)}%`);const x=this.querySelector(".bar-container"),f=g/100*(x?.offsetWidth||0);this._updateSegmentVisibility(y,f,s>0)}if(_){_.style.width=`${h}%`;const d=_.querySelector(".bar-segment-label");d&&a>0&&(d.textContent=`${Math.round(h)}%`);const x=this.querySelector(".bar-container"),f=h/100*(x?.offsetWidth||0);this._updateSegmentVisibility(_,f,a>0)}if(C){C.style.width=`${u}%`;const d=C.querySelector(".bar-segment-label");d&&c>0&&(d.textContent=`${Math.round(u)}%`);const x=this.querySelector(".bar-container"),f=u/100*(x?.offsetWidth||0);this._updateSegmentVisibility(C,f,c>0)}if($&&($.textContent=String(Math.round(t))),o==="compact-battery"){const d=this.querySelector("#battery-grid-segment"),x=this.querySelector("#battery-load-segment"),f=this.querySelector("#battery-production-segment"),w=this.querySelector("#battery-soc-left"),S=this.querySelector("#battery-soc-right"),P=this.querySelector("#battery-soc-text-left"),I=this.querySelector("#battery-soc-text-right"),Y=this.querySelectorAll(".bar-container")[1];let B=0,R=0,X=0,W=0,D=0,N=0,O=!1;if(n<0){const E=Math.abs(n)||1;B=r.gridToBattery/E*100,X=r.productionToBattery/E*100,W=r.gridToBattery,N=r.productionToBattery,O=!0,w&&(w.style.display="none"),S&&(S.style.display="flex"),I&&p!==null&&(I.textContent=p.toFixed(1))}else if(n>0){const q=n||1,E=n-r.batteryToLoad;B=E/q*100,R=r.batteryToLoad/q*100,W=E,D=r.batteryToLoad,O=!1,w&&(w.style.display="flex"),S&&(S.style.display="none"),P&&p!==null&&(P.textContent=p.toFixed(1))}else w&&(w.style.display="none"),S&&(S.style.display="flex"),I&&p!==null&&(I.textContent=p.toFixed(1));if(d){const q=O?"#7a211b":"#7a6b1b";d.style.width=`${B}%`,d.style.background=q;const E=d.querySelector(".bar-segment-label");E&&W>0&&(E.textContent=`${Math.round(W)}W`);const H=B/100*(Y?.offsetWidth||0);this._updateSegmentVisibility(d,H,W>0)}if(x){x.style.width=`${R}%`;const q=x.querySelector(".bar-segment-label");q&&D>0&&(q.textContent=`${Math.round(D)}W`);const E=R/100*(Y?.offsetWidth||0);this._updateSegmentVisibility(x,E,D>0)}if(f){f.style.width=`${X}%`;const q=f.querySelector(".bar-segment-label");q&&N>0&&(q.textContent=`${Math.round(N)}W`);const E=X/100*(Y?.offsetWidth||0);this._updateSegmentVisibility(f,E,N>0)}}})}_updateSegmentVisibility(e,t,i){if(!e||!i){e?.setAttribute("data-width-px","");return}t>=80?e.setAttribute("data-width-px","show-label"):t>=40?e.setAttribute("data-width-px","show-icon"):e.setAttribute("data-width-px","")}}customElements.define("energy-flow-card",G),window.customCards=window.customCards||[],window.customCards.push({type:"energy-flow-card",name:"Energy Flow Card",description:"A test energy-flow card."})})();

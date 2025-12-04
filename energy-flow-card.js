(function(){"use strict";class q{constructor(i,t,e,s,o,a,n,r,c=!1,l=!1,u=null){this.id=i,this._value=t,this.min=e,this.max=s,this.bidirectional=o,this.label=a,this.icon=n,this.units=r,this._invertView=c,this.showPlus=l,this.parentElement=u,this.radius=50,this.boxWidth=120,this.boxHeight=135,this.boxRadius=16,this.centerX=this.boxWidth/2,this.centerY=this.radius+25,this.offsetX=-this.centerX,this.offsetY=-this.centerY,this.needleState={target:0,current:0,ghost:0},this._lastAnimationTime=null,this._animationFrameId=null,this._updateNeedleAngle()}get value(){return this._value}set value(i){if(this._value!==i&&(this._value=i,this._updateNeedleAngle(),this.parentElement)){const t=this.parentElement.querySelector(`#value-${this.id}`);t&&(t.textContent=this._formatValueText()),this.updateDimming()}}get invertView(){return this._invertView}set invertView(i){if(this._invertView!==i&&(this._invertView=i,this._updateNeedleAngle(),this.parentElement)){const t=this.parentElement.querySelector(`#value-${this.id}`);t&&(t.textContent=this._formatValueText())}}get displayValue(){return this._invertView?-this._value:this._value}_formatValueText(){const i=this.displayValue,t=i.toFixed(0);return i<0?t+" ":i>0&&this.showPlus?"+"+t+" ":t}_updateNeedleAngle(){let i,t;const e=this.displayValue;if(this.bidirectional){const s=this.max-this.min;i=Math.min(Math.max((e-this.min)/s,0),1),t=180-i*180}else i=Math.min(Math.max(e/this.max,0),1),t=180-i*180;this.needleState.target=t}updateDimming(){if(!this.parentElement)return;const i=this.parentElement.querySelector(`#dimmer-${this.id}`);if(i){const t=Math.abs(this.value)<.5;i.setAttribute("opacity",t?"0.3":"0")}}startAnimation(){if(this._animationFrameId)return;const i=t=>{this._lastAnimationTime||(this._lastAnimationTime=t);const e=t-this._lastAnimationTime;if(this._lastAnimationTime=t,!this.parentElement){this._animationFrameId=null;return}const s=this.radius-5,o=Math.min(e/150,1);this.needleState.current+=(this.needleState.target-this.needleState.current)*o;const a=Math.min(e/400,1);this.needleState.ghost+=(this.needleState.current-this.needleState.ghost)*a;const n=10;this.needleState.ghost<this.needleState.current-n?this.needleState.ghost=this.needleState.current-n:this.needleState.ghost>this.needleState.current+n&&(this.needleState.ghost=this.needleState.current+n);const r=this.parentElement.querySelector(`#needle-${this.id}`);if(r){const l=this.needleState.current*Math.PI/180,u=this.centerX+s*Math.cos(l),h=this.centerY-s*Math.sin(l);r.setAttribute("x2",String(u)),r.setAttribute("y2",String(h))}const c=this.parentElement.querySelector(`#ghost-needle-${this.id}`);if(c){const l=this.needleState.ghost*Math.PI/180,u=this.centerX+s*Math.cos(l),h=this.centerY-s*Math.sin(l);c.setAttribute("x2",String(u)),c.setAttribute("y2",String(h))}this._animationFrameId=requestAnimationFrame(i)};this._animationFrameId=requestAnimationFrame(i)}stopAnimation(){this._animationFrameId&&(cancelAnimationFrame(this._animationFrameId),this._animationFrameId=null,this._lastAnimationTime=null)}createSVG(){const i=this.displayValue;let t,e;if(this.bidirectional){const b=this.max-this.min;t=Math.min(Math.max((i-this.min)/b,0),1),e=180-t*180}else t=Math.min(Math.max(i/this.max,0),1),e=180-t*180;this.needleState.target=e,this.needleState.current=e,this.needleState.ghost=e;const o=(this.bidirectional?[this.min,0,this.max]:[0,this.max/2,this.max]).map(b=>{const F=(180-(this.bidirectional?(b-this.min)/(this.max-this.min):b/this.max)*180)*Math.PI/180,P=this.radius,f=this.radius-8,w=this.centerX+P*Math.cos(F),k=this.centerY-P*Math.sin(F),$=this.centerX+f*Math.cos(F),v=this.centerY-f*Math.sin(F);return`<line x1="${w}" y1="${k}" x2="${$}" y2="${v}" stroke="rgb(160, 160, 160)" stroke-width="2" />`}).join(""),r=(180-(this.bidirectional?(0-this.min)/(this.max-this.min):0)*180)*Math.PI/180,c=this.centerX,l=this.centerY,u=this.centerX+this.radius*Math.cos(r),h=this.centerY-this.radius*Math.sin(r),_=`<line x1="${c}" y1="${l}" x2="${u}" y2="${h}" stroke="rgb(100, 100, 100)" stroke-width="2" />`,y=e*Math.PI/180,x=this.radius-5,g=this.centerX+x*Math.cos(y),m=this.centerY-x*Math.sin(y),p=this.centerY+5,d=this.centerY+this.radius*.5,S=this.centerY+this.radius*.7;return`
      <g transform="translate(${this.offsetX}, ${this.offsetY})">
        <defs>
          <clipPath id="clip-${this.id}-local">
            <rect x="0" y="0" width="${this.boxWidth}" height="${p+2}" />
          </clipPath>
        </defs>
        
        <rect x="0" y="0" width="${this.boxWidth}" height="${this.boxHeight}" rx="${this.boxRadius}" ry="${this.boxRadius}" fill="rgb(40, 40, 40)" filter="url(#drop-shadow)" />
        
        <g clip-path="url(#clip-${this.id}-local)">
          <circle cx="${this.centerX}" cy="${this.centerY}" r="${this.radius}" fill="rgb(70, 70, 70)" />
          ${_}
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
        
        <text x="${this.centerX}" y="${S}" text-anchor="middle" font-size="8" fill="rgb(160, 160, 160)" font-weight="400" letter-spacing="0.5">${this.units}</text>
        
        <rect id="dimmer-${this.id}" x="0" y="0" width="${this.boxWidth}" height="${this.boxHeight}" rx="${this.boxRadius}" ry="${this.boxRadius}" fill="black" opacity="0" pointer-events="none" style="transition: opacity 0.8s ease-in-out;" />
      </g>
    `}}function C(E){const i=Math.max(0,E.production),t=E.grid,e=E.battery,s=Math.max(0,E.load),o={productionToLoad:0,productionToBattery:0,productionToGrid:0,gridToLoad:0,gridToBattery:0,batteryToLoad:0};let a=i,n=s;if(a>0&&n>0&&(o.productionToLoad=Math.min(a,n),a-=o.productionToLoad,n-=o.productionToLoad),e<0&&a>0&&(o.productionToBattery=Math.min(a,Math.abs(e)),a-=o.productionToBattery),e>0&&n>0&&(o.batteryToLoad=Math.min(e,n),n-=o.batteryToLoad),n>0&&t>0&&(o.gridToLoad=Math.min(t,n),n-=o.gridToLoad),e<0&&t>10){const r=Math.abs(e)-o.productionToBattery;r>1&&(o.gridToBattery=Math.min(t-o.gridToLoad,r))}return t<-10&&(o.productionToGrid=Math.abs(t)),o}class L extends HTMLElement{constructor(){super(),this._resizeObserver=null,this._animationFrameId=null,this._flowDots=new Map,this._lastAnimationTime=null,this._iconCache=new Map,this._iconsExtracted=!1,this._meters=new Map,this._speedMultiplier=.8,this._dotsPerFlow=3;const i=500,t=470,e=5,s=3;this._meterPositions={production:{x:60+e,y:80+s},battery:{x:130+e,y:240+s},grid:{x:60+e,y:400+s},load:{x:360+e,y:240+s}},this._canvasWidth=i,this._canvasHeight=t}static getStubConfig(){return{}}static getConfigForm(){return{schema:[{name:"view_mode",label:"View Mode",selector:{select:{options:[{value:"default",label:"Default"},{value:"compact",label:"Compact Bar"}]}}},{name:"grid_entity",label:"Grid",required:!0,selector:{entity:{domain:"sensor",device_class:"power"}}},{name:"grid_name",selector:{entity_name:{}},context:{entity:"grid_entity"}},{name:"grid_icon",selector:{icon:{}},context:{icon_entity:"grid_entity"}},{name:"grid_min",label:"Grid Min (W)",selector:{number:{mode:"box"}}},{name:"grid_max",label:"Grid Max (W)",selector:{number:{mode:"box"}}},{name:"grid_tap_action",label:"Grid Tap Action",selector:{"ui-action":{}}},{name:"load_entity",label:"Load",required:!0,selector:{entity:{domain:"sensor",device_class:"power"}}},{name:"load_name",selector:{entity_name:{}},context:{entity:"load_entity"}},{name:"load_icon",selector:{icon:{}},context:{icon_entity:"load_entity"}},{name:"load_max",label:"Load Max (W)",selector:{number:{mode:"box"}}},{name:"load_tap_action",label:"Load Tap Action",selector:{"ui-action":{}}},{name:"production_entity",label:"Production",required:!0,selector:{entity:{domain:"sensor",device_class:"power"}}},{name:"production_name",selector:{entity_name:{}},context:{entity:"production_entity"}},{name:"production_icon",selector:{icon:{}},context:{icon_entity:"production_entity"}},{name:"production_max",label:"Production Max (W)",selector:{number:{mode:"box"}}},{name:"production_tap_action",label:"Production Tap Action",selector:{"ui-action":{}}},{name:"battery_entity",label:"Battery",required:!0,selector:{entity:{domain:"sensor",device_class:"power"}}},{name:"battery_name",selector:{entity_name:{}},context:{entity:"battery_entity"}},{name:"battery_icon",selector:{icon:{}},context:{icon_entity:"battery_entity"}},{name:"battery_min",label:"Battery Min (W)",selector:{number:{mode:"box"}}},{name:"battery_max",label:"Battery Max (W)",selector:{number:{mode:"box"}}},{name:"battery_tap_action",label:"Battery Tap Action",selector:{"ui-action":{}}},{name:"invert_battery_data",label:"Invert Battery Data",selector:{boolean:{}}},{name:"invert_battery_view",label:"Invert Battery View",selector:{boolean:{}}},{name:"show_plus",label:"Show + Sign",selector:{boolean:{}}}]}}connectedCallback(){this._resizeObserver=new ResizeObserver(()=>{if(this._lastValues){const i=this._lastValues;requestAnimationFrame(()=>{this._drawFlows(i.grid,i.production,i.load,i.battery)})}}),this.parentElement&&this._resizeObserver.observe(this.parentElement),this._resizeObserver.observe(this),this._startFlowAnimationLoop()}disconnectedCallback(){this._resizeObserver&&(this._resizeObserver.disconnect(),this._resizeObserver=null),this._meters.forEach(i=>i.stopAnimation()),this._animationFrameId&&(cancelAnimationFrame(this._animationFrameId),this._animationFrameId=null)}setConfig(i){this._config=i,this._render()}set hass(i){this._hass=i,this._render()}_render(){if(!this._config||!this._hass)return;const i=this._getEntityState(this._config.grid_entity),t=this._getEntityState(this._config.load_entity),e=this._getEntityState(this._config.production_entity),s=this._getEntityState(this._config.battery_entity),o=parseFloat(i?.state??"0")||0,a=parseFloat(t?.state??"0")||0,n=parseFloat(e?.state??"0")||0;let r=parseFloat(s?.state??"0")||0;if(this._config.invert_battery_data&&(r=-r),(this._config.view_mode||"default")==="compact"){this._renderCompactView(o,a,n,r);return}const l=this._config.grid_min!=null?this._config.grid_min:-5e3,u=this._config.grid_max!=null?this._config.grid_max:5e3,h=this._config.load_max!=null?this._config.load_max:5e3,_=this._config.production_max!=null?this._config.production_max:5e3,y=this._config.battery_min!=null?this._config.battery_min:-5e3,x=this._config.battery_max!=null?this._config.battery_max:5e3;if(this.querySelector(".energy-flow-svg")){const g=this._meters.get("production"),m=this._meters.get("battery"),p=this._meters.get("grid"),d=this._meters.get("load");g&&(g.value=n),m&&(m.invertView=this._config.invert_battery_view??!1,m.value=r),p&&(p.value=o),d&&(d.value=a)}else{this._iconsExtracted=!1;const g=new q("production",n,0,_,!1,this._getDisplayName("production_name","production_entity","Production"),this._getIcon("production_icon","production_entity","mdi:solar-power"),"WATTS"),m=new q("battery",r,y,x,!0,this._getDisplayName("battery_name","battery_entity","Battery"),this._getIcon("battery_icon","battery_entity","mdi:battery"),"WATTS",this._config.invert_battery_view,this._config.show_plus),p=new q("grid",o,l,u,!0,this._getDisplayName("grid_name","grid_entity","Grid"),this._getIcon("grid_icon","grid_entity","mdi:transmission-tower"),"WATTS"),d=new q("load",a,0,h,!1,this._getDisplayName("load_name","load_entity","Load"),this._getIcon("load_icon","load_entity","mdi:home-lightning-bolt"),"WATTS");this.innerHTML=`
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
            <g id="production-meter" class="meter-group" transform="translate(${this._meterPositions.production.x}, ${this._meterPositions.production.y})">
              ${g.createSVG()}
            </g>
            
            <!-- Battery Meter (middle left, offset right) -->
            <g id="battery-meter" class="meter-group" transform="translate(${this._meterPositions.battery.x}, ${this._meterPositions.battery.y})">
              ${m.createSVG()}
            </g>
            
            <!-- Grid Meter (bottom left) -->
            <g id="grid-meter" class="meter-group" transform="translate(${this._meterPositions.grid.x}, ${this._meterPositions.grid.y})">
              ${p.createSVG()}
            </g>
            
            <!-- Load Meter (right, 2x size) -->
            <g id="load-meter" class="meter-group" transform="translate(${this._meterPositions.load.x}, ${this._meterPositions.load.y}) scale(2)">
              ${d.createSVG()}
            </g>
          </svg>
          </div>
        </ha-card>
      `,requestAnimationFrame(()=>{g.parentElement=this.querySelector("#production-meter"),m.parentElement=this.querySelector("#battery-meter"),p.parentElement=this.querySelector("#grid-meter"),d.parentElement=this.querySelector("#load-meter"),this._meters.set("production",g),this._meters.set("battery",m),this._meters.set("grid",p),this._meters.set("load",d),this._config&&(this._attachMeterClickHandler("#production-meter",this._config.production_tap_action,this._config.production_entity),this._attachMeterClickHandler("#battery-meter",this._config.battery_tap_action,this._config.battery_entity),this._attachMeterClickHandler("#grid-meter",this._config.grid_tap_action,this._config.grid_entity),this._attachMeterClickHandler("#load-meter",this._config.load_tap_action,this._config.load_entity)),g.startAnimation(),m.startAnimation(),p.startAnimation(),d.startAnimation(),g.updateDimming(),m.updateDimming(),p.updateDimming(),d.updateDimming()})}this._lastValues={grid:o,production:n,load:a,battery:r},this._iconsExtracted||requestAnimationFrame(()=>{this._extractIconPaths()}),requestAnimationFrame(()=>{requestAnimationFrame(()=>{this._drawFlows(o,n,a,r)})})}_getEntityState(i){return this._hass?.states?.[i]}_getDisplayName(i,t,e){if(this._config?.[i])return String(this._config[i]);const s=this._config?.[t];if(s){const o=this._getEntityState(s);if(o?.attributes?.friendly_name)return o.attributes.friendly_name}return e}_getIcon(i,t,e){if(this._config?.[i])return String(this._config[i]);const s=this._config?.[t];if(s){const o=this._getEntityState(s);if(o?.attributes?.icon)return o.attributes.icon}return e}_handleAction(i,t){if(!this._hass)return;const e=i||{action:"more-info"};switch(e.action||"more-info"){case"more-info":const o=e.entity||t;this._fireEvent("hass-more-info",{entityId:o});break;case"navigate":e.navigation_path&&(history.pushState(null,"",e.navigation_path),this._fireEvent("location-changed",{replace:e.navigation_replace||!1}));break;case"url":e.url_path&&window.open(e.url_path);break;case"toggle":this._hass.callService("homeassistant","toggle",{entity_id:t});break;case"perform-action":if(e.perform_action){const[a,n]=e.perform_action.split(".");this._hass.callService(a,n,e.data||{},e.target)}break;case"assist":this._fireEvent("show-dialog",{dialogTag:"ha-voice-command-dialog",dialogParams:{pipeline_id:e.pipeline_id||"last_used",start_listening:e.start_listening}});break}}_fireEvent(i,t={}){const e=new CustomEvent(i,{detail:t,bubbles:!0,composed:!0});this.dispatchEvent(e)}_attachMeterClickHandler(i,t,e){const s=this.querySelector(i);if(!s)return;s.style.cursor="pointer";const o=s.cloneNode(!0);s.parentNode?.replaceChild(o,s),o.addEventListener("click",()=>{this._handleAction(t,e)})}_createMeterDefs(){return`
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
    `}_calculateFlows(i,t,e,s){return C({grid:i,production:t,load:e,battery:s})}_drawFlows(i,t,e,s){const o=this.querySelector("#flow-layer");if(!o)return;const a=this._meterPositions.production,n=this._meterPositions.battery,r=this._meterPositions.grid,c=this._meterPositions.load,{productionToLoad:l,productionToBattery:u,productionToGrid:h,gridToLoad:_,gridToBattery:y,batteryToLoad:x}=this._calculateFlows(i,t,e,s),g=0;[{id:"production-to-load",from:a,to:c,power:l,color:"#4caf50",threshold:g},{id:"production-to-battery",from:a,to:n,power:u,color:"#4caf50",threshold:g},{id:"battery-to-load",from:n,to:c,power:x,color:"#2196f3",threshold:10},{id:"grid-to-load",from:r,to:c,power:_,color:"#f44336",threshold:g},{id:"grid-to-battery",from:r,to:n,power:y,color:"#f44336",threshold:g},{id:"production-to-grid",from:a,to:r,power:h,color:"#ffeb3b",threshold:g}].forEach(d=>{d.power>d.threshold?this._updateOrCreateFlow(o,d.id,d.from,d.to,d.power,d.color):this._fadeOutFlow(o,d.id)})}_startFlowAnimationLoop(){const i=t=>{this._lastAnimationTime||(this._lastAnimationTime=t);const e=t-(this._lastAnimationTime??t);this._lastAnimationTime=t,this._flowDots.forEach((s,o)=>{const a=this.querySelector(`#path-${o}`);a&&s&&s.length>0&&s.forEach((n,r)=>{const c=this.querySelector(`#dot-${o}-${r}`);if(c&&n.velocity>0){n.progress+=n.velocity*e/1e3,n.progress>=1&&(n.progress=n.progress%1);try{const l=a.getTotalLength();if(l>0){const u=a.getPointAtLength(n.progress*l);c.setAttribute("cx",String(u.x)),c.setAttribute("cy",String(u.y))}}catch{}}})}),this._animationFrameId=requestAnimationFrame(i)};this._animationFrameId=requestAnimationFrame(i)}_updateOrCreateFlow(i,t,e,s,o,a){let n=i.querySelector(`#${t}`),r;o<=100?r=.25:o<=200?r=.25+(o-100)/100*.75:r=1;const c=2,l=23.76,u=1e4;let h;if(o<=100)h=c;else{const f=Math.min((o-100)/(u-100),1)*(l-c);h=c+f}const _=2.5,y=3,x=_*(h/c),g=Math.max(x,y),m=document.createElementNS("http://www.w3.org/2000/svg","path"),p=(e.x+s.x)/2,d=(e.y+s.y)/2,S=`M ${e.x},${e.y} Q ${p},${d} ${s.x},${s.y}`;m.setAttribute("d",S);const b=m.getTotalLength(),F=40*(o/1e3)*this._speedMultiplier,P=b>0?F/b:0;if(n){const f=n.querySelector(`#glow-${t}`),w=n.querySelector(`#path-${t}`);if(f&&w){const $=(e.x+s.x)/2,v=(e.y+s.y)/2,A=`M ${e.x},${e.y} Q ${$},${v} ${s.x},${s.y}`;f.setAttribute("d",A),f.setAttribute("stroke-opacity",String(r*.5)),f.setAttribute("stroke-width",String(h*2)),w.setAttribute("d",A),w.setAttribute("stroke-opacity",String(r)),w.setAttribute("stroke-width",String(h))}const k=this._flowDots.get(t);k&&k.forEach(($,v)=>{const A=n.querySelector(`#dot-${t}-${v}`);A&&(A.setAttribute("r",String(g)),A.setAttribute("opacity",String(r)),A.setAttribute("fill",a)),$.velocity=P})}else{n=document.createElementNS("http://www.w3.org/2000/svg","g"),n.id=t,i.appendChild(n);const f=document.createElementNS("http://www.w3.org/2000/svg","path");f.setAttribute("d",S),f.setAttribute("class","flow-line"),f.setAttribute("stroke",a),f.setAttribute("stroke-opacity",String(r*.5)),f.setAttribute("stroke-width",String(h*2)),f.setAttribute("style","transition: stroke-opacity 0.5s ease-out, stroke-width 0.5s ease-out;"),f.id=`glow-${t}`,n.appendChild(f);const w=document.createElementNS("http://www.w3.org/2000/svg","path");w.setAttribute("d",S),w.setAttribute("class","flow-line"),w.setAttribute("stroke",a),w.setAttribute("stroke-opacity",String(r)),w.setAttribute("stroke-width",String(h)),w.setAttribute("style","transition: stroke-opacity 0.5s ease-out, stroke-width 0.5s ease-out;"),w.id=`path-${t}`,n.appendChild(w);const k=[];for(let $=0;$<this._dotsPerFlow;$++){const v=document.createElementNS("http://www.w3.org/2000/svg","circle");v.setAttribute("class","flow-dot"),v.setAttribute("id",`dot-${t}-${$}`),v.setAttribute("r",String(g)),v.setAttribute("fill",a),v.setAttribute("opacity",String(r)),v.setAttribute("style","transition: opacity 0.5s ease-out, r 0.5s ease-out;"),n.appendChild(v);const A=$/this._dotsPerFlow;k.push({progress:A,velocity:P})}this._flowDots.set(t,k)}}_removeFlow(i,t){const e=i.querySelector(`#${t}`);e&&e.remove(),this._flowDots.delete(t)}_fadeOutFlow(i,t){const e=i.querySelector(`#${t}`);if(!e)return;const s=e.querySelector(`#glow-${t}`),o=e.querySelector(`#path-${t}`);s&&s.setAttribute("stroke-opacity","0"),o&&o.setAttribute("stroke-opacity","0");const a=this._flowDots.get(t);a&&a.forEach((n,r)=>{const c=e.querySelector(`#dot-${t}-${r}`);c&&c.setAttribute("opacity","0")}),setTimeout(()=>{this._removeFlow(i,t)},500)}_extractIconPaths(){["production","battery","grid","load"].forEach(t=>{const e=this.querySelector(`#icon-source-${t}`),s=this.querySelector(`#icon-display-${t}`);if(!e||!s){console.warn(`Icon elements not found for ${t}`);return}const o=e.querySelector("div");if(!o){console.warn(`No div found in foreignObject for ${t}`);return}const a=o.querySelector("ha-icon");if(!a){console.warn(`No ha-icon found for ${t}`);return}const n=a.getAttribute("icon");if(!n){console.warn(`No icon attribute for ${t}`);return}if(this._iconCache.has(n)){const c=this._iconCache.get(n);this._renderIconPath(s,c),e.style.display="none";return}const r=(c=0,l=10)=>{const u=c*100;setTimeout(()=>{try{const h=a.shadowRoot;if(!h){c<l&&r(c+1,l);return}let _=h.querySelector("svg");if(!_){const g=h.querySelector("ha-svg-icon");g&&g.shadowRoot&&(_=g.shadowRoot.querySelector("svg"))}if(!_){c<l&&r(c+1,l);return}const y=_.querySelector("path");if(!y){c<l&&r(c+1,l);return}const x=y.getAttribute("d");x?(this._iconCache.set(n,x),this._renderIconPath(s,x),e.style.display="none"):c<l&&r(c+1,l)}catch(h){console.error(`Failed to extract icon path for ${n} (attempt ${c+1}):`,h),c<l&&r(c+1,l)}},u)};r()}),this._iconsExtracted=!0}_renderIconPath(i,t){if(i.innerHTML="",t){const e=document.createElementNS("http://www.w3.org/2000/svg","path");e.setAttribute("d",t),e.setAttribute("fill","rgb(160, 160, 160)"),e.setAttribute("transform","scale(1)"),i.appendChild(e)}else{const e=document.createElementNS("http://www.w3.org/2000/svg","circle");e.setAttribute("cx","12"),e.setAttribute("cy","12"),e.setAttribute("r","8"),e.setAttribute("fill","rgb(160, 160, 160)"),i.appendChild(e)}}_drawFlow(i,t,e,s,o){const a=document.createElementNS("http://www.w3.org/2000/svg","path"),n=(t.x+e.x)/2,r=(t.y+e.y)/2,c=`M ${t.x},${t.y} Q ${n},${r} ${e.x},${e.y}`;a.setAttribute("d",c),a.setAttribute("class",`flow-line ${o?"flow-positive":"flow-negative"}`),a.setAttribute("id",`path-${Math.random()}`),i.appendChild(a);const l=Math.min(Math.max(Math.floor(s/1e3),1),3);for(let u=0;u<l;u++){const h=document.createElementNS("http://www.w3.org/2000/svg","circle");h.setAttribute("class",`flow-dot ${o?"flow-positive":"flow-negative"}`),h.setAttribute("r","3"),h.setAttribute("fill",o?"var(--success-color, #4caf50)":"var(--error-color, #f44336)");const _=document.createElementNS("http://www.w3.org/2000/svg","animateMotion");_.setAttribute("dur","2s"),_.setAttribute("repeatCount","indefinite"),_.setAttribute("begin",`${u*.6}s`);const y=document.createElementNS("http://www.w3.org/2000/svg","mpath");y.setAttributeNS("http://www.w3.org/1999/xlink","href",`#${a.id}`),_.appendChild(y),h.appendChild(_),i.appendChild(h)}}_renderCompactView(i,t,e,s){const o=this._calculateFlows(i,e,t,s),a=o.productionToLoad,n=o.batteryToLoad,r=o.gridToLoad,c=t||1,l=a/c*100,u=n/c*100,h=r/c*100,_="#256028",y="#104b79",x="#7a211b";(!this.querySelector(".compact-view")||this._lastViewMode!=="compact")&&(this.innerHTML=`
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
              <div id="grid-segment" class="bar-segment" style="background: ${x}; width: ${h}%;">
                <div class="bar-segment-content">
                  <ha-icon class="bar-segment-icon" icon="${this._getIcon("grid_icon","grid_entity","mdi:transmission-tower")}"></ha-icon>
                  <span class="bar-segment-label"></span>
                </div>
              </div>
              <div id="battery-segment" class="bar-segment" style="background: ${y}; width: ${u}%;">
                <div class="bar-segment-content">
                  <ha-icon class="bar-segment-icon" icon="${this._getIcon("battery_icon","battery_entity","mdi:battery")}"></ha-icon>
                  <span class="bar-segment-label"></span>
                </div>
              </div>
              <div id="production-segment" class="bar-segment" style="background: ${_}; width: ${l}%;">
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
      `,this._lastViewMode="compact",requestAnimationFrame(()=>{if(this._config){const m=this.querySelector("#production-segment"),p=this.querySelector("#battery-segment"),d=this.querySelector("#grid-segment"),S=this.querySelector(".load-value");m&&m.addEventListener("click",()=>{this._handleAction(this._config.production_tap_action,this._config.production_entity)}),p&&p.addEventListener("click",()=>{this._handleAction(this._config.battery_tap_action,this._config.battery_entity)}),d&&d.addEventListener("click",()=>{this._handleAction(this._config.grid_tap_action,this._config.grid_entity)}),S&&S.addEventListener("click",()=>{this._handleAction(this._config.load_tap_action,this._config.load_entity)})}})),requestAnimationFrame(()=>{const m=this.querySelector("#production-segment"),p=this.querySelector("#battery-segment"),d=this.querySelector("#grid-segment"),S=this.querySelector("#load-value-text");if(m){m.style.width=`${l}%`;const b=m.querySelector(".bar-segment-label");b&&a>0&&(b.textContent=`${Math.round(a)}W`);const M=this.querySelector(".bar-container"),T=l/100*(M?.offsetWidth||0);this._updateSegmentVisibility(m,T,a>0)}if(p){p.style.width=`${u}%`;const b=p.querySelector(".bar-segment-label");b&&n>0&&(b.textContent=`${Math.round(n)}W`);const M=this.querySelector(".bar-container"),T=u/100*(M?.offsetWidth||0);this._updateSegmentVisibility(p,T,n>0)}if(d){d.style.width=`${h}%`;const b=d.querySelector(".bar-segment-label");b&&r>0&&(b.textContent=`${Math.round(r)}W`);const M=this.querySelector(".bar-container"),T=h/100*(M?.offsetWidth||0);this._updateSegmentVisibility(d,T,r>0)}S&&(S.textContent=String(Math.round(t)))})}_updateSegmentVisibility(i,t,e){if(!i||!e){i?.setAttribute("data-width-px","");return}t>=80?i.setAttribute("data-width-px","show-label"):t>=40?i.setAttribute("data-width-px","show-icon"):i.setAttribute("data-width-px","")}}customElements.define("energy-flow-card",L),window.customCards=window.customCards||[],window.customCards.push({type:"energy-flow-card",name:"Energy Flow Card",description:"A test energy-flow card."})})();

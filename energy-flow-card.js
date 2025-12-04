(function(){"use strict";class P{constructor(e,t,i,s,o,a,n,r,c=!1,l=!1,g=null){this.id=e,this._value=t,this.min=i,this.max=s,this.bidirectional=o,this.label=a,this.icon=n,this.units=r,this._invertView=c,this.showPlus=l,this.parentElement=g,this.radius=50,this.boxWidth=120,this.boxHeight=135,this.boxRadius=16,this.centerX=this.boxWidth/2,this.centerY=this.radius+25,this.offsetX=-this.centerX,this.offsetY=-this.centerY,this.needleState={target:0,current:0,ghost:0},this._lastAnimationTime=null,this._animationFrameId=null,this._updateNeedleAngle()}get value(){return this._value}set value(e){if(this._value!==e&&(this._value=e,this._updateNeedleAngle(),this.parentElement)){const t=this.parentElement.querySelector(`#value-${this.id}`);t&&(t.textContent=this._formatValueText()),this.updateDimming()}}get invertView(){return this._invertView}set invertView(e){if(this._invertView!==e&&(this._invertView=e,this._updateNeedleAngle(),this.parentElement)){const t=this.parentElement.querySelector(`#value-${this.id}`);t&&(t.textContent=this._formatValueText())}}get displayValue(){return this._invertView?-this._value:this._value}_formatValueText(){const e=this.displayValue,t=e.toFixed(0);return e<0?t+" ":e>0&&this.showPlus?"+"+t+" ":t}_updateNeedleAngle(){let e,t;const i=this.displayValue;if(this.bidirectional){const s=this.max-this.min;e=Math.min(Math.max((i-this.min)/s,0),1),t=180-e*180}else e=Math.min(Math.max(i/this.max,0),1),t=180-e*180;this.needleState.target=t}updateDimming(){if(!this.parentElement)return;const e=this.parentElement.querySelector(`#dimmer-${this.id}`);if(e){const t=Math.abs(this.value)<.5;e.setAttribute("opacity",t?"0.3":"0")}}startAnimation(){if(this._animationFrameId)return;const e=t=>{this._lastAnimationTime||(this._lastAnimationTime=t);const i=t-this._lastAnimationTime;if(this._lastAnimationTime=t,!this.parentElement){this._animationFrameId=null;return}const s=this.radius-5,o=Math.min(i/150,1);this.needleState.current+=(this.needleState.target-this.needleState.current)*o;const a=Math.min(i/400,1);this.needleState.ghost+=(this.needleState.current-this.needleState.ghost)*a;const n=10;this.needleState.ghost<this.needleState.current-n?this.needleState.ghost=this.needleState.current-n:this.needleState.ghost>this.needleState.current+n&&(this.needleState.ghost=this.needleState.current+n);const r=this.parentElement.querySelector(`#needle-${this.id}`);if(r){const l=this.needleState.current*Math.PI/180,g=this.centerX+s*Math.cos(l),h=this.centerY-s*Math.sin(l);r.setAttribute("x2",String(g)),r.setAttribute("y2",String(h))}const c=this.parentElement.querySelector(`#ghost-needle-${this.id}`);if(c){const l=this.needleState.ghost*Math.PI/180,g=this.centerX+s*Math.cos(l),h=this.centerY-s*Math.sin(l);c.setAttribute("x2",String(g)),c.setAttribute("y2",String(h))}this._animationFrameId=requestAnimationFrame(e)};this._animationFrameId=requestAnimationFrame(e)}stopAnimation(){this._animationFrameId&&(cancelAnimationFrame(this._animationFrameId),this._animationFrameId=null,this._lastAnimationTime=null)}createSVG(){const e=this.displayValue;let t,i;if(this.bidirectional){const x=this.max-this.min;t=Math.min(Math.max((e-this.min)/x,0),1),i=180-t*180}else t=Math.min(Math.max(e/this.max,0),1),i=180-t*180;this.needleState.target=i,this.needleState.current=i,this.needleState.ghost=i;const o=(this.bidirectional?[this.min,0,this.max]:[0,this.max/2,this.max]).map(x=>{const F=(180-(this.bidirectional?(x-this.min)/(this.max-this.min):x/this.max)*180)*Math.PI/180,E=this.radius,f=this.radius-8,w=this.centerX+E*Math.cos(F),A=this.centerY-E*Math.sin(F),S=this.centerX+f*Math.cos(F),v=this.centerY-f*Math.sin(F);return`<line x1="${w}" y1="${A}" x2="${S}" y2="${v}" stroke="rgb(160, 160, 160)" stroke-width="2" />`}).join(""),r=(180-(this.bidirectional?(0-this.min)/(this.max-this.min):0)*180)*Math.PI/180,c=this.centerX,l=this.centerY,g=this.centerX+this.radius*Math.cos(r),h=this.centerY-this.radius*Math.sin(r),p=`<line x1="${c}" y1="${l}" x2="${g}" y2="${h}" stroke="rgb(100, 100, 100)" stroke-width="2" />`,b=i*Math.PI/180,y=this.radius-5,u=this.centerX+y*Math.cos(b),m=this.centerY-y*Math.sin(b),_=this.centerY+5,d=this.centerY+this.radius*.5,$=this.centerY+this.radius*.7;return`
      <g transform="translate(${this.offsetX}, ${this.offsetY})">
        <defs>
          <clipPath id="clip-${this.id}-local">
            <rect x="0" y="0" width="${this.boxWidth}" height="${_+2}" />
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
        
        <line id="ghost-needle-${this.id}" x1="${this.centerX}" y1="${this.centerY}" x2="${u}" y2="${m}" stroke="rgb(255, 255, 255)" stroke-width="4" stroke-linecap="round" opacity="0.3" />
        
        <line id="needle-${this.id}" x1="${this.centerX}" y1="${this.centerY}" x2="${u}" y2="${m}" stroke="rgb(255, 255, 255)" stroke-width="4" stroke-linecap="round" />
        
        <circle cx="${this.centerX}" cy="${this.centerY}" r="5" fill="rgb(255, 255, 255)" />
        
        <text id="value-${this.id}" x="${this.centerX}" y="${d}" text-anchor="middle" font-size="16" fill="rgb(255, 255, 255)" font-weight="600">${this._formatValueText()}</text>
        
        <text x="${this.centerX}" y="${$}" text-anchor="middle" font-size="8" fill="rgb(160, 160, 160)" font-weight="400" letter-spacing="0.5">${this.units}</text>
        
        <rect id="dimmer-${this.id}" x="0" y="0" width="${this.boxWidth}" height="${this.boxHeight}" rx="${this.boxRadius}" ry="${this.boxRadius}" fill="black" opacity="0" pointer-events="none" style="transition: opacity 0.8s ease-in-out;" />
      </g>
    `}}function k(T){const e=Math.max(0,T.production),t=T.grid,i=T.battery,s=Math.max(0,T.load),o={productionToLoad:0,productionToBattery:0,productionToGrid:0,gridToLoad:0,gridToBattery:0,batteryToLoad:0};let a=e,n=s;if(a>0&&n>0&&(o.productionToLoad=Math.min(a,n),a-=o.productionToLoad,n-=o.productionToLoad),i<0&&a>0&&(o.productionToBattery=Math.min(a,Math.abs(i)),a-=o.productionToBattery),i>0&&n>0&&(o.batteryToLoad=Math.min(i,n),n-=o.batteryToLoad),n>0&&t>0&&(o.gridToLoad=Math.min(t,n),n-=o.gridToLoad),i<0&&t>10){const r=Math.abs(i)-o.productionToBattery;r>1&&(o.gridToBattery=Math.min(t-o.gridToLoad,r))}return t<-10&&(o.productionToGrid=Math.abs(t)),o}class q extends HTMLElement{constructor(){super(),this._resizeObserver=null,this._animationFrameId=null,this._flowDots=new Map,this._lastAnimationTime=null,this._iconCache=new Map,this._iconsExtracted=!1,this._meters=new Map,this._speedMultiplier=.8,this._dotsPerFlow=3;const e=500,t=470,i=5,s=3;this._meterPositions={production:{x:60+i,y:80+s},battery:{x:130+i,y:240+s},grid:{x:60+i,y:400+s},load:{x:360+i,y:240+s}},this._canvasWidth=e,this._canvasHeight=t}static getStubConfig(){return{}}static getConfigForm(){return{schema:[{name:"view_mode",label:"View Mode",selector:{select:{options:[{value:"default",label:"Default"},{value:"compact",label:"Compact Bar"}]}}},{name:"grid_entity",label:"Grid",required:!0,selector:{entity:{domain:"sensor",device_class:"power"}}},{name:"grid_name",selector:{entity_name:{}},context:{entity:"grid_entity"}},{name:"grid_icon",selector:{icon:{}},context:{icon_entity:"grid_entity"}},{name:"grid_min",label:"Grid Min (W)",selector:{number:{mode:"box"}}},{name:"grid_max",label:"Grid Max (W)",selector:{number:{mode:"box"}}},{name:"load_entity",label:"Load",required:!0,selector:{entity:{domain:"sensor",device_class:"power"}}},{name:"load_name",selector:{entity_name:{}},context:{entity:"load_entity"}},{name:"load_icon",selector:{icon:{}},context:{icon_entity:"load_entity"}},{name:"load_max",label:"Load Max (W)",selector:{number:{mode:"box"}}},{name:"production_entity",label:"Production",required:!0,selector:{entity:{domain:"sensor",device_class:"power"}}},{name:"production_name",selector:{entity_name:{}},context:{entity:"production_entity"}},{name:"production_icon",selector:{icon:{}},context:{icon_entity:"production_entity"}},{name:"production_max",label:"Production Max (W)",selector:{number:{mode:"box"}}},{name:"battery_entity",label:"Battery",required:!0,selector:{entity:{domain:"sensor",device_class:"power"}}},{name:"battery_name",selector:{entity_name:{}},context:{entity:"battery_entity"}},{name:"battery_icon",selector:{icon:{}},context:{icon_entity:"battery_entity"}},{name:"battery_min",label:"Battery Min (W)",selector:{number:{mode:"box"}}},{name:"battery_max",label:"Battery Max (W)",selector:{number:{mode:"box"}}},{name:"invert_battery_data",label:"Invert Battery Data",selector:{boolean:{}}},{name:"invert_battery_view",label:"Invert Battery View",selector:{boolean:{}}},{name:"show_plus",label:"Show + Sign",selector:{boolean:{}}}]}}connectedCallback(){this._resizeObserver=new ResizeObserver(()=>{if(this._lastValues){const e=this._lastValues;requestAnimationFrame(()=>{this._drawFlows(e.grid,e.production,e.load,e.battery)})}}),this.parentElement&&this._resizeObserver.observe(this.parentElement),this._resizeObserver.observe(this),this._startFlowAnimationLoop()}disconnectedCallback(){this._resizeObserver&&(this._resizeObserver.disconnect(),this._resizeObserver=null),this._meters.forEach(e=>e.stopAnimation()),this._animationFrameId&&(cancelAnimationFrame(this._animationFrameId),this._animationFrameId=null)}setConfig(e){this._config=e,this._render()}set hass(e){this._hass=e,this._render()}_render(){if(!this._config||!this._hass)return;const e=this._getEntityState(this._config.grid_entity),t=this._getEntityState(this._config.load_entity),i=this._getEntityState(this._config.production_entity),s=this._getEntityState(this._config.battery_entity),o=parseFloat(e?.state??"0")||0,a=parseFloat(t?.state??"0")||0,n=parseFloat(i?.state??"0")||0;let r=parseFloat(s?.state??"0")||0;if(this._config.invert_battery_data&&(r=-r),(this._config.view_mode||"default")==="compact"){this._renderCompactView(o,a,n,r);return}const l=this._config.grid_min!=null?this._config.grid_min:-5e3,g=this._config.grid_max!=null?this._config.grid_max:5e3,h=this._config.load_max!=null?this._config.load_max:5e3,p=this._config.production_max!=null?this._config.production_max:5e3,b=this._config.battery_min!=null?this._config.battery_min:-5e3,y=this._config.battery_max!=null?this._config.battery_max:5e3;if(this.querySelector(".energy-flow-svg")){const u=this._meters.get("production"),m=this._meters.get("battery"),_=this._meters.get("grid"),d=this._meters.get("load");u&&(u.value=n),m&&(m.invertView=this._config.invert_battery_view??!1,m.value=r),_&&(_.value=o),d&&(d.value=a)}else{this._iconsExtracted=!1;const u=new P("production",n,0,p,!1,this._getDisplayName("production_name","production_entity","Production"),this._getIcon("production_icon","production_entity","mdi:solar-power"),"WATTS"),m=new P("battery",r,b,y,!0,this._getDisplayName("battery_name","battery_entity","Battery"),this._getIcon("battery_icon","battery_entity","mdi:battery"),"WATTS",this._config.invert_battery_view,this._config.show_plus),_=new P("grid",o,l,g,!0,this._getDisplayName("grid_name","grid_entity","Grid"),this._getIcon("grid_icon","grid_entity","mdi:transmission-tower"),"WATTS"),d=new P("load",a,0,h,!1,this._getDisplayName("load_name","load_entity","Load"),this._getIcon("load_icon","load_entity","mdi:home-lightning-bolt"),"WATTS");this.innerHTML=`
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
              ${u.createSVG()}
            </g>
            
            <!-- Battery Meter (middle left, offset right) -->
            <g id="battery-meter" class="meter-group" transform="translate(${this._meterPositions.battery.x}, ${this._meterPositions.battery.y})">
              ${m.createSVG()}
            </g>
            
            <!-- Grid Meter (bottom left) -->
            <g id="grid-meter" class="meter-group" transform="translate(${this._meterPositions.grid.x}, ${this._meterPositions.grid.y})">
              ${_.createSVG()}
            </g>
            
            <!-- Load Meter (right, 2x size) -->
            <g id="load-meter" class="meter-group" transform="translate(${this._meterPositions.load.x}, ${this._meterPositions.load.y}) scale(2)">
              ${d.createSVG()}
            </g>
          </svg>
          </div>
        </ha-card>
      `,requestAnimationFrame(()=>{u.parentElement=this.querySelector("#production-meter"),m.parentElement=this.querySelector("#battery-meter"),_.parentElement=this.querySelector("#grid-meter"),d.parentElement=this.querySelector("#load-meter"),this._meters.set("production",u),this._meters.set("battery",m),this._meters.set("grid",_),this._meters.set("load",d),u.startAnimation(),m.startAnimation(),_.startAnimation(),d.startAnimation(),u.updateDimming(),m.updateDimming(),_.updateDimming(),d.updateDimming()})}this._lastValues={grid:o,production:n,load:a,battery:r},this._iconsExtracted||requestAnimationFrame(()=>{this._extractIconPaths()}),requestAnimationFrame(()=>{requestAnimationFrame(()=>{this._drawFlows(o,n,a,r)})})}_getEntityState(e){return this._hass?.states?.[e]}_getDisplayName(e,t,i){if(this._config?.[e])return String(this._config[e]);const s=this._config?.[t];if(s){const o=this._getEntityState(s);if(o?.attributes?.friendly_name)return o.attributes.friendly_name}return i}_getIcon(e,t,i){if(this._config?.[e])return String(this._config[e]);const s=this._config?.[t];if(s){const o=this._getEntityState(s);if(o?.attributes?.icon)return o.attributes.icon}return i}_createMeterDefs(){return`
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
    `}_calculateFlows(e,t,i,s){return k({grid:e,production:t,load:i,battery:s})}_drawFlows(e,t,i,s){const o=this.querySelector("#flow-layer");if(!o)return;const a=this._meterPositions.production,n=this._meterPositions.battery,r=this._meterPositions.grid,c=this._meterPositions.load,{productionToLoad:l,productionToBattery:g,productionToGrid:h,gridToLoad:p,gridToBattery:b,batteryToLoad:y}=this._calculateFlows(e,t,i,s),u=0;[{id:"production-to-load",from:a,to:c,power:l,color:"#4caf50",threshold:u},{id:"production-to-battery",from:a,to:n,power:g,color:"#4caf50",threshold:u},{id:"battery-to-load",from:n,to:c,power:y,color:"#2196f3",threshold:10},{id:"grid-to-load",from:r,to:c,power:p,color:"#f44336",threshold:u},{id:"grid-to-battery",from:r,to:n,power:b,color:"#f44336",threshold:u},{id:"production-to-grid",from:a,to:r,power:h,color:"#ffeb3b",threshold:u}].forEach(d=>{d.power>d.threshold?this._updateOrCreateFlow(o,d.id,d.from,d.to,d.power,d.color):this._fadeOutFlow(o,d.id)})}_startFlowAnimationLoop(){const e=t=>{this._lastAnimationTime||(this._lastAnimationTime=t);const i=t-(this._lastAnimationTime??t);this._lastAnimationTime=t,this._flowDots.forEach((s,o)=>{const a=this.querySelector(`#path-${o}`);a&&s&&s.length>0&&s.forEach((n,r)=>{const c=this.querySelector(`#dot-${o}-${r}`);if(c&&n.velocity>0){n.progress+=n.velocity*i/1e3,n.progress>=1&&(n.progress=n.progress%1);try{const l=a.getTotalLength();if(l>0){const g=a.getPointAtLength(n.progress*l);c.setAttribute("cx",String(g.x)),c.setAttribute("cy",String(g.y))}}catch{}}})}),this._animationFrameId=requestAnimationFrame(e)};this._animationFrameId=requestAnimationFrame(e)}_updateOrCreateFlow(e,t,i,s,o,a){let n=e.querySelector(`#${t}`),r;o<=100?r=.25:o<=200?r=.25+(o-100)/100*.75:r=1;const c=2,l=23.76,g=1e4;let h;if(o<=100)h=c;else{const f=Math.min((o-100)/(g-100),1)*(l-c);h=c+f}const p=2.5,b=3,y=p*(h/c),u=Math.max(y,b),m=document.createElementNS("http://www.w3.org/2000/svg","path"),_=(i.x+s.x)/2,d=(i.y+s.y)/2,$=`M ${i.x},${i.y} Q ${_},${d} ${s.x},${s.y}`;m.setAttribute("d",$);const x=m.getTotalLength(),F=40*(o/1e3)*this._speedMultiplier,E=x>0?F/x:0;if(n){const f=n.querySelector(`#glow-${t}`),w=n.querySelector(`#path-${t}`);if(f&&w){const S=(i.x+s.x)/2,v=(i.y+s.y)/2,M=`M ${i.x},${i.y} Q ${S},${v} ${s.x},${s.y}`;f.setAttribute("d",M),f.setAttribute("stroke-opacity",String(r*.5)),f.setAttribute("stroke-width",String(h*2)),w.setAttribute("d",M),w.setAttribute("stroke-opacity",String(r)),w.setAttribute("stroke-width",String(h))}const A=this._flowDots.get(t);A&&A.forEach((S,v)=>{const M=n.querySelector(`#dot-${t}-${v}`);M&&(M.setAttribute("r",String(u)),M.setAttribute("opacity",String(r)),M.setAttribute("fill",a)),S.velocity=E})}else{n=document.createElementNS("http://www.w3.org/2000/svg","g"),n.id=t,e.appendChild(n);const f=document.createElementNS("http://www.w3.org/2000/svg","path");f.setAttribute("d",$),f.setAttribute("class","flow-line"),f.setAttribute("stroke",a),f.setAttribute("stroke-opacity",String(r*.5)),f.setAttribute("stroke-width",String(h*2)),f.setAttribute("style","transition: stroke-opacity 0.5s ease-out, stroke-width 0.5s ease-out;"),f.id=`glow-${t}`,n.appendChild(f);const w=document.createElementNS("http://www.w3.org/2000/svg","path");w.setAttribute("d",$),w.setAttribute("class","flow-line"),w.setAttribute("stroke",a),w.setAttribute("stroke-opacity",String(r)),w.setAttribute("stroke-width",String(h)),w.setAttribute("style","transition: stroke-opacity 0.5s ease-out, stroke-width 0.5s ease-out;"),w.id=`path-${t}`,n.appendChild(w);const A=[];for(let S=0;S<this._dotsPerFlow;S++){const v=document.createElementNS("http://www.w3.org/2000/svg","circle");v.setAttribute("class","flow-dot"),v.setAttribute("id",`dot-${t}-${S}`),v.setAttribute("r",String(u)),v.setAttribute("fill",a),v.setAttribute("opacity",String(r)),v.setAttribute("style","transition: opacity 0.5s ease-out, r 0.5s ease-out;"),n.appendChild(v);const M=S/this._dotsPerFlow;A.push({progress:M,velocity:E})}this._flowDots.set(t,A)}}_removeFlow(e,t){const i=e.querySelector(`#${t}`);i&&i.remove(),this._flowDots.delete(t)}_fadeOutFlow(e,t){const i=e.querySelector(`#${t}`);if(!i)return;const s=i.querySelector(`#glow-${t}`),o=i.querySelector(`#path-${t}`);s&&s.setAttribute("stroke-opacity","0"),o&&o.setAttribute("stroke-opacity","0");const a=this._flowDots.get(t);a&&a.forEach((n,r)=>{const c=i.querySelector(`#dot-${t}-${r}`);c&&c.setAttribute("opacity","0")}),setTimeout(()=>{this._removeFlow(e,t)},500)}_extractIconPaths(){["production","battery","grid","load"].forEach(t=>{const i=this.querySelector(`#icon-source-${t}`),s=this.querySelector(`#icon-display-${t}`);if(!i||!s){console.warn(`Icon elements not found for ${t}`);return}const o=i.querySelector("div");if(!o){console.warn(`No div found in foreignObject for ${t}`);return}const a=o.querySelector("ha-icon");if(!a){console.warn(`No ha-icon found for ${t}`);return}const n=a.getAttribute("icon");if(!n){console.warn(`No icon attribute for ${t}`);return}if(this._iconCache.has(n)){const c=this._iconCache.get(n);this._renderIconPath(s,c),i.style.display="none";return}const r=(c=0,l=10)=>{const g=c*100;setTimeout(()=>{try{const h=a.shadowRoot;if(!h){c<l&&r(c+1,l);return}let p=h.querySelector("svg");if(!p){const u=h.querySelector("ha-svg-icon");u&&u.shadowRoot&&(p=u.shadowRoot.querySelector("svg"))}if(!p){c<l&&r(c+1,l);return}const b=p.querySelector("path");if(!b){c<l&&r(c+1,l);return}const y=b.getAttribute("d");y?(this._iconCache.set(n,y),this._renderIconPath(s,y),i.style.display="none"):c<l&&r(c+1,l)}catch(h){console.error(`Failed to extract icon path for ${n} (attempt ${c+1}):`,h),c<l&&r(c+1,l)}},g)};r()}),this._iconsExtracted=!0}_renderIconPath(e,t){if(e.innerHTML="",t){const i=document.createElementNS("http://www.w3.org/2000/svg","path");i.setAttribute("d",t),i.setAttribute("fill","rgb(160, 160, 160)"),i.setAttribute("transform","scale(1)"),e.appendChild(i)}else{const i=document.createElementNS("http://www.w3.org/2000/svg","circle");i.setAttribute("cx","12"),i.setAttribute("cy","12"),i.setAttribute("r","8"),i.setAttribute("fill","rgb(160, 160, 160)"),e.appendChild(i)}}_drawFlow(e,t,i,s,o){const a=document.createElementNS("http://www.w3.org/2000/svg","path"),n=(t.x+i.x)/2,r=(t.y+i.y)/2,c=`M ${t.x},${t.y} Q ${n},${r} ${i.x},${i.y}`;a.setAttribute("d",c),a.setAttribute("class",`flow-line ${o?"flow-positive":"flow-negative"}`),a.setAttribute("id",`path-${Math.random()}`),e.appendChild(a);const l=Math.min(Math.max(Math.floor(s/1e3),1),3);for(let g=0;g<l;g++){const h=document.createElementNS("http://www.w3.org/2000/svg","circle");h.setAttribute("class",`flow-dot ${o?"flow-positive":"flow-negative"}`),h.setAttribute("r","3"),h.setAttribute("fill",o?"var(--success-color, #4caf50)":"var(--error-color, #f44336)");const p=document.createElementNS("http://www.w3.org/2000/svg","animateMotion");p.setAttribute("dur","2s"),p.setAttribute("repeatCount","indefinite"),p.setAttribute("begin",`${g*.6}s`);const b=document.createElementNS("http://www.w3.org/2000/svg","mpath");b.setAttributeNS("http://www.w3.org/1999/xlink","href",`#${a.id}`),p.appendChild(b),h.appendChild(p),e.appendChild(h)}}_renderCompactView(e,t,i,s){const o=Math.max(0,i),a=Math.min(Math.max(0,s),Math.max(0,t-o)),n=Math.max(0,t-o-a),r=t||1,c=o/r*100,l=a/r*100,g=n/r*100,h="#4caf50",p="#2196f3",b="#f44336";(!this.querySelector(".compact-view")||this._lastViewMode!=="compact")&&(this.innerHTML=`
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
              color: rgba(0, 0, 0, 0.8);
              transition: width 0.5s ease-out;
              position: relative;
              overflow: hidden;
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
              opacity: 0.9;
            }
            .bar-segment-label {
              text-shadow: 0 1px 2px rgba(255,255,255,0.3);
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
              <div id="grid-segment" class="bar-segment" style="background: ${b}; width: ${g}%;">
                <div class="bar-segment-content">
                  <ha-icon class="bar-segment-icon" icon="${this._getIcon("grid_icon","grid_entity","mdi:transmission-tower")}"></ha-icon>
                  <span class="bar-segment-label"></span>
                </div>
              </div>
              <div id="battery-segment" class="bar-segment" style="background: ${p}; width: ${l}%;">
                <div class="bar-segment-content">
                  <ha-icon class="bar-segment-icon" icon="${this._getIcon("battery_icon","battery_entity","mdi:battery")}"></ha-icon>
                  <span class="bar-segment-label"></span>
                </div>
              </div>
              <div id="production-segment" class="bar-segment" style="background: ${h}; width: ${c}%;">
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
      `,this._lastViewMode="compact");const y=this.querySelector("#production-segment"),u=this.querySelector("#battery-segment"),m=this.querySelector("#grid-segment"),_=this.querySelector("#load-value-text");if(y){y.style.width=`${c}%`;const d=y.querySelector(".bar-segment-label");d&&o>0&&(d.textContent=`${Math.round(o)}W`);const $=this.querySelector(".bar-container"),x=c/100*($?.offsetWidth||0);this._updateSegmentVisibility(y,x,o>0)}if(u){u.style.width=`${l}%`;const d=u.querySelector(".bar-segment-label");d&&a>0&&(d.textContent=`${Math.round(a)}W`);const $=this.querySelector(".bar-container"),x=l/100*($?.offsetWidth||0);this._updateSegmentVisibility(u,x,a>0)}if(m){m.style.width=`${g}%`;const d=m.querySelector(".bar-segment-label");d&&n>0&&(d.textContent=`${Math.round(n)}W`);const $=this.querySelector(".bar-container"),x=g/100*($?.offsetWidth||0);this._updateSegmentVisibility(m,x,n>0)}_&&(_.textContent=String(Math.round(t)))}_updateSegmentVisibility(e,t,i){if(!e||!i){e?.setAttribute("data-width-px","");return}t>=80?e.setAttribute("data-width-px","show-label"):t>=40?e.setAttribute("data-width-px","show-icon"):e.setAttribute("data-width-px","")}}customElements.define("energy-flow-card",q),window.customCards=window.customCards||[],window.customCards.push({type:"energy-flow-card",name:"Energy Flow Card",description:"A test energy-flow card."})})();

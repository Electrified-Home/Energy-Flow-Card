(function(){"use strict";class q{constructor(e,t,i,n,o,a,s,r,c=!1,l=!1,d=null){this.id=e,this._value=t,this.min=i,this.max=n,this.bidirectional=o,this.label=a,this.icon=s,this.units=r,this._invertView=c,this.showPlus=l,this.parentElement=d,this.radius=50,this.boxWidth=120,this.boxHeight=135,this.boxRadius=16,this.centerX=this.boxWidth/2,this.centerY=this.radius+25,this.offsetX=-this.centerX,this.offsetY=-this.centerY,this.needleState={target:0,current:0,ghost:0},this._lastAnimationTime=null,this._animationFrameId=null,this._updateNeedleAngle()}get value(){return this._value}set value(e){if(this._value!==e&&(this._value=e,this._updateNeedleAngle(),this.parentElement)){const t=this.parentElement.querySelector(`#value-${this.id}`);t&&(t.textContent=this._formatValueText()),this.updateDimming()}}get invertView(){return this._invertView}set invertView(e){if(this._invertView!==e&&(this._invertView=e,this._updateNeedleAngle(),this.parentElement)){const t=this.parentElement.querySelector(`#value-${this.id}`);t&&(t.textContent=this._formatValueText())}}get displayValue(){return this._invertView?-this._value:this._value}_formatValueText(){const e=this.displayValue,t=e.toFixed(0);return e<0?t+" ":e>0&&this.showPlus?"+"+t+" ":t}_updateNeedleAngle(){let e,t;const i=this.displayValue;if(this.bidirectional){const n=this.max-this.min;e=Math.min(Math.max((i-this.min)/n,0),1),t=180-e*180}else e=Math.min(Math.max(i/this.max,0),1),t=180-e*180;this.needleState.target=t}updateDimming(){if(!this.parentElement)return;const e=this.parentElement.querySelector(`#dimmer-${this.id}`);if(e){const t=Math.abs(this.value)<.5;e.setAttribute("opacity",t?"0.3":"0")}}startAnimation(){if(this._animationFrameId)return;const e=t=>{this._lastAnimationTime||(this._lastAnimationTime=t);const i=t-this._lastAnimationTime;if(this._lastAnimationTime=t,!this.parentElement){this._animationFrameId=null;return}const n=this.radius-5,o=Math.min(i/150,1);this.needleState.current+=(this.needleState.target-this.needleState.current)*o;const a=Math.min(i/400,1);this.needleState.ghost+=(this.needleState.current-this.needleState.ghost)*a;const s=10;this.needleState.ghost<this.needleState.current-s?this.needleState.ghost=this.needleState.current-s:this.needleState.ghost>this.needleState.current+s&&(this.needleState.ghost=this.needleState.current+s);const r=this.parentElement.querySelector(`#needle-${this.id}`);if(r){const l=this.needleState.current*Math.PI/180,d=this.centerX+n*Math.cos(l),h=this.centerY-n*Math.sin(l);r.setAttribute("x2",String(d)),r.setAttribute("y2",String(h))}const c=this.parentElement.querySelector(`#ghost-needle-${this.id}`);if(c){const l=this.needleState.ghost*Math.PI/180,d=this.centerX+n*Math.cos(l),h=this.centerY-n*Math.sin(l);c.setAttribute("x2",String(d)),c.setAttribute("y2",String(h))}this._animationFrameId=requestAnimationFrame(e)};this._animationFrameId=requestAnimationFrame(e)}stopAnimation(){this._animationFrameId&&(cancelAnimationFrame(this._animationFrameId),this._animationFrameId=null,this._lastAnimationTime=null)}createSVG(){const e=this.displayValue;let t,i;if(this.bidirectional){const _=this.max-this.min;t=Math.min(Math.max((e-this.min)/_,0),1),i=180-t*180}else t=Math.min(Math.max(e/this.max,0),1),i=180-t*180;this.needleState.target=i,this.needleState.current=i,this.needleState.ghost=i;const o=(this.bidirectional?[this.min,0,this.max]:[0,this.max/2,this.max]).map(_=>{const P=(180-(this.bidirectional?(_-this.min)/(this.max-this.min):_/this.max)*180)*Math.PI/180,k=this.radius,y=this.radius-8,w=this.centerX+k*Math.cos(P),F=this.centerY-k*Math.sin(P),$=this.centerX+y*Math.cos(P),v=this.centerY-y*Math.sin(P);return`<line x1="${w}" y1="${F}" x2="${$}" y2="${v}" stroke="rgb(160, 160, 160)" stroke-width="2" />`}).join(""),r=(180-(this.bidirectional?(0-this.min)/(this.max-this.min):0)*180)*Math.PI/180,c=this.centerX,l=this.centerY,d=this.centerX+this.radius*Math.cos(r),h=this.centerY-this.radius*Math.sin(r),p=`<line x1="${c}" y1="${l}" x2="${d}" y2="${h}" stroke="rgb(100, 100, 100)" stroke-width="2" />`,b=i*Math.PI/180,x=this.radius-5,g=this.centerX+x*Math.cos(b),m=this.centerY-x*Math.sin(b),f=this.centerY+5,u=this.centerY+this.radius*.5,M=this.centerY+this.radius*.7;return`
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
        
        <text id="value-${this.id}" x="${this.centerX}" y="${u}" text-anchor="middle" font-size="16" fill="rgb(255, 255, 255)" font-weight="600">${this._formatValueText()}</text>
        
        <text x="${this.centerX}" y="${M}" text-anchor="middle" font-size="8" fill="rgb(160, 160, 160)" font-weight="400" letter-spacing="0.5">${this.units}</text>
        
        <rect id="dimmer-${this.id}" x="0" y="0" width="${this.boxWidth}" height="${this.boxHeight}" rx="${this.boxRadius}" ry="${this.boxRadius}" fill="black" opacity="0" pointer-events="none" style="transition: opacity 0.8s ease-in-out;" />
      </g>
    `}}function L(E){const e=Math.max(0,E.production),t=E.grid,i=E.battery,n=Math.max(0,E.load),o={productionToLoad:0,productionToBattery:0,productionToGrid:0,gridToLoad:0,gridToBattery:0,batteryToLoad:0};let a=e,s=n;if(a>0&&s>0&&(o.productionToLoad=Math.min(a,s),a-=o.productionToLoad,s-=o.productionToLoad),i<0&&a>0&&(o.productionToBattery=Math.min(a,Math.abs(i)),a-=o.productionToBattery),i>0&&s>0&&(o.batteryToLoad=Math.min(i,s),s-=o.batteryToLoad),s>0&&t>0&&(o.gridToLoad=Math.min(t,s),s-=o.gridToLoad),i<0&&t>10){const r=Math.abs(i)-o.productionToBattery;r>1&&(o.gridToBattery=Math.min(t-o.gridToLoad,r))}return t<-10&&(o.productionToGrid=Math.abs(t)),o}class C extends HTMLElement{constructor(){super(),this._resizeObserver=null,this._animationFrameId=null,this._flowDots=new Map,this._lastAnimationTime=null,this._iconCache=new Map,this._iconsExtracted=!1,this._meters=new Map,this._speedMultiplier=.8,this._dotsPerFlow=3;const e=500,t=470,i=5,n=3;this._meterPositions={production:{x:60+i,y:80+n},battery:{x:130+i,y:240+n},grid:{x:60+i,y:400+n},load:{x:360+i,y:240+n}},this._canvasWidth=e,this._canvasHeight=t}static getStubConfig(){return{}}static getConfigForm(){return{schema:[{name:"view_mode",label:"View Mode",selector:{select:{options:[{value:"default",label:"Default"},{value:"compact",label:"Compact Bar"}]}}},{name:"grid_entity",label:"Grid",required:!0,selector:{entity:{domain:"sensor",device_class:"power"}}},{name:"grid_name",selector:{entity_name:{}},context:{entity:"grid_entity"}},{name:"grid_icon",selector:{icon:{}},context:{icon_entity:"grid_entity"}},{name:"grid_min",label:"Grid Min (W)",selector:{number:{mode:"box"}}},{name:"grid_max",label:"Grid Max (W)",selector:{number:{mode:"box"}}},{name:"load_entity",label:"Load",required:!0,selector:{entity:{domain:"sensor",device_class:"power"}}},{name:"load_name",selector:{entity_name:{}},context:{entity:"load_entity"}},{name:"load_icon",selector:{icon:{}},context:{icon_entity:"load_entity"}},{name:"load_max",label:"Load Max (W)",selector:{number:{mode:"box"}}},{name:"production_entity",label:"Production",required:!0,selector:{entity:{domain:"sensor",device_class:"power"}}},{name:"production_name",selector:{entity_name:{}},context:{entity:"production_entity"}},{name:"production_icon",selector:{icon:{}},context:{icon_entity:"production_entity"}},{name:"production_max",label:"Production Max (W)",selector:{number:{mode:"box"}}},{name:"battery_entity",label:"Battery",required:!0,selector:{entity:{domain:"sensor",device_class:"power"}}},{name:"battery_name",selector:{entity_name:{}},context:{entity:"battery_entity"}},{name:"battery_icon",selector:{icon:{}},context:{icon_entity:"battery_entity"}},{name:"battery_min",label:"Battery Min (W)",selector:{number:{mode:"box"}}},{name:"battery_max",label:"Battery Max (W)",selector:{number:{mode:"box"}}},{name:"invert_battery_data",label:"Invert Battery Data",selector:{boolean:{}}},{name:"invert_battery_view",label:"Invert Battery View",selector:{boolean:{}}},{name:"show_plus",label:"Show + Sign",selector:{boolean:{}}}]}}connectedCallback(){this._resizeObserver=new ResizeObserver(()=>{if(this._lastValues){const e=this._lastValues;requestAnimationFrame(()=>{this._drawFlows(e.grid,e.production,e.load,e.battery)})}}),this.parentElement&&this._resizeObserver.observe(this.parentElement),this._resizeObserver.observe(this),this._startFlowAnimationLoop()}disconnectedCallback(){this._resizeObserver&&(this._resizeObserver.disconnect(),this._resizeObserver=null),this._meters.forEach(e=>e.stopAnimation()),this._animationFrameId&&(cancelAnimationFrame(this._animationFrameId),this._animationFrameId=null)}setConfig(e){this._config=e,this._render()}set hass(e){this._hass=e,this._render()}_render(){if(!this._config||!this._hass)return;const e=this._getEntityState(this._config.grid_entity),t=this._getEntityState(this._config.load_entity),i=this._getEntityState(this._config.production_entity),n=this._getEntityState(this._config.battery_entity),o=parseFloat(e?.state??"0")||0,a=parseFloat(t?.state??"0")||0,s=parseFloat(i?.state??"0")||0;let r=parseFloat(n?.state??"0")||0;if(this._config.invert_battery_data&&(r=-r),(this._config.view_mode||"default")==="compact"){this._renderCompactView(o,a,s,r);return}const l=this._config.grid_min!=null?this._config.grid_min:-5e3,d=this._config.grid_max!=null?this._config.grid_max:5e3,h=this._config.load_max!=null?this._config.load_max:5e3,p=this._config.production_max!=null?this._config.production_max:5e3,b=this._config.battery_min!=null?this._config.battery_min:-5e3,x=this._config.battery_max!=null?this._config.battery_max:5e3;if(this.querySelector(".energy-flow-svg")){const g=this._meters.get("production"),m=this._meters.get("battery"),f=this._meters.get("grid"),u=this._meters.get("load");g&&(g.value=s),m&&(m.invertView=this._config.invert_battery_view??!1,m.value=r),f&&(f.value=o),u&&(u.value=a)}else{this._iconsExtracted=!1;const g=new q("production",s,0,p,!1,this._getDisplayName("production_name","production_entity","Production"),this._getIcon("production_icon","production_entity","mdi:solar-power"),"WATTS"),m=new q("battery",r,b,x,!0,this._getDisplayName("battery_name","battery_entity","Battery"),this._getIcon("battery_icon","battery_entity","mdi:battery"),"WATTS",this._config.invert_battery_view,this._config.show_plus),f=new q("grid",o,l,d,!0,this._getDisplayName("grid_name","grid_entity","Grid"),this._getIcon("grid_icon","grid_entity","mdi:transmission-tower"),"WATTS"),u=new q("load",a,0,h,!1,this._getDisplayName("load_name","load_entity","Load"),this._getIcon("load_icon","load_entity","mdi:home-lightning-bolt"),"WATTS");this.innerHTML=`
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
              ${f.createSVG()}
            </g>
            
            <!-- Load Meter (right, 2x size) -->
            <g id="load-meter" class="meter-group" transform="translate(${this._meterPositions.load.x}, ${this._meterPositions.load.y}) scale(2)">
              ${u.createSVG()}
            </g>
          </svg>
          </div>
        </ha-card>
      `,requestAnimationFrame(()=>{g.parentElement=this.querySelector("#production-meter"),m.parentElement=this.querySelector("#battery-meter"),f.parentElement=this.querySelector("#grid-meter"),u.parentElement=this.querySelector("#load-meter"),this._meters.set("production",g),this._meters.set("battery",m),this._meters.set("grid",f),this._meters.set("load",u),g.startAnimation(),m.startAnimation(),f.startAnimation(),u.startAnimation(),g.updateDimming(),m.updateDimming(),f.updateDimming(),u.updateDimming()})}this._lastValues={grid:o,production:s,load:a,battery:r},this._iconsExtracted||requestAnimationFrame(()=>{this._extractIconPaths()}),requestAnimationFrame(()=>{requestAnimationFrame(()=>{this._drawFlows(o,s,a,r)})})}_getEntityState(e){return this._hass?.states?.[e]}_getDisplayName(e,t,i){if(this._config?.[e])return String(this._config[e]);const n=this._config?.[t];if(n){const o=this._getEntityState(n);if(o?.attributes?.friendly_name)return o.attributes.friendly_name}return i}_getIcon(e,t,i){if(this._config?.[e])return String(this._config[e]);const n=this._config?.[t];if(n){const o=this._getEntityState(n);if(o?.attributes?.icon)return o.attributes.icon}return i}_createMeterDefs(){return`
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
    `}_calculateFlows(e,t,i,n){return L({grid:e,production:t,load:i,battery:n})}_drawFlows(e,t,i,n){const o=this.querySelector("#flow-layer");if(!o)return;const a=this._meterPositions.production,s=this._meterPositions.battery,r=this._meterPositions.grid,c=this._meterPositions.load,{productionToLoad:l,productionToBattery:d,productionToGrid:h,gridToLoad:p,gridToBattery:b,batteryToLoad:x}=this._calculateFlows(e,t,i,n),g=0;[{id:"production-to-load",from:a,to:c,power:l,color:"#4caf50",threshold:g},{id:"production-to-battery",from:a,to:s,power:d,color:"#4caf50",threshold:g},{id:"battery-to-load",from:s,to:c,power:x,color:"#2196f3",threshold:10},{id:"grid-to-load",from:r,to:c,power:p,color:"#f44336",threshold:g},{id:"grid-to-battery",from:r,to:s,power:b,color:"#f44336",threshold:g},{id:"production-to-grid",from:a,to:r,power:h,color:"#ffeb3b",threshold:g}].forEach(u=>{u.power>u.threshold?this._updateOrCreateFlow(o,u.id,u.from,u.to,u.power,u.color):this._fadeOutFlow(o,u.id)})}_startFlowAnimationLoop(){const e=t=>{this._lastAnimationTime||(this._lastAnimationTime=t);const i=t-(this._lastAnimationTime??t);this._lastAnimationTime=t,this._flowDots.forEach((n,o)=>{const a=this.querySelector(`#path-${o}`);a&&n&&n.length>0&&n.forEach((s,r)=>{const c=this.querySelector(`#dot-${o}-${r}`);if(c&&s.velocity>0){s.progress+=s.velocity*i/1e3,s.progress>=1&&(s.progress=s.progress%1);try{const l=a.getTotalLength();if(l>0){const d=a.getPointAtLength(s.progress*l);c.setAttribute("cx",String(d.x)),c.setAttribute("cy",String(d.y))}}catch{}}})}),this._animationFrameId=requestAnimationFrame(e)};this._animationFrameId=requestAnimationFrame(e)}_updateOrCreateFlow(e,t,i,n,o,a){let s=e.querySelector(`#${t}`),r;o<=100?r=.25:o<=200?r=.25+(o-100)/100*.75:r=1;const c=2,l=23.76,d=1e4;let h;if(o<=100)h=c;else{const y=Math.min((o-100)/(d-100),1)*(l-c);h=c+y}const p=2.5,b=3,x=p*(h/c),g=Math.max(x,b),m=document.createElementNS("http://www.w3.org/2000/svg","path"),f=(i.x+n.x)/2,u=(i.y+n.y)/2,M=`M ${i.x},${i.y} Q ${f},${u} ${n.x},${n.y}`;m.setAttribute("d",M);const _=m.getTotalLength(),P=40*(o/1e3)*this._speedMultiplier,k=_>0?P/_:0;if(s){const y=s.querySelector(`#glow-${t}`),w=s.querySelector(`#path-${t}`);if(y&&w){const $=(i.x+n.x)/2,v=(i.y+n.y)/2,S=`M ${i.x},${i.y} Q ${$},${v} ${n.x},${n.y}`;y.setAttribute("d",S),y.setAttribute("stroke-opacity",String(r*.5)),y.setAttribute("stroke-width",String(h*2)),w.setAttribute("d",S),w.setAttribute("stroke-opacity",String(r)),w.setAttribute("stroke-width",String(h))}const F=this._flowDots.get(t);F&&F.forEach(($,v)=>{const S=s.querySelector(`#dot-${t}-${v}`);S&&(S.setAttribute("r",String(g)),S.setAttribute("opacity",String(r)),S.setAttribute("fill",a)),$.velocity=k})}else{s=document.createElementNS("http://www.w3.org/2000/svg","g"),s.id=t,e.appendChild(s);const y=document.createElementNS("http://www.w3.org/2000/svg","path");y.setAttribute("d",M),y.setAttribute("class","flow-line"),y.setAttribute("stroke",a),y.setAttribute("stroke-opacity",String(r*.5)),y.setAttribute("stroke-width",String(h*2)),y.setAttribute("style","transition: stroke-opacity 0.5s ease-out, stroke-width 0.5s ease-out;"),y.id=`glow-${t}`,s.appendChild(y);const w=document.createElementNS("http://www.w3.org/2000/svg","path");w.setAttribute("d",M),w.setAttribute("class","flow-line"),w.setAttribute("stroke",a),w.setAttribute("stroke-opacity",String(r)),w.setAttribute("stroke-width",String(h)),w.setAttribute("style","transition: stroke-opacity 0.5s ease-out, stroke-width 0.5s ease-out;"),w.id=`path-${t}`,s.appendChild(w);const F=[];for(let $=0;$<this._dotsPerFlow;$++){const v=document.createElementNS("http://www.w3.org/2000/svg","circle");v.setAttribute("class","flow-dot"),v.setAttribute("id",`dot-${t}-${$}`),v.setAttribute("r",String(g)),v.setAttribute("fill",a),v.setAttribute("opacity",String(r)),v.setAttribute("style","transition: opacity 0.5s ease-out, r 0.5s ease-out;"),s.appendChild(v);const S=$/this._dotsPerFlow;F.push({progress:S,velocity:k})}this._flowDots.set(t,F)}}_removeFlow(e,t){const i=e.querySelector(`#${t}`);i&&i.remove(),this._flowDots.delete(t)}_fadeOutFlow(e,t){const i=e.querySelector(`#${t}`);if(!i)return;const n=i.querySelector(`#glow-${t}`),o=i.querySelector(`#path-${t}`);n&&n.setAttribute("stroke-opacity","0"),o&&o.setAttribute("stroke-opacity","0");const a=this._flowDots.get(t);a&&a.forEach((s,r)=>{const c=i.querySelector(`#dot-${t}-${r}`);c&&c.setAttribute("opacity","0")}),setTimeout(()=>{this._removeFlow(e,t)},500)}_extractIconPaths(){["production","battery","grid","load"].forEach(t=>{const i=this.querySelector(`#icon-source-${t}`),n=this.querySelector(`#icon-display-${t}`);if(!i||!n){console.warn(`Icon elements not found for ${t}`);return}const o=i.querySelector("div");if(!o){console.warn(`No div found in foreignObject for ${t}`);return}const a=o.querySelector("ha-icon");if(!a){console.warn(`No ha-icon found for ${t}`);return}const s=a.getAttribute("icon");if(!s){console.warn(`No icon attribute for ${t}`);return}if(this._iconCache.has(s)){const c=this._iconCache.get(s);this._renderIconPath(n,c),i.style.display="none";return}const r=(c=0,l=10)=>{const d=c*100;setTimeout(()=>{try{const h=a.shadowRoot;if(!h){c<l&&r(c+1,l);return}let p=h.querySelector("svg");if(!p){const g=h.querySelector("ha-svg-icon");g&&g.shadowRoot&&(p=g.shadowRoot.querySelector("svg"))}if(!p){c<l&&r(c+1,l);return}const b=p.querySelector("path");if(!b){c<l&&r(c+1,l);return}const x=b.getAttribute("d");x?(this._iconCache.set(s,x),this._renderIconPath(n,x),i.style.display="none"):c<l&&r(c+1,l)}catch(h){console.error(`Failed to extract icon path for ${s} (attempt ${c+1}):`,h),c<l&&r(c+1,l)}},d)};r()}),this._iconsExtracted=!0}_renderIconPath(e,t){if(e.innerHTML="",t){const i=document.createElementNS("http://www.w3.org/2000/svg","path");i.setAttribute("d",t),i.setAttribute("fill","rgb(160, 160, 160)"),i.setAttribute("transform","scale(1)"),e.appendChild(i)}else{const i=document.createElementNS("http://www.w3.org/2000/svg","circle");i.setAttribute("cx","12"),i.setAttribute("cy","12"),i.setAttribute("r","8"),i.setAttribute("fill","rgb(160, 160, 160)"),e.appendChild(i)}}_drawFlow(e,t,i,n,o){const a=document.createElementNS("http://www.w3.org/2000/svg","path"),s=(t.x+i.x)/2,r=(t.y+i.y)/2,c=`M ${t.x},${t.y} Q ${s},${r} ${i.x},${i.y}`;a.setAttribute("d",c),a.setAttribute("class",`flow-line ${o?"flow-positive":"flow-negative"}`),a.setAttribute("id",`path-${Math.random()}`),e.appendChild(a);const l=Math.min(Math.max(Math.floor(n/1e3),1),3);for(let d=0;d<l;d++){const h=document.createElementNS("http://www.w3.org/2000/svg","circle");h.setAttribute("class",`flow-dot ${o?"flow-positive":"flow-negative"}`),h.setAttribute("r","3"),h.setAttribute("fill",o?"var(--success-color, #4caf50)":"var(--error-color, #f44336)");const p=document.createElementNS("http://www.w3.org/2000/svg","animateMotion");p.setAttribute("dur","2s"),p.setAttribute("repeatCount","indefinite"),p.setAttribute("begin",`${d*.6}s`);const b=document.createElementNS("http://www.w3.org/2000/svg","mpath");b.setAttributeNS("http://www.w3.org/1999/xlink","href",`#${a.id}`),p.appendChild(b),h.appendChild(p),e.appendChild(h)}}_renderCompactView(e,t,i,n){const o=this._calculateFlows(e,i,t,n),a=o.productionToLoad,s=o.batteryToLoad,r=o.gridToLoad,c=t||1,l=a/c*100,d=s/c*100,h=r/c*100,p="#4caf50",b="#2196f3",x="#f44336";(!this.querySelector(".compact-view")||this._lastViewMode!=="compact")&&(this.innerHTML=`
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
              <div id="grid-segment" class="bar-segment" style="background: ${x}; width: ${h}%;">
                <div class="bar-segment-content">
                  <ha-icon class="bar-segment-icon" icon="${this._getIcon("grid_icon","grid_entity","mdi:transmission-tower")}"></ha-icon>
                  <span class="bar-segment-label"></span>
                </div>
              </div>
              <div id="battery-segment" class="bar-segment" style="background: ${b}; width: ${d}%;">
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
      `,this._lastViewMode="compact"),requestAnimationFrame(()=>{const m=this.querySelector("#production-segment"),f=this.querySelector("#battery-segment"),u=this.querySelector("#grid-segment"),M=this.querySelector("#load-value-text");if(m){m.style.width=`${l}%`;const _=m.querySelector(".bar-segment-label");_&&a>0&&(_.textContent=`${Math.round(a)}W`);const A=this.querySelector(".bar-container"),T=l/100*(A?.offsetWidth||0);this._updateSegmentVisibility(m,T,a>0)}if(f){f.style.width=`${d}%`;const _=f.querySelector(".bar-segment-label");_&&s>0&&(_.textContent=`${Math.round(s)}W`);const A=this.querySelector(".bar-container"),T=d/100*(A?.offsetWidth||0);this._updateSegmentVisibility(f,T,s>0)}if(u){u.style.width=`${h}%`;const _=u.querySelector(".bar-segment-label");_&&r>0&&(_.textContent=`${Math.round(r)}W`);const A=this.querySelector(".bar-container"),T=h/100*(A?.offsetWidth||0);this._updateSegmentVisibility(u,T,r>0)}M&&(M.textContent=String(Math.round(t)))})}_updateSegmentVisibility(e,t,i){if(!e||!i){e?.setAttribute("data-width-px","");return}t>=80?e.setAttribute("data-width-px","show-label"):t>=40?e.setAttribute("data-width-px","show-icon"):e.setAttribute("data-width-px","")}}customElements.define("energy-flow-card",C),window.customCards=window.customCards||[],window.customCards.push({type:"energy-flow-card",name:"Energy Flow Card",description:"A test energy-flow card."})})();

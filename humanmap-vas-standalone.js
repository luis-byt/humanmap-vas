// humanmap-vas-standalone.js — Cabeza + Cuello + Tórax (2 vistas: anterior/posterior)
(function(){
  const STYLE = `
    :host { display:block; font:14px/1.5 system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, Noto Sans, sans-serif; color:#111827; }
    .hm { position: relative; border: 1px solid #e5e7eb; border-radius: 14px; overflow: hidden; background: #fff; }
    .hm-toolbar { display:grid; grid-template-columns: auto 1fr auto; align-items:center; gap:8px; padding:8px 10px; border-bottom:1px solid #eef2f7; background:#fafafa; }
    .hm-center { text-align:center; font-weight:600; color:#1f2937; }
    .hm-toolbar select, .hm-toolbar button { appearance:none; border:1px solid #d1d5db; border-radius:10px; padding:6px 10px; background:#fff; cursor:pointer; font-weight:500; }
    .hm-canvas-wrap { position:relative; width:100%; height:512px; margin:auto; aspect-ratio: 2/3; background:#fff; }
    svg.hm-svg { position:absolute; inset:0; width:100%; height:100%; }
    .zone { fill: rgba(31,41,55,0); transition: fill 120ms ease; cursor: pointer; }
    .zone:hover { fill: rgba(31,41,55,0.22); }
    .zone.selected { fill: rgba(31,41,55,0.36); }
    .label { fill:#0a0a0a; font-size:36px; pointer-events: none; user-select: none; text-anchor: middle; dominant-baseline: middle; font-weight:800; }
  `;

  // ───────────────────────────────────────────────────────────────────────────
  // ZONAS — Cabeza, Cuello, Tórax
  const ZONES = (() => {
    const cfg = {
      head_right: {x0:0.05, x1:0.90, y0:0.15, y1:0.80},
      head_left:  {x0:0.10, x1:0.95, y0:0.15, y1:0.80},
      neck_right: {x0:0.25, x1:0.75, y0:0.37, y1:0.65},
      neck_left:  {x0:0.25, x1:0.75, y0:0.37, y1:0.65},
      thorax_front: {x0:0.10, x1:0.90, y0:0.35, y1:0.75},
      thorax_back:  {x0:0.10, x1:0.90, y0:0.35, y1:0.75},
    };
    const pad = 0.015;

    function build(view, x0,x1,y0,y1, codes) {
      const zones=[];
      const rows=codes.length, cols=codes[0].length;
      const cw=(x1-x0)/cols, ch=(y1-y0)/rows;
      for(let r=0;r<rows;r++){
        for(let c=0;c<cols;c++){
          const x=x0+c*cw+pad*cw, y=y0+r*ch+pad*ch;
          const w=cw*(1-2*pad), h=ch*(1-2*pad);
          zones.push({
            id:`${view}-r${r+1}c${c+1}`,
            code: codes[r][c],
            label: codes[r][c],
            view, shape:{x,y,w,h}
          });
        }
      }
      return zones;
    }

    // Cabeza
    const headRightCodes=[
      ["1.1.2.1","1.1.3.1","1.1.1.1"],
      ["1.1.2.2","1.1.3.2","1.1.1.2"],
      ["1.1.2.3","1.1.3.3","1.1.1.3"]
    ];
    const headLeftCodes=[
      ["1.2.1.1","1.2.3.1","1.2.2.1"],
      ["1.2.1.2","1.2.3.2","1.2.2.2"],
      ["1.2.1.3","1.2.3.3","1.2.2.3"]
    ];

    // Cuello
    const neckRightCodes=[
      ["2.1.1.1","2.1.2.1"],
      ["2.1.1.2","2.1.2.2"]
    ];
    const neckLeftCodes=[
      ["2.2.1.1","2.2.2.1"],
      ["2.2.1.2","2.2.2.2"]
    ];

    // Tórax — Anterior y Posterior (4x3)
    const thoraxFrontCodes = [
      ["3.1.1.1.2","3.1.1.1.1","3.2.1.1.1","3.2.1.1.2"],
      ["3.1.1.2.2","3.1.1.2.1","3.2.1.2.1","3.2.1.2.2"],
      ["3.1.1.3.2","3.1.1.3.1","3.2.1.3.1","3.2.1.3.2"]
    ];
    const thoraxBackCodes = [
      ["3.2.2.1.2","3.2.2.1.1","3.1.2.1.1","3.1.2.1.2"],
      ["3.2.2.2.2","3.2.2.2.1","3.1.2.2.1","3.1.2.2.2"],
      ["3.2.2.3.2","3.2.2.3.1","3.1.2.3.1","3.1.2.3.2"]
    ];

    return [
      ...build('head_right',...Object.values(cfg.head_right),headRightCodes),
      ...build('head_left',...Object.values(cfg.head_left),headLeftCodes),
      ...build('neck_right',...Object.values(cfg.neck_right),neckRightCodes),
      ...build('neck_left',...Object.values(cfg.neck_left),neckLeftCodes),
      ...build('thorax_front',...Object.values(cfg.thorax_front),thoraxFrontCodes),
      ...build('thorax_back',...Object.values(cfg.thorax_back),thoraxBackCodes)
    ];
  })();

  // Vistas
  const VIEWS = [
    { id: 'head_right', label:'Cabeza — Derecha (1.1)' },
    { id: 'head_left', label:'Cabeza — Izquierda (1.2)' },
    { id: 'neck_right', label:'Cuello — Derecho (2.1)' },
    { id: 'neck_left', label:'Cuello — Izquierdo (2.2)' },
    { id: 'thorax_front', label:'Tórax — Anterior (3.1/3.2)' },
    { id: 'thorax_back', label:'Tórax — Posterior (3.1/3.2)' }
  ];

  // Layout visual
  const VIEW_LAYOUTS = {
    head_right:{vb:[0,0,1024,1536], y:0, h:1536, rotate:0},
    head_left:{vb:[0,0,1024,1536], y:0, h:1536, rotate:0},
    neck_right:{vb:[0,0,1024,1536], y:-200, h:2048, rotate:+12},
    neck_left:{vb:[0,0,1024,1536], y:-200, h:2048, rotate:-12},
    thorax_front:{vb:[0,0,1024,1536], y:-100, h:2048, rotate:0},
    thorax_back:{vb:[0,0,1024,1536], y:-250, h:2048, rotate:0}
  };

  class HumanMapVAS extends HTMLElement{
    constructor(){
      super();
      this.attachShadow({mode:'open'});
      this._view=this.getAttribute('view') || 'head_right';
      this._zones=ZONES;
      this._selected=new Set();
      this._bg={
        head_right:'src/img/head_right.svg',
        head_left:'src/img/head_left.svg',
        neck_right:'src/img/neck_right.svg',
        neck_left:'src/img/neck_left.svg',
        thorax_front:'src/img/torax_front.svg',
        thorax_back:'src/img/torax_back.svg'
      };
    }

    connectedCallback(){this._renderShell();this._renderCanvas();}
    static get observedAttributes() { return ['view']; }
    attributeChangedCallback(n,o,v){if(o!==v&&n==='view'){this._view=v;if(this._root)this._renderCanvas();}}

    getSelected(){
      const map=new Map(this._zones.map(z=>[z.id,z]));
      return Array.from(this._selected).map(id=>{
        const z=map.get(id);
        return{id:z.id,code:z.code,label:z.label,view:z.view};
      });
    }

    clear(){this._selected.clear();this._renderZones();this._emit();}

    _renderShell(){
      const style=document.createElement('style');style.textContent=STYLE;
      this._root=document.createElement('div');this._root.className='hm';
      const opts=VIEWS.map(v=>`<option value="${v.id}">${v.label}</option>`).join('');
      this._root.innerHTML=`
        <div class="hm-toolbar">
          <button id="prev">◀</button>
          <div class="hm-center"><span id="cur"></span></div>
          <div style="display:flex;gap:8px;align-items:center;">
            <button id="next">▶</button>
            <button id="reset">🔄</button>
            <select id="picker">${opts}</select>
          </div>
        </div>
        <div class="hm-canvas-wrap">
          <svg class="hm-svg" xmlns="http://www.w3.org/2000/svg">
            <defs id="defs"></defs>
            <g id="bg"></g>
            <g id="zones"></g>
          </svg>
        </div>`;
      this.shadowRoot.append(style,this._root);
      this._els={
        cur:this.shadowRoot.getElementById('cur'),
        picker:this.shadowRoot.getElementById('picker'),
        svg:this.shadowRoot.querySelector('svg.hm-svg'),
        bg:this.shadowRoot.getElementById('bg'),
        zones:this.shadowRoot.getElementById('zones'),
        prev:this.shadowRoot.getElementById('prev'),
        next:this.shadowRoot.getElementById('next'),
        reset:this.shadowRoot.getElementById('reset')
      };
      this._els.picker.value=this._view;
      this._els.picker.addEventListener('change',()=>this.setAttribute('view',this._els.picker.value));
      this._els.prev.addEventListener('click',()=>this._cycle(-1));
      this._els.next.addEventListener('click',()=>this._cycle(1));
      this._els.reset.addEventListener('click',()=>this.clear());
    }

    _cycle(dir){
      const idx=VIEWS.findIndex(v=>v.id===this._view);
      const next=VIEWS[(idx+dir+VIEWS.length)%VIEWS.length];
      this.setAttribute('view',next.id);
    }

    _renderCanvas(){
      const layout=VIEW_LAYOUTS[this._view];
      const v=VIEWS.find(v=>v.id===this._view);
      if(!layout||!v)return;
      this._els.cur.textContent=v.label;
      this._els.picker.value=v.id;
      this._els.svg.setAttribute('viewBox',layout.vb.join(' '));
      const url=this._bg[v.id];
      const[vx,vy,vw,vh]=layout.vb;
      this._els.bg.innerHTML=`<image href="${url}" x="0" y="${layout.y}" width="${vw}" height="${layout.h}" preserveAspectRatio="xMidYMid meet"/>`;
      this._renderZones();
    }

    _renderZones(){
      const g=this._els.zones;g.innerHTML='';
      const layout=VIEW_LAYOUTS[this._view];
      const[vx,vy,vw,vh]=layout.vb;
      const Z=this._zones.filter(z=>z.view===this._view);
      if(this._view==='neck_right')g.setAttribute('transform',`rotate(12,${vw*0.55},${vh*0.45})`);
      else if(this._view==='neck_left')g.setAttribute('transform',`rotate(-12,${vw*0.45},${vh*0.45})`);
      else g.removeAttribute('transform');
      Z.forEach(z=>{
        const{x,y,w,h}=z.shape;
        const rect=document.createElementNS('http://www.w3.org/2000/svg','rect');
        rect.setAttribute('x',x*vw);rect.setAttribute('y',y*vh);
        rect.setAttribute('width',w*vw);rect.setAttribute('height',h*vh);
        rect.setAttribute('rx',Math.min(w*vw,h*vh)*0.1);
        rect.classList.add('zone');
        if(this._selected.has(z.id))rect.classList.add('selected');
        rect.addEventListener('click',e=>{
          e.stopPropagation();
          if(this._selected.has(z.id))this._selected.delete(z.id);
          else this._selected.add(z.id);
          this._renderZones();this._emit();
        });
        g.appendChild(rect);
        const t=document.createElementNS('http://www.w3.org/2000/svg','text');
        t.setAttribute('x',(x+w/2)*vw);
        t.setAttribute('y',(y+h/2)*vh);
        t.textContent=z.code;
        t.setAttribute('class','label');
        g.appendChild(t);
      });
    }

    _emit(){this.dispatchEvent(new CustomEvent('human-map-vas:select',{detail:{selected:this.getSelected()}}));}
  }

  customElements.define('human-map-vas',HumanMapVAS);
})();

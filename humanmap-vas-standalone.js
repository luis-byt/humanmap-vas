// humanmap-vas-standalone.js — Cabeza + Cuello + Tórax (2 vistas: anterior/posterior)
(function(){
  const STYLE = `
    :host { display:block; font:14px/1.5 system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, Noto Sans, sans-serif; color:#111827; }
    .hm { position: relative; border: 1px solid #e5e7eb; border-radius: 14px; overflow: hidden; background: #fff; }
    .hm-toolbar { display:grid; grid-template-columns: auto 1fr auto; align-items:center; gap:8px; padding:8px 10px; border-bottom:1px solid #eef2f7; background:#fafafa; }
    .hm-center { text-align:center; font-weight:600; color:#1f2937; }
    .hm-toolbar select, .hm-toolbar button { appearance:none; border:1px solid #d1d5db; border-radius:10px; padding:6px 10px; background:#fff; cursor:pointer; font-weight:500; }
    .hm-canvas-wrap { position: relative; width: 100%; height: var(--hm-height, 500px); aspect-ratio: 2 / 3; background: #fff; display: flex; align-items: center; justify-content: center; overflow: hidden; }
    svg.hm-svg { position:absolute; inset:0; width:100%; height:100%; margin: auto; }
    .zone { fill: rgba(31,41,55,0); transition: fill 120ms ease; cursor: pointer; }
    .zone:hover { fill: rgba(31,41,55,0.22); }
    .zone.readonly { cursor: default; }
    .zone.readonly:not(.selected):hover { fill: rgba(31,41,55,0); }
    .zone.selected { fill: rgba(31,41,55,0.36); }
    .hm-all-label { fill: #111827; font-weight: 700; font-size: 36px; text-anchor: middle; dominant-baseline: middle; }
    .label { fill:#0a0a0a; font-size:36px; pointer-events: none; user-select: none; text-anchor: middle; dominant-baseline: middle; font-weight:800; }
    .hm-print-btn { position: absolute; top: 10px; right: 10px; background: rgba(17,24,39,0.85); color: #f9fafb; border: none; border-radius: 8px; cursor: pointer; font-size: 18px; padding: 6px 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.3); transition: opacity 0.25s ease, background 0.2s ease; opacity: 0; pointer-events: none; }
    .hm-canvas-wrap:hover .hm-print-btn { opacity: 1; pointer-events: auto; }
    .hm-print-btn:hover { background: rgba(37,99,235,0.9); }
    .hm-zoom-float { position: absolute; bottom: 10px; right: 10px; background: rgba(31,41,55,0.85); color: #fff; border: none; border-radius: 50%; width: 42px; height: 42px; font-size: 20px; line-height: 1; cursor: pointer; box-shadow: 0 3px 8px rgba(0,0,0,0.3); transition: transform 0.2s ease, background 0.2s ease; z-index: 20; }
    .hm-zoom-float:hover { transform: scale(1.08); background: rgba(31,41,55,1); }
    .hm-zoom-modal { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.85); display: flex; align-items: center; justify-content: center; z-index: 9999; opacity: 0; pointer-events: none; transition: opacity 0.3s ease; }
    .hm-zoom-modal.active { opacity: 1; pointer-events: auto; }
    .hm-zoom-inner { position: relative; width: 95vw; height: 90vh; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; }
    .hm-zoom-content { position: relative; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: #fff; overflow: auto; }
    .hm-zoom-close { position: absolute; top: 12px; right: 12px; border: none; background: rgba(0, 0, 0, 0.75); color: #fff; border-radius: 50%; width: 42px; height: 42px; font-size: 24px; cursor: pointer; z-index: 10000; line-height: 1; }
    .hm-zoom-close:hover { background: rgba(0, 0, 0, 0.9); }
    .hm-zoom-modal svg { width: auto; height: auto; max-width: 100%; max-height: 100%; display: block; transition: transform 0.25s ease; }
    .hm-zoom-inner { transform: scale(0.95); opacity: 0; transition: transform 0.3s ease, opacity 0.3s ease; }
    .hm-zoom-modal.active .hm-zoom-inner { transform: scale(1); opacity: 1; }
    .hm-zoom-hint { position: absolute; bottom: 10px; right: 20px; color: rgba(0,0,0,0.4); font-size: 14px; font-family: system-ui, sans-serif; background: rgba(255,255,255,0.7); padding: 4px 10px; border-radius: 6px; pointer-events: none; user-select: none; transition: opacity 1s ease 2s; opacity: 1; }
    .hm-toolbar .menu-btn { font-size: 18px; width: 36px; height: 32px; line-height: 1; text-align: center; background: #fff; border: 1px solid #d1d5db; border-radius: 10px; cursor: pointer; transition: background 0.2s; }
    .hm-toolbar .menu-btn:hover { background: #f3f4f6; }
    .hm-dropdown { position: absolute; right: 10px; top: 46px; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); display: none; flex-direction: column; z-index: 9999; }
    .hm-dropdown.active { display: flex; }
    .hm-dropdown button { background: none; border: none; padding: 8px 16px; text-align: left; font-size: 14px; cursor: pointer; transition: background 0.15s; }
    .hm-dropdown button:hover { background: #f3f4f6; }
    .hm-loader { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(2px); z-index: 1000; opacity: 0; transition: opacity 0.25s ease; pointer-events: none; }
    .hm-loader.active { opacity: 1; pointer-events: all; }
    .hm-loader::before { content: ''; width: 42px; height: 42px; border: 3px solid rgba(31,41,55,0.2); border-top-color: #3b82f6; border-radius: 50%; animation: hm-spin 1s linear infinite; }
    .hm-loader span { margin-top: 10px; font-size: 14px; color: #1f2937; font-weight: 500; letter-spacing: 0.3px; opacity: 0.85; }
    @keyframes hm-spin { to { transform: rotate(360deg); } }

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
      this._readOnly = this.hasAttribute('read-only') && this.getAttribute('read-only') !== 'false';

      this._upgradeProperty('selectedIds');
      this._upgradeProperty('selectedZones');


      // Detectar automáticamente la ruta base del script (compatible con todos los entornos)
      let scriptBase = '';
      try {
        if (document.currentScript && document.currentScript.src) {
          scriptBase = document.currentScript.src.split('/').slice(0, -1).join('/') + '/';
        } else {
          const scripts = document.getElementsByTagName('script');
          if (scripts.length > 0) {
            const last = scripts[scripts.length - 1];
            scriptBase = last.src.split('/').slice(0, -1).join('/') + '/';
          }
        }
      } catch (err) {
        console.warn('⚠️ No se pudo detectar ruta base del script:', err);
      }

      // Definir la raíz de imágenes (desde atributo o autodetectada)
      this._imgRoot = this.getAttribute('img-root') || (scriptBase + 'src/img/');

      // Configurar rutas base
      this._bg = {
        head_right: this._imgRoot + 'head_right.svg',
        head_left: this._imgRoot + 'head_left.svg',
        neck_right: this._imgRoot + 'neck_right.svg',
        neck_left: this._imgRoot + 'neck_left.svg',
        thorax_front: this._imgRoot + 'torax_front.svg',
        thorax_back: this._imgRoot + 'torax_back.svg'
      };
    }

    _upgradeProperty(prop) {
      if (this.hasOwnProperty(prop)) {
        const value = this[prop];
        delete this[prop];     // elimina la propiedad “propia” del elemento “no mejorado”
        this[prop] = value;    // re-ejecuta el setter ya del elemento mejorado
      }
    }

    connectedCallback(){
      // Asegurar lectura inicial de atributos declarados en el HTML
      this._view = this.getAttribute('view') || this._view || 'head_right';
      this._readOnly = this.hasAttribute('read-only') && this.getAttribute('read-only') !== 'false';
      this._imgRoot = this.getAttribute('img-root') || this._imgRoot;
      this._syncUrl = this.getAttribute('sync-url') || null;

      this._renderShell();
      this._renderCanvas();

      // Ajustar visibilidad del botón reset al conectar
      if (this._els?.reset) {
        this._els.reset.style.display = this._readOnly ? 'none' : 'inline-block';
      }

      this.dispatchEvent(new CustomEvent('human-map-vas:ready'));
      this.dispatchEvent(new CustomEvent('human-map-vas:readonly-change', {
        detail: { readOnly: this._readOnly }
      }));

      window.addEventListener('resize', () => {
        if (this._view === 'all') {
          clearTimeout(this._resizeTimer);
          this._resizeTimer = setTimeout(() => this._renderAllViews(), 150);
        }
      });

      // 🔄 Cargar zonas seleccionadas si hay endpoint definido
      if (this._syncUrl) {
        this._loadZonesFromBackend();
      }
    }

    static get observedAttributes() { return ['view', 'img-root', 'read-only', 'sync-url']; }

    attributeChangedCallback (name, oldValue, newValue) {
      if (oldValue === newValue) return;

      if (name === 'view') {
        this._view = newValue;
        if (this._root) this._renderCanvas();

        this.dispatchEvent(new CustomEvent('human-map-vas:view-changed', {
          detail: { view: newValue }
        }));

        return;
      }

      if (name === 'img-root' && newValue) {
        this._imgRoot = newValue.endsWith('/') ? newValue : newValue + '/';
        this._bg = {
          head_right: this._imgRoot + 'head_right.svg',
          head_left: this._imgRoot + 'head_left.svg',
          neck_right: this._imgRoot + 'neck_right.svg',
          neck_left: this._imgRoot + 'neck_left.svg',
          thorax_front: this._imgRoot + 'torax_front.svg',
          thorax_back: this._imgRoot + 'torax_back.svg'
        };
        if (this._root) this._renderCanvas();
        return;
      }

      if (name === 'read-only') {
        this._readOnly = newValue === 'true' || newValue === true;

        if (this._root) {
          // Refrescar la vista completamente según el modo
          if (this._view === 'all') {
            this._renderAllViews();
          } else {
            this._renderCanvas();
          }

          // Ocultar o mostrar el botón reset según el modo
          if (this._els?.reset) {
            this._els.reset.style.display = this._readOnly ? 'none' : 'inline-block';
          }

          // Actualizar la visibilidad de toolbar y botón de impresión
          const toolbar = this._root.querySelector('.hm-toolbar');
          const printBtn = this.shadowRoot.getElementById('printBtn');

          if (this._view === 'all' && this._readOnly) {
            if (toolbar) toolbar.style.display = 'none';
            if (printBtn) printBtn.style.display = 'block';
          } else {
            if (toolbar) toolbar.style.display = '';
            if (printBtn) printBtn.style.display = 'none';
          }
        }

        return;
      }

      if (name === 'sync-url') {
        this._syncUrl = newValue || null;
        if (this._syncUrl && this._root) this._loadZonesFromBackend();
        return;
      }

    }

    get selectedIds() {
      return Array.from(this._selected);
    }

    set selectedIds(ids) {
      if (!Array.isArray(ids)) return;
      this._selected = new Set(ids);

      if (this._root) {
        // Si está en modo global, renderizamos todas las vistas
        if (this._view === 'all') this._renderAllViews();
        else this._renderZones();
        this._emit();
      }
    }

    get selectedZones() {
      const map = new Map(this._zones.map(z => [z.id, z]));
      return this.selectedIds.map(id => {
        const z = map.get(id);
        return z ? { id: z.id, code: z.code, label: z.label, view: z.view } : { id };
      });
    }

    set selectedZones(zones) {
      if (!Array.isArray(zones)) return;
      const ids = zones.map(z => z && z.id).filter(Boolean);
      this.selectedIds = ids;  // reutiliza el setter de IDs para redibujar y emitir
    }

    get selectedCodes() {
      const map = new Map(this._zones.map(z => [z.id, z]));
      return this.selectedIds.map(id => {
        const z = map.get(id);
        return z ? z.code : { id };
      });
    }

    getSelected(){
      const map=new Map(this._zones.map(z=>[z.id,z]));
      return Array.from(this._selected).map(id=>{
        const z=map.get(id);
        return{id:z.id,code:z.code,label:z.label,view:z.view};
      });
    }

    get syncUrl() { return this._syncUrl; }

    set syncUrl(url) {
      this._syncUrl = url;
      if (this._root && url) this._loadZonesFromBackend();
    }

    clear() {
      // Vaciar la lista de zonas seleccionadas
      this._selected.clear();
    
      // Re-render según el modo actual
      if (this._view === 'all') {
        // Si está en vista global, redibujar todas las vistas
        if (this._root) this._renderAllViews();
      } else {
        // Si es una vista individual, redibujar solo esa vista
        if (this._root) this._renderZones();
      }
    
      // Emitir el evento de actualización
      this._emit();
    }

    _renderShell(){
      const style=document.createElement('style');
      style.textContent=STYLE;

      this._root=document.createElement('div');
      this._root.className='hm';

      const opts = [
        `<option value="all">Todas las vistas</option>`,
        ...VIEWS.map(v => `<option value="${v.id}">${v.label}</option>`)
      ].join('');

      this._root.innerHTML=`
        <div class="hm-toolbar">
          <button id="prev">◀</button>
          <div class="hm-center"><span id="cur"></span></div>
          <div style="display:flex;gap:8px;align-items:center;">
            <button id="next">▶</button>
            <button id="reset">🔄</button>
            <select id="picker">${opts}</select>
            <button id="menu" class="menu-btn" title="Más opciones">⋮</button>
            <div id="dropdown" class="hm-dropdown">
              <button id="export">📤 Exportar zonas (.json)</button>
              <button id="import">📥 Importar zonas (.json)</button>
              <input id="fileInput" type="file" accept=".json" style="display:none;">
            </div>
          </div>
        </div>
        <div class="hm-canvas-wrap">
          <svg class="hm-svg" xmlns="http://www.w3.org/2000/svg">
            <defs id="defs"></defs>
            <g id="bg"></g>
            <g id="zones"></g>
          </svg>
          <div class="hm-loader" id="hm-loader">
            <span>Cargando zonas...</span>
          </div>
          <button id="printBtn" title="Imprimir vista" class="hm-print-btn">🖨️</button>
          <button id="zoom-float" class="hm-zoom-float" title="Ampliar vista">⤢</button>
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
        reset:this.shadowRoot.getElementById('reset'),
        loader: this.shadowRoot.getElementById('hm-loader')
      };
      this._els.picker.value=this._view;
      this._els.picker.addEventListener('change',()=>this.setAttribute('view',this._els.picker.value));

      this._els.prev.addEventListener('click',()=>this._cycle(-1));
      this._els.next.addEventListener('click',()=>this._cycle(1));

      // Ajustar visibilidad inicial del botón reset
      this._els.reset.style.display = this.hasAttribute('read-only') ? 'none' : 'inline-block';
      this._els.reset.addEventListener('click', () => {
        if (!this._readOnly) this.clear();
      });

      this._els.printBtn = this.shadowRoot.getElementById('printBtn');
      this._els.printBtn.addEventListener('click', () => {
        this._els.printBtn.style.transform = 'scale(0.94)';
        setTimeout(() => {
          this._els.printBtn.style.transform = '';
          this._printCanvasOnly(); // ⬅️ imprime solo el área actual
        }, 120);
      });

      this._els.zoomFloat = this.shadowRoot.getElementById('zoom-float');
      this._els.zoomFloat.addEventListener('click', () => this._openPreviewModal());

      // Dropdown menú
      this._els.menu = this.shadowRoot.getElementById('menu');
      this._els.dropdown = this.shadowRoot.getElementById('dropdown');
      this._els.exportBtn = this.shadowRoot.getElementById('export');
      this._els.importBtn = this.shadowRoot.getElementById('import');
      this._els.fileInput = this.shadowRoot.getElementById('fileInput');

      // Mostrar/ocultar menú
      this._els.menu.addEventListener('click', e => {
        e.stopPropagation();
        this._els.dropdown.classList.toggle('active');
      });

      // Cerrar al hacer clic fuera
      document.addEventListener('click', e => {
        if (!this.shadowRoot.contains(e.target)) {
          this._els.dropdown.classList.remove('active');
        }
      });

      // Exportar zonas seleccionadas
      this._els.exportBtn.addEventListener('click', () => {
        this._els.dropdown.classList.remove('active');
        const data = JSON.stringify(this.selectedZones, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'zonas_seleccionadas.json';
        a.click();
        URL.revokeObjectURL(url);
        this._showToast('✅ Zonas exportadas correctamente');
      });

      // Importar zonas desde archivo .json
      this._els.importBtn.addEventListener('click', () => {
        this._els.dropdown.classList.remove('active');
        this._els.fileInput.click();
      });

      this._els.fileInput.addEventListener('change', e => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = evt => {
          try {
            const zones = JSON.parse(evt.target.result);
            if (Array.isArray(zones)) {
              this.selectedZones = zones;
              this._emit();
              this._showToast('✅ Zonas importadas correctamente');
            } else {
              this._showToast('⚠️ El archivo no tiene un formato válido.', 'error');
            }
          } catch (err) {
            this._showToast('⚠️ Error al leer el archivo JSON.', 'error');
          }
        };
        reader.readAsText(file);
      });

    }

    _cycle(dir){
      const idx=VIEWS.findIndex(v=>v.id===this._view);
      const next=VIEWS[(idx+dir+VIEWS.length)%VIEWS.length];
      this.setAttribute('view',next.id);
    }

    _renderCanvas(){
      // Ocultar toolbar si está en modo global y solo lectura
      if (this._els && this._root) {
        const toolbar = this._root.querySelector('.hm-toolbar');
        if (this._view === 'all' && this._readOnly) {
          toolbar.style.display = 'none';
        } else {
          toolbar.style.display = '';
        }
      }

      // Mostrar botón de impresión solo en modo global + solo lectura
      const printBtn = this.shadowRoot.getElementById('printBtn');
      if (printBtn) {
        if (this._view === 'all' && this._readOnly) {
          printBtn.style.display = 'block';
        } else {
          printBtn.style.display = 'none';
        }
      }

      if (this._els.zoomFloat) {
        this._els.zoomFloat.style.display = this._readOnly ? 'block' : 'none';
      }

      // Limpia cualquier render anterior (modo all o vista única)
      if (this._els && this._els.svg) {
        this._els.svg.innerHTML = `
          <defs id="defs"></defs>
          <g id="bg"></g>
          <g id="zones"></g>
        `;
        this._els.bg = this._els.svg.querySelector('#bg');
        this._els.zones = this._els.svg.querySelector('#zones');
      }

      // 🆕 Detección de modo global
      if (this._view === 'all') {
        this._renderAllViews();
        this._els.cur.textContent = 'Todas las vistas';
        this._els.picker.value = 'all';
        this._els.prev.disabled = true;
        this._els.next.disabled = true;
        this._els.reset.disabled = this._readOnly;
        return;
      } else {
        this._els.prev.disabled = false;
        this._els.next.disabled = false;
        this._els.reset.disabled = false;
      }

      // --- Render normal ---
      const layout = VIEW_LAYOUTS[this._view];
      const v = VIEWS.find(v => v.id === this._view);
      if(!layout||!v)return;
      this._els.cur.textContent=v.label;
      this._els.picker.value=v.id;
      this._els.svg.setAttribute('viewBox',layout.vb.join(' '));
      const url=this._bg[v.id];
      const[vx,vy,vw,vh]=layout.vb;
      this._els.bg.innerHTML=`<image href="${url}" x="0" y="${layout.y}" width="${vw}" height="${layout.h}" preserveAspectRatio="xMidYMid meet"/>`;
      this._renderZones();
    }

    _renderAllViews() {
      const svg = this._els.svg;
      svg.innerHTML = ''; // limpiar

      // Permitir configurar columnas dinámicas (por atributo) o calcular automáticamente
      const defaultCols = 4;
      const attrCols = parseInt(this.getAttribute('columns'), 10);
      let cols = !isNaN(attrCols) && attrCols > 0 ? attrCols : defaultCols;

      const gap = 80;
      const cellW = 560, cellH = 720;

      const gridW = cols * (cellW + gap);
      const gridH = Math.ceil(VIEWS.length / cols) * (cellH + gap);

      svg.setAttribute('viewBox', `0 0 ${gridW} ${gridH}`);
      const gRoot = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      svg.appendChild(gRoot);

      VIEWS.forEach((v, i) => {
        const layout = VIEW_LAYOUTS[v.id] || { vb: [0, 0, 1024, 1536], y: 0, h: 1536, rotate: 0 };
        const row = Math.floor(i / cols);
        const col = i % cols;
        const gx = col * (cellW + gap);
        const gy = row * (cellH + gap);

        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        // Escala dinámica: reduce más si hay muchas columnas
        const scale = Math.max(0.3, 0.9 - cols * 0.1);
        g.setAttribute('transform', `translate(${gx}, ${gy}) scale(${scale})`);

        // Fondo (imagen)
        const img = document.createElementNS('http://www.w3.org/2000/svg', 'image');
        img.setAttribute('href', this._bg[v.id]);
        img.setAttribute('x', '0');
        img.setAttribute('y', layout?.y || 0);
        img.setAttribute('width', layout?.vb[2] || 1024);
        img.setAttribute('height', layout?.h || 1536);
        img.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        g.appendChild(img);

        // Grupo para las zonas (permite rotar sin afectar la imagen)
        const gZones = document.createElementNS('http://www.w3.org/2000/svg', 'g');

        // Rotar solo las zonas del cuello
        let rotation = 0;
        if (v.id === 'neck_right') rotation = 12;
        if (v.id === 'neck_left') rotation = -12;
        if (rotation !== 0) {
          gZones.setAttribute(
            'transform',
            `rotate(${rotation}, ${layout.vb[2]*0.55}, ${layout.vb[3]*0.45})`
          );
        }

        // --- Dibujar zonas ---
        const zones = this._zones.filter(z => z.view === v.id);
        zones.forEach(z => {
          const { x, y, w, h } = z.shape;

          // Zona rectangular
          const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          rect.setAttribute('x', x * layout.vb[2]);
          rect.setAttribute('y', y * layout.vb[3]);
          rect.setAttribute('width', w * layout.vb[2]);
          rect.setAttribute('height', h * layout.vb[3]);
          rect.setAttribute('rx', Math.min(w, h) * layout.vb[2] * 0.1);
          rect.classList.add('zone');
          if (this._selected.has(z.id)) rect.classList.add('selected');
          if (this._readOnly) {
            rect.classList.add('readonly');
          } else {
            rect.addEventListener('click', e => {
              e.stopPropagation();
              if (this._selected.has(z.id)) this._selected.delete(z.id);
              else this._selected.add(z.id);
              this._renderAllViews(); // refrescar vista global
              this._emit();
            });
          }
          gZones.appendChild(rect);

          // Label centrado
          const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          t.textContent = z.code;
          t.setAttribute('x', (x + w / 2) * layout.vb[2]);
          t.setAttribute('y', (y + h / 2) * layout.vb[3]);
          t.setAttribute('fill', '#0a0a0a');
          t.setAttribute('font-size', '32');
          t.setAttribute('font-weight', '700');
          t.setAttribute('text-anchor', 'middle');
          t.setAttribute('dominant-baseline', 'middle');
          t.setAttribute('pointer-events', 'none');
          gZones.appendChild(t);
        });

        // Añadir grupo de zonas dentro del grupo principal
        g.appendChild(gZones);


        // Label de la vista
        const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        t.textContent = v.label;
        t.setAttribute('x', layout.vb[2] / 2);
        t.setAttribute('y', 80);
        t.setAttribute('class', 'hm-all-label');
        g.appendChild(t);


        gRoot.appendChild(g);
      });

      if (this._els.zoomFloat) {
        this._els.zoomFloat.style.display = this._readOnly ? 'block' : 'none';
      }

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

        if (this._selected.has(z.id)) rect.classList.add('selected');

        // Si está en modo lectura, añadir clase visual
        if (this._readOnly) {
          rect.classList.add('readonly');
        } else {
          rect.classList.remove('readonly');
          rect.addEventListener('click', e => {
            e.stopPropagation();
            if (this._selected.has(z.id)) this._selected.delete(z.id);
            else this._selected.add(z.id);
            this._renderZones();
            this._emit();
          });
        }


        g.appendChild(rect);

        const t=document.createElementNS('http://www.w3.org/2000/svg','text');

        t.setAttribute('x',(x+w/2)*vw);
        t.setAttribute('y',(y+h/2)*vh);
        t.textContent=z.code;
        t.setAttribute('class','label');
        g.appendChild(t);
      });
    }

    _printCanvasOnly() {
      if (!this._els || !this._els.svg) return;

      // Clonar el SVG actual completo (vistas individuales o "all")
      const clone = this._els.svg.cloneNode(true);

      // Asegurar rutas absolutas en <image> (importante para que se muestren)
      clone.querySelectorAll('image').forEach(img => {
        const href = img.getAttribute('href') || img.getAttributeNS('http://www.w3.org/1999/xlink', 'href');
        if (href) {
          const a = document.createElement('a');
          a.href = href;
          const abs = a.href;
          img.setAttribute('href', abs);
          img.setAttributeNS('http://www.w3.org/1999/xlink', 'href', abs);
        }
      });

      // Inyectar los estilos básicos directamente en el SVG (para conservar colores y transparencias)
      const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
      style.textContent = `
        .zone { fill: rgba(31,41,55,0); cursor: pointer; transition: fill 120ms ease; }
        .zone:hover { fill: rgba(31,41,55,0.22); }
        .zone.selected { fill: rgba(31,41,55,0.36); }
        .label { fill: #0a0a0a; font-size: 36px; font-weight: 800;
                text-anchor: middle; dominant-baseline: middle; pointer-events: none; user-select: none; }
      `;
      clone.insertBefore(style, clone.firstChild);

      const serializer = new XMLSerializer();
      const svgMarkup = serializer.serializeToString(clone);

      const isGlobal = this._view === 'all';

      // HTML limpio con estilos mínimos
      const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="utf-8">
      <title>Impresión del mapa anatómico</title>
      <style>
        html, body {
          margin: 0;
          padding: 0mm;
          background: #fff;
          text-align: center;
        }
        svg {
          width: 100%;
          height: auto;
          display: block;
        }
        .hm-all-label {
          font-family: system-ui, sans-serif;
          font-size: 48px;
          font-weight: 800;
          fill: #111827;
          text-anchor: middle;
          dominant-baseline: middle;
        }
        @page {
          size: ${isGlobal ? 'A4 landscape' : 'A4 portrait'};
          margin: 5mm;
        }
      </style>
    </head>
    <body>
      ${svgMarkup}
    </body>
    </html>
    `;

      // Abrir ventana y escribir el HTML
      const printWin = window.open('', '_blank', 'width=1024,height=768');
      if (!printWin) {
        alert('El navegador bloqueó la ventana de impresión. Permite popups para continuar.');
        return;
      }

      printWin.document.open();
      printWin.document.write(html);
      printWin.document.close();

      // Esperar hasta que las imágenes del SVG estén listas
      const waitForImages = () => {
        const imgs = printWin.document.querySelectorAll('image');
        const promises = Array.from(imgs).map(img => {
          return new Promise(resolve => {
            const test = new Image();
            test.onload = test.onerror = resolve;
            test.src = img.getAttribute('href') || img.getAttributeNS('http://www.w3.org/1999/xlink', 'href');
          });
        });
        return Promise.all(promises);
      };

      waitForImages().then(() => {
        printWin.focus();
        printWin.print();
        setTimeout(() => printWin.close(), 1000);
      });
    }

    _openPreviewModal() {
      if (!this._els || !this._els.svg) return;

      // Clonar el SVG actual
      const clone = this._els.svg.cloneNode(true);

      // Asegurar que las imágenes se vean correctamente (usar rutas absolutas)
      clone.querySelectorAll('image').forEach(img => {
        const href = img.getAttribute('href') || img.getAttributeNS('http://www.w3.org/1999/xlink', 'href');
        if (href) {
          const a = document.createElement('a');
          a.href = href;
          const abs = a.href;
          img.setAttribute('href', abs);
          img.setAttributeNS('http://www.w3.org/1999/xlink', 'href', abs);
        }
      });

      // Ajustar estilos dentro del SVG
      const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
      style.textContent = `
        .zone { fill: rgba(31,41,55,0); cursor: default; transition: fill 120ms ease; }
        .zone.selected { fill: rgba(31,41,55,0.36); }
        .label { fill: #0a0a0a; font-size: 42px; font-weight: 800;
                text-anchor: middle; dominant-baseline: middle;
                pointer-events: none; user-select: none; }
        .hm-all-label {
          font-family: system-ui, sans-serif;
          font-size: 48px;
          font-weight: 800;
          fill: #111827;
          text-anchor: middle;
          dominant-baseline: middle;
        }
      `;
      clone.insertBefore(style, clone.firstChild);

      // Crear el modal
      const modal = document.createElement('div');
      modal.className = 'hm-zoom-modal';
      modal.innerHTML = `
        <div class="hm-zoom-inner">
          <button class="hm-zoom-close" title="Cerrar">×</button>
          <div class="hm-zoom-content"></div>
          <div class="hm-zoom-hint">🖱️ Usa la rueda para hacer zoom y arrastra para mover. Presiona <strong>Esc</strong> para cerrar</div>
        </div>
      `;

      // Insertar el SVG clonado dentro del modal
      modal.querySelector('.hm-zoom-content').appendChild(clone);
      this.shadowRoot.appendChild(modal);

      // Forzar render y animación
      requestAnimationFrame(() => modal.classList.add('active'));
      // 🔒 Bloquear scroll del fondo
      document.body.style.overflow = 'hidden';

      // Cerrar modal
      const close = () => {
        modal.classList.remove('active');

        // 🔓 Restaurar scroll del fondo
        document.body.style.overflow = '';

        setTimeout(() => modal.remove(), 300);

        // Quitar listener del teclado al cerrar
        document.removeEventListener('keydown', onKey);
      };

      modal.querySelector('.hm-zoom-close').addEventListener('click', close);
      modal.addEventListener('click', e => {
        if (e.target === modal) close();
      });

      // 🔑 Cerrar con tecla Escape
      const onKey = e => {
        if (e.key === 'Escape') close();
      };
      document.addEventListener('keydown', onKey);

      // ───────────────────────────────
      // 🔍 Zoom + Pan interactivo
      // ───────────────────────────────
      const content = modal.querySelector('.hm-zoom-content');
      let scale = 1;
      let translateX = 0, translateY = 0;
      let isPanning = false;
      let startX = 0, startY = 0;

      content.addEventListener('wheel', e => {
        e.preventDefault();

        const rect = clone.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const offsetY = e.clientY - rect.top;

        const delta = e.deltaY < 0 ? 0.1 : -0.1;
        const newScale = Math.min(Math.max(scale + delta, 0.5), 3);

        // Mantener el punto bajo el puntero "anclado"
        const dx = offsetX - (offsetX / scale) * newScale;
        const dy = offsetY - (offsetY / scale) * newScale;
        translateX += dx;
        translateY += dy;

        clone.style.transform = `translate(${translateX}px, ${translateY}px) scale(${newScale})`;
        clone.style.transformOrigin = '0 0';
        scale = newScale;
      });

      // ───────────────────────────────
      // 🖱️ Arrastrar (Pan)
      // ───────────────────────────────
      content.addEventListener('mousedown', e => {
        e.preventDefault();
        isPanning = true;
        startX = e.clientX - translateX;
        startY = e.clientY - translateY;
        content.style.cursor = 'grabbing';
      });

      content.addEventListener('mousemove', e => {
        if (!isPanning) return;
        translateX = e.clientX - startX;
        translateY = e.clientY - startY;
        clone.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
      });

      content.addEventListener('mouseup', () => {
        isPanning = false;
        content.style.cursor = 'default';
      });

      content.addEventListener('mouseleave', () => {
        isPanning = false;
        content.style.cursor = 'default';
      });

      // ───────────────────────────────
      // 🔄 Doble clic para resetear vista
      // ───────────────────────────────
      content.addEventListener('dblclick', () => {
        scale = 1;
        translateX = 0;
        translateY = 0;
        clone.style.transform = '';
      });

    }

    _showToast(msg, type = 'success') {
      const toast = document.createElement('div');
      toast.textContent = msg;
      Object.assign(toast.style, {
        position: 'absolute',
        top: '8px',
        right: '10px',
        background: type === 'error' ? '#dc2626' : '#10b981',
        color: '#fff',
        padding: '6px 10px',
        borderRadius: '8px',
        fontSize: '13px',
        opacity: '0',
        transition: 'opacity 0.3s ease',
        zIndex: 9999
      });
      this._root.appendChild(toast);
      requestAnimationFrame(() => (toast.style.opacity = '1'));
      setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 400);
      }, 1500);
    }

    _loadZonesFromBackend() {
      if (!this._syncUrl) return;
    
      this._els?.loader?.classList.add('active');
    
      fetch(this._syncUrl, { method: 'GET' })
        .then(res => res.json())
        .then(data => {
          if (data.status === 'ok' && Array.isArray(data.zones)) {
            this.selectedZones = data.zones;
            this._showToast(`✅ ${data.zones.length} zonas cargadas del servidor`);
          } else {
            console.warn('Respuesta no válida del backend:', data);
            this._showToast('⚠️ No se pudieron cargar las zonas', 'error');
          }
        })
        .catch(err => {
          console.error('❌ Error al obtener zonas:', err);
          this._showToast('❌ Error al conectar con el servidor', 'error');
        })
        .finally(() => {
          this._els?.loader?.classList.remove('active');
        });
    }

    _emit(){this.dispatchEvent(new CustomEvent('human-map-vas:select',{detail:{selected:this.getSelected()}}));}
  }

  customElements.define('human-map-vas',HumanMapVAS);
})();

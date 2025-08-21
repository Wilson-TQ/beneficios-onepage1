// app.js (versión autónoma - usa data/mock.json)
const app = document.getElementById('app');

const DataAPI = {
  async loadMock(){
    const res = await fetch('data/mock.json', { cache: 'no-store' });
    return res.json();
  }
};

const state = {
  user: null,
  tab: 'beneficios',
  data: null
};

function render(){
  app.innerHTML = state.user ? Home() : Login();
  attachEvents();
}

/* ---------------- LOGIN ---------------- */
function Login(){
  return `
  <section class="login">
    <div class="login-card">
      <div class="brand-bar"></div>
      <div class="brand-logo"><img src="assets/img/logo.png" alt="logo"></div>
      <div class="login-content">
        <h1>Acceso a Beneficios</h1>
        <p>Ingresa tu DNI y contraseña</p>
        <div class="field">
          <div class="label">DNI</div>
          <div class="input"><input id="dni" inputmode="numeric" minlength="8" maxlength="12" placeholder="Ej. 46416788"></div>
        </div>
        <div class="field">
          <div class="label">Contraseña</div>
          <div class="input"><input id="pass" type="password" placeholder="Tu contraseña"></div>
        </div>
        <button id="btnLogin" class="btn">Ingresar</button>
        <div class="lock" id="lock">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="10" width="18" height="12" rx="2" ry="2"></rect>
            <path d="M7 10V7a5 5 0 0 1 10 0v3"></path>
          </svg>
        </div>
        <div class="lock-note">Se desbloquea al validar credenciales</div>
        <div class="hint">Prueba: DNI <b>46416788</b> / <b>1234</b> (activo) o DNI <b>11111111</b> / <b>1234</b> (inactivo)</div>
      </div>
    </div>
  </section>`;
}

/* ---------------- HOME ---------------- */
function Home(){
  const u = state.user;
  const activo = !!u.activo;
  const header = `
    <div class="topbar">
      <button id="menuBtn" class="menu-btn" aria-label="menu"><span></span></button>
      <div id="dropdown" class="dropdown">
        <button id="openConfig">Configuración</button>
        <button id="logout">Cerrar sesión</button>
      </div>
    </div>
  `;
  const profile = `
    <div class="center">
      <div class="avatar-wrap">
        <img src="${u.foto}" alt="Foto de ${u.nombres}">
      </div>
      <div class="name">${u.nombres} ${u.apellidos}</div>
      <div class="dni">${u.dni}</div>
      <div class="company">${u.empresa}</div>
      <div class="area">${u.area}</div>
      ${activo ? '' : '<div class="inactive-banner">USUARIO INACTIVO</div>'}
    </div>
  `;

  const tabs = activo ? `
    <div class="pills">
      <button class="pill ${state.tab==='beneficios'?'active':''}" data-tab="beneficios">BENEFICIOS</button>
      <button class="pill ${state.tab==='cupones'?'active':''}" data-tab="cupones">CUPONES</button>
      <button class="pill ${state.tab==='movimientos'?'active':''}" data-tab="movimientos">MOVIMIENTOS</button>
    </div>` : '';

  const list = activo ? Content() : '';

  /* Modales (config + detalle) y backdrop */
  const modals = `
    <div id="backdrop" class="modal-backdrop"></div>

    <div id="configModal" class="modal">
      <h3>Configuración</h3>
      <p>Opciones para el usuario</p>
      <a id="linkDatos" href="#" target="_blank">Mis datos son incorrectos</a>
      <a id="linkProblema" href="#" target="_blank">Quiero reportar un problema</a>
      <button class="btn close" id="closeConfig">Cerrar</button>
      <!-- TODO: Reemplazar los href anteriores por los enlaces de Zoho Forms -->
    </div>

    <div id="itemModal" class="modal detail">
      <h3 id="itemTitle">Título</h3>
      <div class="status" id="itemStatus"></div>
      <div class="code-pill" id="itemCode" title="Toca para copiar"></div>
      <div class="terms-wrap">
        <div class="terms" id="itemTerms"></div>
      </div>
      <button class="btn close" id="closeItem">Cerrar</button>
    </div>
  `;

  /* FAB recargar */
  const fab = `
    <button class="fab" id="refreshBtn" aria-label="Recargar" title="Recargar">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 12a9 9 0 0 1-9 9A9 9 0 1 1 7.5 4.5" />
        <polyline points="21 3 21 12 12 12" />
      </svg>
    </button>
  `;

  return `<main class="app">${header}${profile}${tabs}<div class="content">${list}</div>${modals}${fab}</main>`;
}

/* ---------- LISTAS ---------- */
function Content(){
  const u = state.user;
  const d = state.data;

  if(state.tab === 'beneficios'){
    const items = d.beneficios.filter(x => x.dni === u.dni);
    if(items.length === 0) return '<p>No tienes beneficios asignados aún.</p>';
    return items.map(x => Card(x)).join('');
  }
  if(state.tab === 'cupones'){
    const items = d.cupones.filter(x => x.dni === u.dni);
    if(items.length === 0) return '<p>No tienes cupones.</p>';
    return items.map(x => Card(x, true)).join('');
  }
  if(state.tab === 'movimientos'){
    const items = d.movimientos.filter(x => x.dni === u.dni);
    if(items.length === 0) return '<p>Aún no hay movimientos.</p>';
    return items.map(x => `
      <div class="card">
        <img src="assets/img/coupon.jpg" alt="">
        <div>
          <div class="title">${x.titulo}</div>
          <div class="code">${x.codigo}</div>
          <div class="desc">${x.fecha_uso} • ${x.resultado}</div>
        </div>
      </div>
    `).join('');
  }
  return '';
}

/* Tarjeta clickable:
   - NO se muestra el código.
   - Abre modal con detalles y código grande. */
function Card(x, isCupon=false){
  const today = new Date();
  const venc = isCupon && x.vence ? new Date(x.vence) : null;
  const isVigente = isCupon ? (x.estado?.toLowerCase() === 'vigente' && (!venc || venc >= today)) : null;

  const tag = isCupon
    ? (isVigente ? '<span class="tag ok">Vigente</span>' : '<span class="tag bad">Vencido</span>')
    : '<span class="tag">Beneficio</span>';

  const extra = isCupon
    ? `Vence: ${x.vence} • ${x.restricciones}`
    : x.descripcion;

  return `
    <div class="card" data-type="${isCupon?'cupon':'beneficio'}" data-code="${x.codigo}">
      <img src="${x.imagen}" alt="">
      <div>
        <div class="title">${x.titulo}</div>
        <div class="code">${tag}</div>
        <div class="desc">${extra}</div>
      </div>
    </div>
  `;
}

/* ---------------- Eventos & Modales ---------------- */
function attachEvents(){
  // login
  const btnLogin = document.getElementById('btnLogin');
  if(btnLogin){
    btnLogin.addEventListener('click', async () => {
      const dni = (document.getElementById('dni').value || '').trim();
      const pass = document.getElementById('pass').value;
      const lock = document.getElementById('lock');
      lock.classList.remove('error','success');
      lock.classList.add('unlocking');

      try{
        const data = await DataAPI.loadMock();
        const user = data.users.find(u => u.dni === dni);
        if(!user || user.password !== pass){
          lock.classList.remove('unlocking'); lock.classList.add('error');
          setTimeout(()=> lock.classList.remove('error'), 900);
          return;
        }
        state.data = data;
        state.user = user;
        lock.classList.remove('unlocking');
        lock.classList.add('success');
        setTimeout(render, 380);
      }catch(e){
        alert('Error cargando datos.');
        lock.classList.remove('unlocking');
      }
    });
    return; // no seguir si estamos en login
  }

  // dropdown
  const menuBtn = document.getElementById('menuBtn');
  if(menuBtn){
    const dropdown = document.getElementById('dropdown');
    menuBtn.addEventListener('click', () => dropdown.classList.toggle('show'));
    document.addEventListener('click', (e)=>{
      if(!dropdown.contains(e.target) && e.target !== menuBtn) dropdown.classList.remove('show');
    });
    document.getElementById('logout').addEventListener('click', () => {
      state.user = null; state.tab = 'beneficios'; render();
    });
    document.getElementById('openConfig').addEventListener('click', () => {
      dropdown.classList.remove('show');
      openModal('configModal');
    });
  }

  // tabs
  document.querySelectorAll('.pill').forEach(el => {
    el.addEventListener('click', () => {
      state.tab = el.dataset.tab;
      document.querySelectorAll('.pill').forEach(p=>p.classList.remove('active'));
      el.classList.add('active');
      document.querySelector('.content').innerHTML = Content();
      // reatachar clicks a cards
      attachCardClicks();
    });
  });

  // fab recargar
  const refreshBtn = document.getElementById('refreshBtn');
  if(refreshBtn){
    refreshBtn.addEventListener('click', async () => {
      refreshBtn.classList.add('spin');
      try{
        const data = await DataAPI.loadMock(); // en real → DataAPI.getAsignaciones(state.user.dni)
        state.data = data;
        // Mantener tab actual
        document.querySelector('.content').innerHTML = Content();
        attachCardClicks();
      }finally{
        refreshBtn.classList.remove('spin');
      }
    });
  }

  // modales: cerrar
  const backdrop = document.getElementById('backdrop');
  const closeConfig = document.getElementById('closeConfig');
  const closeItem = document.getElementById('closeItem');
  if(backdrop) backdrop.addEventListener('click', closeAnyModal);
  if(closeConfig) closeConfig.addEventListener('click', closeAnyModal);
  if(closeItem) closeItem.addEventListener('click', closeAnyModal);

  // clicks en cards (beneficios/cupones)
  attachCardClicks();
}

function attachCardClicks(){
  document.querySelectorAll('.card[data-code]').forEach(card=>{
    card.addEventListener('click', () => {
      openItem(card.dataset.type, card.dataset.code);
    });
  });
}

function openModal(id){
  document.getElementById('backdrop').classList.add('open');
  document.getElementById(id).classList.add('open');
}

function closeAnyModal(){
  document.getElementById('backdrop').classList.remove('open');
  ['configModal','itemModal'].forEach(id=>{
    const el = document.getElementById(id);
    if(el) el.classList.remove('open');
  });
}

function openItem(type, code){
  const isCupon = type === 'cupon';
  const arr = isCupon ? state.data.cupones : state.data.beneficios;
  const item = arr.find(x => x.codigo === code && x.dni === state.user.dni);
  if(!item) return;

  // Título
  document.getElementById('itemTitle').textContent = item.titulo;

  // Estado (solo cupones)
  const st = document.getElementById('itemStatus');
  st.innerHTML = '';
  if(isCupon){
    const today = new Date();
    const venc = item.vence ? new Date(item.vence) : null;
    const vigente = (item.estado?.toLowerCase() === 'vigente') && (!venc || venc >= today);
    const span = document.createElement('span');
    span.className = 'pill ' + (vigente ? 'vigente' : 'vencido');
    span.textContent = vigente ? 'Vigente' : 'Cupón vencido';
    st.appendChild(span);
  }

  // Código (visible SOLO en el modal)
  const codeEl = document.getElementById('itemCode');
  codeEl.textContent = item.codigo;
  codeEl.onclick = async ()=> {
    try{ await navigator.clipboard.writeText(item.codigo); 
      const old = codeEl.textContent; codeEl.textContent = '¡Copiado! ' + old; 
      setTimeout(()=> codeEl.textContent = old, 1200);
    }catch{}
  };

  // Términos / condiciones (scroll propio)
  const terms = item.terminos || item.restricciones || item.descripcion || '—';
  document.getElementById('itemTerms').textContent = terms;

  openModal('itemModal');
}

/* Init */
render();

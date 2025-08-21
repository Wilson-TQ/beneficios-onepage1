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
      <div class="badge">Nivel: ${u.nivel || '—'}</div>
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
  `;

  return `<main class="app">${header}${profile}${tabs}<div class="content">${list}</div>${modals}
            <div class="footer-cta"><button class="btn" id="bigMovs">MOVIMIENTOS</button></div>
          </main>`;
}

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

function Card(x, isCupon=false){
  const tag = isCupon
    ? (x.estado === 'Vigente' ? '<span class="tag ok">Vigente</span>' : '<span class="tag bad">Vencido</span>')
    : '<span class="tag">Beneficio</span>';
  const extra = isCupon ? `Vence: ${x.vence} • ${x.restricciones}` : x.descripcion;
  return `
    <div class="card">
      <img src="${x.imagen}" alt="">
      <div>
        <div class="title">${x.titulo}</div>
        <div class="code">${x.codigo} • ${tag}</div>
        <div class="desc">${extra}</div>
      </div>
    </div>
  `;
}

function attachEvents(){
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
  }

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
      document.getElementById('backdrop').classList.add('open');
      document.getElementById('configModal').classList.add('open');
    });

    const closeConfig = () => {
      document.getElementById('backdrop').classList.remove('open');
      document.getElementById('configModal').classList.remove('open');
    };
    document.getElementById('closeConfig').addEventListener('click', closeConfig);
    document.getElementById('backdrop').addEventListener('click', closeConfig);
  }

  document.querySelectorAll('.pill').forEach(el => {
    el.addEventListener('click', () => {
      state.tab = el.dataset.tab;
      document.querySelectorAll('.pill').forEach(p=>p.classList.remove('active'));
      el.classList.add('active');
      document.querySelector('.content').innerHTML = Content();
    });
  });

  const bigMovs = document.getElementById('bigMovs');
  if(bigMovs){
    bigMovs.addEventListener('click', () => {
      state.tab = 'movimientos';
      render();
    });
  }
}

render();

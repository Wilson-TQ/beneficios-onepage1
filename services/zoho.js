export const DataAPI = {
  async loadMock(){
    const res = await fetch('data/mock.json', {cache:'no-store'});
    return await res.json();
  },
  // === Integración real Zoho CRM (borrador) ===
  // Cambia estas funciones para llamar a tu backend /server (Express/Deluge/Functions) que maneje OAuth de Zoho.
  async login(dni, pass){
    // return fetch('/api/login', {method:'POST', body: JSON.stringify({dni, pass})}).then(r=>r.json());
    return null;
  },
  async getUser(dni){
    // return fetch('/api/user?dni='+dni).then(r=>r.json());
    return null;
  },
  async getAsignaciones(dni){
    // return fetch('/api/asignaciones?dni='+dni).then(r=>r.json());
    return null;
  }
};

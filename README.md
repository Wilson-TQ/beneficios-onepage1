
# Beneficios OnePage (Mobile-first)

Single-page app (HTML/CSS/JS) con **login por DNI+password**, animación de desbloqueo, estado **Activo/Inactivo** y pestañas **Beneficios / Cupones / Movimientos**. Optimizado para **Android/iOS** (pantallas pequeñas).

## Estructura de carpetas
```
beneficios-onepage/
├─ index.html
├─ assets/
│  ├─ css/styles.css
│  ├─ js/app.js
│  └─ img/ (logo.png, avatar.jpg, benefit.jpg, coupon.jpg)
├─ data/mock.json
├─ services/zoho.js
└─ server/           # (opcional) backend de ejemplo para Zoho
   ├─ package.json
   └─ index.js
```

## Cómo probar (solo front)
- Abre `index.html` directamente o con un servidor estático (recomendado).
- Credenciales de prueba:
  - Activo: DNI **46416788** / **1234**
  - Inactivo: DNI **11111111** / **1234**

## Reemplaza tus imágenes
- `assets/img/logo.png`: Logo corporativo (512x128 ideal)
- `assets/img/avatar.jpg`: Foto del colaborador (recuadro cuadrado 800x800). **Se recorta circular** y ocupa el **75% del ancho** del dispositivo.
- `assets/img/benefit.jpg` y `assets/img/coupon.jpg`: Imágenes ilustrativas 800x450.

## Integración real con Zoho CRM (sugerida)
1. Crea un **backend** (ej. Express/Functions) que administre el **OAuth** de Zoho.
2. Expón endpoints como:
   - `POST /api/login` (dni, password) → valida en Zoho (o contra módulo Usuarios)
   - `GET /api/user?dni=...` → foto, nombres, empresa, área, activo
   - `GET /api/asignaciones?dni=...` → beneficios/cupones/movimientos
3. En `services/zoho.js`, reemplaza `loadMock()` por llamadas a tu backend.
4. Seguridad: **Nunca** pongas tokens OAuth en el front.
5. Sugerencia de módulos/fields en Zoho CRM:
   - **Contactos** (o módulo custom Colaboradores): DNI, Activo (bool), Empresa, Área, URL de Foto
   - **Asignaciones** (custom): Tipo (`beneficio`/`cupon`), Código, Título, Descripción, Vence (fecha, opcional), Estado, Colaborador (lookup)
   - **Movimientos** (custom): Código, Fecha de uso, Resultado/Estado, Colaborador (lookup)

## Comportamiento solicitado
- Login con **DNI + password** y **animación de desbloqueo** (candado).
- Si **inactivo**: solo foto/nombre/DNI/empresa/área y un banner **USUARIO INACTIVO** en rojo.
- Si **activo**: pestañas **BENEFICIOS / CUPONES / MOVIMIENTOS**.
- Menú hamburguesa (3 líneas) → **Configuración** (modal bloqueante) y **Cerrar sesión**.
- Modal: enlaces a Zoho Forms (colocar luego), ya previsto en el HTML/JS.
- **Una sola pantalla** altamente responsive, centrada en mobile.

## Personalización rápida
- Color corporativo: `--brand: #CE000F` en `assets/css/styles.css`.
- Ancho de foto: `width: 75vw` en `.avatar-wrap`.
- Contenido de tarjetas: función `Card()` en `assets/js/app.js`.

## Servidor opcional
```
cd server
npm install
npm start   # http://localhost:8787
```
Luego adapta `services/zoho.js` para consumir tus endpoints reales.

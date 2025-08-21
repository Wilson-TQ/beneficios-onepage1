import express from 'express';
const app = express();
app.use(express.json());

// Nota: Este servidor debe guardar tokens OAuth de Zoho seguro (env/DB).
// Aquí solo dejamos endpoints de ejemplo.

app.post('/api/login', async (req,res)=>{
  // TODO: validar contra Zoho (Contacts/Leads/Users)
  return res.json({ok:true});
});

app.get('/api/user', async (req,res)=>{
  // TODO: llamar a Zoho CRM y devolver datos del colaborador por DNI
  res.json({});
});

app.get('/api/asignaciones', async (req,res)=>{
  // TODO: devolver beneficios/cupones/movimientos desde módulos o funciones de Zoho
  res.json({});
});

app.listen(8787, ()=> console.log('Server on http://localhost:8787'));

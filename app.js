const express = require('express');
const app = express();
const clienteRoutes = require('./routes/clienteRoutes');
const productoRoutes = require('./routes/productoRoutes');
const adminRoutes = require('./routes/adminRoutes');
const categoriaRoutes = require('./routes/categoriaRoutes');
const cors = require('cors');

app.use(cors());
app.use(express.json());
app.use('/api/clientes', clienteRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/categoria', categoriaRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`API Ferremas corriendo en http://localhost:${PORT}`);
});


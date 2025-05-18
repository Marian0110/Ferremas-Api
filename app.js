const express = require('express');
const app = express();
const clienteRoutes = require('./routes/clienteRoutes');
const productoRoutes = require('./routes/productoRoutes');
const adminRoutes = require('./routes/adminRoutes');
const categoriaRoutes = require('./routes/categoriaRoutes');
const comunaRoutes = require('./routes/comunaRoutes');
const empleadoRoutes = require('./routes/empleadoRoutes');
const rolRoutes = require('./routes/rolRoutes');
const webpayRoutes = require('./routes/webpayRoutes');

const cors = require('cors');
const path = require('path');

app.use(cors());
app.use(express.json());
app.use('/ferremas/clientes', clienteRoutes);
app.use('/ferremas/productos', productoRoutes);
app.use('/ferremas/admin', adminRoutes);
app.use('/ferremas/categoria', categoriaRoutes);
app.use('/ferremas/sucursales', comunaRoutes);
app.use('/ferremas/empleados', empleadoRoutes);
app.use('/ferremas/roles', rolRoutes);
app.use('/ferremas/webpay', webpayRoutes);
// Agregar esta línea a tu app.js
app.use('/ferremas/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`API Ferremas corriendo en http://localhost:${PORT}`);
});


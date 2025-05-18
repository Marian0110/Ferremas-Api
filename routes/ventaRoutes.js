const express = require('express');
const router = express.Router();
const ventaController = require('../controllers/ventaController');

// Ruta para obtener detalles de una venta
router.get('/:id/detalles', ventaController.obtenerDetallesVenta);

// Puedes añadir más rutas de ventas si las necesitas en el futuro
// router.get('/', ventaController.listarVentas);
// router.post('/', ventaController.crearVenta);

module.exports = router;
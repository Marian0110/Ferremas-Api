const express = require('express');
const router = express.Router();
const ventaController = require('../controllers/ventaController');

// Ruta para obtener detalles de una venta
router.get('/detalles/:id', ventaController.obtenerDetallesVenta);
router.get('/listar', ventaController.listarVentas);

module.exports = router;
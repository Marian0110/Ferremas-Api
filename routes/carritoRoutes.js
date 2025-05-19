const express = require('express');
const router = express.Router();
const carritoController = require('../controllers/carritoController');

router.get('/obtener/:clienteId', carritoController.obtenerCarrito);
router.post('/agregar', carritoController.agregarProducto);
router.post('/actualizar', carritoController.actualizarCantidad);
router.post('/eliminar', carritoController.eliminarProducto);
router.post('/vaciar', carritoController.vaciarCarrito);

module.exports = router;
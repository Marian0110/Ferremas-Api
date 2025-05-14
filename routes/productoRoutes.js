//Frontend hace peticion, routes dirige esa URL al controlador
const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');

// CRUD de Productos
router.post('/agregar', productoController.crearProducto);
router.get('/listar', productoController.listarProductos);
router.get('/obtener/:codigo', productoController.obtenerProducto);
router.patch('/actualizar/:codigo', productoController.actualizarProducto);
router.delete('/eliminar/:codigo', productoController.eliminarProducto);

module.exports = router;
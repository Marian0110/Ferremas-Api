//Frontend hace peticion, routes dirige esa URL al controlador
const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');
const upload = require('../middlewares/uploads');

// CRUD de Productos
router.post('/agregar', upload.single('imagen'), productoController.crearProducto);
router.get('/consultar', productoController.consultarProductos);
router.get('/listar', productoController.listarProductos);
router.get('/obtener/:codigo', productoController.obtenerProducto);
router.patch('/actualizar/:codigo', productoController.actualizarProducto);
router.delete('/eliminar/:codigo', productoController.eliminarProducto);

module.exports = router;
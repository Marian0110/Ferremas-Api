//Frontend hace peticion, routes dirige esa URL al controlador
const express = require('express');
const router = express.Router();
const empleadoController = require('../controllers/empleadoController');

router.get('/obtener', empleadoController.obtenerTodos);
router.get('/obtener-empleado/:id', empleadoController.getEmpleadoById);
router.post('/crear', empleadoController.crear);
router.patch('/actualizar/:id', empleadoController.actualizar);
router.delete('/eliminar/:id', empleadoController.eliminar);

module.exports = router;
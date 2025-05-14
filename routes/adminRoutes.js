//Frontend hace peticion, routes dirige esa URL al controlador
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.delete('/crear', adminController.crearAdmin);
router.post('/login', adminController.login);
router.put('/cambiar-contrasena/:usuario', adminController.cambiarContrasena);
router.get('/obtener/:usuario', adminController.obtenerAdmin);
router.delete('/eliminar/:usuario', adminController.eliminarAdmin);

module.exports = router;
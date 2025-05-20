//Frontend hace peticion, routes dirige esa URL al controlador
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.post('/login', adminController.login);
router.put('/cambiar-contrasena', adminController.cambiarContrasena);
router.get('/primer-login/:id_admin', adminController.checkPrimerLogin);
router.post('/crear', adminController.crearAdmin);

module.exports = router;
//Frontend hace peticion, routes dirige esa URL al controlador
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.post('/login', adminController.login);
router.post('/cambiar-contrasena', adminController.cambiarContrasena);
router.get('/primer-login/:id_admin', adminController.checkPrimerLogin);

module.exports = router;
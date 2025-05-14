//Frontend hace peticion, routes dirige esa URL al controlador
const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');

router.post('/registro', clienteController.registrar);
router.post('/login', clienteController.login);

module.exports = router;

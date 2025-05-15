//Frontend hace peticion, routes dirige esa URL al controlador
const express = require('express');
const router = express.Router();
const rolController = require('../controllers/rolController');

router.get('/obtener', rolController.obtenerRoles);

module.exports = router;
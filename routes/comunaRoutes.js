//Frontend hace peticion, routes dirige esa URL al controlador
const express = require('express');
const router = express.Router();
const comunaController = require('../controllers/comunaController');

router.get('/obtener', comunaController.obtenerComunas);
router.get('/region/:id_region', comunaController.getComunasByRegion);

module.exports = router;
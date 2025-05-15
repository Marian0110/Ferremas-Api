//Frontend hace peticion, routes dirige esa URL al controlador
const express = require('express');
const router = express.Router();
const categoriaController = require('../controllers/categoriaController');

router.post('/agregar', categoriaController.agregar);
router.get('/obtener', categoriaController.obtener);


module.exports = router;

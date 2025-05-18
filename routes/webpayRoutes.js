//Frontend hace peticion, routes dirige esa URL al controlador
const express = require('express');
const router = express.Router();
const webpayController = require('../controllers/webpayController');

router.post('/crear-transaccion', webpayController.crearTransaccion);
router.get('/confirmar-transaccion', webpayController.confirmarTransaccion);

module.exports = router;
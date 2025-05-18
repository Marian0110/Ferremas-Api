const ventaService = require('../services/ventaService');

class VentaController {
    async obtenerDetallesVenta(req, res) {
        try {
            const idVenta = req.params.id;
            
            if (!idVenta) {
                return res.status(400).json({ error: 'ID de venta no proporcionado' });
            }
            
            const detallesVenta = await ventaService.obtenerDetallesVenta(idVenta);
            
            res.json(detallesVenta);
        } catch (error) {
            console.error('Error en controlador obtenerDetallesVenta:', error);
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new VentaController();
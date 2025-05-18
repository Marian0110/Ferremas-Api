//Capa de logica de negocio
const ventaRepository = require('../repositories/ventaRepository');
const detalleVentaRepository = require('../repositories/detalleVentaRepository');

class VentaService {
  async registrarVentaPendiente(clienteId, buyOrder, totalAmount, items) {
    try {
        // Crear venta con estado pendiente
        const idVenta = await ventaRepository.crear({
        id_cliente: clienteId,
        total: totalAmount,
        estado: 'PENDIENTE',
        orden_compra: buyOrder
        });
        
        // Registrar detalles de la venta - Validamos formato correcto
        for (const item of items) {
        await detalleVentaRepository.crear({
            id_venta: idVenta,
            id_producto: item.id_producto || item.cod_producto, // Acepta ambos formatos
            cantidad: item.cantidad,
            precio_unitario: item.precio
        });
        }
        
        return idVenta;
    } catch (error) {
        console.error('Error al registrar venta pendiente:', error);
        throw new Error(`Error al registrar venta: ${error.message}`);
    }
    }

    async confirmarVenta(buyOrder, datosTransaccion) {
    try {
        // Buscar venta por orden de compra
        const venta = await ventaRepository.getByOrdenCompra(buyOrder);
        if (!venta) {
        throw new Error(`Venta con orden de compra ${buyOrder} no encontrada`);
        }
        
        // Actualizar estado de la venta
        await ventaRepository.actualizarPorOrdenCompra(buyOrder, {
        estado: 'COMPLETADA',
        datos_transaccion: JSON.stringify(datosTransaccion)
        });
        
        // Actualizar stock de productos
        await detalleVentaRepository.actualizarStock(venta.ID_VENTA);
        
        return true;
    } catch (error) {
        console.error('Error al confirmar venta:', error);
        throw new Error(`Error al confirmar venta: ${error.message}`);
    }
    }

    async obtenerVentasPorCliente(idCliente) {
        try {
            return await ventaRepository.listarVentasPorCliente(idCliente);
        } catch (error) {
            console.error('Error al obtener ventas por cliente:', error);
            throw new Error(`Error al obtener ventas del cliente: ${error.message}`);
        }
    }
    
    // Agregar también esta función para el otro endpoint
    async obtenerDetallesVenta(idVenta) {
        try {
            // Obtener información de la venta
            const venta = await ventaRepository.getById(idVenta);
            
            if (!venta) {
                throw new Error(`Venta con ID ${idVenta} no encontrada`);
            }
            
            // Obtener detalles de la venta
            const detalles = await detalleVentaRepository.getByVentaId(idVenta);
            
            return {
                venta,
                detalles
            };
        } catch (error) {
            console.error('Error al obtener detalles de venta:', error);
            throw new Error(`Error al obtener detalles de venta: ${error.message}`);
        }
    }
}

module.exports = new VentaService();
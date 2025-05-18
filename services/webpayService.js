//Capa de logica de negocio WEBPAY PLUS
const { Options, IntegrationApiKeys, IntegrationCommerceCodes, WebpayPlus } = require('transbank-sdk');
const ventaService = require('./ventaService');
const productoRepository = require('../repositories/productoRepository');

class WebpayService {
  constructor() {
    this.webpay = new WebpayPlus.Transaction(new Options(
      IntegrationCommerceCodes.WEBPAY_PLUS,
      IntegrationApiKeys.WEBPAY,
      'https://webpay3gint.transbank.cl'
    ));
  }

  async crearTransaccion(buyOrder, clienteId, items) {
    const sessionId = `sesion_${Date.now()}`;
    const returnUrl = `http://localhost:3000/ferremas/webpay/confirmar-transaccion`;

    try {
      // Obtener precios actuales y calcular monto total
      const itemsConPreciosActuales = await this.obtenerPreciosActuales(items);
      const amount = this.calcularMontoTotal(itemsConPreciosActuales);
      
      console.log('Items con precios actuales:', itemsConPreciosActuales);
      console.log('Monto total calculado:', amount);

      // Guardar datos previos de la venta en la base de datos
      await ventaService.registrarVentaPendiente(clienteId, buyOrder, amount, itemsConPreciosActuales);
      
      // Crear transacción en Webpay con el monto calculado
      const response = await this.webpay.create(
        buyOrder,
        sessionId,
        amount,
        returnUrl
      );
      
      return {
        url: response.url,
        token: response.token,
        amount: amount // Devolver el monto calculado para información
      };
    } catch (error) {
      console.error('Error en creación de transacción:', error);
      throw new Error(`Error al crear transacción: ${error.message}`);
    }
  }

  // Nuevo método para obtener precios actuales
  async obtenerPreciosActuales(items) {
    const itemsConPreciosActuales = [];
    
    for (const item of items) {
      // Obtener el precio actual del producto desde la BD
      const productoInfo = await productoRepository.getById(item.cod_producto);
      
      if (!productoInfo) {
        throw new Error(`Producto ${item.cod_producto} no encontrado`);
      }
      
      // Verificar stock
      if (productoInfo.STOCK < item.cantidad) {
        throw new Error(`Stock insuficiente para el producto ${item.cod_producto}. Disponible: ${productoInfo.STOCK}`);
      }
      
      // Agregar a la lista con el precio actual
      itemsConPreciosActuales.push({
        cod_producto: item.cod_producto,
        cantidad: item.cantidad,
        precio: productoInfo.PRECIO || 0
      });
    }
    
    return itemsConPreciosActuales;
  }

  // Método para calcular el monto total
  calcularMontoTotal(items) {
    return items.reduce((total, item) => {
      return total + (item.precio * item.cantidad);
    }, 0);
  }

  async confirmarTransaccion(token) {
    try {
        console.log('webpayService: Confirmando transacción con token:', token);
        
        if (!token) {
        throw new Error('Token de WebPay no proporcionado');
        }
        
        // Confirmar transacción con WebPay
        const result = await this.webpay.commit(token);
        
        console.log('webpayService: Resultado de confirmación:', result);
        
        // Validar que la respuesta tenga la estructura esperada
        if (!result || typeof result !== 'object') {
        throw new Error('Respuesta de WebPay inválida o vacía');
        }
        
        // Verificar si el pago fue exitoso
        if (result.response_code === 0) {
        // Actualizar el estado de la venta en la base de datos
        try {
            await ventaService.confirmarVenta(result.buy_order, result);
            console.log(`Venta con orden ${result.buy_order} confirmada en BD`);
        } catch (dbError) {
            console.error('Error al actualizar base de datos:', dbError);
        }
        } else {
        try {
            await ventaService.marcarVentaFallida(result.buy_order, result);
            console.log(`Venta con orden ${result.buy_order} marcada como fallida en BD`);
        } catch (dbError) {
            console.error('Error al actualizar base de datos (venta fallida):', dbError);
        }
        }
        
        return result;
    } catch (error) {
        console.error('Error detallado en confirmarTransaccion:', error);
        throw new Error(`Error al confirmar transacción: ${error.message}`);
    }
    }
}

module.exports = new WebpayService();
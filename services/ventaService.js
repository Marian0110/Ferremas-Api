const ventaRepository = require('../repositories/ventaRepository');
const detalleVentaRepository = require('../repositories/detalleVentaRepository');
const carritoService = require('./carritoService');

class VentaService {
  async registrarVentaPendiente(clienteId, ordenCompra, total, items) {
    try {
      // 1. Crear la venta con estado PENDIENTE
      const ventaData = {
        id_cliente: clienteId,
        total: total,
        estado: 'PENDIENTE',
        orden_compra: ordenCompra
      };

      const idVenta = await ventaRepository.crear(ventaData);

      // 2. Registrar el detalle de cada producto
      for (const item of items) {
        await detalleVentaRepository.crear({
          id_venta: idVenta,
          id_producto: item.cod_producto,
          cantidad: item.cantidad,
          precio_unitario: item.precio
        });
      }

      return {
        id_venta: idVenta,
        orden_compra: ordenCompra
      };
    } catch (error) {
      console.error('Error en registrarVentaPendiente:', error);
      throw new Error(`Error al registrar venta pendiente: ${error.message}`);
    }
  }

  async confirmarVenta(ordenCompra, datosTransaccion) {
    try {
        // 1. Obtener la venta por orden de compra
        const venta = await ventaRepository.getByOrdenCompra(ordenCompra);
        
        if (!venta) {
        throw new Error(`Venta con orden ${ordenCompra} no encontrada`);
        }
        
        // 2. Preparar datos para actualización (sanitizando referencias circulares)
        let datosTransaccionJSON;
        try {
        // Método 1: Eliminar propiedades circulares conocidas
        const datosLimpios = this.eliminarReferenciasCirculares(datosTransaccion);
        datosTransaccionJSON = JSON.stringify(datosLimpios);
        } catch (error) {
        console.error('Error al convertir datosTransaccion a JSON:', error);
        // Método 2: Alternativa segura - guardar solo propiedades simples
        datosTransaccionJSON = JSON.stringify(this.obtenerPropiedadesSimples(datosTransaccion));
        }
        
        const datosActualizacion = {
        estado: 'APROBADA',
        datos_transaccion: datosTransaccionJSON
        };
        
        await ventaRepository.actualizarPorOrdenCompra(ordenCompra, datosActualizacion);
        
        // 3. Actualizar el stock de los productos
        await detalleVentaRepository.actualizarStock(venta.ID_VENTA);
        
        // 4. Vaciar el carrito del cliente
        await carritoService.vaciarCarrito(venta.ID_CLIENTE);
        
        return {
        success: true,
        venta_id: venta.ID_VENTA,
        orden_compra: ordenCompra,
        estado: 'APROBADA'
        };
    } catch (error) {
        console.error('Error en confirmarVenta:', error);
        throw new Error(`Error al confirmar venta: ${error.message}`);
    }
    }

// Método para eliminar referencias circulares conocidas
    eliminarReferenciasCirculares(obj) {
    // Si no es un objeto o es null, devolverlo tal cual
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    
    // Crear una copia para no modificar el original
    let result;
    
    if (Array.isArray(obj)) {
        // Si es un array, procesar cada elemento
        result = [];
        for (const item of obj) {
        result.push(this.eliminarReferenciasCirculares(item));
        }
    } else {
        // Si es un objeto, procesar cada propiedad
        result = {};
        for (const key in obj) {
        // Ignorar propiedades que puedan causar círculos
        if (key === 'parent' || key === '_parent' || key === 'circular') {
            continue;
        }
        result[key] = this.eliminarReferenciasCirculares(obj[key]);
        }
    }
    
    return result;
    }

// Método alternativo: extraer solo propiedades simples
    obtenerPropiedadesSimples(obj) {
    const result = {};
    
    // Solo incluir propiedades de tipos simples
    if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
        for (const key in obj) {
        const value = obj[key];
        // Incluir solo strings, números, booleanos y arrays simples
        if (
            typeof value === 'string' ||
            typeof value === 'number' ||
            typeof value === 'boolean' ||
            value === null
        ) {
            result[key] = value;
        } else if (Array.isArray(value) && value.every(v => 
            typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean' || v === null
        )) {
            result[key] = [...value];
        }
        }
    }
    
    return result;
    }

  async marcarVentaFallida(ordenCompra, datosTransaccion) {
    try {
        let datosTransaccionJSON;
        try {
        const datosLimpios = this.eliminarReferenciasCirculares(datosTransaccion);
        datosTransaccionJSON = JSON.stringify(datosLimpios);
        } catch (error) {
        console.error('Error al convertir datosTransaccion a JSON:', error);
        datosTransaccionJSON = JSON.stringify(this.obtenerPropiedadesSimples(datosTransaccion));
        }
        
        const datosActualizacion = {
        estado: 'RECHAZADA',
        datos_transaccion: datosTransaccionJSON
        };
        
        await ventaRepository.actualizarPorOrdenCompra(ordenCompra, datosActualizacion);
        
        return {
        success: false,
        mensaje: 'Transacción rechazada'
        };
    } catch (error) {
        console.error('Error en marcarVentaFallida:', error);
        throw new Error(`Error al marcar venta como fallida: ${error.message}`);
    }
    }

  async obtenerDetallesVenta(idVenta) {
    try {
        // 1. Obtener datos de la venta
        const venta = await ventaRepository.getById(idVenta);
        
        if (!venta) {
        throw new Error(`Venta con ID ${idVenta} no encontrada`);
        }
        
        // 2. Obtener detalles/items de la venta
        const detalles = await detalleVentaRepository.getByVentaId(idVenta);
        
        // 3. Manejar de forma segura los datos de transacción
        let datosTransaccion = null;
        if (venta.DATOS_TRANSACCION) {
        try {
            // Intentar parsear solo si es un string
            if (typeof venta.DATOS_TRANSACCION === 'string') {
            datosTransaccion = JSON.parse(venta.DATOS_TRANSACCION);
            } else {
            // Si no es un string, usar una versión segura del objeto
            datosTransaccion = this.obtenerPropiedadesSimples(venta.DATOS_TRANSACCION);
            }
        } catch (e) {
            console.error('Error al parsear datos_transaccion:', e);
            datosTransaccion = { error: "No se pudieron procesar los datos de transacción" };
        }
        }
        
        return {
        venta: {
            id: venta.ID_VENTA,
            fecha: venta.FECHA_VENTA,
            total: venta.TOTAL,
            estado: venta.ESTADO,
            orden_compra: venta.ORDEN_COMPRA,
            cliente: {
            id: venta.ID_CLIENTE,
            nombres: venta.NOMBRES,
            apellidos: venta.APELLIDOS,
            correo: venta.CORREO
            },
            datos_transaccion: datosTransaccion
        },
        detalles: detalles.map(detalle => ({
            id: detalle.ID_DETALLE,
            producto: {
            codigo: detalle.COD_PRODUCTO,
            nombre: detalle.NOMBRE_PRODUCTO,
            marca: detalle.MARCA
            },
            cantidad: detalle.CANTIDAD,
            precio_unitario: detalle.PRECIO_UNITARIO,
            subtotal: detalle.SUBTOTAL || (detalle.CANTIDAD * detalle.PRECIO_UNITARIO)
        }))
        };
    } catch (error) {
        console.error('Error en obtenerDetallesVenta:', error);
        throw new Error(`Error al obtener detalles de venta: ${error.message}`);
    }
    }

    async listarVentas() {
    try {
        const ventas = await ventaRepository.listarTodasLasVentas();
        
        return ventas.map(venta => ({
        id: venta.ID_VENTA,
        fecha: venta.FECHA_VENTA,
        total: venta.TOTAL,
        estado: venta.ESTADO,
        orden_compra: venta.ORDEN_COMPRA,
        cliente: {
            id: venta.ID_CLIENTE,
            nombres: venta.NOMBRES,
            apellidos: venta.APELLIDOS,
            correo: venta.CORREO
        }
        }));
    } catch (error) {
        console.error('Error en listarVentas:', error);
        throw new Error(`Error al listar ventas: ${error.message}`);
    }
    }

    async obtenerVentasPorCliente(idCliente) {
        try {
            // Validar ID del cliente
            if (!idCliente || isNaN(idCliente)) {
            throw new Error('ID de cliente inválido');
            }

            // Obtener las ventas del repositorio
            const ventas = await ventaRepository.listarVentasPorCliente(Number(idCliente));

            // Formatear la respuesta
            return ventas.map(venta => ({
            id: venta.ID_VENTA,
            fecha: venta.FECHA_VENTA,
            total: venta.TOTAL,
            estado: venta.ESTADO,
            orden_compra: venta.ORDEN_COMPRA
            }));

        } catch (error) {
            console.error('Error en obtenerVentasPorCliente:', error);
            throw new Error(`Error al obtener ventas del cliente: ${error.message}`);
        }
        }

}

module.exports = new VentaService();
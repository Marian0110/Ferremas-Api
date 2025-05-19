const { Carrito, CarritoItem } = require('../models/carrito');
const carritoRepository = require('../repositories/carritoRepository');
const productoRepository = require('../repositories/productoRepository');

class CarritoService {
  async obtenerCarrito(clienteId) {
    try {
      const carritoDB = await carritoRepository.obtenerCarritoPorCliente(clienteId);
      
      // Verificar el stock actual de cada producto en el carrito
      const itemsConStock = await Promise.all(carritoDB.items.map(async (item) => {
        const producto = await productoRepository.getById(item.COD_PRODUCTO);
        return {
          id: item.ID_ITEM,
          cod_producto: item.COD_PRODUCTO,
          nombre: item.NOMBRE,
          precio: item.PRECIO,
          cantidad: item.CANTIDAD,
          imagen: item.IMAGEN,
          stock_disponible: producto ? producto.STOCK : 0
        };
      }));
      
      return {
        id: carritoDB.ID_CARRITO,
        cliente_id: carritoDB.ID_CLIENTE,
        items: itemsConStock,
        fecha_creacion: carritoDB.FECHA_CREACION,
        fecha_actualizacion: carritoDB.FECHA_ACTUALIZACION,
        total: itemsConStock.reduce((sum, item) => sum + (item.precio * item.cantidad), 0)
      };
    } catch (error) {
      console.error('Error en servicio.obtenerCarrito:', error);
      throw error;
    }
  }

  async agregarProducto(clienteId, codProducto, cantidad = 1) {
    try {
      // Obtener información del producto
      const producto = await productoRepository.getById(codProducto);
      if (!producto) {
        throw new Error(`Producto con código ${codProducto} no encontrado`);
      }
      
      // Verificar stock disponible
      if (producto.STOCK < cantidad) {
        throw new Error(`Stock insuficiente. Disponible: ${producto.STOCK}`);
      }
      
      // Obtener o crear carrito
      const carrito = await carritoRepository.obtenerCarritoPorCliente(clienteId);
      
      // Crear item para el carrito
      const precio = producto.PRECIO || 0;
      const item = new CarritoItem({
        cod_producto: codProducto,
        cantidad,
        precio,
        nombre: producto.NOMBRE,
        imagen: producto.IMAGEN
      });
      
      // Agregar item al carrito
      await carritoRepository.agregarItem(carrito.ID_CARRITO, item);
      
      // Retornar carrito actualizado
      return await this.obtenerCarrito(clienteId);
    } catch (error) {
      console.error('Error en servicio.agregarProducto:', error);
      throw error;
    }
  }

  async actualizarCantidad(clienteId, itemId, cantidad) {
    try {
      await carritoRepository.actualizarCantidad(itemId, cantidad);
      return await this.obtenerCarrito(clienteId);
    } catch (error) {
      console.error('Error en servicio.actualizarCantidad:', error);
      throw error;
    }
  }

  async eliminarProducto(clienteId, itemId) {
    try {
      await carritoRepository.eliminarItem(itemId);
      return await this.obtenerCarrito(clienteId);
    } catch (error) {
      console.error('Error en servicio.eliminarProducto:', error);
      throw error;
    }
  }

  async vaciarCarrito(clienteId) {
    try {
      const carrito = await carritoRepository.obtenerCarritoPorCliente(clienteId);
      await carritoRepository.vaciarCarrito(carrito.ID_CARRITO);
      return await this.obtenerCarrito(clienteId);
    } catch (error) {
      console.error('Error en servicio.vaciarCarrito:', error);
      throw error;
    }
  }
}

module.exports = new CarritoService();
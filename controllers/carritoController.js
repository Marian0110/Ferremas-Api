const carritoService = require('../services/carritoService');

class CarritoController {
  async obtenerCarrito(req, res) {
    try {
      const clienteId = req.params.clienteId;

      if (!clienteId) {
        return res.status(400).json({ error: 'ID de cliente requerido' });
      }

      const carrito = await carritoService.obtenerCarrito(clienteId);
      res.json(carrito);
    } catch (error) {
      console.error('Error en controlador.obtenerCarrito:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async agregarProducto(req, res) {
    try {
      const { clienteId, codProducto, cantidad } = req.body;

      if (!clienteId || !codProducto) {
        return res.status(400).json({ error: 'clienteId y codProducto son requeridos' });
      }

      const carrito = await carritoService.agregarProducto(
        clienteId, 
        codProducto, 
        parseInt(cantidad || 1)
      );
      
      res.json({
        success: true,
        message: 'Producto agregado al carrito',
        carrito
      });
    } catch (error) {
      console.error('Error en controlador.agregarProducto:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async actualizarCantidad(req, res) {
    try {
      const { clienteId, itemId, cantidad } = req.body;

      if (!clienteId || !itemId || cantidad === undefined) {
        return res.status(400).json({ error: 'clienteId, itemId y cantidad son requeridos' });
      }

      const carrito = await carritoService.actualizarCantidad(
        clienteId, 
        itemId, 
        parseInt(cantidad)
      );
      
      res.json({
        success: true,
        message: 'Cantidad actualizada',
        carrito
      });
    } catch (error) {
      console.error('Error en controlador.actualizarCantidad:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async eliminarProducto(req, res) {
    try {
      const { clienteId, itemId } = req.body;

      if (!clienteId || !itemId) {
        return res.status(400).json({ error: 'clienteId y itemId son requeridos' });
      }

      const carrito = await carritoService.eliminarProducto(clienteId, itemId);
      
      res.json({
        success: true,
        message: 'Producto eliminado del carrito',
        carrito
      });
    } catch (error) {
      console.error('Error en controlador.eliminarProducto:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async vaciarCarrito(req, res) {
    try {
      const { clienteId } = req.body;

      if (!clienteId) {
        return res.status(400).json({ error: 'clienteId es requerido' });
      }

      const carrito = await carritoService.vaciarCarrito(clienteId);
      
      res.json({
        success: true,
        message: 'Carrito vaciado',
        carrito
      });
    } catch (error) {
      console.error('Error en controlador.vaciarCarrito:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new CarritoController();
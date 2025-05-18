// Logica HTTP: Recibe el request (el req.body del frontend) y llama al servicio
const productoService = require('../services/productoService');

async function crearProducto(req, res) {
  try {
    const imagen = req.file ? req.file.filename : null;
    
    const id_categoria = req.body.id_categoria ? parseInt(req.body.id_categoria, 10) : undefined;
    
    const productoData = {
      ...req.body,
      id_categoria,
      imagen
    };
    
    console.log('Datos enviados al servicio:', productoData);
    
    const producto = await productoService.crearProducto(productoData);
    res.status(201).json(producto);
  } catch (error) {
    console.error('Error en controlador:', error);
    res.status(500).json({ error: error.message });
  }
}

async function obtenerProducto(req, res) {
  try {
    const producto = await productoService.obtenerProducto(req.params.codigo);
    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(producto);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

async function actualizarProducto(req, res) {
  try {
    const { codigo } = req.params;
    const datosActualizacion = req.body;
    
    if (Object.keys(datosActualizacion).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionaron datos para actualizar'
      });
    }

    const resultado = await productoService.actualizarProducto(codigo, datosActualizacion);
    res.status(200).json(resultado);
  } catch (error) {
    console.error('Error en actualizarProducto:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

async function eliminarProducto(req, res) {
  try {
    const { codigo } = req.params;
    const resultado = await productoService.eliminarProducto(codigo);
    res.status(200).json(resultado);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

async function listarProductos(req, res){
  try {
    const productos = await productoService.listarProductos();
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

async function consultarProductos(req, res){
  try {
    const productos = await productoService.consultarProductos();
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { crearProducto, obtenerProducto, actualizarProducto, eliminarProducto, listarProductos, consultarProductos };
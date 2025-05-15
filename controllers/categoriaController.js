// Logica HTTP: Recibe el request (el req.body del frontend) y llama al servicio
// Controlador para agregar una categoria (vista admin)
const categoriaService = require('../services/categoriaService'); 

async function obtener(req, res) {
  try {
    const categorias = await categoriaService.obtener();
    
    const response = categorias.map(cat => ({
      id_categoria: cat.id_categoria,
      nombre: cat.nombre
    }));
    
    res.status(200).json(response);
  } catch (err) {
    console.error('Error en obtenerTodas:', err);
    res.status(500).json({ 
      success: false,
      message: 'Error al obtener categorías',
      error: err.message 
    });
  }
}

async function agregar(req, res) {
  try {
    if (!req.body.nombre) {
      return res.status(400).json({
        success: false,
        message: 'El nombre es requerido'
      });
    }

    const categoriaCreada = await categoriaService.agregar(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Categoría creada exitosamente',
      data: {
        id_categoria: categoriaCreada.id_categoria,
        nombre: categoriaCreada.nombre
      }
    });
    
  } catch (err) {
    console.error('Error en agregar categoría:', err);
    
    const status = err.message.includes('ya existe') ? 409 : 500;
    res.status(status).json({
      success: false,
      message: err.message || 'Error al crear categoría'
    });
  }
}

module.exports = {
  obtener,
  agregar
};
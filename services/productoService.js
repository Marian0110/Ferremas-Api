//Capa de logica de negocio
const Producto = require('../models/producto');
const productoRepository = require('../repositories/productoRepository');
const categoriaRepository = require('../repositories/categoriaRepository'); 

class ProductoService {
  async crearProducto(productoData) {
    // Validación
    if (!productoData.cod_producto) {
      throw new Error('Código de producto es requerido');
    }
    
    if (productoData.id_categoria === undefined || productoData.id_categoria === null) {
      throw new Error('ID de categoría es requerido');
    }
    
    // Convertir y validar id_categoria
    const idCategoria = Number(productoData.id_categoria);
    if (isNaN(idCategoria)) {
      throw new Error('El ID de categoría debe ser un número válido');
    }
    
    console.log('ID Categoría validado:', idCategoria);

    const producto = new Producto({
      cod_producto: productoData.cod_producto,
      marca: productoData.marca,
      cod_marca: productoData.cod_marca,
      nombre: productoData.nombre,
      precio: Number(productoData.precio) || 0,
      stock: Number(productoData.stock) || 0, 
      id_categoria: idCategoria, // Usar el valor numérico validado
      imagen: productoData.imagen || null
    });

    try {
      const codProducto = await productoRepository.create(producto);
      return { 
        success: true,
        message: 'Producto creado con éxito',
        cod_producto: codProducto 
      };
    } catch (error) {
      console.error('Error en servicio.crearProducto:', error);
      throw error;
    }
  }

  async obtenerProducto(codProducto) {
  const productoDB = await productoRepository.getById(codProducto);
  if (!productoDB) return null;
  
  const response = {
    "Código del producto": productoDB.COD_PRODUCTO,
    "Marca": productoDB.MARCA,
    "Código de marca": productoDB.COD_MARCA,
    "Nombre": productoDB.NOMBRE,
    "Categoría": productoDB.CATEGORIA,
    "Stock": productoDB.STOCK,
    "Imagen": productoDB.IMAGEN || null
  };

  if (productoDB.PRECIO) {
    response.Precio = {
      "Valor": productoDB.PRECIO,
      "Fecha": productoDB.FECHA_PRECIO || new Date().toISOString()
    };
  } else {
    response.Precio = null;
  }

  return response;
 }

  async actualizarProducto(codProducto, productoData) {

  const productoExistente = await this.obtenerProducto(codProducto);
  if (!productoExistente) {
    throw new Error('Producto no encontrado');
  }

  // Solo actualizar los campos que vienen en productoData PATCH
  const datosActualizacion = {
    marca: productoData.marca || productoExistente.Marca,
    cod_marca: productoData.cod_marca || productoExistente["Código de marca"],
    nombre: productoData.nombre || productoExistente.Nombre,
    stock: productoData.stock !== undefined ? Number(productoData.stock) : productoExistente.Stock,
    categoria: productoData.categoria || productoExistente.Categoría,
    precio: productoData.precio !== undefined ? Number(productoData.precio) : null,
    imagen: productoData.imagen || productoExistente.Imagen
  };

  if (productoData.precio !== undefined && isNaN(productoData.precio)) {
    throw new Error('El precio debe ser un número válido');
  }

  await productoRepository.update(codProducto, datosActualizacion);
  
  return {
    success: true,
    message: 'Producto actualizado parcialmente con éxito',
    cod_producto: codProducto
  };
 }

  async eliminarProducto(codProducto) {
  const eliminado = await productoRepository.delete(codProducto);
  
  if (eliminado) {
    return { 
      success: true,
      message: 'Producto eliminado con éxito',
      cod_producto: codProducto
    };
  } else {
    throw new Error('No se pudo eliminar el producto o no existe');
  }
 }

  async listarProductos() {
    const productosDB = await productoRepository.getAll();
    return productosDB.map(producto => ({
      "Código del producto": producto.cod_producto,
      "Marca": producto.marca,
      "Código": producto.cod_marca,
      "Nombre": producto.nombre,
      "Precio": [
        {
          "Fecha": producto.fecha_precio,
          "Valor": producto.precio
        }
      ],
      "Categoría": producto.categoria,
      "stock": producto.stock,
      "Imagen": producto.imagen || null
    }));
  }

  async consultarProductos() {
    const productosDB = await productoRepository.getAll();
    return productosDB.map(producto => ({
      "Código del producto": producto.cod_producto,
      "Marca": producto.marca,
      "Código": producto.cod_marca,
      "Nombre": producto.nombre,
      "Precio": [
        {
          "Fecha": producto.fecha_precio,
          "Valor": producto.precio
        }
      ],
      "Categoría": producto.categoria,
      "stock": producto.stock
    }));
  }
}

module.exports = new ProductoService();
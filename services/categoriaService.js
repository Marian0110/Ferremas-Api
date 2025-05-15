//Capa de logica de negocio

const Categoria = require('../models/categoria');
const categoriaRepository = require('../repositories/categoriaRepository');

async function agregar(datosCategoria) {
  // Validación básica
  if (!datosCategoria.nombre) {
    throw new Error('El nombre de la categoría es requerido');
  }
  const nuevaCategoria = new Categoria(null, datosCategoria.nombre);
  
  const categoriaCreada = await categoriaRepository.agregar(nuevaCategoria);
  
  return new Categoria(
    categoriaCreada.id_categoria,
    categoriaCreada.nombre
  );
}

async function obtener() {
  const resultados = await categoriaRepository.getAll();
  
  return resultados.map(cat => 
    new Categoria(cat.ID_CATEGORIA, cat.NOMBRE)
  );
}

async function obtenerPorId(id) {
  const resultado = await categoriaRepository.getById(id);
  return resultado 
    ? new Categoria(resultado.ID_CATEGORIA, resultado.NOMBRE)
    : null;
}

module.exports = {
  agregar,
  obtener,
  obtenerPorId
};
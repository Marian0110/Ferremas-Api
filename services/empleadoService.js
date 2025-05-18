//Capa de logica de negocio
const EmpleadoRepository = require('../repositories/empleadoRepository');
const Empleado = require('../models/empleado');

class EmpleadoService {
  async obtenerTodos() {
    return await EmpleadoRepository.getAll();
  }

  async getEmpleadoById(id) {
    return await EmpleadoRepository.getById(id);
  }

  async crear(empleadoData) {
    const empleado = new Empleado(
      null,
      empleadoData.nombres,
      empleadoData.apellidos,
      empleadoData.correo,
      empleadoData.telefono,
      empleadoData.contrasena,
      empleadoData.id_rol,
      empleadoData.id_comuna
    );
    return await EmpleadoRepository.crear(empleado);
  }

  async actualizar(id, empleadoData) {
    const empleado = new Empleado(
      id,
      empleadoData.nombres,
      empleadoData.apellidos,
      empleadoData.correo,
      empleadoData.telefono,
      null, // No actualizamos contraseña aquí
      empleadoData.id_rol,
      empleadoData.id_comuna
    );
    return await EmpleadoRepository.actualizar(id, empleado);
  }

  async eliminar(id) {
    const eliminado = await EmpleadoRepository.eliminar(id);
    if (!eliminado) {
      throw new Error('Empleado no encontrado');
    }
    return true;
  }
}

module.exports = new EmpleadoService();
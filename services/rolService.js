//Capa de logica de negocio
const RolRepository = require('../repositories/rolRepository');

class RolService {
  async obtenerRoles() {
    return await RolRepository.obtener();
  }
}

module.exports = new RolService();
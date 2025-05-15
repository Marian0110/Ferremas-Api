//Capa de logica de negocio
const ComunaRepository = require('../repositories/comunaRepository');
const Comuna = require('../models/comuna');

class ComunaService {
  async obtener() {
    return await ComunaRepository.obtener();
  }

  async getComunasByRegion(id_region) {
    return await ComunaRepository.getByRegion(id_region);
  }
}

module.exports = new ComunaService();
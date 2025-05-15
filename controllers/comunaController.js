// Logica HTTP: Recibe el request (el req.body del frontend) y llama al servicio
const ComunaService = require('../services/comunaService');

async function obtenerComunas(req, res) {
  try {
    const comunas = await ComunaService.obtener();
    res.json(comunas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getComunasByRegion(req, res) {
  try {
    const comunas = await ComunaService.getComunasByRegion(req.params.id_region);
    res.json(comunas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { obtenerComunas, getComunasByRegion };
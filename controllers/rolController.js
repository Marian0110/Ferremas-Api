// Logica HTTP: Recibe el request (el req.body del frontend) y llama al servicio
const RolService = require('../services/rolService');

async function obtenerRoles(req, res) {
  try {
    const roles = await RolService.obtenerRoles();
    res.json(roles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { obtenerRoles };
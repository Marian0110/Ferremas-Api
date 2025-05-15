// Logica HTTP: Recibe el request (el req.body del frontend) y llama al servicio
const AdminService = require('../services/adminService');

async function login(req, res) {
  try {
    const { usuario, contrasena } = req.body;

    if (!usuario || !contrasena) {
      return res.status(400).json({
        success: false,
        message: 'Usuario y contraseña son requeridos'
      });
    }

    const result = await AdminService.login(usuario, contrasena);
    res.json(result);
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message || 'Error en el login'
    });
  }
}

async function cambiarContrasena(req, res) {
  try {
    const { id_admin, contrasena_actual, nueva_contrasena } = req.body;

    if (!id_admin || !nueva_contrasena) {
      return res.status(400).json({
        success: false,
        message: 'Datos incompletos'
      });
    }

    const result = await AdminService.cambiarContrasena(
      id_admin,
      contrasena_actual,
      nueva_contrasena
    );

    res.json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

async function checkPrimerLogin(req, res) {
  try {
    const { id_admin } = req.params;
    const esPrimerLogin = await AdminService.esPrimerLogin(id_admin);
    
    res.json({
      success: true,
      primer_login: esPrimerLogin
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}
module.exports = { login, cambiarContrasena, checkPrimerLogin };
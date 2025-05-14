// Logica HTTP: Recibe el request (el req.body del frontend) y llama al servicio
const adminService = require('../services/adminService');

async function crearAdmin(req, res) {
  try {
      await adminService.crearAdmin(req.body);
      
      res.status(201).json({ mensaje: 'Admin registrado exitosamente' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ mensaje: 'Error al registrar admin' });
    }
};

async function login(req, res){
  const { usuario, contrasena } = req.body;
  
    try {
      const admin = await adminService.login(usuario, contrasena);
  
      if (!admin) {
        return res.status(401).json({ mensaje: 'Credenciales incorrectas' });
      }
  
      res.status(200).json({ mensaje: 'Login exitoso', admin });
    } catch (err) {
      console.error('Error al iniciar sesión:', err); 
      res.status(500).json({ mensaje: 'Error al iniciar sesión' });
    }
};

async function cambiarContrasena(req, res) {
  try {
    const { usuario } = req.params;
    const { contrasenaActual, nuevaContrasena } = req.body;
    const resultado = await adminService.cambiarContrasena(usuario, contrasenaActual, nuevaContrasena);
    res.status(200).json(resultado);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

async function obtenerAdmin(req, res) {
  try {
    const { usuario } = req.params;
    const resultado = await adminService.obtenerAdmin(usuario);
    res.status(200).json(resultado);
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

async function eliminarAdmin (req, res){
  try {
    const { usuario } = req.params;
    const resultado = await adminService.eliminarAdmin(usuario);
    res.status(200).json(resultado);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = { login, cambiarContrasena, obtenerAdmin, eliminarAdmin, crearAdmin };
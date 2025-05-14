//Capa de logica de negocio
const Admin = require('../models/admin');
const adminRepository = require('../repositories/adminRepository');

class AdminService {
  async crearAdmin(datos) {

    const nuevoAdmin = new Admin(
        datos.usuario,
        datos.contrasena,
    );

    return await adminRepository.crearAdmin(nuevoAdmin);
 }

  async login(usuario, contrasena) {
      try {
        console.log("Datos recibidos en servicio:", { usuario, contrasena }); // 👈 ¡Agrega esto!
        const admin = await adminRepository.login(usuario, contrasena);
        return admin;
      } catch (err) {
        console.error("Error en servicio (loginAdmin):", err);
        throw err;
      }
  }

  async cambiarContrasena(usuario, contrasenaActual, nuevaContrasena) {
    // Verificar credenciales actuales
    const credencialesValidas = await adminRepository.login(usuario, contrasenaActual);
    if (!credencialesValidas) {
      throw new Error('Contraseña actual incorrecta');
    }

    const actualizado = await adminRepository.cambiarContrasena(usuario, nuevaContrasena);
    if (!actualizado) {
      throw new Error('No se pudo cambiar la contraseña');
    }

    return {
      success: true,
      message: 'Contraseña cambiada con éxito'
    };
  }

  async obtenerAdmin(usuario) {
    const admin = await adminRepository.getByUsuario(usuario);
    if (!admin) {
      throw new Error('Administrador no encontrado');
    }

    return {
      success: true,
      data: {
        id: admin.ID_ADMIN,
        usuario: admin.USUARIO,
        fechaRegistro: admin.FECHA_REGISTRO
      }
    };
  }

  async eliminarAdmin(usuario) {
    const eliminado = await adminRepository.eliminarAdmin(usuario);
    if (!eliminado) {
      throw new Error('No se pudo eliminar el administrador');
    }

    return {
      success: true,
      message: 'Administrador eliminado con éxito'
    };
  }
}

module.exports = new AdminService();
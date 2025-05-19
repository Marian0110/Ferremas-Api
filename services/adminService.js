//Capa de logica de negocio
const AdminRepository = require('../repositories/adminRepository');
const Admin = require('../models/admin');

class AdminService {
  async login(usuario, contrasena) {
    try {
      //Buscar el admin en la BD
      const admin = await AdminRepository.obtener(usuario);
      
      if (!admin) {
        throw new Error('Usuario no encontrado');
      }

      if (admin.contrasena !== contrasena) {
        throw new Error('Contraseña incorrecta');
      }

      return {
        success: true,
        message: 'Login exitoso',
        admin: {
          id_admin: admin.id_admin,
          usuario: admin.usuario
        }
      };
    } catch (error) {
      console.error('Error en AdminService.login:', error);
      throw error;
    }
  }

  async cambiarContrasena(id_admin, contrasenaActual, nuevaContrasena) {
    try {
      //Verificar que el admin existe
      const admin = await AdminRepository.obtenerPorId(id_admin);
      if (!admin) {
        throw new Error('Administrador no encontrado');
      }

      //Verificar contraseña actual (solo si no es primer login)
      if (!admin.primer_login && admin.contrasena !== contrasenaActual) {
        throw new Error('Contraseña actual incorrecta');
      }

      //Actualizar contraseña
      const actualizado = await AdminRepository.cambiarContrasena(
        id_admin, 
        nuevaContrasena
      );

      if (!actualizado) {
        throw new Error('No se pudo actualizar la contraseña');
      }

      return {
        success: true,
        message: 'Contraseña actualizada exitosamente'
      };
    } catch (error) {
      console.error('Error en AdminService.cambiarContrasena:', error);
      throw error;
    }
  }

  async esPrimerLogin(id_admin) {
    const admin = await AdminRepository.obtenerPorId(id_admin);
    return admin ? admin.primer_login : false;
  }

  async crearAdmin(usuario, contrasena) {
    try {
      // Verificar si ya existe un admin con ese usuario
      const adminExistente = await AdminRepository.obtener(usuario);
      
      if (adminExistente) {
        throw new Error('El usuario ya existe');
      }
      
      // Crear el nuevo admin
      const nuevoAdmin = await AdminRepository.crear(usuario, contrasena);
      
      return {
        success: true,
        message: 'Administrador creado exitosamente',
        admin: {
          id_admin: nuevoAdmin.id_admin,
          usuario: nuevoAdmin.usuario
        }
      };
    } catch (error) {
      console.error('Error en AdminService.crearAdmin:', error);
      throw error;
    }
  }
}

module.exports = new AdminService();
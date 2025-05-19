const oracledb = require('oracledb');
const db = require('../db');
const Admin = require('../models/admin');

class AdminRepository {
  async obtener(usuario) {
    let connection;
    try {
      connection = await db.getConnection();
      
      // Consulta para confirmar que la tabla tiene datos
      console.log("Buscando usuario:", usuario);
      const countQuery = await connection.execute(
        `SELECT COUNT(*) AS TOTAL FROM ADMINISTRADOR`,
        [],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      console.log("Total registros en ADMINISTRADOR:", countQuery.rows[0].TOTAL);
      
      // Lista todos los usuarios para verificar
      const allUsers = await connection.execute(
        `SELECT USUARIO FROM ADMINISTRADOR`,
        [],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      console.log("Usuarios disponibles:", allUsers.rows.map(r => r.USUARIO));
      
      // Usar UPPER para ignorar mayúsculas/minúsculas
      const result = await connection.execute(
        `SELECT ID_ADMIN, USUARIO, CONTRASENA, PRIMER_LOGIN, FECHA_REGISTRO 
        FROM ADMINISTRADOR 
        WHERE UPPER(USUARIO) = UPPER(:usuario)`,
        { usuario },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      
      console.log("Filas encontradas:", result.rows.length);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      const adminData = result.rows[0];
      console.log("Datos encontrados:", JSON.stringify({
        id: adminData.ID_ADMIN,
        usuario: adminData.USUARIO,
        // No mostrar contraseña completa por seguridad
        contrasena_length: adminData.CONTRASENA ? adminData.CONTRASENA.length : 0,
        primer_login: adminData.PRIMER_LOGIN
      }));
      
      return new Admin(
        adminData.ID_ADMIN,
        adminData.USUARIO,
        adminData.CONTRASENA,
        adminData.FECHA_REGISTRO,
        adminData.PRIMER_LOGIN === 1
      );
    } catch (error) {
      console.error('Error detallado en AdminRepository.obtener:', error);
      throw error;
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (error) {
          console.error('Error al cerrar conexión:', error);
        }
      }
    }
  }

    async cambiarContrasena(id_admin, nuevaContrasena) {
    let connection;
    try {
        connection = await db.getConnection();
        const result = await connection.execute(
        `UPDATE ADMINISTRADOR 
        SET CONTRASENA = :contrasena, PRIMER_LOGIN = 0
        WHERE ID_ADMIN = :id_admin`,
        {
            contrasena: nuevaContrasena,
            id_admin: id_admin
        },
        { autoCommit: true }
        );
        return result.rowsAffected === 1;
    } catch (error) {
        console.error('Error al cambiar contraseña:', error);
        throw new Error('Error al actualizar contraseña');
    } finally {
        if (connection) await connection.close();
    }
    }

    async obtenerPorId(id_admin) {
    let connection;
    try {
        connection = await db.getConnection();
        const result = await connection.execute(
        `SELECT ID_ADMIN, USUARIO, CONTRASENA, FECHA_REGISTRO, PRIMER_LOGIN
        FROM ADMINISTRADOR 
        WHERE ID_ADMIN = :id_admin`,
        [id_admin],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        return result.rows[0] ? new Admin(
        result.rows[0].ID_ADMIN,
        result.rows[0].USUARIO,
        result.rows[0].CONTRASENA,
        result.rows[0].FECHA_REGISTRO,
        result.rows[0].PRIMER_LOGIN === 1
        ) : null;
    } catch (error) {
        console.error('Error al obtener admin por ID:', error);
        throw new Error('Error al buscar administrador');
    } finally {
        if (connection) await connection.close();
    }
    }

  async crear(usuario, contrasena) {
    let connection;
    try {
      connection = await db.getConnection();
      
      const result = await connection.execute(
        `INSERT INTO ADMINISTRADOR (USUARIO, CONTRASENA) 
        VALUES (:usuario, :contrasena)
        RETURNING ID_ADMIN INTO :id_admin`,
        {
          usuario: usuario,
          contrasena: contrasena,
          id_admin: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
        },
        { autoCommit: true }
      );
      
      console.log("Administrador creado con ID:", result.outBinds.id_admin[0]);
      
      return {
        id_admin: result.outBinds.id_admin[0],
        usuario: usuario,
        contrasena: contrasena,
        primer_login: 1
      };
    } catch (error) {
      console.error('Error al crear administrador:', error);
      throw error;
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (error) {
          console.error('Error al cerrar conexión:', error);
        }
      }
    }
  }
}

module.exports = new AdminRepository();
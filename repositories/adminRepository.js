const oracledb = require('oracledb');
const db = require('../db');
const Admin = require('../models/admin');

class AdminRepository {
  async obtener(usuario) {
    let connection;
    try {
      connection = await db.getConnection();
      const result = await connection.execute(
        `SELECT ID_ADMIN, USUARIO, CONTRASENA, FECHA_REGISTRO 
         FROM ADMINISTRADOR 
         WHERE USUARIO = :usuario`,
        [usuario],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      if (result.rows.length === 0) {
        return null;
      }

      const adminData = result.rows[0];
      return new Admin(
        adminData.ID_ADMIN,
        adminData.USUARIO,
        adminData.CONTRASENA,
        adminData.FECHA_REGISTRO
      );
    } catch (error) {
      console.error('Error en AdminRepository:', error);
      throw new Error('Error al buscar administrador');
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
}

module.exports = new AdminRepository();
//Servicio hace ejecutar el query en ORACLE
const oracledb = require('oracledb');
const db = require('../db');

class AdminRepository {

  async crearAdmin(usuario, contrasena) {
  let connection;
  try {
    connection = await db.getConnection();
    
    const result = await connection.execute(
      `INSERT INTO ADMINISTRADOR (USUARIO, CONTRASENA) 
       VALUES (:usuario, :contrasena)
       RETURNING USUARIO, FECHA_REGISTRO INTO :usuarioOut, :fechaOut`,
      {
        usuario,
        contrasena,
        usuarioOut: { type: oracledb.STRING, dir: oracledb.BIND_OUT },
        fechaOut: { type: oracledb.DATE, dir: oracledb.BIND_OUT }
      },
      { autoCommit: true }
    );
    
    return {
      USUARIO: result.outBinds.usuarioOut[0],
      FECHA_REGISTRO: result.outBinds.fechaOut[0]
    };
  } catch (error) {
    console.error('Error al crear administrador:', error);
    throw new Error('Error al crear administrador en la base de datos');
  } finally {
    if (connection) await connection.close();
  }
 }
    
  async login(usuario, contrasena) {

  let conn;
    try {
      conn = await db.getConnection();
      const result = await conn.execute(
        `SELECT ID_ADMIN, USUARIO, CONTRASENA
         FROM ADMINISTRADOR 
         WHERE USUARIO = :usuario AND CONTRASENA = :contrasena`,
        { usuario, contrasena }
      );
  
      if (result.rows.length === 0) return null;
  
      const row = result.rows[0]; // Asume formato de objeto
      return {
        id: row.ID_ADMIN,
        nombres: row.USUARIO
      };
  
    } catch (err) {
      console.error("Error en repositorio:", err);
      throw err;
    } finally {
      if (conn) await conn.close();
    }
 }

  async cambiarContrasena(usuario, nuevaContrasena) {
    let connection;
    try {
      connection = await db.getConnection();
      const result = await connection.execute(
        `UPDATE ADMINISTRADOR SET CONTRASENA = :nuevaContrasena
         WHERE USUARIO = :usuario`,
        { nuevaContrasena, usuario },
        { autoCommit: true }
      );
      return result.rowsAffected > 0;
    } catch (error) {
      throw error;
    } finally {
      if (connection) await connection.close();
    }
  }

  async getByUsuario(usuario) {
    let connection;
    try {
      connection = await db.getConnection();
      const result = await connection.execute(
        `SELECT ID_ADMIN, USUARIO, FECHA_REGISTRO 
         FROM ADMINISTRADOR WHERE USUARIO = :usuario`,
        { usuario },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      return result.rows[0] || null;
    } catch (error) {
      throw error;
    } finally {
      if (connection) await connection.close();
    }
  }

  async eliminarAdmin(usuario) {
    let connection;
    try {
      connection = await db.getConnection();
      const result = await connection.execute(
        `DELETE FROM ADMINISTRADOR WHERE USUARIO = :usuario`,
        { usuario },
        { autoCommit: true }
      );
      return result.rowsAffected > 0;
    } catch (error) {
      throw error;
    } finally {
      if (connection) await connection.close();
    }
  }
}

module.exports = new AdminRepository();
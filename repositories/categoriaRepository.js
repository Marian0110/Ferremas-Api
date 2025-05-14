//Servicio hace ejecutar el query en ORACLE
const oracledb = require('oracledb');
const db = require('../db');

class CategoriaRepository {
  async getByName(nombre) {
    let connection;
    try {
      connection = await db.getConnection();
      const result = await connection.execute(
        `SELECT ID_CATEGORIA, NOMBRE 
         FROM CATEGORIA 
         WHERE NOMBRE = :nombre`,
        [nombre]
      );
      return result.rows[0] ? { 
        id_categoria: result.rows[0][0], 
        nombre: result.rows[0][1] 
      } : null;
    } finally {
      if (connection) await connection.close();
    }
  }
}

module.exports = new CategoriaRepository();
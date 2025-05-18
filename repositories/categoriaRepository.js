//Servicio hace ejecutar el query en ORACLE
const oracledb = require('oracledb');
const db = require('../db');

class CategoriaRepository {
  async agregar(categoria) {
    let connection;
    try {
      connection = await db.getConnection();
      
      const result = await connection.execute(
        `INSERT INTO CATEGORIA (NOMBRE) 
         VALUES (:nombre) 
         RETURNING ID_CATEGORIA, NOMBRE INTO :id, :nombre_out`,
        {
          nombre: categoria.nombre,
          id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
          nombre_out: { dir: oracledb.BIND_OUT, type: oracledb.STRING }
        },
        { autoCommit: true }
      );

      return {
        id_categoria: result.outBinds.id[0],
        nombre: result.outBinds.nombre_out[0]
      };
      
    } catch (error) {
      if (error.errorNum === 1) {
        throw new Error('Ya existe una categoría con este nombre');
      }
      throw new Error(`Error en repositorio: ${error.message}`);
    } finally {
      if (connection) await connection.close();
    }
  }

  async getAll() {
    let connection;
    try {
      connection = await db.getConnection();
      const result = await connection.execute(
        `SELECT ID_CATEGORIA, NOMBRE 
         FROM CATEGORIA 
         ORDER BY NOMBRE`,
        [],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      return result.rows;
    } catch (error) {
      throw new Error(`Error al obtener categorías: ${error.message}`);
    } finally {
      if (connection) await connection.close();
    }
  }

  async getById(id) {
    let connection;
    try {
      connection = await db.getConnection();
      const result = await connection.execute(
        `SELECT ID_CATEGORIA, NOMBRE 
         FROM CATEGORIA 
         WHERE ID_CATEGORIA = :id`,
        [id],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      return result.rows[0] || null;
    } finally {
      if (connection) await connection.close();
    }
  }
}

module.exports = new CategoriaRepository();
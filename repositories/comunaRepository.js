const oracledb = require('oracledb');
const db = require('../db');
const Comuna = require('../models/comuna');

class ComunaRepository {
  async obtener() {
    let connection;
    try {
      connection = await db.getConnection();
      const result = await connection.execute(
        `SELECT 
          c.NOMBRE_COMUNA, 
          r.NOMBRE_REGION 
         FROM COMUNAS c
         JOIN REGIONES r ON c.ID_REGION = r.ID_REGION
         ORDER BY r.NOMBRE_REGION, c.NOMBRE_COMUNA`,
        [],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      return result.rows;
    } catch (error) {
      console.error('Error al obtener comunas:', error);
      throw new Error(`Error al obtener comunas: ${error.message}`);
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

  async getByRegion(id_region) {
    let connection;
    try {
      connection = await db.getConnection();
      const result = await connection.execute(
        `SELECT NOMBRE_COMUNA FROM COMUNAS 
         WHERE ID_REGION = :id_region 
         ORDER BY NOMBRE_COMUNA`,
        [id_region],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      return result.rows;
    } catch (error) {
      console.error('Error al obtener comunas por región:', error);
      throw new Error(`Error al obtener comunas por región: ${error.message}`);
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

module.exports = new ComunaRepository();
const oracledb = require('oracledb');
const db = require('../db');
const Comuna = require('../models/comuna');

class ComunaRepository {
  async obtener() {
    let connection;
    try {
      connection = await db.getConnection();
      const result = await connection.execute(
        `SELECT c.*, r.NOMBRE_REGION 
         FROM COMUNAS c
         JOIN REGIONES r ON c.ID_REGION = r.ID_REGION
         ORDER BY r.NOMBRE_REGION, c.NOMBRE_COMUNA`,
        [],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      return result.rows;
    } finally {
      if (connection) await connection.close();
    }
  }

  async getByRegion(id_region) {
    let connection;
    try {
      connection = await db.getConnection();
      const result = await connection.execute(
        `SELECT * FROM COMUNAS WHERE ID_REGION = :id_region ORDER BY NOMBRE_COMUNA`,
        [id_region],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      return result.rows;
    } finally {
      if (connection) await connection.close();
    }
  }
}

module.exports = new ComunaRepository();
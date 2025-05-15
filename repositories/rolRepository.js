//Servicio hace ejecutar el query en ORACLE
const oracledb = require('oracledb');
const db = require('../db');

class RolRepository {
  async obtener() {
    let connection;
    try {
      connection = await db.getConnection();
      const result = await connection.execute(
        `SELECT * FROM ROL_EMPLEADO`,
        [],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      return result.rows;
    } finally {
      if (connection) await connection.close();
    }
  }
}

module.exports = new RolRepository();
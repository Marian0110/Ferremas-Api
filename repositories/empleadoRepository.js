
const oracledb = require('oracledb');
const db = require('../db');
const Empleado = require('../models/empleado');

class EmpleadoRepository {
  async getAll() {
    let connection;
    try {
      connection = await db.getConnection();
      const result = await connection.execute(
        `SELECT e.*, r.NOMBRE_ROL, s.NOMBRE_COMUNA 
         FROM EMPLEADOS e
         JOIN ROL_EMPLEADO r ON e.ID_ROL = r.ID_ROL
         JOIN COMUNAS s ON e.ID_COMUNA = s.ID_COMUNA`,
        [],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      return result.rows;
    } finally {
      if (connection) await connection.close();
    }
  }

  async getById(id) {
    let connection;
    try {
      connection = await db.getConnection();
      const result = await connection.execute(
        `SELECT * FROM EMPLEADOS WHERE ID_EMPLEADO = :id`,
        [id],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      return result.rows[0] || null;
    } finally {
      if (connection) await connection.close();
    }
  }

  async crear(empleado) {
    let connection;
    try {
      connection = await db.getConnection();
      const result = await connection.execute(
        `INSERT INTO EMPLEADOS 
         (NOMBRES, APELLIDOS, CORREO, TELEFONO, CONTRASENA, ID_ROL, ID_COMUNA) 
         VALUES (:nombres, :apellidos, :correo, :telefono, :contrasena, :id_rol, :id_comuna) 
         RETURNING ID_EMPLEADO INTO :id`,
        {
          nombres: empleado.nombres,
          apellidos: empleado.apellidos,
          correo: empleado.correo,
          telefono: empleado.telefono,
          contrasena: empleado.contrasena,
          id_rol: empleado.id_rol,
          id_comuna: empleado.id_comuna,
          id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
        },
        { autoCommit: true }
      );
      return result.outBinds.id[0];
    } finally {
      if (connection) await connection.close();
    }
  }

  async actualizart(id, empleado) {
    let connection;
    try {
      connection = await db.getConnection();
      await connection.execute(
        `UPDATE EMPLEADOS SET 
         NOMBRES = :nombres, 
         APELLIDOS = :apellidos,
         CORREO = :correo,
         TELEFONO = :telefono,
         ID_ROL = :id_rol,
         ID_COMUNA = :id_comuna
         WHERE ID_EMPLEADO = :id`,
        {
          nombres: empleado.nombres,
          apellidos: empleado.apellidos,
          correo: empleado.correo,
          telefono: empleado.telefono,
          id_rol: empleado.id_rol,
          id_comuna: empleado.id_comuna,
          id: id
        },
        { autoCommit: true }
      );
      return true;
    } finally {
      if (connection) await connection.close();
    }
  }

  async eliminar(id) {
    let connection;
    try {
      connection = await db.getConnection();
      await connection.execute(
        `DELETE FROM EMPLEADOS WHERE ID_EMPLEADO = :id`,
        [id],
        { autoCommit: true }
      );
      return true;
    } finally {
      if (connection) await connection.close();
    }
  }
}

module.exports = new EmpleadoRepository();
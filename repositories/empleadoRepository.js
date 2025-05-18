
const oracledb = require('oracledb');
const db = require('../db');
const Empleado = require('../models/empleado');

class EmpleadoRepository {
  async getAll() {
    let connection;
    try {
      connection = await db.getConnection();
      const result = await connection.execute(
        `SELECT 
          e.ID_EMPLEADO, 
          e.NOMBRES, 
          e.APELLIDOS, 
          e.CORREO, 
          e.TELEFONO, 
          e.CONTRASENA, 
          r.NOMBRE_ROL, 
          s.NOMBRE_COMUNA 
        FROM EMPLEADOS e
        JOIN ROL_EMPLEADO r ON e.ID_ROL = r.ID_ROL
        JOIN COMUNAS s ON e.ID_COMUNA = s.ID_COMUNA`,
        [],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      return result.rows;
    } catch (error) {
      console.error('Error en empleadoRepository.getAll:', error);
      throw new Error(`Error al obtener empleados: ${error.message}`);
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (error) {
          console.error('Error al cerrar la conexión:', error);
        }
      }
    }
  }

  async getById(id) {
    let connection;
    try {
      connection = await db.getConnection();
      const result = await connection.execute(
        `SELECT 
          e.ID_EMPLEADO, 
          e.NOMBRES, 
          e.APELLIDOS, 
          e.CORREO, 
          e.TELEFONO, 
          e.CONTRASENA, 
          r.NOMBRE_ROL, 
          s.NOMBRE_COMUNA 
        FROM EMPLEADOS e
        JOIN ROL_EMPLEADO r ON e.ID_ROL = r.ID_ROL
        JOIN COMUNAS s ON e.ID_COMUNA = s.ID_COMUNA
        WHERE e.ID_EMPLEADO = :id`,
        { id },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error en empleadoRepository.getById:', error);
      throw new Error(`Error al obtener empleado por ID: ${error.message}`);
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (error) {
          console.error('Error al cerrar la conexión:', error);
        }
      }
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

  async actualizar(id, empleadoData) {
    let connection;
    try {
      connection = await db.getConnection();
      
      // Construir consulta dinámicamente
      let updateFields = [];
      let bindParams = { id: id };
      
      // Solo incluir los campos que no son undefined
      if (empleadoData.nombres !== undefined) {
        updateFields.push('NOMBRES = :nombres');
        bindParams.nombres = empleadoData.nombres;
      }
      
      if (empleadoData.apellidos !== undefined) {
        updateFields.push('APELLIDOS = :apellidos');
        bindParams.apellidos = empleadoData.apellidos;
      }
      
      if (empleadoData.correo !== undefined) {
        updateFields.push('CORREO = :correo');
        bindParams.correo = empleadoData.correo;
      }
      
      if (empleadoData.telefono !== undefined) {
        updateFields.push('TELEFONO = :telefono');
        bindParams.telefono = empleadoData.telefono;
      }
      
      if (empleadoData.id_rol !== undefined) {
        updateFields.push('ID_ROL = :id_rol');
        bindParams.id_rol = empleadoData.id_rol;
      }
      
      if (empleadoData.id_comuna !== undefined) {
        updateFields.push('ID_COMUNA = :id_comuna');
        bindParams.id_comuna = empleadoData.id_comuna;
      }
      
      // Si no hay campos para actualizar, retornar
      if (updateFields.length === 0) {
        return true;
      }
      
      // Construir y ejecutar la consulta
      const query = `UPDATE EMPLEADOS SET ${updateFields.join(', ')} WHERE ID_EMPLEADO = :id`;
      
      console.log('Query de actualización:', query);
      console.log('Parámetros:', bindParams);
      
      await connection.execute(query, bindParams, { autoCommit: true });
      return true;
    } catch (error) {
      console.error('Error en actualizar empleado:', error);
      throw new Error(`Error al actualizar empleado: ${error.message}`);
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
//Servicio hace ejecutar el query en ORACLE
const oracledb = require('oracledb');
const db = require('../db');

class VentaRepository {
  async crear(venta) {
    let connection;
    try {
      connection = await db.getConnection();
      
      // Consulta para insertar venta y retornar ID
      const result = await connection.execute(
        `INSERT INTO VENTAS (
          ID_CLIENTE, 
          TOTAL, 
          ESTADO, 
          ORDEN_COMPRA, 
          FECHA_VENTA
        ) VALUES (
          :id_cliente, 
          :total, 
          :estado, 
          :orden_compra, 
          SYSDATE
        ) RETURNING ID_VENTA INTO :id`,
        {
          id_cliente: venta.id_cliente,
          total: venta.total,
          estado: venta.estado || 'PENDIENTE',
          orden_compra: venta.orden_compra,
          id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
        },
        { autoCommit: true }
      );
      
      return result.outBinds.id[0];
    } catch (error) {
      console.error('Error al crear venta:', error);
      throw new Error(`Error al crear venta: ${error.message}`);
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

  async getById(id) {
    let connection;
    try {
      connection = await db.getConnection();
      const result = await connection.execute(
        `SELECT 
          v.ID_VENTA, 
          v.ID_CLIENTE, 
          v.FECHA_VENTA, 
          v.TOTAL, 
          v.ESTADO, 
          v.ORDEN_COMPRA, 
          v.DATOS_TRANSACCION,
          c.NOMBRES, 
          c.APELLIDOS, 
          c.CORREO
        FROM VENTAS v
        JOIN CLIENTES c ON v.ID_CLIENTE = c.ID_CLIENTE
        WHERE v.ID_VENTA = :id`,
        [id],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error al obtener venta por ID:', error);
      throw new Error(`Error al obtener venta: ${error.message}`);
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

  async actualizarPorOrdenCompra(ordenCompra, datosActualizacion) {
    let connection;
    try {
      connection = await db.getConnection();
      
      // Construir consulta dinámica
      let updateFields = [];
      let bindParams = { orden_compra: ordenCompra };
      
      if (datosActualizacion.estado !== undefined) {
        updateFields.push('ESTADO = :estado');
        bindParams.estado = datosActualizacion.estado;
      }
      
      if (datosActualizacion.total !== undefined) {
        updateFields.push('TOTAL = :total');
        bindParams.total = datosActualizacion.total;
      }
      
      if (datosActualizacion.datos_transaccion !== undefined) {
        updateFields.push('DATOS_TRANSACCION = :datos_transaccion');
        bindParams.datos_transaccion = datosActualizacion.datos_transaccion;
      }
      
      // Si no hay campos para actualizar, retornar
      if (updateFields.length === 0) {
        return false;
      }
      
      // Consulta de actualización
      const query = `
        UPDATE VENTAS SET 
        ${updateFields.join(', ')}
        WHERE ORDEN_COMPRA = :orden_compra
      `;
      
      const result = await connection.execute(
        query,
        bindParams,
        { autoCommit: true }
      );
      
      return result.rowsAffected > 0;
    } catch (error) {
      console.error('Error al actualizar venta por orden de compra:', error);
      throw new Error(`Error al actualizar venta: ${error.message}`);
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

  async getByOrdenCompra(ordenCompra) {
    let connection;
    try {
      connection = await db.getConnection();
      const result = await connection.execute(
        `SELECT 
          v.ID_VENTA, 
          v.ID_CLIENTE, 
          v.FECHA_VENTA, 
          v.TOTAL, 
          v.ESTADO, 
          v.ORDEN_COMPRA, 
          v.DATOS_TRANSACCION,
          c.NOMBRES, 
          c.APELLIDOS, 
          c.CORREO
        FROM VENTAS v
        JOIN CLIENTES c ON v.ID_CLIENTE = c.ID_CLIENTE
        WHERE v.ORDEN_COMPRA = :orden_compra`,
        { orden_compra: ordenCompra },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error al obtener venta por orden de compra:', error);
      throw new Error(`Error al obtener venta: ${error.message}`);
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

  async listarVentasPorCliente(idCliente) {
    let connection;
    try {
      connection = await db.getConnection();
      const result = await connection.execute(
        `SELECT 
          ID_VENTA, 
          FECHA_VENTA, 
          TOTAL, 
          ESTADO, 
          ORDEN_COMPRA
        FROM VENTAS 
        WHERE ID_CLIENTE = :id_cliente
        ORDER BY FECHA_VENTA DESC`,
        { id_cliente: idCliente },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      
      return result.rows;
    } catch (error) {
      console.error('Error al listar ventas por cliente:', error);
      throw new Error(`Error al listar ventas: ${error.message}`);
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

  async listarTodasLasVentas() {
    let connection;
    try {
        connection = await db.getConnection();
        const result = await connection.execute(
        `SELECT 
            v.ID_VENTA, 
            v.ID_CLIENTE, 
            v.FECHA_VENTA, 
            v.TOTAL, 
            v.ESTADO, 
            v.ORDEN_COMPRA,
            c.NOMBRES, 
            c.APELLIDOS, 
            c.CORREO
        FROM VENTAS v
        JOIN CLIENTES c ON v.ID_CLIENTE = c.ID_CLIENTE
        ORDER BY v.FECHA_VENTA DESC`,
        [],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        
        return result.rows;
    } catch (error) {
        console.error('Error al listar todas las ventas:', error);
        throw new Error(`Error al listar ventas: ${error.message}`);
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

module.exports = new VentaRepository();
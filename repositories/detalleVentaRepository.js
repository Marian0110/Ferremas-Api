//Servicio hace ejecutar el query en ORACLE
const oracledb = require('oracledb');
const db = require('../db');

class DetalleVentaRepository {
  async crear(detalle) {
    let connection;
    try {
        connection = await db.getConnection();
        
        const result = await connection.execute(
        `INSERT INTO DETALLE_VENTA (
            ID_VENTA, 
            COD_PRODUCTO,
            CANTIDAD, 
            PRECIO_UNITARIO
        ) VALUES (
            :id_venta, 
            :cod_producto,
            :cantidad, 
            :precio_unitario
        ) RETURNING ID_DETALLE INTO :id`,
        {
            id_venta: detalle.id_venta,
            cod_producto: detalle.id_producto, // Mantenemos el nombre en el objeto JavaScript
            cantidad: detalle.cantidad,
            precio_unitario: detalle.precio_unitario,
            id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
        },
        { autoCommit: true }
        );
        
        return result.outBinds.id[0];
    } catch (error) {
        console.error('Error al crear detalle de venta:', error);
        throw new Error(`Error al crear detalle de venta: ${error.message}`);
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

  async getByVentaId(idVenta) {
    let connection;
    try {
        connection = await db.getConnection();
        const result = await connection.execute(
        `SELECT 
            d.ID_DETALLE, 
            d.ID_VENTA, 
            d.COD_PRODUCTO,
            d.CANTIDAD, 
            d.PRECIO_UNITARIO, 
            d.SUBTOTAL,
            p.NOMBRE as NOMBRE_PRODUCTO,
            p.MARCA,
            p.COD_PRODUCTO
        FROM DETALLE_VENTA d
        JOIN PRODUCTOS p ON d.COD_PRODUCTO = p.COD_PRODUCTO
        WHERE d.ID_VENTA = :id_venta
        ORDER BY d.ID_DETALLE`,
        { id_venta: idVenta },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        
        return result.rows;
    } catch (error) {
        console.error('Error al obtener detalles de venta:', error);
        throw new Error(`Error al obtener detalles: ${error.message}`);
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

  // Método adicional para actualizar stock después de una venta confirmada
  async actualizarStock(idVenta) {
    let connection;
    try {
        connection = await db.getConnection();
        
        // Agregar log para verificar ID de venta
        console.log(`Actualizando stock para venta ID: ${idVenta}`);
        
        // Obtener los detalles de la venta primero para verificar
        const detalles = await this.getByVentaId(idVenta);
        console.log('Detalles de venta a procesar:', detalles);
        
        if (!detalles || detalles.length === 0) {
        console.log('No se encontraron detalles para esta venta');
        return 0;
        }

        // Verificar el nombre del campo en la tabla DETALLE_VENTA
        // Primero intentar con la estructura que pensamos que es correcta
        let result;
        try {
        result = await connection.execute(
            `UPDATE PRODUCTOS p
            SET p.STOCK = p.STOCK - (
            SELECT d.CANTIDAD 
            FROM DETALLE_VENTA d 
            WHERE d.ID_VENTA = :id_venta AND d.COD_PRODUCTO = p.COD_PRODUCTO
            )
            WHERE EXISTS (
            SELECT 1 
            FROM DETALLE_VENTA d 
            WHERE d.ID_VENTA = :id_venta AND d.COD_PRODUCTO = p.COD_PRODUCTO
            )`,
            { id_venta: idVenta },
            { autoCommit: true }
        );
        } catch (sqlError) {
        console.error('Error en la primera consulta SQL:', sqlError);
        
        // Intentar con el otro posible nombre de campo
        console.log('Intentando con campo ID_PRODUCTO...');
        result = await connection.execute(
            `UPDATE PRODUCTOS p
            SET p.STOCK = p.STOCK - (
            SELECT d.CANTIDAD 
            FROM DETALLE_VENTA d 
            WHERE d.ID_VENTA = :id_venta AND d.ID_PRODUCTO = p.COD_PRODUCTO
            )
            WHERE EXISTS (
            SELECT 1 
            FROM DETALLE_VENTA d 
            WHERE d.ID_VENTA = :id_venta AND d.ID_PRODUCTO = p.COD_PRODUCTO
            )`,
            { id_venta: idVenta },
            { autoCommit: true }
        );
        }
        
        console.log(`Actualización de stock completada. Filas afectadas: ${result.rowsAffected}`);
        return result.rowsAffected;
    } catch (error) {
        console.error('Error al actualizar stock post-venta:', error);
        throw new Error(`Error al actualizar stock: ${error.message}`);
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

module.exports = new DetalleVentaRepository();
const oracledb = require('oracledb');
const db = require('../db');

class CarritoRepository {
  async obtenerCarritoPorCliente(clienteId) {
    let connection;
    try {
      connection = await db.getConnection();
      
      // Verificar si el cliente ya tiene un carrito
      const carrito = await connection.execute(
        `SELECT ID_CARRITO, ID_CLIENTE, FECHA_CREACION, FECHA_ACTUALIZACION
         FROM CARRITOS
         WHERE ID_CLIENTE = :clienteId`,
        { clienteId },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      if (carrito.rows.length === 0) {
        // Crear un nuevo carrito si no existe
        const result = await connection.execute(
          `INSERT INTO CARRITOS (ID_CLIENTE, FECHA_CREACION, FECHA_ACTUALIZACION)
           VALUES (:clienteId, SYSDATE, SYSDATE)
           RETURNING ID_CARRITO INTO :id`,
          {
            clienteId,
            id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
          },
          { autoCommit: true }
        );
        
        const carritoId = result.outBinds.id[0];
        
        return {
          ID_CARRITO: carritoId,
          ID_CLIENTE: clienteId,
          FECHA_CREACION: new Date(),
          FECHA_ACTUALIZACION: new Date(),
          items: []
        };
      }

      // Obtener los items del carrito
      const items = await connection.execute(
        `SELECT ci.ID_ITEM, ci.COD_PRODUCTO, ci.CANTIDAD, ci.PRECIO,
                p.NOMBRE, p.IMAGEN
         FROM CARRITO_ITEMS ci
         JOIN PRODUCTOS p ON ci.COD_PRODUCTO = p.COD_PRODUCTO
         WHERE ci.ID_CARRITO = :carritoId`,
        { carritoId: carrito.rows[0].ID_CARRITO },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      return {
        ...carrito.rows[0],
        items: items.rows
      };
    } catch (error) {
      console.error('Error al obtener carrito:', error);
      throw new Error(`Error al obtener carrito: ${error.message}`);
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

  async agregarItem(carritoId, item) {
    let connection;
    try {
      connection = await db.getConnection();
      
      // Verificar si el producto ya está en el carrito
      const existingItem = await connection.execute(
        `SELECT ID_ITEM, CANTIDAD 
         FROM CARRITO_ITEMS 
         WHERE ID_CARRITO = :carritoId AND COD_PRODUCTO = :codProducto`,
        { 
          carritoId, 
          codProducto: item.cod_producto 
        },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      let itemId;
      
      if (existingItem.rows.length > 0) {
        // Actualizar cantidad si ya existe
        const nuevaCantidad = existingItem.rows[0].CANTIDAD + item.cantidad;
        
        await connection.execute(
          `UPDATE CARRITO_ITEMS 
           SET CANTIDAD = :cantidad, PRECIO = :precio
           WHERE ID_ITEM = :itemId`,
          {
            cantidad: nuevaCantidad,
            precio: item.precio,
            itemId: existingItem.rows[0].ID_ITEM
          },
          { autoCommit: true }
        );
        
        itemId = existingItem.rows[0].ID_ITEM;
      } else {
        // Insertar nuevo item
        const result = await connection.execute(
          `INSERT INTO CARRITO_ITEMS (
            ID_CARRITO, 
            COD_PRODUCTO, 
            CANTIDAD, 
            PRECIO
          ) VALUES (
            :carritoId, 
            :codProducto, 
            :cantidad, 
            :precio
          ) RETURNING ID_ITEM INTO :id`,
          {
            carritoId,
            codProducto: item.cod_producto,
            cantidad: item.cantidad,
            precio: item.precio,
            id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
          },
          { autoCommit: true }
        );
        
        itemId = result.outBinds.id[0];
      }
      
      // Actualizar fecha de última modificación del carrito
      await connection.execute(
        `UPDATE CARRITOS SET FECHA_ACTUALIZACION = SYSDATE WHERE ID_CARRITO = :carritoId`,
        { carritoId },
        { autoCommit: true }
      );

      return itemId;
    } catch (error) {
      console.error('Error al agregar item al carrito:', error);
      throw new Error(`Error al agregar item al carrito: ${error.message}`);
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

  async actualizarCantidad(itemId, cantidad) {
    let connection;
    try {
      connection = await db.getConnection();
      
      if (cantidad <= 0) {
        // Si la cantidad es 0 o menor, eliminar el item
        await connection.execute(
          `DELETE FROM CARRITO_ITEMS WHERE ID_ITEM = :itemId`,
          { itemId },
          { autoCommit: true }
        );
        return 0;
      } else {
        // Actualizar cantidad
        await connection.execute(
          `UPDATE CARRITO_ITEMS SET CANTIDAD = :cantidad WHERE ID_ITEM = :itemId`,
          { cantidad, itemId },
          { autoCommit: true }
        );
        
        // Obtener el ID del carrito para actualizar su fecha
        const carritoResult = await connection.execute(
          `SELECT ID_CARRITO FROM CARRITO_ITEMS WHERE ID_ITEM = :itemId`,
          { itemId },
          { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        
        if (carritoResult.rows.length > 0) {
          await connection.execute(
            `UPDATE CARRITOS SET FECHA_ACTUALIZACION = SYSDATE WHERE ID_CARRITO = :carritoId`,
            { carritoId: carritoResult.rows[0].ID_CARRITO },
            { autoCommit: true }
          );
        }
        
        return cantidad;
      }
    } catch (error) {
      console.error('Error al actualizar cantidad del item:', error);
      throw new Error(`Error al actualizar cantidad: ${error.message}`);
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

  async eliminarItem(itemId) {
    let connection;
    try {
      connection = await db.getConnection();
      
      // Obtener el ID del carrito antes de eliminar el item
      const carritoResult = await connection.execute(
        `SELECT ID_CARRITO FROM CARRITO_ITEMS WHERE ID_ITEM = :itemId`,
        { itemId },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      
      // Eliminar el item
      const result = await connection.execute(
        `DELETE FROM CARRITO_ITEMS WHERE ID_ITEM = :itemId`,
        { itemId },
        { autoCommit: true }
      );
      
      // Actualizar fecha del carrito si se encontró el item
      if (carritoResult.rows.length > 0) {
        await connection.execute(
          `UPDATE CARRITOS SET FECHA_ACTUALIZACION = SYSDATE WHERE ID_CARRITO = :carritoId`,
          { carritoId: carritoResult.rows[0].ID_CARRITO },
          { autoCommit: true }
        );
      }
      
      return result.rowsAffected > 0;
    } catch (error) {
      console.error('Error al eliminar item del carrito:', error);
      throw new Error(`Error al eliminar item: ${error.message}`);
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

  async vaciarCarrito(carritoId) {
    let connection;
    try {
      connection = await db.getConnection();
      
      // Eliminar todos los items del carrito
      await connection.execute(
        `DELETE FROM CARRITO_ITEMS WHERE ID_CARRITO = :carritoId`,
        { carritoId },
        { autoCommit: true }
      );
      
      // Actualizar fecha del carrito
      await connection.execute(
        `UPDATE CARRITOS SET FECHA_ACTUALIZACION = SYSDATE WHERE ID_CARRITO = :carritoId`,
        { carritoId },
        { autoCommit: true }
      );
      
      return true;
    } catch (error) {
      console.error('Error al vaciar carrito:', error);
      throw new Error(`Error al vaciar carrito: ${error.message}`);
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

module.exports = new CarritoRepository();
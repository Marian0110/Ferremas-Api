const oracledb = require('oracledb');
const db = require('../db');

class ProductoRepository {
  async create(producto) {
  let connection;
  try {
    connection = await db.getConnection();
    
    // Debug: Verificar los valores que se enviarán al procedimiento
    console.log('Valores para INSERTAR_PRODUCTO:', {
      cod_producto: producto.cod_producto,
      marca: producto.marca,
      cod_marca: producto.cod_marca,
      nombre: producto.nombre,
      precio: producto.precio,
      stock: producto.stock,
      categoria: producto.categoria
    });

    const result = await connection.execute(
      `BEGIN
         INSERTAR_PRODUCTO(
           p_cod_producto => :cod_producto,
           p_marca => :marca,
           p_cod_marca => :cod_marca,
           p_nombre => :nombre,
           p_precio => :precio,
           p_stock => :stock,
           p_categoria => :categoria
         );
         COMMIT; -- Añadir COMMIT explícito
       END;`,
      {
        cod_producto: producto.cod_producto,
        marca: producto.marca,
        cod_marca: producto.cod_marca,
        nombre: producto.nombre,
        precio: producto.precio || 0, // Valor por defecto si es undefined/null
        stock: producto.stock || 0,   // Valor por defecto si es undefined/null
        categoria: producto.categoria
      },
      { 
        autoCommit: true // Asegurar auto-commit
      }
    );

    return producto.cod_producto;
  } catch (error) {
    console.error('Error detallado en repository.create:', {
      message: error.message,
      stack: error.stack,
      oracleError: error.errorNum ? {
        code: error.errorNum,
        offset: error.offset
      } : null
    });
    throw new Error(`Error al crear producto: ${error.message}`);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error cerrando conexión:', err);
      }
    }
  }
}

  
  async getById(codProducto) {
  let connection;
  try {
    connection = await db.getConnection();
    
    const result = await connection.execute(
      `SELECT 
        p.COD_PRODUCTO, 
        p.MARCA, 
        p.COD_MARCA, 
        p.NOMBRE, 
        p.STOCK, 
        c.NOMBRE as CATEGORIA,
        pp.VALOR as PRECIO,
        pp.FECHA as FECHA_PRECIO
      FROM PRODUCTOS p
      LEFT JOIN CATEGORIA c ON p.ID_CATEGORIA = c.ID_CATEGORIA
      LEFT JOIN (
        SELECT COD_PRODUCTO, VALOR, FECHA
        FROM PRECIO_PRODUCTO
        WHERE (COD_PRODUCTO, FECHA) IN (
          SELECT COD_PRODUCTO, MAX(FECHA)
          FROM PRECIO_PRODUCTO
          WHERE COD_PRODUCTO = :codProducto
          GROUP BY COD_PRODUCTO
        )
      ) pp ON p.COD_PRODUCTO = pp.COD_PRODUCTO
      WHERE p.COD_PRODUCTO = :codProducto`,
      { codProducto }, // Usando bind por nombre
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (result.rows.length === 0) return null;

    return result.rows[0];
  } catch (error) {
    console.error('Error en getById:', error);
    throw error;
  } finally {
    if (connection) await connection.close();
  }
}

  async update(codProducto, productoData) {
  let connection;
  try {
    connection = await db.getConnection();
    
    // Obtener el ID de categoría si se proporciona una categoría nueva
    let idCategoria = null;
    if (productoData.categoria) {
      const catResult = await connection.execute(
        `SELECT ID_CATEGORIA FROM CATEGORIA WHERE NOMBRE = :categoria`,
        { categoria: productoData.categoria },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      
      if (catResult.rows.length === 0) {
        throw new Error('Categoría no encontrada');
      }
      idCategoria = catResult.rows[0].ID_CATEGORIA;
    }

    // Construir la consulta UPDATE dinámicamente
    let updateFields = [];
    let bindVars = { cod_producto: codProducto };
    
    if (productoData.marca !== undefined) {
      updateFields.push('MARCA = :marca');
      bindVars.marca = productoData.marca;
    }
    if (productoData.cod_marca !== undefined) {
      updateFields.push('COD_MARCA = :cod_marca');
      bindVars.cod_marca = productoData.cod_marca;
    }
    if (productoData.nombre !== undefined) {
      updateFields.push('NOMBRE = :nombre');
      bindVars.nombre = productoData.nombre;
    }
    if (productoData.stock !== undefined) {
      updateFields.push('STOCK = :stock');
      bindVars.stock = productoData.stock;
    }
    if (idCategoria !== null) {
      updateFields.push('ID_CATEGORIA = :id_categoria');
      bindVars.id_categoria = idCategoria;
    }

    // Solo ejecutar UPDATE si hay campos para actualizar
    if (updateFields.length > 0) {
      const updateQuery = `
        UPDATE PRODUCTOS SET
        ${updateFields.join(', ')}
        WHERE COD_PRODUCTO = :cod_producto
      `;
      
      await connection.execute(updateQuery, bindVars, { autoCommit: true });
    }

    // Actualizar precio si se proporciona
    if (productoData.precio !== undefined && productoData.precio !== null) {
      await connection.execute(
        `INSERT INTO PRECIO_PRODUCTO (
          COD_PRODUCTO, 
          VALOR,
          FECHA
        ) VALUES (
          :cod_producto, 
          :valor,
          SYSDATE
        )`,
        {
          cod_producto: codProducto,
          valor: productoData.precio
        },
        { autoCommit: true }
      );
    }

    return true;
  } catch (error) {
    console.error('Error detallado en repository.update:', error);
    throw new Error(`Error al actualizar producto: ${error.message}`);
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

  async delete(codProducto) {
  let connection;
  try {
    connection = await db.getConnection();
    
    // Primero eliminar los precios asociados
    await connection.execute(
      `DELETE FROM PRECIO_PRODUCTO 
       WHERE COD_PRODUCTO = :codProducto`,
      [codProducto],
      { autoCommit: true }
    );
    
    // Luego elimina el producto
    const result = await connection.execute(
      `DELETE FROM PRODUCTOS 
       WHERE COD_PRODUCTO = :codProducto`,
      [codProducto],
      { autoCommit: true }
    );

    // Retorna true si se elimino
    return result.rowsAffected > 0;
    
  } catch (error) {
    console.error('Error en repository.delete:', error);
    throw new Error(`Error al eliminar producto: ${error.message}`);
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

  async getAll() {
    let connection;
    try {
      connection = await db.getConnection();
      
      const result = await connection.execute(
        `SELECT 
            p.COD_PRODUCTO, 
            p.MARCA, 
            p.COD_MARCA, 
            p.NOMBRE, 
            p.STOCK, 
            c.NOMBRE as CATEGORIA,
            pp.VALOR as PRECIO,
            pp.FECHA as FECHA_PRECIO
        FROM PRODUCTOS p
        LEFT JOIN CATEGORIA c ON p.ID_CATEGORIA = c.ID_CATEGORIA
        LEFT JOIN (
            SELECT COD_PRODUCTO, VALOR, FECHA
            FROM PRECIO_PRODUCTO
            WHERE (COD_PRODUCTO, FECHA) IN (
            SELECT COD_PRODUCTO, MAX(FECHA)
            FROM PRECIO_PRODUCTO
            GROUP BY COD_PRODUCTO
            )
        ) pp ON p.COD_PRODUCTO = pp.COD_PRODUCTO`,
        {}, 
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      return result.rows.map(row => ({
        cod_producto: row.COD_PRODUCTO,
        marca: row.MARCA,
        cod_marca: row.COD_MARCA,
        nombre: row.NOMBRE,
        stock: row.STOCK,
        categoria: row.CATEGORIA,
        precio: row.PRECIO,
        fecha_precio: row.FECHA_PRECIO
        }));
    } catch (error) {
      throw new Error(`Error al listar productos: ${error.message}`);
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
}

module.exports = new ProductoRepository();
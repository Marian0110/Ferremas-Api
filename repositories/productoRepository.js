const oracledb = require('oracledb');
const db = require('../db');

class ProductoRepository {
  async create(producto) {
    let connection;
    try {
      connection = await db.getConnection();
      
      // Verificación EXPLÍCITA de la categoría - USANDO producto.id_categoria directamente
      const categoriaCheck = await connection.execute(
        `SELECT COUNT(1) as EXISTE FROM CATEGORIA WHERE ID_CATEGORIA = :id`,
        { id: producto.id_categoria },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      
      console.log('Resultado verificación categoría:', categoriaCheck.rows[0].EXISTE);

      if (categoriaCheck.rows[0].EXISTE === 0) {
        throw new Error(`La categoría con ID ${producto.id_categoria} no existe (verificado en repository)`);
      }

      // Llamada al procedimiento con tipos explícitos - NOTA EL CAMBIO AQUÍ
      const result = await connection.execute(
        `BEGIN
          INSERTAR_PRODUCTO(
            p_cod_producto => :cod_producto,
            p_marca => :marca,
            p_cod_marca => :cod_marca,
            p_nombre => :nombre,
            p_precio => :precio,
            p_stock => :stock,
            p_id_categoria => :id_categoria,
            p_imagen => :imagen
          );
        END;`,
        {
          cod_producto: { val: producto.cod_producto, type: oracledb.STRING },
          marca: { val: producto.marca, type: oracledb.STRING },
          cod_marca: { val: producto.cod_marca, type: oracledb.STRING },
          nombre: { val: producto.nombre, type: oracledb.STRING },
          precio: { val: Number(producto.precio), type: oracledb.NUMBER },
          stock: { val: Number(producto.stock), type: oracledb.NUMBER },
          id_categoria: { val: producto.id_categoria, type: oracledb.NUMBER }, // ← AQUÍ ESTÁ EL CAMBIO
          imagen: { val: producto.imagen, type: oracledb.STRING }
        },
        { autoCommit: true }
      );

      return producto.cod_producto;
    } catch (error) {
      console.error('Error detallado en repository.create:', {
        message: error.message,
        stack: error.stack,
        oracleError: error.errorNum ? {
          code: error.errorNum,
          offset: error.offset
        } : null,
        productoData: { // Log de los datos recibidos
          ...producto,
          id_categoria_type: typeof producto.id_categoria
        }
      });
      
      throw error;
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
          c.ID_CATEGORIA,
          pp.VALOR as PRECIO,
          pp.FECHA as FECHA_PRECIO,
          p.IMAGEN
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
        { codProducto },
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
      if (productoData.id_categoria !== undefined) {
        const catCheck = await connection.execute(
          `SELECT COUNT(1) FROM CATEGORIA WHERE ID_CATEGORIA = :id_categoria`,
          { id_categoria: productoData.id_categoria }
        );
        
        if (catCheck.rows[0][0] === 0) {
          throw new Error(`La categoría con ID ${productoData.id_categoria} no existe`);
        }
        
        updateFields.push('ID_CATEGORIA = :id_categoria');
        bindVars.id_categoria = productoData.id_categoria;
      }
      if (productoData.imagen !== undefined) {
        updateFields.push('IMAGEN = :imagen');
        bindVars.imagen = productoData.imagen;
      }

      if (updateFields.length > 0) {
        const updateQuery = `
          UPDATE PRODUCTOS SET
          ${updateFields.join(', ')}
          WHERE COD_PRODUCTO = :cod_producto
        `;
        
        await connection.execute(updateQuery, bindVars, { autoCommit: true });
      }

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
      console.error('Error en repository.update:', error);
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
      
      // 1. Producto existe?
      const checkProduct = await connection.execute(
        `SELECT COUNT(*) AS count FROM PRODUCTOS WHERE COD_PRODUCTO = :codProducto`,
        { codProducto },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      
      if (checkProduct.rows[0].COUNT === 0) {
        throw new Error(`El producto con código ${codProducto} no existe`);
      }
      
      // 2. Verificar registros en DETALLE_VENTA
      const detalleCheck = await connection.execute(
        `SELECT COUNT(*) AS count FROM DETALLE_VENTA WHERE COD_PRODUCTO = :codProducto`,
        { codProducto },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      
      if (detalleCheck.rows[0].COUNT > 0) {
        throw new Error('No se puede eliminar el producto porque está asociado a ventas existentes');
      }
      
      // 3. Eliminar los precios asociados al producto
      await connection.execute(
        `DELETE FROM PRECIO_PRODUCTO WHERE COD_PRODUCTO = :codProducto`,
        { codProducto },
        { autoCommit: false }
      );
      
      // 4. Finalmente eliminar el producto
      const result = await connection.execute(
        `DELETE FROM PRODUCTOS WHERE COD_PRODUCTO = :codProducto`,
        { codProducto },
        { autoCommit: true }
      );
      
      return result.rowsAffected > 0;
    } catch (error) {
      // En caso de error, intentamos hacer rollback
      if (connection) {
        try {
          await connection.execute(`ROLLBACK`, [], { autoCommit: true });
        } catch (rollbackError) {
          console.error('Error al hacer rollback:', rollbackError);
        }
      }
      
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
            p.IMAGEN,  
            c.ID_CATEGORIA,
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
        ) pp ON p.COD_PRODUCTO = pp.COD_PRODUCTO
        ORDER BY p.COD_PRODUCTO`,
        {}, 
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      return result.rows.map(row => ({
        cod_producto: row.COD_PRODUCTO,
        marca: row.MARCA,
        cod_marca: row.COD_MARCA,
        nombre: row.NOMBRE,
        precio: row.PRECIO,
        fecha_precio: row.FECHA_PRECIO,
        categoria: {
          Nombre: row.CATEGORIA
        },
        stock: row.STOCK,
        imagen: row.IMAGEN
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
//Servicio hace ejecutar el query en ORACLE
const db = require('../db');
const oracledb = require('oracledb');

// Función para crear un cliente en la base de datos
// Esta función recibe un objeto cliente y lo inserta en la tabla CLIENTES
async function crearCliente(cliente) {
  const conn = await db.getConnection();
  const result = await conn.execute(
    `INSERT INTO CLIENTES 
    (NOMBRES, APELLIDOS, CORREO, TELEFONO, CONTRASENA, DIRECCION, ACEPTA_POLITICAS, RECIBE_PROMOS)
    VALUES (:nombres, :apellidos, :correo, :telefono, :contrasena, :direccion, :acepta, :promos)`,
    {
      nombres: cliente.nombres,
      apellidos: cliente.apellidos,
      correo: cliente.correo,
      telefono: cliente.telefono,
      contrasena: cliente.contrasena,
      direccion: cliente.direccion,
      acepta: cliente.acepta_politicas ? 1 : 0, 
      promos: cliente.recibe_promos ? 1: 0
    },
    { autoCommit: true }
  );
  await conn.close();
  return result;
}

// Función para obtener el cliente por correo y contrasena
async function loginCliente(correo, contrasena) {
  let conn;
  try {
    conn = await db.getConnection();
    const result = await conn.execute(
      `SELECT ID_CLIENTE, NOMBRES, APELLIDOS, CORREO, TELEFONO, DIRECCION 
       FROM CLIENTES 
       WHERE CORREO = :correo AND CONTRASENA = :contrasena`,
      { correo, contrasena }
    );

    if (result.rows.length === 0) return null;

    const row = result.rows[0]; // Asume formato de objeto
    return {
      id: row.ID_CLIENTE,
      nombres: row.NOMBRES,
      apellidos: row.APELLIDOS,
      correo: row.CORREO,
      telefono: row.TELEFONO,
      direccion: row.DIRECCION
    };

  } catch (err) {
    console.error("Error en repositorio:", err);
    throw err;
  } finally {
    if (conn) await conn.close();
  }
}

async function getAll() {
    let connection;
    try {
      connection = await db.getConnection();
      const result = await connection.execute(
        `SELECT 
          ID_CLIENTE,
          NOMBRES,
          APELLIDOS,
          CORREO,
          TELEFONO,
          DIRECCION
          FROM CLIENTES
          `,
        [],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      return result.rows;
    } catch (error) {
      console.error('Error en clienteRepository.getAll:', error);
      throw new Error(`Error al obtener clientes: ${error.message}`);
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

async function actualizarCliente(idCliente, datosActualizados) {
  let conn;
  try {
    conn = await db.getConnection();
    
    // consulta dinámica
    let setClause = [];
    const bindVars = { id: idCliente };
    
    for (const [key, value] of Object.entries(datosActualizados)) {
      setClause.push(`${key.toUpperCase()} = :${key}`);
      bindVars[key] = value;
    }
    
    if (setClause.length === 0) {
      throw new Error('No hay campos válidos para actualizar');
    }
    
    const query = `UPDATE CLIENTES SET ${setClause.join(', ')} WHERE ID_CLIENTE = :id`;
    
    const result = await conn.execute(
      query,
      bindVars,
      { autoCommit: true }
    );
    
    return result.rowsAffected > 0;
    
  } catch (err) {
    console.error('Error en repositorio (actualizarCliente):', err);
    throw err;
  } finally {
    if (conn) await conn.close();
  }
}

async function crearContacto(datosContacto) {
    let conn;
    try {
        conn = await db.getConnection();
        const result = await conn.execute(
            `INSERT INTO CONTACTO_CLIENTES 
            (ID_CLIENTE, ASUNTO, MENSAJE)
            VALUES (:id_cliente, :asunto, :mensaje)`,
            {
                id_cliente: datosContacto.id_cliente, // Puede ser null
                asunto: datosContacto.asunto,
                mensaje: datosContacto.mensaje
            },
            { autoCommit: true }
        );
        return result;
    } catch (err) {
        console.error('Error en repositorio (crearContacto):', err);
        throw err;
    } finally {
        if (conn) {
            try {
                await conn.close();
            } catch (err) {
                console.error('Error al cerrar la conexión en crearContacto:', err);
            }
        }
    }
}
module.exports = { crearCliente, loginCliente, getAll, actualizarCliente, crearContacto };
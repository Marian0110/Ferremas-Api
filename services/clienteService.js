//Capa de logica de negocio

const Cliente = require('../models/cliente');
const clienteRepository = require('../repositories/clienteRepository');

async function registrarCliente(datos) {
  
  const nuevoCliente = new Cliente(
    datos.nombres,
    datos.apellidos,
    datos.correo,
    datos.telefono,
    datos.contrasena,
    datos.direccion,
    datos.acepta_politicas ? 1 : 0,
    datos.recibe_promos ? 1 : 0
  );

  return await clienteRepository.crearCliente(nuevoCliente);
}

// Función para iniciar sesión de un cliente
async function loginCliente(correo, contrasena) {
  try {
    console.log("Datos recibidos en servicio:", { correo, contrasena }); // 👈 ¡Agrega esto!
    const cliente = await clienteRepository.loginCliente(correo, contrasena);
    return cliente;
  } catch (err) {
    console.error("Error en servicio (loginCliente):", err);
    throw err;
  }
}

async function listar() {
      return await clienteRepository.getAll();
}

async function actualizarCliente(idCliente, datosActualizados) {
  try {
    const camposPermitidos = ['nombres', 'apellidos', 'telefono', 'correo', 'direccion'];
    const datosFiltrados = {};
    
    for (const campo in datosActualizados) {
      if (camposPermitidos.includes(campo.toLowerCase())) {
        datosFiltrados[campo] = datosActualizados[campo];
      }
    }

    // Validar que haya datos válidos para actualizar
    if (Object.keys(datosFiltrados).length === 0) {
      throw new Error('No se proporcionaron datos válidos para actualizar');
    }

    return await clienteRepository.actualizarCliente(idCliente, datosFiltrados);
  } catch (err) {
    console.error('Error en servicio (actualizarCliente):', err);
    throw err;
  }
}

async function registrarContacto(datosContacto) {
    try {
        return await clienteRepository.crearContacto(datosContacto);
    } catch (err) {
        console.error("Error en servicio (registrarContacto):", err);
        throw err;
    }
}

module.exports = { registrarCliente, loginCliente, listar, actualizarCliente, registrarContacto};
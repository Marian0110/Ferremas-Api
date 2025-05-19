// Logica HTTP: Recibe el request (el req.body del frontend) y llama al servicio
const clienteService = require('../services/clienteService'); 

// Controlador para registrar un cliente
async function registrar(req, res) {
  try {
    await clienteService.registrarCliente(req.body);
    
    res.status(201).json({ mensaje: 'Cliente registrado exitosamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al registrar cliente' });
  }
}

// Controlador para iniciar sesión de un cliente
async function login(req, res) {
  const { correo, contrasena } = req.body;

  try {
    // Llamada al servicio para iniciar sesión
    const cliente = await clienteService.loginCliente(correo, contrasena);

    if (!cliente) {
      return res.status(401).json({ mensaje: 'Credenciales incorrectas' });
    }

    res.status(200).json({ mensaje: 'Login exitoso', cliente });
  } catch (err) {
    console.error('Error al iniciar sesión:', err); 
    res.status(500).json({ mensaje: 'Error al iniciar sesión' });
  }
}

async function obtenerPedidosCliente(req, res) {
    try {
        const idCliente = req.params.id;
        
        if (!idCliente) {
            return res.status(400).json({ error: 'ID de cliente no proporcionado' });
        }
        
        // Obtener pedidos del cliente
        const pedidos = await ventaService.obtenerVentasPorCliente(idCliente);
        
        res.json(pedidos);
    } catch (error) {
        console.error('Error al obtener pedidos del cliente:', error);
        res.status(500).json({ error: error.message });
    }
}


async function listarClientes(req, res) {
    try {
      const clientes = await clienteService.listar();
      res.json(clientes);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

module.exports = { registrar, login, obtenerPedidosCliente, listarClientes};

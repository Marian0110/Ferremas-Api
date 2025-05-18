// Logica HTTP: Recibe el request (el req.body del frontend) y llama al servicio
const EmpleadoService = require('../services/empleadoService');

async function obtenerTodos(req, res) {
  try {
    const empleados = await EmpleadoService.obtenerTodos();
    res.json(empleados);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getEmpleadoById(req, res) {
  try {
    const empleado = await EmpleadoService.getEmpleadoById(req.params.id);
    if (!empleado) {
      return res.status(404).json({ message: 'Empleado no encontrado' });
    }
    res.json(empleado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function crear(req, res) {
  try {
    const id = await EmpleadoService.crear(req.body);
    res.status(201).json({ id, message: 'Empleado creado exitosamente' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function actualizar(req, res) {
  try {
    await EmpleadoService.actualizar(req.params.id, req.body);
    res.json({ message: 'Empleado actualizado exitosamente' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function eliminar(req, res) {
  try {
    await EmpleadoService.eliminar(req.params.id);
    res.json({ message: 'Empleado eliminado exitosamente' });
  } catch (error) {
    if (error.message === 'Empleado no encontrado') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
}

module.exports = { obtenerTodos, getEmpleadoById, crear, actualizar, eliminar };
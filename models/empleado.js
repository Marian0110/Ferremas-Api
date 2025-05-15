class Empleado {
  constructor(id_empleado, nombres, apellidos, correo, telefono, contrasena, id_rol, id_comuna) {
    this.id_empleado = id_empleado;
    this.nombres = nombres;
    this.apellidos = apellidos;
    this.correo = correo;
    this.telefono = telefono;
    this.contrasena = contrasena;
    this.id_rol = id_rol;
    this.id_comuna = id_comuna;
  }
}

module.exports = Empleado;
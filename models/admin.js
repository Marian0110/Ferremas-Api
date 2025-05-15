//Modelo
class Admin {
  constructor(id_admin, usuario, contrasena, fecha_registro) {
    this.id_admin = id_admin;
    this.usuario = usuario;
    this.contrasena = contrasena;
    this.fecha_registro = fecha_registro;
  }
}

module.exports = Admin;
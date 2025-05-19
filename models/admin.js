//Modelo
class Admin {
  constructor(id_admin, usuario, contrasena, fecha_registro, primer_login = false) {
    this.id_admin = id_admin;
    this.usuario = usuario;
    this.contrasena = contrasena;
    this.fecha_registro = fecha_registro;
    this.primer_login = primer_login;
  }
}

module.exports = Admin;
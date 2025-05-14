//Modelo
class Cliente {
  constructor(nombres, apellidos, correo, telefono, contrasena, direccion, acepta_politicas, recibe_promos) {
    this.nombres = nombres;
    this.apellidos = apellidos;
    this.correo = correo;
    this.telefono = telefono;
    this.contrasena = contrasena;
    this.direccion = direccion;
    this.acepta_politicas = acepta_politicas;
    this.recibe_promos = recibe_promos;
  }
}

module.exports = Cliente;
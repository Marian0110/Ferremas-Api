class Carrito {
  constructor(data) {
    this.id = data.id;
    this.cliente_id = data.cliente_id;
    this.productos = data.productos || [];
    this.fecha_creacion = data.fecha_creacion || new Date().toISOString();
    this.fecha_actualizacion = data.fecha_actualizacion || new Date().toISOString();
  }
}

class CarritoItem {
  constructor(data) {
    this.id = data.id;
    this.cod_producto = data.cod_producto;
    this.nombre = data.nombre;
    this.precio = data.precio;
    this.cantidad = data.cantidad;
    this.imagen = data.imagen;
  }
}

module.exports = {
  Carrito,
  CarritoItem
};
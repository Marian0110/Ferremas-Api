//Modelo
class Producto {
  constructor({
    cod_producto,
    marca,
    cod_marca,
    nombre,
    precio,
    stock,
    categoria,
    fecha_registro
  }) {
    this.cod_producto = cod_producto;
    this.marca = marca;
    this.cod_marca = cod_marca;
    this.nombre = nombre;
    this.precio = precio;
    this.stock = stock;
    this.categoria = categoria;
    this.fecha_registro = fecha_registro;
  }
}

module.exports = Producto;
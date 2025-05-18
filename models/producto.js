//Modelo
class Producto {
  constructor({
    cod_producto,
    marca,
    cod_marca,
    nombre,
    precio,
    stock,
    id_categoria,
    fecha_registro,
    imagen
  }) {
    this.cod_producto = cod_producto;
    this.marca = marca;
    this.cod_marca = cod_marca;
    this.nombre = nombre;
    this.precio = precio;
    this.stock = stock;
    this.id_categoria = id_categoria;
    this.fecha_registro = fecha_registro;
    this.imagen = imagen; 
  }
}

module.exports = Producto;
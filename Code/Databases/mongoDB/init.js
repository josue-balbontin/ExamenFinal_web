db = db.getSiblingDB('ugc_marketplace');


db.createUser({
  user: "ugc_user",
  pwd: "ugc_password",
  roles: [
    {
      role: "readWrite",
      db: "ugc_marketplace"
    }
  ]
});


db.createCollection('resenas_productos');


db.resenas_productos.insertMany([
  {
    id_producto: 1,
    id_usuario_cliente: 2,
    calificacion: 5,
    comentario: "Excelente producto, inicialización exitosa.",
    fecha_creacion: new Date(),
    util_votos: 0
  }
]);

print("Base de datos MongoDB inicializada con éxito.");
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
    "id_producto": 1,
    "id_usuario_cliente": 2,
    "calificacion": 5,
    "comentario": "Excelente producto, inicialización exitosa.",
    "fecha_creacion": new Date(),
    "util_votos": 0
  },
  {
    "id_producto": 1,
    "id_usuario_cliente": 5,
    "calificacion": 5,
    "comentario": "Excelente laptop para programar, levanta Docker y Visual Studio sin problemas.",
    "fecha_creacion": new Date(),
    "util_votos": 12
  },
  {
    "id_producto": 3,
    "id_usuario_cliente": 5,
    "calificacion": 4,
    "comentario": "Son cómodas para correr, pero la talla es un poco justa. Recomiendo pedir un número más.",
    "fecha_creacion": new Date(),
    "util_votos": 3
  },
  {
    "id_producto": 1,
    "id_usuario_cliente": 99,
    "calificacion": 5,
    "comentario": "El envío fue rapidísimo y el producto llegó impecable.",
    "fecha_creacion": new Date(new Date().setDate(new Date().getDate() - 5)), // Hace 5 días
    "util_votos": 8
  }
]);

print("Base de datos MongoDB inicializada con éxito.");
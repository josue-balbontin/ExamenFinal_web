using System;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Backend.Modelos.Entidades;

public class Notificacion
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("id_usuario")]
    public int IdUsuario { get; set; }

    [BsonElement("tipo")]
    public string Tipo { get; set; } = null!;

    [BsonElement("titulo")]
    public string Titulo { get; set; } = null!;

    [BsonElement("mensaje")]
    public string Mensaje { get; set; } = null!;

    [BsonElement("leida")]
    public bool Leida { get; set; } = false;

    [BsonElement("fecha_creacion")]
    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;
}

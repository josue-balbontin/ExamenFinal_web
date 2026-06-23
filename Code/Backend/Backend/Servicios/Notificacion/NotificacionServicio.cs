using System.Collections.Generic;
using System.Threading.Tasks;
using Backend.Infrestructura.Conexion;
using Backend.Modelos.Entidades;
using MongoDB.Driver;

namespace Backend.Servicios.Notificacion;

public class NotificacionServicio : INotificacionServicio
{
    private readonly IMongoCollection<Modelos.Entidades.Notificacion> _notificacionesCollection;

    public NotificacionServicio(MongoDbContext mongoDbContext)
    {
        _notificacionesCollection = mongoDbContext.Database.GetCollection<Modelos.Entidades.Notificacion>("notificaciones");
    }

    public async Task<List<Modelos.Entidades.Notificacion>> ObtenerTodasAsync(int idUsuario)
    {
        var filter = Builders<Modelos.Entidades.Notificacion>.Filter.Eq(n => n.IdUsuario, idUsuario);
        var sort = Builders<Modelos.Entidades.Notificacion>.Sort.Descending(n => n.FechaCreacion);
        
        return await _notificacionesCollection.Find(filter).Sort(sort).ToListAsync();
    }

    public async Task<long> VerificarNoLeidasAsync(int idUsuario)
    {
        var filter = Builders<Modelos.Entidades.Notificacion>.Filter.And(
            Builders<Modelos.Entidades.Notificacion>.Filter.Eq(n => n.IdUsuario, idUsuario),
            Builders<Modelos.Entidades.Notificacion>.Filter.Eq(n => n.Leida, false)
        );

        return await _notificacionesCollection.CountDocumentsAsync(filter);
    }

    public async Task MarcarTodasComoLeidasAsync(int idUsuario)
    {
        var filter = Builders<Modelos.Entidades.Notificacion>.Filter.And(
            Builders<Modelos.Entidades.Notificacion>.Filter.Eq(n => n.IdUsuario, idUsuario),
            Builders<Modelos.Entidades.Notificacion>.Filter.Eq(n => n.Leida, false)
        );

        var update = Builders<Modelos.Entidades.Notificacion>.Update.Set(n => n.Leida, true);

        await _notificacionesCollection.UpdateManyAsync(filter, update);
    }
}

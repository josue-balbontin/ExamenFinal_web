using Microsoft.EntityFrameworkCore;

namespace Backend.Infrestructura.Conexion;

public class PostgresContext : DbContext
{
    public PostgresContext(DbContextOptions<PostgresContext> options) : base(options)
    {
    }


}

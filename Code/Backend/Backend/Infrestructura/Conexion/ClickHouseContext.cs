using ClickHouse.Client.ADO;

namespace Backend.Infrestructura.Conexion;

public class ClickHouseContext
{
    private readonly string _connectionString;

    public ClickHouseContext(string connectionString)
    {
        _connectionString = connectionString;
    }

    public ClickHouseConnection GetConnection()
    {
        return new ClickHouseConnection(_connectionString);
    }
}

using Backend.Infrestructura.Conexion;
using Backend.Middlewares;
using Backend.Repositorio;
using Backend.Servicios;
using DotNetEnv;
using Microsoft.EntityFrameworkCore;
using Npgsql;

Env.TraversePath().Load(".env.development");

var builder = WebApplication.CreateBuilder(args);



// PostgreSQL
var pgUser = Environment.GetEnvironmentVariable("POSTGRES_USER");
var pgPass = Environment.GetEnvironmentVariable("POSTGRES_PASSWORD");
var pgDb = Environment.GetEnvironmentVariable("POSTGRES_DB");
var pgPort = Environment.GetEnvironmentVariable("POSTGRES_PORT") ?? "5432";
var pgHost = Environment.GetEnvironmentVariable("POSTGRES_HOST") ?? "localhost";
var pgConnStr = $"Host={pgHost};Port={pgPort};Database={pgDb};Username={pgUser};Password={pgPass}";

var dataSourceBuilder = new NpgsqlDataSourceBuilder(pgConnStr);
dataSourceBuilder.MapEnum<Backend.Modelos.Entidades.EstadoPedido>("esquema_marketplace.estado_pedido");
dataSourceBuilder.MapEnum<Backend.Modelos.Entidades.EstadoPagoComision>("esquema_marketplace.estado_pago_comision");
dataSourceBuilder.MapEnum<Backend.Modelos.Entidades.EstadoSolicitud>("esquema_marketplace.estado_solicitud");
var dataSource = dataSourceBuilder.Build();

builder.Services.AddDbContext<MarketplaceDbContext>(options => options.UseNpgsql(dataSource));

// MongoDB
var mongoUser = Environment.GetEnvironmentVariable("MONGO_INITDB_ROOT_USERNAME");
var mongoPass = Environment.GetEnvironmentVariable("MONGO_INITDB_ROOT_PASSWORD");
var mongoPort = Environment.GetEnvironmentVariable("MONGO_PORT") ?? "27017";
var mongoConnStr = $"mongodb://{mongoUser}:{mongoPass}@localhost:{mongoPort}";
builder.Services.AddSingleton<MongoDbContext>(sp => new MongoDbContext(mongoConnStr, pgDb ?? "mydb"));

// Redis
var redisPass = Environment.GetEnvironmentVariable("REDIS_PASSWORD");
var redisPort = Environment.GetEnvironmentVariable("REDIS_PORT") ?? "6379";
var redisConnStr = $"localhost:{redisPort},password={redisPass}";
builder.Services.AddSingleton<RedisContext>(sp => new RedisContext(redisConnStr));

// ClickHouse
var clickUser = Environment.GetEnvironmentVariable("CLICKHOUSE_USER");
var clickPass = Environment.GetEnvironmentVariable("CLICKHOUSE_PASSWORD");
var clickDb = Environment.GetEnvironmentVariable("CLICKHOUSE_DB");
var clickPort = Environment.GetEnvironmentVariable("CLICKHOUSE_PORT") ?? "8123";
var clickConnStr = $"Host=localhost;Port={clickPort};Username={clickUser};Password={clickPass};Database={clickDb}";
builder.Services.AddSingleton<ClickHouseContext>(sp => new ClickHouseContext(clickConnStr));

// Elasticsearch (Seguridad desactivada localmente en compose, usamos http normal)
var elasticPort = Environment.GetEnvironmentVariable("ELASTIC_PORT") ?? "9200";
var elasticUrl = $"http://localhost:{elasticPort}";
builder.Services.AddSingleton<ElasticsearchContext>(sp => new ElasticsearchContext(elasticUrl));

// --- Fin de Configuración de Bases de Datos ---

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddSwaggerGen();
builder.Services.AddControllers();

builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<IProductoRepositorio, ProductoRepositorio>();
builder.Services.AddScoped<IProductoServicio, ProductoServicio>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseMiddleware<IpRegionMiddleware>();
app.UseHttpsRedirection();

app.MapControllers();

app.Run();

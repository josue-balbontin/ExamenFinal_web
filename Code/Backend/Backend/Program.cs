using Backend.Infrestructura.Conexion;
using Microsoft.OpenApi;
using Backend.Middlewares;
using Backend.Infrestructura.Repositorio;
using Backend.Infrestructura.Data;
using Backend.Servicios;
using Backend.Servicios.Email;
using Backend.Servicios.Notificacion;
using Backend.Servicios.Pedido;
using DotNetEnv;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

Env.TraversePath().Load(".env.development");

var builder = WebApplication.CreateBuilder(args);



// PostgreSQL
var pgUser = Environment.GetEnvironmentVariable("POSTGRES_USER");
var pgPass = Environment.GetEnvironmentVariable("POSTGRES_PASSWORD");
var pgDb = Environment.GetEnvironmentVariable("POSTGRES_DB");
var pgPort = Environment.GetEnvironmentVariable("POSTGRES_PORT") ?? "5432";
var pgHost = Environment.GetEnvironmentVariable("POSTGRES_HOST") ?? "localhost";
var pgConnStr = $"Host={pgHost};Port={pgPort};Database={pgDb};Username={pgUser};Password={pgPass}";
Console.WriteLine($"DEBUG CONN STR: Host={pgHost};Port={pgPort};Database={pgDb};Username={pgUser};Password='{pgPass}'");
var dataSourceBuilder = new NpgsqlDataSourceBuilder(pgConnStr);
dataSourceBuilder.MapEnum<Backend.Modelos.Entidades.EstadoPedido>("esquema_marketplace.estado_pedido");
dataSourceBuilder.MapEnum<Backend.Modelos.Entidades.EstadoPagoComision>("esquema_marketplace.estado_pago_comision");
dataSourceBuilder.MapEnum<Backend.Modelos.Entidades.EstadoSolicitud>("esquema_marketplace.estado_solicitud");
var dataSource = dataSourceBuilder.Build();

builder.Services.AddDbContext<MarketplaceDbContext>(options => 
    options.UseNpgsql(dataSource, o => 
    {
        o.MapEnum<Backend.Modelos.Entidades.EstadoPedido>("esquema_marketplace.estado_pedido");
        o.MapEnum<Backend.Modelos.Entidades.EstadoPagoComision>("esquema_marketplace.estado_pago_comision");
        o.MapEnum<Backend.Modelos.Entidades.EstadoSolicitud>("esquema_marketplace.estado_solicitud");
    }));

// MongoDB
var mongoUser = Environment.GetEnvironmentVariable("MONGO_INITDB_ROOT_USERNAME");
var mongoPass = Environment.GetEnvironmentVariable("MONGO_INITDB_ROOT_PASSWORD");
var mongoPort = Environment.GetEnvironmentVariable("MONGO_PORT") ?? "27017";
var mongoConnStr = $"mongodb://{mongoUser}:{mongoPass}@127.0.0.1:{mongoPort}/?authSource=admin";
builder.Services.AddSingleton<MongoDbContext>(sp => new MongoDbContext(mongoConnStr, "ugc_marketplace"));

// Redis
var redisPass = Environment.GetEnvironmentVariable("REDIS_PASSWORD");
var redisPort = Environment.GetEnvironmentVariable("REDIS_PORT") ?? "6379";
var redisConnStr = $"127.0.0.1:{redisPort},password={redisPass}";
builder.Services.AddSingleton<RedisContext>(sp => new RedisContext(redisConnStr));

// ClickHouse
var clickUser = Environment.GetEnvironmentVariable("CLICKHOUSE_USER");
var clickPass = Environment.GetEnvironmentVariable("CLICKHOUSE_PASSWORD");
var clickDb = Environment.GetEnvironmentVariable("CLICKHOUSE_DB");
var clickPort = Environment.GetEnvironmentVariable("CLICKHOUSE_PORT") ?? "8123";
var clickConnStr = $"Host=127.0.0.1;Port={clickPort};Username={clickUser};Password={clickPass};Database={clickDb}";
builder.Services.AddSingleton<ClickHouseContext>(sp => new ClickHouseContext(clickConnStr));

// Elasticsearch (Seguridad desactivada localmente en compose, usamos http normal)
var elasticPort = Environment.GetEnvironmentVariable("ELASTIC_PORT") ?? "9200";
var elasticUrl = $"http://127.0.0.1:{elasticPort}";
builder.Services.AddSingleton<ElasticsearchContext>(sp => new ElasticsearchContext(elasticUrl));

// --- Fin de Configuración de Bases de Datos ---

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddSwaggerGen(c =>
{
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Ingrese su token JWT (Bearer {token})."
    });

    c.AddSecurityRequirement(document => new OpenApiSecurityRequirement
    {
        [new OpenApiSecuritySchemeReference("Bearer", document)] = []
    });
});
builder.Services.AddCors(options =>
{
    options.AddPolicy("StrictCors", builder =>
    {
        builder.WithOrigins("http://localhost:3001", "http://localhost:3000", "http://localhost")
               .AllowAnyMethod()
               .AllowAnyHeader()
               .AllowCredentials();
    });
});

builder.Services.AddControllers();

// Configuración de JWT
var jwtSecret = Environment.GetEnvironmentVariable("JWT_SECRET_KEY") ?? "super-secret-key-that-should-be-at-least-32-bytes-long-for-hmac-sha256";
var key = Encoding.UTF8.GetBytes(jwtSecret);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = false,
        ValidateAudience = false
    };
});

builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<IProductoRepositorio, ProductoRepositorio>();
builder.Services.AddScoped<IProductoServicio, ProductoServicio>();
builder.Services.AddScoped<Backend.Servicios.Auth.IAuthServicio, Backend.Servicios.Auth.AuthServicio>();
builder.Services.AddScoped<IEmailServicio, EmailServicio>();
builder.Services.AddScoped<INotificacionServicio, NotificacionServicio>();
builder.Services.AddScoped<IPedidoServicio, PedidoServicio>();

// Registrar DataSeeder
builder.Services.AddTransient<DataSeeder>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("StrictCors");

app.UseMiddleware<IpRegionMiddleware>();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Ejecutar el DataSeeder
using (var scope = app.Services.CreateScope())
{
    var seeder = scope.ServiceProvider.GetRequiredService<DataSeeder>();
    await seeder.SeedAsync();
}

app.Run();

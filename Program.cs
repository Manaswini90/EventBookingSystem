using EventBooking.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using Microsoft.OpenApi.Models;
using System.Net.NetworkInformation;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Ensure a predictable URL/port
var urls = builder.Configuration["ASPNETCORE_URLS"] ?? "http://localhost:5291";
builder.WebHost.UseUrls(urls);

// Fail fast if a port is already in use
var portsInUse = IPGlobalProperties.GetIPGlobalProperties()
    .GetActiveTcpListeners()
    .Select(l => l.Port)
    .ToHashSet();

var requestedPorts = urls.Split(';', StringSplitOptions.RemoveEmptyEntries)
    .Select(u => new Uri(u).Port)
    .Distinct();

if (requestedPorts.Any(p => portsInUse.Contains(p)))
{
    Console.Error.WriteLine($"Port already in use. Requested: {string.Join(", ", requestedPorts)}");
    return;
}

// ✅ JWT Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,

            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],

            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"])
            )
        };
    });

// ✅ Controllers
builder.Services.AddControllers();

// ✅ DB Context
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"))
);

// ✅ Health Checks
builder.Services.AddHealthChecks();

// ✅ Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "EventBooking API",
        Version = "v1"
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Enter Bearer YOUR_TOKEN",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

var app = builder.Build();

app.Logger.LogInformation("Environment: {Environment}", app.Environment.EnvironmentName);

// ✅ Swagger UI (always enabled)
app.UseSwagger();
app.UseSwaggerUI();

// ✅ Middleware order IMPORTANT
app.UseHttpsRedirection();

app.UseAuthentication(); // must come before authorization
app.UseAuthorization();

app.MapControllers();
app.MapHealthChecks("/health");

await app.StartAsync();
app.Logger.LogInformation("Listening on: {Urls}", string.Join(", ", app.Urls));
await app.WaitForShutdownAsync();
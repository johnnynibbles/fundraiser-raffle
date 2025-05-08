using Microsoft.OpenApi.Models;

namespace FundraisingRaffle;

public class Program
{
  public static void Main(string[] args)
  {
    var builder = WebApplication.CreateBuilder(args);

    // Add services to the container.
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen();
    builder.Services.AddAuthorization();

    var app = builder.Build();

    // Configure the HTTP request pipeline.
    if (app.Environment.IsDevelopment())
    {
      app.UseSwagger();
      app.UseSwaggerUI();
    }

    app.UseHttpsRedirection();
    app.UseAuthorization();

    // Basic health check endpoint
    app.MapGet("/health", () => Results.Ok(new { Status = "Healthy", Timestamp = DateTime.UtcNow }))
        .WithName("HealthCheck")
        .WithTags("System");

    // Example API endpoint
    app.MapGet("/api/hello", (string? name) =>
    {
      var greeting = $"Hello, {name ?? "World"}!";
      return Results.Ok(new { Message = greeting, Timestamp = DateTime.UtcNow });
    })
    .WithName("HelloWorld")
    .WithTags("Examples");

    app.Run();
  }
}

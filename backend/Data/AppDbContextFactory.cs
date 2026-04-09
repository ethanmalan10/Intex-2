using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace backend.Data;

/// <summary>
/// Design-time factory for EF Core CLI (migrations). Does not run in production.
/// Set DATABASE_URL to your Postgres connection string (same as runtime). No default credentials are embedded.
/// </summary>
public class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        var databaseUrl = Environment.GetEnvironmentVariable("DATABASE_URL")
            ?? throw new InvalidOperationException(
                "DATABASE_URL must be set for EF Core design-time (e.g. migrations). " +
                "Example: export DATABASE_URL='Host=127.0.0.1;Port=5432;Database=intex2;Username=...;Password=...' " +
                "See backend/.env.example.");

        var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();
        optionsBuilder.UseNpgsql(databaseUrl);

        return new AppDbContext(optionsBuilder.Options);
    }
}

using VETO.BusinessLogic;
using VETO.Database;
using VETO.Metrics;
using VETO.Models;
using VETO.Services;

namespace VETO.Extensions;

public static class ServiceCollectionExtentions
{
    public static IServiceCollection AddServices(this IServiceCollection services, WebApplicationBuilder builder)
    {
        services.Configure<VetoSystemDatabaseConfig>(builder.Configuration.GetSection("VetoDatabase"));
        services.Configure<TokenConfig>(builder.Configuration.GetSection("Token"));
        services.Configure<RateLimiterConfig>(builder.Configuration.GetSection("RateLimiter"));
        services.AddSingleton<VetoSystemSetupService>();
        services.AddSingleton<VetoSystemResultService>();
        services.AddSingleton<VetoCoordinator>();
        
        builder.Services.AddSingleton<VetoCreationMetrics>();
        builder.Services.AddSingleton<VetoDoneMetrics>();
        builder.Services.AddSingleton<TokenMetrics>();
        builder.Services.AddSingleton<VetoRootCallMetrics>();
        builder.Services.AddSingleton<MongoIndices>();

        return services;
    }

}
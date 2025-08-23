using AspNetCore.SignalR.OpenTelemetry;
using Microsoft.AspNetCore.SignalR;

namespace VETO.Extensions;
public static class SignalRExtensions
{
    public static IServiceCollection AddSignalRSetup(this IServiceCollection services, IConfiguration configuration)
    {
        if (HelperFunctions.UseOpenTelemetry(configuration))
        {
            services.AddSignalR().AddHubInstrumentation(options =>
            {
                options.OnException = static (activity, exception) =>
                {
                    if (exception is HubException)
                    {
                        activity.SetTag("otel.status_code", "OK");
                    }
                };
            });            
        }
        else
        {
            services.AddSignalR();
        }
        return services;
    }
}
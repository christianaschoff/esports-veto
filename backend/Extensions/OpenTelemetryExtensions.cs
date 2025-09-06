using System.Diagnostics;
using AspNetCore.SignalR.OpenTelemetry;

using OpenTelemetry.Logs;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;
using VETO.Metrics;

namespace VETO.Extensions;

public static class OpenTelemetryExtensions
{
    public static IServiceCollection AddOpenTelemetrySetup(this IServiceCollection services,                                                           
                                                           WebApplicationBuilder builder,
                                                           ActivitySource? vetoActivitySource)
    {
        if (HelperFunctions.UseOpenTelemetry(builder.Configuration))
        {
            var tracingOtlpEndpoint = HelperFunctions.DoIRunInDocker() ? Environment.GetEnvironmentVariable("OTLP_ENDPOINT_URL") : builder.Configuration["OTLP_ENDPOINT_URL"];
            var tracingZipkinEndpoint = HelperFunctions.DoIRunInDocker() ? Environment.GetEnvironmentVariable("ZIPKIN_ENDPOINT_URL") : builder.Configuration["ZIPKIN_ENDPOINT_URL"];
            var openTelemetry = services.AddOpenTelemetry();

            openTelemetry.ConfigureResource(resource => resource
                .AddService(serviceName: builder.Environment.ApplicationName));

            openTelemetry.WithMetrics(metrics => metrics
                .AddAspNetCoreInstrumentation()
                .AddMeter(TokenMetrics.Name)
                .AddMeter(VetoCreationMetrics.Name)
                .AddMeter(VetoDoneMetrics.Name)
                .AddMeter(VetoRootCallMetrics.Name)
                .AddMeter("Microsoft.AspNetCore.Hosting")
                .AddMeter("Microsoft.AspNetCore.Server.Kestrel")
                .AddMeter("System.Net.Http")
                .AddMeter("System.Net.NameResolution")
                .AddOtlpExporter()
                .AddPrometheusExporter());

            builder.Logging.AddOpenTelemetry(options =>
            {
                options.SetResourceBuilder(ResourceBuilder.CreateDefault().AddService(builder.Environment.ApplicationName))
                        .AddProcessor(new ActivityEventlogProcessor());

                options.IncludeFormattedMessage = true;
                options.IncludeScopes = true;
                options.ParseStateValues = true;                
                options.AttachLogsToActivityEvent();                
                
                if (!string.IsNullOrEmpty(tracingOtlpEndpoint))
                {
                    options.AddOtlpExporter(otlpOptions =>
                    {
                        otlpOptions.Endpoint = new Uri(tracingOtlpEndpoint);                        
                    });
                }
                else
                {
                    options.AddConsoleExporter();
                }
            });

            openTelemetry.WithTracing(tracing =>
            {
                tracing.AddAspNetCoreInstrumentation(options =>
                    {
                        options.Filter = (httpContext) =>
                        {
                            var path = httpContext.Request.Path;
                            if (path.StartsWithSegments("/health"))
                            {
                                return false;
                            }
                            if (path.StartsWithSegments("/healthz"))
                            {
                                return false;
                            }
                            if (path.StartsWithSegments("/metrics"))
                            {
                                return false;
                            }
                            return true;
                        };
                    }
                );
                if (!string.IsNullOrEmpty(tracingOtlpEndpoint) || !string.IsNullOrEmpty(tracingZipkinEndpoint))
                {
                    tracing.AddHttpClientInstrumentation();
                    tracing.AddMongoDBInstrumentation();
                    tracing.AddSignalRInstrumentation();
                    if (!string.IsNullOrEmpty(tracingZipkinEndpoint))
                    {
                        tracing.AddZipkinExporter(otlpOptions => otlpOptions.Endpoint = new Uri(tracingZipkinEndpoint));
                    }
                    if (!string.IsNullOrEmpty(tracingOtlpEndpoint))
                    {
                        tracing.AddOtlpExporter(otlpOptions => otlpOptions.Endpoint = new Uri(tracingOtlpEndpoint));
                    }
                }
                else
                {
                    tracing.AddConsoleExporter();
                }
                tracing.AddSource(vetoActivitySource?.Name ?? "");
            });
            
            services.Configure<OpenTelemetryLoggerOptions>(x => x.IncludeScopes = true);
        }
        return services;
    }
}
using OpenTelemetry.Trace;

public static class Extensions
{    
    public static TracerProviderBuilder AddMongoDBInstrumentation(this TracerProviderBuilder builder)
    {
        return builder.AddSource("MongoDB.Driver.Core.Extensions.DiagnosticSources");
    }
}
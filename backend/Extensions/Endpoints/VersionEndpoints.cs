namespace VETO.Extensions;

public static class VersionEndpoints
{
    public static WebApplication MapVersionEndpoints(this WebApplication app)
    {
        app.MapGet("/api/version", () =>
            Results.Ok(new { Version = HelperFunctions.GetVersionInfo() }));
        return app;
    }
}
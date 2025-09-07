using VETO.Metrics;

namespace VETO.Middleware;

public class SpaRoutingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<SpaRoutingMiddleware> _logger;
    private readonly VetoRootCallMetrics _metrics;

    public SpaRoutingMiddleware(
        RequestDelegate next,
        ILogger<SpaRoutingMiddleware> logger,
        VetoRootCallMetrics metrics)
    {
        _next = next;
        _logger = logger;
        _metrics = metrics;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var path = context.Request.Path.Value?.ToLower();

        // Record metrics for root path calls (exact same logic)
        if (path == "/" && context.Request.Method == "GET")
        {
            _metrics.RootCalled(1);
        }

        // Handle null path (exact same logic)
        if (path == null)
        {
            await _next(context);
            return;
        }

        // Check for static/API paths (exact same logic)
        var staticExtensions = new[] { ".css", ".js", ".png", ".jpg", ".jpeg", ".gif", ".ico", ".svg", ".woff", ".woff2", ".ttf", ".eot" };
        if (staticExtensions.Any(ext => path.EndsWith(ext)) ||
            path.StartsWith("/api") ||
            path.StartsWith("/favicon.ico") ||
            path.StartsWith("/assets"))
        {
            await _next(context);
            return;
        }

        // Modify request path for SPA routing (exact same logic)
        context.Request.Path = "/index.html";
        await _next(context);
    }
}
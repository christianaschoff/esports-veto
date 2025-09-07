
using VETO.Middleware;

namespace VETO.Extensions;

public static class SpaFallbackExtensions
{
    public static IApplicationBuilder UseSpaRouting(this IApplicationBuilder app)
    {
        return app.UseMiddleware<SpaRoutingMiddleware>();
    }
}
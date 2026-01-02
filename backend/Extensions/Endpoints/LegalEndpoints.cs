using Microsoft.Extensions.Options;
using VETO.Models;

public static class LegalEndpoints {
    
    public static WebApplication MapLegalEndpoints(this WebApplication app)
    {
        app.MapGet("/api/legal", (IOptions<LegalNotice> legalNotice) =>
            Results.Ok(legalNotice.Value));
        return app;
    }

}
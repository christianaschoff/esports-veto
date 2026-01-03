 using Microsoft.Extensions.Options;
 using VETO.Extensions;
 using VETO.Models;

 public static class LegalEndpoints {

     public static WebApplication MapLegalEndpoints(this WebApplication app)
     {
         app.MapGet("/api/legal", (IOptions<LegalNotice> legalNotice) =>
             Results.Ok(HelperFunctions.GetLegalNotice(legalNotice)));
         return app;
     }

 }
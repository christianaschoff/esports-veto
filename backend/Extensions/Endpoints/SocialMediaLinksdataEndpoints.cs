using Microsoft.AspNetCore.Mvc;
using VETO.Services;

namespace VETO.Extensions;

public static class SocialMediaLinksdataEndpoints
{
    public static WebApplication MapSocialMediaLinksdataEndpoints(this WebApplication app)
    {
        app.MapGet("/api/socialmediadata/{role}/{id}", SocialMediaDataHandler);
        return app;
    }

    private static async Task<IResult> SocialMediaDataHandler(        
        [FromRoute] string role,
        [FromRoute] string id,
        VetoSystemSetupService vetoSystemService
    )
    {        
        ArgumentNullException.ThrowIfNullOrEmpty(role, nameof(role));
        ArgumentNullException.ThrowIfNullOrWhiteSpace(role, nameof(role));
        ArgumentNullException.ThrowIfNullOrEmpty(id, nameof(id));
        ArgumentNullException.ThrowIfNullOrWhiteSpace(id, nameof(id));

        if (!Guid.TryParse(id, out Guid guid))
            return Results.NotFound("no valid veto session provided");

        var attendeeType = HelperFunctions.ExtractRoleFromString(role);
        var find = await vetoSystemService.GetVetoDataAsync(attendeeType, id);
        string attendee = string.Empty;
        if (find != null)
        {
            if (find.observerId == id)
                attendee = "Observer";
            if (find.playerAId == id)
                attendee = $"Player: {find.PlayerA}";
            if (find.playerBId == id)
                attendee = $"Player: {find.PlayerB}";
            if (find.vetoId == id)            
                attendee = "Admin";
                    
            return Results.Ok(new {
                title = $"VETO: {find.Title} - {attendee}",
                description = $"{find.PlayerA} vs {find.PlayerB} ({find.BestOf} / {find.Mode[1..].ToLower()})",
                author = "VETO ODGW.de"                
            });
        }

        return Results.NotFound("no valid veto session provided");
    }

}
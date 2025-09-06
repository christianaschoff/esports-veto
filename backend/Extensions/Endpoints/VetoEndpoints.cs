using Microsoft.AspNetCore.Mvc;
using VETO.Models;
using VETO.Services;

namespace VETO.Extensions;
public static class VetoEndpoints
{
    public static RouteGroupBuilder MapVetoEndpoints(this RouteGroupBuilder group)
    {
        // Group all veto-related endpoints
        group.MapGet("/{id}", GetVetoAdminHandler);
        group.MapGet("/{role}/{id}", GetVetoByRoleHandler);
        return group;
    }

    private static async Task<IResult> GetVetoAdminHandler(
        [FromRoute] string id,
        VetoSystemSetupService vetoSystemService)
    {
        ArgumentNullException.ThrowIfNullOrEmpty(id, nameof(id));
        ArgumentNullException.ThrowIfNullOrWhiteSpace(id, nameof(id));

        if (!Guid.TryParse(id, out Guid guid))
            return Results.NotFound("no valid veto session provided");

        var find = await vetoSystemService.GetVetoDataAsync(AttendeeType.Admin, id);
        return Results.Ok(find);
    }

    private static async Task<IResult> GetVetoByRoleHandler(
        [FromRoute] string role,
        [FromRoute] string id,
        VetoSystemSetupService vetoSystemService)
    {
        ArgumentNullException.ThrowIfNullOrEmpty(role, nameof(role));
        ArgumentNullException.ThrowIfNullOrWhiteSpace(role, nameof(role));
        ArgumentNullException.ThrowIfNullOrEmpty(id, nameof(id));
        ArgumentNullException.ThrowIfNullOrWhiteSpace(id, nameof(id));

        if (!Guid.TryParse(id, out Guid guid))
            return Results.NotFound("no valid veto session provided");

        var attendeeType = HelperFunctions.ExtractRoleFromString(role);
        var find = await vetoSystemService.GetVetoDataAsync(attendeeType, id);

        if (find != null)
        {
            if (find.observerId == id)
                return Results.Ok(new VetoParticipant(find.vetoId, find.observerId, Constants.OBSERVER));
            if (find.playerAId == id)
                return Results.Ok(new VetoParticipant(find.vetoId, find.playerAId, find.PlayerA));
            if (find.playerBId == id)
                return Results.Ok(new VetoParticipant(find.vetoId, find.playerBId, find.PlayerB));
        }

        return Results.NotFound("no valid veto session provided");
    }
}
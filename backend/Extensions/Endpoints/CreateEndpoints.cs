using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using VETO.BusinessLogic;
using VETO.Metrics;
using VETO.Models;
using VETO.Services;

namespace VETO.Extensions;
public static class CreateEndpoints
{
    public static RouteGroupBuilder MapCreateEndpoints(this RouteGroupBuilder group)
    {
        group.MapPost("/", CreateVetoHandler);
        group.MapGet("/{id}", GetVetoByIdHandler);
        return group;
    }

    private static async Task<IResult> CreateVetoHandler(VetoSystem veto,
                                                        VetoSystemSetupService vetoSystemService,
                                                        VetoCreationMetrics vetoCreationMetrics,                                                        
                                                        ActivitySource? activitySource = null)
        {
            using var activity = activitySource?.StartActivity("Create-Veto");

            var errorList = VetoValidator.ValidateVetoObject(veto);
            if (errorList.Count > 0)
            {
                activity?.SetStatus(ActivityStatusCode.Error, string.Join(",", errorList));
                return Results.BadRequest(VetoValidator.FlatenErrors(errorList));
            }

            activity?.SetTag("creation", veto);
            await vetoSystemService.CreateAsync(veto);
            vetoCreationMetrics.VetosCreated(1);

            return Results.Ok(new {
                veto.playerAId,
                veto.playerBId,
                veto.vetoId,
                veto.Title,
                veto.PlayerA,
                veto.PlayerB,
                veto.BestOf,
                veto.Mode,
                veto.GameId,
                veto.observerId
            });
        }
        
    private static async Task<IResult> GetVetoByIdHandler([FromRoute] string id,VetoSystemSetupService vetoSystemService)
    {
        ArgumentNullException.ThrowIfNullOrEmpty(id, nameof(id));
        ArgumentNullException.ThrowIfNullOrWhiteSpace(id, nameof(id));

        var veto = await vetoSystemService.GetByVetoIdAsync(id);
        if (veto == null)
            return Results.NotFound("no valid veto session found");

        return Results.Ok(new
        {
            veto.playerAId,
            veto.playerBId,
            veto.vetoId,
            veto.Title,
            veto.PlayerA,
            veto.PlayerB,
            veto.BestOf,
            veto.Mode,
            veto.GameId,
            veto.observerId,
            veto.Maps
        });
    }
}

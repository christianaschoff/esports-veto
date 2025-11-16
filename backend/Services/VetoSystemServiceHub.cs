using Microsoft.AspNetCore.SignalR;
using VETO.BusinessLogic;

namespace VETO.Services;

public sealed class VetoSystemServiceHub : Hub
{
    private readonly VetoCoordinator _coordinator;

    public VetoSystemServiceHub(VetoCoordinator coordinator)
    {
        _coordinator = coordinator;
    }

    public async Task JoinGroup(string groupid, string userid, string username)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(groupid);
        ArgumentException.ThrowIfNullOrWhiteSpace(userid);
        await Groups.AddToGroupAsync(Context.ConnectionId, groupid);
        await _coordinator.PlayerPresent(groupid, Context.ConnectionId, userid);
        var currentGameState = await _coordinator.CalculateCurrentGameState(groupid);
        await Clients.Group(groupid).SendAsync("JoinedGroup", $"{Context.ConnectionId} has joined the group {groupid}.", username, currentGameState);
    }

    public async Task RemoveGroup(string groupid)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(groupid);
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupid);
        await Clients.Group(groupid).SendAsync("GetMessage", $"{Context.ConnectionId} has disconnected from the group {groupid}.");
    }

    public async Task UpdateVeto(string groupid, string map)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(groupid);
        ArgumentException.ThrowIfNullOrWhiteSpace(map);
        var connectionId = Context.ConnectionId;

        _coordinator.UpdateVetoMap(connectionId, groupid, map);
        var currentGameState = await _coordinator.CalculateCurrentGameState(groupid);
        await Clients.Group(groupid).SendAsync("VetoUpdated", $"{Context.ConnectionId} sent an update to {groupid}.", currentGameState);
    }

    public void Heartbeat(string userId)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(userId);
        _coordinator.UpdatePlayerPresence(Context.ConnectionId, userId);
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        if (exception != null)
        {
            Console.WriteLine(exception.ToString());
        }

        // Clean up presence tracking
        _coordinator.RemovePlayerPresence(Context.ConnectionId);

        var groupToNotify = _coordinator.RemovePlayerFromVeto(Context.ConnectionId);
        if (groupToNotify != null)
        {
            var currentGameState = await _coordinator.CalculateCurrentGameState(groupToNotify);
            await Clients.Group(groupToNotify).SendAsync("LeftGroup", $"{Context.ConnectionId} is gone", currentGameState);
        }
        await base.OnDisconnectedAsync(exception);
    }
}
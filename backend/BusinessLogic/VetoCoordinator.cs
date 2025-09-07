using VETO.Metrics;
using VETO.Models;
using VETO.Services;

namespace VETO.BusinessLogic;

public class VetoCoordinator(VetoSystemSetupService vetoSystemSetupService, VetoSystemResultService vetoSystemResultService, VetoDoneMetrics vetoDoneMetrics)
{
    private readonly List<KeyValuePair<string, Veto>> _coordinatorIds = [];
    private readonly List<KeyValuePair<string, string>> _signalRToVetoMap = [];
    private readonly Lock _lock = new();
    private readonly Dictionary<string, int> vetoLimitsSc2 = new()
    {
        {"BO9", 0},
        {"BO7", 2},
        {"BO5", 4},
        {"BO3", 6},
        {"BO1", 8}
    };

    public readonly VetoSystemSetupService _vetoSystemSetupService = vetoSystemSetupService;
    private readonly VetoSystemResultService _vetoSystemResultService = vetoSystemResultService;
    private readonly VetoDoneMetrics _vetoDoneMetrics = vetoDoneMetrics;

    public async Task<VetoData> CalculateCurrentGameState(string vetoId)
    {
        var currentVeto = await FindVetoAsync(vetoId) ?? throw new ArgumentOutOfRangeException(nameof(vetoId), "no veto found");
        currentVeto.VetoState = CalculateVetoState(currentVeto);
        await SaveGameState(currentVeto);
        return new VetoData(currentVeto.VetoState, currentVeto.VetoSteps);
    }
    
    public async Task PlayerPresent(string vetoId, string hubId, string userid)
    {                
        var currentVeto = await FindVetoAsync(vetoId);
        if (currentVeto is null)
            return;

        if (currentVeto.VetoConfig.playerAId == userid)
        {
            currentVeto.PlayerA = hubId;
            lock (_lock)
            {                
                _signalRToVetoMap.Add(new KeyValuePair<string, string>(hubId, userid));
            }
        }

        if (currentVeto.VetoConfig.playerBId == userid)
        {
            lock (_lock)
            {                
                _signalRToVetoMap.Add(new KeyValuePair<string, string>(hubId, userid));
            }
            currentVeto.PlayerB = hubId;
        }
    }

    public void UpdateVetoMap(string signalRId, string groupId, string map)
    {
        var vetoMap = FindVetoMapBySignalRId(signalRId);
        if (vetoMap.Equals(default(KeyValuePair<string, string>)))
            return;

        var currentVeto = FindVetoByPlayerId(vetoMap.Value);
        if (currentVeto.Equals(default(KeyValuePair<string, Veto>)))
            return;

        var veto = currentVeto.Value;
        if (!IsValidPlayerForVeto(veto, signalRId, groupId))
            return;

        var nextStep = FindNextVetoStep(veto, signalRId);
        if (nextStep == null || !IsValidMapSelection(veto, map))
            return;

        UpdateVetoStep(nextStep, veto, map);
    }

    public string? RemovePlayerFromVeto(string signalRId)
    {
        var vetoMap = FindVetoMapBySignalRId(signalRId);
        if (vetoMap.Equals(default(KeyValuePair<string, string>)))
            return null;

        string? vetoid = null;
        var currentVeto = FindVetoByPlayerId(vetoMap.Value);
        if (!currentVeto.Equals(default(KeyValuePair<string, Veto>)))
        {
            vetoid = currentVeto.Value.VetoId;
            RemovePlayerFromVetoAndSignalMap(currentVeto.Value, signalRId, vetoMap);
        }
        else
        { 
            lock (_lock)            
                _signalRToVetoMap.Remove(vetoMap);
            
        }
        return vetoid;            
    }


    private KeyValuePair<string, string> FindVetoMapBySignalRId(string signalRId)
    {
        return _signalRToVetoMap.FirstOrDefault(x => x.Key == signalRId);
    }

    private void RemovePlayerFromVetoAndSignalMap(Veto veto, string signalRId, KeyValuePair<string, string> vetoMap)
    {
        lock (_lock)
        {
            if (veto.PlayerA == signalRId)
                veto.PlayerA = default;
            if (veto.PlayerB == signalRId)
                veto.PlayerB = default;
            _signalRToVetoMap.Remove(vetoMap);
        }       
    }

    private async Task<bool> SaveGameState(Veto veto)
    {
        var result = await _vetoSystemResultService.GetByVetoIdAsync(veto.VetoId);
        if (result == null || result.Id == null)
        {
            await _vetoSystemResultService.CreateAsync(veto);
            return true;
        }
        else
        {
            veto.Id = result.Id;
            await _vetoSystemResultService.UpdateAsync(result.Id, veto);
            return true;
        }
    }

    private VetoState CalculateVetoState(Veto currentVeto)
    {
        if (IsVetoAlreadyDone(currentVeto))
            return VetoState.VETO_DONE;

        if (AreAllPlayersMissing(currentVeto))
            return VetoState.PLAYER_MISSING;

        var playerVoteNeeded = currentVeto.VetoSteps.FirstOrDefault(x => x.StepType == VetoStepType.Unset);
        if (playerVoteNeeded != null)
        {
            return currentVeto.VetoConfig.playerAId == playerVoteNeeded.PlayerId ? VetoState.VETO_MISSING_A : VetoState.VETO_MISSING_B;
        }
        _vetoDoneMetrics.VetosDone(1);
        return VetoState.VETO_DONE;
    }

    private KeyValuePair<string, Veto> FindVetoByPlayerId(string playerId)
    {
        return _coordinatorIds.FirstOrDefault(x => x.Value.VetoConfig.playerAId == playerId || x.Value.VetoConfig.playerBId == playerId);
    }

    private static bool AreAllPlayersMissing(Veto veto)
    {
        return string.IsNullOrEmpty(veto.PlayerA) || string.IsNullOrEmpty(veto.PlayerB);
    }

    private static bool IsVetoAlreadyDone(Veto veto)
    {
        return veto.VetoState == VetoState.VETO_DONE;
    }

    private async Task<Veto?> FindVetoAsync(string vetoId)
    {
        var currentVeto = _coordinatorIds.FirstOrDefault(x => x.Key == vetoId);
        if (currentVeto.Equals(default(KeyValuePair<string, Veto>)))
        {
            var newEntry = new KeyValuePair<string, Veto>(vetoId, await CreateNewVeto(vetoId));
            lock (_lock)
            {                
                _coordinatorIds.Add(newEntry);
            }
            currentVeto = newEntry;
        }
        return currentVeto.Value;
    }

    private async Task<Veto> CreateNewVeto(string vetoId)
    {
        var vetoSystemSetup = await _vetoSystemSetupService.GetByVetoIdAsync(vetoId)
        ?? throw new ArgumentOutOfRangeException(nameof(vetoId), "no veto found for that id");

        var savedGamedState = await _vetoSystemResultService.GetByVetoIdAsync(vetoId);

        return new Veto
        {
            VetoId = vetoId,
            VetoConfig = vetoSystemSetup,
            VetoSteps = savedGamedState?.VetoSteps ?? VetoStepsCreator.Create(vetoSystemSetup)
        };
    }

 private bool IsValidPlayerForVeto(Veto veto, string signalRId, string groupId)
    {        
        return veto != null &&
            veto.VetoId == groupId &&
            veto.VetoSteps != null &&
            (veto.PlayerA == signalRId || veto.PlayerB == signalRId); 
    }

    private VetoStep? FindNextVetoStep(Veto veto, string signalRId)
    {        
        if (veto?.VetoSteps == null)
            return null;

        var nextStep = veto.VetoSteps.FirstOrDefault(x => x.StepType == VetoStepType.Unset);
        if (nextStep == null)
            return null;

        var isPlayerA = veto.PlayerA == signalRId;
        var expectedPlayerId = isPlayerA ? veto.VetoConfig.playerAId : veto.VetoConfig.playerBId;

        return nextStep.PlayerId == expectedPlayerId ? nextStep : null;
    }

    private bool IsValidMapSelection(Veto veto, string map)
    {
        return veto?.VetoSteps != null && !veto.VetoSteps.Exists(x => x.Map == map);
    }

    private void UpdateVetoStep(VetoStep step, Veto veto, string map)
    {        
        var index = veto.VetoSteps.IndexOf(step);
        if (index == -1)
            return;

        step.StepType = IsVeto(++index, veto.VetoConfig.BestOf, veto.VetoConfig.GameId)
            ? VetoStepType.Ban : VetoStepType.Pick;
        step.Map = map;
    }

    private bool IsVeto(int no, string bestof, string gameId)
    {
        return gameId switch
        {
            Constants.STARCRAFT2 => vetoLimitsSc2.TryGetValue(bestof, out int limit) && no <= limit,
            _ => true,
        };
    }
}

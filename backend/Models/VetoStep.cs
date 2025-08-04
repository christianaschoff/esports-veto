namespace VETO.Models;

public class VetoStep(string playerId, string map, VetoStepType stepType)
{
    public string PlayerId { get; set; } = playerId;
    public string Map { get; set; } = map;
    public VetoStepType StepType { get; set; } = stepType;
}

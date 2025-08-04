using VETO.Models;

namespace VETO.BusinessLogic;

public static class VetoStepsCreator
{
    public static List<VetoStep> Create(VetoSystem vetoSystem)
    {
        if (vetoSystem.GameId == Constants.STARCRAFT2)
        {
            return CreateSc2VetoSteps(vetoSystem);
        }
        return new List<VetoStep>();
    }


    private static List<VetoStep> CreateSc2VetoSteps(VetoSystem vetoSystem)
    {
        //if (vetoSystem.bestOf == "BO7" || vetoSystem.vetoSystem == "ABAB")
        if (vetoSystem.vetoSystem == Constants.VETO_ABAB)
        {
            return [
                new VetoStep(vetoSystem.playerAId, "", VetoStepType.Unset),
                new VetoStep(vetoSystem.playerBId, "", VetoStepType.Unset),
                new VetoStep(vetoSystem.playerAId, "", VetoStepType.Unset),
                new VetoStep(vetoSystem.playerBId, "", VetoStepType.Unset),
                new VetoStep(vetoSystem.playerAId, "", VetoStepType.Unset),
                new VetoStep(vetoSystem.playerBId, "", VetoStepType.Unset),
                new VetoStep(vetoSystem.playerAId, "", VetoStepType.Unset),
                new VetoStep(vetoSystem.playerBId, "", VetoStepType.Unset),
                new VetoStep(vetoSystem.playerAId, "", VetoStepType.Unset)
                ];
        }
        else
        {
            return [
                new VetoStep(vetoSystem.playerAId, "", VetoStepType.Unset),
                new VetoStep(vetoSystem.playerBId, "", VetoStepType.Unset),
                new VetoStep(vetoSystem.playerBId, "", VetoStepType.Unset),
                new VetoStep(vetoSystem.playerAId, "", VetoStepType.Unset),
                new VetoStep(vetoSystem.playerBId, "", VetoStepType.Unset),
                new VetoStep(vetoSystem.playerAId, "", VetoStepType.Unset),
                new VetoStep(vetoSystem.playerBId, "", VetoStepType.Unset),
                new VetoStep(vetoSystem.playerAId, "", VetoStepType.Unset),
                new VetoStep(vetoSystem.playerBId, "", VetoStepType.Unset)
            ];
        }
    }

}
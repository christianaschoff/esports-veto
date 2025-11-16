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
        var returnList = new List<VetoStep>();

        if (vetoSystem.vetoSystem == Constants.VETO_ABAB)
        {
            returnList = [
                new VetoStep(vetoSystem.playerAId, "", VetoStepType.Unset),
                new VetoStep(vetoSystem.playerBId, "", VetoStepType.Unset),
                new VetoStep(vetoSystem.playerAId, "", VetoStepType.Unset),
                new VetoStep(vetoSystem.playerBId, "", VetoStepType.Unset),
                /* new VetoStep(vetoSystem.playerAId, "", VetoStepType.Unset),
                new VetoStep(vetoSystem.playerBId, "", VetoStepType.Unset),
                new VetoStep(vetoSystem.playerAId, "", VetoStepType.Unset),
                new VetoStep(vetoSystem.playerBId, "", VetoStepType.Unset),
                new VetoStep(vetoSystem.playerAId, "", VetoStepType.Unset) */
            ];
            
            for(int i = 4; i < vetoSystem.Maps.Length; i++)
            {
                returnList.Add(new VetoStep( i % 2 == 0 ? vetoSystem.playerAId : vetoSystem.playerBId, "", VetoStepType.Unset));
            }
        }
        else
        {
            returnList = [
                new VetoStep(vetoSystem.playerAId, "", VetoStepType.Unset),
                new VetoStep(vetoSystem.playerBId, "", VetoStepType.Unset),
                new VetoStep(vetoSystem.playerBId, "", VetoStepType.Unset),
                new VetoStep(vetoSystem.playerAId, "", VetoStepType.Unset),
               /* new VetoStep(vetoSystem.playerBId, "", VetoStepType.Unset),
                new VetoStep(vetoSystem.playerAId, "", VetoStepType.Unset),
                new VetoStep(vetoSystem.playerBId, "", VetoStepType.Unset),
                new VetoStep(vetoSystem.playerAId, "", VetoStepType.Unset),
                new VetoStep(vetoSystem.playerBId, "", VetoStepType.Unset) */
            ];
            
            for(int i = 4; i < vetoSystem.Maps.Length; i++)
            {
                returnList.Add(new VetoStep( i % 2 == 0 ? vetoSystem.playerBId : vetoSystem.playerAId, "", VetoStepType.Unset));
            }
        }
        return returnList;
    }

}
namespace VETO.Models;

public enum VetoState
{
    PLAYER_MISSING = 0,
    VETO_MISSING_A = 1,
    VETO_MISSING_B = 2,
    VETO_DONE = 3
}

// public record VetoState(string vetoId, string playerA, string playerB) {}
namespace VETO.Models;

public class RateLimiterConfig
{
    public int TokenLimit { get; set; } = 0!;
    public int QueueLimit { get; set; } = 0!;
    public int ReplenishmentPeriod { get; set; } = 0!;
    public int TokensPerPeriod { get; set; } = 0!;
    public bool AutoReplenishment { get; set; } = false;
}
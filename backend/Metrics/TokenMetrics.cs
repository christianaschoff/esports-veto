namespace VETO.Metrics;

using System.Diagnostics.Metrics;
using Microsoft.AspNetCore.Authorization.Infrastructure;

public class TokenMetrics
{
    private readonly Counter<int> _tokensCreated;
    public static string Name = "Token.Counter";
    public TokenMetrics(IMeterFactory meterFactory)
    {
        var meter = meterFactory.Create(Name);
        _tokensCreated = meter.CreateCounter<int>("token.counter.tokens_created");
    }

    public void TokenCreated(int quantity)
    {
        _tokensCreated.Add(quantity);
    }
}

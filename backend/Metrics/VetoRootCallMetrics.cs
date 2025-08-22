namespace VETO.Metrics;
using System.Diagnostics.Metrics;

public class VetoRootCallMetrics
{
    private readonly Counter<int> _rootCalled;
    public static string Name = "VetoRootCall.Counter";

    public VetoRootCallMetrics(IMeterFactory meterFactory)
    {
        var meter = meterFactory.Create(Name);
        _rootCalled = meter.CreateCounter<int>("vetocroot.counter.root_call");
    }

    public void RootCalled(int quantity)
    {
        _rootCalled.Add(quantity);
    }
}

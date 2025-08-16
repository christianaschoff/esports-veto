namespace VETO.Metrics;
using System.Diagnostics.Metrics;

public class VetoDoneMetrics
{
    private readonly Counter<int> _vetosDone;
    public static string Name = "VetoDone.Counter";

    public VetoDoneMetrics(IMeterFactory meterFactory)
    {
        var meter = meterFactory.Create("VetoDone.Counter");
        _vetosDone = meter.CreateCounter<int>("vetodone.counter.veto_done");
    }

    public void VetosDone(int quantity)
    {
        _vetosDone.Add(quantity);
    }
}

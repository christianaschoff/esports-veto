namespace VETO.Metrics;
using System.Diagnostics.Metrics;

public class VetoCreationMetrics
{
    private readonly Counter<int> _vetosCreated;
    public static string Name = "VetoCreation.Counter";

    public VetoCreationMetrics(IMeterFactory meterFactory)
    {
        var meter = meterFactory.Create(Name);
        _vetosCreated = meter.CreateCounter<int>("vetocreation.counter.veto_created");
    }

    public void VetosCreated(int quantity)
    {
        _vetosCreated.Add(quantity);
    }
}

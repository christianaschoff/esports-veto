using System.Diagnostics;
using OpenTelemetry;
using OpenTelemetry.Logs;

namespace VETO.Extensions;

public class ActivityEventlogProcessor : BaseProcessor<LogRecord>
{

    public override void OnEnd(LogRecord data)
    {
        base.OnEnd(data);
        var currentActivity = Activity.Current;
        currentActivity?.AddEvent(new ActivityEvent(data.Attributes?.ToString() ?? "unknown"));
    }
}
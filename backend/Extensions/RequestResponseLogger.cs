using System.Diagnostics;
using System.Text.Json;
namespace VETO.Extensions;
public class RequestResponseLogger : IEndpointFilter
{

    private readonly ILogger<RequestResponseLogger> _logger;
    private readonly ActivitySource activitySource;
    private readonly Boolean isOpenTelemetryActive;
    public RequestResponseLogger(ILogger<RequestResponseLogger> logger, IConfiguration configuration, ActivitySource activitySource)
    {
        _logger = logger;
        this.activitySource = activitySource;
        isOpenTelemetryActive =  HelperFunctions.UseOpenTelemetry(configuration);
    }

    public async ValueTask<object?> InvokeAsync(EndpointFilterInvocationContext context, EndpointFilterDelegate next)
    {

        if (!isOpenTelemetryActive)
        {
            return await next(context);
        }

        var requestArgs = context.Arguments;
        _logger.LogInformation("Request {0}", JsonSerializer.Serialize(requestArgs));

        try
        {
            var response = await next(context);
            _logger.LogInformation("Response {0}", JsonSerializer.Serialize(response));
            return response;
        }
       
        catch (Exception ex)
        {
            _logger.LogError(ex.Message);
            _logger.LogError(ex.StackTrace);
            if (activitySource != null)
            {
                using var activity = activitySource.StartActivity("error Response");
                activity?.SetStatus(ActivityStatusCode.Error);                    
            }
            return Results.InternalServerError("Error");
        }
    }
}
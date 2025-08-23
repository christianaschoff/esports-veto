using System.Diagnostics;
using System.Security.Claims;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Primitives;
using Microsoft.IdentityModel.Tokens;
using VETO.Models;

namespace VETO.Extensions;

public static class HelperFunctions
{
    public static bool DoIRunInDocker()
    {
        var fromEnv = Environment.GetEnvironmentVariable("CONTAINER");
        if (!string.IsNullOrEmpty(fromEnv) && bool.TryParse(fromEnv, out bool result))
            return result;
        return false;
    }

    public static bool UseOpenTelemetry(IConfiguration configuration)
    {
        var val = DoIRunInDocker()
            ? Environment.GetEnvironmentVariable("UseOpenTelemetry")
            : configuration["UseOpenTelemetry"];
        return !string.IsNullOrEmpty(val) && bool.TryParse(val, out bool result) && result;
    }

    public static string GetTokenKey(TokenConfig? tokenConfig)
    {
        if (string.IsNullOrEmpty(tokenConfig?.Key) || tokenConfig.Key == "<YourSecretKey>")
        {
            return Environment.GetEnvironmentVariable("TOKEN_KEY") ?? "";
        }
        return tokenConfig.Key;
    }

    public static AttendeeType ExtractRoleFromString(string role)
    {
        if (role.Equals(Constants.OBSERVER, StringComparison.CurrentCultureIgnoreCase))
        {
            return AttendeeType.Observer;
        }

        if (role.Equals(Constants.PLAYER, StringComparison.CurrentCultureIgnoreCase))
        {
            return AttendeeType.Player;
        }

        if (role.Equals(Constants.ADMIN, StringComparison.CurrentCultureIgnoreCase))
        {
            return AttendeeType.Admin;
        }
        return AttendeeType.Unknown;
    }


    public static void RateLimiterOptionsCreator(Microsoft.AspNetCore.RateLimiting.RateLimiterOptions limiterOptions, WebApplicationBuilder builder, ActivitySource? vetoActivitySource, string jwtPolicyName)
    {
        var limiterConfig = builder.Configuration.GetSection("RateLimiter").Get<RateLimiterConfig>();
        limiterOptions.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

        limiterOptions.AddPolicy(policyName: jwtPolicyName, partitioner: httpContext =>
        {
            var accessToken = httpContext.Features.Get<IAuthenticateResultFeature>()?
                            .AuthenticateResult?.Properties?.GetTokenValue("access_token")?.ToString()
                        ?? string.Empty;

            if (!StringValues.IsNullOrEmpty(accessToken))
            {
                return RateLimitPartition.GetTokenBucketLimiter(accessToken, _ =>
                new TokenBucketRateLimiterOptions
                {
                    TokenLimit = limiterConfig?.TokenLimit ?? 15,
                    QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                    QueueLimit = limiterConfig?.QueueLimit ?? 30,
                    ReplenishmentPeriod = TimeSpan.FromSeconds(limiterConfig?.ReplenishmentPeriod ?? 15),
                    TokensPerPeriod = limiterConfig?.TokensPerPeriod ?? 50,
                    AutoReplenishment = limiterConfig?.AutoReplenishment ?? true
                });
            }
            return RateLimitPartition.GetTokenBucketLimiter("Anon", _ =>
                new TokenBucketRateLimiterOptions
                {
                    TokenLimit = 10,
                    QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                    QueueLimit = 5,
                    ReplenishmentPeriod = TimeSpan.FromSeconds(15),
                    TokensPerPeriod = 20,
                    AutoReplenishment = true
                });
        });

        if (HelperFunctions.UseOpenTelemetry(builder.Configuration))
        {
            limiterOptions.OnRejected = (context, ct) =>
            {
                using var activity = vetoActivitySource?.StartActivity("Rate-Limiter");
                activity?.SetStatus(ActivityStatusCode.Error, $"Rate Limiter hiy failed: {context.HttpContext.Request.Path}");
                return ValueTask.CompletedTask;
            };
        }
    }
}

 using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Diagnostics;
using System.Text;
using VETO.Models;

namespace VETO.Extensions;

public static class AuthenticationExtensions
{
    public static IServiceCollection AddAuthenticationSetup(this IServiceCollection services, IConfiguration configuration, ActivitySource? activitySource)
    {
        var tokenConfig = configuration.GetSection("Token").Get<TokenConfig>();

        services.AddAuthorization();
        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidIssuer = "ODGW.de",
                    ValidAudience = "ODGW.de",
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(HelperFunctions.GetTokenKey(tokenConfig)))
                };
                options.Events = new JwtBearerEvents
                {
                    OnAuthenticationFailed = ctx =>
                    {
                        if (activitySource != null)
                        {
                            using var activity = activitySource.StartActivity("not auth");
                            activity?.SetStatus(ActivityStatusCode.Error);
                            activity?.SetTag("Auth failed", ctx);
                        }
                        return Task.CompletedTask;
                    }
                };
            });

        return services;
    }
}
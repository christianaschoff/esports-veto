 using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using VETO.Models;

namespace VETO.Extensions;

public static class AuthenticationExtensions
{
    public static IServiceCollection AddAuthenticationSetup(this IServiceCollection services, IConfiguration configuration)
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

                // Add OpenTelemetry event handling if needed
            });

        return services;
    }
}
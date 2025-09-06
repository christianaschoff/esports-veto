using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using VETO.Metrics;
using VETO.Models;

namespace VETO.Extensions;

public static class TokenEndpoints
{
    public static WebApplication MapTokenEndpoints(this WebApplication app)
    {
        app.MapGet("/api/token", GetTokenHandler)
            .AddEndpointFilter<RequestResponseLogger>();
        return app;
    }

    private static IResult GetTokenHandler(TokenMetrics tokenMetrics, IOptions<TokenConfig> tokenConfig)
    {
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, "ODGW"),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(HelperFunctions.GetTokenKey(tokenConfig.Value)));            
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: "ODGW.de",
            audience: "ODGW.de",
            claims: claims,
            expires: DateTime.Now.ToUniversalTime().AddMinutes(30),
            signingCredentials: creds);

        tokenMetrics.TokenCreated(1);
        return Results.Ok(new JwtSecurityTokenHandler().WriteToken(token));
    }
}

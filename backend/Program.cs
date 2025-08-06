using System.IdentityModel.Tokens.Jwt;
using System.Runtime.CompilerServices;
using System.Security.Claims;
using System.Text;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Primitives;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;
using VETO.BusinessLogic;
using VETO.Models;
using VETO.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddOpenApi();
builder.Services.AddSignalR();

builder.Services.Configure<VetoSystemDatabaseConfig>(builder.Configuration.GetSection("VetoDatabase"));
builder.Services.Configure<TokenConfig>(builder.Configuration.GetSection("Token"));
builder.Services.Configure<RateLimiterConfig>(builder.Configuration.GetSection("RateLimiter"));
builder.Services.AddSingleton<VetoSystemSetupService>();
builder.Services.AddSingleton<VetoSystemResultService>();
builder.Services.AddSingleton<VetoCoordinator>();
builder.Services.AddHealthChecks();

var tokenConfig = builder.Configuration.GetSection("Token").Get<TokenConfig>();

builder.Services.AddAuthorization();
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                    {
                        options.TokenValidationParameters = new TokenValidationParameters
                        {
                            ValidateIssuer = true,
                            ValidateAudience = true,
                            ValidateLifetime = true,
                            ValidIssuer = "ODGW.de",
                            ValidAudience = "ODGW.de",
                            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(GetToken()))
                        };                        
                    });

var jwtPolicyName = "jwt";
builder.Services.AddRateLimiter(limiterOptions =>
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
    
});

builder.Services.AddHsts(options =>
{
    options.Preload = true;
    options.IncludeSubDomains = true;
    options.MaxAge = TimeSpan.FromDays(30);
});

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(
        builder =>
        {
            builder.WithOrigins("http://localhost:4200")
                .AllowAnyHeader()
                .WithMethods("GET", "POST")
                .AllowCredentials();
        });
});

var app = builder.Build();

app.MapHealthChecks("/healthz");

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
    app.UseCors();

}
if (!app.Environment.IsDevelopment())
{
    app.UseHsts();
    app.UseHttpsRedirection();
}
app.UseAuthorization();
app.UseRateLimiter();
app.UseStaticFiles();


app.MapHub<VetoSystemServiceHub>("/api/veto")
.RequireRateLimiting(jwtPolicyName);

app.MapGet("/api/token", () =>
{
    var claims = new[]
    {
        new Claim(JwtRegisteredClaimNames.Sub, "ODGW"),
        new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
    };    
    var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(GetToken()));
    var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

    var token = new JwtSecurityToken(
        issuer: "ODGW.de",
        audience: "ODGW.de",
        claims: claims,
        expires: DateTime.Now.ToUniversalTime().AddMinutes(30),
        signingCredentials: creds);

    return Results.Ok(new JwtSecurityTokenHandler().WriteToken(token));
});

app.MapPost("/api/create", async (VetoSystem veto, VetoSystemSetupService vetoSystemService) =>
{    
    var errorList = VetoValidator.ValidateVetoObject(veto);
    if (errorList.Count > 0)
    {        
        return Results.BadRequest(VetoValidator.FlatenErrors(errorList));
    }
    Console.WriteLine("TRY to CREATE: {0}", veto);
    await vetoSystemService.CreateAsync(veto);
    // Console.WriteLine(veto);    
    return Results.Ok(
        new { veto.playerAId, veto.playerBId, veto.vetoId, veto.Title, veto.PlayerA, veto.PlayerB, veto.BestOf, veto.Mode, veto.GameId, veto.observerId }
    );
})
.RequireRateLimiting(jwtPolicyName)
.RequireAuthorization();

app.MapGet("/api/create/{id}", async ([FromRoute] string id, VetoSystemSetupService vetoSystemService) =>
{
    ArgumentNullException.ThrowIfNullOrEmpty(id, nameof(id));
    ArgumentNullException.ThrowIfNullOrWhiteSpace(id, nameof(id));
    var veto = await vetoSystemService.GetByVetoIdAsync(id);
    if (veto == null)
    {
        return Results.NotFound("no valid veto session found");
    }
    return Results.Ok(
        new { veto.playerAId, veto.playerBId, veto.vetoId, veto.Title, veto.PlayerA, veto.PlayerB, veto.BestOf, veto.Mode, veto.GameId, veto.observerId, veto.Maps });
})
.RequireRateLimiting(jwtPolicyName)
.RequireAuthorization();


app.MapGet("/api/veto/{id}", async ([FromRoute] string id, VetoSystemSetupService vetoSystemService) =>
{
    ArgumentNullException.ThrowIfNullOrEmpty(id, nameof(id));
    ArgumentNullException.ThrowIfNullOrWhiteSpace(id, nameof(id));
    
    if (!Guid.TryParse(id, out Guid guid))
    {
        return Results.NotFound("no valid veto session provided");
    }
    var find = await vetoSystemService.GetVetoDataAsync(AttendeeType.Admin, id);
    return Results.Ok(find);
})
.RequireRateLimiting(jwtPolicyName)
.RequireAuthorization();

app.MapGet("/api/veto/{role}/{id}", async ([FromRoute] string role, [FromRoute] string id, VetoSystemSetupService vetoSystemService) =>
{    
    ArgumentNullException.ThrowIfNullOrEmpty(role, nameof(role));
    ArgumentNullException.ThrowIfNullOrWhiteSpace(role, nameof(role));
    ArgumentNullException.ThrowIfNullOrEmpty(id, nameof(id));
    ArgumentNullException.ThrowIfNullOrWhiteSpace(id, nameof(id));
    if (!Guid.TryParse(id, out Guid guid))
    {
        return Results.NotFound("no valid veto session provided");
    }
    var attendeeType = ExtractRoleFromString(role);
    var find = await vetoSystemService.GetVetoDataAsync(attendeeType, id);
    if (find != null)
    {        
        if (find.observerId == id)
        {
            return Results.Ok(new VetoParticipant(find.vetoId, find.observerId, Constants.OBSERVER));
        }
        if (find.playerAId == id)
        {
            return Results.Ok(new VetoParticipant(find.vetoId, find.playerAId, find.PlayerA));
        }
        if (find.playerBId == id)
        {            
            return Results.Ok(new VetoParticipant(find.vetoId, find.playerBId, find.PlayerB));
        }
    }
    return Results.NotFound("no valid veto session provided");
})
.RequireRateLimiting(jwtPolicyName)
.RequireAuthorization();


app.Run();

#region Helper

string GetToken() {
    string tokenKey = "";
    if (string.IsNullOrEmpty(tokenConfig?.Key) || tokenConfig.Key == "<YourSecretKey>")
    {
        tokenKey = Environment.GetEnvironmentVariable("TOKEN_KEY") ?? "";
    }
    return tokenKey;
}

AttendeeType ExtractRoleFromString(string role)
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
#endregion
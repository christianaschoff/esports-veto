using System.Diagnostics;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;
using VETO.BusinessLogic;
using VETO.Database;
using VETO.Metrics;
using VETO.Models;
using VETO.Services;
using VETO.Extensions;

var builder = WebApplication.CreateBuilder(args);

ActivitySource? vetoActivitySource = null;
builder.Services.AddOpenApi();
builder.Services.AddSignalRSetup(builder.Configuration);
if (HelperFunctions.UseOpenTelemetry(builder.Configuration))
{
    vetoActivitySource ??= new ActivitySource("VetoSystem");    
}

builder.Services.AddServices(builder);
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Services.AddHealthChecks();

var tokenConfig = builder.Configuration.GetSection("Token").Get<TokenConfig>();
var jwtPolicyName = "jwt";
builder.Services.AddAuthenticationSetup(builder.Configuration);
builder.Services.AddOpenTelemetrySetup(builder, vetoActivitySource);
builder.Services.AddRateLimiter(limiterOptions =>
{
    HelperFunctions.RateLimiterOptionsCreator(limiterOptions, builder, vetoActivitySource, jwtPolicyName);
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
    if (!HelperFunctions.DoIRunInDocker())
    {        
        app.UseHttpsRedirection();
    }
}

app.UseAuthorization();
app.UseRateLimiter();
app.UseDefaultFiles();
app.UseStaticFiles();

if (HelperFunctions.UseOpenTelemetry(builder.Configuration))
{
    app.MapPrometheusScrapingEndpoint();
}

app.MapHub<VetoSystemServiceHub>("/api/veto")
.RequireRateLimiting(jwtPolicyName);

app.MapFallbackToFile("/index.html");

app.Use(async (context, next) =>
{
    var path = context.Request.Path.Value?.ToLower();
    
    if (path == "/" && context.Request.Method == "GET")
    {
        var metric = app.Services.GetService<VetoRootCallMetrics>();
        metric?.RootCalled(1);
    }        

    if (path == null)
    {
        await next();
        return;
    }
     var staticExtensions = new[] { ".css", ".js", ".png", ".jpg", ".jpeg", ".gif", ".ico", ".svg", ".woff", ".woff2", ".ttf", ".eot" };
    if (staticExtensions.Any(ext => path.EndsWith(ext)) || 
        path.StartsWith("/api") || 
        path.StartsWith("/favicon.ico") ||
        path.StartsWith("/assets"))
    {
        await next();
        return;
    }
        
    context.Request.Path = "/index.html";    
    await next();
});

#region Endpoints
app.MapGet("/api/token", (TokenMetrics tokenMetrics) =>
{
    var claims = new[]
    {
        new Claim(JwtRegisteredClaimNames.Sub, "ODGW"),
        new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
    };    
    var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(HelperFunctions.GetTokenKey(builder.Configuration.GetSection("Token").Get<TokenConfig>())));
    var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

    var token = new JwtSecurityToken(
        issuer: "ODGW.de",
        audience: "ODGW.de",
        claims: claims,
        expires: DateTime.Now.ToUniversalTime().AddMinutes(30),
        signingCredentials: creds);

    tokenMetrics.TokenCreated(1);
    return Results.Ok(new JwtSecurityTokenHandler().WriteToken(token));
});

app.MapPost("/api/create", async (VetoSystem veto, VetoSystemSetupService vetoSystemService, VetoCreationMetrics vetoCreationMetrics) =>
{
    using var activity = vetoActivitySource?.StartActivity("Create-Veto");
    var errorList = VetoValidator.ValidateVetoObject(veto);
    if (errorList.Count > 0)
    {                
        activity?.SetStatus(ActivityStatusCode.Error, string.Join(",", errorList));
        return Results.BadRequest(VetoValidator.FlatenErrors(errorList));
    }    
    activity?.SetTag("creation", veto);
    await vetoSystemService.CreateAsync(veto);
    vetoCreationMetrics.VetosCreated(1);
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
    var attendeeType = HelperFunctions.ExtractRoleFromString(role);
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
#endregion

app.Services.GetService<MongoIndices>()?.CreateIndexesAsync().Wait();

app.Run();
using System.Diagnostics;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.RateLimiting;
using AspNetCore.SignalR.OpenTelemetry;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Primitives;
using Microsoft.IdentityModel.Tokens;
using OpenTelemetry.Logs;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;
using Scalar.AspNetCore;
using VETO.BusinessLogic;
using VETO.Database;
using VETO.Metrics;
using VETO.Models;
using VETO.Services;

var builder = WebApplication.CreateBuilder(args);
ActivitySource? vetoActivitySource = null;

builder.Services.AddOpenApi();

if (useOpenTelemetry())
{
    builder.Services.AddSignalR().AddHubInstrumentation(options =>
    {
        options.OnException = static (activity, exception) =>
        {
            if (exception is HubException)
            {
                activity.SetTag("otel.status_code", "OK");
            }
        };
    });
    vetoActivitySource = new ActivitySource("VetoSystem");
}
else
{
    builder.Services.AddSignalR();
}


builder.Services.Configure<VetoSystemDatabaseConfig>(builder.Configuration.GetSection("VetoDatabase"));
builder.Services.Configure<TokenConfig>(builder.Configuration.GetSection("Token"));
builder.Services.Configure<RateLimiterConfig>(builder.Configuration.GetSection("RateLimiter"));
builder.Services.AddSingleton<VetoSystemSetupService>();
builder.Services.AddSingleton<VetoSystemResultService>();
builder.Services.AddSingleton<VetoCoordinator>();

builder.Logging.ClearProviders();
builder.Logging.AddConsole();

builder.Services.AddHealthChecks();
builder.Services.AddSingleton<VetoCreationMetrics>();
builder.Services.AddSingleton<VetoDoneMetrics>();
builder.Services.AddSingleton<TokenMetrics>();
builder.Services.AddSingleton<VetoRootCallMetrics>();
builder.Services.AddSingleton<MongoIndices>();

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
                        if (useOpenTelemetry())
                        {
                            options.Events = new JwtBearerEvents
                            {
                                OnAuthenticationFailed = context =>
                                {                                
                                    using var activity = vetoActivitySource?.StartActivity("Jwt-Error");
                                    activity?.SetStatus(ActivityStatusCode.Error, $"Authentication failed: {context.Exception.Message}");
                                    return Task.CompletedTask;
                                }
                            };                            
                        }
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

    if (useOpenTelemetry())
    {
        limiterOptions.OnRejected = (context, ct) =>
        {        
                using var activity = vetoActivitySource?.StartActivity("Rate-Limiter");                
                activity?.SetStatus(ActivityStatusCode.Error, $"Rate Limiter hiy failed: {context.HttpContext.Request.Path}");
                return ValueTask.CompletedTask;
        };        
    }
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

#region openTelemetry
if (useOpenTelemetry())
{
    var tracingOtlpEndpoint = doIRunInDocker() ? Environment.GetEnvironmentVariable("OTLP_ENDPOINT_URL") : builder.Configuration["OTLP_ENDPOINT_URL"];
    var tracingZipkinEndpoint = doIRunInDocker() ? Environment.GetEnvironmentVariable("ZIPKIN_ENDPOINT_URL") : builder.Configuration["ZIPKIN_ENDPOINT_URL"];
    var openTelemetry = builder.Services.AddOpenTelemetry();

    openTelemetry.ConfigureResource(resource => resource
        .AddService(serviceName: builder.Environment.ApplicationName));

    openTelemetry.WithMetrics(metrics => metrics
        .AddAspNetCoreInstrumentation()
        .AddMeter(TokenMetrics.Name)
        .AddMeter(VetoCreationMetrics.Name)
        .AddMeter(VetoDoneMetrics.Name)
        .AddMeter(VetoRootCallMetrics.Name)
        .AddMeter("Microsoft.AspNetCore.Hosting")
        .AddMeter("Microsoft.AspNetCore.Server.Kestrel")
        .AddMeter("System.Net.Http")
        .AddMeter("System.Net.NameResolution")
        .AddOtlpExporter()
        .AddPrometheusExporter());

    builder.Logging.AddOpenTelemetry(options =>
    {
        options.SetResourceBuilder(ResourceBuilder.CreateDefault().AddService(builder.Environment.ApplicationName));
        options.IncludeFormattedMessage = true;
        options.IncludeScopes = true;
        options.ParseStateValues = true;
        options.AttachLogsToActivityEvent();
        options.AddOtlpExporter(otlpOptions =>
        {
            if (!string.IsNullOrEmpty(tracingOtlpEndpoint))
            {
                otlpOptions.Endpoint = new Uri(tracingOtlpEndpoint);
            }
        });
        options.AddConsoleExporter();
    });

    openTelemetry.WithTracing(tracing =>
    {
        tracing.AddAspNetCoreInstrumentation(options =>
            {
                options.Filter = (httpContext) =>
                {
                    var path = httpContext.Request.Path;
                    if (path.StartsWithSegments("/health"))
                    {
                        return false;
                    }
                    if (path.StartsWithSegments("/healthz"))
                    {
                        return false;
                    }
                    if (path.StartsWithSegments("/metrics"))
                    {
                        return false;
                    }
                    return true;
                };
            }
        );
        if (!string.IsNullOrEmpty(tracingOtlpEndpoint) || !string.IsNullOrEmpty(tracingZipkinEndpoint))
        {
            tracing.AddHttpClientInstrumentation();
            tracing.AddMongoDBInstrumentation();
            tracing.AddSignalRInstrumentation();
            if (!string.IsNullOrEmpty(tracingZipkinEndpoint))
            {
                tracing.AddZipkinExporter(otlpOptions => otlpOptions.Endpoint = new Uri(tracingZipkinEndpoint));
            }
            else if (!string.IsNullOrEmpty(tracingOtlpEndpoint))
            {
                tracing.AddOtlpExporter(otlpOptions => otlpOptions.Endpoint = new Uri(tracingOtlpEndpoint));
            }
        }
        else
        {
            tracing.AddConsoleExporter();
        }
        tracing.AddSource(vetoActivitySource?.Name ?? "");
    });
}
#endregion

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
    if (!doIRunInDocker())
    {        
        app.UseHttpsRedirection();
    }
}
app.UseAuthorization();
app.UseRateLimiter();
app.UseDefaultFiles();
app.UseStaticFiles();


if (useOpenTelemetry())
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

app.MapGet("/api/token", (TokenMetrics tokenMetrics) =>
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

app.Services.GetService<MongoIndices>()?.CreateIndexesAsync().Wait();

app.Run();

#region Helper

bool doIRunInDocker()
{
    var fromEnv = Environment.GetEnvironmentVariable("CONTAINER");
    if (!string.IsNullOrEmpty(fromEnv) && bool.TryParse(fromEnv, out bool result))
    {
        return result;
    }
    return false;
}

bool useOpenTelemetry()
{    
    var val = doIRunInDocker() ? Environment.GetEnvironmentVariable("UseOpenTelemetry") :  builder.Configuration["UseOpenTelemetry"];
    if (!string.IsNullOrEmpty(val) && bool.TryParse(val, out bool result))
    {
        return result;
    }
    return false;
}

string GetToken() {
    if (string.IsNullOrEmpty(tokenConfig?.Key) || tokenConfig.Key == "<YourSecretKey>")
    {
        return Environment.GetEnvironmentVariable("TOKEN_KEY") ?? "";
    }
    return tokenConfig.Key;
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
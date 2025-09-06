using System.Diagnostics;
using Scalar.AspNetCore;
using VETO.Database;
using VETO.Metrics;
using VETO.Models;
using VETO.Services;
using VETO.Extensions;


#region WebApplication Builder
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
if (!HelperFunctions.UseOpenTelemetry(builder.Configuration))
{
    builder.Logging.AddConsole();
}
builder.Services.AddHealthChecks();

var tokenConfig = builder.Configuration.GetSection("Token").Get<TokenConfig>();
var jwtPolicyName = "jwt";
builder.Services.AddOpenTelemetrySetup(builder, vetoActivitySource);
builder.Services.AddAuthenticationSetup(builder.Configuration, vetoActivitySource);

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
#endregion

#region App config
var app = builder.Build();

app.UseExceptionHandler(handler =>
{
    handler.Run(async (ctx) => {
        app.Logger.LogError("error context {0}", ctx);        
        await Results.Problem().ExecuteAsync(ctx);
    });
});


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
#endregion

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

#region endpoints
var vetoGroup = app.MapGroup("/api/veto")
    .RequireRateLimiting(jwtPolicyName)
    .AddEndpointFilter<RequestResponseLogger>()
    .RequireAuthorization();
vetoGroup.MapVetoEndpoints();

var createGroup = app.MapGroup("/api/create")
    .RequireRateLimiting(jwtPolicyName)
    .AddEndpointFilter<RequestResponseLogger>()
    .RequireAuthorization();

createGroup.MapCreateEndpoints();
app.MapTokenEndpoints();
app.MapVersionEndpoints();
#endregion

app.Services.GetService<MongoIndices>()?.CreateIndexesAsync().Wait();

app.Run();
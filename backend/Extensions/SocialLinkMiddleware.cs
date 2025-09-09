using VETO.Extensions;
using VETO.Models;
using VETO.Services;

public class SocialPreviewMiddleware
{
    private readonly RequestDelegate _next;
    private readonly IWebHostEnvironment _env;

    private static readonly string[] BotKeywords = new[]
    {
        "facebookexternalhit",
        "Facebot",
        "Twitterbot",
        "LinkedInBot",
        "WhatsApp",
        "Slackbot",
        "Discordbot"
    };

    public SocialPreviewMiddleware(RequestDelegate next, IWebHostEnvironment env)
    {
        _next = next;
        _env = env;
    }

    public async Task InvokeAsync(HttpContext context, VetoSystemSetupService vetoSystemService)
    {
        var path = context.Request.Path.Value ?? string.Empty;
        var ua = context.Request.Headers.UserAgent.ToString();
        
        if (IsBot(ua))
        {
            var protocol = context.Request.IsHttps ? "https" : "http";
            var host = $"{protocol}://{context.Request.Host}";
            var imgUrl = $"{host}/images/socialmedia.png";
            if (path.StartsWith("/veto/player/", StringComparison.OrdinalIgnoreCase))
            {
                var id = path.Split('/').Last();
                if (Guid.TryParse(id, out var playerId))
                {
                    var find = await vetoSystemService.GetVetoDataAsync(AttendeeType.Player, id);
                    if (find != null)
                    {
                        string attendee = string.Empty;
                        if (find.playerAId == id)
                            attendee = $"Player: {find.PlayerA}";
                        if (find.playerBId == id)
                            attendee = $"Player: {find.PlayerB}";

                        var absoluteUrl = $"{host}/veto/player/{playerId}";
                        var html = GenerateSocialMediaTags(attendee, absoluteUrl, imgUrl, find);
                        context.Response.ContentType = "text/html";
                        await context.Response.WriteAsync(html);
                        return;
                    }
                }
            }
            else if (path.StartsWith("/observe/", StringComparison.OrdinalIgnoreCase))
            {
                var id = path.Split('/').Last();
                if (Guid.TryParse(id, out var observerId))
                {
                    var find = await vetoSystemService.GetVetoDataAsync(AttendeeType.Observer, id);
                    if (find != null)
                    {

                        var absoluteUrl = $"{host}/observe/{observerId}";
                        var html = GenerateSocialMediaTags("Observer", absoluteUrl, imgUrl, find);
                        context.Response.ContentType = "text/html";
                        await context.Response.WriteAsync(html);
                        return;
                    }
                }
            }
            else if (path.StartsWith("/admin/", StringComparison.OrdinalIgnoreCase))
            {
                var id = path.Split('/').Last();
                if (Guid.TryParse(id, out var adminId))
                {
                    var find = await vetoSystemService.GetVetoDataAsync(AttendeeType.Admin, id);
                    if (find != null)
                    {

                        var absoluteUrl = $"{host}/admin/{adminId}";
                        var html = GenerateSocialMediaTags("Admin", absoluteUrl, imgUrl, find);
                        context.Response.ContentType = "text/html";
                        await context.Response.WriteAsync(html);
                        return;
                    }
                }
            }
        }

        // Otherwise continue normal pipeline (SPA, API, etc.)
        await _next(context);
    }

    private static string GenerateSocialMediaTags(string attendee, string absoluteUrl, string socialmediaImgUrl , VetoSystem find)
    {
        var description = $"{find.PlayerA} vs {find.PlayerB} ({find.BestOf} / {find.Mode[1..].ToLower()})";
        var title = $"VETO: {find.Title} - {attendee}";
        var html = $@"
            <!doctype html>
            <html>
            <head>
                <title>Veto - {attendee}</title>
                <meta property=""og:title"" content=""{title}"" />
                <meta property=""og:description"" content=""{description}"" />
                <meta property=""og:image"" content=""{socialmediaImgUrl}"" />
                <meta property=""og:url"" content=""{absoluteUrl}"" />
                <meta property=""og:type"" content=""website"" />
                <meta name=""twitter:card"" content=""summary_large_image"" />
                <meta name=""twitter:title"" content=""{title}"" />
                <meta name=""twitter:description"" content=""{description}"" />
                <meta name=""twitter:image"" content=""{socialmediaImgUrl}"" />
            </head>
            <body></body>
            </html>";
        return html;
    }

    private static bool IsBot(string userAgent)
    {
        if (string.IsNullOrEmpty(userAgent)) return false;
        return BotKeywords.Any(bot =>
            userAgent.IndexOf(bot, StringComparison.OrdinalIgnoreCase) >= 0);
    }
}

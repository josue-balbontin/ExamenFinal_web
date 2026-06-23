using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

namespace Backend.Middlewares;

public class IpRegionMiddleware
{
    private readonly RequestDelegate _next;

    public IpRegionMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        string region = "Local";

        if (context.Request.Headers.TryGetValue("X-Region", out var regionHeader))
        {
            region = regionHeader.ToString();
        }

        context.Items["Region"] = region;

        await _next(context);
    }
}

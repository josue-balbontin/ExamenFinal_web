using Microsoft.AspNetCore.Http;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using System.Collections.Concurrent;
using System.Linq;

namespace Backend.Middlewares;

public class IpRegionMiddleware
{
    private readonly RequestDelegate _next;
    private static readonly HttpClient _httpClient = new HttpClient();
    private static readonly ConcurrentDictionary<string, string> _ipCache = new ConcurrentDictionary<string, string>();

    public IpRegionMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        string region = "Local";
        string ipAddress = string.Empty;

        if (context.Request.Headers.TryGetValue("X-Forwarded-For", out var forwardedFor))
        {
            ipAddress = forwardedFor.FirstOrDefault()?.Split(',').FirstOrDefault()?.Trim() ?? string.Empty;
        }


        if (string.IsNullOrEmpty(ipAddress) && context.Connection.RemoteIpAddress != null)
        {
            ipAddress = context.Connection.RemoteIpAddress.ToString();
        }


        if (ipAddress == "127.0.0.1" || ipAddress == "::1" || string.IsNullOrEmpty(ipAddress))
        {
  
            if (context.Request.Headers.TryGetValue("X-Region", out var regionHeader))
            {
                region = regionHeader.ToString();
            }
            else
            {
                region = "Local";
            }
        }
        else
        {
 
            if (_ipCache.TryGetValue(ipAddress, out var cachedRegion))
            {
                region = cachedRegion;
            }
            else
            {
                try
                {
                    var response = await _httpClient.GetAsync($"http://ip-api.com/json/{ipAddress}");
                    if (response.IsSuccessStatusCode)
                    {
                        var json = await response.Content.ReadAsStringAsync();
                        using var doc = JsonDocument.Parse(json);
                        var root = doc.RootElement;

                        if (root.TryGetProperty("status", out var status) && status.GetString() == "success" &&
                            root.TryGetProperty("countryCode", out var countryCode))
                        {
                            region = countryCode.GetString() ?? "Local";
                            _ipCache.TryAdd(ipAddress, region);
                        }
                    }
                }
                catch
                {

                    region = "Local";
                }
            }
        }

        context.Items["Region"] = region;

        await _next(context);
    }
}

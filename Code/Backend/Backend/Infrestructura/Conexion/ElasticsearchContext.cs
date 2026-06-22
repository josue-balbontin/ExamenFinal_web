using Elastic.Clients.Elasticsearch;
using Elastic.Transport;

namespace Backend.Infrestructura.Conexion;

public class ElasticsearchContext
{
    private readonly ElasticsearchClient _client;

    public ElasticsearchContext(string url, string username = "elastic", string? password = null)
    {
        var settings = new ElasticsearchClientSettings(new Uri(url));
        
       
        if (!string.IsNullOrEmpty(password))
        {
            settings.Authentication(new BasicAuthentication(username, password));
        }
        
        _client = new ElasticsearchClient(settings);
    }

    public ElasticsearchClient Client => _client;
}

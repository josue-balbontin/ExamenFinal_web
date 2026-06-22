using Microsoft.AspNetCore.Mvc;

namespace Backend.Controladores
{
    [ApiController]
    [Route("api/[controller]")]
    public class TestController : ControllerBase
    {
        [HttpGet("ping")]
        public IActionResult Ping()
        {
            return Ok(new { message = "¡El backend está funcionando correctamente!", timestamp = DateTime.UtcNow });
        }
    }
}

using Microsoft.AspNetCore.Mvc;

namespace Proqrli.Controllers
{
    public class HomeController : Controller
    {
        private readonly IWebHostEnvironment _env;

        public HomeController(IWebHostEnvironment env)
        {
            _env = env;
        }

        // Serves wwwroot/frontend/index.html directly so that
        // Vite's hashed asset filenames are always correct
        // no hardcoded filenames anywhere.
        public IActionResult Index()
        {
            var filePath = Path.Combine(_env.WebRootPath, "frontend", "index.html");
            return PhysicalFile(filePath, "text/html");
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View();
        }
    }
}
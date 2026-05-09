using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;
using ProqrLi.Data;
using ProqrLi.Models;
using System.Security.Claims;

namespace ProqrLi.Filters
{
    public class AuditLogActionFilter : IAsyncActionFilter
    {
        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            var executed = await next();

            // Only log mutating operations (skip GET, HEAD, OPTIONS)
            var controllerName = context.Controller.GetType().Name;

            // Skip Auth controller — it handles its own explicit login/logout audit logging
            if (controllerName == "AuthController")
                return;

            var method = context.HttpContext.Request.Method;
            if (method == "GET" || method == "HEAD" || method == "OPTIONS")
                return;

            // Skip if the action returned an error (4xx/5xx)
            if (executed.Result is Microsoft.AspNetCore.Mvc.ObjectResult { StatusCode: >= 400 })
                return;

            var httpContext = context.HttpContext;
            var user = httpContext.User;

            // Must be authenticated to log
            if (user?.Identity?.IsAuthenticated != true)
                return;

            var tenantIdStr = user.FindFirstValue("tenant_id");
            if (!int.TryParse(tenantIdStr, out var tenantId))
                return;

            var userIdStr = user.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out var userId))
                return;

            var userName = user.FindFirstValue(ClaimTypes.Name) ?? "Unknown";
            var role = user.FindFirstValue("role_name") ?? "User";

            // Build action description
            controllerName = controllerName.Replace("Controller", "");
            var routeValues = context.RouteData.Values;

            var actionVerb = method switch
            {
                "POST" => "Created",
                "PUT" => "Updated",
                "PATCH" => "Updated",
                "DELETE" => "Deleted",
                _ => method
            };

            // Refine verb based on action name (e.g. Approve, Reject, Cancel)
            var routeAction = context.ActionDescriptor.RouteValues["action"] ?? "";
            if (routeAction.Contains("Approve", StringComparison.OrdinalIgnoreCase)) actionVerb = "Approved";
            else if (routeAction.Contains("Reject", StringComparison.OrdinalIgnoreCase)) actionVerb = "Rejected";
            else if (routeAction.Contains("Cancel", StringComparison.OrdinalIgnoreCase)) actionVerb = "Cancelled";
            else if (routeAction.Contains("Archive", StringComparison.OrdinalIgnoreCase)) actionVerb = "Archived";
            else if (routeAction.Contains("Invite", StringComparison.OrdinalIgnoreCase)) actionVerb = "Invited";

            // Try to get entity ID from route
            var entityId = routeValues.ContainsKey("id")
                ? routeValues["id"]?.ToString()
                : null;

            var module = controllerName switch
            {
                "Auth" => "Auth",
                "PurchaseRequisitions" => "Requisitions",
                "PurchaseOrders" => "Purchase Orders",
                "Invoices" => "Bills",
                "Payments" => "Payments",
                "Vendors" => "Vendors",
                "Inventory" => "Inventory",
                "Deliveries" => "Deliveries",
                "Rfqs" => "RFQs",
                "Contracts" => "Contracts",
                "Compliance" => "Compliance",
                "Team" => "Team",
                "Settings" => "Settings",
                "Marketplace" => "Marketplace",
                _ => controllerName
            };

            var description = entityId != null
                ? $"{actionVerb} {module} (ID: {entityId})"
                : $"{actionVerb} {module}";

            // Special case for Settings
            if (module == "Settings" && actionVerb == "Updated")
            {
                description = "Updated workspace settings";
            }

            // Log via a scoped DbContext so we don't interfere with any open transaction
            var scopeFactory = httpContext.RequestServices.GetRequiredService<IServiceScopeFactory>();
            using var scope = scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            var log = new AuditLog
            {
                TenantID = tenantId,
                UserID = userId,
                UserName = userName,
                Role = role,
                Action = description,
                Module = module,
                EntityId = entityId,
                IpAddress = httpContext.Connection.RemoteIpAddress?.ToString() ?? "0.0.0.0",
                Timestamp = DateTime.UtcNow
            };

            db.AuditLogs.Add(log);
            await db.SaveChangesAsync();
        }
    }
}

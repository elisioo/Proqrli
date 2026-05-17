using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using ProqrLi.Data;
using ProqrLi.Models;
using ProqrLi.Services;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString));
builder.Services.AddDatabaseDeveloperPageExceptionFilter();

builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.Cookie.Name     = "procurli.auth";
        options.Cookie.HttpOnly = true;
        options.Cookie.SameSite = SameSiteMode.Lax;
        options.ExpireTimeSpan  = TimeSpan.FromDays(7);
        options.SlidingExpiration = true;

        // Return HTTP 401/403 instead of redirecting to a login page
        // (the SPA handles navigation itself)
        options.Events.OnRedirectToLogin = ctx =>
        {
            ctx.Response.StatusCode = 401;
            return Task.CompletedTask;
        };
        options.Events.OnRedirectToAccessDenied = ctx =>
        {
            ctx.Response.StatusCode = 403;
            return Task.CompletedTask;
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddHttpClient();


builder.Services.AddScoped<IPasswordHasher<TenantUser>, PasswordHasher<TenantUser>>();
builder.Services.AddScoped<IPasswordHasher<PlatformUser>, PasswordHasher<PlatformUser>>();
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<OtpService>();
builder.Services.AddScoped<CloudinaryService>();
builder.Services.AddHttpClient<PayMongoService>();
builder.Services.AddHttpClient<StripeCheckoutService>();
builder.Services.AddSingleton<RfqMessageBroadcaster>();


builder.Services.AddControllers(options =>
    {
        options.Filters.Add<ProqrLi.Filters.AuditLogActionFilter>();
    })
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler =
            System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

builder.Services.AddCors(options =>
{
    options.AddPolicy("ViteDev", policy =>
        policy
            .WithOrigins("http://localhost:5173", "http://localhost:3000", "https://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials());
});

builder.Services.AddRazorPages(); 

var app = builder.Build();

// Run migrations + Database Seeder
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    var hasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher<TenantUser>>();
    var platformHasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher<PlatformUser>>();
    context.Database.Migrate();
    DbSeeder.Seed(context);

    // Initialize Demo Accounts
    var demoBuyerEmail = "demo_buyer@procurli.com";
    var demoVendorEmail = "demo_vendor@procurli.com";
    var superAdminEmail = "admin@procurli.io"; // or anything generic

    // Super Admin Account
    if (!context.PlatformUsers.Any(u => u.Email == superAdminEmail))
    {
        var admin = new PlatformUser
        {
            Email = superAdminEmail,
            Role = "superadmin",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };
        admin.PasswordHash = platformHasher.HashPassword(admin, "Admin123!");
        context.PlatformUsers.Add(admin);
    }

    if (!context.TenantUsers.Any(u => u.Email == demoBuyerEmail))
    {
        var buyerTenant = context.Tenants.FirstOrDefault(t => t.TenantType == "Buyer");
        if (buyerTenant != null)
        {
            var u = new TenantUser
            {
                TenantID = buyerTenant.TenantID,
                Email = demoBuyerEmail,
                FullName = "Demo Buyer",
                IsActive = true,
                OnboardingComplete = true,
                CreatedAt = DateTime.UtcNow
            };
            u.PasswordHash = hasher.HashPassword(u, "Password123!");
            context.TenantUsers.Add(u);
        }
    }

    if (!context.TenantUsers.Any(u => u.Email == demoVendorEmail))
    {
        var vendorTenant = context.Tenants.FirstOrDefault(t => t.TenantType == "Vendor" && t.CompanyName == "Acme Industrial Supply");
        if (vendorTenant == null) 
        {
             vendorTenant = new Tenant
             {
                 TenantType = "Vendor",
                 CompanyName = "Acme Industrial Supply",
                 Industry = "Industrial Equipment",
                 Status = "Active",
                 CreatedAt = DateTime.UtcNow
             };
             context.Tenants.Add(vendorTenant);
             context.SaveChanges();
        }
        else
        {
             vendorTenant.Industry = "Industrial Equipment";
             context.SaveChanges();
        }

        var u = new TenantUser
        {
            TenantID = vendorTenant.TenantID,
            Email = demoVendorEmail,
            FullName = "Demo Vendor",
            IsActive = true,
            OnboardingComplete = true,
            CreatedAt = DateTime.UtcNow
        };
        u.PasswordHash = hasher.HashPassword(u, "Password123!");
        context.TenantUsers.Add(u);
    }
    else
    {
        // Just in case the user already exists but the tenant industry wasn't set
        var existingAcme = context.Tenants.FirstOrDefault(t => t.TenantType == "Vendor" && t.CompanyName == "Acme Industrial Supply");
        if (existingAcme != null && string.IsNullOrEmpty(existingAcme.Industry))
        {
             existingAcme.Industry = "Industrial Equipment";
             context.SaveChanges();
        }
    }

    context.SaveChanges();

    var demoBuyerUser = context.TenantUsers.Include(u => u.Tenant).FirstOrDefault(u => u.Email == demoBuyerEmail);
    var demoVendorUser = context.TenantUsers.Include(u => u.Tenant).FirstOrDefault(u => u.Email == demoVendorEmail);

    if (demoBuyerUser != null && demoVendorUser != null)
    {
        var existingLink = context.AccreditationLinks.FirstOrDefault(l =>
            l.BuyerTenantID == demoBuyerUser.TenantID && 
            l.VendorTenantID == demoVendorUser.TenantID);

        if (existingLink == null)
        {
            context.AccreditationLinks.Add(new AccreditationLink
            {
                BuyerTenantID = demoBuyerUser.TenantID,
                VendorTenantID = demoVendorUser.TenantID,
                Status = "Accredited",
                AppliedAt = DateTime.UtcNow,
                ApprovedAt = DateTime.UtcNow
            });
            context.SaveChanges();
        }
    }
}


if (app.Environment.IsDevelopment())
{
    app.UseMigrationsEndPoint();
    app.UseCors("ViteDev");
}
else
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseRouting();

// Authentication MUST come before Authorization
app.UseAuthentication();
app.UseAuthorization();

app.MapStaticAssets();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}")
    .WithStaticAssets();

app.MapRazorPages();

app.MapControllers()
    .WithStaticAssets();


// SPA fallback — any route not matched above falls back to Home/Index
// so TanStack Router can handle it client-side.
app.MapFallbackToController("Index", "Home");

app.Run();

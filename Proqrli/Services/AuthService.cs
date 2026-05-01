using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using ProqrLi.Data;
using ProqrLi.Models;

namespace ProqrLi.Services
{
    /// <summary>
    /// Handles registration and login against the custom TenantUser / Role / UserRole tables.
    /// Uses ASP.NET Identity's PasswordHasher (PBKDF2) — no extra NuGet packages required.
    /// </summary>
    public class AuthService
    {
        private readonly ApplicationDbContext _db;
        private readonly IPasswordHasher<TenantUser> _hasher;

        public AuthService(ApplicationDbContext db, IPasswordHasher<TenantUser> hasher)
        {
            _db = db;
            _hasher = hasher;
        }

        // ─────────────────────────────────────────────────────────────────────
        // Register a new buyer tenant + owner user
        // ─────────────────────────────────────────────────────────────────────
        public async Task<AuthResponse> RegisterBuyerAsync(RegisterRequest req)
        {
            // Validate: email must be globally unique across all TenantUsers
            bool emailTaken = await _db.TenantUsers
                .AnyAsync(u => u.Email == req.Email);

            if (emailTaken)
                throw new InvalidOperationException("An account with this email already exists.");

            // 1. Create Tenant (buyer organisation)
            var tenant = new Tenant
            {
                TenantType  = "Buyer",
                CompanyName = req.CompanyName.Trim(),
                Industry    = string.IsNullOrWhiteSpace(req.Industry) ? null : req.Industry.Trim(),
                CompanySize = string.IsNullOrWhiteSpace(req.CompanySize) ? null : req.CompanySize.Trim(),
                ContactEmail = req.Email.Trim().ToLowerInvariant(),
                Status      = nameof(TenantStatus.Active),
            };
            _db.Tenants.Add(tenant);
            await _db.SaveChangesAsync(); // flush to get TenantID

            // 2. Create TenantUser
            var user = new TenantUser
            {
                TenantID = tenant.TenantID,
                Email    = req.Email.Trim().ToLowerInvariant(),
                FullName = req.FullName.Trim(),
                IsActive = true,
            };
            // Hash password using the user object (PBKDF2 via Identity's PasswordHasher)
            user.PasswordHash = _hasher.HashPassword(user, req.Password);
            _db.TenantUsers.Add(user);
            await _db.SaveChangesAsync(); // flush to get UserID

            // 3. Create the buyer_owner role for this tenant
            var role = new Role
            {
                TenantID    = tenant.TenantID,
                RoleName    = "buyer_owner",
                Description = "Full access — billing, team, vendors, approvals, payments.",
            };
            _db.Roles.Add(role);
            await _db.SaveChangesAsync(); // flush to get RoleID

            // 4. Assign the role to the user
            _db.UserRoles.Add(new UserRole
            {
                UserID = user.UserID,
                RoleID = role.RoleID,
            });
            await _db.SaveChangesAsync();

            return BuildResponse(user, tenant, role.RoleName);
        }

        // ─────────────────────────────────────────────────────────────────────
        // Validate credentials and return session info
        // ─────────────────────────────────────────────────────────────────────
        public async Task<AuthResponse> LoginAsync(LoginRequest req)
        {
            var email = req.Email.Trim().ToLowerInvariant();

            var user = await _db.TenantUsers
                .Include(u => u.Tenant)
                .FirstOrDefaultAsync(u => u.Email == email && u.IsActive);

            if (user == null)
                throw new UnauthorizedAccessException("Invalid email or password.");

            var verifyResult = _hasher.VerifyHashedPassword(user, user.PasswordHash, req.Password);
            if (verifyResult == PasswordVerificationResult.Failed)
                throw new UnauthorizedAccessException("Invalid email or password.");

            // Re-hash on SuccessRehashNeeded (keeps security current)
            if (verifyResult == PasswordVerificationResult.SuccessRehashNeeded)
            {
                user.PasswordHash = _hasher.HashPassword(user, req.Password);
                await _db.SaveChangesAsync();
            }

            // Resolve role (first assigned role)
            var userRole = await _db.UserRoles
                .Include(ur => ur.Role)
                .FirstOrDefaultAsync(ur => ur.UserID == user.UserID);

            var roleName = userRole?.Role?.RoleName ?? "buyer_procurement";

            return BuildResponse(user, user.Tenant!, roleName);
        }

        // ─────────────────────────────────────────────────────────────────────
        // Resolve session from a persisted cookie (GET /api/auth/me)
        // ─────────────────────────────────────────────────────────────────────
        public async Task<AuthResponse?> GetByIdAsync(int userId)
        {
            var user = await _db.TenantUsers
                .Include(u => u.Tenant)
                .FirstOrDefaultAsync(u => u.UserID == userId && u.IsActive);

            if (user == null) return null;

            var userRole = await _db.UserRoles
                .Include(ur => ur.Role)
                .FirstOrDefaultAsync(ur => ur.UserID == userId);

            var roleName = userRole?.Role?.RoleName ?? "buyer_procurement";

            return BuildResponse(user, user.Tenant!, roleName);
        }

        // ─────────────────────────────────────────────────────────────────────
        private static AuthResponse BuildResponse(TenantUser user, Tenant tenant, string role) =>
            new(
                UserId:      user.UserID,
                Email:       user.Email,
                FullName:    user.FullName ?? "",
                TenantId:    tenant.TenantID,
                CompanyName: tenant.CompanyName,
                TenantType:  tenant.TenantType,
                Role:        role
            );
    }
}

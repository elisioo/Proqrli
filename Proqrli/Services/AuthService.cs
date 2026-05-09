using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using ProqrLi.Data;
using ProqrLi.Models;

namespace ProqrLi.Services
{
    public class AuthService
    {
        private readonly ApplicationDbContext         _db;
        private readonly IPasswordHasher<TenantUser> _hasher;

        public AuthService(ApplicationDbContext db, IPasswordHasher<TenantUser> hasher)
        {
            _db     = db;
            _hasher = hasher;
        }

        // ── Helpers ────────────────────────────────────────────────────────────

        public async Task<bool> IsEmailTakenAsync(string email)
            => await _db.TenantUsers.AnyAsync(u => u.Email == email.Trim().ToLowerInvariant());

        public async Task<bool> IsEmailTakenByActiveUserAsync(string email)
            => await _db.TenantUsers.AnyAsync(u => u.Email == email.Trim().ToLowerInvariant() && !u.MustChangePassword);

        // ── Step 3: Register (email + password only) ──────────────────────────

        public async Task<AuthResponse> RegisterAsync(RegisterRequest req)
        {
            var email = req.Email.Trim().ToLowerInvariant();

            if (await IsEmailTakenAsync(email))
                throw new InvalidOperationException("An account with this email already exists.");

            // 1. Create a placeholder Tenant (company details filled during onboarding)
            var tenant = new Tenant
            {
                TenantType   = req.Portal == "vendor" ? "Vendor" : "Buyer",
                CompanyName  = email,      // temporary placeholder — replaced during onboarding
                ContactEmail = email,
                Status       = nameof(TenantStatus.Active),
            };
            _db.Tenants.Add(tenant);
            await _db.SaveChangesAsync();

            // 2. Create TenantUser
            var user = new TenantUser
            {
                TenantID = tenant.TenantID,
                Email    = email,
                IsActive = true,
                OnboardingComplete = false,
            };
            user.PasswordHash = _hasher.HashPassword(user, req.Password);
            _db.TenantUsers.Add(user);
            await _db.SaveChangesAsync();

            // 3. Assign default role
            var roleName = req.Portal == "vendor" ? "vendor_owner" : "buyer_owner";
            var role = new Role
            {
                TenantID    = tenant.TenantID,
                RoleName    = roleName,
                Description = req.Portal == "vendor"
                    ? "Full access — billing, team, products, orders."
                    : "Full access — billing, team, vendors, approvals, payments.",
            };
            _db.Roles.Add(role);
            await _db.SaveChangesAsync();

            _db.UserRoles.Add(new UserRole { UserID = user.UserID, RoleID = role.RoleID });
            await _db.SaveChangesAsync();

            return BuildResponse(user, tenant, roleName);
        }

        // ── Step 4: Save onboarding profile ──────────────────────────────────

        public async Task<AuthResponse> SaveOnboardingAsync(int userId, OnboardingRequest req)
        {
            var user = await _db.TenantUsers
                .Include(u => u.Tenant)
                .FirstOrDefaultAsync(u => u.UserID == userId)
                ?? throw new InvalidOperationException("User not found.");

            var tenant = user.Tenant!;

            // Update user profile
            user.FullName          = req.FullName.Trim();
            user.Position          = req.Position.Trim();
            user.ContactNumber     = req.ContactNumber.Trim();
            user.OnboardingComplete = true;

            // Update tenant / company info
            tenant.CompanyName = req.CompanyName.Trim();
            tenant.CompanySize = req.CompanySize.Trim();
            if (!string.IsNullOrWhiteSpace(req.Industry))
                tenant.Industry = req.Industry.Trim();
            if (!string.IsNullOrWhiteSpace(req.ContactNumber))
                tenant.ContactPhone = req.ContactNumber.Trim();

            // Handle Subscription Plan Selection
            if (req.PlanId.HasValue)
            {
                var plan = await _db.SubscriptionPlans.FindAsync(req.PlanId.Value);
                if (plan != null)
                {
                    var subscription = new TenantSubscription
                    {
                        TenantID = tenant.TenantID,
                        PlanID = plan.PlanID,
                        StartDate = DateTime.UtcNow,
                        EndDate = DateTime.UtcNow.AddMonths(1), // Assuming monthly billing for now
                        Status = "Active",
                        IsTrialPeriod = plan.Price == 0
                    };
                    _db.TenantSubscriptions.Add(subscription);

                    // Create a billing record if it's not free
                    if (plan.Price > 0)
                    {
                        var billing = new Billing
                        {
                            TenantID = tenant.TenantID,
                            Amount = plan.Price,
                            BillingDate = DateTime.UtcNow,
                            Status = "Pending" // Simulated payment state
                        };
                        _db.Billings.Add(billing);
                    }
                }
            }

            await _db.SaveChangesAsync();

            // Resolve role
            var userRole = await _db.UserRoles
                .Include(ur => ur.Role)
                .FirstOrDefaultAsync(ur => ur.UserID == userId);
            var roleName = userRole?.Role?.RoleName ?? "buyer_owner";

            return BuildResponse(user, tenant, roleName);
        }

        // ── Login ─────────────────────────────────────────────────────────────

        /// <summary>
        /// Login with MustChangePassword flag for invited users.
        /// Returns tuple with AuthResponse and mustChangePassword flag.
        /// </summary>
        public async Task<(AuthResponse response, bool mustChangePassword)> LoginAsync(LoginRequest req)
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

            if (verifyResult == PasswordVerificationResult.SuccessRehashNeeded)
            {
                user.PasswordHash = _hasher.HashPassword(user, req.Password);
                await _db.SaveChangesAsync();
            }

            var mustChangePassword = user.MustChangePassword;

            var userRole = await _db.UserRoles
                .Include(ur => ur.Role)
                .FirstOrDefaultAsync(ur => ur.UserID == user.UserID);
            var roleName = userRole?.Role?.RoleName ?? "buyer_owner";

            return (BuildResponse(user, user.Tenant!, roleName), mustChangePassword);
        }

        // ── Get by ID (used by /me) ────────────────────────────────────────────

        public async Task<AuthResponse?> GetByIdAsync(int userId)
        {
            var user = await _db.TenantUsers
                .Include(u => u.Tenant)
                .FirstOrDefaultAsync(u => u.UserID == userId && u.IsActive);

            if (user == null) return null;

            var userRole = await _db.UserRoles
                .Include(ur => ur.Role)
                .FirstOrDefaultAsync(ur => ur.UserID == userId);
            var roleName = userRole?.Role?.RoleName ?? "buyer_owner";

            return BuildResponse(user, user.Tenant!, roleName);
        }

        // ── Team Management ─────────────────────────────────────────────────────

        public async Task<TenantUser?> GetUserByIdAsync(int userId)
            => await _db.TenantUsers.FindAsync(userId);

        public async Task<TenantUser?> GetUserByEmailAsync(string email)
            => await _db.TenantUsers
                .FirstOrDefaultAsync(u => u.Email == email.Trim().ToLowerInvariant());

        public async Task<string?> GetUserRoleAsync(int userId)
        {
            var userRole = await _db.UserRoles
                .Include(ur => ur.Role)
                .FirstOrDefaultAsync(ur => ur.UserID == userId);
            return userRole?.Role?.RoleName;
        }

        public async Task<List<TeamMemberDto>> GetTeamMembersAsync(int tenantId)
        {
            var users = await _db.TenantUsers
                .Where(u => u.TenantID == tenantId && u.IsActive)
                .ToListAsync();

            var userIds = users.Select(u => u.UserID).ToList();
            var userRoles = await _db.UserRoles
                .Include(ur => ur.Role)
                .Where(ur => userIds.Contains(ur.UserID))
                .ToListAsync();

            var roleMap = userRoles.ToDictionary(ur => ur.UserID, ur => ur.Role?.RoleName ?? "");

            return users.Select(u => new TeamMemberDto(
                UserId: u.UserID,
                Email: u.Email,
                FullName: u.FullName ?? "",
                Position: u.Position ?? "",
                Role: roleMap.GetValueOrDefault(u.UserID, ""),
                IsActive: u.IsActive,
                MustChangePassword: u.MustChangePassword,
                CreatedAt: u.CreatedAt
            )).ToList();
        }

        public async Task<(TenantUser user, string tempPassword)> InviteUserAsync(
            int tenantId, int invitedByUserId, string email, string roleName,
            string? fullName = null, string? position = null)
        {
            var normalisedEmail = email.Trim().ToLowerInvariant();

            if (await IsEmailTakenByActiveUserAsync(normalisedEmail))
                throw new InvalidOperationException("An active account with this email already exists.");

            // Remove any previous pending invite for this email in this tenant
            var existing = await _db.TenantUsers
                .FirstOrDefaultAsync(u => u.Email == normalisedEmail && u.TenantID == tenantId);
            if (existing != null)
            {
                _db.TenantUsers.Remove(existing);
                await _db.SaveChangesAsync();
            }

            // Generate temporary password
            var tempPassword = GenerateTempPassword();

            var user = new TenantUser
            {
                TenantID = tenantId,
                Email = normalisedEmail,
                FullName = fullName?.Trim(),
                Position = position?.Trim(),
                IsActive = true,
                OnboardingComplete = false,
                MustChangePassword = true,
                InvitedByUserID = invitedByUserId,
            };
            user.PasswordHash = _hasher.HashPassword(user, tempPassword);
            _db.TenantUsers.Add(user);
            await _db.SaveChangesAsync();

            // Ensure role exists for this tenant
            var role = await _db.Roles
                .FirstOrDefaultAsync(r => r.TenantID == tenantId && r.RoleName == roleName);
            if (role == null)
            {
                role = new Role
                {
                    TenantID = tenantId,
                    RoleName = roleName,
                    Description = $"{roleName} role"
                };
                _db.Roles.Add(role);
                await _db.SaveChangesAsync();
            }

            _db.UserRoles.Add(new UserRole { UserID = user.UserID, RoleID = role.RoleID });
            await _db.SaveChangesAsync();

            return (user, tempPassword);
        }

        public async Task UpdateUserRoleAsync(int tenantId, int userId, string newRoleName)
        {
            var user = await _db.TenantUsers
                .FirstOrDefaultAsync(u => u.UserID == userId && u.TenantID == tenantId);
            if (user == null) throw new InvalidOperationException("User not found.");

            var existing = await _db.UserRoles
                .Include(ur => ur.Role)
                .FirstOrDefaultAsync(ur => ur.UserID == userId);

            // Ensure target role exists
            var role = await _db.Roles
                .FirstOrDefaultAsync(r => r.TenantID == tenantId && r.RoleName == newRoleName);
            if (role == null)
            {
                role = new Role
                {
                    TenantID = tenantId,
                    RoleName = newRoleName,
                    Description = $"{newRoleName} role"
                };
                _db.Roles.Add(role);
                await _db.SaveChangesAsync();
            }

            if (existing != null)
            {
                existing.RoleID = role.RoleID;
            }
            else
            {
                _db.UserRoles.Add(new UserRole { UserID = userId, RoleID = role.RoleID });
            }
            await _db.SaveChangesAsync();
        }

        public async Task DeactivateUserAsync(int tenantId, int userId)
        {
            var user = await _db.TenantUsers
                .FirstOrDefaultAsync(u => u.UserID == userId && u.TenantID == tenantId);
            if (user == null) throw new InvalidOperationException("User not found.");
            user.IsActive = false;
            await _db.SaveChangesAsync();
        }

        // ── Password change (invited user) ──────────────────────────────────────

        public async Task<AuthResponse> ChangePasswordAsync(string email, string newPassword)
        {
            var normalisedEmail = email.Trim().ToLowerInvariant();
            var user = await _db.TenantUsers
                .Include(u => u.Tenant)
                .FirstOrDefaultAsync(u => u.Email == normalisedEmail && u.IsActive);

            if (user == null)
                throw new InvalidOperationException("User not found.");

            user.PasswordHash = _hasher.HashPassword(user, newPassword);
            user.MustChangePassword = false;
            await _db.SaveChangesAsync();

            var userRole = await _db.UserRoles
                .Include(ur => ur.Role)
                .FirstOrDefaultAsync(ur => ur.UserID == user.UserID);
            var roleName = userRole?.Role?.RoleName ?? "buyer_owner";

            return BuildResponse(user, user.Tenant!, roleName);
        }

        private static string GenerateTempPassword()
        {
            const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
            var rng = new Random();
            return new string(Enumerable.Range(0, 12).Select(_ => chars[rng.Next(chars.Length)]).ToArray());
        }

        // ─────────────────────────────────────────────────────────────────────

        private static AuthResponse BuildResponse(TenantUser user, Tenant tenant, string role) =>
            new(
                UserId:             user.UserID,
                Email:              user.Email,
                FullName:           user.FullName ?? "",
                Position:           user.Position ?? "",
                ContactNumber:      user.ContactNumber ?? "",
                TenantId:           tenant.TenantID,
                CompanyName:        tenant.CompanyName,
                TenantType:         tenant.TenantType,
                Role:               role,
                OnboardingComplete: user.OnboardingComplete
            );
    }
}

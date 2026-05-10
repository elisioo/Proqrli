namespace ProqrLi.Models
{
    /// <summary>DTO for team member listing</summary>
    public record TeamMemberDto(
        int UserId,
        string Email,
        string FullName,
        string Position,
        string Role,
        bool IsActive,
        bool MustChangePassword,
        DateTime CreatedAt
    );

    /// <summary>Step 1 — request to send OTP to an email</summary>
    public record SendOtpRequest(string Email);

    /// <summary>Step 2 — OTP verification payload</summary>
    public record VerifyOtpRequest(string Email, string Code);

    /// <summary>Step 3 — create account (email + password; company set up later in onboarding)</summary>
    public record RegisterRequest(
        string Email,
        string Password,
        string Portal = "buyer"       // "buyer" | "vendor"
    );

    /// <summary>Step 4 — onboarding profile submitted after first login</summary>
    public record OnboardingRequest(
        string  CompanyName,
        string  CompanySize,
        string  FullName,
        string  ContactNumber,
        string  Position,
        string? Industry      = null,
        // Buyer profile (optional)
        bool    HasBuyerProfile = false,
        string? BuyerCompanyName = null,
        string? BuyerContactName = null,
        string? BuyerEmail       = null,
        string? BuyerPhone       = null,
        // Subscription 
        int?    PlanId           = null
    );

    /// <summary>Payload for POST /api/auth/login</summary>
    public record LoginRequest(
        string Email,
        string Password
    );

    /// <summary>
    /// Returned by /api/auth/register, /api/auth/login, /api/auth/me, /api/auth/onboarding.
    /// Matches the AuthUser TypeScript type in the frontend api.ts.
    /// </summary>
    public record AuthResponse(
        int    UserId,
        string Email,
        string FullName,
        string Position,
        string ContactNumber,
        int    TenantId,
        string CompanyName,
        string TenantType,
        string Role,
        bool   OnboardingComplete
    );

    /// <summary>PATCH /api/auth/profile — update own display name, position, phone</summary>
    public record UpdateProfileRequest(
        string? FullName       = null,
        string? Position       = null,
        string? ContactNumber  = null
    );

    /// <summary>POST /api/auth/update-password — change own password</summary>
    public record UpdatePasswordRequest(
        string OldPassword,
        string NewPassword
    );
}

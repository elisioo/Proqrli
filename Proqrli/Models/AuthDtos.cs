namespace ProqrLi.Models
{
    /// <summary>Payload for POST /api/auth/register</summary>
    public record RegisterRequest(
        string CompanyName,
        string FullName,
        string Email,
        string Password,
        string Industry = "",
        string CompanySize = "Small"
    );

    /// <summary>Payload for POST /api/auth/login</summary>
    public record LoginRequest(
        string Email,
        string Password
    );

    /// <summary>
    /// Returned by /api/auth/register, /api/auth/login, /api/auth/me.
    /// Matches the AuthUser TypeScript type in the frontend api.ts.
    /// </summary>
    public record AuthResponse(
        int UserId,
        string Email,
        string FullName,
        int TenantId,
        string CompanyName,
        string TenantType,
        string Role
    );
}

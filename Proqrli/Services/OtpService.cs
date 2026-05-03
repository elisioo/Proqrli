using System.Security.Cryptography;
using Microsoft.EntityFrameworkCore;
using ProqrLi.Data;
using ProqrLi.Models;
using SendGrid;
using SendGrid.Helpers.Mail;

namespace ProqrLi.Services
{
    public class OtpService
    {
        private readonly ApplicationDbContext _db;
        private readonly IConfiguration _config;
        private readonly ILogger<OtpService> _logger;

        public OtpService(ApplicationDbContext db, IConfiguration config, ILogger<OtpService> logger)
        {
            _db = db;
            _config = config;
            _logger = logger;
        }

        public async Task<string> GenerateAndSendOtpAsync(string email)
        {
            var key = Normalise(email);

            // Spam prevention: Check if an OTP was requested too many times recently
            var recentOtps = await _db.EmailOtps
                .Where(o => o.Email == key && o.CreatedAt >= DateTime.UtcNow.AddMinutes(-10))
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();

            if (recentOtps.Count >= 5)
            {
                throw new InvalidOperationException("Too many requests. Please wait 10 minutes before trying again.");
            }

            var latest = recentOtps.FirstOrDefault();
            if (latest != null && latest.CreatedAt >= DateTime.UtcNow.AddSeconds(-30))
            {
                throw new InvalidOperationException("Please wait 30 seconds before requesting a new code.");
            }

            var code = RandomNumberGenerator.GetInt32(100_000, 1_000_000).ToString();
            
            var otpEntry = new EmailOtp
            {
                Email = key,
                Code = code,
                ExpiresAt = DateTime.UtcNow.AddMinutes(3), // 3 minutes validity
                IsUsed = false,
                ResendCount = recentOtps.Count
            };

            _db.EmailOtps.Add(otpEntry);
            await _db.SaveChangesAsync();

            // Send via SendGrid
            await SendEmailOtpAsync(key, code);

            return code;
        }

        public async Task<bool> VerifyAsync(string email, string code)
        {
            var key = Normalise(email);
            var trimCode = code.Trim();

            // Get the latest unused OTP for this email
            var entry = await _db.EmailOtps
                .Where(o => o.Email == key && !o.IsUsed)
                .OrderByDescending(o => o.CreatedAt)
                .FirstOrDefaultAsync();

            if (entry == null) return false;
            
            if (entry.ExpiresAt < DateTime.UtcNow) 
            {
                return false;
            }

            if (entry.Code != trimCode)
            {
                return false;
            }

            // Mark as used
            entry.IsUsed = true;
            await _db.SaveChangesAsync();
            return true;
        }

        private async Task SendEmailOtpAsync(string email, string code)
        {
            var apiKey = _config["SendGrid:ApiKey"];
            if (string.IsNullOrEmpty(apiKey))
            {
                _logger.LogWarning("SendGrid API key is missing. Skipping actual email send.");
                return;
            }

            var senderEmail = _config["SendGrid:SenderEmail"] ?? "noreply@proqrli.com";
            var senderName = _config["SendGrid:SenderName"] ?? "ProqrLi Team";

            var client = new SendGridClient(apiKey);
            var from = new EmailAddress(senderEmail, senderName);
            var to = new EmailAddress(email);
            
            var subject = "Your ProcurLi Verification Code";
            var plainTextContent = $"Your verification code is: {code}";
            
            var htmlContent = $@"
            <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;'>
                <h2 style='color: #000; text-align: center;'>Welcome to ProcurLi</h2>
                <p style='color: #555; font-size: 16px; text-align: center;'>
                    Please use the verification code below to confirm your email address and continue your registration.
                </p>
                <div style='background-color: #f4f4f5; border-radius: 8px; padding: 20px; margin: 30px 0; text-align: center;'>
                    <span style='font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #000;'>{code}</span>
                </div>
                <p style='color: #888; font-size: 12px; text-align: center;'>
                    This code will expire in 3 minutes. If you did not request this, please ignore this email.
                </p>
            </div>";

            var msg = MailHelper.CreateSingleEmail(from, to, subject, plainTextContent, htmlContent);

            var response = await client.SendEmailAsync(msg);
            if (!response.IsSuccessStatusCode)
            {
                var errorBody = await response.Body.ReadAsStringAsync();
                var status = response.StatusCode;
                _logger.LogError($"Failed to send OTP email via SendGrid. Status: {status}. Error: {errorBody}");
                
                // Throw an exception so the frontend knows it failed
                throw new InvalidOperationException($"Email provider error: {status}. Please ensure your SendGrid sender is verified. Details: {errorBody}");
            }
        }

        private static string Normalise(string email) => email.Trim().ToLowerInvariant();
    }
}

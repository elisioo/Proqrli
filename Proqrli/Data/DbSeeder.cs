using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using ProqrLi.Models;

namespace ProqrLi.Data
{
    public static class DbSeeder
    {
        public static void Seed(ApplicationDbContext context)
        {
            // Only seed if there are no vendor tenants yet.
            if (!context.Tenants.Any(t => t.TenantType == "Vendor"))
            {
                var random = new Random();

                var industries = new[] { 
                    "IT Hardware", "Software Services", "Office Supplies", 
                    "Logistics", "Marketing", "Consulting", "Manufacturing", 
                    "Facilities Management", "Legal Services", "Catering" 
                };

                var sizes = new[] { "Micro", "Small", "Medium", "Large", "Enterprise" };
                
                var prefixes = new[] { "Global", "Apex", "Prime", "Quantum", "Nexus", "Stellar", "Dynamic", "Pinnacle", "Aero", "Horizon" };
                var roots = new[] { "Tech", "Systems", "Solutions", "Logistics", "Industries", "Group", "Enterprises", "Dynamics", "Networks", "Corp" };
                var suffixes = new[] { "LLC", "Inc.", "Ltd.", "Co.", "Partners" };

                var vendorsToInsert = new List<Tenant>();

                // 1. Create ~100 random Vendors
                for (int i = 1; i <= 100; i++)
                {
                    string companyName = $"{prefixes[random.Next(prefixes.Length)]} {roots[random.Next(roots.Length)]} {suffixes[random.Next(suffixes.Length)]}";
                    
                    // Add a number if by chance we generated a duplicate name
                    if (vendorsToInsert.Any(v => v.CompanyName == companyName))
                        companyName += $" {i}";

                    var vendor = new Tenant
                    {
                        TenantType = "Vendor",
                        CompanyName = companyName,
                        Industry = industries[random.Next(industries.Length)],
                        CompanySize = sizes[random.Next(sizes.Length)],
                        ContactEmail = $"contact@{companyName.Replace(" ", "").Replace(".", "").ToLower()}.com",
                        ContactPhone = $"+1-555-{random.Next(100, 999)}-{random.Next(1000, 9999)}",
                        Status = "Active",
                        CreatedAt = DateTime.UtcNow.AddDays(-random.Next(1, 365))
                    };

                    vendorsToInsert.Add(vendor);
                }

                context.Tenants.AddRange(vendorsToInsert);
                context.SaveChanges();

                // 2. We need a Buyer to associate risk scores to. Find one, or create a mock Buyer if none exists.
                var buyer = context.Tenants.FirstOrDefault(t => t.TenantType == "Buyer");
                if (buyer == null)
                {
                    buyer = new Tenant
                    {
                        TenantType = "Buyer",
                        CompanyName = "ProcurLi Demo Buyer",
                        Status = "Active"
                    };
                    context.Tenants.Add(buyer);
                    context.SaveChanges();
                }

                // 3. Generate VendorRiskScores for the newly created vendors to populate the Risk Leaderboard
                var riskScores = new List<VendorRiskScore>();
                foreach (var v in vendorsToInsert)
                {
                    // Generate somewhat realistic distributions
                    decimal mlRisk = (decimal)random.NextDouble() * 0.9m; // 0 to 0.90
                    string classification = mlRisk > 0.70m ? "High" : (mlRisk > 0.40m ? "Medium" : "Low");
                    
                    var risk = new VendorRiskScore
                    {
                        VendorTenantID = v.TenantID,
                        BuyerTenantID = buyer.TenantID,
                        OnTimeDeliveryRate = 0.50m + ((decimal)random.NextDouble() * 0.50m), // 50% to 100%
                        DefectRate = ((decimal)random.NextDouble() * 0.15m), // 0% to 15%
                        PriceVariance = ((decimal)random.NextDouble() * 0.20m), // 0% to 20%
                        ComplianceViolations = random.Next(0, 4),
                        ContractFulfillmentRate = 0.60m + ((decimal)random.NextDouble() * 0.40m), // 60% to 100%
                        MLRiskScore = mlRisk,
                        RiskClassification = classification,
                        ScoredAt = DateTime.UtcNow
                    };
                    riskScores.Add(risk);
                }
                
                context.VendorRiskScores.AddRange(riskScores);
                context.SaveChanges();

                // 4. Optionally seed some default TenantUsers for a few vendors so they can "login"
                var users = new List<TenantUser>();
                foreach (var v in vendorsToInsert.Take(10)) // Just create users for the first 10 to save time
                {
                    users.Add(new TenantUser
                    {
                        TenantID = v.TenantID,
                        Email = $"admin@{v.CompanyName.Replace(" ", "").Replace(".", "").ToLower()}.com",
                        PasswordHash = "hashed_placeholder", // Since they won't actually login with this seed unless you use Auth logic
                        FullName = "Vendor Admin",
                        Position = "Account Manager",
                        IsActive = true,
                        OnboardingComplete = true,
                        CreatedAt = DateTime.UtcNow
                    });
                }
                
                context.TenantUsers.AddRange(users);
                context.SaveChanges();
            }
        }
    }
}

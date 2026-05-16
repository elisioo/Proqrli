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
            var random = new Random();
            SeedSubscriptionPlans(context);

            bool hasVendors = context.Tenants.Any(t => t.TenantType == "Vendor");

            // ── Phase 1: Vendor base data (only once) ───────────────────────
            if (!hasVendors)
            {
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

            // ── Phase 2: Marketplace data (runs independently) ───────────────
            if (!context.ProductCategories.Any())
            {
                var productCategories = new List<ProductCategory>
                {
                    new() { CategoryName = "Bearings", Description = "Ball, roller, and sleeve bearings" },
                    new() { CategoryName = "Hydraulics", Description = "Pumps, cylinders, valves, hoses" },
                    new() { CategoryName = "Chemicals", Description = "Industrial solvents, lubricants, adhesives" },
                    new() { CategoryName = "Fasteners", Description = "Bolts, nuts, washers, screws, rivets" },
                    new() { CategoryName = "Pneumatics", Description = "Compressors, actuators, fittings" },
                    new() { CategoryName = "Electrical", Description = "Cables, switches, motors, PLCs" },
                    new() { CategoryName = "Tools", Description = "Hand tools, power tools, measuring instruments" },
                };
                context.ProductCategories.AddRange(productCategories);
                context.SaveChanges();
            }

            if (!context.ProductListings.Any())
            {
                var existingVendors = context.Tenants.Where(t => t.TenantType == "Vendor").ToList();
                var existingCategories = context.ProductCategories.ToList();
                if (existingVendors.Any() && existingCategories.Any())
                {
                    var productNames = new[] {
                        "Deep Groove Ball Bearing", "Angular Contact Bearing", "Cylindrical Roller Bearing",
                        "Hydraulic Gear Pump", "Hydraulic Cylinder 100mm", "Directional Control Valve",
                        "Industrial Degreaser 5L", "Synthetic Hydraulic Oil 20L", "Threadlocker Adhesive 50ml",
                        "Hex Bolt M12×50 (Grade 8.8)", "Stainless Steel Nylock Nut M12", "Flat Washer DIN 125 M12",
                        "Pneumatic Cylinder 32mm Bore", "Solenoid Valve 5/2 Way", "PU Air Hose 8mm×10m",
                        "VFD 3-Phase 5.5kW", "Limit Switch Metal Body", "Stepper Motor NEMA 23",
                        "Digital Caliper 150mm", "Cordless Impact Driver 18V", "Torque Wrench 1/2\" 20-100Nm"
                    };
                    var productUoms = new[] { "pc", "pc", "pc", "pc", "pc", "pc", "pail", "pail", "tube", "kg", "pc", "pc", "pc", "pc", "roll", "pc", "pc", "pc", "pc", "pc", "pc" };

                    var productListings = new List<ProductListing>();
                    for (int i = 0; i < productNames.Length; i++)
                    {
                        var vendor = existingVendors[random.Next(existingVendors.Count)];
                        var category = existingCategories[i % existingCategories.Count];
                        productListings.Add(new ProductListing
                        {
                            VendorTenantID = vendor.TenantID,
                            CategoryID = category.CategoryID,
                            ProductName = productNames[i],
                            SKU = $"SKU-{1000 + i:D4}",
                            Description = $"High-quality {productNames[i].ToLower()} from {vendor.CompanyName}.",
                            BasePrice = (decimal)(random.Next(50, 5000) + random.NextDouble()),
                            UnitOfMeasure = productUoms[i],
                            MinOrderQty = random.Next(1, 10),
                            StockQuantity = random.Next(0, 500),
                            Status = "Active",
                            AverageRating = (decimal)(3.0 + random.NextDouble() * 2.0),
                            TotalSold = random.Next(0, 1000),
                        });
                    }
                    context.ProductListings.AddRange(productListings);
                    context.SaveChanges();

                    var productImages = productListings.Select(p => new ProductImage
                    {
                        ProductID = p.ProductID,
                        ImagePath = $"/assets/products/{p.SKU.ToLower()}.png",
                        IsPrimary = true,
                        SortOrder = 1,
                    }).ToList();
                    context.ProductImages.AddRange(productImages);
                    context.SaveChanges();
                }
            }

            if (!context.VendorStoreProfiles.Any())
            {
                var existingVendors = context.Tenants.Where(t => t.TenantType == "Vendor").Take(20).ToList();
                var existingCategories = context.ProductCategories.ToList();
                if (existingVendors.Any())
                {
                    var storeProfiles = existingVendors.Select((v, i) => new VendorStoreProfile
                    {
                        VendorTenantID = v.TenantID,
                        StoreName = v.CompanyName,
                        StoreSlug = v.CompanyName.Replace(" ", "-").Replace(".", "").ToLower(),
                        StoreDescription = $"Authorized supplier of {existingCategories[i % existingCategories.Count].CategoryName}.",
                        OverallRating = (decimal)(3.5 + random.NextDouble() * 1.5),
                        IsVerified = true,
                        IsActive = true,
                    }).ToList();
                    context.VendorStoreProfiles.AddRange(storeProfiles);
                    context.SaveChanges();
                }
            }
        }

        private static void SeedSubscriptionPlans(ApplicationDbContext context)
        {
            if (context.SubscriptionPlans.Any()) return;

            context.SubscriptionPlans.AddRange(
                new SubscriptionPlan
                {
                    PlanName = "Starter",
                    ApplicableTo = "BUYER",
                    Price = 0,
                    MaxUsers = 5,
                    Features = "[\"Up to 5 users\",\"PR/PO workflow\",\"Basic analytics\"]"
                },
                new SubscriptionPlan
                {
                    PlanName = "Procurement Pro",
                    ApplicableTo = "BUYER",
                    Price = 7900,
                    MaxUsers = -1,
                    Features = "[\"Unlimited users\",\"ML risk scoring\",\"Real-time dashboards\",\"PayMongo payments\"]"
                },
                new SubscriptionPlan
                {
                    PlanName = "Enterprise",
                    ApplicableTo = "BUYER",
                    Price = 0,
                    MaxUsers = -1,
                    Features = "[\"SAP / ERP integration\",\"Account manager\",\"Custom deployment\"]"
                },
                new SubscriptionPlan
                {
                    PlanName = "Free",
                    ApplicableTo = "VENDOR",
                    Price = 0,
                    MaxUsers = 1,
                    Features = "[\"Storefront\",\"Up to 25 listings\",\"Basic metrics\"]"
                },
                new SubscriptionPlan
                {
                    PlanName = "Seller Pro",
                    ApplicableTo = "VENDOR",
                    Price = 4900,
                    MaxUsers = -1,
                    Features = "[\"Unlimited listings\",\"Analytics\",\"Featured placement\",\"Priority support\"]"
                },
                new SubscriptionPlan
                {
                    PlanName = "Enterprise",
                    ApplicableTo = "VENDOR",
                    Price = 0,
                    MaxUsers = -1,
                    Features = "[\"Bulk import / API\",\"ERP integration\",\"Account manager\"]"
                }
            );
            context.SaveChanges();
        }
    }
}

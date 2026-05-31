# ProqrLi

ProqrLi is a procurement management web application built for buyer and vendor teams that need one place to manage sourcing, marketplace activity, purchase workflows, compliance, payments, and operational visibility.

The application combines an ASP.NET Core API with a React dashboard experience. It includes role-based workspaces for buyers, vendors, and platform administrators, plus seeded demo data so the main procurement flows can be reviewed quickly in a local environment.

## Features

- Buyer workspace for requisitions, RFQs, quotations, purchase orders, receipts, inventory, payments, vendor management, risk monitoring, analytics, team access, and settings.
- Vendor workspace for product listings, RFQ responses, purchase orders, deliveries, invoices, buyer relationships, storefront management, compliance, reviews, payouts, and team access.
- Admin workspace for tenant oversight, module access, users, vendors, audit logs, system status, and platform settings.
- Marketplace and storefront flows that connect buyers with accredited vendors and published product listings.
- Authentication, onboarding, cookie-based sessions, and role-aware routing for separate user experiences.
- Database migrations and seed data for demo accounts, vendors, product categories, product listings, subscription plans, and vendor risk scores.
- External service integration points for Cloudinary uploads, SendGrid email, PayMongo payments, and Stripe checkout.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Backend | ASP.NET Core, C# |
| API | ASP.NET Core Controllers, Razor fallback for SPA routing |
| Database | SQL Server LocalDB, Entity Framework Core |
| Authentication | Cookie authentication, ASP.NET Core Identity packages, custom tenant/platform users |
| Frontend | React, TypeScript, Vite, TanStack Router, TanStack Query |
| UI | Tailwind CSS, Radix UI, lucide-react, Recharts |
| Services | Cloudinary, SendGrid, PayMongo, Stripe |

## Project Structure

```text
Proqrli/
+-- Proqrli.slnx
`-- Proqrli/
    +-- Controllers/          # API controllers for auth, admin, settings, payments, and procurement modules
    +-- Data/                 # EF Core DbContext, migrations, and database seeding
    +-- Models/               # Domain models and DTOs
    +-- Services/             # Auth, OTP, uploads, payment, and messaging services
    +-- Views/                # ASP.NET Core MVC shell and SPA fallback
    +-- wwwroot/              # Built frontend assets served by ASP.NET Core
    `-- frontend/             # React + TypeScript source application
```

## How It Works

ProqrLi is organized around three main user experiences:

1. Buyers create purchase requisitions, send RFQs, compare quotations, issue purchase orders, track deliveries, manage invoices and payments, monitor inventory, and evaluate vendor risk.
2. Vendors maintain storefronts and product catalogs, receive buyer RFQs, submit quotations, process orders, manage deliveries and invoices, and track payouts.
3. Admins manage platform-level tenants, users, modules, vendor records, audit logs, and system settings.

The ASP.NET Core backend exposes JSON endpoints for the procurement modules and handles authentication through secure cookies. The React frontend uses TanStack Router for client-side navigation and calls the backend API for live data. Unknown routes fall back to the ASP.NET Core home page so the SPA can handle browser refreshes and deep links.

On startup, the backend applies Entity Framework Core migrations and seeds development data. This creates sample tenants, demo users, subscription plans, marketplace products, store profiles, accreditation links, and risk scores, making the app ready for review after the first run.

## Getting Started

### Prerequisites

- .NET SDK compatible with `net10.0`
- SQL Server LocalDB or another SQL Server instance
- Node.js 20+ and npm

### 1. Clone and Open the Project

```bash
git clone <repository-url>
cd Proqrli
```

If you already have the project locally, open the repository root that contains `Proqrli.slnx`.

### 2. Configure the Backend

The default development connection string uses SQL Server LocalDB:

```json
"DefaultConnection": "Data Source=(localdb)\\MSSQLLocalDB;Initial Catalog=DB_Proqrli;Integrated Security=True"
```

Update `Proqrli/appsettings.json` if you want to use a different SQL Server instance. Replace placeholder keys before using external integrations:

- `Cloudinary`
- `PayMongo`
- `SendGrid`
- `TaxApi`

For local portfolio review, the app can run with placeholder keys as long as you do not use features that require those services.

### 3. Install Frontend Dependencies

```bash
cd Proqrli/frontend
npm install
```

### 4. Build the Frontend

```bash
npm run build
```

The production frontend build is emitted into the ASP.NET Core static asset path and served by the backend.

### 5. Run the Backend

From the ASP.NET Core project folder:

```bash
cd ..
dotnet restore
dotnet run
```

The app will apply database migrations, seed demo data, and start the web server. Open the HTTPS or HTTP URL printed in the terminal.

## Development Workflow

Run the backend:

```bash
cd Proqrli
dotnet run
```

Run the frontend in Vite development mode:

```bash
cd Proqrli/frontend
npm run dev
```

The backend allows Vite development origins for local work:

- `http://localhost:5173`
- `https://localhost:5173`
- `http://localhost:3000`

## Demo Accounts

The application seeds the following accounts during startup:

| Role | Email | Password |
| --- | --- | --- |
| Platform Admin | `admin@procurli.io` | `Admin123!` |
| Buyer | `demo_buyer@procurli.com` | `Password123!` |
| Vendor | `demo_vendor@procurli.com` | `Password123!` |

These accounts are intended for local demonstration only. Change or remove them before deploying the application.

## Useful Commands

```bash
# Restore backend packages
dotnet restore

# Run the ASP.NET Core application
dotnet run

# Install frontend packages
npm install

# Start the Vite dev server
npm run dev

# Build frontend assets
npm run build

# Lint frontend source
npm run lint

# Format frontend source
npm run format
```

## Portfolio Highlights

This project demonstrates:

- Full-stack application architecture using ASP.NET Core and React.
- Multi-tenant procurement workflows for buyer, vendor, and admin roles.
- Entity Framework Core modeling, migrations, relational data seeding, and SQL Server integration.
- API-driven frontend screens with routed dashboards and reusable UI components.
- Practical integration points for payments, email, media uploads, audit logging, and vendor risk analytics.

## Deployment Notes

Build the frontend before publishing the ASP.NET Core app so the latest static assets are included. Configure production connection strings and service keys through environment variables, user secrets, or your hosting provider's secret management system rather than committing real credentials to source control.

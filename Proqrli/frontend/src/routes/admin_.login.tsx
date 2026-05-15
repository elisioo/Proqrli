/* eslint-disable prettier/prettier */
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import * as React from "react";
import { ArrowRight, Eye, EyeOff, AlertCircle, Loader2, ShieldCheck } from "lucide-react";
import { authApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import logo from "@/assets/logos/logo.png";

export const Route = createFileRoute("/admin_/login")({
    component: SuperAdminLoginPage,
});

function SuperAdminLoginPage() {
    return (
        <div className="min-h-screen w-full bg-paper flex items-center justify-center p-4 md:p-8">
            {/* Subtle grid texture */}
            <div
                className="pointer-events-none fixed inset-0"
                style={{
                    backgroundImage:
                        "linear-gradient(rgba(0,0,0,0.035) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.035) 1px,transparent 1px)",
                    backgroundSize: "40px 40px",
                }}
            />

            <div className="relative z-10 w-full max-w-[440px]">
                {/* Card */}
                <div className="overflow-hidden rounded-[28px] border border-border bg-card shadow-[0_30px_80px_-30px_rgba(0,0,0,0.18)]">
                    {/* Top accent bar */}
                    <div className="h-1 w-full bg-foreground" />

                    <div className="px-8 pb-10 pt-8 md:px-10">
                        {/* Brand + Shield */}
                        <div className="flex items-center justify-between">
                            <img src={logo} alt="ProcurLi Logo" className="w-[90px]" />
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-paper px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                                <ShieldCheck className="h-3 w-3" />
                                Super Admin
                            </span>
                        </div>

                        {/* Heading */}
                        <h1 className="mt-8 font-display text-[36px] font-extrabold leading-[1.05] tracking-tight md:text-[42px]">
                            Admin <br />access.
                        </h1>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Restricted to authorised personnel only.
                        </p>

                        <AdminLoginForm />
                    </div>
                </div>

                {/* Footer */}
                <p className="mt-5 text-center font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    ProcurLi · Admin console · Confidential
                </p>
            </div>
        </div>
    );
}

// ─── Admin login form ─────────────────────────────────────────────────────────

function AdminLoginForm() {
    const navigate = useNavigate();

    const [email, setEmail]       = React.useState("");
    const [password, setPassword] = React.useState("");
    const [showPw, setShowPw]     = React.useState(false);
    const [loading, setLoading]   = React.useState(false);
    const [error, setError]       = React.useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const user = await authApi.login({ email: email.trim().toLowerCase(), password });
            // Expect the backend to return a superadmin role; redirect accordingly
            if (user.role !== "superadmin" && user.role !== "super_admin") {
                setError("Access denied. This portal is for super admins only.");
                return;
            }
            navigate({ to: "/admin" }); // updated from /superadmin
        } catch (err) {
            setError(err instanceof Error ? err.message : "Login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mt-8 space-y-4">
            {/* Error banner */}
            {error && (
                <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
                {/* Email */}
                <div>
                    <label className="mb-1.5 block text-xs font-semibold text-foreground">
                        Admin email
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setError(null); }}
                        placeholder="admin@procurli.com"
                        required
                        autoComplete="username"
                        className="h-12 w-full rounded-full border border-border bg-card px-5 text-sm outline-none transition-colors focus:border-foreground"
                    />
                </div>

                {/* Password */}
                <div>
                    <label className="mb-1.5 block text-xs font-semibold text-foreground">
                        Password
                    </label>
                    <div className="relative">
                        <input
                            type={showPw ? "text" : "password"}
                            value={password}
                            onChange={(e) => { setPassword(e.target.value); setError(null); }}
                            placeholder="Enter your password"
                            required
                            autoComplete="current-password"
                            className="h-12 w-full rounded-full border border-border bg-card px-5 pr-12 text-sm outline-none transition-colors focus:border-foreground"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPw((v) => !v)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={loading}
                    className={cn(
                        "inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground text-sm font-semibold text-background transition-opacity hover:opacity-85 disabled:opacity-60",
                    )}
                >
                    {loading ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Signing in…
                        </>
                    ) : (
                        <>
                            Sign in to admin console
                            <ArrowRight className="h-4 w-4" />
                        </>
                    )}
                </button>
            </form>

            {/* Divider note — no registration link */}
            <p className="pt-1 text-center font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Access is by invitation only
            </p>
        </div>
    );
}
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { BuyerProvider } from "@/lib/buyer-context";
import { BuyerSidebar } from "@/components/buyer/BuyerSidebar";
import { BuyerTopbar } from "@/components/buyer/BuyerTopbar";

export const Route = createFileRoute("/buyer")({
  // ── Auth guard ─────────────────────────────────────────────────────────────
  // If neither a real session nor a mock demo session exists, redirect to /login.
  beforeLoad: () => {
    if (typeof window === "undefined") return; // SSR safety

    const hasReal = !!window.localStorage.getItem("procurli:buyer:realUser");
    const hasMock = !!window.localStorage.getItem("procurli:buyer:userId");

    if (!hasReal && !hasMock) {
      throw redirect({ to: "/login" });
    }
  },
  component: BuyerLayout,
});

function BuyerLayout() {
  return (
    <BuyerProvider>
      <div className="flex min-h-screen w-full bg-paper text-foreground">
        <div className="hidden w-[260px] flex-shrink-0 md:block">
          <div className="fixed inset-y-0 w-[260px]">
            <BuyerSidebar />
          </div>
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <BuyerTopbar />
          <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
            <Outlet />
          </main>
        </div>
      </div>
    </BuyerProvider>
  );
}

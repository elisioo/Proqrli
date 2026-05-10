import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { BuyerProvider } from "@/lib/buyer-context";
import { BuyerSidebar } from "@/components/buyer/BuyerSidebar";
import { BuyerTopbar } from "@/components/buyer/BuyerTopbar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export const Route = createFileRoute("/buyer")({

  beforeLoad: async () => {
    if (typeof window === "undefined") return; // SSR safety

    try {

      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (!res.ok) {

        throw redirect({ to: "/login" });
      }

      const user = await res.json();
      window.localStorage.setItem("procurli:buyer:realUser", JSON.stringify(user));
    } catch (err: unknown) {

      if (err && typeof err === "object" && "isRedirect" in err) throw err;

      throw redirect({ to: "/login" });
    }
  },
  component: BuyerLayout,
});

function BuyerLayout() {
  return (
    <BuyerProvider>
      <SidebarProvider>
        <BuyerSidebar />
        <SidebarInset>
          <BuyerTopbar />
          <main className="flex-1 px-4 py-6 md:px-8 md:py-8 bg-paper">
            <Outlet />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </BuyerProvider>
  );
}

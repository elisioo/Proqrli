import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { VendorProvider } from "@/lib/vendor-context";
import { VendorSidebar } from "@/components/vendor/VendorSidebar";
import { VendorTopbar } from "@/components/vendor/VendorTopbar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export const Route = createFileRoute("/vendor")({
  beforeLoad: async () => {
    if (typeof window === "undefined") return;

    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (!res.ok) {
        throw redirect({ to: "/login" });
      }

      const user = await res.json();
      window.localStorage.setItem("procurli:vendor:realUser", JSON.stringify(user));
    } catch (err: unknown) {
      if (err && typeof err === "object" && "isRedirect" in err) throw err;
      throw redirect({ to: "/login" });
    }
  },
  component: VendorLayout,
});

function VendorLayout() {
  return (
    <VendorProvider>
      <SidebarProvider>
        <VendorSidebar />
        <SidebarInset>
          <VendorTopbar />
          <main className="flex-1 px-4 py-6 md:px-8 md:py-8 bg-paper">
            <Outlet />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </VendorProvider>
  );
}

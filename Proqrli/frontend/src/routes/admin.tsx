import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";

export const Route = createFileRoute("/admin")({
  // Intentionally hidden — there is no public link to /admin anywhere.
  // Robots are told to ignore it; humans must type the URL.
  head: () => ({
    meta: [
      { title: "ProcurLi · Platform Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <div className="flex min-h-screen w-full bg-paper text-foreground">
      <div className="hidden w-[260px] flex-shrink-0 md:block">
        <div className="fixed inset-y-0 w-[260px]">
          <AdminSidebar />
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar />
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

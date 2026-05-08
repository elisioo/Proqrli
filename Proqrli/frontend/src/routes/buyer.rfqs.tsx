import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/buyer/rfqs")({
    component: RfqLayout,
});

function RfqLayout() {
    //   /buyer/rfqs        → rfqs.index.tsx  (the list)
    //   /buyer/rfqs/$rfqId → rfqs.$rfqId.tsx (the detail)
    return <Outlet />;
}
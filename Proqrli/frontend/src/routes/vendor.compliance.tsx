import { createFileRoute } from "@tanstack/react-router";
import { Upload, FileText } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { AutoStatus } from "@/components/StatusPill";
import { PermissionGate } from "@/components/PermissionGate";
import { useVendor } from "@/lib/vendor-context";
import { COMPLIANCE_DOCS } from "@/lib/mock-data";
import { CloudinaryUploadWidget } from "@/components/CloudinaryUploadWidget";

export const Route = createFileRoute("/vendor/compliance")({
  component: () => (
    <PermissionGate permission="compliance:view">
      <CompliancePage />
    </PermissionGate>
  ),
});

function CompliancePage() {
  const { hasPermission } = useVendor();

  const handleUploadSuccess = (url: string) => {
      console.log("Document uploaded:", url);
      alert("Document uploaded successfully! URL: " + url);
      // In a real app, you would send this URL + metadata to your backend.
  };

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader
        eyebrow="Compliance"
        title="Documents & certifications"
        description="Permits, ISO certs, and BIR / DTI registration. Verified vendors get the Certified Badge."
        actions={
          hasPermission("compliance:upload") && (
            <CloudinaryUploadWidget
                preset="proqrli_vendor_docs"
                onUpload={handleUploadSuccess}
                label={
                    <span className="flex items-center gap-2">
                        <Upload className="h-4 w-4" /> Upload document
                    </span>
                }
                className="inline-flex h-10 items-center gap-2 rounded-sm bg-foreground px-4 text-sm font-medium text-background hover:opacity-85"
            />
          )
        }
      />
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {COMPLIANCE_DOCS.map((d) => (
          <div key={d.id} className="flex items-start gap-4 rounded-md border border-border bg-card p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-muted">
              <FileText className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <div className="font-display text-base font-extrabold">{d.type}</div>
                <AutoStatus status={d.status} />
              </div>
              <div className="truncate font-mono text-[11px] text-muted-foreground">{d.fileName}</div>
              <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
                <span>Uploaded {d.uploadedAt}</span>
                {d.expiresAt && <span>· Expires {d.expiresAt}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

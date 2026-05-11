import * as React from "react";

interface CloudinaryUploadWidgetProps {
  preset: string;
  folder?: string;
  onUpload: (url: string) => void;
  label?: React.ReactNode;
  className?: string;
}

export function CloudinaryUploadWidget({ preset, folder, onUpload, label = "Upload Asset", className }: CloudinaryUploadWidgetProps) {
  const cloudinaryRef = React.useRef<any>();
  const widgetRef = React.useRef<any>();

  React.useEffect(() => {
    cloudinaryRef.current = (window as any).cloudinary;
    if (!cloudinaryRef.current) {
        console.error("Cloudinary script not loaded. Make sure the <script> tag is in index.html");
        return;
    }
    
    widgetRef.current = cloudinaryRef.current.createUploadWidget({
        cloudName: "dnvcbxofk", // Using your Cloudinary Cloud Name
        uploadPreset: preset,
        folder: folder,
        multiple: false
    }, function(error: any, result: any) {
        if (!error && result && result.event === "success") {
            onUpload(result.info.secure_url);
        }
    });
  }, [preset, folder, onUpload]);

  return (
    <button 
        type="button" 
        onClick={() => widgetRef.current?.open()} 
        className={className || "inline-flex h-10 items-center rounded-sm border border-border bg-card px-4 text-sm font-medium hover:bg-muted"}
    >
        {label}
    </button>
  );
}

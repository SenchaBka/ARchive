import { PostData } from "./types";

interface StepPreviewProps {
  data: PostData;
}

export function StepPreview({ data }: StepPreviewProps) {
  const items = [
    { label: "Title", value: data.title || "—" },
    { label: "Description", value: data.description || "—" },
    {
      label: "Location",
      value:
        data.latitude && data.longitude
          ? `${data.latitude.toFixed(4)}, ${data.longitude.toFixed(4)}`
          : data.address || "—",
    },
    { label: "Unlock Radius", value: `${data.radius}m` },
    { label: "Media", value: data.media?.name || "None" },
    { label: "Audio", value: data.audio?.name || "None" },
    { label: "Audio URL", value: data.audioUrl || "None" },
  ];

  return (
    <div className="space-y-1">
      {items.map((item, index) => (
        <div
          key={item.label}
          className={`flex items-start justify-between py-4 ${
            index !== items.length - 1 ? "border-b border-border" : ""
          }`}
        >
          <span className="text-sm text-muted-foreground">{item.label}</span>
          <span className="text-sm font-medium text-foreground text-right max-w-[60%] truncate">
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}

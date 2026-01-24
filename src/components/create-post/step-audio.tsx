"use client";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Mic, X } from "lucide-react";
import { useFileUpload } from "@/hooks/use-file-upload";
import { PostData } from "./types";

interface StepAudioProps {
  data: PostData;
  setData: React.Dispatch<React.SetStateAction<PostData>>;
}

export function StepAudio({ data, setData }: StepAudioProps) {
  const { uploadAudio, isUploading, error } = useFileUpload();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;

    // Store the file
    setData({ ...data, audio: file, audioUrl: null });

    // Automatically upload to cloud storage
    const result = await uploadAudio(file);
    if (result) {
      setData({ ...data, audio: file, audioUrl: result.url });
    }
  };

  const handleRemove = () => {
    setData({ ...data, audio: null, audioUrl: null });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          Upload Audio
          <span className="ml-1 text-muted-foreground font-normal">(optional)</span>
        </Label>
        <div
          className={`relative rounded-lg border-2 border-dashed border-border 
          bg-[#fafafa] p-12 text-center transition-colors
          hover:border-muted-foreground/50 hover:bg-[#f5f5f5]
          ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            disabled={isUploading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            id="audio-upload"
          />
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white border border-border">
              <Mic className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {isUploading ? "Uploading..." : "Drop audio file or click to upload"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                MP3, WAV, M4A up to 25MB
              </p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {data.audio && (
        <div className="flex items-center justify-between rounded-lg bg-[#fafafa] p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white border border-border">
              <Mic className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium truncate max-w-[200px]">
                {data.audio.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {(data.audio.size / 1024 / 1024).toFixed(2)} MB
                {data.audioUrl && (
                  <span className="ml-2 text-green-600">✓ Uploaded</span>
                )}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            disabled={isUploading}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {data.audioUrl && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-3">
          <p className="text-xs text-green-700">
            Audio uploaded successfully! URL: <span className="font-mono text-[10px] break-all">{data.audioUrl}</span>
          </p>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Recording feature coming soon
      </p>
    </div>
  );
}

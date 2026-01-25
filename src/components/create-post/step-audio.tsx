"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mic, X } from "lucide-react";
import { useFileUpload } from "@/hooks/use-file-upload";
import { PostData } from "./types";

interface StepAudioProps {
  data: PostData;
  setData: React.Dispatch<React.SetStateAction<PostData>>;
}

// Voice options with their IDs and descriptions
const VOICE_OPTIONS = [
  { id: "d", name: "Default", description: "Current voice from settings" },
  {
    id: "wloRHjPaKZv3ucH7TQOT",
    name: "Jorin",
    description: "Captivating and Soft",
  },
  { id: "xXFOA11TH5EKg661vj6I", name: "The Englishman Alex", description: "" },
  {
    id: "zO2z8i0srbO9r7GT5C4h",
    name: "Chris",
    description: "Meditation and ASMR",
  },
  { id: "tQ4MEZFJOzsahSEEZtHK", name: "Ivanna", description: "Intimate" },
];

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
      {/* Voice Selection for TTS */}
      <div className="space-y-2">
        <Label
          className="text-sm font-medium"
          style={{ color: "rgba(255,255,255,0.9)" }}
        >
          Voice for Text-to-Speech
          <span
            className="ml-1 font-normal"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            (optional)
          </span>
        </Label>
        <Select
          value={data.voiceId || "d"}
          onValueChange={(value: string) => {
            setData({ ...data, voiceId: value === "d" ? null : value });
          }}
        >
          <SelectTrigger
            className="w-full"
            style={{
              backgroundColor: "rgba(255,255,255,0.03)",
              borderColor: "rgba(255,255,255,0.15)",
              color: "rgba(255,255,255,0.9)",
            }}
          >
            <SelectValue placeholder="Select a voice" />
          </SelectTrigger>
          <SelectContent
            style={{
              backgroundColor: "rgba(0,0,0,0.95)",
              borderColor: "rgba(255,255,255,0.15)",
            }}
          >
            {VOICE_OPTIONS.map((voice) => (
              <SelectItem
                key={voice.id}
                value={voice.id}
                style={{
                  color: "rgba(255,255,255,0.9)",
                }}
              >
                <div className="flex flex-row items-center gap-2">
                  <span className="font-medium">{voice.name}</span>
                  {voice.description && (
                    <>
                      <span
                        className="text-xs"
                        style={{ color: "rgba(255,255,255,0.5)" }}
                      >
                        •
                      </span>
                      <span
                        className="text-xs"
                        style={{ color: "rgba(255,255,255,0.5)" }}
                      >
                        {voice.description}
                      </span>
                    </>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
          This voice will be used when generating audio from your post
          description
        </p>
      </div>

      <div className="space-y-2">
        <Label
          className="text-sm font-medium"
          style={{ color: "rgba(255,255,255,0.9)" }}
        >
          Upload Audio
          <span
            className="ml-1 font-normal"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            (optional)
          </span>
        </Label>
        <div
          className={`relative rounded-lg p-12 text-center transition-all duration-200 ${isUploading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          style={{
            backgroundColor: "rgba(255,255,255,0.03)",
            border: "2px dashed rgba(255,255,255,0.15)",
          }}
          onMouseEnter={(e) => {
            if (!isUploading) {
              e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.03)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
          }}
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
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full transition-colors duration-200"
              style={{
                backgroundColor: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <Mic
                className="h-5 w-5"
                style={{ color: "rgba(255,255,255,0.6)" }}
              />
            </div>
            <div>
              <p
                className="text-sm font-medium"
                style={{ color: "rgba(255,255,255,0.9)" }}
              >
                {isUploading
                  ? "Uploading..."
                  : "Drop audio file or click to upload"}
              </p>
              <p
                className="mt-1 text-xs"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                MP3, WAV, M4A up to 25MB
              </p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div
          className="rounded-lg p-3"
          style={{
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
          }}
        >
          <p className="text-sm" style={{ color: "#f87171" }}>
            {error}
          </p>
        </div>
      )}

      {data.audio && (
        <div
          className="flex items-center justify-between rounded-lg p-4"
          style={{
            backgroundColor: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg"
              style={{
                backgroundColor: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <Mic
                className="h-4 w-4"
                style={{ color: "rgba(255,255,255,0.6)" }}
              />
            </div>
            <div>
              <p
                className="text-sm font-medium truncate max-w-[200px]"
                style={{ color: "#fafafa" }}
              >
                {data.audio.name}
              </p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                {(data.audio.size / 1024 / 1024).toFixed(2)} MB
                {data.audioUrl && (
                  <span className="ml-2" style={{ color: "#4ade80" }}>
                    ✓ Uploaded
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={handleRemove}
            disabled={isUploading}
            className="p-2 rounded-lg transition-colors duration-200"
            style={{
              color: "rgba(255,255,255,0.5)",
              cursor: isUploading ? "not-allowed" : "pointer",
            }}
            onMouseEnter={(e) => {
              if (!isUploading) {
                e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)";
                e.currentTarget.style.color = "#fafafa";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "rgba(255,255,255,0.5)";
            }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {data.audioUrl && (
        <div
          className="rounded-lg p-3"
          style={{
            backgroundColor: "rgba(34, 197, 94, 0.1)",
            border: "1px solid rgba(34, 197, 94, 0.3)",
          }}
        >
          <p className="text-xs" style={{ color: "#4ade80" }}>
            Audio uploaded successfully!
          </p>
        </div>
      )}

      <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
        Recording feature coming soon
      </p>
    </div>
  );
}

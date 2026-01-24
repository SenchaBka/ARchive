"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  MapPin,
  ImageIcon,
  Mic,
  Eye,
  Type,
  Check,
  ArrowLeft,
  ArrowRight,
  Upload,
  X,
  Loader2,
} from "lucide-react";

const STEPS = [
  { id: 1, title: "Title", description: "Name your post", icon: Type },
  { id: 2, title: "Location", description: "Set the location", icon: MapPin },
  { id: 3, title: "Media", description: "Add visuals", icon: ImageIcon },
  { id: 4, title: "Audio", description: "Add audio", icon: Mic },
  { id: 5, title: "Preview", description: "Review & publish", icon: Eye },
];

interface PostData {
  title: string;
  description: string;
  latitude: number | null;
  longitude: number | null;
  address: string;
  media: File | null;
  audio: File | null;
  radius: number;
}

export default function CreatePostPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PostData>({
    title: "",
    description: "",
    latitude: null,
    longitude: null,
    address: "",
    media: null,
    audio: null,
    radius: 100,
  });

  const nextStep = () => setStep((s) => Math.min(s + 1, STEPS.length));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  // Function to upload a file and get the URL
  const uploadFile = async (file: File, type: "media" | "audio"): Promise<string | null> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    const response = await fetch("/api/upload/media", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload ${type}`);
    }

    const result = await response.json();
    return result.url;
  };

  // Function to determine media type from file
  const getMediaType = (file: File): "image" | "gif" | "model" => {
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (extension === "gif") return "gif";
    if (["glb", "gltf", "obj"].includes(extension || "")) return "model";
    return "image";
  };

  // Main submit function
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Step 1: Upload media file if exists
      let mediaUrl: string | null = null;
      let mediaType: string | null = null;
      
      if (data.media) {
        mediaUrl = await uploadFile(data.media, "media");
        mediaType = getMediaType(data.media);
      }

      // Step 2: Upload audio file if exists
      let audioUrl: string | null = null;
      
      if (data.audio) {
        audioUrl = await uploadFile(data.audio, "audio");
      }

      // Step 3: Create the post
      const response = await fetch("/api/posts/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          latitude: data.latitude,
          longitude: data.longitude,
          address: data.address,
          radius: data.radius,
          mediaUrl: mediaUrl,
          mediaType: mediaType,
          audioUrl: audioUrl,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create post");
      }

      // Success! Redirect to posts page
      console.log("Post created:", result);
      router.push("/posts");

    } catch (err) {
      console.error("Error creating post:", err);
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    if (step === 1) return data.title.trim().length > 0;
    if (step === 2) return data.latitude !== null || data.address.trim().length > 0;
    return true;
  };

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="mx-auto max-w-2xl px-4 py-12 md:py-20">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Create a Post
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Share your location-based content
          </p>
        </div>

        {/* Step Indicator */}
        <div className="mb-10">
          <div className="flex items-center justify-between">
            {STEPS.map((s, index) => {
              const StepIcon = s.icon;
              const isCompleted = step > s.id;
              const isCurrent = step === s.id;

              return (
                <div key={s.id} className="flex items-center flex-1 last:flex-none">
                  {/* Step Circle */}
                  <button
                    onClick={() => s.id < step && setStep(s.id)}
                    disabled={s.id > step}
                    className={`
                      relative flex h-10 w-10 items-center justify-center rounded-full
                      transition-all duration-200 ease-out
                      ${
                        isCompleted
                          ? "bg-foreground text-background"
                          : isCurrent
                          ? "bg-foreground text-background ring-4 ring-foreground/10"
                          : "bg-white text-muted-foreground border border-border"
                      }
                      ${s.id < step ? "cursor-pointer hover:ring-4 hover:ring-foreground/5" : ""}
                      ${s.id > step ? "cursor-not-allowed" : ""}
                    `}
                  >
                    {isCompleted ? (
                      <Check className="h-4 w-4" strokeWidth={2.5} />
                    ) : (
                      <StepIcon className="h-4 w-4" />
                    )}
                  </button>

                  {/* Connector Line */}
                  {index < STEPS.length - 1 && (
                    <div className="flex-1 mx-3">
                      <div
                        className={`h-[2px] rounded-full transition-colors duration-300 ${
                          step > s.id ? "bg-foreground" : "bg-border"
                        }`}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Step Labels */}
          <div className="mt-4 flex items-start justify-between">
            {STEPS.map((s) => (
              <div
                key={s.id}
                className={`text-center ${
                  s.id === 1 ? "text-left" : s.id === STEPS.length ? "text-right" : ""
                }`}
                style={{ width: s.id === 1 || s.id === STEPS.length ? "40px" : "auto", flex: s.id === 1 || s.id === STEPS.length ? "none" : "1" }}
              >
                <p
                  className={`text-xs font-medium transition-colors ${
                    step >= s.id ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {s.title}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Content Card */}
        <Card className="border border-border bg-white shadow-sm">
          <CardContent className="p-8">
            {/* Step Header */}
            <div className="mb-8">
              <h2 className="text-lg font-medium text-foreground">
                {STEPS[step - 1].title}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {STEPS[step - 1].description}
              </p>
            </div>

            {/* Step Content */}
            <div className="min-h-[280px]">
              {step === 1 && <StepTitle data={data} setData={setData} />}
              {step === 2 && <StepLocation data={data} setData={setData} />}
              {step === 3 && <StepMedia data={data} setData={setData} />}
              {step === 4 && <StepAudio data={data} setData={setData} />}
              {step === 5 && <StepPreview data={data} />}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={prevStep}
            disabled={step === 1 || isSubmitting}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          {step < STEPS.length ? (
            <Button
              onClick={nextStep}
              disabled={!canProceed()}
              className="gap-2 bg-foreground text-background hover:bg-foreground/90"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="gap-2 bg-foreground text-background hover:bg-foreground/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  Publish Post
                  <Check className="h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Step Counter */}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Step {step} of {STEPS.length}
        </p>
      </div>
    </div>
  );
}

function StepTitle({
  data,
  setData,
}: {
  data: PostData;
  setData: React.Dispatch<React.SetStateAction<PostData>>;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title" className="text-sm font-medium">
          Title
        </Label>
        <Input
          id="title"
          placeholder="Give your post a title"
          value={data.title}
          onChange={(e) => setData({ ...data, title: e.target.value })}
          className="h-11 bg-[#fafafa] border-border focus:bg-white transition-colors"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium">
          Description
          <span className="ml-1 text-muted-foreground font-normal">(optional)</span>
        </Label>
        <Textarea
          id="description"
          placeholder="What's this post about?"
          value={data.description}
          onChange={(e) => setData({ ...data, description: e.target.value })}
          rows={4}
          className="bg-[#fafafa] border-border focus:bg-white transition-colors resize-none"
        />
      </div>
    </div>
  );
}

function StepLocation({
  data,
  setData,
}: {
  data: PostData;
  setData: React.Dispatch<React.SetStateAction<PostData>>;
}) {
  const [isLocating, setIsLocating] = useState(false);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setData({
            ...data,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setIsLocating(false);
        },
        (error) => {
          console.error("Location error:", error);
          setIsLocating(false);
        }
      );
    }
  };

  return (
    <div className="space-y-6">
      <Button
        variant="outline"
        onClick={getCurrentLocation}
        disabled={isLocating}
        className="w-full h-11 gap-2 border-border hover:bg-[#fafafa]"
      >
        <MapPin className="h-4 w-4" />
        {isLocating ? "Getting location..." : "Use Current Location"}
      </Button>

      {data.latitude && data.longitude && (
        <div className="rounded-lg bg-[#fafafa] p-4 border border-border">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Coordinates
              </p>
              <p className="mt-1 font-mono text-sm">
                {data.latitude.toFixed(6)}, {data.longitude.toFixed(6)}
              </p>
            </div>
            <button
              onClick={() => setData({ ...data, latitude: null, longitude: null })}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-muted-foreground">or</span>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address" className="text-sm font-medium">
          Enter an address
        </Label>
        <Input
          id="address"
          placeholder="123 Main St, City, Country"
          value={data.address}
          onChange={(e) => setData({ ...data, address: e.target.value })}
          className="h-11 bg-[#fafafa] border-border focus:bg-white transition-colors"
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="radius" className="text-sm font-medium">
            Unlock Radius
          </Label>
          <span className="text-sm font-medium tabular-nums">{data.radius}m</span>
        </div>
        <div className="relative">
          <input
            id="radius"
            type="range"
            min={10}
            max={500}
            step={10}
            value={data.radius}
            onChange={(e) => setData({ ...data, radius: Number(e.target.value) })}
            className="slider-input w-full"
          />
          <div 
            className="pointer-events-none absolute top-1/2 left-0 h-2 -translate-y-1/2 rounded-full bg-foreground"
            style={{ width: `${((data.radius - 10) / (500 - 10)) * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>10m</span>
          <span>500m</span>
        </div>
      </div>
    </div>
  );
}

function StepMedia({
  data,
  setData,
}: {
  data: PostData;
  setData: React.Dispatch<React.SetStateAction<PostData>>;
}) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setData({ ...data, media: file });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          Upload Image or Video
          <span className="ml-1 text-muted-foreground font-normal">(optional)</span>
        </Label>
        <div
          className="relative rounded-lg border-2 border-dashed border-border 
          bg-[#fafafa] p-12 text-center transition-colors
          hover:border-muted-foreground/50 hover:bg-[#f5f5f5]"
        >
          <input
            type="file"
            accept="image/*,video/*"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            id="media-upload"
          />
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white border border-border">
              <Upload className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                Drop files here or click to upload
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                PNG, JPG, GIF, MP4 up to 50MB
              </p>
            </div>
          </div>
        </div>
      </div>

      {data.media && (
        <div className="flex items-center justify-between rounded-lg bg-[#fafafa] p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white border border-border">
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium truncate max-w-[200px]">
                {data.media.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {(data.media.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setData({ ...data, media: null })}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

function StepAudio({
  data,
  setData,
}: {
  data: PostData;
  setData: React.Dispatch<React.SetStateAction<PostData>>;
}) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setData({ ...data, audio: file });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          Upload Audio
          <span className="ml-1 text-muted-foreground font-normal">(optional)</span>
        </Label>
        <div
          className="relative rounded-lg border-2 border-dashed border-border 
          bg-[#fafafa] p-12 text-center transition-colors
          hover:border-muted-foreground/50 hover:bg-[#f5f5f5]"
        >
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            id="audio-upload"
          />
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white border border-border">
              <Mic className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                Drop audio file or click to upload
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                MP3, WAV, M4A up to 25MB
              </p>
            </div>
          </div>
        </div>
      </div>

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
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setData({ ...data, audio: null })}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Recording feature coming soon
      </p>
    </div>
  );
}

function StepPreview({ data }: { data: PostData }) {
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

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  MapPin,
  ImageIcon,
  Mic,
  Eye,
  Type,
  Check,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { StepTitle } from "@/components/create-post/step-title";
import { StepLocation } from "@/components/create-post/step-location";
import { StepMedia } from "@/components/create-post/step-media";
import { StepAudio } from "@/components/create-post/step-audio";
import { StepPreview } from "@/components/create-post/step-preview";
import { PostData } from "@/components/create-post/types";

const STEPS = [
  { id: 1, title: "Title", description: "Name your post", icon: Type },
  { id: 2, title: "Location", description: "Set the location", icon: MapPin },
  { id: 3, title: "Media", description: "Add visuals", icon: ImageIcon },
  { id: 4, title: "Audio", description: "Add audio", icon: Mic },
  { id: 5, title: "Preview", description: "Review & publish", icon: Eye },
];

export default function CreatePostPage() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<PostData>({
    title: "",
    description: "",
    latitude: null,
    longitude: null,
    address: "",
    media: null,
    audio: null,
    audioUrl: null,
    radius: 100,
  });

  const nextStep = () => setStep((s) => Math.min(s + 1, STEPS.length));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    console.log("Submitting:", data);
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
            disabled={step === 1}
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
              className="gap-2 bg-foreground text-background hover:bg-foreground/90"
            >
              Publish Post
              <Check className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Step Counter */}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Step {step} of {STEPS.length}
        </p>
      </div>
    </div>
  );
}

"use client";

import { Navbar } from "@/components/layout/navbar";
import { ThreeBackground } from "@/components/home/three-background";
import { MapPin, Headphones, Globe, Sparkles, Lock } from "lucide-react";

export default function Home() {
  return (
    <div 
      className="relative min-h-screen overflow-hidden"
      style={{ backgroundColor: "#000000" }}
    >
      {/* Three.js Background */}
      <ThreeBackground />

      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="relative z-10">
        {/* Hero Section */}
        <section 
          className="min-h-screen flex flex-col items-center justify-center px-6 pt-20 pb-12"
          style={{ minHeight: "100vh" }}
        >
          {/* Corner accent */}
          <div 
            className="absolute top-24 left-4 text-2xl"
            style={{ color: "rgba(255,255,255,0.2)" }}
          >
            +
          </div>

          {/* Hero Content */}
          <div className="max-w-4xl mx-auto text-center" style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            <h1 
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight animate-fade-in-up"
              style={{ 
                color: "#ffffff",
                lineHeight: 1.1,
              }}
            >
              Discover stories
              <br />
              anchored to real
              <br />
              world places.
            </h1>

            <p 
              className="text-lg sm:text-xl max-w-xl mx-auto leading-relaxed animate-fade-in-up"
              style={{ 
                color: "rgba(255,255,255,0.6)",
                animationDelay: "200ms" 
              }}
            >
              ARchive lets you create and unlock
              <br className="hidden sm:block" />
              <span style={{ color: "#ffffff", fontWeight: 500 }}> location-based</span>,{" "}
              <span style={{ color: "#ffffff", fontWeight: 500 }}>audio</span>, and{" "}
              <span style={{ color: "#ffffff", fontWeight: 500 }}>AR experiences</span>
              <br className="hidden sm:block" />
              tied to the world around you.
            </p>
          </div>

          {/* Scroll indicator */}
          <div 
            className="absolute bottom-8 left-1/2 animate-fade-in"
            style={{ 
              transform: "translateX(-50%)",
              animationDelay: "500ms" 
            }}
          >
            <div 
              style={{ 
                width: "1px", 
                height: "64px", 
                background: "linear-gradient(to bottom, rgba(255,255,255,0.3), transparent)" 
              }} 
            />
          </div>
        </section>

        {/* Features Section */}
        <section className="relative px-6 py-20">
          {/* Divider line */}
          <div 
            className="absolute top-0 left-6 right-6"
            style={{ height: "1px", backgroundColor: "rgba(255,255,255,0.1)" }}
          />
          <div 
            className="absolute top-0 left-1/2"
            style={{ width: "1px", height: "32px", backgroundColor: "rgba(255,255,255,0.1)" }}
          />

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-8">
              <FeatureCard
                icon={<Lock className="w-6 h-6" />}
                title="Location-locked."
                description="Content unlocks only when you're at the right place. Step into the story."
                delay={100}
              />

              <FeatureCard
                icon={<Globe className="w-6 h-6" />}
                title="Universal."
                description="Explore AR experiences from anywhere in the world. Every place has a story."
                delay={200}
              />

              <FeatureCard
                icon={<Headphones className="w-6 h-6" />}
                title="Immersive."
                description="AI-generated audio narrations bring locations to life with spatial storytelling."
                delay={300}
              />

              <FeatureCard
                icon={<Sparkles className="w-6 h-6" />}
                title="Magical."
                description="Augmented reality transforms ordinary places into extraordinary experiences."
                delay={400}
              />
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="relative px-6 py-20">
          <div 
            className="absolute top-0 left-6 right-6"
            style={{ height: "1px", backgroundColor: "rgba(255,255,255,0.1)" }}
          />

          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 
                className="text-2xl sm:text-3xl font-semibold mb-4"
                style={{ color: "#ffffff" }}
              >
                How it works
              </h2>
              <p style={{ color: "rgba(255,255,255,0.5)" }}>
                Three simple steps to discover hidden stories
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <StepCard
                number="01"
                title="Explore"
                description="Browse stories on the map or walk around to discover nearby content."
              />
              <StepCard
                number="02"
                title="Arrive"
                description="Get close to the location to unlock the experience."
              />
              <StepCard
                number="03"
                title="Experience"
                description="Listen to audio, view AR content, and immerse yourself in the story."
              />
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer 
          className="relative px-6 py-12"
          style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}
        >
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" style={{ color: "rgba(255,255,255,0.4)" }} />
              <span className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>ARchive</span>
            </div>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
              © 2026 ARchive. All rights reserved.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}) {
  return (
    <div
      className="flex flex-col items-center text-center p-6 animate-fade-in-up"
      style={{ 
        gap: "1rem",
        animationDelay: `${delay}ms` 
      }}
    >
      <div 
        className="flex items-center justify-center w-14 h-14 rounded-full"
        style={{ 
          border: "1px solid rgba(255,255,255,0.2)",
          color: "rgba(255,255,255,0.8)" 
        }}
      >
        {icon}
      </div>
      <h3 className="text-lg font-medium" style={{ color: "#ffffff" }}>{title}</h3>
      <p className="text-sm leading-relaxed max-w-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
        {description}
      </p>
    </div>
  );
}

function StepCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div 
      className="relative p-6 rounded-2xl transition-colors"
      style={{ 
        backgroundColor: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.1)" 
      }}
    >
      <span 
        className="absolute top-4 right-4 text-4xl font-bold"
        style={{ color: "rgba(255,255,255,0.05)" }}
      >
        {number}
      </span>
      <h3 className="text-lg font-medium mb-2" style={{ color: "#ffffff" }}>{title}</h3>
      <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
        {description}
      </p>
    </div>
  );
}

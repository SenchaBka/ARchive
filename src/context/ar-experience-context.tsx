"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
  type ReactNode,
} from "react";

export type ARCoordinates = { lat: number; lon?: number; lng?: number };

export type ARExperienceState = {
  open: boolean;
  imageUrl: string;
  text: string;
  coordinates: ARCoordinates | null;
};

type ARExperienceContextValue = {
  state: ARExperienceState;
  openARExperience: (
    imageUrl: string,
    text: string,
    coordinates: ARCoordinates
  ) => void;
  closeARExperience: () => void;
};

const AR_OPEN_EVENT = "ar-experience-open";

const initialState: ARExperienceState = {
  open: false,
  imageUrl: "",
  text: "",
  coordinates: null,
};

const ARExperienceContext = createContext<ARExperienceContextValue | null>(
  null
);

function buildIframeSrc(
  imageUrl: string,
  text: string,
  coordinates: ARCoordinates
): string {
  const lat = coordinates.lat;
  const lon = coordinates.lon ?? coordinates.lng ?? 0;
  const params = new URLSearchParams();
  if (imageUrl) params.set("image_url", imageUrl);
  if (text) params.set("text", text);
  params.set("lat", String(lat));
  params.set("lon", String(lon));
  return `/ar-experience.html?${params.toString()}`;
}

export function ARExperienceProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<ARExperienceState>(initialState);

  const openARExperience = useCallback(
    (imageUrl: string, text: string, coordinates: ARCoordinates) => {
      setState({
        open: true,
        imageUrl,
        text,
        coordinates,
      });
    },
    []
  );

  const closeARExperience = useCallback(() => {
    setState(initialState);
  }, []);

  useEffect(() => {
    const handler = (e: CustomEvent<{ imageUrl: string; text: string; coordinates: ARCoordinates }>) => {
      const { imageUrl, text, coordinates } = e.detail;
      openARExperience(imageUrl, text, coordinates);
    };
    window.addEventListener(AR_OPEN_EVENT, handler as EventListener);
    return () => window.removeEventListener(AR_OPEN_EVENT, handler as EventListener);
  }, [openARExperience]);

  const value = useMemo(
    () => ({
      state,
      openARExperience,
      closeARExperience,
    }),
    [state, openARExperience, closeARExperience]
  );

  return (
    <ARExperienceContext.Provider value={value}>
      {children}
      <ARExperienceOverlay />
    </ARExperienceContext.Provider>
  );
}

function ARExperienceOverlay() {
  const ctx = useContext(ARExperienceContext);
  if (!ctx) return null;

  const { state, closeARExperience } = ctx;
  const { open, imageUrl, text, coordinates } = state;

  if (!open || !coordinates) return null;

  const src = buildIframeSrc(imageUrl, text, coordinates);

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col bg-black"
      style={{ isolation: "isolate" }}
    >
      <iframe
        src={src}
        title="AR Experience"
        className="absolute inset-0 h-full w-full border-0"
        allow="camera; geolocation"
      />
      <button
        type="button"
        onClick={closeARExperience}
        className="absolute right-4 top-4 z-10 flex items-center gap-2 rounded-full border border-white/30 bg-black/60 px-4 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-black/80 hover:border-white/50"
        aria-label="Exit AR experience"
      >
        <span className="text-base leading-none">×</span>
        Exit
      </button>
    </div>
  );
}

export function useARExperience() {
  const ctx = useContext(ARExperienceContext);
  if (!ctx) {
    throw new Error(
      "useARExperience must be used within an ARExperienceProvider"
    );
  }
  return ctx;
}

/**
 * Open the AR experience overlay. Call from anywhere (including outside React).
 *
 * @example
 * import { openARExperience } from "@/context/ar-experience-context";
 * openARExperience(
 *   "https://example.com/image.jpg",
 *   "Story text here",
 *   { lat: 51.5, lon: -0.1 }
 * );
 */
export function openARExperience(
  imageUrl: string,
  text: string,
  coordinates: ARCoordinates
): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(AR_OPEN_EVENT, {
      detail: { imageUrl, text, coordinates },
    })
  );
}

export type ARExperienceTriggerProps = {
  imageUrl: string;
  text: string;
  coordinates: ARCoordinates;
  children?: ReactNode;
  className?: string;
};

/**
 * Declarative trigger: render with (imageUrl, text, coordinates) and optional children.
 * Clicking it opens the AR experience overlay.
 */
export function ARExperienceTrigger({
  imageUrl,
  text,
  coordinates,
  children,
  className,
}: ARExperienceTriggerProps) {
  return (
    <button
      type="button"
      onClick={() => openARExperience(imageUrl, text, coordinates)}
      className={className}
    >
      {children ?? "Enter AR"}
    </button>
  );
}

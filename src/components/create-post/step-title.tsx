"use client";

import { Label } from "@/components/ui/label";
import { PostData } from "./types";

interface StepTitleProps {
  data: PostData;
  setData: React.Dispatch<React.SetStateAction<PostData>>;
}

export function StepTitle({ data, setData }: StepTitleProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label 
          htmlFor="title" 
          className="text-sm font-medium"
          style={{ color: "rgba(255,255,255,0.9)" }}
        >
          Title
        </Label>
        <input
          id="title"
          placeholder="Give your post a title"
          value={data.title}
          onChange={(e) => setData({ ...data, title: e.target.value })}
          className="w-full h-11 px-4 rounded-lg text-sm transition-all duration-200 outline-none"
          style={{
            backgroundColor: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#fafafa"
          }}
          onFocus={(e) => {
            e.target.style.backgroundColor = "rgba(255,255,255,0.08)";
            e.target.style.borderColor = "rgba(255,255,255,0.2)";
          }}
          onBlur={(e) => {
            e.target.style.backgroundColor = "rgba(255,255,255,0.05)";
            e.target.style.borderColor = "rgba(255,255,255,0.1)";
          }}
        />
      </div>
      <div className="space-y-2">
        <Label 
          htmlFor="description" 
          className="text-sm font-medium"
          style={{ color: "rgba(255,255,255,0.9)" }}
        >
          Description
          <span className="ml-1 font-normal" style={{ color: "rgba(255,255,255,0.4)" }}>(optional)</span>
        </Label>
        <textarea
          id="description"
          placeholder="What's this post about?"
          value={data.description}
          onChange={(e) => setData({ ...data, description: e.target.value })}
          rows={4}
          className="w-full px-4 py-3 rounded-lg text-sm resize-none transition-all duration-200 outline-none"
          style={{
            backgroundColor: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#fafafa"
          }}
          onFocus={(e) => {
            e.target.style.backgroundColor = "rgba(255,255,255,0.08)";
            e.target.style.borderColor = "rgba(255,255,255,0.2)";
          }}
          onBlur={(e) => {
            e.target.style.backgroundColor = "rgba(255,255,255,0.05)";
            e.target.style.borderColor = "rgba(255,255,255,0.1)";
          }}
        />
      </div>
    </div>
  );
}

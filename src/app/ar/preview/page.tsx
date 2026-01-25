"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

export default function ARPreviewPage() {
  const [imageUrl, setImageUrl] = useState(
    "https://img.freepik.com/free-photo/front-view-kitten-outdoors_1161-75.jpg?semt=ais_hybrid&w=740&q=80"
  );
  const [text, setText] = useState(
    "This is a test message for the AR experience. You can see the tube animation, particle effects, and how the content displays when you click to explode the tube."
  );
  const [lat, setLat] = useState("40.7128");
  const [lon, setLon] = useState("-74.0060");
  const [iframeKey, setIframeKey] = useState(0);

  const buildPreviewUrl = () => {
    const params = new URLSearchParams();
    if (imageUrl) params.set("image_url", imageUrl);
    if (text) params.set("text", text);
    params.set("lat", lat);
    params.set("lon", lon);
    return `/ar-experience.html?${params.toString()}`;
  };

  const handleReload = () => {
    setIframeKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">
            AR Scene Preview
          </h1>
          <p className="text-gray-400">
            Test the tube animation, effects, text, and image display in your
            browser
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Controls Panel */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="p-4 bg-gray-800/50 border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-4">
                Test Parameters
              </h2>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="image-url" className="text-gray-300">
                    Image URL
                  </Label>
                  <Input
                    id="image-url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Enter image URL"
                    className="mt-1 bg-gray-900 border-gray-700 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="text" className="text-gray-300">
                    Text Content
                  </Label>
                  <Textarea
                    id="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Enter text to display"
                    rows={4}
                    className="mt-1 bg-gray-900 border-gray-700 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="lat" className="text-gray-300">
                      Latitude
                    </Label>
                    <Input
                      id="lat"
                      value={lat}
                      onChange={(e) => setLat(e.target.value)}
                      placeholder="40.7128"
                      className="mt-1 bg-gray-900 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lon" className="text-gray-300">
                      Longitude
                    </Label>
                    <Input
                      id="lon"
                      value={lon}
                      onChange={(e) => setLon(e.target.value)}
                      placeholder="-74.0060"
                      className="mt-1 bg-gray-900 border-gray-700 text-white"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleReload}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    Reload Scene
                  </Button>
                  <Button
                    onClick={() => {
                      setImageUrl(
                        "https://img.freepik.com/free-photo/front-view-kitten-outdoors_1161-75.jpg?semt=ais_hybrid&w=740&q=80"
                      );
                      setText(
                        "This is a test message for the AR experience. You can see the tube animation, particle effects, and how the content displays when you click to explode the tube."
                      );
                      setLat("40.7128");
                      setLon("-74.0060");
                      handleReload();
                    }}
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-gray-800/50 border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-2">
                Instructions
              </h3>
              <ul className="text-sm text-gray-400 space-y-2">
                <li>• The scene runs in simulation mode (no AR required)</li>
                <li>• Click the tube to trigger the explosion animation</li>
                <li>• Watch particles explode and content fade in</li>
                <li>• Use "Reset" button to restore the tube</li>
                <li>• Modify parameters and reload to test different content</li>
              </ul>
            </Card>
          </div>

          {/* AR Scene Preview */}
          <div className="lg:col-span-2">
            <Card className="p-0 bg-gray-800/50 border-gray-700 overflow-hidden">
              <div className="aspect-video bg-black relative">
                <iframe
                  key={iframeKey}
                  src={buildPreviewUrl()}
                  className="w-full h-full border-0"
                  title="AR Scene Preview"
                  allow="camera; geolocation"
                />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

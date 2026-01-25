// POST /api/geocode
// Convert address to coordinates or reverse geocode

import { NextRequest, NextResponse } from "next/server";
import { geocodeAddress, reverseGeocode } from "@/lib/services/geocoding-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, latitude, longitude, type } = body;

    // Reverse geocoding (coordinates to address)
    if (type === "reverse" && latitude !== undefined && longitude !== undefined) {
      const result = await reverseGeocode(latitude, longitude);
      
      if (!result) {
        return NextResponse.json(
          { error: "Could not find address for these coordinates" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        address: result,
      });
    }

    // Forward geocoding (address to coordinates)
    if (!address || typeof address !== "string" || address.trim() === "") {
      return NextResponse.json(
        { error: "Address is required" },
        { status: 400 }
      );
    }

    const result = await geocodeAddress(address);

    if (!result) {
      return NextResponse.json(
        { error: "Could not find coordinates for this address" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      latitude: result.latitude,
      longitude: result.longitude,
      formattedAddress: result.formattedAddress,
    });
  } catch (error) {
    console.error("Geocoding API error:", error);
    return NextResponse.json(
      { error: "Failed to geocode address" },
      { status: 500 }
    );
  }
}

// POST /api/tts/generate

import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ message: "TTS not implemented" }, { status: 501 });
}

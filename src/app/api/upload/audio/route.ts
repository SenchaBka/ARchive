// POST /api/upload/audio

import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ message: "Audio upload not implemented" }, { status: 501 });
}

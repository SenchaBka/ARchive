// POST /api/upload/media

import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ message: "Media upload not implemented" }, { status: 501 });
}

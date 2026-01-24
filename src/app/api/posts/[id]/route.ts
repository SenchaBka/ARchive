// GET /api/posts/[id]

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "Get post not implemented" }, { status: 501 });
}

// GET /api/posts/list

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "List posts not implemented" }, { status: 501 });
}

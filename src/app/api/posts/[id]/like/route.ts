// POST /api/posts/[id]/like

import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ message: "Like post not implemented" }, { status: 501 });
}

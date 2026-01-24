// POST /api/posts/[id]/comment

import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ message: "Comment not implemented" }, { status: 501 });
}

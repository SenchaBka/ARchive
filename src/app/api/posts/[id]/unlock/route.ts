// POST /api/posts/[id]/unlock

import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ message: "Unlock post not implemented" }, { status: 501 });
}

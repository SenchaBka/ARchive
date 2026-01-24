// POST /api/posts/create

import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ message: "Create post not implemented" }, { status: 501 });
}

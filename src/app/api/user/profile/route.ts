// GET /api/user/profile

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "User profile not implemented" }, { status: 501 });
}

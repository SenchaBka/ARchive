// POST /api/user/sync (Auth0 → DB)

import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ message: "User sync not implemented" }, { status: 501 });
}

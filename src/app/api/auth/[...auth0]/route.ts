// Auth0 callback handler

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "Auth0 callback handler" }, { status: 501 });
}

export async function POST() {
  return NextResponse.json({ message: "Auth0 callback handler" }, { status: 501 });
}

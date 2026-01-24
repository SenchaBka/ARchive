// Next.js middleware (auth guards)

import { NextResponse } from "next/server";

export function middleware() {
  return NextResponse.next();
}

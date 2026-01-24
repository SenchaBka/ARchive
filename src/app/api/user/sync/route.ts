// POST /api/user/sync (Auth0 → DB)

import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { saveUserToDB } from "@/lib/services/user-service";

export async function POST() {
  try {
    const session = await auth0.getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const user = await saveUserToDB(
      session.user.sub,
      session.user.name,
      session.user.picture
    );

    return NextResponse.json({ 
      success: true, 
      message: "User synced to database",
      user 
    });
  } catch (error) {
    console.error("Error syncing user:", error);
    return NextResponse.json({ 
      error: "Failed to sync user" 
    }, { status: 500 });
  }
}

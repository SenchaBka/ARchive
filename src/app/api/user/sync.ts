// POST /api/user/sync (Auth0 → DB)

import { getSession } from "@auth0/nextjs-auth0";
import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  await connectDB();

  const session = await getSession(req, res);

  if (!session?.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const auth0Id = session.user.sub;

  let user = await User.findOne({ auth0Id });

  if (!user) {
    user = await User.create({
      auth0Id,
      name: session.user.name,
      profilePhoto: session.user.picture
    });
  }

  return res.status(200).json(user);
}
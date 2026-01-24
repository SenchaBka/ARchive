// User business logic

import { connectDB } from "../db";
import { User } from "../../models/User";

export async function saveUserToDB(auth0Id: string, name?: string, picture?: string) {
  try {
    await connectDB();
    
    // Check if user already exists
    let user = await User.findOne({ auth0Id });
    
    if (user) {
      // Update existing user
      user.name = name || user.name;
      user.profilePhoto = picture || user.profilePhoto;
      await user.save();
    } else {
      // Create new user
      user = new User({
        auth0Id,
        name,
        profilePhoto: picture,
      });
      await user.save();
    }
    
    return user;
  } catch (error) {
    console.error('Error saving user to DB:', error);
    throw error;
  }
}

export function syncUser() {
  throw new Error("Not implemented");
}

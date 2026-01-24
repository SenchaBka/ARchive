// User business logic

import { connectDB } from "../db";
import { User } from "../../models/user";

export interface CreateUserData {
  auth0Id: string;
  name?: string;
  profilePhoto?: string;
}

export async function findOrCreateUser(userData: CreateUserData) {
  await connectDB();
  
  try {
    // Try to find existing user
    let user = await User.findOne({ auth0Id: userData.auth0Id });
    
    if (!user) {
      // Create new user if doesn't exist
      user = new User({
        auth0Id: userData.auth0Id,
        name: userData.name,
        profilePhoto: userData.profilePhoto,
      });
      
      await user.save();
    } else {
      // Update existing user data if provided
      if (userData.name && userData.name !== user.name) {
        user.name = userData.name;
      }
      if (userData.profilePhoto && userData.profilePhoto !== user.profilePhoto) {
        user.profilePhoto = userData.profilePhoto;
      }
      await user.save();
    }
    
    return user;
  } catch (error) {
    console.error("Error in findOrCreateUser:", error);
    throw error;
  }
}

export async function getUserByAuth0Id(auth0Id: string) {
  await connectDB();
  
  try {
    const user = await User.findOne({ auth0Id }).populate("discoveredPosts");
    return user;
  } catch (error) {
    console.error("Error in getUserByAuth0Id:", error);
    throw error;
  }
}

export async function updateUser(auth0Id: string, updateData: Partial<CreateUserData>) {
  await connectDB();
  
  try {
    const user = await User.findOneAndUpdate(
      { auth0Id },
      updateData,
      { new: true, runValidators: true }
    );
    
    return user;
  } catch (error) {
    console.error("Error in updateUser:", error);
    throw error;
  }
}

export function syncUser() {
  throw new Error("Not implemented");
}

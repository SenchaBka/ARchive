// User TypeScript interface + schema

import { Schema, model, models } from "mongoose";

const UserSchema = new Schema({
  auth0Id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

  name: String,
  profilePhoto: String,

  discoveredPosts: [{
    type: Schema.Types.ObjectId,
    ref: "Post"
  }],

  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const User = models.User || model("User", UserSchema);

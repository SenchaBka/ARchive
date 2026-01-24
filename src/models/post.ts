// Post TypeScript interface + schema

import { Schema, model, models } from "mongoose";

const PostSchema = new Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },

  title: {
    type: String,
    required: true
  },

  hiddenText: String,

  hiddenMedia: {
    type: {
      type: String,
      enum: ['image', 'model', 'gif']
    },
    url: String
  },

  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },

  approximateLocation: String,

  radius: {
    type: Number,
    default: 50 // meters
  },

  audioUrl: String,      // User-uploaded audio
  ttsAudioUrl: String,   // TTS-generated audio from description

  likes: {
    type: Number,
    default: 0
  },

  comments: [{
    userId: { type: String, required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],

  createdAt: {
    type: Date,
    default: Date.now
  },

  moderationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  }
});

// Index for geospatial queries
PostSchema.index({ "coordinates.lat": 1, "coordinates.lng": 1 });

export const Post = models.Post || model("Post", PostSchema);

# ARchive

ARchive turns cities into interactive storytelling canvases. People can leave voice messages, images, GIFs, and 3D objects pinned to real-world locations — and others can unlock them only by physically visiting the spot.

It’s built around one simple idea: **memories should live where they happened**.

---

## Links

- [**Real demo**](https://www.youtube.com/watch?v=cUTGQSXVC4U)
- [**Brainrot demo**](https://youtube.com/shorts/WVGEEL-_tsk?si=qbO695e-Og9Av5qF)
- [**Devpost**](https://devpost.com/software/archive-lz2khd)
- [**Try it out**](https://ar-chive.vercel.app/)

---

## Table of Contents

- [Inspiration](#inspiration)
- [What it does](#what-it-does)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Run Locally](#run-locally)

---

## Inspiration

Walking through our cities, we realized every street corner holds invisible stories that fade with time. We asked:

**What if we could anchor memories to physical places and bring them to life through AR?**

We wanted to solve three problems:

- Social media keeps us doomscrolling instead of exploring  
- Personal histories disappear because there’s no way to preserve them geographically  
- Digital content feels disposable — we wanted discovery to feel earned and magical  

---

## What it does

ARchive transforms real-world locations into interactive AR “archives” that people can create and others can discover.

### Create a Memory
Users can create an archive by:

- Recording a voice message directly in the app  
- Or generating a voice message with AI using **ElevenLabs (TTS)**  
- Uploading media such as:
  - images
  - 3D models
  - GIFs  
- Dropping a pin on the exact location  
- Setting a discovery radius (**10m–50m**)  

### Discover Hidden Stories
Instead of showing everything instantly, ARchive keeps discovery mystery-driven:

- Browse archives showing only:
  - title
  - approximate location
  - distance from you  
- Sort by:
  - proximity
  - popularity  
- Navigate using a compass-guided interface built for exploration

### The Unlock Experience
When you physically walk into the radius:

- Images and 3D models appear anchored to the real world
- All details are now unlocked
- Hidden text fades in with animations
- Celebration effects trigger on unlock

### Engage
Users can:

- Like and comment on archives
- Earn discovery badges
- Build a profile showing archives created and unlocked

---

## Key Features

### Location-based unlocking (proximity required)
- Archives are tied to GPS coordinates
- Content is designed to be experienced only when you’re actually there
- Distance is calculated using the **Haversine formula** for real-world accuracy

### AR reveal moment (the “wow” part)
- AR content appears anchored to the environment
- Audio + visuals only accessible on unlock
- Smooth animations make the experience feel intentional, not just technical

### Lightweight social layer
- Likes and comments to highlight good archives
- Badges to reward exploration
- Profile view for creators and explorers

### Safety and content checks

- Ensures audio, visuals, and text are appropriate and safe for all users

---

## Tech Stack

### Frontend
- **Next.js**
- **React**
- **TypeScript**
- **TailwindCSS**
- **TanStack Query** (caching + data fetching)

### 3D / AR
- **Three.js** (3D rendering + interactive visuals)
- **A-Frame** (web-based AR scene framework)
- **Locar.js** (location-based AR anchoring)

### Backend
- **Node.js** (Next.js API routes)
- **MongoDB Atlas**
- **AWS S3** (storage for assets, 3D models, and media files)

### Auth
- **Auth0**
  - login + automatic user sync

### APIs / Services
- **ElevenLabs** (Text-to-Speech voice generation)
- **Google Maps API** (geocoding / location support)
- **Gemini API** (content safety & moderation)
---

## Run Locally

```bash
git clone https://github.com/SenchaBka/ARchive.git
cd ARchive
npm install
npm run dev

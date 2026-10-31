# 🔔 DoraPocket Birthday Studio

**DoraPocket Birthday Studio** is a Doraemon-inspired, 22nd-century interactive birthday website builder and surprise experience. Create, customize, preview, and share a personalized 6-step celebration portal complete with animated future gadgets, photo albums, custom background music, heartfelt letters, and an interactive birthday cake finale.

---

## ✨ Key Features

### 🚪 1. 6-Step Interactive Birthday Experience
- **Step 1 — Anywhere Door Welcome Portal**: An interactive pink *Dokodemo Door* entry portal personalized with the birthday star's name, age badge, celebration date, and custom portrait.
- **Step 2 — Milestone & Photo Showcase**: Official celebration certificate displaying turning age, relationship badge, countdown/celebration status, and a featured photo showcase with interactive gallery switcher.
- **Step 3 — Time Machine Memory Album**: Polaroid-style photo and memory cards with dates, tags, detailed captions, and a full-screen lightbox viewer.
- **Step 4 — 4D Pocket Gadget Surprises & Funny Moments**: Interactive secret gadgets (*Anywhere Door*, *Time Furoshiki*, *Take-Copter*, *Memory Bread*) that reveal personalized birthday wishes alongside an inside-jokes & funny moments board.
- **Step 5 — Personal Letter & Crew Wishes Wall**: A heartfelt letter sealed from the sender plus an interactive wall of birthday wishes from friends and family.
- **Step 6 — Interactive Birthday Cake Finale**: Blow out the glowing candles (click/tap one by one or all at once) to trigger a celebratory confetti burst and Doraemon's Dorayaki bonus surprise.

### 🎨 2. Live Split-Screen Customization Studio
- **Dynamic Real-Time Sync**: Every change to the recipient's name, nickname, turning age, date, sender name, headline, or letter updates the live preview and all 6 steps immediately.
- **Quick Character Presets & One-Click Clear**: Switch between themed templates (*Nobita*, *Shizuka*, *Dorami*, *Best Friend*) or click **`+ New Person (Clear)`** to start fresh for a new person.
- **Built-In Photo Crop & Visual Enhancement Studio**:
  - Upload photos from your device or paste image URLs.
  - Crop with presets (`16:9`, `4:3`, `1:1`, `3:4`), zoom, pan, rotate (`-90°` / `+90°`), and flip horizontally/vertically.
  - Apply 22nd-century visual filters (*Sunny Sky*, *Golden Bell*, *Dreamy Cloud*, *Vivid Anime*, *Time Nostalgia*) and decorative frames (*Classic Polaroid*, *22nd Century Neon*, *Golden Bell*, *Anywhere Door Pink*).
  - Automatically compresses cropped images into lightweight Data URLs so photos persist across reloads, share links, and serverless deployments.

### 🎵 3. Background Music Controller
- **Doraemon Cartoon BGM**: Plays the classic Doraemon theme music with a floating bottom-left **BGM ON / OFF** toggle and expandable mini-player.
- **Synthesized Melodies & Custom Audio**: Switch between Web Audio synthesized chimes (*Classic Happy Birthday*, *22nd Century Music Box*, *Pocket Gadget March*) or upload your own `.mp3`, `.wav`, `.ogg`, or `.m4a` track.

### 🔗 4. Instant Sharing & Standalone Offline Export
- **Compact Share Links**: Generates short, Nginx/Vercel-safe shareable URLs (`?s=<shortId>#d=...`) that open directly in **Recipient Surprise Mode** (hiding the editor controls).
- **Standalone HTML Download**: Export the entire personalized birthday website—including photos, styles, and interactive steps—as a single self-contained `.html` file that works offline in any browser.
- **JSON Backup & Restore**: Export and import configuration `.json` files to save or re-edit templates anytime.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4 (`@tailwindcss/vite`), Lucide React Icons
- **Audio & Visuals**: YouTube IFrame API, Web Audio API Synthesizer, HTML5 Canvas Image Processing & Confetti Engine
- **Backend / API**: Express (`server.ts`) for local/full-stack server & Vercel Serverless Functions (`/api/shares.js`, `/api/uploads.js`)
- **Build & Tooling**: Vite 6, `tsx`, Node.js built-in test runner

---

## 📁 Project Structure

```text
├── api/
│   ├── shares.js                        # Vercel serverless endpoint for short share links
│   └── uploads.js                       # Vercel serverless endpoint for Base64 Data URL uploads
├── src/
│   ├── components/
│   │   ├── BackgroundMusicPlayer.tsx    # Floating BGM controller (YouTube + Web Audio + custom MP3)
│   │   ├── BirthdayCakeStep.tsx         # Interactive candle blow-out & finale experience
│   │   ├── BirthdayExperience.tsx       # 6-step interactive Doraemon celebration portal
│   │   ├── ConfettiCanvas.tsx           # HTML5 canvas confetti particle engine
│   │   ├── CustomizationEditor.tsx      # 4-tab studio editor (Recipient, Photos, Gadgets, Music)
│   │   ├── DoraemonSvg.tsx              # Custom SVG illustrations (Doraemon, Anywhere Door, Gadgets)
│   │   ├── PhotoCropEditorModal.tsx     # Interactive photo cropper, filters & frame studio
│   │   └── ShareModal.tsx               # Share link generator, HTML exporter & JSON backup modal
│   ├── data/
│   │   └── presets.ts                   # Default birthday template & character presets
│   ├── utils/
│   │   ├── birthdayLogic.ts             # URL encoding/decoding, profile sync & validation helpers
│   │   ├── birthdayLogic.test.ts        # Unit test suite for core birthday logic
│   │   ├── imageCropper.ts              # Canvas cropping, aspect ratio & filter rendering
│   │   └── standaloneHtmlGenerator.ts   # Self-contained offline HTML file generator
│   ├── App.tsx                          # Main studio layout, navigation & view mode switcher
│   ├── main.tsx                         # React entry point
│   └── types.ts                         # TypeScript interfaces for configs, memories & gadgets
├── server.ts                            # Express + Vite full-stack server (port 3000)
├── vercel.json                          # Vercel build & serverless routing configuration
└── package.json
```

---

## 🚀 Getting Started Locally

### Prerequisites
- **Node.js** v18+ and **npm**

### 1. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 2. Start the Development Server
```bash
npm run dev
```
The app will start at **`http://localhost:3000`**.

### 3. Run Unit Tests
```bash
npx tsx --test src/utils/birthdayLogic.test.ts
```

### 4. Build for Production
```bash
npm run build
```

---

## ☁️ Deploying to Vercel

This repository includes a pre-configured `vercel.json` and serverless API routes (`/api/shares.js` and `/api/uploads.js`) for zero-config deployment on Vercel:

1. Push this repository to GitHub.
2. Import the repository in [Vercel](https://vercel.com/new).
3. Vercel will automatically detect `vercel.json`:
   - **Install Command**: `npm install --legacy-peer-deps`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Click **Deploy**.

---

## 💡 How to Create & Share a Birthday Website

1. Open the studio and click **Customize** in the top navigation bar.
2. In the **1. Recipient** tab, enter the birthday person's **Name**, **Nickname**, **Age**, **Date**, and **Your Name** (or click **`+ New Person (Clear)`** to reset all fields).
3. In the **2. Photos** tab, click **Upload & Crop Photo** on any memory card to upload pictures from your device, adjust the crop/filter, and save.
4. In the **3. Gadgets & Letter** tab, customize the 4D Pocket gadget messages, funny moments, and personal birthday letter.
5. In the **4. Music** tab, choose **Doraemon Cartoon BGM**, a synthesized melody, or upload a custom audio file.
6. Click **Share Link** in the top bar to copy the shareable surprise link or download a standalone `.html` file!

# ASCII Vision ⚡

> Real-time ASCII art renderer powered by AI background segmentation. Transform your webcam feed, images, and videos into stunning typographic visuals — entirely in your browser.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![TailwindCSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-green)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🎥 **Live Camera** | Stream your webcam and see ASCII art rendered in real-time at 30+ FPS |
| 🧠 **AI Background Removal** | MediaPipe selfie segmentation isolates subjects against pure black |
| 🎨 **Two Render Modes** | Standard brightness mapping + Sequential code text tracing |
| ⚡ **5 Presets** | Matrix, Dense, Minimal, Code, Emoji — instant style switching |
| 🎛️ **7 Processing Sliders** | Dark Threshold, Exposure, Contrast, Saturation, Vibrance, Resolution, Font Size |
| 📸 **Photo Export** | Download the current frame as a high-resolution PNG |
| 🎬 **Video Recording** | Record ASCII art video as WebM directly from the canvas |
| 📤 **File Upload** | Upload any image or video for ASCII conversion |
| 🌈 **Color Modes** | Full RGB colour mapping or classic green monochrome |
| 📊 **FPS Counter** | Live performance monitoring |

---

## 🖥️ Tech Stack

- **Framework:** Next.js 16 (App Router, TypeScript)
- **State:** Zustand
- **Styling:** TailwindCSS v4 + custom hacker theme CSS
- **Processing:** Web Worker + OffscreenCanvas (off-thread rendering)
- **AI:** MediaPipe tasks-vision (selfie segmentation, GPU-accelerated)
- **Export:** Canvas API (`toDataURL`) + MediaRecorder API (`captureStream`)

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Clone the repository
git clone https://github.com/unthinkingFool/ascii_image_rendering.git
cd ascii_image_rendering

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser and allow camera access.

### Production Build

```bash
npm run build
npm start
```

---

## 🎮 Usage Guide

### Controls Panel (Left Sidebar)

- **Presets** — Click Matrix / Dense / Minimal / Code / Emoji for instant styles
- **Render Mode** — Toggle between Standard (brightness mapping) and Sequential (code text)
- **AI Isolation** — Enable/disable AI-powered background removal
- **Palette** — Switch between RGB Vibrant and Monochrome green
- **Character Set** — Type any custom characters or code snippets
- **Sliders** — Fine-tune resolution, font size, dark threshold, exposure, contrast, saturation, and vibrance

### Capture Panel (Bottom Bar)

- 📷 **Camera icon** — Save current frame as PNG
- 🎥 **Video icon** — Start/stop recording (exports as WebM)
- 📤 **Upload icon** — Load an image or video file
- 🔄 **Webcam icon** — Switch back to live camera (appears after upload)

---

## 🏗️ Project Structure

```
src/
├── app/
│   ├── globals.css          # Hacker theme, custom scrollbars & sliders
│   ├── layout.tsx           # Root layout with SEO metadata
│   └── page.tsx             # Main page composing all components
├── components/
│   ├── ASCIIViewer.tsx      # Core render loop, FPS counter, scanline overlay
│   ├── CapturePanel.tsx     # Photo/video/upload controls
│   └── ControlsPanel.tsx    # Settings sidebar with presets & sliders
├── hooks/
│   └── useCamera.ts         # Webcam lifecycle + upload source switching
├── store/
│   └── useStore.ts          # Zustand global state + presets
├── utils/
│   └── segmenter.ts         # MediaPipe singleton with mode switching
└── workers/
    └── ascii.worker.ts      # Off-thread ASCII rendering engine
```

---

## 🔒 Privacy & Security

- **100% client-side** — No server, no API calls, no data collection
- **Camera access** requires explicit browser permission
- **No frames leave your device** — all processing happens locally in the browser
- **HTTPS required** for camera access (automatic on Vercel)

---

## 🌐 Deployment

This app deploys for **free** on [Vercel](https://vercel.com):

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → **Add New Project**
3. Import your GitHub repository
4. Click **Deploy** — done!

Vercel provides automatic HTTPS (required for camera access) and global CDN at zero cost.

---

## 📄 License

MIT — feel free to use, modify, and distribute.

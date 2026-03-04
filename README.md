# KrishiRakshak - AI-Powered Agricultural Safety Assistant

> **AWS AI for Bharat Hackathon Submission**

An AI-powered Progressive Web App that helps Indian farmers stay safe with voice-based safety guidance, camera hazard detection, and job hazard analysis checklists — all working offline.

---

## Live Demo

> **https://krishirakshak.vercel.app** _(deploy via Vercel — see [DEPLOY_VERCEL.md](./DEPLOY_VERCEL.md))_

## Demo Video

> **https://youtube.com/watch?v=YOUR_VIDEO_ID** _(placeholder)_

---

## Prototype (Hackathon MVP)

### What was built in 7 days

| Feature | Status | Description |
|---------|--------|-------------|
| Voice Q&A | Done | Ask safety questions by voice, get AI answers with TTS read-aloud |
| Hazard Detection | Done | Take photo or upload image, AI detects hazards with severity ratings |
| JHA Checklists | Done | Pre-built safety checklists with progress tracking and auto-save |
| PWA + Offline | Done | Installable, works offline via service worker caching |
| Bilingual UI | Done | Hindi + English throughout all screens |
| Demo Mode | Done | Full app works without AWS backend using built-in mock data |

### Architecture Decisions: MVP vs. Original Design

| Aspect | Original Design | Hackathon MVP | Why |
|--------|----------------|---------------|-----|
| Platform | React Native (Android) | PWA (React + Vite) | Faster development, instant deploy, no app store |
| Languages | 10+ regional languages | Hindi + English | Covers 57% of Indian farmers, Web Speech API support |
| LLM Backend | Bedrock + Neptune + Kendra (RAG) | Bedrock Claude 3 Haiku (direct) | Simpler, cheaper, still accurate for safety Q&A |
| Image AI | Custom ML models + Rekognition | Rekognition DetectLabels + pattern matching | Quick to ship, good hazard coverage |
| Sync | AppSync + bidirectional sync engine | localStorage + service worker cache | Fully offline, no server dependency |
| Database | SQLite + Neptune graph | localStorage (5MB) | Sufficient for checklist + history data |

### AWS Services Used (9 services)

| # | Service | Purpose |
|---|---------|---------|
| 1 | **Amazon Bedrock** (Nova Lite) | AI Q&A responses + hazard analysis via Converse API |
| 2 | **Bedrock Knowledge Bases** | RAG retrieval for official agricultural safety documents |
| 3 | **Amazon Rekognition** | DetectLabels for camera-based hazard identification |
| 4 | **AWS Lambda** (x2) | Serverless handlers for Q&A and hazard detection |
| 5 | **API Gateway** | REST API with CORS for the PWA frontend |
| 6 | **Amazon DynamoDB** | Activity logging (`krishirakshak-activity-log` table) |
| 7 | **Amazon S3** | Static website hosting for frontend + RAG document storage |
| 8 | **Amazon CloudFront** | Global CDN with HTTPS, compression, SPA routing |
| 9 | **Amazon CloudWatch** | Lambda monitoring and logging |

---

## Quick Start

```bash
git clone https://github.com/Sameer786/krishirakshak-ai.git
cd krishirakshak-ai
cp .env.example .env
npm install
npm run dev
```

Open **http://localhost:5173** on your phone or browser.

> **No AWS account needed!** The app runs in demo mode by default with built-in mock data for all features.

### To connect AWS backend:

1. Deploy Lambda functions — see [lambda/DEPLOY.md](./lambda/DEPLOY.md)
2. Update `.env` with your API Gateway URL
3. Set `VITE_DEMO_MODE=false`

---

## Deployment

KrishiRakshak has two independent frontend deployment options:

### Option 1: Vercel (main branch)
- **URL**: https://krishirakshak.vercel.app
- **Branch**: `main` (auto-deploys on push)
- **Config**: `vercel.json` (SPA rewrites + cache headers)
- Set env vars in Vercel dashboard: `VITE_API_GATEWAY_URL`, `VITE_DEMO_MODE=false`

### Option 2: AWS S3 + CloudFront (deploy/s3-cloudfront branch)
- **URL**: https://d2e3izstdqba08.cloudfront.net
- **S3 Bucket**: `krishirakshak-frontend` (ap-south-1)
- **CloudFront ID**: `E71T5EYFH0HUG`

**Quick deploy:**
```bash
git checkout deploy/s3-cloudfront
./scripts/deploy-s3.sh
```

**What the script does:**
1. Builds production bundle with `VITE_DEMO_MODE=false`
2. Syncs `dist/` to S3 with `--delete`
3. Sets optimized cache headers (immutable for hashed assets, no-cache for index.html)
4. Creates CloudFront invalidation for instant updates

> See [docs/AWS_S3_CLOUDFRONT_SETUP.md](./docs/AWS_S3_CLOUDFRONT_SETUP.md) for full setup details, testing checklist, and troubleshooting.

### Backend (shared by both frontends)
- **API Gateway**: `https://jd7dn6udrf.execute-api.ap-south-1.amazonaws.com/prod`
- **Lambdas**: `ask-safety-question`, `analyze-hazards` (deployed via AWS Console zip upload)
- CORS: `Access-Control-Allow-Origin: *` — works with any frontend domain

---

## Project Structure

```
krishirakshak-ai/
├── requirements.md           # Kiro-generated requirements (full vision)
├── design.md                 # Kiro-generated design (full architecture)
├── architecture.mermaid      # Architecture diagram
├── README.md                 # This file
├── DEPLOY_VERCEL.md          # Vercel deployment guide
├── vercel.json               # Vercel SPA config
├── .env.example              # Environment variable template
│
├── src/                      # React PWA source
│   ├── components/
│   │   ├── HomePage.jsx              # Landing page with feature cards
│   │   ├── VoiceQA/                  # Voice Q&A feature
│   │   │   ├── VoiceQA.jsx           # Main voice interface
│   │   │   ├── LanguageToggle.jsx    # Hindi/English switch
│   │   │   ├── QuestionChips.jsx     # Sample question buttons
│   │   │   ├── ResponseCard.jsx      # Answer display card
│   │   │   └── ResponseHistory.jsx   # Q&A history list
│   │   ├── HazardDetection/          # Camera hazard detection
│   │   │   ├── HazardDetection.jsx   # Camera + upload UI
│   │   │   └── HazardResults.jsx     # Detection results display
│   │   ├── JHAChecklist/             # Safety checklists
│   │   │   ├── JHAChecklist.jsx      # Checklist with progress
│   │   │   └── templates.js          # Checklist template data
│   │   └── common/                   # Shared components
│   │       ├── Layout.jsx            # App shell with nav
│   │       ├── Header.jsx            # Green header bar
│   │       ├── Navigation.jsx        # Bottom tab navigation
│   │       ├── Button.jsx            # Reusable button
│   │       ├── LoadingSpinner.jsx    # Animated spinner
│   │       ├── SeverityBadge.jsx     # Color-coded severity pill
│   │       ├── ErrorBoundary.jsx     # React error boundary
│   │       └── OfflineIndicator.jsx  # Online/offline status
│   ├── services/
│   │   ├── aws/
│   │   │   ├── bedrockService.js     # Bedrock Q&A client + demo mock
│   │   │   ├── rekognitionService.js # Rekognition client + demo mock
│   │   │   ├── config.js             # API URL, demo mode detection
│   │   │   └── mockData.js           # 15+ mock Q&A topics
│   │   └── offline/
│   │       ├── storageService.js     # Unified localStorage service
│   │       └── cacheService.js       # Q&A offline cache
│   ├── hooks/
│   │   ├── useSpeechRecognition.js   # Speech-to-text hook
│   │   ├── useSpeechSynthesis.js     # Text-to-speech hook
│   │   ├── useOnlineStatus.js        # Online/offline detection
│   │   └── usePWAInstall.js          # PWA install prompt
│   ├── utils/
│   │   ├── imageUtils.js             # Image compression + validation
│   │   └── analytics.js              # Event logging
│   ├── main.jsx                      # Entry point + SW registration
│   ├── App.jsx                       # Router + ErrorBoundary
│   └── index.css                     # Tailwind theme + animations
│
├── public/
│   ├── manifest.json                 # PWA manifest
│   ├── sw.js                         # Service worker
│   ├── icon-192.svg                  # App icon (192px)
│   └── icon-512.svg                  # App icon (512px)
│
├── lambda/                           # AWS Lambda functions
│   ├── ask-safety-question/
│   │   ├── index.mjs                 # Bedrock Q&A handler
│   │   └── package.json
│   ├── analyze-hazards/
│   │   ├── index.mjs                 # Rekognition handler
│   │   └── package.json
│   └── DEPLOY.md                     # Lambda deployment guide
│
└── package.json                      # v1.0.0
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 7, Tailwind CSS v4 |
| Platform | Progressive Web App (service worker, manifest) |
| Voice | Web Speech API (SpeechRecognition + speechSynthesis) |
| AI - Q&A | Amazon Bedrock (Claude 3 Haiku) via Lambda |
| AI - Vision | Amazon Rekognition (DetectLabels) via Lambda |
| Backend | AWS Lambda (Node.js 18) + API Gateway |
| Offline | Service Worker (cache-first static, network-first API) + localStorage |
| Deployment | Vercel (free tier) |

---

## Features in Detail

### 1. Voice Safety Q&A

- Tap microphone and ask any farming safety question
- AI responds with safety guidance, sources, and confidence score
- Text-to-speech reads the answer aloud (Hindi or English)
- Works offline — searches cached Q&A history
- 15+ pre-built sample questions covering pesticides, heat, machinery, first aid

### 2. Camera Hazard Detection

- Take a photo or upload from gallery
- AI analyzes image for agricultural hazards
- Results show severity (CRITICAL/HIGH/MEDIUM/LOW) with color coding
- Expandable cards with bilingual recommendations
- Save detections to history with compressed thumbnails

### 3. JHA Safety Checklists

- Pre-built templates: Pesticide Application, Tractor Operation
- Large 48px checkboxes for easy mobile use
- Progress bar with percentage tracking
- PPE requirement badges per step
- Auto-saves progress — resume where you left off
- 100% offline, no server needed

---

## Original Vision

The full design (see [requirements.md](./requirements.md) and [design.md](./design.md)) envisions:

- React Native Android app with offline SQLite + 100MB cached ML models
- 10+ Indian regional languages with local STT/TTS
- Neptune knowledge graph for contextual farming safety relationships
- Kendra RAG pipeline for intelligent document retrieval
- AppSync with bidirectional sync and conflict resolution
- Compliance tracking and government scheme integration
- 50K user scale at <$0.10/user/month

The hackathon MVP demonstrates the core value proposition — proving that AI-powered agricultural safety guidance is feasible, useful, and can work offline for rural Indian farmers.

---

## Team

Built for the **AWS AI for Bharat Hackathon** by Team KrishiRakshak.

---

## License

MIT

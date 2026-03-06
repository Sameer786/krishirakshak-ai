# KrishiRakshak (कृषि रक्षक)

**AI-Powered Agricultural Safety PWA for Indian Farmers**

> Built for the **AWS AI for Bharat Hackathon** | 10 AWS Services | Bilingual Hindi + English | Offline-Ready

---

## ⚠️ Branch Guide (For Judges)

| Branch | Purpose | Status |
|--------|---------|--------|
| **`deploy/s3-cloudfront`** | **Primary branch — all features, latest code** | ✅ Active |
| `main` | Vercel auto-deploy (legacy) | ⚠️ Older snapshot |
| `backup-before-rag` | Pre-RAG backup | 🗄️ Archive |
| `master` | Initial setup | 🗄️ Archive |

> **👉 Please review the `deploy/s3-cloudfront` branch.** It contains all implemented features, the AWS S3+CloudFront deployment, and the latest bug fixes.

---

## Live Demo

| Environment | URL |
|-------------|-----|
| **AWS CloudFront** (Primary) | **https://d2e3izstdqba08.cloudfront.net** |
| **Vercel** (Backup) | https://krishirakshak-ai.vercel.app |
| **GitHub** | https://github.com/Sameer786/krishirakshak-ai |

---

## Problem Statement

Agriculture employs **42% of India's workforce** (~263 million farmers), yet farming remains one of the most hazardous occupations:

- **Pesticide poisoning** kills an estimated 10,000+ Indian farmers annually
- **Heat stress** causes hundreds of deaths during peak summer farming
- **Machinery accidents** are rising as mechanization increases without safety training
- **Low digital literacy** makes text-heavy safety manuals ineffective
- **Poor connectivity** in rural areas means cloud-only solutions fail when needed most

Farmers need safety guidance that speaks their language, works on basic phones, and functions without internet.

---

## Our Solution

KrishiRakshak is a **Progressive Web App** that delivers AI-powered agricultural safety assistance in **Hindi and English**, designed for farmers using basic smartphones with intermittent connectivity.

### Features (All Working and Deployed)

| # | Feature | Description |
|---|---------|-------------|
| 1 | **Voice Safety Q&A** | Ask farming safety questions by voice. AI responds using RAG (17+ official govt docs from ICAR, FSSAI, NDMA, Insecticides Act, NFSM). Green verified badge shows source document and confidence %. Domain-restricted to agriculture only. Includes farm safety emergency coverage (snake bites, pesticide poisoning, heat stroke, machinery accidents, etc.). |
| 2 | **Hazard Detection** | Take a photo or upload an image. Rekognition identifies objects, Bedrock analyzes hazards, and results show bilingual severity cards (CRITICAL / HIGH / MEDIUM / LOW). 12 hardcoded fallback patterns for offline. |
| 3 | **JHA Safety Checklists** | 8 pre-built Job Hazard Analysis templates: Pesticide, Tractor, Harvesting, Irrigation, Chemical Storage, Livestock, Electrical, Heat Stress. Each with 10 bilingual steps, PPE badges, progress tracking, and Polly read-aloud. |
| 4 | **User Profile** | Name, state, district, primary crop, farm size, and language preference. Personalizes homepage greeting and crop-specific safety tips. Stored in localStorage for offline persistence. |
| 5 | **Government Schemes** | 8 real Indian govt schemes (PM-KISAN, PMFBY, KCC, Soil Health Card, PM Mandhan, PMKVY, eNAM, PM Krishi Sinchai). Search, category filters (Insurance/Credit/Subsidy/Training), bilingual cards with links to official portals. |
| 6 | **Offline Support** | Service worker caching, localStorage persistence, PWA installable on phone home screen. |
| 7 | **Amazon Polly TTS** | Hindi (Aditi voice, standard engine) + English (Kajal voice, neural engine). Emoji stripping, Hindi danda-to-period cleanup, markdown removal. Browser Web Speech API fallback for offline. |
| 8 | **Activity Logging** | Every query logged to DynamoDB (userId, timestamp, question, source, confidence) for analytics. |

---

## Architecture

```
                           KrishiRakshak Architecture
    ┌─────────────────────────────────────────────────────────────────┐
    │                        User's Phone                            │
    │  PWA (React 19.2 + Vite 7.3 + Tailwind CSS v4)               │
    │  Web Speech API (STT) | Polly/Browser TTS | localStorage      │
    └───────────────────────────┬─────────────────────────────────────┘
                                │ HTTPS
                                ▼
    ┌───────────────────────────────────────────────────────────────┐
    │  Amazon CloudFront (CDN + HTTPS)  →  Amazon S3 (Static PWA) │
    └───────────────────────────────────────────────────────────────┘
                                │
                                ▼
    ┌───────────────────────────────────────────────────────────────┐
    │                  Amazon API Gateway (REST)                    │
    │    POST /ask-safety-question                                  │
    │    POST /analyze-hazards                                      │
    │    POST /text-to-speech                                       │
    └──────┬──────────────────┬──────────────────┬─────────────────┘
           │                  │                  │
           ▼                  ▼                  ▼
    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
    │ Lambda:      │  │ Lambda:      │  │ Lambda:      │
    │ ask-safety   │  │ analyze-     │  │ text-to-     │
    │              │  │ hazards      │  │ speech       │
    └──────┬───────┘  └──────┬───────┘  └──────┬───────┘
           │                 │                  │
     ┌─────┴─────┐    ┌─────┴─────┐     ┌─────┴─────┐
     │ Bedrock   │    │Rekognition│     │  Polly    │
     │ Nova Lite │    │DetectLabels│    │ Hindi/EN  │
     │ + KB RAG  │    │ + Bedrock │     └─────┬─────┘
     └─────┬─────┘    └───────────┘           │
           │                                   │
     ┌─────┴─────────────────────────────────┐│
     │         Amazon DynamoDB                ││
     │    (krishirakshak-activity-log)        ││
     └────────────────────────────────────────┘│
```

---

## AWS Services (10 Total)

All deployed in **ap-south-1 (Mumbai)** region.

| # | Service | Purpose |
|---|---------|---------|
| 1 | **Amazon Bedrock** | Nova Lite model (`apac.amazon.nova-lite-v1:0`) via Converse API for Q&A and hazard analysis |
| 2 | **Bedrock Knowledge Bases** | RAG retrieval (KB ID: `PIMCAVAB8S`) with Titan Text Embeddings V2, OpenSearch Serverless, 17+ official documents |
| 3 | **Amazon Rekognition** | DetectLabels (20 labels, 50%+ confidence) for camera-based hazard identification |
| 4 | **AWS Lambda** (x3) | `krishirakshak-ask-safety`, `krishirakshak-analyze-hazards`, `text-to-speech` (Node.js 18, ES modules) |
| 5 | **Amazon API Gateway** | REST API (`jd7dn6udrf`) with 3 POST routes + CORS preflight |
| 6 | **Amazon S3** | Frontend static hosting (`krishirakshak-frontend`) + RAG document storage |
| 7 | **Amazon DynamoDB** | Activity logging table (`krishirakshak-activity-log`) |
| 8 | **Amazon CloudWatch** | Lambda monitoring, error tracking, and performance metrics |
| 9 | **Amazon CloudFront** | CDN with HTTPS, gzip compression, SPA routing via custom error responses |
| 10 | **Amazon Polly** | Text-to-speech: Hindi (Aditi/standard) + English (Kajal/neural with Aditi fallback) |

---

## RAG Implementation

KrishiRakshak uses **Bedrock Knowledge Bases** for Retrieval-Augmented Generation:

- **Knowledge Base ID**: `PIMCAVAB8S`
- **Embedding Model**: Amazon Titan Text Embeddings V2
- **Vector Store**: Amazon OpenSearch Serverless
- **Documents**: 17+ official publications from:
  - ICAR (Indian Council of Agricultural Research)
  - FSSAI (Food Safety and Standards Authority of India)
  - Insecticides Act, 1968
  - NDMA (National Disaster Management Authority)
  - NFSM (National Food Security Mission)
- **Retrieval**: Top-5 passages with confidence score > 0.4
- **Domain Restriction**: System prompt constrains AI to agricultural safety only
- **Farm Safety Emergencies**: Explicitly covers snake bites, scorpion stings, pesticide poisoning, heat stroke, machinery accidents, electrocution, drowning, and chemical burns — always provides first aid steps
- **Verified Badge**: Green badge shows source document name and confidence % when answer comes from RAG

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19.2, Vite 7.3, Tailwind CSS v4 |
| Routing | React Router v7 |
| HTTP Client | Axios |
| Platform | Progressive Web App (Service Worker + Manifest) |
| Voice Input | Web Speech API (SpeechRecognition) |
| Voice Output | Amazon Polly (primary) + Web Speech API (offline fallback) |
| AI Q&A | Amazon Bedrock Nova Lite + Knowledge Bases RAG |
| AI Vision | Amazon Rekognition DetectLabels + Bedrock analysis |
| Backend | AWS Lambda (Node.js 18) + API Gateway |
| Database | Amazon DynamoDB (activity logs) |
| Storage | localStorage (user data, offline cache) |
| CDN | Amazon CloudFront + S3 |

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Run Locally

```bash
git clone https://github.com/Sameer786/krishirakshak-ai.git
cd krishirakshak-ai
git checkout deploy/s3-cloudfront
npm install
```

Create a `.env` file:
```env
VITE_API_GATEWAY_URL=https://jd7dn6udrf.execute-api.ap-south-1.amazonaws.com/prod
VITE_DEMO_MODE=true
```

```bash
npm run dev
```

Open **http://localhost:5173** on your phone or browser.

> **No AWS account needed!** Set `VITE_DEMO_MODE=true` to run with built-in mock data for all features.

### Connect to AWS Backend

1. Set `VITE_DEMO_MODE=false` in `.env`
2. Ensure `VITE_API_GATEWAY_URL` points to your API Gateway
3. Deploy Lambda functions (see `lambda/` directory)

---

## Deployment

### Primary: AWS S3 + CloudFront (`deploy/s3-cloudfront` branch)

- **URL**: **https://d2e3izstdqba08.cloudfront.net**
- **Branch**: `deploy/s3-cloudfront` ← **This is the primary branch with all features**
- **S3 Bucket**: `krishirakshak-frontend` (ap-south-1)
- **CloudFront**: `E71T5EYFH0HUG`

```bash
git checkout deploy/s3-cloudfront
./scripts/deploy-s3.sh
```

The script builds with production env vars, syncs to S3, sets cache headers, and invalidates CloudFront.

> See [docs/AWS_S3_CLOUDFRONT_SETUP.md](./docs/AWS_S3_CLOUDFRONT_SETUP.md) for full setup details.

### Secondary: Vercel (main branch — older snapshot)

- **URL**: https://krishirakshak-ai.vercel.app
- **Branch**: `main` (auto-deploys on push)
- Set env vars in Vercel dashboard: `VITE_API_GATEWAY_URL`, `VITE_DEMO_MODE=false`
- **Note**: The `main` branch may not include all the latest features. Use `deploy/s3-cloudfront` for the complete experience.

### Backend (shared by both frontends)

- **API Gateway**: `https://jd7dn6udrf.execute-api.ap-south-1.amazonaws.com/prod`
- **3 Lambda functions**: `krishirakshak-ask-safety`, `krishirakshak-analyze-hazards`, `text-to-speech`
- CORS: `Access-Control-Allow-Origin: *`

---

## Future Roadmap (Planned)

> The following features are **not yet built** — they represent the product vision beyond the hackathon.

- **More Regional Languages** — Tamil, Telugu, Bengali, Marathi, Gujarati
- **React Native Mobile App** — Native Android/iOS with offline ML models
- **Knowledge Graph** — Neptune-based crop/pest/season safety relationships
- **Compliance Tracking** — PDF export of completed JHA checklists for audits
- **Weather-Based Alerts** — Real-time safety warnings based on local weather
- **Offline AI** — Cached LLM responses and edge inference for zero-connectivity areas
- **Community Features** — Farmer-to-farmer safety tip sharing
- **Government Scheme Eligibility Checker** — AI-powered eligibility matching based on user profile

---

## Project Structure

```
krishirakshak-ai/
├── requirements.md              # Kiro-generated requirements (full product vision)
├── design.md                    # Kiro-generated design (full architecture)
├── architecture.mermaid         # Architecture diagram (Mermaid — actual implementation)
├── README.md                    # This file
├── index.html                   # Vite entry point
├── package.json                 # Dependencies & scripts
├── .env.example                 # Environment variable template
│
├── src/                         # Frontend source code
│   ├── App.jsx                  # Root component with React Router
│   ├── index.css                # Global styles + Tailwind v4 @theme
│   ├── components/
│   │   ├── HomePage.jsx         # Dashboard with personalized greeting
│   │   ├── VoiceQA/             # Voice Safety Q&A (Bedrock + RAG)
│   │   │   ├── VoiceQA.jsx      # Main chat interface
│   │   │   ├── ChatBubble.jsx   # User/AI message bubbles
│   │   │   ├── QuestionChips.jsx # Suggestion tags
│   │   │   ├── ResponseCard.jsx # RAG-verified response card
│   │   │   └── LanguageToggle.jsx
│   │   ├── HazardDetection/     # Camera hazard detection (Rekognition)
│   │   │   ├── HazardDetection.jsx
│   │   │   ├── HazardResults.jsx
│   │   │   └── BottomSheet.jsx
│   │   ├── JHAChecklist/        # Job Hazard Analysis checklists
│   │   │   ├── JHAChecklist.jsx
│   │   │   └── templates.js     # 8 safety templates (bilingual)
│   │   ├── Profile/Profile.jsx  # User profile & preferences
│   │   ├── GovtSchemes/GovtSchemes.jsx  # Government schemes
│   │   └── common/              # Shared UI components
│   │       ├── Layout.jsx       # App shell + BottomNav
│   │       ├── BottomNav.jsx    # Bottom navigation bar
│   │       ├── Header.jsx       # Top header
│   │       └── ...
│   ├── hooks/                   # Custom React hooks
│   │   ├── useSpeechRecognition.js
│   │   ├── usePWAInstall.js
│   │   └── useOnlineStatus.js
│   └── services/                # API service layer
│
├── lambda/                      # AWS Lambda functions (Node.js 18, ES modules)
│   ├── ask-safety-question/     # Voice Q&A — Bedrock + KB RAG + DynamoDB
│   │   └── index.mjs
│   ├── analyze-hazards/         # Hazard Detection — Rekognition + Bedrock
│   │   └── index.mjs
│   └── text-to-speech/          # TTS — Amazon Polly (Hindi + English)
│       └── index.mjs
│
├── public/                      # Static assets
│   ├── manifest.json            # PWA manifest
│   └── sw.js                    # Service worker (offline caching)
│
├── scripts/
│   └── deploy-s3.sh             # Build + S3 sync + CloudFront invalidation
│
└── docs/                        # Project documentation
    ├── IMPLEMENTATION_DIAGRAM.md # 12 Mermaid diagrams
    ├── PROJECT_ARCHITECTURE.md  # Detailed technical architecture
    ├── AWS_S3_CLOUDFRONT_SETUP.md # Deployment guide
    └── POLLY_SETUP.md           # Amazon Polly integration guide
```

---

## Documentation

| Document | Description |
|----------|-------------|
| [requirements.md](./requirements.md) | Kiro-generated requirements — full product vision with 12 user stories |
| [design.md](./design.md) | Kiro-generated design — complete system architecture and design decisions |
| [architecture.mermaid](./architecture.mermaid) | Architecture diagram (Mermaid) — actual implemented AWS architecture |
| [Implementation Diagrams](./docs/IMPLEMENTATION_DIAGRAM.md) | 12 Mermaid diagrams: system architecture, AWS services, data flows, RAG pipeline |
| [Project Architecture](./docs/PROJECT_ARCHITECTURE.md) | Detailed technical architecture document |
| [AWS S3 + CloudFront Setup](./docs/AWS_S3_CLOUDFRONT_SETUP.md) | Full deployment guide |
| [Polly TTS Setup](./docs/POLLY_SETUP.md) | Amazon Polly integration guide |

---

## Team

**Team Gwonder**

**Ghazi Anwer** — GM-IT, Safe Lanes Consultants | 20+ years in IT & Safety | CISM, CEH certified

Built for the **AWS AI for Bharat Hackathon** by Team Gwonder.

---

## License

MIT

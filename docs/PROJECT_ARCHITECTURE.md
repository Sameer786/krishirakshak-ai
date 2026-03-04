# KrishiRakshak Project Architecture

> Generated: 2026-03-04 | Commit: `6eef804` on `main`

---

## 1. PROJECT OVERVIEW

### What It Does
KrishiRakshak (कृषि रक्षक — "Crop Protector") is an AI-powered Progressive Web App (PWA) for agricultural safety, targeting Indian farmers. Built for the **AWS AI for Bharat Hackathon**.

### Core Features
| Feature | Description |
|---------|-------------|
| **Voice Q&A** | Bilingual (Hindi/English) voice-based safety Q&A powered by Amazon Nova Lite via Bedrock. RAG-enhanced with Bedrock Knowledge Bases. |
| **Hazard Detection** | Camera-based hazard analysis using AWS Rekognition + Bedrock for intelligent safety assessments. |
| **JHA Checklists** | Job Hazard Analysis checklists for pesticide handling and tractor operation with TTS read-aloud. |
| **Offline Support** | Service Worker caching, localStorage persistence, mock data fallback when offline. |

### Target Users
Indian farmers with limited technical literacy. Mobile-first design (375px primary target). Bilingual: Hindi (primary) + English.

### Tech Stack
| Layer | Technology |
|-------|-----------|
| Framework | React 19.2 (plain JavaScript, .jsx files — NO TypeScript) |
| Build Tool | Vite 7.3 |
| Styling | Tailwind CSS v4 (with `@tailwindcss/vite` plugin, config in CSS `@theme`) |
| Routing | React Router v7.13 (BrowserRouter) |
| HTTP Client | Axios 1.13 |
| Markdown | react-markdown 10.1 |
| Backend | AWS Lambda (Node.js 18, ES Modules `.mjs`) |
| AI Model | Amazon Nova Lite (`apac.amazon.nova-lite-v1:0`) via Converse API |
| Image Analysis | AWS Rekognition (DetectLabels) + Bedrock (Nova Lite) |
| RAG | Amazon Bedrock Knowledge Bases (Knowledge Base ID: `PIMCAVAB8S`) |
| Activity Logging | Amazon DynamoDB (`krishirakshak-activity-log` table) |
| Deployment | Vercel (frontend), AWS Lambda Console (backend) |

### Frontend Dependencies (package.json)
```
dependencies:
  react: ^19.2.0
  react-dom: ^19.2.0
  react-router-dom: ^7.13.0
  axios: ^1.13.0
  react-markdown: ^10.1.0

devDependencies:
  @tailwindcss/vite: ^4.1.3
  tailwindcss: ^4.1.3
  vite: ^7.3.1
  @vitejs/plugin-react: ^4.5.2
  eslint: ^9.25.0
  eslint-plugin-react-hooks: ^5.2.0
  eslint-plugin-react-refresh: ^0.4.20
  @eslint/js: ^9.25.0
  globals: ^16.0.0
```

### Lambda Dependencies
**ask-safety-question:**
```
@aws-sdk/client-bedrock-runtime: ^3.700.0
@aws-sdk/client-bedrock-agent-runtime: ^3.600.0
@aws-sdk/client-dynamodb: ^3.600.0
```

**analyze-hazards:**
```
@aws-sdk/client-rekognition: ^3.700.0
@aws-sdk/client-bedrock-runtime: ^3.700.0
@aws-sdk/client-dynamodb: ^3.600.0
```

---

## 2. FOLDER STRUCTURE

```
krishirakshak-pwa/
├── public/                          # Static assets served as-is
│   ├── manifest.json                # PWA manifest (app name, icons, theme)
│   ├── sw.js                        # Service Worker (offline caching)
│   ├── icon-192.svg                 # App icon 192x192
│   ├── icon-512.svg                 # App icon 512x512
│   └── vite.svg                     # Vite logo (unused)
├── src/                             # Frontend source code
│   ├── main.jsx                     # React entry point + SW registration
│   ├── App.jsx                      # Router setup (4 routes)
│   ├── App.css                      # Minimal app CSS (placeholder)
│   ├── index.css                    # Global styles, Tailwind theme, animations
│   ├── components/                  # React components
│   │   ├── HomePage.jsx             # Home page with CTA, features, tips, activity
│   │   ├── VoiceQA/                 # Voice Q&A feature
│   │   │   ├── VoiceQA.jsx          # Main chat interface (WhatsApp-style)
│   │   │   ├── ChatBubble.jsx       # Individual Q&A bubble with RAG badge
│   │   │   ├── LanguageToggle.jsx   # Hi/En language switcher
│   │   │   ├── QuestionChips.jsx    # Suggested question chips
│   │   │   ├── ResponseCard.jsx     # Legacy response card (unused in chat mode)
│   │   │   └── ResponseHistory.jsx  # Legacy response list (unused in chat mode)
│   │   ├── HazardDetection/         # Camera hazard detection feature
│   │   │   ├── HazardDetection.jsx  # Camera UI, capture, analysis flow
│   │   │   ├── HazardResults.jsx    # Results display with severity cards
│   │   │   └── BottomSheet.jsx      # Camera/upload selection modal
│   │   ├── JHAChecklist/            # Safety checklists feature
│   │   │   ├── JHAChecklist.jsx     # Template selection + checklist UI
│   │   │   └── templates.js         # Pesticide + Tractor checklist data
│   │   └── common/                  # Shared UI components
│   │       ├── Layout.jsx           # Root layout (Header + content + BottomNav)
│   │       ├── BottomNav.jsx        # Bottom tab navigation (4 tabs)
│   │       ├── Header.jsx           # Sticky header with logo + online status
│   │       ├── ErrorBoundary.jsx    # React error boundary
│   │       ├── OfflineIndicator.jsx # Online/offline status pill
│   │       ├── LoadingSpinner.jsx   # Animated loader (3 sizes)
│   │       ├── SeverityBadge.jsx    # CRITICAL/HIGH/MEDIUM/LOW badge
│   │       └── Button.jsx           # Reusable button with variants
│   ├── hooks/                       # Custom React hooks
│   │   ├── useOnlineStatus.js       # Navigator online/offline tracking
│   │   ├── usePWAInstall.js         # PWA install prompt handling
│   │   ├── useSpeechRecognition.js  # Web Speech API (voice input)
│   │   └── useSpeechSynthesis.js    # Web Speech API (text-to-speech)
│   ├── services/                    # API and data services
│   │   ├── aws/
│   │   │   ├── config.js            # API URL, region, timeouts, demo mode
│   │   │   ├── bedrockService.js    # Voice Q&A API calls (+ RAG field extraction)
│   │   │   ├── rekognitionService.js# Hazard detection API calls (+ mock scenarios)
│   │   │   └── mockData.js          # 30+ mock Q&A pairs in Hindi/English
│   │   ├── api/
│   │   │   └── mockResponses.js     # Re-exports from aws/mockData (compat)
│   │   └── offline/
│   │       ├── cacheService.js      # Q&A offline cache (50 items, 30-day expiry)
│   │       └── storageService.js    # Unified localStorage wrapper
│   └── utils/                       # Utility functions
│       ├── activityTracker.js       # Recent activity tracking (localStorage)
│       ├── analytics.js             # Console-based analytics logging
│       └── imageUtils.js            # Image compression/validation
├── lambda/                          # AWS Lambda function source code
│   ├── ask-safety-question/         # Voice Q&A Lambda
│   │   ├── index.mjs               # Handler: RAG + Bedrock + DynamoDB logging
│   │   ├── package.json             # Dependencies
│   │   └── package-lock.json        # Lockfile
│   ├── analyze-hazards/             # Hazard detection Lambda
│   │   ├── index.mjs               # Handler: Rekognition + Bedrock + DynamoDB
│   │   ├── package.json             # Dependencies
│   │   └── package-lock.json        # Lockfile
│   ├── ask-safety-question.zip      # Deployment zip (3.6 MB)
│   └── analyze-hazards.zip          # Deployment zip (3.7 MB)
├── docs/                            # Documentation
│   └── plans/                       # Design and implementation plans
├── package.json                     # Root project config
├── vite.config.js                   # Vite build configuration
├── vercel.json                      # Vercel deployment config
├── eslint.config.js                 # ESLint config
├── index.html                       # HTML entry point
└── CLAUDE.md                        # Claude Code instructions
```

---

## 3. FRONTEND ARCHITECTURE

### Framework & Build Tool
- **React 19.2** with functional components and hooks (no class components except ErrorBoundary)
- **Vite 7.3** for development server and production builds
- **No TypeScript** — all files use `.jsx` / `.js` extensions

### Router Setup (src/App.jsx)
| Path | Component | Description |
|------|-----------|-------------|
| `/` | `HomePage` | Landing page with voice CTA, feature cards, tips, recent activity |
| `/voice-qa` | `VoiceQA` | WhatsApp-style bilingual chat with AI |
| `/hazard-detection` | `HazardDetection` | Camera capture and hazard analysis |
| `/jha-checklist` | `JHAChecklist` | Safety checklist templates |

All routes are wrapped in `<Layout>` (Header + BottomNav) and per-route `<ErrorBoundary>`.

### Component Hierarchy
```
<BrowserRouter>
  <Layout>
    <Header />                    ← sticky, shows logo, online status, DEMO badge
    <Outlet />                    ← route content rendered here
      ├── HomePage                ← voice CTA, feature grid, tips, recent activity
      ├── VoiceQA                 ← chat interface
      │   ├── LanguageToggle      ← Hi/En switcher
      │   ├── QuestionChips       ← suggested questions
      │   └── ChatBubble[]        ← individual Q&A pairs with RAG badge
      ├── HazardDetection         ← camera/upload flow
      │   ├── BottomSheet         ← camera/upload selection modal
      │   └── HazardResults       ← results with severity cards
      └── JHAChecklist            ← template selection + step-by-step checklist
    <BottomNav />                 ← 4 tab icons: Home, Voice, Camera, Checklist
  </Layout>
</BrowserRouter>
```

### State Management
No global state management library. All state is component-local:

| Approach | Where Used |
|----------|-----------|
| `useState` | All components (local UI state) |
| `useCallback` / `useMemo` | Performance-sensitive handlers and derived state |
| `useEffect` | Side effects (API calls, localStorage sync, speech) |
| `useRef` | Mutable refs for camera, audio, mounted-check |
| `localStorage` | Persistent data (see localStorage Keys below) |

### localStorage Keys
| Key | Used By | Purpose |
|-----|---------|---------|
| `krishirakshak_voice_history` | VoiceQA | Chat history (max 20 entries) |
| `krishirakshak_lang` | VoiceQA | Selected language (hi-IN / en-IN) |
| `krishirakshak_detections` | HazardDetection | Saved hazard scans (last 3) |
| `krishirakshak_jha_progress` | JHAChecklist | In-progress checklist state |
| `krishirakshak_qa_cache` | cacheService | Offline Q&A cache (max 50, 30-day expiry) |
| `krishirakshak_recent_activity` | activityTracker | Recent activity feed (max 10) |
| `kr_checklist_*` | storageService | Unified storage (checklist, QA, hazard, settings) |

### Styling Approach
- **Tailwind CSS v4** via `@tailwindcss/vite` plugin
- **No tailwind.config.js** — theme defined in `src/index.css` using `@theme` directive
- **Custom theme colors**: `--color-primary: #16a34a`, `--color-primary-dark: #15803d`, plus earth, sky, danger, warning palettes
- **Inline styles** used sparingly (RAG Verified badge in ChatBubble.jsx)
- **CSS animations**: typing dots, mic pulse, page fade-in, scan line, severity pulse, success pop, button ripple
- **Mobile-first**: `max-w-md mx-auto` container, 375px primary target

### PWA Configuration
- **manifest.json**: `display: standalone`, `theme_color: #16a34a`, `start_url: /`, SVG icons at 192 and 512
- **Service Worker** (`public/sw.js`):
  - Cache name: `krishirakshak-v1`
  - Static assets: cache-first strategy
  - API calls: network-first strategy
  - Navigation: network-first with `/index.html` fallback
  - Precaches: `/`, `/index.html`, `/manifest.json`, icons
- **SW Registration** in `src/main.jsx` with update detection

### Environment Variables
| Variable | Purpose | Default |
|----------|---------|---------|
| `VITE_API_GATEWAY_URL` | API Gateway base URL | (none — enables demo mode) |
| `VITE_AWS_REGION` | AWS region | `ap-south-1` |
| `VITE_DEMO_MODE` | Force demo/mock mode | `false` |

**Local `.env`**: `VITE_DEMO_MODE=true` (uses mock data locally)
**Vercel env vars**: `VITE_API_GATEWAY_URL=https://jd7dn6udrf.execute-api.ap-south-1.amazonaws.com/prod`, `VITE_DEMO_MODE=false`

---

## 4. API LAYER

### How the Frontend Calls the Backend
- **HTTP client**: Axios with configurable timeout (15s default) and retry logic (max 3 attempts, exponential backoff)
- **Service files**: `src/services/aws/bedrockService.js` (Q&A) and `src/services/aws/rekognitionService.js` (hazard detection)
- **Demo mode**: When `VITE_DEMO_MODE=true` or no `VITE_API_GATEWAY_URL`, returns mock data with simulated delay
- **Greeting interception**: Common greetings (hello, namaste, etc.) are handled locally without API call

### API Endpoints

#### 1. POST `/ask-safety-question`
**Called by**: `bedrockService.js → callApiWithRetry()`
**Full URL**: `${VITE_API_GATEWAY_URL}/ask-safety-question`

**Request**:
```json
{
  "question": "कीटनाशक का सुरक्षित उपयोग कैसे करें?",
  "language": "hi",
  "context": { "source": "pwa" }
}
```

**Response (200)**:
```json
{
  "answer": "कीटनाशक का सुरक्षित उपयोग...",
  "language": "hi",
  "sources": ["Insecticides Act 1968", "WHO Pesticide Classification"],
  "confidence": 0.85,
  "source": "bedrock-nova-lite",
  "timestamp": "2026-03-04T10:30:00.000Z",
  "isRAG": true,
  "ragSources": "pesticide safety guidelines, insecticides act 1968",
  "ragConfidence": 92
}
```

**Error responses**: 400 (missing/invalid question), 429 (throttled, Retry-After: 5), 500 (server error)

#### 2. POST `/analyze-hazards`
**Called by**: `rekognitionService.js → analyzeHazards()`
**Full URL**: `${VITE_API_GATEWAY_URL}/analyze-hazards`

**Request**:
```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQ..."
}
```

**Response (200)**:
```json
{
  "success": true,
  "hazards": [
    {
      "severity": "HIGH",
      "confidence": 0.95,
      "description": "Chemical storage hazard",
      "recommendation": "Wear PPE. Label all containers.",
      "hindiDescription": "रासायनिक भंडारण खतरा",
      "hindiRecommendation": "PPE पहनें। सभी कंटेनरों पर लेबल लगाएं।",
      "name": "Chemical storage hazard",
      "name_hi": "रासायनिक भंडारण खतरा"
    }
  ],
  "overallRisk": "HIGH",
  "hazardCount": 2,
  "detectedLabels": [
    { "name": "Container", "confidence": 98.5, "categories": ["Objects"], "parents": [] }
  ],
  "labels": [...],
  "source": "rekognition-nova-hybrid",
  "analyzedAt": "2026-03-04T10:30:00.000Z"
}
```

**Error responses**: 400 (missing/invalid image), 413 (image too large, >5MB), 429 (throttled), 500 (server error)

### Error Handling Approach
1. **Retry with backoff**: Up to 3 retries with exponential backoff (1s, 2s, 4s max 8s)
2. **Bilingual error messages**: Hindi/English based on selected language
3. **Error categories**: network, timeout, server — each with distinct user-facing message
4. **Graceful degradation**: Demo mode fallback, offline cache search, mock data

---

## 5. LAMBDA FUNCTIONS

### Lambda 1: `ask-safety-question`
**Location**: `lambda/ask-safety-question/index.mjs`
**Runtime**: Node.js 18, ES Modules

**What it does**: Answers agricultural safety questions using RAG (Bedrock Knowledge Bases) when official documents are available, falling back to Amazon Nova Lite general knowledge. Includes domain restriction to decline non-agriculture questions. Logs activity to DynamoDB.

**AWS SDK Imports & Clients**:
| Import | Client Variable | Service |
|--------|----------------|---------|
| `BedrockRuntimeClient`, `ConverseCommand` | `client` | Amazon Bedrock (Nova Lite) |
| `BedrockAgentRuntimeClient`, `RetrieveCommand` | `ragClient` | Bedrock Knowledge Bases |
| `DynamoDBClient`, `PutItemCommand` | `dynamoClient` | DynamoDB activity logging |

**Flow**:
1. Parse and validate question (max 1000 chars)
2. Determine language (hi/en)
3. Search Knowledge Base (`PIMCAVAB8S`) for relevant documents
4. If RAG results found (score > 0.4): use document-grounded prompt
5. If no RAG results: use existing system prompt (unchanged)
6. Both paths include domain restriction (declines non-agriculture questions)
7. Call Bedrock Converse API with Amazon Nova Lite
8. Extract sources and estimate confidence
9. Log to DynamoDB (fire-and-forget)
10. Return answer with RAG metadata

**Key Functions**:
- `searchKnowledgeBase(query)` — Retrieves from Knowledge Base, filters by score > 0.4
- `logActivity(feature, question, source, confidence)` — DynamoDB fire-and-forget logging
- `extractSources(answer)` — Keyword-based source attribution
- `estimateConfidence(answer, question)` — Heuristic confidence scoring (0.75-0.95)

**Dependencies**: `@aws-sdk/client-bedrock-runtime`, `@aws-sdk/client-bedrock-agent-runtime`, `@aws-sdk/client-dynamodb`

---

### Lambda 2: `analyze-hazards`
**Location**: `lambda/analyze-hazards/index.mjs`
**Runtime**: Node.js 18, ES Modules

**What it does**: Analyzes farm photos for safety hazards using a two-step hybrid approach: Rekognition detects objects/labels, then Bedrock analyzes the labels for agricultural hazards with bilingual descriptions. Falls back to hardcoded pattern matching if Bedrock fails.

**AWS SDK Imports & Clients**:
| Import | Client Variable | Service |
|--------|----------------|---------|
| `RekognitionClient`, `DetectLabelsCommand` | `rekognitionClient` | AWS Rekognition |
| `BedrockRuntimeClient`, `ConverseCommand` | `bedrockClient` | Amazon Bedrock (Nova Lite) |
| `DynamoDBClient`, `PutItemCommand` | `dynamoClient` | DynamoDB activity logging |

**Flow**:
1. Parse and validate base64 image (max 5MB, min 100 bytes)
2. Step 1: Rekognition `DetectLabels` (max 20 labels, min 50% confidence)
3. Step 2: Send labels to Bedrock for intelligent hazard analysis (25s timeout)
4. Step 3: Map Bedrock JSON response to frontend-compatible format
5. Step 4 (fallback): If Bedrock fails/times out, use hardcoded `HAZARD_PATTERNS` matching
6. Log to DynamoDB (fire-and-forget in both success and fallback paths)
7. Return hazards with bilingual descriptions

**Key Functions**:
- `analyzeWithBedrock(rekognitionLabels)` — Sends label list to Nova Lite, parses JSON response
- `fallbackAnalysis(detectedLabels)` — 12 hardcoded hazard patterns (fire, chemical, PPE, etc.)
- `logActivity(feature, question, source, confidence)` — DynamoDB fire-and-forget logging
- `has(labelSet, ...targets)` — Fuzzy label matching helper

**Dependencies**: `@aws-sdk/client-rekognition`, `@aws-sdk/client-bedrock-runtime`, `@aws-sdk/client-dynamodb`

---

## 6. AWS SERVICES USED

| Service | Region | Resource ID/Name | How Used |
|---------|--------|-----------------|----------|
| **Amazon Bedrock** | `ap-south-1` | Model: `apac.amazon.nova-lite-v1:0` | Converse API for Q&A answers and hazard analysis |
| **Bedrock Knowledge Bases** | `ap-south-1` | KB ID: `PIMCAVAB8S` | RAG retrieval for official agricultural documents |
| **AWS Rekognition** | `ap-south-1` | (default) | DetectLabels for image object detection |
| **Amazon DynamoDB** | `ap-south-1` | Table: `krishirakshak-activity-log` | Activity logging (userId + timestamp keys) |
| **AWS Lambda** | `ap-south-1` | `ask-safety-question` | Voice Q&A handler |
| **AWS Lambda** | `ap-south-1` | `analyze-hazards` | Hazard detection handler |
| **API Gateway** | `ap-south-1` | `jd7dn6udrf` | REST API routing to Lambda functions |
| **S3** | `ap-south-1` | (behind Knowledge Base) | Stores RAG source documents |

---

## 7. BUILD & DEPLOYMENT

### Build
```bash
npm run build        # Runs: vite build
```
**Output folder**: `dist/`
**Output files**: `index.html`, `assets/index-*.css` (~44 KB), `assets/index-*.js` (~491 KB)

### Frontend Deployment (Vercel)
- **Config**: `vercel.json` with SPA rewrites and cache-control headers
- **URL**: Deployed automatically on push to `main`
- **Environment variables**: Set in Vercel dashboard
  - `VITE_API_GATEWAY_URL=https://jd7dn6udrf.execute-api.ap-south-1.amazonaws.com/prod`
  - `VITE_DEMO_MODE=false`

### Backend Deployment (AWS Lambda Console)
- **Method**: Manual zip upload via AWS Console
- **Zips**: `lambda/ask-safety-question.zip` (3.6 MB), `lambda/analyze-hazards.zip` (3.7 MB)
- **Build zips**:
  ```bash
  cd lambda/ask-safety-question && npm install
  powershell Compress-Archive -Path * -DestinationPath ../ask-safety-question.zip -Force
  cd ../analyze-hazards && npm install
  powershell Compress-Archive -Path * -DestinationPath ../analyze-hazards.zip -Force
  ```

### Git Branch Strategy
| Branch | Purpose |
|--------|---------|
| `main` | Production branch — all commits go here directly |
| `backup-before-rag` | Snapshot of working code before RAG changes |
| `claude/laughing-brown` | Claude Code worktree branch (merged to main) |
| `master` | Legacy (unused) |

**Workflow**: Commit on `claude/laughing-brown` → merge to `main` → push origin main

### vercel.json
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "headers": [
    { "source": "/sw.js", "headers": [{ "key": "Cache-Control", "value": "no-cache" }] },
    { "source": "/manifest.json", "headers": [{ "key": "Cache-Control", "value": "no-cache" }] }
  ]
}
```

---

## 8. KEY CONFIGURATION FILES

### package.json (root)
- React 19, Vite 7, Tailwind v4, Axios, react-markdown
- Scripts: `dev`, `build`, `lint`, `preview`

### vite.config.js
```js
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
export default { plugins: [react(), tailwindcss()] }
```

### vercel.json
- SPA rewrites (all routes to /index.html)
- No-cache headers for sw.js and manifest.json

### .env (local development)
```
VITE_DEMO_MODE=true
```

### .env (Vercel production)
```
VITE_API_GATEWAY_URL=https://jd7dn6udrf.execute-api.ap-south-1.amazonaws.com/prod
VITE_DEMO_MODE=false
```

### public/manifest.json
```json
{
  "short_name": "KrishiRakshak",
  "name": "KrishiRakshak - Agricultural Safety",
  "display": "standalone",
  "theme_color": "#16a34a",
  "background_color": "#f0fdf4",
  "start_url": "/",
  "icons": [
    { "src": "/icon-192.svg", "sizes": "192x192", "type": "image/svg+xml" },
    { "src": "/icon-512.svg", "sizes": "512x512", "type": "image/svg+xml" }
  ]
}
```

### eslint.config.js
- ESLint 9 flat config with React hooks and refresh plugins
- Ignores `dist/`, allows unused UPPER_CASE variables

---

## 9. CURRENT KNOWN ISSUES

### No TODO/FIXME Comments
The codebase has zero TODO, FIXME, HACK, or XXX comments.

### Hardcoded Values That Should Be Environment Variables
| Value | Location | Should Be |
|-------|----------|-----------|
| `"PIMCAVAB8S"` | `ask-safety-question/index.mjs:15` | `process.env.KNOWLEDGE_BASE_ID` |
| `"krishirakshak-activity-log"` | Both Lambda `index.mjs` files | `process.env.DYNAMODB_TABLE_NAME` |
| `"web-user"` | Both Lambda `index.mjs` files | Dynamic user ID or `process.env.DEFAULT_USER_ID` |
| `"ap-south-1"` | RAG client + DynamoDB client in both Lambdas | Uses `REGION` constant already defined |

### Missing Error Handling
| Issue | Location |
|-------|----------|
| `logActivity()` is fire-and-forget — Lambda may return before DynamoDB write completes | Both Lambda handlers |
| No input sanitization for XSS in `question` field before rendering | VoiceQA/ChatBubble (mitigated by React's default escaping) |
| `searchKnowledgeBase()` silently returns null on errors — no monitoring/alerting | ask-safety-question Lambda |
| Service Worker has no versioned cache-busting strategy beyond manual `krishirakshak-v1` | public/sw.js |

### Other Observations
- **Legacy components**: `ResponseCard.jsx` and `ResponseHistory.jsx` exist but are unused (replaced by ChatBubble in WhatsApp-style redesign)
- **Mock data duplication**: `mockResponses.js` re-exports from `mockData.js` for backward compatibility
- **No automated tests**: No test files exist — hackathon project prioritized features over testing
- **PWA icons are SVG only**: Some older Android devices may not support SVG icons in manifests
- **`context` field in API request body**: Sent as `{ source: "pwa" }` but not used by Lambda

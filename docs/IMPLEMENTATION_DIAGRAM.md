# KrishiRakshak — Implementation Diagrams

> **10 AWS Services** | **8 Features** | **3 Lambda Functions** | **17+ RAG Documents**

---

## 1. System Architecture (High-Level)

```mermaid
graph TB
    subgraph USER["👨‍🌾 Farmer's Phone"]
        PWA["PWA<br/>React 19.2 + Vite 7.3<br/>Tailwind CSS v4"]
        SW["Service Worker<br/>Offline Cache"]
        LS["localStorage<br/>Profile, History, Cache"]
        WSA["Web Speech API<br/>Voice Input (STT)"]
    end

    subgraph CDN["☁️ Content Delivery"]
        CF["Amazon CloudFront<br/>CDN + HTTPS + Gzip<br/>E71T5EYFH0HUG"]
        S3F["Amazon S3<br/>krishirakshak-frontend<br/>Static PWA Hosting"]
    end

    subgraph API["🔌 API Layer"]
        APIGW["Amazon API Gateway<br/>REST API (jd7dn6udrf)<br/>3 POST Routes + CORS"]
    end

    subgraph COMPUTE["⚡ Compute Layer"]
        L1["Lambda: krishirakshak-ask-safety<br/>Node.js 18 | ES Modules"]
        L2["Lambda: krishirakshak-analyze-hazards<br/>Node.js 18 | ES Modules"]
        L3["Lambda: text-to-speech<br/>Node.js 18 | ES Modules"]
    end

    subgraph AI["🧠 AI Services"]
        BK["Amazon Bedrock<br/>Nova Lite<br/>apac.amazon.nova-lite-v1:0"]
        KB["Bedrock Knowledge Bases<br/>KB: PIMCAVAB8S<br/>17+ Govt Documents"]
        RK["Amazon Rekognition<br/>DetectLabels<br/>20 labels, 50%+ confidence"]
        PL["Amazon Polly<br/>Hindi: Aditi (standard)<br/>English: Kajal (neural)"]
    end

    subgraph DATA["💾 Data Layer"]
        DDB["Amazon DynamoDB<br/>krishirakshak-activity-log<br/>userId + timestamp"]
        S3D["Amazon S3<br/>RAG Document Store<br/>ICAR, FSSAI, NDMA docs"]
        OS["OpenSearch Serverless<br/>Vector Embeddings<br/>Titan Text V2"]
    end

    subgraph MONITOR["📊 Monitoring"]
        CW["Amazon CloudWatch<br/>Lambda Logs & Metrics"]
    end

    PWA -->|HTTPS| CF
    CF --> S3F
    PWA -->|REST API| APIGW
    WSA -.->|Voice Input| PWA

    APIGW -->|/ask-safety-question| L1
    APIGW -->|/analyze-hazards| L2
    APIGW -->|/text-to-speech| L3

    L1 -->|Converse API| BK
    L1 -->|RetrieveCommand| KB
    L1 -->|PutItem| DDB
    L2 -->|DetectLabels| RK
    L2 -->|Converse API| BK
    L2 -->|PutItem| DDB
    L3 -->|SynthesizeSpeech| PL

    KB -->|Vector Search| OS
    KB -->|Source Docs| S3D

    L1 -.->|Logs| CW
    L2 -.->|Logs| CW
    L3 -.->|Logs| CW

    style USER fill:#f0fdf4,stroke:#16a34a,stroke-width:2px
    style CDN fill:#eff6ff,stroke:#2563eb,stroke-width:2px
    style API fill:#fefce8,stroke:#ca8a04,stroke-width:2px
    style COMPUTE fill:#fdf2f8,stroke:#db2777,stroke-width:2px
    style AI fill:#f5f3ff,stroke:#7c3aed,stroke-width:2px
    style DATA fill:#fff7ed,stroke:#ea580c,stroke-width:2px
    style MONITOR fill:#f0f9ff,stroke:#0284c7,stroke-width:2px
```

---

## 2. AWS Services Map (10 Total)

```mermaid
graph LR
    subgraph REGION["ap-south-1 (Mumbai)"]
        direction TB

        subgraph FRONTEND_INFRA["Frontend Infrastructure"]
            S3["1️⃣ Amazon S3<br/>krishirakshak-frontend"]
            CF["2️⃣ Amazon CloudFront<br/>E71T5EYFH0HUG"]
        end

        subgraph API_COMPUTE["API & Compute"]
            APIGW["3️⃣ API Gateway<br/>jd7dn6udrf"]
            LAM["4️⃣ AWS Lambda ×3<br/>Node.js 18"]
        end

        subgraph AI_ML["AI/ML Services"]
            BED["5️⃣ Amazon Bedrock<br/>Nova Lite Model"]
            BEDKB["6️⃣ Bedrock KB<br/>PIMCAVAB8S"]
            REK["7️⃣ Amazon Rekognition<br/>DetectLabels"]
            POL["8️⃣ Amazon Polly<br/>Aditi + Kajal"]
        end

        subgraph DATA_STORE["Data & Storage"]
            DDB["9️⃣ Amazon DynamoDB<br/>Activity Logging"]
        end

        subgraph OPS["Operations"]
            CWL["🔟 Amazon CloudWatch<br/>Logs & Metrics"]
        end
    end

    style REGION fill:#f8fafc,stroke:#334155,stroke-width:3px
    style FRONTEND_INFRA fill:#dbeafe,stroke:#2563eb
    style API_COMPUTE fill:#fef9c3,stroke:#ca8a04
    style AI_ML fill:#ede9fe,stroke:#7c3aed
    style DATA_STORE fill:#ffedd5,stroke:#ea580c
    style OPS fill:#e0f2fe,stroke:#0284c7
```

---

## 3. Frontend Component Tree

```mermaid
graph TD
    BR["BrowserRouter"]
    EB["ErrorBoundary<br/>(key=pathname)"]
    LO["Layout"]
    HD["Header<br/>Logo + Online Status"]
    BN["BottomNav<br/>6 Tabs"]
    OT["Outlet<br/>(Route Content)"]

    BR --> EB --> LO
    LO --> HD
    LO --> OT
    LO --> BN

    subgraph ROUTES["📱 6 Routes"]
        HP["/ HomePage<br/>Greeting, Tips, Features"]
        VQ["/voice-qa VoiceQA<br/>Chat Interface"]
        HZ["/hazard-detection<br/>HazardDetection<br/>Camera + Analysis"]
        JC["/jha-checklist<br/>JHAChecklist<br/>8 Templates"]
        GS["/govt-schemes<br/>GovtSchemes<br/>8 Schemes"]
        PR["/profile<br/>Profile<br/>User Settings"]
    end

    OT --> HP
    OT --> VQ
    OT --> HZ
    OT --> JC
    OT --> GS
    OT --> PR

    subgraph VQ_CHILDREN["VoiceQA Children"]
        LT["LanguageToggle"]
        QC["QuestionChips"]
        CB["ChatBubble[]<br/>RAG Badge"]
    end
    VQ --> LT
    VQ --> QC
    VQ --> CB

    subgraph HZ_CHILDREN["HazardDetection Children"]
        BS["BottomSheet<br/>Camera/Upload"]
        HR["HazardResults<br/>Severity Cards"]
    end
    HZ --> BS
    HZ --> HR

    style ROUTES fill:#f0fdf4,stroke:#16a34a,stroke-width:2px
    style VQ_CHILDREN fill:#eff6ff,stroke:#2563eb
    style HZ_CHILDREN fill:#fef3c7,stroke:#d97706
```

---

## 4. Feature Data Flows

### 4a. Voice Safety Q&A (RAG-Powered)

```mermaid
sequenceDiagram
    participant F as 👨‍🌾 Farmer
    participant P as PWA (VoiceQA)
    participant W as Web Speech API
    participant AG as API Gateway
    participant L1 as Lambda: ask-safety
    participant KB as Bedrock KB
    participant OS as OpenSearch
    participant BK as Bedrock Nova Lite
    participant DB as DynamoDB
    participant PL as Polly Lambda

    F->>W: 🎤 Speaks question
    W->>P: Transcribed text
    P->>AG: POST /ask-safety-question
    AG->>L1: Invoke Lambda

    Note over L1: Step 1: RAG Retrieval
    L1->>KB: RetrieveCommand(query)
    KB->>OS: Vector similarity search
    OS-->>KB: Top-5 passages (score > 0.4)
    KB-->>L1: RAG context + sources

    Note over L1: Step 2: AI Answer
    L1->>BK: ConverseCommand<br/>(RAG context + question)
    BK-->>L1: AI response

    Note over L1: Step 3: Log Activity
    L1->>DB: PutItem (fire & forget)

    L1-->>AG: JSON response<br/>(answer, sources, confidence, isRAG)
    AG-->>P: 200 OK

    Note over P: Display chat bubble<br/>+ RAG Verified badge ✅

    P->>AG: POST /text-to-speech
    AG->>PL: Invoke Lambda
    PL-->>AG: Audio (base64 MP3)
    AG-->>P: Audio data
    P->>F: 🔊 Speaks answer
```

### 4b. Hazard Detection (Vision AI)

```mermaid
sequenceDiagram
    participant F as 👨‍🌾 Farmer
    participant P as PWA (HazardDetection)
    participant AG as API Gateway
    participant L2 as Lambda: analyze-hazards
    participant RK as Rekognition
    participant BK as Bedrock Nova Lite
    participant DB as DynamoDB

    F->>P: 📷 Takes photo / uploads image
    P->>P: Compress to base64 (< 5MB)
    P->>AG: POST /analyze-hazards
    AG->>L2: Invoke Lambda

    Note over L2: Step 1: Object Detection
    L2->>RK: DetectLabels<br/>(20 labels, 50%+ confidence)
    RK-->>L2: Labels: [Tractor, Person, Field...]

    Note over L2: Step 2: AI Hazard Analysis
    L2->>BK: ConverseCommand<br/>(labels → hazard assessment)
    BK-->>L2: Hazard JSON<br/>(severity, recommendations)

    alt Bedrock fails/timeout
        Note over L2: Fallback: 12 hardcoded<br/>hazard patterns
        L2->>L2: Pattern matching<br/>(fire, chemical, PPE...)
    end

    Note over L2: Step 3: Log Activity
    L2->>DB: PutItem (fire & forget)

    L2-->>AG: JSON<br/>(hazards[], overallRisk, labels)
    AG-->>P: 200 OK

    Note over P: Display severity cards<br/>🔴 CRITICAL  🟠 HIGH<br/>🟡 MEDIUM  🟢 LOW

    P->>F: Bilingual hazard cards<br/>Hindi + English
```

### 4c. Text-to-Speech (Amazon Polly)

```mermaid
sequenceDiagram
    participant P as PWA
    participant AG as API Gateway
    participant L3 as Lambda: text-to-speech
    participant PL as Amazon Polly
    participant BR as Browser Audio

    P->>AG: POST /text-to-speech<br/>{text, language}
    AG->>L3: Invoke Lambda

    Note over L3: cleanTextForSpeech()<br/>Strip emojis (11 ranges)<br/>Hindi danda → period<br/>Remove markdown

    alt language = "hi"
        L3->>PL: SynthesizeSpeech<br/>Voice: Aditi | Engine: standard
    else language = "en"
        L3->>PL: SynthesizeSpeech<br/>Voice: Kajal | Engine: neural
        alt Kajal fails
            L3->>PL: Fallback → Aditi | Engine: standard
        end
    end

    PL-->>L3: Audio stream (MP3)
    L3-->>AG: {audioContent: base64, format: mp3}
    AG-->>P: 200 OK

    P->>BR: Play audio via Audio API

    alt API unavailable (offline)
        P->>BR: Browser Web Speech API<br/>TTS fallback
    end
```

---

## 5. JHA Safety Checklists (8 Templates)

```mermaid
graph LR
    subgraph TEMPLATES["📋 8 JHA Templates"]
        T1["🧪 Pesticide<br/>Handling"]
        T2["🚜 Tractor<br/>Operation"]
        T3["🌾 Harvesting<br/>Safety"]
        T4["💧 Irrigation<br/>Safety"]
        T5["🧴 Chemical<br/>Storage"]
        T6["🐄 Livestock<br/>Handling"]
        T7["⚡ Electrical<br/>Safety"]
        T8["🌡️ Heat Stress<br/>Prevention"]
    end

    subgraph EACH["Each Template Has"]
        ST["10 Bilingual Steps<br/>Hindi + English"]
        PP["PPE Badges<br/>Required Equipment"]
        PR["Progress Tracking<br/>Step-by-step"]
        PO["Polly Read-Aloud<br/>🔊 Hindi/English TTS"]
    end

    T1 --> EACH
    T2 --> EACH
    T3 --> EACH
    T4 --> EACH
    T5 --> EACH
    T6 --> EACH
    T7 --> EACH
    T8 --> EACH

    style TEMPLATES fill:#fef3c7,stroke:#d97706,stroke-width:2px
    style EACH fill:#f0fdf4,stroke:#16a34a,stroke-width:2px
```

---

## 6. Government Schemes (8 Schemes)

```mermaid
graph TD
    subgraph FILTERS["🔍 Search & Filter"]
        SB["Search Bar<br/>Bilingual Search"]
        CF1["All"]
        CF2["🔵 Insurance"]
        CF3["🟣 Credit"]
        CF4["🟢 Subsidy"]
        CF5["🟠 Training"]
        LT["Language Toggle<br/>हिंदी / EN"]
    end

    subgraph SCHEMES["🏛️ 8 Government Schemes"]
        S1["PM Fasal Bima Yojana<br/>🔵 Insurance<br/>Crop insurance"]
        S2["PM-KISAN<br/>🟢 Subsidy<br/>₹6,000/year income"]
        S3["Kisan Credit Card<br/>🟣 Credit<br/>Low-interest loans"]
        S4["Soil Health Card<br/>🟢 Subsidy<br/>Free soil testing"]
        S5["PM Kisan Mandhan<br/>🟢 Subsidy<br/>₹3,000/month pension"]
        S6["PMKVY<br/>🟠 Training<br/>Skill training"]
        S7["eNAM<br/>🟢 Subsidy<br/>Online market"]
        S8["PM Krishi Sinchai<br/>🟢 Subsidy<br/>Irrigation subsidy"]
    end

    SB --> SCHEMES
    CF1 --> SCHEMES
    CF2 --> S1
    CF3 --> S3
    CF4 --> S2
    CF4 --> S4
    CF4 --> S5
    CF4 --> S7
    CF4 --> S8
    CF5 --> S6

    style FILTERS fill:#eff6ff,stroke:#2563eb,stroke-width:2px
    style SCHEMES fill:#f0fdf4,stroke:#16a34a,stroke-width:2px
```

---

## 7. Data Storage Architecture

```mermaid
graph TB
    subgraph CLIENT["📱 Client-Side (localStorage)"]
        KP["krishirakshak_profile<br/>Name, State, Crop, Language"]
        KL["krishirakshak_lang<br/>hi-IN / en-IN"]
        KV["krishirakshak_voice_history<br/>Chat History (max 20)"]
        KD["krishirakshak_detections<br/>Hazard Scans (last 3)"]
        KJ["krishirakshak_jha_progress<br/>Checklist Progress"]
        KQ["krishirakshak_qa_cache<br/>Offline Cache (max 50)"]
        KA["krishirakshak_recent_activity<br/>Activity Feed (max 10)"]
    end

    subgraph CLOUD["☁️ Cloud-Side (AWS)"]
        DDB["DynamoDB<br/>krishirakshak-activity-log<br/>PK: userId<br/>SK: timestamp"]
        S3["S3: RAG Documents<br/>17+ Official Publications<br/>ICAR, FSSAI, NDMA"]
        OS["OpenSearch Serverless<br/>Vector Embeddings<br/>Titan Text V2"]
    end

    KP -.->|Personalizes| HP["HomePage Greeting"]
    KL -.->|Sets Language| ALL["All Components"]
    KV -.->|Offline History| VQ["VoiceQA"]
    KQ -.->|Offline Answers| VQ

    style CLIENT fill:#f0fdf4,stroke:#16a34a,stroke-width:2px
    style CLOUD fill:#eff6ff,stroke:#2563eb,stroke-width:2px
```

---

## 8. Deployment Architecture

```mermaid
graph LR
    subgraph DEV["💻 Development"]
        GH["GitHub<br/>Sameer786/krishirakshak-ai"]
        VC["Vercel<br/>Auto-deploy on push"]
    end

    subgraph AWS_DEPLOY["☁️ AWS Deployment"]
        S3["S3 Bucket<br/>krishirakshak-frontend"]
        CF["CloudFront<br/>d2e3izstdqba08.cloudfront.net"]
        APIGW["API Gateway<br/>jd7dn6udrf"]
        L1["Lambda: ask-safety"]
        L2["Lambda: analyze-hazards"]
        L3["Lambda: text-to-speech"]
    end

    subgraph URLS["🌐 Live URLs"]
        U1["☁️ CloudFront (Primary)<br/>https://d2e3izstdqba08.cloudfront.net"]
        U2["▲ Vercel (Backup)<br/>https://krishirakshak-ai.vercel.app"]
        U3["🔌 API Gateway<br/>https://jd7dn6udrf.execute-api<br/>.ap-south-1.amazonaws.com/prod"]
    end

    GH -->|main branch| VC
    GH -->|deploy/s3-cloudfront| S3
    S3 --> CF
    CF --> U1
    VC --> U2
    APIGW --> L1
    APIGW --> L2
    APIGW --> L3
    APIGW --> U3

    style DEV fill:#f5f3ff,stroke:#7c3aed,stroke-width:2px
    style AWS_DEPLOY fill:#fff7ed,stroke:#ea580c,stroke-width:2px
    style URLS fill:#f0fdf4,stroke:#16a34a,stroke-width:2px
```

---

## 9. RAG Pipeline Detail

```mermaid
graph TD
    subgraph DOCS["📚 17+ Source Documents"]
        D1["ICAR Publications<br/>Agricultural Research"]
        D2["FSSAI Guidelines<br/>Food Safety Standards"]
        D3["Insecticides Act 1968<br/>Pesticide Regulations"]
        D4["NDMA Guidelines<br/>Disaster Management"]
        D5["NFSM Documents<br/>Food Security Mission"]
    end

    subgraph INGEST["📥 Ingestion Pipeline"]
        S3D["S3: Document Store"]
        EMB["Titan Text Embeddings V2<br/>Vector Generation"]
        OSS["OpenSearch Serverless<br/>Vector Index"]
    end

    subgraph QUERY["🔍 Query Pipeline"]
        Q["Farmer's Question"]
        RET["RetrieveCommand<br/>Top-5 passages"]
        FILT["Score Filter > 0.4"]
        CTX["RAG Context Builder"]
        BK["Bedrock Nova Lite<br/>ConverseCommand"]
        ANS["Answer + Sources +<br/>Confidence % + Badge ✅"]
    end

    D1 --> S3D
    D2 --> S3D
    D3 --> S3D
    D4 --> S3D
    D5 --> S3D
    S3D --> EMB --> OSS

    Q --> RET
    RET --> OSS
    OSS --> FILT
    FILT --> CTX
    CTX --> BK
    BK --> ANS

    style DOCS fill:#fef3c7,stroke:#d97706,stroke-width:2px
    style INGEST fill:#ede9fe,stroke:#7c3aed,stroke-width:2px
    style QUERY fill:#f0fdf4,stroke:#16a34a,stroke-width:2px
```

---

## 10. API Gateway Routes

```mermaid
graph LR
    subgraph APIGW["API Gateway: jd7dn6udrf<br/>https://jd7dn6udrf.execute-api.ap-south-1.amazonaws.com/prod"]
        R1["POST /ask-safety-question<br/>Lambda Proxy Integration"]
        R2["POST /analyze-hazards<br/>Lambda Proxy Integration"]
        R3["POST /text-to-speech<br/>Lambda Proxy Integration"]
        O1["OPTIONS /ask-safety-question<br/>MOCK (CORS)"]
        O2["OPTIONS /analyze-hazards<br/>MOCK (CORS)"]
        O3["OPTIONS /text-to-speech<br/>MOCK (CORS)"]
    end

    R1 --> L1["Lambda:<br/>krishirakshak-ask-safety"]
    R2 --> L2["Lambda:<br/>krishirakshak-analyze-hazards"]
    R3 --> L3["Lambda:<br/>text-to-speech"]

    subgraph CORS["CORS Headers"]
        H1["Access-Control-Allow-Origin: *"]
        H2["Access-Control-Allow-Methods:<br/>POST, OPTIONS"]
        H3["Access-Control-Allow-Headers:<br/>Content-Type"]
    end

    O1 --> CORS
    O2 --> CORS
    O3 --> CORS

    style APIGW fill:#fef9c3,stroke:#ca8a04,stroke-width:2px
    style CORS fill:#e0f2fe,stroke:#0284c7
```

---

## 11. Offline & PWA Strategy

```mermaid
graph TD
    subgraph ONLINE["🟢 Online Mode"]
        API["AWS API Gateway<br/>Live AI Responses"]
        POLLY["Amazon Polly<br/>HD Audio TTS"]
        LIVE["Real-time Hazard Analysis"]
    end

    subgraph OFFLINE["🔴 Offline Mode"]
        SWC["Service Worker Cache<br/>Static Assets (cache-first)"]
        LSC["localStorage Cache<br/>Previous Q&A (max 50)"]
        MOCK["Mock Data<br/>30+ Hindi/English Q&As"]
        BTTS["Browser Web Speech API<br/>TTS Fallback"]
        FALL["12 Hardcoded Hazard Patterns<br/>Fallback Detection"]
    end

    subgraph PWA["📱 PWA Features"]
        INST["Installable on Home Screen"]
        MAN["manifest.json<br/>standalone display"]
        ICO["SVG Icons (192 + 512)"]
        OFF["Works Without Internet"]
    end

    ONLINE -->|Network unavailable| OFFLINE
    PWA --> INST
    PWA --> OFF

    style ONLINE fill:#f0fdf4,stroke:#16a34a,stroke-width:2px
    style OFFLINE fill:#fef2f2,stroke:#dc2626,stroke-width:2px
    style PWA fill:#eff6ff,stroke:#2563eb,stroke-width:2px
```

---

## 12. User Profile & Personalization Flow

```mermaid
graph LR
    subgraph PROFILE["👤 Profile Page"]
        NM["Name"]
        ST["State (10 options)"]
        DT["District"]
        CR["Primary Crop (10 options)"]
        FS["Farm Size"]
        LG["Language Preference"]
    end

    subgraph STORAGE["💾 localStorage"]
        KP["krishirakshak_profile"]
        KL["krishirakshak_lang"]
    end

    subgraph PERSONALIZE["🎯 Personalization"]
        GR["Homepage Greeting<br/>नमस्ते {Name}!"]
        TIP["Crop-Specific Safety Tips<br/>गेहूं किसानों के लिए"]
        LANG["All Pages Language<br/>हिंदी / English"]
    end

    PROFILE -->|Save| STORAGE
    STORAGE -->|Read| PERSONALIZE

    style PROFILE fill:#ede9fe,stroke:#7c3aed,stroke-width:2px
    style STORAGE fill:#fef3c7,stroke:#d97706,stroke-width:2px
    style PERSONALIZE fill:#f0fdf4,stroke:#16a34a,stroke-width:2px
```

---

## Summary

| Metric | Value |
|--------|-------|
| **AWS Services** | 10 (Bedrock, KB, Rekognition, Lambda, API GW, S3, DynamoDB, CloudWatch, CloudFront, Polly) |
| **Lambda Functions** | 3 (ask-safety, analyze-hazards, text-to-speech) |
| **API Routes** | 3 POST + 3 OPTIONS (CORS) |
| **Frontend Routes** | 6 pages |
| **JHA Templates** | 8 safety checklists (10 steps each) |
| **Govt Schemes** | 8 real Indian schemes |
| **RAG Documents** | 17+ official publications |
| **Languages** | 2 (Hindi + English) |
| **Deployment** | CloudFront (primary) + Vercel (backup) |
| **Region** | ap-south-1 (Mumbai) |

---

*Built for the **AWS AI for Bharat Hackathon** by Team KrishiRakshak*

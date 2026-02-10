# KrishiRakshak (कृषि रक्षक) - AI-Powered Agricultural Safety Assistant

[![AWS AI for Bharat Hackathon](https://img.shields.io/badge/AWS-AI%20for%20Bharat-orange)](https://awsaiforindia.devfolio.co/)
[![Challenge](https://img.shields.io/badge/Challenge-Rural%20Innovation-green)](https://awsaiforindia.devfolio.co/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> An offline-first mobile application providing AI-powered safety guidance, hazard detection, and compliance tracking for farmers across rural India in 10+ regional languages.

## 🌾 Problem Statement

42% of India's workforce is employed in agriculture, facing critical safety challenges:
- **Pesticide exposure** without proper safety guidance
- **Machinery accidents** due to lack of hazard awareness
- **Heat stress** and environmental hazards
- **Limited access** to safety information in rural areas with poor connectivity
- **Low literacy** barriers to traditional safety documentation
- **Language barriers** with most safety resources in English

## 💡 Our Solution

**KrishiRakshak** is an intelligent agricultural safety assistant that works completely offline, providing:

### Core Features
- 🎤 **Voice-based Safety Q&A** in 10+ Indian languages (Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Odia)
- 📷 **AI-Powered Hazard Detection** using smartphone camera
- ✅ **Job Hazard Analysis (JHA) Templates** for 30+ agricultural tasks
- 📱 **Offline-First Architecture** - works without internet connectivity
- 🧠 **Knowledge Graph** for contextual farming recommendations
- 📋 **Compliance Documentation** and government scheme integration
- 🎯 **Personalized Safety Recommendations** based on crops, season, and location

## 🏗️ Architecture

### High-Level System Design

```
┌─────────────────────────────────────┐
│   Mobile Client (React Native)      │
│                                      │
│  Voice UI → Hazard Detection →      │
│  JHA Templates → Compliance          │
│         ↓                            │
│  Local SQLite + Cached Models        │
│         ↓                            │
│  Bidirectional Sync Engine           │
└──────────────┬──────────────────────┘
               │ (When Online)
               ↓
┌──────────────────────────────────────┐
│        AWS Cloud Services             │
│                                       │
│  AppSync → Lambda → Bedrock/Kendra   │
│  Neptune → Rekognition → Polly       │
│  S3/CloudFront → DynamoDB            │
└───────────────────────────────────────┘
```

**See [architecture.mermaid](architecture.mermaid) for detailed diagram**

### Technology Stack

**Frontend (Mobile)**
- React Native for Android 8+
- SQLite (local database)
- Mozilla DeepSpeech (offline STT)
- eSpeak-ng (offline TTS)
- MobileNetV3 (offline image recognition)

**Backend (AWS)**
- **AWS Bedrock** - Claude 3 Haiku for LLM/RAG
- **Amazon Kendra** - RAG document indexing
- **AWS Neptune** - Knowledge graph database
- **Amazon Rekognition** - Advanced hazard detection
- **Amazon Polly** - Text-to-speech (10+ languages)
- **Amazon Transcribe** - Speech-to-text training
- **AWS AppSync** - GraphQL with offline sync
- **Amazon DynamoDB** - User data storage
- **Amazon S3 + CloudFront** - Model distribution

## 📊 Key Metrics & Success Criteria

### Performance Targets
- ⚡ **<3 seconds** response time for voice queries (offline)
- 🎯 **>85%** query accuracy in offline mode
- 🔋 **<10%** battery drain per hour of active use
- 💾 **<100MB** total storage footprint
- 💰 **<$0.10** per user per month operational cost

### Impact Goals (6 months)
- 👥 **50,000** active users
- 📱 **70%** offline usage rate
- ⚠️ **30%** reduction in farm accidents
- 🌐 **10+** regional languages supported
- ⭐ **NPS >40** user satisfaction

## 🚀 Getting Started

### Prerequisites
- Android device (v8.0+, 2GB+ RAM)
- Node.js 18+ (for development)
- AWS Account (for cloud deployment)
- Kiro (for requirements/design generation)

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/krishirakshak.git
cd krishirakshak

# Install dependencies
npm install

# Configure AWS services
cp .env.example .env
# Edit .env with your AWS credentials

# Build mobile app
npm run build:android

# Run on device/emulator
npm run android
```

## 📁 Project Structure

```
krishirakshak/
├── requirements.md          # Detailed requirements (from Kiro)
├── design.md               # Technical design document (from Kiro)
├── architecture.mermaid    # Architecture diagram
├── README.md              # This file
├── docs/                  # Additional documentation
│   ├── API.md
│   ├── DEPLOYMENT.md
│   └── SECURITY.md
├── mobile/                # React Native mobile app
│   ├── src/
│   ├── android/
│   └── package.json
├── backend/               # AWS Lambda functions
│   ├── sync-handler/
│   ├── query-processor/
│   └── model-updater/
├── models/                # ML model artifacts
│   ├── hazard-detection/
│   ├── speech/
│   └── embeddings/
└── infra/                 # Infrastructure as Code
    ├── cloudformation/
    └── terraform/
```

## 🎯 Challenge Selection

**Selected Challenge:** #3 - **AI for Rural Innovation & Sustainable Systems**

### Why This Challenge?

1. **Massive Impact**: 42% of India's workforce in agriculture
2. **Underserved Market**: Limited tech solutions for rural safety
3. **Unique Approach**: Offline-first architecture addresses connectivity challenges
4. **Scalable Solution**: Cloud-based backend with edge intelligence
5. **Safety First**: Directly reduces farm accidents and saves lives

## 💻 Development Approach

### Phase 1: MVP (Hackathon Scope)
- [x] Requirements definition with Kiro
- [x] Technical design with Kiro
- [ ] Core offline functionality (voice Q&A, hazard detection)
- [ ] Basic AWS integration (Bedrock, Kendra)
- [ ] Single language support (Hindi)
- [ ] Android app prototype

### Phase 2: Beta (Post-Hackathon)
- [ ] Full offline-first sync implementation
- [ ] 10+ language support
- [ ] Government scheme integration
- [ ] Field testing with 100 farmers
- [ ] Performance optimization

### Phase 3: Production
- [ ] Scale to 50,000 users
- [ ] Multi-region deployment
- [ ] Advanced analytics & insights
- [ ] Partnership with agricultural departments

## 🔒 Security & Privacy

- ✅ End-to-end encryption (TLS 1.3)
- ✅ Local data encryption (SQLCipher)
- ✅ No PII collection without consent
- ✅ India data residency (Mumbai region)
- ✅ GDPR/Indian data protection compliant
- ✅ Offline-first reduces data exposure

## 💰 Cost Optimization

Our design targets **<$0.10 per user per month**:

| Service | Monthly Cost (50K users) | Strategy |
|---------|-------------------------|----------|
| Bedrock (Claude Haiku) | $1,250 | Cache responses, batch queries |
| Kendra | $810 | Shared index, export embeddings |
| Lambda | $500 | ARM processors, right-sizing |
| DynamoDB | $300 | Single-table design, TTL cleanup |
| S3/CloudFront | $200 | Compression, edge caching |
| Other Services | $440 | Optimize usage patterns |
| **Total** | **$3,500** | **$0.07/user** ✅ |

## 📈 Scalability

**Current Design:**
- 50,000 users
- 1.5M queries/month
- 500K image detections/month

**Future Scale (1 year):**
- 500,000 users
- 15M queries/month
- Multi-region deployment
- <$0.08/user with economies of scale

## 🤝 Team

- **Ghazi Anwer** - General Manager IT, Safe Lanes Consultants
  - 20+ years enterprise architecture
  - Maritime safety systems expertise
  - AWS/Azure/GCP certified (CISM, CEH)

## 📞 Contact & Feedback

- **Email**: [your-email@example.com]
- **LinkedIn**: [your-linkedin]
- **Project Website**: [coming soon]

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- AWS for the AI for Bharat Hackathon
- Kiro for requirements and design generation
- Open source communities (React Native, DeepSpeech, etc.)
- Agricultural extension officers who provided domain expertise

---

**Built with ❤️ for the farmers of India** 🇮🇳

**#AWSAIforBharat #RuralInnovation #AgriTech #SafetyFirst**

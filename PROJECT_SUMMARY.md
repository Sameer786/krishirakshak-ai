# KrishiRakshak (कृषि रक्षक) — Project Summary

## One-Liner
AI-powered agricultural safety PWA that delivers voice-based safety guidance, hazard detection, and safety checklists to Indian farmers in Hindi and English — built on 10 AWS services with RAG-verified answers from official government documents.

## The Problem
42% of India's workforce is in agriculture. Every year, 200,000+ farmers suffer pesticide poisoning and 45,000+ face machinery accidents — most preventable. But safety information is locked behind English documents, requires internet that rural India doesn't have, and assumes literacy that 35% of farmers lack. No digital safety tool exists that speaks the farmer's language, works in their conditions, and earns their trust.

## Our Solution
KrishiRakshak is a Progressive Web App deployed on AWS that puts AI-powered safety guidance directly in farmers' hands:

**Voice Q&A with RAG** — Farmers ask safety questions in Hindi or English. Bedrock Knowledge Bases searches 17+ official government documents (ICAR, FSSAI, Insecticides Act, NDMA, NFSM) and generates grounded answers. A green Verified badge shows the source and confidence score — building trust through transparency.

**Hazard Detection** — Farmers photograph their workspace, equipment, or chemicals. Amazon Rekognition detects objects, Bedrock analyzes them for safety hazards, and returns bilingual severity cards (Critical/High/Medium/Low) with actionable recommendations.

**8 JHA Safety Checklists** — Step-by-step templates for pesticide handling, tractor operation, harvesting, irrigation, chemical storage, livestock handling, electrical safety, and heat stress. Amazon Polly reads each step aloud in Hindi for farmers who can't read.

**User Profile & Personalization** — Farmers set their name, state, crop, and language. The app personalizes greetings and safety tips based on their farming context.

**Government Schemes** — 8 real schemes (PM-KISAN, Fasal Bima Yojana, Kisan Credit Card, Soil Health Card, and more) with search, filters, and direct links to official application portals.

**Domain-Restricted AI** — The system only answers agriculture and farm safety questions. Off-topic queries are politely declined — maintaining trust and preventing misuse.

## AWS Architecture (10 Services)
Amazon Bedrock (Nova Lite) | Bedrock Knowledge Bases (RAG with Titan Embeddings + OpenSearch Serverless) | Amazon Rekognition | AWS Lambda ×3 | Amazon API Gateway | Amazon S3 | Amazon DynamoDB | Amazon CloudFront | Amazon Polly | Amazon CloudWatch

All serverless, all in ap-south-1 (Mumbai), auto-scaling from 10 to 10 million users with zero architecture changes.

## Technical Highlights
- **RAG with real documents:** 17+ official ICAR, FSSAI, NDMA documents — not synthetic data
- **Verified badge:** Every answer shows source documents and confidence percentage
- **Hybrid hazard detection:** Rekognition labels + Bedrock analysis with hardcoded fallback patterns
- **Amazon Polly TTS:** Hindi (Aditi) and English (Kajal neural) — cleaner than browser speech
- **Offline-capable PWA:** Service worker caching, localStorage persistence, installable on phone
- **Activity logging:** Every interaction tracked in DynamoDB for usage analytics

## Impact Potential
- **Target:** 200M+ Indian farmers
- **Cost:** $0.07/user/month at 50K users, dropping to $0.04 at 1M users
- **Scalability:** Fully serverless — Lambda, API Gateway, DynamoDB, CloudFront all auto-scale
- **Accessibility:** Voice-first design + read-aloud eliminates literacy barriers

## Live Demo
- **AWS CloudFront:** https://d2e3izstdqba08.cloudfront.net
- **GitHub:** https://github.com/Sameer786/krishirakshak-ai

## Team
**Ghazi Anwer** — General Manager IT, Safe Lanes Consultants Pte Ltd
20+ years enterprise architecture | Maritime safety systems (SAIL ERP, 200+ vessels) | CISM, CEH certified | AWS infrastructure expertise

## Future Roadmap
React Native mobile app with offline ML models | 10+ regional languages | Knowledge Graph (Neptune) for crop-pest-season relationships | Compliance tracking with PDF export | Weather-based proactive safety alerts | IoT farm sensor integration | Expansion to Bangladesh, Nepal, and Africa

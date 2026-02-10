# Design Document: KrishiRakshak Agricultural Safety Assistant

## Overview

KrishiRakshak is an offline-first mobile application built on React Native for Android, leveraging AWS cloud services for AI capabilities while maintaining full functionality without internet connectivity. The system architecture prioritizes local-first operation with intelligent cloud synchronization, optimized for resource-constrained devices (2GB RAM, Android 8+) and cost efficiency (<$0.10/user/month).

The design follows a three-tier architecture:
1. **Mobile Client Layer**: React Native app with local SQLite database, cached ML models, and offline-capable UI
2. **Synchronization Layer**: Bidirectional sync engine with conflict resolution and intelligent data prioritization
3. **Cloud Services Layer**: AWS-managed services for AI/ML, knowledge management, and data persistence

Key design principles:
- Offline-first: All core features work without connectivity
- Resource-conscious: Strict 100MB cache limit, optimized battery usage
- Multilingual: Support for 10+ Indian regional languages with local TTS/STT
- Cost-optimized: Serverless architecture, edge caching, and batch processing
- Scalable: Designed for 50K users with 70% offline usage


## Architecture

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Mobile Client (React Native)              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Voice UI     │  │ Camera UI    │  │ JHA UI       │      │
│  │ Component    │  │ Component    │  │ Component    │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│  ┌──────▼──────────────────▼──────────────────▼───────┐    │
│  │         Application Service Layer                   │    │
│  │  - Voice Processor  - Hazard Analyzer               │    │
│  │  - Query Engine     - Recommendation Engine         │    │
│  └──────┬──────────────────────────────────────────────┘    │
│         │                                                    │
│  ┌──────▼──────────────────────────────────────────────┐    │
│  │         Local Data Layer                             │    │
│  │  - SQLite DB  - Cached Models  - Embedding Cache    │    │
│  └──────┬──────────────────────────────────────────────┘    │
│         │                                                    │
│  ┌──────▼──────────────────────────────────────────────┐    │
│  │         Sync Engine (Bidirectional)                  │    │
│  └──────┬──────────────────────────────────────────────┘    │
└─────────┼──────────────────────────────────────────────────┘
          │ (When connectivity available)
          │
┌─────────▼──────────────────────────────────────────────────┐
│                    AWS Cloud Services                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ AWS AppSync  │  │ AWS Bedrock  │  │ AWS Neptune  │     │
│  │ (GraphQL +   │  │ (LLM/RAG)    │  │ (Knowledge   │     │
│  │  Offline)    │  │              │  │  Graph)      │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                  │                  │             │
│  ┌──────▼──────────────────▼──────────────────▼───────┐    │
│  │              Lambda Functions Layer                 │    │
│  │  - Sync Handler  - Query Processor                  │    │
│  │  - Model Updater - Analytics Aggregator             │    │
│  └──────┬──────────────────────────────────────────────┘    │
│         │                                                    │
│  ┌──────▼──────────────────────────────────────────────┐    │
│  │         Storage & AI Services                        │    │
│  │  - S3 (Models/Assets)  - Rekognition (Images)       │    │
│  │  - DynamoDB (User Data) - Kendra (RAG Index)        │    │
│  │  - Polly (TTS)         - Transcribe (STT)           │    │
│  └──────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
```

### Offline-First Architecture Pattern

The system implements a "local-first, cloud-enhanced" pattern:

1. **Primary Operation**: All user interactions execute against local SQLite database and cached models
2. **Background Sync**: When connectivity detected, sync engine runs in background without blocking UI
3. **Conflict Resolution**: Last-write-wins for preferences, merge strategy for compliance records
4. **Intelligent Caching**: ML models and embeddings cached locally, updated incrementally
5. **Graceful Degradation**: Cloud-only features (new model updates, analytics) deferred until online


### AWS Services Integration

**AWS Bedrock (LLM/RAG)**:
- Model: Claude 3 Haiku for cost efficiency ($0.25/1M input tokens)
- Usage: Query understanding, response generation, context synthesis
- Offline Strategy: Cache embeddings locally, use lightweight on-device inference for common queries
- Cost Optimization: Batch queries during sync, cache responses for 7 days

**AWS Kendra (RAG Index)**:
- Purpose: Index agricultural safety knowledge base (government guidelines, best practices)
- Offline Strategy: Export top 1000 most-accessed document embeddings to device cache
- Update Frequency: Weekly incremental updates during sync
- Cost Optimization: Developer edition ($810/month) shared across all users

**AWS Rekognition (Image Analysis)**:
- Purpose: Hazard detection in agricultural images
- Offline Strategy: Deploy quantized MobileNetV3 model locally for common hazards
- Cloud Fallback: Complex/unknown hazards sent to Rekognition when online
- Cost Optimization: $0.001 per image, only for edge cases not handled locally

**AWS Polly (Text-to-Speech)**:
- Languages: Neural voices for Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Odia
- Offline Strategy: Pre-generate and cache common safety phrases (500 most frequent)
- On-demand: Generate dynamic responses locally using lightweight TTS engine (eSpeak-ng)
- Cost Optimization: $4 per 1M characters, cache aggressively

**AWS Transcribe (Speech-to-Text)**:
- Languages: Support all 10 regional languages
- Offline Strategy: Use Mozilla DeepSpeech quantized models locally
- Cloud Enhancement: Improve accuracy with Transcribe when online, update local models
- Cost Optimization: $0.024 per minute, only for model training data collection

**AWS Neptune (Knowledge Graph)**:
- Schema: Crops → Pests → Pesticides → Safety_Measures → PPE → Seasons
- Offline Strategy: Export user-relevant subgraph (based on crops/region) to local graph DB
- Size: ~5MB per user for relevant subgraph
- Update Frequency: Monthly or when user changes crop profile

**AWS AppSync (GraphQL + Offline)**:
- Purpose: Bidirectional sync with built-in conflict resolution
- Offline Mutations: Queue locally, replay when online
- Subscriptions: Real-time safety alerts when connected
- Cost Optimization: $4 per 1M queries, batch operations

**Amazon S3 (Model Storage)**:
- Content: ML models, TTS audio cache, JHA templates, safety images
- Distribution: CloudFront CDN for faster downloads in India
- Versioning: Incremental model updates to minimize bandwidth
- Cost Optimization: S3 Standard-IA for infrequently accessed content

**Amazon DynamoDB (User Data)**:
- Tables: Users, ComplianceRecords, QueryHistory, SyncMetadata
- Capacity: On-demand pricing for unpredictable traffic
- TTL: Auto-delete query logs after 90 days
- Cost Optimization: Single-table design, sparse indexes


## Components and Interfaces

### Mobile Client Components

#### 1. Voice Interface Component

**Responsibilities**:
- Capture audio input from microphone
- Convert speech to text using local STT engine
- Convert text responses to speech using local TTS engine
- Manage language selection and voice settings

**Interfaces**:
```typescript
interface VoiceInterface {
  // Start listening for voice input
  startListening(language: RegionalLanguage): Promise<void>
  
  // Stop listening and return transcribed text
  stopListening(): Promise<string>
  
  // Convert text to speech and play
  speak(text: string, language: RegionalLanguage): Promise<void>
  
  // Check if voice input is supported for language
  isLanguageSupported(language: RegionalLanguage): boolean
  
  // Get available voices for language
  getAvailableVoices(language: RegionalLanguage): Voice[]
}

interface Voice {
  id: string
  name: string
  language: RegionalLanguage
  gender: 'male' | 'female'
  quality: 'standard' | 'neural'
}

type RegionalLanguage = 'hi' | 'ta' | 'te' | 'bn' | 'mr' | 'gu' | 'kn' | 'ml' | 'pa' | 'or'
```

**Local STT Engine**: Mozilla DeepSpeech quantized models (~50MB per language, load on-demand)
**Local TTS Engine**: eSpeak-ng with MBROLA voices (~10MB per language)

#### 2. Camera Hazard Detector Component

**Responsibilities**:
- Capture images from device camera
- Run local ML model for hazard detection
- Display detected hazards with bounding boxes
- Provide safety recommendations for detected hazards

**Interfaces**:
```typescript
interface HazardDetector {
  // Capture and analyze image for hazards
  detectHazards(imageUri: string): Promise<HazardDetectionResult>
  
  // Get cached hazard information
  getHazardInfo(hazardId: string): Promise<HazardInfo>
  
  // Save detection result for compliance
  saveDetection(result: HazardDetectionResult): Promise<void>
}

interface HazardDetectionResult {
  imageUri: string
  timestamp: Date
  detectedHazards: DetectedHazard[]
  overallRiskLevel: 'low' | 'medium' | 'high' | 'critical'
}

interface DetectedHazard {
  hazardId: string
  hazardType: HazardType
  confidence: number // 0-1
  boundingBox: BoundingBox
  severity: 'low' | 'medium' | 'high' | 'critical'
  recommendations: string[]
}

type HazardType = 
  | 'pesticide_container'
  | 'unsafe_machinery'
  | 'electrical_hazard'
  | 'heat_stress_indicator'
  | 'missing_ppe'
  | 'chemical_spill'
  | 'unsafe_storage'

interface BoundingBox {
  x: number
  y: number
  width: number
  height: number
}
```

**Local ML Model**: MobileNetV3-Small with custom hazard detection head (~15MB)
**Inference Time**: <2 seconds on device
**Accuracy Target**: 80% for common hazards offline, 95% with cloud enhancement

#### 3. Query Processor Component

**Responsibilities**:
- Process natural language safety queries
- Retrieve relevant information from local cache
- Generate contextual responses using cached embeddings
- Track query history for personalization

**Interfaces**:
```typescript
interface QueryProcessor {
  // Process a safety query and return response
  processQuery(query: string, context: UserContext): Promise<QueryResponse>
  
  // Get query suggestions based on context
  getSuggestions(context: UserContext): Promise<string[]>
  
  // Get query history
  getHistory(limit: number): Promise<QueryHistoryItem[]>
}

interface QueryResponse {
  answer: string
  confidence: number // 0-1
  sources: Source[]
  relatedQueries: string[]
  requiresCloudEnhancement: boolean
}

interface UserContext {
  userId: string
  language: RegionalLanguage
  cropTypes: string[]
  season: Season
  location: Location
  recentQueries: string[]
}

interface Source {
  title: string
  snippet: string
  sourceType: 'government_guideline' | 'best_practice' | 'research_paper'
  url?: string
}

type Season = 'kharif' | 'rabi' | 'zaid' | 'summer'
```

**Local RAG Implementation**:
- Embedding Model: all-MiniLM-L6-v2 quantized (~25MB)
- Vector Store: SQLite with FTS5 extension
- Cached Documents: Top 1000 most-accessed safety documents
- Retrieval: Hybrid search (semantic + keyword)


#### 4. JHA Engine Component

**Responsibilities**:
- Provide pre-built Job Hazard Analysis templates
- Allow customization of templates
- Track completion of JHA checklists
- Generate compliance documentation

**Interfaces**:
```typescript
interface JHAEngine {
  // Get available JHA templates
  getTemplates(category?: string): Promise<JHATemplate[]>
  
  // Get a specific template
  getTemplate(templateId: string): Promise<JHATemplate>
  
  // Create a new JHA session from template
  startJHA(templateId: string, customization?: Partial<JHATemplate>): Promise<JHASession>
  
  // Update JHA session progress
  updateJHA(sessionId: string, updates: JHAUpdate): Promise<void>
  
  // Complete and save JHA
  completeJHA(sessionId: string): Promise<ComplianceRecord>
}

interface JHATemplate {
  id: string
  name: string
  category: string
  description: string
  steps: JHAStep[]
  requiredPPE: PPEItem[]
  estimatedDuration: number // minutes
}

interface JHAStep {
  stepNumber: number
  description: string
  hazards: Hazard[]
  controls: Control[]
  checklistItems: ChecklistItem[]
}

interface Hazard {
  id: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  likelihood: 'rare' | 'unlikely' | 'possible' | 'likely' | 'certain'
}

interface Control {
  id: string
  type: 'elimination' | 'substitution' | 'engineering' | 'administrative' | 'ppe'
  description: string
}

interface ChecklistItem {
  id: string
  description: string
  completed: boolean
  notes?: string
}

interface JHASession {
  id: string
  templateId: string
  userId: string
  startTime: Date
  currentStep: number
  progress: JHAProgress[]
  location?: Location
}

interface ComplianceRecord {
  id: string
  type: 'jha' | 'training' | 'incident'
  timestamp: Date
  userId: string
  location?: Location
  data: any
  synced: boolean
}
```

#### 5. Sync Engine Component

**Responsibilities**:
- Detect connectivity changes
- Queue offline mutations
- Sync data bidirectionally with cloud
- Resolve conflicts
- Manage cache updates

**Interfaces**:
```typescript
interface SyncEngine {
  // Start sync process
  startSync(): Promise<SyncResult>
  
  // Check sync status
  getSyncStatus(): SyncStatus
  
  // Queue an operation for sync
  queueOperation(operation: SyncOperation): Promise<void>
  
  // Resolve a sync conflict
  resolveConflict(conflict: SyncConflict, resolution: ConflictResolution): Promise<void>
  
  // Get pending operations
  getPendingOperations(): Promise<SyncOperation[]>
}

interface SyncResult {
  success: boolean
  syncedOperations: number
  conflicts: SyncConflict[]
  errors: SyncError[]
  duration: number // milliseconds
}

interface SyncStatus {
  isOnline: boolean
  isSyncing: boolean
  lastSyncTime?: Date
  pendingOperations: number
  syncProgress: number // 0-100
}

interface SyncOperation {
  id: string
  type: 'create' | 'update' | 'delete'
  entity: string
  data: any
  timestamp: Date
  priority: 'low' | 'medium' | 'high' | 'critical'
}

interface SyncConflict {
  operationId: string
  localVersion: any
  remoteVersion: any
  conflictType: 'update_conflict' | 'delete_conflict'
}

type ConflictResolution = 'use_local' | 'use_remote' | 'merge'
```

**Sync Strategy**:
- Priority Queue: Critical safety alerts > Compliance records > Query history > Analytics
- Batch Size: Max 50 operations per sync batch
- Retry Logic: Exponential backoff (1s, 2s, 4s, 8s, 16s)
- Conflict Resolution: Last-write-wins for user preferences, merge for compliance records


#### 6. Knowledge Graph Component

**Responsibilities**:
- Store and query relationships between agricultural entities
- Provide contextual recommendations
- Support graph traversal for related information
- Sync with cloud Neptune database

**Interfaces**:
```typescript
interface KnowledgeGraph {
  // Query related entities
  getRelated(entityId: string, relationshipType: string, depth?: number): Promise<Entity[]>
  
  // Find path between entities
  findPath(fromId: string, toId: string): Promise<Path>
  
  // Get recommendations based on context
  getRecommendations(context: UserContext): Promise<Recommendation[]>
  
  // Update local graph from cloud
  updateGraph(updates: GraphUpdate[]): Promise<void>
}

interface Entity {
  id: string
  type: EntityType
  properties: Record<string, any>
  relationships: Relationship[]
}

type EntityType = 
  | 'crop'
  | 'pest'
  | 'pesticide'
  | 'equipment'
  | 'safety_practice'
  | 'ppe'
  | 'season'
  | 'weather_condition'
  | 'government_scheme'

interface Relationship {
  type: string
  targetId: string
  properties?: Record<string, any>
}

interface Path {
  entities: Entity[]
  relationships: Relationship[]
  length: number
}

interface Recommendation {
  id: string
  type: 'safety_practice' | 'ppe' | 'timing' | 'government_scheme'
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  reasoning: string[]
  relatedEntities: string[]
}
```

**Local Graph Storage**:
- Database: SQLite with graph extension (sqlite-graph)
- Schema: Nodes (entities) and Edges (relationships) tables
- Indexes: Entity type, relationship type, user relevance score
- Size: ~5MB per user for relevant subgraph

**Graph Schema Example**:
```
Crop(Rice) --[AFFECTED_BY]--> Pest(Brown_Planthopper)
Pest(Brown_Planthopper) --[CONTROLLED_BY]--> Pesticide(Imidacloprid)
Pesticide(Imidacloprid) --[REQUIRES]--> PPE(Gloves, Mask, Goggles)
Pesticide(Imidacloprid) --[SAFE_IN]--> Season(Kharif)
Pesticide(Imidacloprid) --[AVOID_IN]--> Weather(High_Wind)
PPE(Gloves) --[SPECIFIED_IN]--> Government_Scheme(PM_Kisan_Safety)
```

#### 7. Safety Advisor Component

**Responsibilities**:
- Generate personalized safety recommendations
- Analyze user context and risk factors
- Provide proactive alerts
- Learn from user interactions

**Interfaces**:
```typescript
interface SafetyAdvisor {
  // Get daily safety recommendations
  getDailyRecommendations(context: UserContext): Promise<Recommendation[]>
  
  // Analyze risk for a planned activity
  analyzeRisk(activity: PlannedActivity): Promise<RiskAssessment>
  
  // Get proactive alerts
  getAlerts(context: UserContext): Promise<SafetyAlert[]>
  
  // Record user feedback on recommendation
  recordFeedback(recommendationId: string, feedback: Feedback): Promise<void>
}

interface PlannedActivity {
  activityType: string
  scheduledTime: Date
  location: Location
  equipment: string[]
  chemicals: string[]
}

interface RiskAssessment {
  overallRisk: 'low' | 'medium' | 'high' | 'critical'
  riskFactors: RiskFactor[]
  recommendations: Recommendation[]
  requiredPPE: PPEItem[]
  warnings: string[]
}

interface RiskFactor {
  factor: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  mitigation: string
}

interface SafetyAlert {
  id: string
  type: 'weather' | 'seasonal' | 'equipment' | 'chemical' | 'regulatory'
  severity: 'info' | 'warning' | 'critical'
  title: string
  message: string
  actionRequired: boolean
  expiresAt?: Date
}

interface Feedback {
  helpful: boolean
  followed: boolean
  comments?: string
}

interface PPEItem {
  id: string
  name: string
  type: 'gloves' | 'mask' | 'goggles' | 'boots' | 'coverall' | 'helmet'
  required: boolean
  specification?: string
}
```


### Cloud Service Components

#### 8. Lambda Functions

**Query Processing Lambda**:
```typescript
// Handles complex queries that require cloud LLM
interface QueryProcessingLambda {
  handler(event: QueryEvent): Promise<QueryResponse>
}

interface QueryEvent {
  userId: string
  query: string
  context: UserContext
  cachedEmbeddings: number[] // User's cached embeddings
}
```

**Sync Handler Lambda**:
```typescript
// Processes sync operations from mobile clients
interface SyncHandlerLambda {
  handler(event: SyncEvent): Promise<SyncResponse>
}

interface SyncEvent {
  userId: string
  operations: SyncOperation[]
  lastSyncTimestamp: Date
}

interface SyncResponse {
  processedOperations: string[]
  conflicts: SyncConflict[]
  updates: GraphUpdate[]
  newEmbeddings?: CachedEmbedding[]
}
```

**Model Update Lambda**:
```typescript
// Manages ML model versioning and distribution
interface ModelUpdateLambda {
  handler(event: ModelUpdateEvent): Promise<void>
}

interface ModelUpdateEvent {
  modelType: 'stt' | 'tts' | 'hazard_detection' | 'embeddings'
  version: string
  targetLanguages?: RegionalLanguage[]
}
```

**Analytics Aggregator Lambda**:
```typescript
// Aggregates usage metrics and safety impact data
interface AnalyticsAggregatorLambda {
  handler(event: AnalyticsEvent): Promise<void>
}

interface AnalyticsEvent {
  userId: string
  eventType: string
  timestamp: Date
  metadata: Record<string, any>
}
```

#### 9. Government Scheme Integration Service

**Responsibilities**:
- Fetch and cache government scheme information
- Match user profiles with eligible schemes
- Provide scheme application guidance

**API Design**:
```typescript
interface GovernmentSchemeService {
  // Get schemes relevant to user
  getEligibleSchemes(userProfile: UserProfile): Promise<Scheme[]>
  
  // Get scheme details
  getSchemeDetails(schemeId: string): Promise<SchemeDetails>
  
  // Check eligibility
  checkEligibility(schemeId: string, userProfile: UserProfile): Promise<EligibilityResult>
}

interface Scheme {
  id: string
  name: string
  description: string
  provider: 'central' | 'state'
  state?: string
  category: 'safety' | 'subsidy' | 'insurance' | 'training'
  benefits: string[]
  eligibilityCriteria: string[]
  applicationUrl?: string
}

interface SchemeDetails extends Scheme {
  documents: Document[]
  applicationProcess: Step[]
  contactInfo: ContactInfo
  deadline?: Date
}

interface EligibilityResult {
  eligible: boolean
  matchedCriteria: string[]
  missingCriteria: string[]
  recommendations: string[]
}

interface UserProfile {
  userId: string
  state: string
  district: string
  farmSize: number // hectares
  cropTypes: string[]
  annualIncome?: number
  landOwnership: 'owned' | 'leased' | 'sharecropper'
  hasKisanCard: boolean
}
```

**Data Sources**:
- PM-Kisan portal API
- State agriculture department APIs
- Scraped data from government websites (updated weekly)
- Cached locally for offline access


## Data Models

### Local SQLite Schema

#### Users Table
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT UNIQUE,
  language TEXT NOT NULL, -- Regional language code
  state TEXT NOT NULL,
  district TEXT NOT NULL,
  farm_size REAL, -- hectares
  land_ownership TEXT, -- owned/leased/sharecropper
  has_kisan_card BOOLEAN DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  synced_at INTEGER
);

CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_state ON users(state);
```

#### Crops Table
```sql
CREATE TABLE crops (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  crop_type TEXT NOT NULL,
  area REAL, -- hectares
  planting_date INTEGER,
  harvest_date INTEGER,
  season TEXT, -- kharif/rabi/zaid/summer
  active BOOLEAN DEFAULT 1,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_crops_user ON crops(user_id);
CREATE INDEX idx_crops_active ON crops(active);
```

#### Queries Table
```sql
CREATE TABLE queries (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  query_text TEXT NOT NULL,
  response_text TEXT NOT NULL,
  confidence REAL, -- 0-1
  language TEXT NOT NULL,
  context_json TEXT, -- JSON serialized UserContext
  created_at INTEGER NOT NULL,
  synced BOOLEAN DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_queries_user ON queries(user_id);
CREATE INDEX idx_queries_created ON queries(created_at);
CREATE INDEX idx_queries_synced ON queries(synced);
```

#### Hazard Detections Table
```sql
CREATE TABLE hazard_detections (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  image_uri TEXT NOT NULL,
  detected_hazards_json TEXT NOT NULL, -- JSON array of DetectedHazard
  overall_risk TEXT NOT NULL, -- low/medium/high/critical
  location_lat REAL,
  location_lon REAL,
  created_at INTEGER NOT NULL,
  synced BOOLEAN DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_detections_user ON hazard_detections(user_id);
CREATE INDEX idx_detections_created ON hazard_detections(created_at);
```

#### JHA Sessions Table
```sql
CREATE TABLE jha_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  template_id TEXT NOT NULL,
  template_name TEXT NOT NULL,
  start_time INTEGER NOT NULL,
  end_time INTEGER,
  current_step INTEGER DEFAULT 0,
  progress_json TEXT NOT NULL, -- JSON array of JHAProgress
  location_lat REAL,
  location_lon REAL,
  completed BOOLEAN DEFAULT 0,
  synced BOOLEAN DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_jha_user ON jha_sessions(user_id);
CREATE INDEX idx_jha_completed ON jha_sessions(completed);
```

#### Compliance Records Table
```sql
CREATE TABLE compliance_records (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  record_type TEXT NOT NULL, -- jha/training/incident
  timestamp INTEGER NOT NULL,
  data_json TEXT NOT NULL, -- JSON serialized record data
  location_lat REAL,
  location_lon REAL,
  synced BOOLEAN DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_compliance_user ON compliance_records(user_id);
CREATE INDEX idx_compliance_type ON compliance_records(record_type);
CREATE INDEX idx_compliance_synced ON compliance_records(synced);
```

#### Cached Embeddings Table
```sql
CREATE TABLE cached_embeddings (
  id TEXT PRIMARY KEY,
  document_id TEXT NOT NULL,
  content TEXT NOT NULL,
  embedding_blob BLOB NOT NULL, -- Binary vector embedding
  language TEXT NOT NULL,
  category TEXT, -- safety_practice/pesticide/equipment/etc
  access_count INTEGER DEFAULT 0,
  last_accessed INTEGER,
  created_at INTEGER NOT NULL
);

CREATE INDEX idx_embeddings_category ON cached_embeddings(category);
CREATE INDEX idx_embeddings_language ON cached_embeddings(language);
CREATE INDEX idx_embeddings_access ON cached_embeddings(access_count DESC);

-- Full-text search index
CREATE VIRTUAL TABLE embeddings_fts USING fts5(
  document_id,
  content,
  content=cached_embeddings,
  content_rowid=rowid
);
```

#### Knowledge Graph Tables
```sql
CREATE TABLE graph_nodes (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL, -- crop/pest/pesticide/equipment/etc
  properties_json TEXT NOT NULL,
  relevance_score REAL DEFAULT 0, -- User-specific relevance
  created_at INTEGER NOT NULL
);

CREATE TABLE graph_edges (
  id TEXT PRIMARY KEY,
  source_id TEXT NOT NULL,
  target_id TEXT NOT NULL,
  relationship_type TEXT NOT NULL,
  properties_json TEXT,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (source_id) REFERENCES graph_nodes(id),
  FOREIGN KEY (target_id) REFERENCES graph_nodes(id)
);

CREATE INDEX idx_edges_source ON graph_edges(source_id);
CREATE INDEX idx_edges_target ON graph_edges(target_id);
CREATE INDEX idx_edges_type ON graph_edges(relationship_type);
```

#### Sync Queue Table
```sql
CREATE TABLE sync_queue (
  id TEXT PRIMARY KEY,
  operation_type TEXT NOT NULL, -- create/update/delete
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  data_json TEXT NOT NULL,
  priority TEXT NOT NULL, -- low/medium/high/critical
  created_at INTEGER NOT NULL,
  retry_count INTEGER DEFAULT 0,
  last_retry INTEGER
);

CREATE INDEX idx_sync_priority ON sync_queue(priority, created_at);
CREATE INDEX idx_sync_retry ON sync_queue(retry_count);
```

#### Cached Models Metadata Table
```sql
CREATE TABLE cached_models (
  id TEXT PRIMARY KEY,
  model_type TEXT NOT NULL, -- stt/tts/hazard_detection/embeddings
  language TEXT, -- For language-specific models
  version TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  checksum TEXT NOT NULL,
  downloaded_at INTEGER NOT NULL,
  last_used INTEGER
);

CREATE INDEX idx_models_type ON cached_models(model_type);
CREATE INDEX idx_models_language ON cached_models(language);
```


### Cloud DynamoDB Schema

#### Users Table (DynamoDB)
```typescript
interface DynamoDBUser {
  PK: string // USER#{userId}
  SK: string // PROFILE
  userId: string
  name: string
  phone: string
  language: string
  state: string
  district: string
  farmSize: number
  landOwnership: string
  hasKisanCard: boolean
  createdAt: number
  updatedAt: number
  GSI1PK: string // PHONE#{phone}
  GSI1SK: string // USER
}
```

#### Compliance Records Table (DynamoDB)
```typescript
interface DynamoDBComplianceRecord {
  PK: string // USER#{userId}
  SK: string // COMPLIANCE#{timestamp}#{recordId}
  recordId: string
  userId: string
  recordType: string
  timestamp: number
  data: any
  location?: {
    lat: number
    lon: number
  }
  GSI1PK: string // COMPLIANCE#{recordType}
  GSI1SK: string // {timestamp}
}
```

#### Query History Table (DynamoDB)
```typescript
interface DynamoDBQueryHistory {
  PK: string // USER#{userId}
  SK: string // QUERY#{timestamp}#{queryId}
  queryId: string
  userId: string
  queryText: string
  responseText: string
  confidence: number
  language: string
  context: UserContext
  timestamp: number
  TTL: number // Auto-delete after 90 days
}
```

#### Sync Metadata Table (DynamoDB)
```typescript
interface DynamoDBSyncMetadata {
  PK: string // USER#{userId}
  SK: string // SYNC#{deviceId}
  userId: string
  deviceId: string
  lastSyncTimestamp: number
  pendingOperations: number
  syncVersion: number
  deviceInfo: {
    platform: string
    osVersion: string
    appVersion: string
  }
}
```

### Neptune Knowledge Graph Schema

#### Node Labels and Properties

**Crop Node**:
```cypher
(:Crop {
  id: string,
  name: string,
  scientificName: string,
  season: string[],
  growthDuration: number, // days
  waterRequirement: string,
  region: string[]
})
```

**Pest Node**:
```cypher
(:Pest {
  id: string,
  name: string,
  scientificName: string,
  severity: string,
  symptoms: string[],
  activeSeasons: string[]
})
```

**Pesticide Node**:
```cypher
(:Pesticide {
  id: string,
  name: string,
  activeIngredient: string,
  toxicityClass: string,
  withdrawalPeriod: number, // days
  applicationMethod: string[],
  dosage: string
})
```

**PPE Node**:
```cypher
(:PPE {
  id: string,
  name: string,
  type: string,
  specification: string,
  requiredFor: string[]
})
```

**SafetyPractice Node**:
```cypher
(:SafetyPractice {
  id: string,
  title: string,
  description: string,
  category: string,
  priority: string,
  steps: string[]
})
```

**GovernmentScheme Node**:
```cypher
(:GovernmentScheme {
  id: string,
  name: string,
  provider: string,
  state: string,
  category: string,
  benefits: string[],
  eligibilityCriteria: string[],
  applicationUrl: string
})
```

#### Relationship Types

```cypher
// Crop relationships
(:Crop)-[:AFFECTED_BY]->(:Pest)
(:Crop)-[:GROWS_IN]->(:Season)
(:Crop)-[:REQUIRES]->(:Equipment)
(:Crop)-[:ELIGIBLE_FOR]->(:GovernmentScheme)

// Pest relationships
(:Pest)-[:CONTROLLED_BY]->(:Pesticide)
(:Pest)-[:ACTIVE_IN]->(:Season)

// Pesticide relationships
(:Pesticide)-[:REQUIRES]->(:PPE)
(:Pesticide)-[:SAFE_IN]->(:Season)
(:Pesticide)-[:AVOID_IN]->(:WeatherCondition)
(:Pesticide)-[:FOLLOWS]->(:SafetyPractice)

// Safety practice relationships
(:SafetyPractice)-[:REQUIRES]->(:PPE)
(:SafetyPractice)-[:APPLIES_TO]->(:Equipment)
(:SafetyPractice)-[:MANDATED_BY]->(:GovernmentScheme)
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all 84 acceptance criteria, several redundancies were identified:

**Offline Mode Properties**: Multiple requirements (1.4, 2.4, 3.7, 4.1, 7.6, 8.7, 11.6) test offline functionality. These can be consolidated into comprehensive offline operation properties rather than testing each feature separately.

**Performance Properties**: Requirements 1.7, 2.1, 9.3, 9.4, 12.2 all test response times. These can be combined into performance properties that test timing across different operations.

**Storage Properties**: Requirements 4.3 and 9.2 both test the 100MB storage limit. These are identical and can be merged.

**Language Support Properties**: Requirements 1.3, 2.3, 3.2, 5.4, 10.2, 10.7 all test multilingual support. These can be consolidated into properties that verify language consistency across features.

**Sync Properties**: Requirements 4.2, 4.4, 4.5, 5.7, 6.6, 7.7 all test synchronization behavior. These can be organized into comprehensive sync properties.

The following properties represent the unique, non-redundant correctness guarantees after reflection:

### Voice Interface Properties

**Property 1: Voice transcription accuracy threshold**
*For any* safety query spoken in any supported Regional_Language, the Voice_Interface transcription accuracy should be at least 85%
**Validates: Requirements 1.2**

**Property 2: Text-to-speech completeness**
*For any* generated safety response text and any supported Regional_Language, the Voice_Interface should successfully convert it to speech audio
**Validates: Requirements 1.3**

**Property 3: Voice error handling with clarification**
*For any* audio input with confidence below threshold (unclear speech or high noise), the Voice_Interface should request clarification in the user's selected Regional_Language
**Validates: Requirements 1.5**

**Property 4: Voice navigation completeness**
*For any* navigation action available in the UI, there should exist a corresponding voice command that triggers the same action
**Validates: Requirements 1.6**

**Property 5: Voice processing performance**
*For any* voice query processed in Offline_Mode, the system response time should be less than 3 seconds
**Validates: Requirements 1.7, 9.3**

### Hazard Detection Properties

**Property 6: Hazard detection performance**
*For any* captured image, the Hazard_Detector should complete analysis and return results within 5 seconds
**Validates: Requirements 2.1, 9.4**

**Property 7: Hazard detection with recommendations**
*For any* detected hazard, the Safety_Advisor should provide at least one safety recommendation in the user's Regional_Language
**Validates: Requirements 2.3**

**Property 8: Multiple hazard detection and prioritization**
*For any* image containing multiple hazards, the Hazard_Detector should detect all hazards and order them by severity (critical > high > medium > low)
**Validates: Requirements 2.5**

**Property 9: Image quality feedback**
*For any* image with quality metrics below threshold (blur, darkness, resolution), the Hazard_Detector should provide specific guidance for recapturing
**Validates: Requirements 2.6**

**Property 10: Hazard detection persistence**
*For any* completed hazard detection, the system should store the image URI, detected hazards, and timestamp in the local database
**Validates: Requirements 2.7**

### JHA Engine Properties

**Property 11: JHA template language consistency**
*For any* JHA template and any supported Regional_Language, all template content (steps, hazards, controls) should be presented in that language
**Validates: Requirements 3.2**

**Property 12: JHA template customization persistence**
*For any* JHA template with user-added custom hazards, saving and reloading the template should preserve all custom additions
**Validates: Requirements 3.3**

**Property 13: JHA completion metadata**
*For any* completed JHA checklist, the Compliance_Tracker should store it with timestamp, location (if available), and user ID
**Validates: Requirements 3.4, 7.2**

**Property 14: Hazard-based PPE recommendations**
*For any* set of identified hazards in a JHA, the JHA_Engine should recommend PPE items that cover all hazard types
**Validates: Requirements 3.5**

**Property 15: Seasonal hazard warnings**
*For any* JHA template executed during a season with known seasonal hazards for that activity, the template should include season-specific warnings
**Validates: Requirements 3.6**

### Offline-First and Sync Properties

**Property 16: Comprehensive offline functionality**
*For any* core feature (voice queries, hazard detection, JHA templates, compliance tracking), the feature should operate fully in Offline_Mode without degradation
**Validates: Requirements 1.4, 2.4, 3.7, 4.1, 7.6, 8.7, 11.6**

**Property 17: Automatic sync on connectivity**
*For any* transition from Offline_Mode to online state, the Sync_Engine should automatically initiate synchronization within 5 seconds
**Validates: Requirements 4.2**

**Property 18: Storage limit enforcement**
*For any* system state, the total local storage usage (database + cached models + user data) should not exceed 100MB
**Validates: Requirements 4.3, 9.2**

**Property 19: Conflict resolution by data type**
*For any* sync conflict, the resolution strategy should be last-write-wins for user preferences and merge for compliance records
**Validates: Requirements 4.4**

**Property 20: Sync prioritization**
*For any* sync queue with mixed operation types, critical safety alerts and compliance records should sync before query history and analytics
**Validates: Requirements 4.5**

**Property 21: LRU cache eviction**
*For any* cache state approaching 90MB, the Cache_Manager should evict least-recently-used non-critical data until usage drops below 85MB
**Validates: Requirements 4.6**

**Property 22: Extended offline notification**
*For any* system state where last successful sync was more than 7 days ago, the system should display a notification prompting user to sync
**Validates: Requirements 4.8**

**Property 23: Sync deduplication**
*For any* compliance record synced multiple times, the cloud storage should contain exactly one copy (no duplicates)
**Validates: Requirements 7.7**

### Query Processing Properties

**Property 24: Query processing with cached embeddings**
*For any* safety query in Offline_Mode, the Query_Processor should retrieve and rank relevant documents using only cached embeddings
**Validates: Requirements 5.1**

**Property 25: Query accuracy threshold**
*For any* set of test queries with known correct answers, the Query_Processor should achieve at least 85% accuracy in Offline_Mode
**Validates: Requirements 5.2**

**Property 26: Context-aware responses**
*For any* two identical queries with different user contexts (crop type, season, location), the Safety_Advisor responses should differ to reflect the context
**Validates: Requirements 5.3**

**Property 27: Query-response language consistency**
*For any* query submitted in a Regional_Language, the response should be in the same Regional_Language
**Validates: Requirements 5.4**

**Property 28: Low-confidence uncertainty indication**
*For any* query with response confidence below 70%, the Query_Processor should explicitly indicate uncertainty and suggest alternative questions
**Validates: Requirements 5.5**

**Property 29: Source attribution**
*For any* safety recommendation provided by Safety_Advisor, the response should include at least one source citation
**Validates: Requirements 5.6**

### Knowledge Graph Properties

**Property 30: Graph-based recommendations**
*For any* recommendation generated by Safety_Advisor, the recommendation should be derivable from a path in the Knowledge_Graph
**Validates: Requirements 6.2**

**Property 31: Crop-based seasonal suggestions**
*For any* user profile with specified crop types, the Safety_Advisor should provide seasonal safety precautions relevant to those crops
**Validates: Requirements 6.4**

**Property 32: Location-based graph caching**
*For any* user location, the cached Knowledge_Graph subgraph should prioritize crops and hazards common to that region
**Validates: Requirements 6.7**

### Compliance and Government Scheme Properties

**Property 33: Compliance record persistence**
*For any* completed safety activity (JHA, training, incident), the Compliance_Tracker should create and store a compliance record
**Validates: Requirements 7.1**

**Property 34: Profile-based scheme recommendations**
*For any* user profile, the system should recommend only government schemes where the user meets at least 80% of eligibility criteria
**Validates: Requirements 7.3**

**Property 35: PDF export validity**
*For any* set of compliance records, the export function should generate a valid PDF file containing all record details
**Validates: Requirements 7.4**

**Property 36: Eligibility-based notifications**
*For any* user profile that newly meets all eligibility criteria for a government scheme, the system should generate a notification within 24 hours
**Validates: Requirements 7.5**

### Personalization Properties

**Property 37: Profile data collection**
*For any* new user profile creation, the system should collect and store crops, farm size, equipment, and language preference
**Validates: Requirements 8.1**

**Property 38: Daily contextual recommendations**
*For any* user profile, the Safety_Advisor should generate daily recommendations that consider current season and user's crop types
**Validates: Requirements 8.2**

**Property 39: Weather-based proactive alerts**
*For any* hazardous weather condition detected for user's location, the Safety_Advisor should generate an alert with specific precautions
**Validates: Requirements 8.3**

**Property 40: Equipment-based reminders**
*For any* equipment listed in user profile, the Safety_Advisor should provide maintenance and safety reminders specific to that equipment type
**Validates: Requirements 8.5**

**Property 41: Recommendation severity ordering**
*For any* set of recommendations generated for a user, they should be ordered by severity (critical > high > medium > low) and then by immediacy
**Validates: Requirements 8.6**

### Performance and Resource Properties

**Property 42: Battery-aware processing**
*For any* device state with battery level below 15%, the system should reduce background processing frequency by at least 50%
**Validates: Requirements 9.7**

**Property 43: Battery consumption limit**
*For any* one-hour period of active use, the system should consume less than 10% of device battery
**Validates: Requirements 9.5**

**Property 44: Performance at scale**
*For any* local database size (up to 50MB user data), query response times should remain under 3 seconds
**Validates: Requirements 12.2**

### Accessibility Properties

**Property 45: UI element voice announcements**
*For any* tappable UI element, tapping it should trigger a voice announcement of its function in the user's Regional_Language
**Validates: Requirements 10.2**

**Property 46: Complete voice navigation**
*For any* screen or feature in the app, it should be reachable and usable through voice commands alone without text input
**Validates: Requirements 10.4**

**Property 47: Minimum font size compliance**
*For any* text displayed in the UI, the font size should be at least 16pt
**Validates: Requirements 10.5**

**Property 48: Voice error communication**
*For any* error condition, the system should communicate the error through voice message in addition to or instead of text-only display
**Validates: Requirements 10.7**

### Security and Privacy Properties

**Property 49: Local data encryption**
*For any* user data stored locally (profile, queries, compliance records), the data should be encrypted at rest using AES-256
**Validates: Requirements 11.1**

**Property 50: Sync connection encryption**
*For any* data sync operation, the connection should use TLS 1.3 or higher
**Validates: Requirements 11.2**

**Property 51: Third-party data isolation**
*For any* user data, it should not be transmitted to third-party services without explicit user consent recorded in the database
**Validates: Requirements 11.3**

**Property 52: Location permission with explanation**
*For any* first request for location data, the system should display an explanation of usage before requesting permission
**Validates: Requirements 11.4**

**Property 53: Complete data deletion**
*For any* user account deletion request, all associated data (profile, queries, compliance records, cached data) should be removed from local and cloud storage
**Validates: Requirements 11.5**

### Extensibility Properties

**Property 54: Language extensibility**
*For any* new Regional_Language added to the system, existing features (voice, queries, JHA) should work without code changes to core components
**Validates: Requirements 12.6**

**Property 55: Regional data localization**
*For any* new region added to the system, region-specific Knowledge_Graph data (crops, pests, practices) should be loadable without schema changes
**Validates: Requirements 12.7**

**Property 56: Analytics tracking completeness**
*For any* user interaction (query, hazard detection, JHA completion), relevant metrics should be recorded in the analytics database
**Validates: Requirements 12.4**


## Error Handling

### Error Categories and Strategies

#### 1. Network Errors

**Scenario**: Sync operations fail due to network issues

**Handling Strategy**:
- Queue failed operations in sync_queue table with retry metadata
- Implement exponential backoff: 1s, 2s, 4s, 8s, 16s, max 5 retries
- After max retries, mark operation as "pending" and retry on next connectivity
- Display sync status to user: "Waiting for connection" or "Last synced: X hours ago"
- Never block user interactions waiting for network

**Implementation**:
```typescript
async function handleSyncError(operation: SyncOperation, error: NetworkError): Promise<void> {
  const retryCount = operation.retryCount || 0
  
  if (retryCount < MAX_RETRIES) {
    const backoffDelay = Math.pow(2, retryCount) * 1000 // Exponential backoff
    await scheduleRetry(operation, backoffDelay)
  } else {
    await markOperationPending(operation)
    await notifyUser('sync_pending', { operationCount: await getPendingCount() })
  }
}
```

#### 2. Storage Errors

**Scenario**: Local storage full or approaching limit

**Handling Strategy**:
- Monitor storage continuously, check before large operations
- At 90MB: Trigger LRU eviction of non-critical data (old query logs, cached audio)
- At 95MB: Warn user, suggest syncing and clearing old data
- At 98MB: Block new non-critical operations (query history), allow critical (compliance records)
- Prioritize: Compliance records > User profile > JHA templates > Cached models > Query history

**Implementation**:
```typescript
async function handleStorageLimit(): Promise<void> {
  const usage = await getStorageUsage()
  
  if (usage > 90 * MB) {
    await evictLRUData(targetSize: 85 * MB)
  }
  
  if (usage > 95 * MB) {
    await notifyUser('storage_warning', { usage, limit: 100 * MB })
  }
  
  if (usage > 98 * MB) {
    await setStorageMode('critical_only')
  }
}
```

#### 3. ML Model Errors

**Scenario**: Model inference fails or produces low-confidence results

**Handling Strategy**:
- For STT: Request user to repeat, offer text input fallback
- For TTS: Fall back to system TTS if available, otherwise display text
- For hazard detection: Indicate "Unable to analyze, please try again" with tips (better lighting, closer image)
- For query processing: Return "I'm not confident about this answer" with alternative questions
- Log all low-confidence results for model improvement

**Implementation**:
```typescript
async function handleModelError(modelType: string, error: ModelError): Promise<void> {
  switch (modelType) {
    case 'stt':
      await speakMessage('speech_unclear_please_repeat')
      await offerTextInputFallback()
      break
      
    case 'hazard_detection':
      if (error.type === 'low_confidence') {
        await showImageCaptureGuidance()
      } else {
        await queueForCloudAnalysis() // When online
      }
      break
      
    case 'query_processing':
      await showLowConfidenceResponse(error.partialResult)
      await suggestAlternativeQueries()
      break
  }
  
  await logModelError(modelType, error)
}
```

#### 4. Data Corruption Errors

**Scenario**: Local database corruption or invalid data

**Handling Strategy**:
- Validate data integrity on app startup using checksums
- If corruption detected: Attempt repair using SQLite recovery
- If repair fails: Backup corrupted DB, create fresh DB, restore from cloud
- If cloud unavailable: Start with empty DB, preserve corrupted DB for later recovery
- Never lose compliance records: Always attempt cloud recovery first

**Implementation**:
```typescript
async function handleDataCorruption(): Promise<void> {
  const isCorrupted = await checkDatabaseIntegrity()
  
  if (isCorrupted) {
    await backupCorruptedDatabase()
    
    const repaired = await attemptSQLiteRepair()
    if (repaired) {
      await notifyUser('database_repaired')
      return
    }
    
    if (await isOnline()) {
      await restoreFromCloud()
    } else {
      await createFreshDatabase()
      await notifyUser('database_reset_sync_required')
    }
  }
}
```

#### 5. Permission Errors

**Scenario**: User denies camera, microphone, or location permissions

**Handling Strategy**:
- Gracefully disable features requiring denied permissions
- Show explanation of why permission is needed
- Offer alternative workflows (e.g., gallery upload instead of camera)
- Periodically prompt to enable permissions with clear benefits
- Never crash or block app if permission denied

**Implementation**:
```typescript
async function handlePermissionDenied(permission: Permission): Promise<void> {
  switch (permission) {
    case 'camera':
      await disableFeature('hazard_detection_camera')
      await enableFeature('hazard_detection_gallery')
      await showPermissionExplanation('camera')
      break
      
    case 'microphone':
      await disableFeature('voice_input')
      await enableFeature('text_input')
      await showPermissionExplanation('microphone')
      break
      
    case 'location':
      await disableFeature('location_based_recommendations')
      await enableFeature('manual_location_selection')
      await showPermissionExplanation('location')
      break
  }
}
```

#### 6. Language Model Errors

**Scenario**: Requested language not available or model download fails

**Handling Strategy**:
- Fall back to Hindi (most widely understood) if preferred language unavailable
- Offer to download language pack when connectivity available
- Show language availability status in settings
- Allow app usage in any available language while downloading others

**Implementation**:
```typescript
async function handleLanguageUnavailable(language: RegionalLanguage): Promise<void> {
  const availableLanguages = await getAvailableLanguages()
  
  if (!availableLanguages.includes(language)) {
    await setFallbackLanguage('hi') // Hindi fallback
    await notifyUser('language_unavailable', { 
      requested: language,
      fallback: 'hi',
      canDownload: await isOnline()
    })
    
    if (await isOnline()) {
      await offerLanguageDownload(language)
    }
  }
}
```

#### 7. Sync Conflict Errors

**Scenario**: Local and cloud data conflict during sync

**Handling Strategy**:
- User preferences: Last-write-wins (use most recent timestamp)
- Compliance records: Merge (keep both if different, deduplicate if same)
- Profile data: Last-write-wins with user notification
- Query history: Keep both versions (queries are append-only)
- JHA sessions: Merge if same session, keep separate if different

**Implementation**:
```typescript
async function handleSyncConflict(conflict: SyncConflict): Promise<void> {
  const { entity, localVersion, remoteVersion } = conflict
  
  switch (entity) {
    case 'user_preferences':
      const winner = localVersion.updatedAt > remoteVersion.updatedAt 
        ? localVersion 
        : remoteVersion
      await applyVersion(winner)
      break
      
    case 'compliance_record':
      if (await areRecordsDifferent(localVersion, remoteVersion)) {
        await keepBothRecords(localVersion, remoteVersion)
      } else {
        await deduplicateRecord(localVersion)
      }
      break
      
    case 'user_profile':
      const profileWinner = localVersion.updatedAt > remoteVersion.updatedAt 
        ? localVersion 
        : remoteVersion
      await applyVersion(profileWinner)
      await notifyUser('profile_synced', { source: profileWinner === localVersion ? 'local' : 'cloud' })
      break
  }
}
```

### Error Logging and Monitoring

All errors are logged locally with:
- Error type and category
- Timestamp and user context
- Stack trace (if applicable)
- User action that triggered error
- Device and app version info

Logs are synced to cloud for analysis when connectivity available. Critical errors trigger immediate sync attempts.


## Testing Strategy

### Dual Testing Approach

KrishiRakshak requires both unit tests and property-based tests to ensure comprehensive correctness:

**Unit Tests**: Verify specific examples, edge cases, integration points, and error conditions
**Property Tests**: Verify universal properties across all inputs through randomization

Both approaches are complementary and necessary. Unit tests catch concrete bugs in specific scenarios, while property tests verify general correctness across the input space.

### Property-Based Testing Configuration

**Library Selection**:
- **JavaScript/TypeScript**: fast-check (for React Native components and business logic)
- **Python**: Hypothesis (for backend Lambda functions and data processing)

**Test Configuration**:
- Minimum 100 iterations per property test (due to randomization)
- Each property test must reference its design document property
- Tag format: `Feature: krishirakshak-agricultural-safety-assistant, Property {number}: {property_text}`

**Example Property Test**:
```typescript
import fc from 'fast-check'

// Feature: krishirakshak-agricultural-safety-assistant, Property 27: Query-response language consistency
describe('Query Processing', () => {
  it('should respond in the same language as the query', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          query: fc.string({ minLength: 10, maxLength: 200 }),
          language: fc.constantFrom('hi', 'ta', 'te', 'bn', 'mr', 'gu', 'kn', 'ml', 'pa', 'or'),
          context: fc.record({
            userId: fc.uuid(),
            cropTypes: fc.array(fc.string(), { minLength: 1, maxLength: 3 }),
            season: fc.constantFrom('kharif', 'rabi', 'zaid', 'summer')
          })
        }),
        async ({ query, language, context }) => {
          const response = await queryProcessor.processQuery(query, { ...context, language })
          
          // Verify response is in same language
          const detectedLanguage = await detectLanguage(response.answer)
          expect(detectedLanguage).toBe(language)
        }
      ),
      { numRuns: 100 }
    )
  })
})
```

### Unit Testing Strategy

Unit tests should focus on:

1. **Specific Examples**: Concrete scenarios that demonstrate correct behavior
2. **Edge Cases**: Boundary conditions, empty inputs, maximum values
3. **Error Conditions**: Invalid inputs, permission denials, network failures
4. **Integration Points**: Component interactions, data flow between layers

**Avoid writing too many unit tests** - property-based tests handle covering lots of inputs. Unit tests should be selective and focused.

### Test Coverage by Component

#### Voice Interface Tests

**Property Tests**:
- Property 1: Transcription accuracy across languages and query types
- Property 2: TTS conversion for all response types and languages
- Property 3: Error handling with clarification requests
- Property 4: Voice command completeness
- Property 5: Performance under 3 seconds

**Unit Tests**:
- Specific voice commands (e.g., "open camera", "show my profile")
- Background noise handling with specific noise types
- Language switching mid-session
- Microphone permission denial flow

#### Hazard Detector Tests

**Property Tests**:
- Property 6: Detection performance under 5 seconds
- Property 7: Recommendations for all detected hazards
- Property 8: Multiple hazard detection and ordering
- Property 9: Image quality feedback
- Property 10: Detection persistence

**Unit Tests**:
- Specific hazard types (pesticide container, unsafe machinery)
- Edge cases: Very dark images, very bright images, no hazards present
- Camera permission denial
- Gallery image selection flow

#### Query Processor Tests

**Property Tests**:
- Property 24: Cached embedding usage in offline mode
- Property 25: 85% accuracy threshold
- Property 26: Context-aware response variation
- Property 27: Language consistency
- Property 28: Low-confidence uncertainty indication
- Property 29: Source attribution

**Unit Tests**:
- Specific safety queries (e.g., "How to apply pesticide safely?")
- Empty query handling
- Very long queries (>500 characters)
- Queries with special characters or emojis

#### Sync Engine Tests

**Property Tests**:
- Property 17: Automatic sync on connectivity
- Property 19: Conflict resolution by data type
- Property 20: Sync prioritization
- Property 23: Deduplication

**Unit Tests**:
- Specific conflict scenarios (same record modified locally and remotely)
- Network interruption during sync
- Sync queue overflow (>1000 pending operations)
- Partial sync completion

#### Knowledge Graph Tests

**Property Tests**:
- Property 30: Graph-based recommendations
- Property 31: Crop-based seasonal suggestions
- Property 32: Location-based caching

**Unit Tests**:
- Specific graph queries (e.g., Rice → Pests → Pesticides → PPE)
- Graph traversal depth limits
- Missing node handling
- Circular relationship detection

### Performance Testing

**Offline Performance Benchmarks**:
- Voice query processing: <3 seconds (Property 5)
- Hazard detection: <5 seconds (Property 6)
- Database queries: <100ms for simple queries, <500ms for complex
- App startup: <2 seconds cold start, <1 second warm start

**Resource Benchmarks**:
- Storage: <100MB total (Property 18)
- Battery: <10% per hour active use (Property 43)
- Memory: <150MB RAM during normal operation
- CPU: <30% average during active use

**Load Testing**:
- Local database with 10,000 queries, 1,000 hazard detections, 500 JHA sessions
- Verify query performance remains under 3 seconds (Property 44)

### Integration Testing

**End-to-End Flows**:
1. New user onboarding → Profile creation → First voice query → Response
2. Hazard detection → Recommendation → JHA creation → Completion → Compliance record
3. Offline usage → Connectivity restored → Automatic sync → Conflict resolution
4. Government scheme eligibility → Notification → Scheme details → Application guidance

**Cross-Component Tests**:
- Voice query → Query processor → Knowledge graph → Safety advisor → TTS response
- Camera capture → Hazard detector → Safety advisor → JHA engine → Compliance tracker
- User profile update → Knowledge graph cache update → Recommendation refresh

### Accessibility Testing

**Manual Testing Required**:
- Voice navigation completeness (Property 46)
- Screen reader compatibility
- Font size compliance (Property 47)
- Color contrast ratios
- Touch target sizes (minimum 44x44 dp)

**Automated Tests**:
- Voice announcement for all tappable elements (Property 45)
- Minimum font size validation (Property 47)
- Voice error communication (Property 48)

### Security Testing

**Automated Tests**:
- Local data encryption verification (Property 49)
- TLS 1.3 connection validation (Property 50)
- Third-party data isolation (Property 51)
- Permission request flows (Property 52)
- Data deletion completeness (Property 53)

**Manual Security Audit**:
- Penetration testing of sync endpoints
- Code review for sensitive data handling
- Dependency vulnerability scanning
- OWASP Mobile Top 10 compliance

### Localization Testing

**Property Tests**:
- Language consistency across all features (Properties 2, 27, 45)
- Language extensibility (Property 54)

**Manual Testing**:
- Native speaker review for each of 10 languages
- Cultural appropriateness of icons and examples
- Right-to-left language support (if applicable)
- Regional terminology accuracy

### Cost Monitoring Tests

**Automated Tracking**:
- AWS service usage per user per month
- Target: <$0.10 per user per month
- Alert if costs exceed $0.12 per user

**Cost Breakdown Monitoring**:
- Bedrock LLM calls: Track token usage
- Rekognition: Track image analysis calls
- Polly/Transcribe: Track character/minute usage
- DynamoDB: Track read/write capacity units
- S3/CloudFront: Track bandwidth usage

### Test Data Management

**Synthetic Data Generation**:
- Generate realistic user profiles with Indian names, locations, crops
- Generate safety queries in all 10 languages
- Generate hazard images using image augmentation
- Generate JHA completion scenarios

**Test Data Privacy**:
- Never use real user data in tests
- Anonymize any production data used for model training
- Use synthetic images for hazard detection tests

### Continuous Integration

**Pre-Commit Checks**:
- Linting (ESLint for TypeScript)
- Type checking (TypeScript strict mode)
- Unit tests (fast tests only, <30 seconds)

**CI Pipeline**:
- All unit tests
- All property tests (100 iterations each)
- Integration tests
- Performance benchmarks
- Security scans
- Build for Android (debug and release)

**Nightly Tests**:
- Extended property tests (1000 iterations each)
- Load testing with large datasets
- Full end-to-end test suite
- Accessibility audit

### Test Metrics and Goals

**Coverage Targets**:
- Line coverage: >80% for business logic
- Branch coverage: >75% for business logic
- Property coverage: 100% of design properties tested

**Quality Gates**:
- All property tests must pass (100 iterations minimum)
- No critical or high severity bugs
- Performance benchmarks must meet targets
- Security scans must show no high/critical vulnerabilities

**Regression Prevention**:
- Every bug fix must include a test that would have caught the bug
- Property tests should be added for any discovered edge cases
- Performance regressions trigger build failures


## Cost Optimization Strategies

### Target: <$0.10 per user per month

#### Cost Breakdown and Optimization

**1. AWS Bedrock (LLM) - Target: $0.03/user/month**

Optimization strategies:
- Use Claude 3 Haiku ($0.25/1M input tokens, $1.25/1M output tokens)
- Cache responses locally for 7 days (reduce repeat queries)
- Batch queries during sync (reduce API calls)
- Use lightweight on-device inference for common queries
- Limit context window to 4K tokens (reduce input costs)

Calculation:
- Assume 30 queries/user/month
- 70% answered from cache (offline) = 9 cloud queries
- Average 500 input tokens, 200 output tokens per query
- Cost: (9 × 500 × $0.25/1M) + (9 × 200 × $1.25/1M) = $0.0034/user/month

**2. AWS Kendra (RAG) - Target: $0.016/user/month**

Optimization strategies:
- Use Developer Edition ($810/month flat fee)
- Share across all users (50K users = $0.016/user)
- Cache top 1000 documents locally per user
- Only query Kendra for new/complex questions
- Update index weekly, not real-time

Calculation:
- $810/month ÷ 50,000 users = $0.016/user/month

**3. AWS Rekognition - Target: $0.005/user/month**

Optimization strategies:
- Use local MobileNetV3 model for 80% of hazards
- Only send complex/unknown hazards to Rekognition
- Batch image analysis when online
- Cache hazard detection results

Calculation:
- Assume 10 hazard detections/user/month
- 80% handled locally = 2 cloud calls
- Cost: 2 × $0.001 = $0.002/user/month

**4. AWS Polly (TTS) - Target: $0.01/user/month**

Optimization strategies:
- Pre-generate and cache 500 most common phrases
- Use lightweight local TTS (eSpeak-ng) for dynamic content
- Only use Polly for high-quality neural voices when needed
- Cache generated audio for 30 days

Calculation:
- Assume 5,000 characters TTS/user/month
- 80% from cache = 1,000 characters via Polly
- Cost: 1,000 × $4/1M = $0.004/user/month

**5. AWS Transcribe (STT) - Target: $0.002/user/month**

Optimization strategies:
- Use local DeepSpeech models for all transcription
- Only use Transcribe for collecting training data (1% of users)
- Batch transcription jobs

Calculation:
- 99% users use local STT = $0
- 1% users for training: 5 minutes/month × $0.024/min × 0.01 = $0.0012/user/month

**6. AWS Neptune (Knowledge Graph) - Target: $0.02/user/month**

Optimization strategies:
- Use db.t3.medium instance ($0.073/hour = $53/month)
- Cache user-relevant subgraphs locally (~5MB)
- Update local cache monthly
- Share instance across all users

Calculation:
- $53/month ÷ 50,000 users = $0.001/user/month
- Add data transfer: $0.01/GB × 5MB × 50K users = $2,500/month ÷ 50K = $0.05/user/month
- Optimize with CloudFront caching: Reduce to $0.01/user/month

**7. AWS AppSync - Target: $0.01/user/month**

Optimization strategies:
- Batch sync operations (max 50 per batch)
- Sync only when WiFi available (reduce mobile data costs)
- Use GraphQL query batching
- Cache subscription data locally

Calculation:
- Assume 100 sync operations/user/month
- 70% offline = 30 cloud operations
- Cost: 30 × $4/1M = $0.00012/user/month

**8. Amazon S3 + CloudFront - Target: $0.01/user/month**

Optimization strategies:
- Use S3 Standard-IA for infrequently accessed models
- CloudFront caching in India regions (Mumbai, Hyderabad)
- Compress models (quantization, pruning)
- Incremental model updates (delta downloads)

Calculation:
- Storage: 100MB models × $0.0125/GB = $0.00125/month (shared)
- Transfer: 10MB/user/month × $0.085/GB = $0.00085/user/month
- CloudFront: 10MB × $0.17/GB (India) = $0.0017/user/month
- Total: ~$0.003/user/month

**9. Amazon DynamoDB - Target: $0.015/user/month**

Optimization strategies:
- Use on-demand pricing (no reserved capacity)
- Single-table design (reduce table count)
- Sparse indexes (only index what's needed)
- TTL for query logs (auto-delete after 90 days)
- Batch write operations

Calculation:
- Assume 50 writes, 100 reads per user/month
- Write: 50 × $1.25/1M = $0.0000625
- Read: 100 × $0.25/1M = $0.000025
- Storage: 1KB/user × $0.25/GB = $0.00000025
- Total: ~$0.0001/user/month

**10. AWS Lambda - Target: $0.005/user/month**

Optimization strategies:
- Use ARM-based Graviton2 (20% cheaper)
- Optimize memory allocation (128MB-512MB)
- Minimize cold starts with provisioned concurrency for critical functions
- Batch processing where possible

Calculation:
- Assume 50 invocations/user/month
- Average 200ms duration, 256MB memory
- Cost: 50 × 0.2s × 256MB × $0.0000166667/GB-second = $0.0004/user/month

**Total Estimated Cost: $0.092/user/month**

This is below the $0.10 target with buffer for:
- Unexpected usage spikes
- New feature additions
- Data transfer overages
- Support and monitoring costs

### Cost Monitoring and Alerts

**Real-time Monitoring**:
- CloudWatch dashboards tracking per-service costs
- Daily cost reports by user cohort
- Alerts when costs exceed $0.12/user/month

**Cost Attribution**:
- Tag all resources with `Project: KrishiRakshak`
- Track costs by feature (voice, hazard detection, sync)
- Identify high-cost users for optimization

**Optimization Triggers**:
- If Bedrock costs >$0.05/user: Increase cache hit rate
- If Rekognition costs >$0.01/user: Improve local model accuracy
- If data transfer >$0.02/user: Increase compression, reduce sync frequency


## Deployment Architecture

### Infrastructure Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         AWS Cloud                            │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                    CloudFront CDN                       │ │
│  │  (India Edge Locations: Mumbai, Hyderabad, Chennai)    │ │
│  └────────┬───────────────────────────────────────────────┘ │
│           │                                                  │
│  ┌────────▼───────────┐  ┌──────────────────────────────┐  │
│  │   S3 Buckets       │  │   API Gateway                 │  │
│  │  - ML Models       │  │  - REST APIs                  │  │
│  │  - TTS Audio Cache │  │  - WebSocket (AppSync)        │  │
│  │  - JHA Templates   │  │                               │  │
│  └────────────────────┘  └──────────┬───────────────────┘  │
│                                     │                        │
│  ┌──────────────────────────────────▼───────────────────┐  │
│  │              Lambda Functions (Graviton2)            │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐ │  │
│  │  │  Sync    │ │  Query   │ │  Model   │ │Analytics│ │  │
│  │  │ Handler  │ │Processor │ │ Updater  │ │Aggregator│ │  │
│  │  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬────┘ │  │
│  └───────┼────────────┼────────────┼──────────────┼──────┘  │
│          │            │            │              │          │
│  ┌───────▼────────────▼────────────▼──────────────▼──────┐  │
│  │                  AWS Services Layer                    │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │  │
│  │  │ DynamoDB │ │  Bedrock │ │  Kendra  │ │  Neptune │ │  │
│  │  │          │ │ (Claude) │ │   (RAG)  │ │  (Graph) │ │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐              │  │
│  │  │Rekognition│ │  Polly   │ │Transcribe│              │  │
│  │  │  (Images) │ │  (TTS)   │ │  (STT)   │              │  │
│  │  └──────────┘ └──────────┘ └──────────┘              │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Monitoring & Logging                       │ │
│  │  - CloudWatch Logs & Metrics                           │ │
│  │  - X-Ray Tracing                                       │ │
│  │  - Cost Explorer                                       │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
                           │
                           │ HTTPS/WSS
                           │
┌──────────────────────────▼───────────────────────────────────┐
│                   Mobile Devices                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         React Native App (Android 8+)                  │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │ │
│  │  │ Local SQLite │  │ Cached Models│  │ Sync Engine │ │ │
│  │  │   Database   │  │  (~80MB)     │  │             │ │ │
│  │  └──────────────┘  └──────────────┘  └─────────────┘ │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

### Deployment Environments

#### 1. Development Environment

**Purpose**: Developer testing and feature development

**Configuration**:
- Single AWS account (dev)
- Minimal resources (t3.micro instances)
- Shared services across developers
- Mock data and synthetic users
- No cost optimization (focus on speed)

**Access**:
- Developers have full access
- No production data
- Separate S3 buckets for models

#### 2. Staging Environment

**Purpose**: Pre-production testing and QA

**Configuration**:
- Separate AWS account (staging)
- Production-like setup but smaller scale
- 1,000 test users
- Real ML models
- Cost monitoring enabled

**Testing**:
- Full integration tests
- Performance benchmarks
- Security scans
- Load testing (up to 5K concurrent users)

**Access**:
- QA team and developers
- Anonymized production data for testing
- Separate DynamoDB tables

#### 3. Production Environment

**Purpose**: Live user traffic

**Configuration**:
- Separate AWS account (production)
- Multi-region setup (primary: ap-south-1 Mumbai)
- Auto-scaling enabled
- Full monitoring and alerting
- Backup and disaster recovery

**Regions**:
- Primary: ap-south-1 (Mumbai, India)
- Backup: ap-south-2 (Hyderabad, India) - for disaster recovery
- CloudFront edge locations across India

**Access**:
- Restricted access (DevOps team only)
- All changes via CI/CD pipeline
- Audit logging enabled

### CI/CD Pipeline

#### Source Control

**Repository Structure**:
```
krishirakshak/
├── mobile/                 # React Native app
│   ├── src/
│   ├── android/
│   ├── __tests__/
│   └── package.json
├── backend/                # Lambda functions
│   ├── sync-handler/
│   ├── query-processor/
│   ├── model-updater/
│   └── analytics-aggregator/
├── infrastructure/         # Terraform/CloudFormation
│   ├── dev/
│   ├── staging/
│   └── production/
├── ml-models/             # Model training scripts
│   ├── hazard-detection/
│   ├── embeddings/
│   └── training-data/
└── docs/                  # Documentation
```

#### Build Pipeline

**Trigger**: Push to main branch or pull request

**Steps**:
1. **Lint & Type Check** (2 min)
   - ESLint for TypeScript
   - TypeScript strict mode compilation
   - Python flake8 for Lambda functions

2. **Unit Tests** (5 min)
   - Jest for React Native components
   - Pytest for Lambda functions
   - Coverage report generation

3. **Property Tests** (10 min)
   - fast-check tests (100 iterations)
   - Hypothesis tests (100 iterations)
   - Property coverage validation

4. **Build Mobile App** (8 min)
   - Android debug build
   - Android release build (signed)
   - Generate APK and AAB

5. **Build Lambda Functions** (3 min)
   - Package dependencies
   - Create deployment packages
   - Upload to S3

6. **Security Scans** (5 min)
   - Dependency vulnerability scan (npm audit, safety)
   - SAST (Static Application Security Testing)
   - Secrets detection

7. **Deploy to Staging** (10 min)
   - Deploy Lambda functions
   - Update DynamoDB tables
   - Deploy mobile app to internal testing track

8. **Integration Tests** (15 min)
   - End-to-end test suite
   - API integration tests
   - Sync engine tests

9. **Performance Tests** (10 min)
   - Load testing (1K concurrent users)
   - Response time validation
   - Resource usage monitoring

10. **Approval Gate** (Manual)
    - QA team approval required
    - Product owner sign-off

11. **Deploy to Production** (15 min)
    - Blue-green deployment
    - Gradual rollout (10% → 50% → 100%)
    - Automated rollback on errors

**Total Pipeline Time**: ~83 minutes (excluding manual approval)

#### Deployment Strategy

**Mobile App Deployment**:
- Google Play Store (internal testing → closed testing → open testing → production)
- Staged rollout: 10% day 1, 25% day 2, 50% day 3, 100% day 4
- Automatic rollback if crash rate >1%

**Backend Deployment**:
- Blue-green deployment for Lambda functions
- Canary deployment: 5% traffic to new version for 1 hour
- Automatic rollback if error rate >0.5% or latency >2x baseline
- Database migrations run before deployment with rollback scripts ready

### Monitoring and Observability

#### Application Metrics

**Mobile App Metrics** (tracked locally, synced when online):
- App crashes and ANRs (Application Not Responding)
- Feature usage (voice queries, hazard detections, JHA completions)
- Offline usage percentage
- Sync success/failure rates
- Battery consumption
- Storage usage
- Performance metrics (query response time, detection time)

**Backend Metrics** (CloudWatch):
- Lambda invocation count, duration, errors
- API Gateway request count, latency, 4xx/5xx errors
- DynamoDB read/write capacity, throttles
- Bedrock token usage, latency
- Rekognition image analysis count
- Sync queue depth
- Cost per user per day

#### Logging

**Mobile App Logs**:
- Error logs (crashes, exceptions)
- Performance logs (slow queries, timeouts)
- User action logs (anonymized)
- Sync logs (conflicts, failures)
- Stored locally, synced to CloudWatch when online

**Backend Logs**:
- Lambda function logs (CloudWatch Logs)
- API Gateway access logs
- DynamoDB query logs (for slow queries)
- Sync operation logs
- Cost tracking logs

**Log Retention**:
- Error logs: 90 days
- Performance logs: 30 days
- User action logs: 7 days (anonymized)
- Cost logs: 365 days

#### Alerting

**Critical Alerts** (PagerDuty, immediate response):
- App crash rate >1%
- API error rate >5%
- Sync failure rate >10%
- Database unavailable
- Cost spike >150% of baseline

**Warning Alerts** (Slack, response within 1 hour):
- App crash rate >0.5%
- API latency >2 seconds (p95)
- Sync queue depth >10,000
- Storage usage >90MB per user
- Cost >$0.12 per user per month

**Info Alerts** (Email, daily digest):
- New user signups
- Feature usage trends
- Model accuracy metrics
- Cost optimization opportunities

#### Dashboards

**Operations Dashboard**:
- Real-time user count
- Active sync operations
- API request rate
- Error rate by service
- Cost per user (daily)

**Product Dashboard**:
- Daily/weekly/monthly active users
- Feature adoption rates
- Query accuracy trends
- Hazard detection accuracy
- User retention cohorts

**Cost Dashboard**:
- Cost by AWS service
- Cost per user trend
- Cost optimization opportunities
- Budget vs actual

### Disaster Recovery

#### Backup Strategy

**Mobile App Data**:
- Automatically backed up to cloud during sync
- User can manually trigger backup
- Backup includes: profile, queries, compliance records, JHA sessions

**Cloud Data**:
- DynamoDB: Point-in-time recovery enabled (35 days)
- S3: Versioning enabled, lifecycle policy to Glacier after 90 days
- Neptune: Daily automated snapshots, retained for 30 days
- Lambda: Code stored in S3 with versioning

#### Recovery Procedures

**Mobile App Data Loss**:
1. User reinstalls app
2. User logs in with phone number
3. App restores data from cloud backup
4. If cloud unavailable, app starts fresh with empty database

**Cloud Service Outage**:
1. App continues operating in offline mode
2. Sync operations queued locally
3. When service restored, automatic sync resumes
4. No data loss due to offline-first architecture

**Regional Failure** (Mumbai region down):
1. DNS failover to Hyderabad region (automatic, <5 minutes)
2. Lambda functions deployed in both regions
3. DynamoDB global tables for cross-region replication
4. S3 cross-region replication for models and assets
5. Users experience brief interruption, then automatic reconnection

**Complete Data Loss** (catastrophic failure):
1. Restore DynamoDB from point-in-time recovery
2. Restore S3 from versioned backups
3. Restore Neptune from latest snapshot
4. Redeploy Lambda functions from S3
5. Estimated recovery time: 2-4 hours

#### Testing Disaster Recovery

**Quarterly DR Drills**:
- Simulate regional failure, test failover
- Restore from backups in staging environment
- Validate data integrity after restore
- Measure recovery time objectives (RTO) and recovery point objectives (RPO)

**Targets**:
- RTO (Recovery Time Objective): 4 hours
- RPO (Recovery Point Objective): 1 hour (max data loss)

### Security Hardening

#### Network Security

**VPC Configuration**:
- Lambda functions in private subnets
- NAT Gateway for outbound internet access
- Security groups restricting inbound traffic
- VPC endpoints for AWS services (no internet routing)

**API Security**:
- API Gateway with AWS WAF (Web Application Firewall)
- Rate limiting: 100 requests/minute per user
- DDoS protection via AWS Shield
- HTTPS only (TLS 1.3)

#### Data Security

**Encryption**:
- Data at rest: AES-256 encryption for DynamoDB, S3, Neptune
- Data in transit: TLS 1.3 for all connections
- Mobile app: SQLite database encrypted with SQLCipher

**Access Control**:
- IAM roles with least privilege principle
- Lambda functions have minimal permissions
- No hardcoded credentials (use AWS Secrets Manager)
- MFA required for production access

#### Compliance

**Data Residency**:
- All user data stored in India (Mumbai region)
- Compliant with Indian data protection regulations
- No data transfer outside India without consent

**Audit Logging**:
- CloudTrail enabled for all API calls
- Audit logs retained for 1 year
- Regular security audits (quarterly)

### Scalability Plan

#### Current Scale (Launch)

- Target: 50,000 users in 6 months
- 70% offline usage = 15,000 concurrent online users (peak)
- 30 queries/user/month = 1.5M queries/month
- 10 hazard detections/user/month = 500K detections/month

#### Scaling Triggers

**Lambda Auto-Scaling**:
- Provisioned concurrency for sync-handler (100 instances)
- Auto-scale up to 1,000 concurrent executions
- Scale down during off-peak hours (night)

**DynamoDB Auto-Scaling**:
- On-demand capacity mode (automatic scaling)
- Monitor for throttling, increase provisioned capacity if needed

**Neptune Scaling**:
- Start with db.t3.medium
- Scale to db.r5.large at 100K users
- Read replicas for query load distribution

**S3/CloudFront**:
- Automatically scales (no configuration needed)
- Monitor bandwidth costs, optimize compression

#### Future Scale (1 Year)

- Target: 500,000 users
- Estimated costs: $0.08/user/month (economies of scale)
- Multi-region deployment for redundancy
- Dedicated Kendra instance per region

### Performance Optimization

#### Mobile App Optimization

**Code Splitting**:
- Lazy load features (JHA templates, government schemes)
- Load language models on-demand
- Reduce initial app size to <50MB

**Image Optimization**:
- Compress hazard detection images before storage
- Use WebP format for cached images
- Lazy load images in lists

**Database Optimization**:
- Index frequently queried columns
- Vacuum SQLite database weekly
- Archive old data (>90 days) to separate table

#### Backend Optimization

**Lambda Optimization**:
- Use ARM-based Graviton2 processors (20% faster, 20% cheaper)
- Optimize memory allocation (right-size for workload)
- Reuse connections (database, HTTP clients)
- Minimize cold starts with provisioned concurrency

**Caching Strategy**:
- CloudFront caching for static assets (models, templates)
- DynamoDB DAX for frequently accessed data
- Redis cache for session data (if needed)

**Query Optimization**:
- Use DynamoDB single-table design (reduce queries)
- Batch operations where possible
- Use sparse indexes (only index what's needed)


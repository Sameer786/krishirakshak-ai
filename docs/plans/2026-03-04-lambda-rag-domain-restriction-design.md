# Lambda RAG + Domain Restriction Design

**Date:** 2026-03-04
**Status:** Approved
**Target:** `lambda/ask-safety-question/index.mjs`

## Goal

Add RAG (Retrieval Augmented Generation) via Amazon Bedrock Knowledge Bases and domain restriction to the ask-safety-question Lambda. Existing Q&A behavior for farming questions must NOT change. RAG only adds a "verified" indicator when documents ARE found. Off-domain questions are politely declined.

## Architecture

```
                    ┌─────────────────┐
                    │  User question  │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │ searchKnowledge │
                    │     Base()      │
                    └────────┬────────┘
                             │
                 ┌───────────┴───────────┐
                 │                       │
          ragResult found          ragResult null
                 │                       │
          ┌──────▼──────┐        ┌───────▼───────┐
          │  RAG prompt │        │ Existing prompt│
          │  (grounded  │        │ (SYSTEM_PROMPT)│
          │  in docs)   │        │   unchanged    │
          └──────┬──────┘        └───────┬───────┘
                 │                       │
                 └───────────┬───────────┘
                             │
                  domainRestriction prepended
                  to BOTH prompt paths
                             │
                    ┌────────▼────────┐
                    │ Converse API    │
                    │ (same as today) │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  Response JSON  │
                    │ ALL existing    │
                    │ fields kept +   │
                    │ isRAG, ragSources│
                    │ ragConfidence   │
                    └─────────────────┘
```

## Changes

### 1. New dependency
`@aws-sdk/client-bedrock-agent-runtime` added to package.json.

### 2. New client + constant
`BedrockAgentRuntimeClient` + `KNOWLEDGE_BASE_ID = "PIMCAVAB8S"` alongside existing Bedrock client.

### 3. New function `searchKnowledgeBase(query)`
- Calls `RetrieveCommand` with 5 results
- Filters by score > 0.4
- Extracts context text + source filenames
- Returns `{ context, sources, score, resultCount }` or `null`
- Wrapped in try/catch — returns `null` on failure (silent fallback)

### 4. Handler changes
- RAG search runs BEFORE prompt construction
- `domainRestriction` text block prepended to BOTH prompt paths
- RAG path: new prompt grounded in retrieved documents
- Fallback path: existing `SYSTEM_PROMPT` constant unchanged, domain restriction prepended

### 5. Response body
Existing fields stay untouched. Three new fields added:
- `isRAG` (boolean) — true when RAG documents were found
- `ragSources` (string|null) — comma-separated source names
- `ragConfidence` (number|null) — score as percentage (0-100)

### 6. Build
`npm install` + zip for manual AWS upload.

## What does NOT change
- Fallback system prompt (byte-for-byte same `SYSTEM_PROMPT` constant)
- `extractSources()` and `estimateConfidence()` functions
- All existing response fields and their values
- Error handling (throttle, access denied, validation, generic)
- CORS headers, parseBody, response helper

## Risk mitigation
RAG search wrapped in try/catch returning `null` on failure — Knowledge Base unreachable = silent fallback to existing behavior.

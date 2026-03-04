# Lambda RAG + Domain Restriction Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add RAG via Bedrock Knowledge Bases and domain restriction to the ask-safety-question Lambda, preserving all existing fallback behavior.

**Architecture:** The handler calls `searchKnowledgeBase()` before building the prompt. If RAG results are found (score > 0.4), a document-grounded prompt is used. Otherwise, the existing `SYSTEM_PROMPT` is used unchanged. A `domainRestriction` block is prepended to both paths. Three new fields are added to the response.

**Tech Stack:** AWS Lambda (Node.js 18, ES modules), `@aws-sdk/client-bedrock-agent-runtime`, Amazon Bedrock Knowledge Bases, Amazon Nova Lite via Converse API.

---

### Task 1: Update package.json dependency

**Files:**
- Modify: `lambda/ask-safety-question/package.json`

**Step 1: Add the new SDK dependency**

In `lambda/ask-safety-question/package.json`, add to `dependencies`:

```json
"@aws-sdk/client-bedrock-agent-runtime": "^3.600.0"
```

Result should be:
```json
{
  "name": "ask-safety-question",
  "version": "1.0.0",
  "description": "KrishiRakshak Lambda — agricultural safety Q&A via Amazon Nova Lite (Bedrock Converse API)",
  "type": "module",
  "dependencies": {
    "@aws-sdk/client-bedrock-runtime": "^3.700.0",
    "@aws-sdk/client-bedrock-agent-runtime": "^3.600.0"
  }
}
```

**Step 2: Commit**

```bash
git add lambda/ask-safety-question/package.json
git commit -m "[RAG] Add bedrock-agent-runtime dependency to package.json"
```

---

### Task 2: Add import, client, and searchKnowledgeBase function

**Files:**
- Modify: `lambda/ask-safety-question/index.mjs` (lines 1-10, insert new code before handler at line 111)

**Step 1: Add import at line 1**

Add this import alongside the existing one (do NOT remove the existing import):

```js
import { BedrockAgentRuntimeClient, RetrieveCommand } from "@aws-sdk/client-bedrock-agent-runtime";
```

**Step 2: Add RAG client after existing client (after line 10)**

Add these two lines right after `const client = new BedrockRuntimeClient({ region: REGION })`:

```js
const ragClient = new BedrockAgentRuntimeClient({ region: "ap-south-1" });
const KNOWLEDGE_BASE_ID = "PIMCAVAB8S";
```

**Step 3: Add searchKnowledgeBase function before handler**

Insert this function BEFORE `export const handler = async (event) => {` (currently line 111):

```js
async function searchKnowledgeBase(query) {
  try {
    const command = new RetrieveCommand({
      knowledgeBaseId: KNOWLEDGE_BASE_ID,
      retrievalQuery: { text: query },
      retrievalConfiguration: {
        vectorSearchConfiguration: {
          numberOfResults: 5,
        },
      },
    });
    const response = await ragClient.send(command);
    if (response.retrievalResults && response.retrievalResults.length > 0) {
      const relevantResults = response.retrievalResults.filter(
        (r) => r.score > 0.4
      );
      if (relevantResults.length > 0) {
        const context = relevantResults
          .map((r) => r.content.text)
          .join("\n\n---\n\n");
        const sources = relevantResults.map((r) => {
          const uri = r.location?.s3Location?.uri || "Knowledge Base";
          const fileName = uri.split("/").pop() || "Official Document";
          return fileName
            .replace(".txt", "")
            .replace(".pdf", "")
            .replace(/-/g, " ")
            .replace(/_/g, " ");
        });
        return {
          context,
          sources: [...new Set(sources)].slice(0, 2),
          score: relevantResults[0].score,
          resultCount: relevantResults.length,
        };
      }
    }
    return null;
  } catch (error) {
    console.error("Knowledge Base search error:", error);
    return null;
  }
}
```

**Step 4: Commit**

```bash
git add lambda/ask-safety-question/index.mjs
git commit -m "[RAG] Add Knowledge Base client and searchKnowledgeBase function"
```

---

### Task 3: Modify handler — RAG search + domain restriction + conditional prompt

**Files:**
- Modify: `lambda/ask-safety-question/index.mjs` (inside handler function, around lines 154-168)

**Step 1: Add RAG search + domain restriction + conditional prompt**

Inside the handler's `try` block, REPLACE the section from the console.log through the ConverseCommand call (lines 156-168 in current code) with:

```js
    // Search Knowledge Base first
    const ragResult = await searchKnowledgeBase(trimmedQuestion);

    // DOMAIN RESTRICTION - applies to BOTH RAG and fallback modes
    const domainRestriction = `
IMPORTANT DOMAIN RESTRICTION: You are ONLY an agricultural safety assistant.
If the question is NOT related to agriculture, farming, crops, livestock, pesticides,
farm machinery, rural safety, government schemes for farmers, weather/climate for farming,
animal husbandry, dairy farming, irrigation, soil health, or any farming-related topic —
politely decline by responding ONLY with:
If the question was in Hindi or Hinglish:
"मैं केवल कृषि सुरक्षा से जुड़े सवालों का जवाब दे सकता हूँ। कृपया खेती, फसल, कीटनाशक, या कृषि सुरक्षा से संबंधित प्रश्न पूछें। 🌾"
If the question was in English:
"I can only answer questions related to agricultural safety. Please ask about farming, crops, pesticides, farm machinery, government schemes for farmers, or farm safety. 🌾"
Do NOT answer questions about technology, politics, entertainment, sports, coding, science unrelated to agriculture, general knowledge, history unrelated to farming, or any non-farming topic. Be strict about this.
`;

    let systemPrompt;
    if (ragResult && ragResult.context) {
      // RAG MODE - Answer grounded in official documents
      systemPrompt = `${domainRestriction}

You are KrishiRakshak (कृषि रक्षक), an AI agricultural safety assistant for Indian farmers.

CRITICAL: Answer the farmer's question using the official reference documents provided below. Your answer MUST be primarily based on these documents. If the documents do not contain enough information to fully answer the question, you may supplement with your general agricultural knowledge but prioritize document content.

If the reference documents have no relevant information at all for the question, clearly say:
In Hindi: "यह जानकारी हमारे आधिकारिक दस्तावेज़ों में पूर्ण रूप से उपलब्ध नहीं है। कृपया अपने नजदीकी कृषि विज्ञान केंद्र (KVK) से संपर्क करें।"
In English: "This information is not fully available in our official documents. Please contact your nearest Krishi Vigyan Kendra (KVK)."

Do NOT fabricate safety dosages, chemical names, or procedures not in the documents.

REFERENCE DOCUMENTS FROM OFFICIAL SOURCES:
${ragResult.context}

RESPONSE RULES:
- If the question is in Hindi or Hinglish, respond in Hindi
- If the question is in English, respond in English
- Use bold (**text**) for important safety warnings
- Use bullet points for step-by-step instructions
- Include PPE recommendations when discussing chemicals or machinery
- Keep responses concise and farmer-friendly
- Mention relevant government schemes when applicable`;
    } else {
      // FALLBACK MODE - existing SYSTEM_PROMPT unchanged, domain restriction prepended
      systemPrompt = domainRestriction + '\n\n' + SYSTEM_PROMPT;
    }

    console.log('[Bedrock] Calling Converse API:', {
      model: MODEL_ID,
      language: langKey,
      questionLength: trimmedQuestion.length,
      ragMode: ragResult ? true : false,
      ragResultCount: ragResult?.resultCount || 0,
    })

    const bedrockResponse = await client.send(
      new ConverseCommand({
        modelId: MODEL_ID,
        system: [{ text: systemPrompt + langInstruction }],
        messages: [{ role: 'user', content: [{ text: userMessage }] }],
        inferenceConfig: {
          maxTokens: MAX_TOKENS,
          temperature: 0.3,
        },
      })
    )
```

Note: The existing code from `const answer = ...` through the response return stays EXACTLY the same in this step. We modify only the prompt construction and Converse call.

**Step 2: Commit**

```bash
git add lambda/ask-safety-question/index.mjs
git commit -m "[RAG] Add RAG search, domain restriction, and conditional prompt to handler"
```

---

### Task 4: Add new fields to response body

**Files:**
- Modify: `lambda/ask-safety-question/index.mjs` (response return, around line 179 in current code)

**Step 1: Add isRAG, ragSources, ragConfidence to response**

Find the existing return statement:
```js
    return response(200, {
      answer,
      language: langKey,
      sources,
      confidence,
      source: 'bedrock-nova-lite',
      timestamp: new Date().toISOString(),
    })
```

Replace with (adds 3 new fields, ALL existing fields unchanged):
```js
    return response(200, {
      answer,
      language: langKey,
      sources,
      confidence,
      source: 'bedrock-nova-lite',
      timestamp: new Date().toISOString(),
      isRAG: ragResult ? true : false,
      ragSources: ragResult ? ragResult.sources.join(", ") : null,
      ragConfidence: ragResult ? Math.round(ragResult.score * 100) : null,
    })
```

**Step 2: Commit**

```bash
git add lambda/ask-safety-question/index.mjs
git commit -m "[RAG] Add isRAG, ragSources, ragConfidence to response body"
```

---

### Task 5: Install dependencies and build zip

**Step 1: npm install**

```bash
cd lambda/ask-safety-question
npm install
```

Expected: `@aws-sdk/client-bedrock-agent-runtime` installed in `node_modules/`.

**Step 2: Build the zip**

```bash
cd lambda/ask-safety-question
zip -r ../ask-safety-question.zip .
```

Expected: `lambda/ask-safety-question.zip` created containing `index.mjs`, `package.json`, `node_modules/`, `package-lock.json`.

**Step 3: Commit the zip and lockfile**

```bash
git add lambda/ask-safety-question/package-lock.json lambda/ask-safety-question.zip
git commit -m "[RAG] Build Lambda zip with RAG dependencies"
```

**Step 4: Push to main**

Use the standard merge workflow:
```bash
cd "C:/Users/GhaziAnwer/krishirakshak-pwa"
git checkout main
git merge claude/laughing-brown --no-edit
git push origin main
```

---

### Verification Checklist

After implementation, verify:
- [ ] `index.mjs` has both imports (bedrock-runtime AND bedrock-agent-runtime)
- [ ] `ragClient` and `KNOWLEDGE_BASE_ID` declared after existing `client`
- [ ] `searchKnowledgeBase()` function exists before handler
- [ ] Handler calls `searchKnowledgeBase(trimmedQuestion)` before prompt
- [ ] `domainRestriction` variable used in BOTH prompt paths
- [ ] Fallback prompt = `domainRestriction + '\n\n' + SYSTEM_PROMPT` (existing constant unchanged)
- [ ] RAG prompt includes `${ragResult.context}` interpolation
- [ ] Response has all 6 original fields + 3 new fields (isRAG, ragSources, ragConfidence)
- [ ] `extractSources()` and `estimateConfidence()` functions NOT modified
- [ ] Error handling (throttle, access denied, validation, generic) NOT modified
- [ ] `package.json` has both SDK dependencies
- [ ] `ask-safety-question.zip` built with node_modules included
- [ ] All changes committed and pushed to main

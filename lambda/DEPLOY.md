# KrishiRakshak — Lambda Deployment Guide

Complete guide for deploying both Lambda functions and connecting them to the PWA.

## Prerequisites

- **AWS CLI** installed and configured (`aws configure`)
- **Node.js 18+** installed locally
- **AWS account** with hackathon credits redeemed
- **Bedrock access** enabled in `ap-south-1` (request model access for Claude 3 Haiku)
- **Rekognition** available in `ap-south-1` (enabled by default)

---

## Step 1 — Install Dependencies

```bash
# Safety Q&A Lambda
cd lambda/ask-safety-question
npm install

# Hazard Detection Lambda
cd ../analyze-hazards
npm install
```

---

## Step 2 — Create ZIP Files

### Linux / macOS / Git Bash

```bash
cd lambda/ask-safety-question
zip -r ../ask-safety-question.zip .

cd ../analyze-hazards
zip -r ../analyze-hazards.zip .
```

### Windows PowerShell

```powershell
cd lambda\ask-safety-question
Compress-Archive -Path * -DestinationPath ..\ask-safety-question.zip -Force

cd ..\analyze-hazards
Compress-Archive -Path * -DestinationPath ..\analyze-hazards.zip -Force
```

---

## Step 3 — Create IAM Role

Both Lambdas share one execution role.

### 3a. Create the role (Console)

1. Go to **IAM > Roles > Create role**
2. Trusted entity: **AWS service > Lambda**
3. Name: `krishirakshak-lambda-role`
4. Attach managed policy: `AWSLambdaBasicExecutionRole`

### 3b. Add inline policy for Bedrock + Rekognition

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "BedrockAccess",
      "Effect": "Allow",
      "Action": ["bedrock:InvokeModel"],
      "Resource": [
        "arn:aws:bedrock:ap-south-1::foundation-model/anthropic.claude-3-haiku-20240307-v1:0"
      ]
    },
    {
      "Sid": "RekognitionAccess",
      "Effect": "Allow",
      "Action": ["rekognition:DetectLabels"],
      "Resource": "*"
    }
  ]
}
```

Name the policy `krishirakshak-services-policy`.

### 3c. Create via CLI (alternative)

```bash
# Create role
aws iam create-role \
  --role-name krishirakshak-lambda-role \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Principal": {"Service": "lambda.amazonaws.com"},
      "Action": "sts:AssumeRole"
    }]
  }'

# Attach basic execution
aws iam attach-role-policy \
  --role-name krishirakshak-lambda-role \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

# Add Bedrock + Rekognition inline policy
aws iam put-role-policy \
  --role-name krishirakshak-lambda-role \
  --policy-name krishirakshak-services-policy \
  --policy-document '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Action": ["bedrock:InvokeModel"],
        "Resource": ["arn:aws:bedrock:ap-south-1::foundation-model/anthropic.claude-3-haiku-20240307-v1:0"]
      },
      {
        "Effect": "Allow",
        "Action": ["rekognition:DetectLabels"],
        "Resource": "*"
      }
    ]
  }'
```

---

## Step 4 — Create Lambda Functions

### 4a. Safety Q&A Lambda (Console)

1. **Lambda > Create function**
2. Settings:
   - Name: `krishirakshak-ask-safety`
   - Runtime: **Node.js 18.x**
   - Architecture: **arm64**
   - Execution role: `krishirakshak-lambda-role`
   - Handler: `index.handler`
3. Upload ZIP: **Code > Upload from > .zip file** → `ask-safety-question.zip`
4. **Configuration > General**: Timeout = **30 seconds**, Memory = **256 MB**

### 4b. Hazard Detection Lambda (Console)

1. **Lambda > Create function**
2. Settings:
   - Name: `krishirakshak-analyze-hazards`
   - Runtime: **Node.js 18.x**
   - Architecture: **arm64**
   - Execution role: `krishirakshak-lambda-role`
   - Handler: `index.handler`
3. Upload ZIP: **Code > Upload from > .zip file** → `analyze-hazards.zip`
4. **Configuration > General**: Timeout = **30 seconds**, Memory = **256 MB**

### CLI alternative

```bash
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ROLE_ARN="arn:aws:iam::${ACCOUNT_ID}:role/krishirakshak-lambda-role"

# Safety Q&A
aws lambda create-function \
  --function-name krishirakshak-ask-safety \
  --runtime nodejs18.x \
  --handler index.handler \
  --zip-file fileb://lambda/ask-safety-question.zip \
  --role $ROLE_ARN \
  --timeout 30 --memory-size 256 \
  --architectures arm64 \
  --region ap-south-1

# Hazard Detection
aws lambda create-function \
  --function-name krishirakshak-analyze-hazards \
  --runtime nodejs18.x \
  --handler index.handler \
  --zip-file fileb://lambda/analyze-hazards.zip \
  --role $ROLE_ARN \
  --timeout 30 --memory-size 256 \
  --architectures arm64 \
  --region ap-south-1
```

---

## Step 5 — Environment Variables

### ask-safety (optional — all have defaults)

| Variable            | Default                                       |
| ------------------- | --------------------------------------------- |
| `AWS_BEDROCK_REGION`| `ap-south-1`                                  |
| `BEDROCK_MODEL_ID`  | `anthropic.claude-3-haiku-20240307-v1:0`      |
| `MAX_TOKENS`        | `500`                                         |

### analyze-hazards (optional — all have defaults)

| Variable               | Default        |
| ---------------------- | -------------- |
| `AWS_REKOGNITION_REGION` | `ap-south-1` |
| `MAX_LABELS`           | `20`           |
| `MIN_CONFIDENCE`       | `60`           |

---

## Step 6 — API Gateway

1. Go to **API Gateway > Create API > REST API**
2. Name: `krishirakshak-api`

### Create resources and methods

| Resource                 | Method | Lambda target                     |
| ------------------------ | ------ | --------------------------------- |
| `/ask-safety-question`   | POST   | `krishirakshak-ask-safety`        |
| `/analyze-hazards`       | POST   | `krishirakshak-analyze-hazards`   |

For **each** resource:

3. Select the resource > **Actions > Create Method > POST**
4. Integration type: **Lambda Function** > select the function
5. Select the resource > **Actions > Enable CORS**
   - Check: `POST`, `OPTIONS`
   - Allowed origins: `*`
   - Click **Enable CORS and replace existing headers**

### Deploy

6. **Actions > Deploy API**
7. Stage name: `prod`
8. Copy the **Invoke URL** — e.g. `https://abc123xyz.execute-api.ap-south-1.amazonaws.com/prod`

---

## Step 7 — Test

### 7a. Safety Q&A — Console Test Event

In **Lambda > krishirakshak-ask-safety > Test**:

```json
{
  "httpMethod": "POST",
  "body": "{\"question\": \"How to safely use pesticides?\", \"language\": \"en\"}",
  "requestContext": {}
}
```

Hindi test:

```json
{
  "httpMethod": "POST",
  "body": "{\"question\": \"कीटनाशक का सुरक्षित उपयोग कैसे करें?\", \"language\": \"hi\"}",
  "requestContext": {}
}
```

### 7b. Hazard Detection — Console Test Event

In **Lambda > krishirakshak-analyze-hazards > Test**:

```json
{
  "httpMethod": "POST",
  "body": "{\"image\": \"<paste-small-base64-jpeg-here>\"}",
  "requestContext": {}
}
```

To generate a test base64 string:

```bash
base64 -w0 test-image.jpg | head -c 1000
```

### 7c. curl — Test deployed API

```bash
API_URL="https://YOUR_API_ID.execute-api.ap-south-1.amazonaws.com/prod"

# Safety Q&A
curl -X POST "$API_URL/ask-safety-question" \
  -H "Content-Type: application/json" \
  -d '{"question": "tractor safety tips", "language": "en"}'

# Hazard Detection (small test image)
IMAGE_B64=$(base64 -w0 test-photo.jpg)
curl -X POST "$API_URL/analyze-hazards" \
  -H "Content-Type: application/json" \
  -d "{\"image\": \"$IMAGE_B64\"}"
```

### Expected Responses

**Safety Q&A:**
```json
{
  "answer": "Here are key tractor safety tips...",
  "language": "en",
  "sources": ["Agricultural Safety Manual"],
  "confidence": 0.85,
  "source": "bedrock-claude-haiku",
  "timestamp": "2026-02-25T10:30:00.000Z"
}
```

**Hazard Detection:**
```json
{
  "hazards": [
    {
      "type": "machinery_general",
      "severity": "LOW",
      "confidence": 0.94,
      "description": "Agricultural machinery detected...",
      "recommendation": "Check oil, brakes...",
      "hindiDescription": "कृषि मशीनरी...",
      "hindiRecommendation": "उपयोग से पहले..."
    }
  ],
  "overallRisk": "LOW",
  "hazardCount": 1,
  "detectedLabels": [...],
  "analyzedAt": "2026-02-25T10:31:00.000Z"
}
```

---

## Step 8 — Connect to the PWA

Update your `.env` file in the project root:

```
VITE_API_GATEWAY_URL=https://YOUR_API_ID.execute-api.ap-south-1.amazonaws.com/prod
VITE_DEMO_MODE=false
```

Rebuild and redeploy:

```bash
npm run build
```

---

## Step 9 — Update Lambda Code

When you make changes to a Lambda:

```bash
# Rebuild ZIP
cd lambda/ask-safety-question && zip -r ../ask-safety-question.zip .

# Update in AWS
aws lambda update-function-code \
  --function-name krishirakshak-ask-safety \
  --zip-file fileb://lambda/ask-safety-question.zip \
  --region ap-south-1
```

Same pattern for `analyze-hazards`.

---

## Cost Estimate (within $100 hackathon credits)

| Service       | Pricing                 | Daily Usage (est.) | Daily Cost |
| ------------- | ----------------------- | ------------------ | ---------- |
| Bedrock Haiku | ~$0.25 / 1M input tokens | 100 queries        | ~$0.50     |
| Rekognition   | $0.001 / image          | 50 images          | ~$0.05     |
| Lambda        | $0.20 / 1M requests     | 150 invocations    | ~$0.01     |
| API Gateway   | $3.50 / 1M requests     | 150 requests       | ~$0.01     |
| **Total**     |                         |                    | **~$0.57/day** |

**Weekly estimate: ~$2-3/week** — well within $100 hackathon credits.

At this rate, credits last **~25-40 weeks** of continuous usage.

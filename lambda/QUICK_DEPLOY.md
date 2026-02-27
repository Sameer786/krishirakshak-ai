# KrishiRakshak — Quick Lambda Deploy (AWS Console)

Pre-built ZIP files are ready in the `lambda/` folder. Follow these steps in the AWS Console.

---

## Prerequisites

1. AWS account with Bedrock access enabled in **ap-south-1** (Mumbai)
2. IAM role created (see "Create IAM Role" below)
3. ZIP files ready:
   - `lambda/ask-safety-question.zip` (2.6 MB)
   - `lambda/analyze-hazards.zip` (2.8 MB)

---

## Step 0: Create IAM Role

1. Go to **IAM Console** → Roles → Create Role
2. Trusted entity: **AWS service** → **Lambda**
3. Attach policies:
   - `AWSLambdaBasicExecutionRole` (built-in)
   - Create inline policy with this JSON:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "bedrock:InvokeModel",
      "Resource": "arn:aws:bedrock:ap-south-1::foundation-model/anthropic.claude-3-haiku-20240307-v1:0"
    },
    {
      "Effect": "Allow",
      "Action": "rekognition:DetectLabels",
      "Resource": "*"
    }
  ]
}
```

4. Role name: **krishirakshak-lambda-role**
5. Create role

---

## Lambda 1: krishirakshak-ask-safety

1. Go to **AWS Lambda Console** → region **ap-south-1** (Mumbai)
2. Click **Create function** → Author from scratch
3. Settings:
   - **Function name:** `krishirakshak-ask-safety`
   - **Runtime:** Node.js 18.x
   - **Architecture:** arm64
   - **Execution role:** Use existing → `krishirakshak-lambda-role`
4. Click **Create function**
5. In Code tab → **Upload from** → **.zip file** → upload `ask-safety-question.zip`
6. Go to **Configuration** → **General configuration** → Edit:
   - **Timeout:** 30 seconds
   - **Memory:** 256 MB
7. Go to **Configuration** → **Environment variables** → Add:
   - `AWS_REGION` = `ap-south-1`
8. Click **Test** → Create test event:

```json
{
  "body": "{\"question\": \"How to safely use pesticides?\", \"language\": \"en\"}"
}
```

9. Run test → verify 200 response with answer text

---

## Lambda 2: krishirakshak-analyze-hazards

1. Go to **AWS Lambda Console** → region **ap-south-1**
2. Click **Create function** → Author from scratch
3. Settings:
   - **Function name:** `krishirakshak-analyze-hazards`
   - **Runtime:** Node.js 18.x
   - **Architecture:** arm64
   - **Execution role:** Use existing → `krishirakshak-lambda-role`
4. Click **Create function**
5. In Code tab → **Upload from** → **.zip file** → upload `analyze-hazards.zip`
6. Go to **Configuration** → **General configuration** → Edit:
   - **Timeout:** 30 seconds
   - **Memory:** 256 MB
7. Go to **Configuration** → **Environment variables** → Add:
   - `AWS_REGION` = `ap-south-1`
8. Click **Test** → Create test event:

```json
{
  "body": "{\"image\": \"/9j/4AAQ...\"}"
}
```

> Use a small base64-encoded JPEG for testing.

9. Run test → verify 200 response with hazards array

---

## Step 3: Create API Gateway

1. Go to **API Gateway Console** → Create API → **REST API** (not private)
2. API name: **krishirakshak-api**
3. Create two resources:

### Resource: /ask-safety

1. Actions → Create Resource → Resource name: `ask-safety`
2. Actions → Create Method → **POST**
   - Integration type: Lambda Function
   - Lambda Function: `krishirakshak-ask-safety`
   - Use Lambda Proxy integration: **Yes**
3. Actions → Enable CORS (on the `/ask-safety` resource)

### Resource: /analyze-hazards

1. Actions → Create Resource → Resource name: `analyze-hazards`
2. Actions → Create Method → **POST**
   - Integration type: Lambda Function
   - Lambda Function: `krishirakshak-analyze-hazards`
   - Use Lambda Proxy integration: **Yes**
3. Actions → Enable CORS (on the `/analyze-hazards` resource)

### Deploy

1. Actions → **Deploy API**
2. Stage name: `prod`
3. Copy the **Invoke URL** — it looks like:
   ```
   https://abc123xyz.execute-api.ap-south-1.amazonaws.com/prod
   ```

---

## Step 4: Connect to PWA

1. Update your `.env` file:

```
VITE_API_GATEWAY_URL=https://abc123xyz.execute-api.ap-south-1.amazonaws.com/prod
VITE_DEMO_MODE=false
```

2. If deployed on Vercel, set these in **Vercel Dashboard** → Settings → Environment Variables
3. Redeploy: `vercel --prod`

---

## Quick Verification

```bash
# Test Q&A Lambda
curl -X POST https://YOUR-API-URL/prod/ask-safety \
  -H "Content-Type: application/json" \
  -d '{"question": "How to safely use pesticides?", "language": "en"}'

# Test Hazard Lambda (with a small base64 image)
curl -X POST https://YOUR-API-URL/prod/analyze-hazards \
  -H "Content-Type: application/json" \
  -d '{"image": "BASE64_IMAGE_HERE"}'
```

---

## Estimated Cost

| Service | Estimate |
|---------|----------|
| Lambda | ~$0.00 (free tier: 1M requests/month) |
| Bedrock | ~$0.50/day (Claude Haiku: $0.00025/1K input tokens) |
| Rekognition | ~$0.07/day (DetectLabels: $1/1000 images) |
| API Gateway | ~$0.00 (free tier: 1M calls/month) |
| **Total** | **~$0.57/day, $2-3/week** |

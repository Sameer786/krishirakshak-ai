# KrishiRakshak — Amazon Polly TTS Setup Guide

> Created: 2026-03-04 | Branch: `deploy/s3-cloudfront`

---

## Overview

Amazon Polly provides natural-sounding Hindi and English text-to-speech for the KrishiRakshak app.
The frontend tries Polly first via a Lambda API endpoint, and falls back to the browser's
Web Speech API when offline or if Polly is unavailable.

| Property | Value |
|----------|-------|
| **Lambda Function** | `text-to-speech` |
| **Runtime** | Node.js 18.x (ES Modules) |
| **Region** | `ap-south-1` (Mumbai) |
| **Hindi Voice** | Aditi (standard engine) |
| **English Voice** | Kajal (neural engine) with Aditi (standard) fallback |
| **Output Format** | MP3 (base64 encoded) |
| **API Route** | `POST /text-to-speech` |
| **Max Text** | 3000 characters per request |

---

## Step-by-Step AWS Console Setup

### 1. Create the Lambda Function

1. Open AWS Lambda Console: https://ap-south-1.console.aws.amazon.com/lambda
2. Click **Create function**
3. Choose **Author from scratch**
4. Settings:
   - **Function name**: `text-to-speech`
   - **Runtime**: `Node.js 18.x`
   - **Architecture**: `x86_64`
   - **Execution role**: Create a new role with basic Lambda permissions
5. Click **Create function**

### 2. Upload the Deployment Zip

Build the zip locally:
```bash
cd lambda/text-to-speech
npm install
```

On Linux/Mac:
```bash
cd lambda/text-to-speech && zip -r ../text-to-speech.zip .
```

On Windows (PowerShell):
```powershell
cd lambda/text-to-speech
Compress-Archive -Path * -DestinationPath ../text-to-speech.zip -Force
```

Then upload:
1. In the Lambda console, go to the **Code** tab
2. Click **Upload from** > **.zip file**
3. Upload `lambda/text-to-speech.zip`
4. Click **Save**

### 3. Configure Lambda Settings

**General Configuration:**
1. Go to **Configuration** > **General configuration** > **Edit**
2. Set **Timeout** to **15 seconds** (Polly synthesis can take a few seconds for long text)
3. Set **Memory** to **256 MB** (default 128 MB may be slow for audio processing)
4. Click **Save**

**Handler:**
- Ensure handler is set to: `index.handler`

### 4. Add IAM Permissions

The Lambda execution role needs two additional permissions:

1. Go to **Configuration** > **Permissions**
2. Click on the **Role name** link to open it in IAM Console
3. Click **Add permissions** > **Create inline policy**
4. Switch to **JSON** tab and paste:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PollyAccess",
      "Effect": "Allow",
      "Action": "polly:SynthesizeSpeech",
      "Resource": "*"
    },
    {
      "Sid": "DynamoDBLogging",
      "Effect": "Allow",
      "Action": "dynamodb:PutItem",
      "Resource": "arn:aws:dynamodb:ap-south-1:682033483009:table/krishirakshak-activity-log"
    }
  ]
}
```

5. Name the policy: `krishirakshak-polly-dynamodb`
6. Click **Create policy**

### 5. Add API Gateway Route

**Option A: Add to existing API Gateway (recommended)**

1. Open API Gateway Console: https://ap-south-1.console.aws.amazon.com/apigateway
2. Select API: `jd7dn6udrf`
3. Click **Resources** in the left sidebar
4. Click **Create Resource**:
   - **Resource name**: `text-to-speech`
   - **Resource path**: `/text-to-speech`
   - **Enable CORS**: Yes
5. Select the new `/text-to-speech` resource
6. Click **Create Method**:
   - **Method type**: POST
   - **Integration type**: Lambda Function
   - **Lambda region**: `ap-south-1`
   - **Lambda function**: `text-to-speech`
   - Click **Create method**
7. Enable CORS on the resource:
   - Select `/text-to-speech`
   - Click **Enable CORS**
   - Check: POST, OPTIONS
   - Access-Control-Allow-Origin: `*`
   - Click **Save**
8. **Deploy the API**:
   - Click **Deploy API**
   - Stage: `prod`
   - Click **Deploy**

**Option B: Add Lambda trigger from Lambda console**

1. In the Lambda function page, click **Add trigger**
2. Select **API Gateway**
3. Choose **Use existing API**: select `jd7dn6udrf`
4. Route: `POST /text-to-speech`
5. Click **Add**

### 6. Test the Endpoint

Using curl:
```bash
curl -X POST \
  https://jd7dn6udrf.execute-api.ap-south-1.amazonaws.com/prod/text-to-speech \
  -H "Content-Type: application/json" \
  -d '{"text": "नमस्ते, मैं कृषि रक्षक हूँ", "language": "hi"}'
```

Expected response:
```json
{
  "audio": "//uQxAAAAAANIAAAAAExBTUU...",
  "contentType": "audio/mpeg",
  "voiceId": "Aditi",
  "language": "hi"
}
```

Using AWS CLI:
```bash
aws lambda invoke \
  --function-name text-to-speech \
  --payload '{"body": "{\"text\": \"Hello farmer\", \"language\": \"en\"}"}' \
  --profile krishirakshak \
  --region ap-south-1 \
  /tmp/polly-test-output.json && cat /tmp/polly-test-output.json
```

---

## Voice Details

| Language | Voice ID | Engine | Quality | Notes |
|----------|----------|--------|---------|-------|
| Hindi (`hi`) | Aditi | Standard | Good natural Hindi | Supports both Hindi and English |
| English (`en`) | Kajal | Neural | High quality | Neural engine; falls back to Aditi standard if unavailable |

### Polly Pricing (ap-south-1)
- **Standard voices**: $4.00 per 1 million characters
- **Neural voices**: $16.00 per 1 million characters
- **Free tier**: 5 million standard chars / 1 million neural chars per month (first 12 months)

For reference: a typical safety answer is ~200 characters. At 5M free chars, that's ~25,000 free TTS plays per month.

---

## How It Works in the App

```
User taps "Listen" button
    |
    v
useSpeechSynthesis hook
    |
    ├── Online? ──> Try Polly API (pollyService.js)
    |                  |
    |                  ├── Success ──> Play MP3 audio via Audio API
    |                  |
    |                  └── Failed ──> Fall back to browser TTS
    |
    └── Offline? ──> Use browser Web Speech API directly
```

The fallback ensures TTS always works:
- **Online**: Polly provides high-quality Hindi/English audio
- **Offline / API down**: Browser's built-in speech synthesis takes over
- **Demo mode**: Browser TTS only (no API calls)

---

## Troubleshooting

### "Failed to synthesize speech" error
- Check Lambda CloudWatch logs for detailed error
- Verify IAM role has `polly:SynthesizeSpeech` permission
- Check if Polly service is available in ap-south-1

### No audio plays in browser
- Check browser console for errors
- Verify the base64 audio data is valid
- Some browsers block auto-play: ensure user interaction triggers playback

### Kajal voice not available
- The Lambda automatically falls back to Aditi (standard) if Kajal (neural) fails
- Verify neural voices are available in your region

### CORS errors
- Ensure API Gateway has CORS enabled for `/text-to-speech`
- Verify Lambda returns `Access-Control-Allow-Origin: *` header

---

## Tear Down

To remove Polly resources:

```bash
# Delete Lambda function
aws lambda delete-function --function-name text-to-speech --profile krishirakshak --region ap-south-1

# Remove API Gateway route (via console — delete /text-to-speech resource, then redeploy)
```

The IAM inline policy is automatically deleted when the Lambda execution role is deleted.

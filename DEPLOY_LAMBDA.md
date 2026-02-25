# Deploying the KrishiRakshak Lambda Function

## Prerequisites

- AWS CLI configured with credentials (`aws configure`)
- Node.js 18+ installed
- An AWS account with Bedrock access enabled in `ap-south-1`

## 1. Install Dependencies

```bash
cd lambda/ask-safety-question
npm install
```

## 2. Create the Deployment ZIP

```bash
cd lambda/ask-safety-question
zip -r ../ask-safety-question.zip .
```

Or on Windows (PowerShell):

```powershell
cd lambda/ask-safety-question
Compress-Archive -Path * -DestinationPath ../ask-safety-question.zip
```

## 3. Create the Lambda Function

### Option A: AWS Console

1. Go to **Lambda > Create function**
2. Settings:
   - Name: `krishirakshak-ask-safety-question`
   - Runtime: **Node.js 18.x**
   - Architecture: **arm64** (cheaper) or x86_64
   - Handler: `index.handler`
3. Upload the ZIP under **Code > Upload from > .zip file**
4. Set **Timeout** to **30 seconds** (Configuration > General)
5. Set **Memory** to **256 MB**

### Option B: AWS CLI

```bash
# Create the function
aws lambda create-function \
  --function-name krishirakshak-ask-safety-question \
  --runtime nodejs18.x \
  --handler index.handler \
  --zip-file fileb://lambda/ask-safety-question.zip \
  --role arn:aws:iam::YOUR_ACCOUNT_ID:role/YOUR_LAMBDA_ROLE \
  --timeout 30 \
  --memory-size 256 \
  --architectures arm64 \
  --region ap-south-1

# Update existing function code
aws lambda update-function-code \
  --function-name krishirakshak-ask-safety-question \
  --zip-file fileb://lambda/ask-safety-question.zip \
  --region ap-south-1
```

## 4. Environment Variables

Set these in **Configuration > Environment variables**:

| Variable            | Value                                         | Required |
| ------------------- | --------------------------------------------- | -------- |
| `AWS_BEDROCK_REGION`| `ap-south-1`                                  | No (default) |
| `BEDROCK_MODEL_ID`  | `anthropic.claude-3-haiku-20240307-v1:0`      | No (default) |
| `MAX_TOKENS`        | `500`                                         | No (default) |

## 5. IAM Role Permissions

The Lambda execution role needs this policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel"
      ],
      "Resource": [
        "arn:aws:bedrock:ap-south-1::foundation-model/anthropic.claude-3-haiku-20240307-v1:0"
      ]
    }
  ]
}
```

Attach via **Configuration > Permissions > Execution role > Add inline policy**.

## 6. API Gateway Setup

1. Go to **API Gateway > Create API > REST API**
2. Create resource: `/ask-safety-question`
3. Create method: **POST** -> Lambda function -> `krishirakshak-ask-safety-question`
4. Enable **CORS** on the resource
5. **Deploy API** to a stage (e.g., `prod`)
6. Copy the invoke URL — this is your `VITE_API_GATEWAY_URL`

## 7. Test the Lambda

### Console Test Event

In Lambda > Test, use this event:

```json
{
  "httpMethod": "POST",
  "body": "{\"question\": \"How to safely use pesticides?\", \"language\": \"en\"}",
  "requestContext": {}
}
```

### Hindi Test Event

```json
{
  "httpMethod": "POST",
  "body": "{\"question\": \"कीटनाशक का सुरक्षित उपयोग कैसे करें?\", \"language\": \"hi\"}",
  "requestContext": {}
}
```

### CLI Test

```bash
aws lambda invoke \
  --function-name krishirakshak-ask-safety-question \
  --payload '{"httpMethod":"POST","body":"{\"question\":\"tractor safety tips\",\"language\":\"en\"}","requestContext":{}}' \
  --region ap-south-1 \
  output.json

cat output.json
```

### Expected Response

```json
{
  "statusCode": 200,
  "headers": {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json"
  },
  "body": "{\"answer\":\"...\",\"language\":\"en\",\"sources\":[\"Agricultural Safety Manual\"],\"confidence\":0.85,\"source\":\"bedrock-claude-haiku\",\"timestamp\":\"2026-02-25T...\"}"
}
```

## 8. Connect to the PWA

Update your `.env` file:

```
VITE_API_GATEWAY_URL=https://YOUR_API_ID.execute-api.ap-south-1.amazonaws.com/prod
VITE_DEMO_MODE=false
```

Then rebuild and redeploy the PWA.

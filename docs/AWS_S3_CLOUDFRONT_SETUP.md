# KrishiRakshak — AWS S3 + CloudFront Setup

> Created: 2026-03-04 | Branch: `deploy/s3-cloudfront`

---

## What Was Created

### S3 Bucket
| Property | Value |
|----------|-------|
| **Bucket Name** | `krishirakshak-frontend` |
| **Region** | `ap-south-1` (Mumbai) |
| **Website URL** | http://krishirakshak-frontend.s3-website.ap-south-1.amazonaws.com |
| **Static Website Hosting** | Enabled (`index.html` for both index and error) |
| **Public Access** | Enabled (public read via bucket policy) |
| **AWS Account** | `682033483009` |

### CloudFront Distribution
| Property | Value |
|----------|-------|
| **Distribution ID** | `E71T5EYFH0HUG` |
| **Domain Name** | `d2e3izstdqba08.cloudfront.net` |
| **HTTPS URL** | https://d2e3izstdqba08.cloudfront.net |
| **Origin** | S3 website endpoint (custom origin, HTTP-only) |
| **Protocol** | HTTPS (redirect HTTP to HTTPS) |
| **HTTP Version** | HTTP/2 |
| **Price Class** | PriceClass_200 (US, Canada, Europe, Asia, Middle East, Africa) |
| **Compression** | Enabled (gzip/brotli) |
| **SPA Routing** | 403/404 errors return `/index.html` with 200 status |
| **Default Root** | `index.html` |

### Cache Headers Strategy
| File | Cache-Control | Reason |
|------|--------------|--------|
| `index.html` | `no-cache, no-store, must-revalidate` | Always fetch latest version |
| `assets/*.js` | `public, max-age=31536000, immutable` | Vite content-hashed filenames |
| `assets/*.css` | `public, max-age=31536000, immutable` | Vite content-hashed filenames |
| `icon-*.svg` | `public, max-age=86400` | 1-day cache for icons |
| `manifest.json` | `no-cache` | Always fresh for PWA updates |
| `sw.js` | `no-cache, no-store, must-revalidate` | Service worker must always be fresh |

---

## How to Redeploy

### Quick Deploy (recommended)
```bash
./scripts/deploy-s3.sh
```

This script:
1. Builds the production bundle with correct env vars
2. Syncs `dist/` to S3 (deletes stale files)
3. Sets content types and cache headers
4. Creates a CloudFront invalidation

### Override Defaults
```bash
# Use a different bucket or distribution
S3_BUCKET=my-bucket CF_DISTRIBUTION_ID=EXXXXX ./scripts/deploy-s3.sh

# Use a different AWS profile
AWS_PROFILE=my-profile ./scripts/deploy-s3.sh

# Use a different API Gateway URL
VITE_API_GATEWAY_URL=https://my-api.execute-api.ap-south-1.amazonaws.com/prod ./scripts/deploy-s3.sh
```

### Manual Deploy
```bash
# 1. Build
VITE_API_GATEWAY_URL=https://jd7dn6udrf.execute-api.ap-south-1.amazonaws.com/prod VITE_DEMO_MODE=false npm run build

# 2. Sync to S3
aws s3 sync dist/ s3://krishirakshak-frontend/ --region ap-south-1 --delete --profile krishirakshak

# 3. Invalidate CloudFront
aws cloudfront create-invalidation --distribution-id E71T5EYFH0HUG --paths "/*" --profile krishirakshak
```

---

## Testing Checklist

After deployment, verify the following using the CloudFront URL:

- [ ] CloudFront URL loads the app: https://d2e3izstdqba08.cloudfront.net
- [ ] All 4 routes work:
  - [ ] `/` — Home page with feature cards and recent activity
  - [ ] `/voice-qa` — Voice Q&A chat interface
  - [ ] `/hazard-detection` — Camera hazard detection
  - [ ] `/jha-checklist` — JHA safety checklists
- [ ] Direct URL access works (paste `/voice-qa` directly in browser address bar)
- [ ] Voice Q&A works with AI response + Verified badge (for RAG answers)
- [ ] Hazard Detection works with photo upload
- [ ] JHA Checklist works (select template, complete steps)
- [ ] PWA install prompt appears (on supported browsers)
- [ ] API calls go to API Gateway (not S3/CloudFront) — check Network tab
- [ ] Service Worker registers successfully — check Application tab
- [ ] HTTPS enforced (HTTP redirects to HTTPS)

---

## Troubleshooting

### Access Denied (403)
- **Cause**: Bucket policy missing or Block Public Access is enabled
- **Fix**:
  ```bash
  # Disable block public access
  aws s3api put-public-access-block --bucket krishirakshak-frontend \
    --public-access-block-configuration "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false" \
    --profile krishirakshak

  # Re-apply bucket policy
  aws s3api put-bucket-policy --bucket krishirakshak-frontend \
    --policy '{"Version":"2012-10-17","Statement":[{"Sid":"PublicReadGetObject","Effect":"Allow","Principal":"*","Action":"s3:GetObject","Resource":"arn:aws:s3:::krishirakshak-frontend/*"}]}' \
    --profile krishirakshak
  ```

### Blank Page
- **Cause**: Missing `index.html` or wrong `base` path in Vite config
- **Fix**: Ensure `vite.config.js` has no `base` set (or `base: "/"`) and rebuild
- **Check**: `aws s3 ls s3://krishirakshak-frontend/index.html --profile krishirakshak`

### CORS Errors (API calls failing)
- **Cause**: Lambda not returning `Access-Control-Allow-Origin` header
- **Current Status**: Both Lambdas return `'Access-Control-Allow-Origin': '*'` (wildcard — no issue)
- **Fix if needed**: Update Lambda `CORS_HEADERS` to include the CloudFront domain

### Stale Cache (old version showing)
- **Fix**: Create a CloudFront invalidation:
  ```bash
  aws cloudfront create-invalidation --distribution-id E71T5EYFH0HUG --paths "/*" --profile krishirakshak
  ```
- **Wait**: Invalidations take 1-2 minutes to propagate globally

### Routes Return 404 (e.g., `/voice-qa` gives error)
- **Cause**: CloudFront custom error responses not configured for SPA routing
- **Fix**: Ensure 403 and 404 errors are mapped to `/index.html` with 200 response code
- **Check**:
  ```bash
  aws cloudfront get-distribution-config --id E71T5EYFH0HUG --profile krishirakshak \
    --query "DistributionConfig.CustomErrorResponses"
  ```

### CloudFront Still Shows "InProgress"
- **Normal**: Initial deployment takes 5-15 minutes
- **Check status**:
  ```bash
  aws cloudfront get-distribution --id E71T5EYFH0HUG --profile krishirakshak \
    --query "Distribution.Status"
  ```

---

## How to Tear Down

If you need to remove the S3 + CloudFront resources:

```bash
# 1. Disable CloudFront distribution
aws cloudfront get-distribution-config --id E71T5EYFH0HUG --profile krishirakshak > /tmp/cf-config.json
# Edit the config: set "Enabled": false, then update
# aws cloudfront update-distribution --id E71T5EYFH0HUG --if-match <ETAG> --distribution-config file:///tmp/cf-config-disabled.json --profile krishirakshak

# 2. Wait for distribution to be "Deployed" with Enabled=false

# 3. Delete CloudFront distribution
# aws cloudfront delete-distribution --id E71T5EYFH0HUG --if-match <ETAG> --profile krishirakshak

# 4. Empty and delete S3 bucket
aws s3 rm s3://krishirakshak-frontend/ --recursive --profile krishirakshak
aws s3 rb s3://krishirakshak-frontend --profile krishirakshak
```

> **Note**: CloudFront distributions must be disabled before deletion. The disable + deploy cycle takes 5-15 minutes.

---

## Architecture Overview

```
User Browser
    │
    ├── Static Assets ──→ CloudFront (d2e3izstdqba08.cloudfront.net)
    │                         │
    │                         └──→ S3 (krishirakshak-frontend)
    │
    └── API Calls ──────→ API Gateway (jd7dn6udrf.execute-api.ap-south-1.amazonaws.com)
                              │
                              ├──→ Lambda: ask-safety-question
                              │       ├── Bedrock Knowledge Bases (RAG)
                              │       ├── Bedrock Nova Lite (Converse)
                              │       └── DynamoDB (activity log)
                              │
                              └──→ Lambda: analyze-hazards
                                      ├── Rekognition (DetectLabels)
                                      ├── Bedrock Nova Lite (Converse)
                                      └── DynamoDB (activity log)
```

**Key**: Frontend (S3+CloudFront) and Backend (API Gateway+Lambda) are completely independent. The CloudFront distribution only serves static files. All API calls go directly to API Gateway.

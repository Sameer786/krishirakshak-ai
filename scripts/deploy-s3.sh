#!/usr/bin/env bash
set -euo pipefail

# ─────────────────────────────────────────────────────────────
# KrishiRakshak — Deploy frontend to S3 + CloudFront
# Usage: ./scripts/deploy-s3.sh
# Override defaults via environment variables:
#   S3_BUCKET=my-bucket CF_DISTRIBUTION_ID=EXXXXX ./scripts/deploy-s3.sh
# ─────────────────────────────────────────────────────────────

# Configuration (override via env vars)
S3_BUCKET="${S3_BUCKET:-krishirakshak-frontend}"
CF_DISTRIBUTION_ID="${CF_DISTRIBUTION_ID:-E71T5EYFH0HUG}"
AWS_PROFILE="${AWS_PROFILE:-krishirakshak}"
AWS_REGION="${AWS_REGION:-ap-south-1}"
API_GATEWAY_URL="${VITE_API_GATEWAY_URL:-https://jd7dn6udrf.execute-api.ap-south-1.amazonaws.com/prod}"

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║     KrishiRakshak — S3 + CloudFront Deploy              ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
echo "  S3 Bucket:      $S3_BUCKET"
echo "  CloudFront:     $CF_DISTRIBUTION_ID"
echo "  AWS Profile:    $AWS_PROFILE"
echo "  Region:         $AWS_REGION"
echo "  API Gateway:    $API_GATEWAY_URL"
echo ""

# ── Step 1: Build ───────────────────────────────────────────
echo "▶ Step 1/4: Building production bundle..."
VITE_API_GATEWAY_URL="$API_GATEWAY_URL" VITE_DEMO_MODE=false npm run build
echo "  ✅ Build complete"
echo ""

# ── Step 2: Sync to S3 ─────────────────────────────────────
echo "▶ Step 2/4: Syncing dist/ to s3://$S3_BUCKET/ ..."
aws s3 sync dist/ "s3://$S3_BUCKET/" \
  --region "$AWS_REGION" \
  --delete \
  --profile "$AWS_PROFILE"
echo "  ✅ S3 sync complete"
echo ""

# ── Step 3: Fix content types and cache headers ────────────
echo "▶ Step 3/4: Setting content types and cache headers..."

# index.html — never cache
aws s3 cp "s3://$S3_BUCKET/index.html" "s3://$S3_BUCKET/index.html" \
  --content-type "text/html" \
  --cache-control "no-cache, no-store, must-revalidate" \
  --metadata-directive REPLACE \
  --region "$AWS_REGION" \
  --profile "$AWS_PROFILE" \
  --quiet

# JS files — immutable (Vite content hashes)
aws s3 cp "s3://$S3_BUCKET/assets/" "s3://$S3_BUCKET/assets/" \
  --recursive --exclude "*" --include "*.js" \
  --content-type "application/javascript" \
  --cache-control "public, max-age=31536000, immutable" \
  --metadata-directive REPLACE \
  --region "$AWS_REGION" \
  --profile "$AWS_PROFILE" \
  --quiet

# CSS files — immutable (Vite content hashes)
aws s3 cp "s3://$S3_BUCKET/assets/" "s3://$S3_BUCKET/assets/" \
  --recursive --exclude "*" --include "*.css" \
  --content-type "text/css" \
  --cache-control "public, max-age=31536000, immutable" \
  --metadata-directive REPLACE \
  --region "$AWS_REGION" \
  --profile "$AWS_PROFILE" \
  --quiet

# SVG icons — 1 day cache
for icon in icon-192.svg icon-512.svg; do
  if aws s3 ls "s3://$S3_BUCKET/$icon" --profile "$AWS_PROFILE" > /dev/null 2>&1; then
    aws s3 cp "s3://$S3_BUCKET/$icon" "s3://$S3_BUCKET/$icon" \
      --content-type "image/svg+xml" \
      --cache-control "public, max-age=86400" \
      --metadata-directive REPLACE \
      --region "$AWS_REGION" \
      --profile "$AWS_PROFILE" \
      --quiet
  fi
done

# manifest.json — no cache
aws s3 cp "s3://$S3_BUCKET/manifest.json" "s3://$S3_BUCKET/manifest.json" \
  --content-type "application/manifest+json" \
  --cache-control "no-cache" \
  --metadata-directive REPLACE \
  --region "$AWS_REGION" \
  --profile "$AWS_PROFILE" \
  --quiet

# sw.js — never cache (service worker must be fresh)
aws s3 cp "s3://$S3_BUCKET/sw.js" "s3://$S3_BUCKET/sw.js" \
  --content-type "application/javascript" \
  --cache-control "no-cache, no-store, must-revalidate" \
  --metadata-directive REPLACE \
  --region "$AWS_REGION" \
  --profile "$AWS_PROFILE" \
  --quiet

echo "  ✅ Cache headers set"
echo ""

# ── Step 4: Invalidate CloudFront ──────────────────────────
echo "▶ Step 4/4: Invalidating CloudFront cache..."
INVALIDATION_ID=$(aws cloudfront create-invalidation \
  --distribution-id "$CF_DISTRIBUTION_ID" \
  --paths "/*" \
  --profile "$AWS_PROFILE" \
  --query "Invalidation.Id" \
  --output text)
echo "  ✅ Invalidation created: $INVALIDATION_ID"
echo ""

# ── Done ───────────────────────────────────────────────────
echo "╔══════════════════════════════════════════════════════════╗"
echo "║     ✅ DEPLOY COMPLETE                                  ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
echo "  S3 Website:   http://$S3_BUCKET.s3-website.$AWS_REGION.amazonaws.com"
echo "  CloudFront:   https://d2e3izstdqba08.cloudfront.net"
echo ""
echo "  CloudFront invalidation may take 1-2 minutes to propagate."
echo ""

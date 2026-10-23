#!/usr/bin/env bash
# Uploads the built site to S3 and refreshes CloudFront.
# Usage: S3_BUCKET=... CLOUDFRONT_DISTRIBUTION_ID=... scripts/deploy.sh [dist-dir]
set -euo pipefail

: "${S3_BUCKET:?Set S3_BUCKET}"
: "${CLOUDFRONT_DISTRIBUTION_ID:?Set CLOUDFRONT_DISTRIBUTION_ID}"
DIST="${1:-dist}"
[[ -f "$DIST/index.html" ]] || { echo "No build found in $DIST. Run npm run build first." >&2; exit 1; }

# Hashed bundles never change, so browsers can cache them for a year. Old ones
# are kept (no --delete) so tabs still running the previous version keep working.
aws s3 sync "$DIST/assets" "s3://$S3_BUCKET/assets" \
  --cache-control "public, max-age=31536000, immutable"

# Everything else (index.html, the service worker, icons) must always be
# revalidated, or users would be stuck on an old version.
aws s3 sync "$DIST" "s3://$S3_BUCKET" \
  --exclude "assets/*" --exclude "*.webmanifest" --delete \
  --cache-control "no-cache"

# The CLI doesn't know the .webmanifest type, so set it explicitly.
for f in "$DIST"/*.webmanifest; do
  [[ -e "$f" ]] || continue
  aws s3 cp "$f" "s3://$S3_BUCKET/$(basename "$f")" \
    --content-type "application/manifest+json" --cache-control "no-cache"
done

# One "/*" path counts as a single invalidation (the first 1,000 a month are free).
id=$(aws cloudfront create-invalidation --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" \
  --paths "/*" --query Invalidation.Id --output text)
echo "Deployed. CloudFront invalidation $id is in progress."

#!/usr/bin/env bash
###############################################################################
#
# (C) Copyright 2026 EVERYSK TECHNOLOGIES
#
# Standalone deploy script for single-app Everysk repos.
# Dependencies: curl, zip, base64, jq
#
###############################################################################
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

SKIP_BUILD=false
for arg in "$@"; do
  case "$arg" in
    --skip-build) SKIP_BUILD=true ;;
    *) echo "Unknown argument: $arg"; exit 1 ;;
  esac
done

###############################################################################
# Load environment variables
###############################################################################
ENV_FILE="$REPO_ROOT/.env"
if [ -f "$ENV_FILE" ]; then
  echo "Loading environment from $ENV_FILE"
  set -a
  # shellcheck source=/dev/null
  source "$ENV_FILE"
  set +a
fi

###############################################################################
# Validate required variables
###############################################################################
EVERYSK_API_URL_DOMAIN="${EVERYSK_API_URL_DOMAIN:-}"
EVERYSK_API_SID="${EVERYSK_API_SID:-}"
EVERYSK_API_TOKEN="${EVERYSK_API_TOKEN:-}"

missing=()
[ -z "$EVERYSK_API_URL_DOMAIN" ] && missing+=("EVERYSK_API_URL_DOMAIN")
[ -z "$EVERYSK_API_SID" ]        && missing+=("EVERYSK_API_SID")
[ -z "$EVERYSK_API_TOKEN" ]      && missing+=("EVERYSK_API_TOKEN")

if [ ${#missing[@]} -gt 0 ]; then
  echo "ERROR: Missing required environment variables: ${missing[*]}"
  echo "Set them in .env or export them before running this script."
  exit 1
fi

###############################################################################
# Build project
###############################################################################
if [ "$SKIP_BUILD" = false ]; then
  echo "Building project..."
  cd "$REPO_ROOT"
  npm install
  npm run build
else
  echo "Skipping build (--skip-build)"
fi

DIST_DIR="$REPO_ROOT/dist"
if [ ! -d "$DIST_DIR" ]; then
  echo "ERROR: Build output directory not found: $DIST_DIR"
  exit 1
fi

###############################################################################
# Zip and base64-encode the dist directory
###############################################################################
echo "Packaging dist directory..."

# Verify dist directory is not empty
if [ -z "$(ls -A "$DIST_DIR" 2>/dev/null)" ]; then
  echo "ERROR: dist directory is empty: $DIST_DIR"
  exit 1
fi

# Create temporary file path for zip (without creating the file)
TMPZIP="/tmp/everysk-deploy-$(date +%s)-$$.zip"
trap 'rm -f "$TMPZIP"' EXIT

echo "Creating zip archive from $DIST_DIR..."
if ! (cd "$DIST_DIR" && zip -q -r "$TMPZIP" . -x '*.DS_Store'); then
  echo "ERROR: Failed to create zip archive"
  echo "TMPZIP location: $TMPZIP"
  echo "Contents of dist directory:"
  ls -la "$DIST_DIR"
  exit 1
fi

echo "Verifying zip file was created..."
if [ ! -f "$TMPZIP" ]; then
  echo "ERROR: Zip file was not created: $TMPZIP"
  exit 1
fi

echo "Zip file size: $(du -h "$TMPZIP" | cut -f1)"
echo "Encoding zip file to base64..."
DATA_BASE64="$(base64 -w 0 "$TMPZIP" 2>/dev/null || base64 "$TMPZIP")"

###############################################################################
# Build API payload: merge config.json + {"data": "<base64>"}
###############################################################################
CONFIG_FILE="$REPO_ROOT/config.json"
if [ ! -f "$CONFIG_FILE" ]; then
  echo "ERROR: config.json not found at $CONFIG_FILE"
  exit 1
fi

echo "Building API payload..."
# Write base64 data to temporary file to avoid "Argument list too long" error
TMPDATA="$(mktemp)"
trap 'rm -f "$TMPZIP" "$TMPDATA"' EXIT
echo -n "$DATA_BASE64" > "$TMPDATA"

# Use jq with --rawfile to read the data from file instead of command line argument
PAYLOAD="$(jq --rawfile data "$TMPDATA" '. + {data: $data}' "$CONFIG_FILE")"

###############################################################################
# Deploy via API
###############################################################################
API_URL="https://${EVERYSK_API_URL_DOMAIN}/v2/user_apps"
echo "Deploying to $API_URL ..."

# Write payload to file to avoid "Argument list too long" error with curl
TMPPAYLOAD="$(mktemp)"
trap 'rm -f "$TMPZIP" "$TMPDATA" "$TMPPAYLOAD"' EXIT
echo "$PAYLOAD" > "$TMPPAYLOAD"

###############################################################################
# DEBUG LOGGING
###############################################################################
echo "DEBUG: Authorization header format: Bearer ${EVERYSK_API_SID}:${EVERYSK_API_TOKEN:0:4}...(hidden)"
echo "DEBUG: API URL: $API_URL"
echo "DEBUG: Full API payload below:"
cat "$TMPPAYLOAD"
echo "DEBUG: Payload size: $(wc -c < "$TMPPAYLOAD") bytes"
echo "----------------------"

HTTP_RESPONSE="$(curl -s -w "\n%{http_code}" -X POST "$API_URL" \
  -H "Authorization: Bearer ${EVERYSK_API_SID}:${EVERYSK_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d @"$TMPPAYLOAD")"

HTTP_BODY="$(echo "$HTTP_RESPONSE" | sed '$d')"
HTTP_CODE="$(echo "$HTTP_RESPONSE" | tail -n1)"

if [ "$HTTP_CODE" != "200" ]; then
  echo "ERROR: API returned HTTP $HTTP_CODE"
  echo "$HTTP_BODY"
  exit 1
fi

echo "Deploy successful (HTTP $HTTP_CODE)"

###############################################################################
# Update config.json with response fields
###############################################################################
USER_APP="$(echo "$HTTP_BODY" | jq '.user_apps.user_app')"

TARGET_USERS="$(echo "$USER_APP" | jq '.target_users')"
CREATED="$(echo "$USER_APP" | jq '.created')"
UPDATED="$(echo "$USER_APP" | jq '.updated')"

echo "Updating config.json with response data..."
jq --argjson target_users "$TARGET_USERS" \
   --argjson created "$CREATED" \
   --argjson updated "$UPDATED" \
   '.target_users = $target_users | .created = $created | .updated = $updated' \
   "$CONFIG_FILE" > "${CONFIG_FILE}.tmp" && mv "${CONFIG_FILE}.tmp" "$CONFIG_FILE"

echo "config.json updated successfully."
echo "  target_users: $TARGET_USERS"
echo "  created: $CREATED"
echo "  updated: $UPDATED"

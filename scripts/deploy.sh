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
  cd "$REPO_ROOT/project"
  npm install
  npm run build
  cd "$REPO_ROOT"
else
  echo "Skipping build (--skip-build)"
fi

DIST_DIR="$REPO_ROOT/project/dist"
if [ ! -d "$DIST_DIR" ]; then
  echo "ERROR: Build output directory not found: $DIST_DIR"
  exit 1
fi

###############################################################################
# Zip and base64-encode the dist directory
###############################################################################
echo "Packaging dist directory..."
TMPZIP="$(mktemp /tmp/everysk-deploy-XXXXXX.zip)"
trap 'rm -f "$TMPZIP"' EXIT

(cd "$DIST_DIR" && zip -r "$TMPZIP" . -x '*.DS_Store') > /dev/null

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
PAYLOAD="$(jq --arg data "$DATA_BASE64" '. + {data: $data}' "$CONFIG_FILE")"

###############################################################################
# Deploy via API
###############################################################################
API_URL="https://${EVERYSK_API_URL_DOMAIN}/v2/apps"
echo "Deploying to $API_URL ..."

HTTP_RESPONSE="$(curl -s -w "\n%{http_code}" -X POST "$API_URL" \
  -H "Authorization: Bearer ${EVERYSK_API_SID}:${EVERYSK_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD")"

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

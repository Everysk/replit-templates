#!/usr/bin/env bash

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

echo -e "${BLUE}${BOLD}🚀 Everysk App Deploy${NC}"
echo ""

MISSING_VARS=()

if [ -z "${EVERYSK_API_SID:-}" ]; then
    MISSING_VARS+=("EVERYSK_API_SID")
fi

if [ -z "${EVERYSK_API_TOKEN:-}" ]; then
    MISSING_VARS+=("EVERYSK_API_TOKEN")
fi

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo -e "${RED}${BOLD}❌ Missing required secrets:${NC}"
    for var in "${MISSING_VARS[@]}"; do
        echo -e "   ${RED}•${NC} $var"
    done
    echo ""
    echo -e "Add them in the ${BOLD}🔒 Secrets${NC} tab, then re-run this workflow."
    exit 1
fi

echo -e "${GREEN}✅ Secrets configured${NC}"

export PROJECT_ROOT="/home/runner/workspace"
export PYTHONPATH="${PROJECT_ROOT}:${PROJECT_ROOT}/scripts"
export EVERYSK_API_URL="${EVERYSK_API_URL:-https://api.everysk.com/v2}"
export EVERYSK_MANAGED_DEPLOY="${EVERYSK_MANAGED_DEPLOY:-true}"

CONFIG_FILE="${PROJECT_ROOT}/config.json"
CURRENT_NAME=$(python3 -c "import json; print(json.load(open('${CONFIG_FILE}')).get('name', ''))")

if [ -z "$CURRENT_NAME" ]; then
    echo ""
    echo -e "${BLUE}${BOLD}📝 First-time setup${NC}"
    echo -ne "${BOLD}Enter app name: ${NC}"
    read -r APP_NAME
    if [ -z "$APP_NAME" ]; then
        echo -e "${RED}❌ App name cannot be empty. Aborting.${NC}"
        exit 1
    fi
    python3 -c "
import json, sys
name = sys.argv[1]
path = sys.argv[2]
with open(path, 'r+') as f:
    config = json.load(f)
    config['name'] = name
    f.seek(0)
    json.dump(config, f, indent=2)
    f.truncate()
" "$APP_NAME" "$CONFIG_FILE"
    echo -e "${GREEN}✅ App name set to: ${BOLD}${APP_NAME}${NC}"
else
    echo -e "${BLUE}App name: ${BOLD}${CURRENT_NAME}${NC}"
fi

echo ""
echo -e "${BLUE}▶ Running deploy...${NC}"
python3 "${PROJECT_ROOT}/scripts/deploy.py"

echo ""
echo -e "${GREEN}${BOLD}✅ Deploy complete${NC}"

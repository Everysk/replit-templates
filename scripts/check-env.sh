#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Checking environment variables...${NC}"

# Check if required environment variables are set
MISSING_VARS=()

if [ -z "$EVERYSK_API_SID" ]; then
    MISSING_VARS+=("EVERYSK_API_SID")
fi

if [ -z "$EVERYSK_API_TOKEN" ]; then
    MISSING_VARS+=("EVERYSK_API_TOKEN")
fi

# If any variables are missing, show instructions
if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo ""
    echo -e "${RED}${BOLD}❌ Missing required secrets:${NC}"
    for var in "${MISSING_VARS[@]}"; do
        echo -e "   ${RED}•${NC} ${YELLOW}$var${NC}"
    done
    echo ""
    echo -e "${BOLD}📝 How to fix:${NC}"
    echo -e "   1. Click the ${BOLD}🔒 Secrets${NC} tab in the left sidebar"
    echo -e "   2. Add these secrets:"
    echo -e "      ${YELLOW}EVERYSK_API_SID${NC}   → Your Everysk API account SID"
    echo -e "      ${YELLOW}EVERYSK_API_TOKEN${NC} → Your Everysk API authentication token"
    echo -e ""
    echo -e "   ${BLUE}Get credentials at: ${BOLD}https://everysk.com/account${NC}"
    echo -e ""
    echo -e "   3. Click ${GREEN}${BOLD}Run${NC} again after adding your secrets"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ All required secrets are configured.${NC}"
exit 0

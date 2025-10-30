#!/bin/bash
# Deployment Safety Verification Script
# Bu script deployment öncesi tüm kontrolleri yapar

echo "🔍 DEPLOYMENT SAFETY CHECK"
echo "=========================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

SUCCESS=0
WARNINGS=0
ERRORS=0

# Check 1: Schema file contains email_verified_at
echo -n "✓ Checking schema file... "
if grep -q "email_verified_at" shared/schema.ts; then
    echo -e "${GREEN}PASS${NC}"
    ((SUCCESS++))
else
    echo -e "${RED}FAIL${NC} - email_verified_at not found in schema"
    ((ERRORS++))
fi

# Check 2: OAuth callback route exists
echo -n "✓ Checking OAuth callback route... "
if grep -q "auth/callback" client/src/App.tsx; then
    echo -e "${GREEN}PASS${NC}"
    ((SUCCESS++))
else
    echo -e "${RED}FAIL${NC} - /auth/callback route not registered"
    ((ERRORS++))
fi

# Check 3: Environment variables
echo -n "✓ Checking environment variables... "
ENV_VARS=("DATABASE_URL" "GOOGLE_CLIENT_ID" "GOOGLE_CLIENT_SECRET" "JWT_SECRET")
MISSING=0

for VAR in "${ENV_VARS[@]}"; do
    if [ -z "${!VAR}" ]; then
        if [ $MISSING -eq 0 ]; then
            echo ""
        fi
        echo -e "  ${YELLOW}WARNING${NC} - $VAR not set"
        ((MISSING++))
        ((WARNINGS++))
    fi
done

if [ $MISSING -eq 0 ]; then
    echo -e "${GREEN}PASS${NC}"
    ((SUCCESS++))
fi

# Check 4: Build test
echo -n "✓ Testing build... "
if npm run build > /tmp/build.log 2>&1; then
    echo -e "${GREEN}PASS${NC}"
    ((SUCCESS++))
else
    echo -e "${RED}FAIL${NC} - Build failed, check /tmp/build.log"
    ((ERRORS++))
fi

# Check 5: TypeScript compilation
echo -n "✓ Checking TypeScript... "
if npx tsc --noEmit > /tmp/tsc.log 2>&1; then
    echo -e "${GREEN}PASS${NC}"
    ((SUCCESS++))
else
    echo -e "${YELLOW}WARNING${NC} - TypeScript errors found"
    ((WARNINGS++))
fi

echo ""
echo "=========================="
echo "SUMMARY"
echo "=========================="
echo -e "✅ Passed:   ${GREEN}$SUCCESS${NC}"
echo -e "⚠️  Warnings: ${YELLOW}$WARNINGS${NC}"
echo -e "❌ Errors:   ${RED}$ERRORS${NC}"
echo ""

if [ $ERRORS -gt 0 ]; then
    echo -e "${RED}⛔ DEPLOYMENT NOT SAFE - Fix errors before deploying${NC}"
    exit 1
elif [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}⚠️  DEPLOYMENT CAUTION - Review warnings${NC}"
    exit 0
else
    echo -e "${GREEN}✅ DEPLOYMENT READY - All checks passed${NC}"
    exit 0
fi

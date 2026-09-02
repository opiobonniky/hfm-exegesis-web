#!/bin/bash
# analyze-components.sh — Identifies oversized components and potential refactoring targets
# Usage: bash scripts/analyze-components.sh

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "═══════════════════════════════════════════════════════════"
echo " Component Analysis Tool — Architecture Health Check"
echo "═══════════════════════════════════════════════════════════"

# 1. Find files > 100 lines
echo -e "\n${YELLOW}Checking for oversized components (>100 lines)...${NC}"
OVERSIZED=$(find /home/boniface/project/exegesis/web/src/features -name "*.tsx" | xargs wc -l | awk '$1 > 100 {print $2 " (" $1 " lines)"}')

if [ -z "$OVERSIZED" ]; then
  echo -e "${GREEN}✅ No oversized components found.${NC}"
else
  echo "$OVERSIZED"
fi

# 2. Find components containing interfaces or types (Violation of types.ts pattern)
echo -e "\n${YELLOW}Checking for embedded types/interfaces...${NC}"
TYPE_VIOLATIONS=$(grep -rE "interface |type \w+ =" /home/boniface/project/exegesis/web/src/features -n --include "*.tsx" | grep -v "import")

if [ -z "$TYPE_VIOLATIONS" ]; then
  echo -e "${GREEN}✅ No embedded types found in components.${NC}"
else
  echo -e "${RED}❌ Found types in components (should be in types.ts):${NC}"
  echo "$TYPE_VIOLATIONS" | head -n 20
  echo "... (truncated)"
fi

# 3. Find components containing UPPER_CASE constants (Violation of constants.ts pattern)
echo -e "\n${YELLOW}Checking for embedded constants...${NC}"
CONST_VIOLATIONS=$(grep -rE "const [A-Z_]{2,}" /home/boniface/project/exegesis/web/src/features -n --include "*.tsx" | grep -v "import")

if [ -z "$CONST_VIOLATIONS" ]; then
  echo -e "${GREEN}✅ No embedded constants found in components.${NC}"
else
  echo -e "${RED}❌ Found constants in components (should be in constants.ts):${NC}"
  echo "$CONST_VIOLATIONS" | head -n 20
  echo "... (truncated)"
fi

echo -e "\n═══════════════════════════════════════════════════════════"

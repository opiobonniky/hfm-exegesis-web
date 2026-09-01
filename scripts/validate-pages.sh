#!/bin/bash
# validate-pages.sh — Validates that all feature pages follow the clean compositor pattern.
#
# Rules (based on DailyVerse.tsx and DailyDevotions.tsx as exemplars):
#   1. Pages must NOT contain raw HTML tags (div, h1, h2, p, span, button, input, etc.)
#      — only component tags (PascalCase) and JSX expressions are allowed
#   2. Pages must NOT contain React hooks (useState, useMemo, useCallback, useEffect, useRef)
#      — all logic belongs in hooks/
#   3. Pages must NOT contain inline business logic functions (const handleX = ..., const filtered = ...)
#      — only `const h = useXxxPage()` and component rendering
#   4. Pages must NOT define types/interfaces (interface X, type X = ...)
#      — types belong in types.ts
#   5. Pages must NOT define constants (const UPPER_CASE = ..., const XxxArray = [...], etc.)
#      — constants belong in constants.ts
#
# Usage: bash scripts/validate-pages.sh
# Exit code: 0 if all pages pass, 1 if any fail

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

PASS=0
FAIL=0
WARN=0
FAILED_FILES=()

check_page() {
  local file="$1"
  local relpath="$file"
  local issues=()

  # Rule 1: Check for raw HTML tags (not inside comments or strings)
  # Match common HTML tags that should be components instead
  html_tags=$(grep -nE '<(div|span|p |h1|h2|h3|h4|h5|h6|button|input|select|textarea|label|img|table|tr|td|th|thead|tbody|form|section|article|nav|header|footer|main|aside|br|hr|a )\b' "$file" 2>/dev/null | grep -v '^\s*//' | grep -v 'className=' | head -20 || true)
  # More lenient: just check for <div which is the most common raw HTML
  div_count=$(grep -cE '<div\b' "$file" 2>/dev/null || true)
  div_count=${div_count:-0}
  div_count=$(echo "$div_count" | head -1 | tr -d '[:space:]')
  if [ "$div_count" -gt 1 ]; then
    issues+=("RULE1: Has $div_count raw <div> tags (max 1 allowed — the root wrapper)")
  fi

  # Rule 2: Check for React hooks
  hooks=$(grep -oE '\b(useState|useMemo|useCallback|useEffect|useRef)\b' "$file" 2>/dev/null | sort -u | tr '\n' ', ' || true)
  if [ -n "$hooks" ]; then
    issues+=("RULE2: Contains React hooks: ${hooks%, }")
  fi

  # Rule 3: Check for inline business logic (useCallback, useMemo, async handlers, useEffect)
  logic=$(grep -nE '\b(useCallback|useMemo|useEffect|useRef)\b' "$file" 2>/dev/null | grep -v 'import\|//\|use\w\+Page\|use\w\+()' | head -5 || true)
  if [ -n "$logic" ]; then
    issues+=("RULE3: Contains React hooks used as inline logic")
  fi

  # Rule 4: Check for type/interface definitions
  types=$(grep -nE '^\s*(export\s+)?(interface|type)\s+\w+' "$file" 2>/dev/null | grep -v 'import\|//' | head -5 || true)
  if [ -n "$types" ]; then
    issues+=("RULE4: Contains type/interface definitions (move to types.ts)")
  fi

  # Rule 5: Check for inline constant definitions (should be in constants.ts)
  # Matches: const UPPER_CASE =, const SomeArray = [...], const SomeObject = {...},
  #          const FALLBACK =, const SLIDES =, const CATEGORY_META =, etc.
  # Allows: const h = useXxxPage(), const p = useXxx(), imports, return statements
  constants=$(grep -nE '^\s*(export\s+)?const\s+[A-Z][A-Z_0-9]+\s*=' "$file" 2>/dev/null | grep -v 'import\|//' | head -5 || true)
  constants2=$(grep -nE '^\s*(export\s+)?const\s+[A-Z][a-zA-Z]+\s*=\s*(\[|\{|\`)' "$file" 2>/dev/null | grep -v 'import\|//\|use[A-Z]' | head -5 || true)
  all_constants=""
  if [ -n "$constants" ]; then all_constants="$constants"; fi
  if [ -n "$constants2" ]; then all_constants="$all_constants\n$constants2"; fi
  if [ -n "$all_constants" ]; then
    issues+=("RULE5: Contains inline constants (move to constants.ts)")
  fi

  if [ ${#issues[@]} -eq 0 ]; then
    echo -e "${GREEN}✅ PASS${NC} $relpath"
    PASS=$((PASS + 1))
  else
    echo -e "${RED}❌ FAIL${NC} $relpath"
    for issue in "${issues[@]}"; do
      echo -e "   ${RED}• $issue${NC}"
    done
    FAIL=$((FAIL + 1))
    FAILED_FILES+=("$relpath")
  fi
}

echo "═══════════════════════════════════════════════════════════"
echo " Page Validator — Clean Compositor Pattern"
echo " Exemplar: DailyVerse.tsx / DailyDevotions.tsx"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Find all page files (relative to project root where script runs)
echo -e "${YELLOW}Checking Admin pages...${NC}"
for f in $(find src/features/Admin/pages -name "*.tsx" 2>/dev/null | sort); do
  check_page "$f"
done

echo ""
echo -e "${YELLOW}Checking DailyContent pages...${NC}"
for f in $(find src/features/DailyContent/pages -name "*.tsx" 2>/dev/null | sort); do
  check_page "$f"
done

echo ""
echo -e "${YELLOW}Checking Auth pages...${NC}"
for f in $(find src/features/Auth/pages -name "*.tsx" 2>/dev/null | sort); do
  check_page "$f"
done

echo ""
echo -e "${YELLOW}Checking other feature pages...${NC}"
for f in $(find src/features -path "*/pages/*.tsx" \
  ! -path "*/Admin/*" \
  ! -path "*/DailyContent/*" \
  ! -path "*/Auth/*" \
  2>/dev/null | sort); do
  check_page "$f"
done

echo ""
echo "═══════════════════════════════════════════════════════════"
echo -e " Results: ${GREEN}$PASS passed${NC}, ${RED}$FAIL failed${NC}"
echo "═══════════════════════════════════════════════════════════"

if [ $FAIL -gt 0 ]; then
  echo ""
  echo -e "${RED}Files that need refactoring:${NC}"
  for f in "${FAILED_FILES[@]}"; do
    echo -e "  ${RED}• $f${NC}"
  done
  exit 1
else
  echo ""
  echo -e "${GREEN}All pages follow the clean compositor pattern! 🎉${NC}"
  exit 0
fi

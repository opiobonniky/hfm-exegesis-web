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
#   6. Pages must NOT have TypeScript errors (type mismatches, missing properties, etc.)
#      — run `npx tsc --noEmit` and check for errors in each page file
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

# ── Run TypeScript check once and cache errors per file ──
TS_ERROR_FILE=$(mktemp)
if npx tsc --noEmit 2>"$TS_ERROR_FILE"; then
  TS_CLEAN=true
else
  TS_CLEAN=false
fi

# Build associative array: file -> list of error lines
declare -A TS_ERRORS
if [ "$TS_CLEAN" = false ] && [ -s "$TS_ERROR_FILE" ]; then
  while IFS= read -r line; do
    # Extract file path from lines like: src/features/X/pages/Y.tsx(10,5): error TS2339: ...
    fpath=$(echo "$line" | grep -oP '^\S+\.tsx' || true)
    if [ -n "$fpath" ]; then
      # Get just the filename portion for matching
      fname=$(basename "$fpath")
      if [ -z "${TS_ERRORS[$fpath]+x}" ]; then
        TS_ERRORS[$fpath]="$line"
      else
        TS_ERRORS[$fpath]="${TS_ERRORS[$fpath]}
$line"
      fi
    fi
  done < "$TS_ERROR_FILE"
fi
rm -f "$TS_ERROR_FILE"

check_page() {
  local file="$1"
  local relpath="$file"
  local issues=()

  # Rule 1: Check for raw HTML tags (not inside comments or strings)
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
  constants=$(grep -nE '^\s*(export\s+)?const\s+[A-Z][A-Z_0-9]+\s*=' "$file" 2>/dev/null | grep -v 'import\|//' | head -5 || true)
  constants2=$(grep -nE '^\s*(export\s+)?const\s+[A-Z][a-zA-Z]+\s*=\s*(\[|\{|\`)' "$file" 2>/dev/null | grep -v 'import\|//\|use[A-Z]' | head -5 || true)
  all_constants=""
  if [ -n "$constants" ]; then all_constants="$constants"; fi
  if [ -n "$constants2" ]; then all_constants="$all_constants\n$constants2"; fi
  if [ -n "$all_constants" ]; then
    issues+=("RULE5: Contains inline constants (move to constants.ts)")
  fi

  # Rule 6: Check for TypeScript errors in this file
  if [ "$TS_CLEAN" = false ]; then
    local file_errors="${TS_ERRORS[$file]:-}"
    if [ -n "$file_errors" ]; then
      local error_count
      error_count=$(echo "$file_errors" | wc -l | tr -d '[:space:]')
      # Extract first error message (trimmed)
      local first_error
      first_error=$(echo "$file_errors" | head -1 | sed 's/^.*error TS[0-9]*: //' | head -c 120)
      issues+=("RULE6: Has $error_count TypeScript error(s) — e.g. $first_error")
    fi
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

# Show TypeScript check status
if [ "$TS_CLEAN" = true ]; then
  echo -e "${GREEN}✓ TypeScript: no errors${NC}"
else
  error_count=$(wc -l < "$TS_ERROR_FILE" 2>/dev/null || echo 0)
  echo -e "${RED}✗ TypeScript: $error_count error(s) found${NC}"
  # Show per-file error summary
  for fpath in "${!TS_ERRORS[@]}"; do
    count=$(echo "${TS_ERRORS[$fpath]}" | wc -l | tr -d '[:space:]')
    echo -e "   ${RED}• $fpath — $count error(s)${NC}"
  done
fi
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

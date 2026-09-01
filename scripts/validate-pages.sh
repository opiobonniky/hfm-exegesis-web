#!/bin/bash
# validate-pages.sh — Validates that all feature pages follow the clean compositor pattern.
#
# Rules (based on DailyVerse.tsx as exemplar):
#   1. Pages must NOT contain more than 1 raw <div> tag (root wrapper only)
#   2. Pages must NOT contain React hooks (useState, useMemo, useCallback, useEffect, useRef)
#   3. Pages must NOT contain inline business logic (useCallback, useMemo, async handlers)
#   4. Pages must NOT define types/interfaces (interface X, type X = ...)
#   5. Pages must NOT define constants (const UPPER_CASE = ..., const XxxArray = [...])
#   6. Pages must NOT have TypeScript errors (tsc --noEmit)
#   7. Pages must NOT have className on styled components or raw HTML elements
#   8. Pages must NOT have inline .map() or array rendering
#   9. Pages must NOT use motion.* components (motion.div, motion.span, etc.)
#  10. Pages must NOT have styled <button> or <a> elements
#  11. Pages must NOT have inline data arrays (const xxx = [...]) for component props
#      — data arrays belong in constants.ts, pages just import and pass to components
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

declare -A TS_ERRORS
if [ "$TS_CLEAN" = false ] && [ -s "$TS_ERROR_FILE" ]; then
  while IFS= read -r line; do
    fpath=$(echo "$line" | grep -oP '^\S+\.tsx' || true)
    if [ -n "$fpath" ]; then
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

  # ── RULE 1: Max 1 raw <div> (root wrapper) ──
  div_count=$(grep -cE '<div\b' "$file" 2>/dev/null || true)
  div_count=${div_count:-0}
  div_count=$(echo "$div_count" | head -1 | tr -d '[:space:]')
  if [ "$div_count" -gt 1 ]; then
    issues+=("RULE1: Has $div_count raw <div> tags (max 1 allowed — the root wrapper)")
  fi

  # ── RULE 2: No React hooks in pages ──
  hooks=$(grep -oE '\b(useState|useMemo|useCallback|useEffect|useRef)\b' "$file" 2>/dev/null | sort -u | tr '\n' ', ' || true)
  if [ -n "$hooks" ]; then
    issues+=("RULE2: Contains React hooks: ${hooks%, }")
  fi

  # ── RULE 3: No inline business logic ──
  logic=$(grep -nE '\b(useCallback|useMemo|useEffect|useRef)\b' "$file" 2>/dev/null | grep -v 'import\|//\|use\w\+Page\|use\w\+()' | head -5 || true)
  if [ -n "$logic" ]; then
    issues+=("RULE3: Contains React hooks used as inline logic")
  fi

  # ── RULE 4: No type/interface definitions ──
  types=$(grep -nE '^\s*(export\s+)?(interface|type)\s+\w+' "$file" 2>/dev/null | grep -v 'import\|//' | head -5 || true)
  if [ -n "$types" ]; then
    issues+=("RULE4: Contains type/interface definitions (move to types.ts)")
  fi

  # ── RULE 5: No inline constant definitions ──
  constants=$(grep -nE '^\s*(export\s+)?const\s+[A-Z][A-Z_0-9]+\s*=' "$file" 2>/dev/null | grep -v 'import\|//' | head -5 || true)
  constants2=$(grep -nE '^\s*(export\s+)?const\s+[A-Z][a-zA-Z]+\s*=\s*(\[|\{|\`)' "$file" 2>/dev/null | grep -v 'import\|//\|use[A-Z]' | head -5 || true)
  all_constants=""
  if [ -n "$constants" ]; then all_constants="$constants"; fi
  if [ -n "$constants2" ]; then all_constants="$all_constants
$constants2"; fi
  if [ -n "$all_constants" ]; then
    issues+=("RULE5: Contains inline constants (move to constants.ts)")
  fi

  # ── RULE 6: No TypeScript errors ──
  if [ "$TS_CLEAN" = false ]; then
    local file_errors="${TS_ERRORS[$file]:-}"
    if [ -n "$file_errors" ]; then
      local error_count
      error_count=$(echo "$file_errors" | wc -l | tr -d '[:space:]')
      local first_error
      first_error=$(echo "$file_errors" | head -1 | sed 's/^.*error TS[0-9]*: //' | head -c 120)
      issues+=("RULE6: Has $error_count TypeScript error(s) — e.g. $first_error")
    fi
  fi

  # ── RULE 7: No className on styled components or raw HTML ──
  styled_buttons=$(grep -nE '<Button\s+.*className=' "$file" 2>/dev/null | grep -v 'import\|//' | head -5 || true)
  styled_links=$(grep -nE '<Link\s+.*className=' "$file" 2>/dev/null | grep -v 'import\|//' | head -5 || true)
  styled_headings=$(grep -nE '<(h[1-6]|span|p|label)\s+.*className=' "$file" 2>/dev/null | grep -v 'import\|//' | head -5 || true)
  styled_buttons_total=0
  if [ -n "$styled_buttons" ]; then
    styled_buttons_total=$(echo "$styled_buttons" | wc -l | tr -d '[:space:]')
  fi
  styled_links_total=0
  if [ -n "$styled_links" ]; then
    styled_links_total=$(echo "$styled_links" | wc -l | tr -d '[:space:]')
  fi
  styled_headings_total=0
  if [ -n "$styled_headings" ]; then
    styled_headings_total=$(echo "$styled_headings" | wc -l | tr -d '[:space:]')
  fi
  total_styled=$((styled_buttons_total + styled_links_total + styled_headings_total))
  if [ "$total_styled" -gt 0 ]; then
    issues+=("RULE7: Has $total_styled styled element(s) — extract Button/Link/text to wrapper components")
  fi

  # ── RULE 8: No inline .map() or array rendering ──
  maps=$(grep -nE '\.map\(' "$file" 2>/dev/null | grep -v 'import\|//\|^\s*\*' | head -5 || true)
  if [ -n "$maps" ]; then
    issues+=("RULE8: Contains inline .map() — extract data to constants, rendering to components")
  fi

  # ── RULE 9: No motion.* components ──
  motion=$(grep -nE 'motion\.' "$file" 2>/dev/null | grep -v 'import\|//\|^\s*\*' | head -5 || true)
  if [ -n "$motion" ]; then
    issues+=("RULE9: Contains motion.* components — extract to animated wrapper components")
  fi

  # ── RULE 10: No styled <button> or <a> elements ──
  styled_native=$(grep -nE '<(button|a)\s+.*className=' "$file" 2>/dev/null | grep -v 'import\|//' | head -5 || true)
  if [ -n "$styled_native" ]; then
    issues+=("RULE10: Contains styled native <button>/<a> — extract to wrapper components")
  fi

  # ── RULE 11: No inline data arrays for component props ──
  # Matches: const xxx = [{ icon: ..., title: ... }], const items = [...]
  # These should be in constants.ts and imported
  data_arrays=$(grep -nE '^\s*(const|let|var)\s+\w+\s*=\s*\[' "$file" 2>/dev/null | grep -v 'import\|//\|^\s*\*' | head -5 || true)
  if [ -n "$data_arrays" ]; then
    issues+=("RULE11: Contains inline data array — move to constants.ts")
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

if [ "$TS_CLEAN" = true ]; then
  echo -e "${GREEN}✓ TypeScript: no errors${NC}"
else
  error_count=$(wc -l < "$TS_ERROR_FILE" 2>/dev/null || echo 0)
  echo -e "${RED}✗ TypeScript: $error_count error(s) found${NC}"
  for fpath in "${!TS_ERRORS[@]}"; do
    count=$(echo "${TS_ERRORS[$fpath]}" | wc -l | tr -d '[:space:]')
    echo -e "   ${RED}• $fpath — $count error(s)${NC}"
  done
fi
echo ""

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

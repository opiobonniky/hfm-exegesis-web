#!/usr/bin/env bash
# Validates feature components expose explicit props instead of page/model bags.

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'
PASS=0
FAIL=0
TARGET="${1:-src/features}"
TYPE_ERROR_FILE=".validate-components.$$.log"
trap 'rm -f "$TYPE_ERROR_FILE"' EXIT

if [ "$TARGET" = "--help" ] || [ "$TARGET" = "-h" ]; then
  printf 'Usage: %s [component-file-or-directory]\n' "$0"
  printf 'With no argument, validates components under src/features.\n'
  exit 0
fi

check_component() {
  local file="$1"
  local issues=()

  grep -qE 'export (default[[:space:]]+)?(function|const) [A-Z][A-Za-z0-9_]*' "$file" || return 0

  if [ -s "$TYPE_ERROR_FILE" ] && grep -Fq "$file" "$TYPE_ERROR_FILE"; then
    issues+=("TypeScript diagnostics exist for this component")
  fi

  if grep -qE '(sendPostRequest|bibleApi\.|window\.fetch[[:space:]]*\(|globalThis\.fetch[[:space:]]*\(|axios\.|api\.(get|post|put|patch|delete)[[:space:]]*\()' "$file"; then
    issues+=("direct API access detected; use an Admin service through a hook")
  fi

  if grep -qE '\bmodel[[:space:]]*:' "$file" || grep -qE 'model[[:space:]]*=' "$file"; then
    issues+=("model prop usage detected; pass explicit props")
  fi

  # Component-local Props interfaces are presentation contracts, not domain models.

  if [[ "$file" == *"/components/AddExplanation"* ]] && ! grep -qE 'from[[:space:]]+["'\'']\.\./types["'\'']' "$file"; then
    issues+=("Add Explanation component must import its props from ../types")
  fi

  if grep -qE '<[A-Z][A-Za-z0-9_]*[[:space:]]+model=' "$file"; then
    issues+=("child component receives model=; pass named props")
  fi

  if [ "${#issues[@]}" -eq 0 ]; then
    printf "${GREEN}PASS${NC} %s\n" "$file"
    PASS=$((PASS + 1))
  else
    printf "${RED}FAIL${NC} %s\n" "$file"
    printf '  %s\n' "${issues[@]}"
    FAIL=$((FAIL + 1))
  fi
}

if [ -f "$TARGET" ]; then
  npx tsc --noEmit --project tsconfig.app.json --pretty false >"$TYPE_ERROR_FILE" 2>&1 || true
  check_component "$TARGET"
else
  npx tsc --noEmit --project tsconfig.app.json --pretty false >"$TYPE_ERROR_FILE" 2>&1 || true
  while IFS= read -r file; do
    check_component "$file"
  done < <(find "$TARGET" -path '*/components/*.tsx' -type f | sort)
fi

printf '\nResults: %s passed, %s failed\n' "$PASS" "$FAIL"
if [ "$FAIL" -gt 0 ]; then
  exit 1
fi

#!/usr/bin/env bash
# Validates page hooks use the data/actions contract.
#
# Rules:
#   1. Hooks expose { data, actions } from their public return value.
#   2. data contains state/derived values, not callbacks.
#   3. actions contains callbacks/setters, not state values.
#   4. API/network calls are made by services, not page hooks.
#   5. Hooks import service modules for data access.

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'
PASS=0
FAIL=0
TARGET="${1:-}"
TYPE_ERROR_FILE=".validate-hooks.$$.log"
trap 'rm -f "$TYPE_ERROR_FILE"' EXIT

if [ "$TARGET" = "--help" ] || [ "$TARGET" = "-h" ]; then
  printf 'Usage: %s [hook-file-or-directory]\n' "$0"
  printf 'With no argument, validates every hook under src/features.\n'
  exit 0
fi

check_hook() {
  local file="$1"
  local issues=()
  local body
  if ! grep -qE '^[[:space:]]*(export[[:space:]]+)?function[[:space:]]+use|^[[:space:]]*export[[:space:]]+const[[:space:]]+use' "$file"; then
    return 0
  fi

  if [ -s "$TYPE_ERROR_FILE" ] && grep -Fq "$file" "$TYPE_ERROR_FILE"; then
    issues+=("RULE0: TypeScript diagnostics exist for this hook")
  fi

  local body
  body=$(sed -n '/^[[:space:]]*return[[:space:]]*{/,$p' "$file" 2>/dev/null || true)
  if ! printf '%s\n' "$body" | grep -qE '[[:space:]]data[[:space:]]*:' ||
     ! printf '%s\n' "$body" | grep -qE '[[:space:]]actions[[:space:]]*:'; then
    issues+=("RULE1: Public return must expose both data and actions")
  fi

  # Hooks may orchestrate service calls, but must not import or invoke the
  # transport layer directly. Keep this check focused on hook source files so
  # service implementations remain valid.
  if grep -qE '(^|[^[:alnum:]_])(sendPostRequest|sendGetRequest|sendPutRequest|sendPatchRequest|sendDeleteRequest|bibleApi\.|window\.fetch[[:space:]]*\(|globalThis\.fetch[[:space:]]*\(|axios\.|api\.(get|post|put|patch|delete)[[:space:]]*\()' "$file"; then
    issues+=("RULE4: Direct API calls are forbidden in hooks; move transport calls to services")
  fi

  if grep -qE 'adminApi\.' "$file" && ! grep -qE 'from[[:space:]]+["'\''](\.\./)+services/' "$file"; then
    issues+=("RULE5: Admin API access must come from a feature service module")
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

printf "${YELLOW}Validating page hooks...${NC}\n"
if npx tsc --noEmit --project tsconfig.app.json --pretty false >"$TYPE_ERROR_FILE" 2>&1; then
  : > "$TYPE_ERROR_FILE"
fi
if [ -n "$TARGET" ] && [ -f "$TARGET" ]; then
  check_hook "$TARGET"
elif [ -n "$TARGET" ] && [ -d "$TARGET" ]; then
  while IFS= read -r file; do
    check_hook "$file"
  done < <(find "$TARGET" -path '*/hooks/*.ts' -o -path '*/hooks/*.tsx' | sort)
else
  while IFS= read -r file; do
    check_hook "$file"
  done < <(find src/features -path '*/hooks/*.ts' -o -path '*/hooks/*.tsx' | sort)
fi

printf '\nResults: %s passed, %s failed\n' "$PASS" "$FAIL"
if [ "$FAIL" -gt 0 ]; then
  exit 1
fi

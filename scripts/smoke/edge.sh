#!/usr/bin/env bash
# scripts/smoke/edge.sh — post-deploy edge smoke test.
#
# Usage:
#   bash scripts/smoke/edge.sh <base-url>
#   BASE_URL=https://cc.codechup.com bash scripts/smoke/edge.sh
#
# Checks the live routing/asset behaviour of the site through whatever is in
# front of it at <base-url> (Cloudflare + nginx in production, `astro preview`
# locally). Prints one PASS/FAIL/SKIP line per assertion and exits non-zero if
# any assertion fails.
#
# Local runs (`npm run build && npm run preview`, http://localhost:4321) can't
# exercise the checks that only nginx/Cloudflare satisfy: the "/" language
# redirect (nginx owns "/" in production — see src/pages/index.astro), the
# CSP/HSTS/nosniff response headers, and the immutable Cache-Control on
# hashed assets. Set SMOKE_SKIP_EDGE=1 to skip exactly those and run
# everything else (200s on known routes, the 404, sitemap/rss/pagefind).
#
# NOTE: deliberately no `-e` here. A smoke test's whole job is to survive an
# unreachable/misbehaving origin and report FAIL lines for it (curl exit
# 7/28/35 on a connection failure, timeout, or TLS error) rather than dying
# silently mid-run with no output. FAIL_COUNT (see below) drives the exit
# code instead.
set -uo pipefail

BASE_URL="${1:-${BASE_URL:-}}"
if [ -z "${BASE_URL:-}" ]; then
  echo "usage: $0 <base-url>   (or set BASE_URL=<url>)" >&2
  exit 2
fi
# strip a trailing slash so path concatenation below never doubles up
BASE_URL="${BASE_URL%/}"

SKIP_EDGE="${SMOKE_SKIP_EDGE:-0}"

PASS_COUNT=0
FAIL_COUNT=0
SKIP_COUNT=0

pass() {
  printf 'PASS: %s\n' "$1"
  PASS_COUNT=$((PASS_COUNT + 1))
}

fail() {
  printf 'FAIL: %s\n' "$1"
  FAIL_COUNT=$((FAIL_COUNT + 1))
}

skip() {
  printf 'SKIP: %s (needs nginx/Cloudflare, not available locally)\n' "$1"
  SKIP_COUNT=$((SKIP_COUNT + 1))
}

# curl_status <path> [curl-args...] -> prints the HTTP status code
curl_status() {
  path="$1"
  shift
  curl -s -o /dev/null -w '%{http_code}' --max-time 20 "$@" "${BASE_URL}${path}"
}

# header_value <headers-blob> <header-name> -> prints the header's value (last match, trimmed),
# or an empty string when the header is absent (must not trip `set -o pipefail`).
header_value() {
  blob="$1"
  name="$2"
  printf '%s\n' "$blob" | { grep -i "^${name}:" || true; } | tail -n1 | sed -E "s/^[^:]+:[[:space:]]*//" | tr -d '\r'
}

# assert_status <label> <path> [curl-args...]
assert_status_200() {
  label="$1"
  path="$2"
  shift 2
  code=$(curl_status "$path" "$@")
  if [ "$code" = "200" ]; then
    pass "$label ($path -> 200)"
  else
    fail "$label ($path -> expected 200, got $code)"
  fi
}

assert_status_404() {
  label="$1"
  path="$2"
  code=$(curl_status "$path")
  if [ "$code" = "404" ]; then
    pass "$label ($path -> 404)"
  else
    fail "$label ($path -> expected 404, got $code)"
  fi
}

# assert_redirect <label> <path> <expected-location-prefix> [curl-args...]
assert_redirect() {
  label="$1"
  path="$2"
  expected="$3"
  shift 3
  headers=$(curl -s -D - -o /dev/null --max-time 20 "$@" "${BASE_URL}${path}")
  status=$(printf '%s\n' "$headers" | head -n1 | awk '{print $2}')
  location=$(header_value "$headers" "Location")
  if [ "$status" = "302" ] && printf '%s' "$location" | grep -qE "^(https?://[^/]+)?${expected}"; then
    pass "$label ($path -> 302 Location: $location)"
  else
    fail "$label ($path -> expected 302 to $expected, got status=$status location=$location)"
  fi
}

echo "== edge smoke test: ${BASE_URL} =="
echo

# --- routes that work identically locally and in production ---------------
assert_status_200 "English home" "/en/"
assert_status_200 "Turkish home" "/tr/"
assert_status_200 "Design system page" "/design/"
assert_status_200 "Sitemap index" "/sitemap-index.xml"
assert_status_200 "English RSS feed" "/en/rss.xml"
assert_status_200 "Pagefind entry" "/pagefind/pagefind-entry.json"
assert_status_404 "Unknown path" "/nope/"

echo

# --- routing behaviour owned by nginx in production ------------------------
if [ "$SKIP_EDGE" = "1" ]; then
  skip "/ -> 302 to /en/ (default language redirect)"
  skip "/ with Accept-Language: tr -> 302 to /tr/"
  skip "/ with cc_lang=en cookie overrides Accept-Language: tr -> 302 to /en/"
else
  assert_redirect "Default language redirect" "/" "/en/"
  assert_redirect "Accept-Language redirect" "/" "/tr/" -H "Accept-Language: tr-TR,tr"
  assert_redirect "Cookie overrides Accept-Language" "/" "/en/" \
    -H "Accept-Language: tr" -H "Cookie: cc_lang=en"
fi

echo

# --- response headers (nginx/Cloudflare only) -------------------------------
if [ "$SKIP_EDGE" = "1" ]; then
  skip "CSP header on /en/ (giscus.app + wasm-unsafe-eval)"
  skip "HSTS header on /en/"
  skip "X-Content-Type-Options: nosniff on /en/"
else
  headers=$(curl -s -D - -o /dev/null --max-time 20 "${BASE_URL}/en/")
  csp=$(header_value "$headers" "Content-Security-Policy")
  if [ -n "$csp" ] && printf '%s' "$csp" | grep -q "giscus.app" && printf '%s' "$csp" | grep -q "wasm-unsafe-eval"; then
    pass "CSP header on /en/ present and contains giscus.app + wasm-unsafe-eval"
  else
    fail "CSP header on /en/ missing or incomplete: $csp"
  fi

  hsts=$(header_value "$headers" "Strict-Transport-Security")
  if [ -n "$hsts" ]; then
    pass "HSTS header on /en/ present ($hsts)"
  else
    fail "HSTS header on /en/ missing"
  fi

  nosniff=$(header_value "$headers" "X-Content-Type-Options")
  if [ "$nosniff" = "nosniff" ]; then
    pass "X-Content-Type-Options: nosniff on /en/"
  else
    fail "X-Content-Type-Options on /en/ expected 'nosniff', got '$nosniff'"
  fi
fi

echo

# --- immutable caching on hashed assets (nginx only) ------------------------
if [ "$SKIP_EDGE" = "1" ]; then
  skip "Cache-Control: immutable on the first hashed /_astro/ asset"
else
  html=$(curl -s --max-time 20 "${BASE_URL}/en/")
  # Pages carry their CSS inline by design (see astro.config.ts build.inlineStylesheets),
  # so the hashed assets under /_astro/ are scripts and fonts; any one proves the rule.
  css_path=$(printf '%s\n' "$html" | grep -oE '/_astro/[A-Za-z0-9_.-]+[.](css|js|woff2)' | head -n1 || true)
  if [ -z "$css_path" ]; then
    fail "No hashed /_astro/ asset referenced from /en/"
  else
    cache_control=$(header_value "$(curl -s -D - -o /dev/null --max-time 20 "${BASE_URL}${css_path}")" "Cache-Control")
    if printf '%s' "$cache_control" | grep -q "immutable"; then
      pass "Cache-Control on $css_path contains immutable ($cache_control)"
    else
      fail "Cache-Control on $css_path expected to contain immutable, got '$cache_control'"
    fi
  fi
fi

echo
echo "== summary: ${PASS_COUNT} passed, ${FAIL_COUNT} failed, ${SKIP_COUNT} skipped =="

if [ "$FAIL_COUNT" -gt 0 ]; then
  exit 1
fi
exit 0

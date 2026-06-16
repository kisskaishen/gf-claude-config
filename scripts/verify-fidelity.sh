#!/usr/bin/env bash
# =============================================================================
# verify-fidelity.sh — UI Fidelity Self-Test Shell Wrapper
# =============================================================================
# Wrapper around verify-fidelity.ts that:
#   1. Auto-starts Vite dev server if not running
#   2. Runs the fidelity comparison
#   3. Cleans up dev server if we started it
#
# Usage: bash scripts/verify-fidelity.sh --ref=<path> --route=<path>
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# Parse args, extract --ref and --route for our own use
REF=""
ROUTE=""
CAPTURE_ONLY=false
EXTRA_ARGS=()

for arg in "$@"; do
  case "$arg" in
    --ref=*) REF="${arg#*=}" ;;
    --route=*) ROUTE="${arg#*=}" ;;
    --capture-only) CAPTURE_ONLY=true ;;
    *) EXTRA_ARGS+=("$arg") ;;
  esac
done

# Check if required tools exist
if ! command -v npx &>/dev/null; then
  echo "✗ npx not found. Please install Node.js."
  exit 1
fi

# Check required deps for capture mode
if [ "$CAPTURE_ONLY" = false ] && [ -z "$REF" ]; then
  echo "✗ 需要 --ref=<参考图路径> 参数"
  echo "  用法: bash scripts/verify-fidelity.sh --ref=scripts/fidelity/refs/<page>.png --route=/your-route"
  exit 1
fi

# Start dev server if not already running
DEV_PID=""
cleanup() {
  if [ -n "$DEV_PID" ]; then
    echo ""
    echo "  正在停止 dev server..."
    kill "$DEV_PID" 2>/dev/null || true
    wait "$DEV_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT

if ! curl -s -o /dev/null --connect-timeout 2 http://localhost:5173 2>/dev/null; then
  echo "  Starting Vite dev server..."
  cd "$REPO_DIR"
  pnpm run dev &
  DEV_PID=$!
  echo "  Waiting for dev server to be ready..."

  for i in $(seq 1 30); do
    if curl -s -o /dev/null --connect-timeout 1 http://localhost:5173 2>/dev/null; then
      echo "  Dev server ready at http://localhost:5173"
      break
    fi
    if [ "$i" -eq 30 ]; then
      echo "  ✗ Dev server failed to start within 30s"
      exit 1
    fi
    sleep 1
  done
else
  echo "  Dev server already running at http://localhost:5173"
fi

# Run the verification script
echo ""
cd "$REPO_DIR"
npx tsx scripts/verify-fidelity.ts "$@"

#!/bin/bash
# Monthly Observership Data Verification & Auto-Update
# Runs the verifier, rebuilds if data changed, commits and pushes
#
# Set up as cron: 0 6 1 * * /home/ubuntu/.openclaw/workspace/heartwise/scripts/monthly-verify.sh

set -e

DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$DIR"

echo "$(date) — Starting monthly observership verification"

# Run verifier with auto-update
node scripts/verify-observerships.js --auto-update || {
  echo "⚠️  Verification flagged issues — check verification-report.json"
}

# Check if data file changed
if git diff --quiet src/observership-data.js 2>/dev/null; then
  echo "No data changes detected"
else
  echo "Data updated — rebuilding..."
  node build.js
  
  git add -A
  git commit -m "Monthly observership data verification $(date +%Y-%m)"
  git push origin main
  
  echo "✅ Updated and pushed"
fi

echo "$(date) — Verification complete"

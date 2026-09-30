#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "==> Setting up Hermes Telegram Relay Bridge..."

# Check node
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed."
    exit 1
fi

# Stop existing bridge instance if running
pkill -f "node.*bridge.js" 2>/dev/null || true

# Start bridge in background with nohup
echo "==> Starting bridge service on port 8081..."
nohup node "${DIR}/bridge.js" > "${DIR}/bridge.log" 2>&1 &

sleep 2

# Verify health
if curl -s http://127.0.0.1:8081/ >/dev/null 2>&1 || true; then
    echo "✓ Bridge is active and listening on http://127.0.0.1:8081"
else
    echo "Warning: Bridge did not respond immediately, please check ${DIR}/bridge.log"
fi

# Add to crontab if not already there
CRON_JOB="@reboot nohup node ${DIR}/bridge.js >/dev/null 2>&1 &"
(crontab -l 2>/dev/null | grep -F "${DIR}/bridge.js") || (crontab -l 2>/dev/null; echo "${CRON_JOB}") | crontab -
echo "✓ Added auto-start to crontab"

echo ""
echo "Done! Make sure your Hermes config has:"
echo "  platforms.telegram.base_url: \"http://127.0.0.1:8081/bot\""

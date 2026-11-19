#!/usr/bin/env bash
# Starts Expo pointing the app to the API running on this machine.
# The phone must be on the same Wi-Fi network as the computer.
set -euo pipefail
cd "$(dirname "$0")/../apps/mobile"

IP="${LAN_IP:-}"
if [ -z "$IP" ]; then
  IP="$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || hostname -I 2>/dev/null | awk '{print $1}' || true)"
fi
if [ -z "$IP" ]; then
  echo "Não encontrei o IP da rede. Rode com LAN_IP=192.168.x.x npm run dev" >&2
  exit 1
fi

export EXPO_PUBLIC_API_URL="${EXPO_PUBLIC_API_URL:-http://$IP:3000}"
echo "App usando a API em $EXPO_PUBLIC_API_URL"
exec npx expo start

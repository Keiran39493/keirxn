#!/usr/bin/env bash
# One-time setup on 161.35.215.162 (uses existing propertydog nginx-certbot on :80/:443).
set -euo pipefail

APP_DIR="/opt/sos-kf-prototype"
DEPLOY_PUBKEY="ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIJHriK51LbluxcOSgpDupL4cdyPyeX6wdTQIhRF7KIRo github-actions-sos-kf-prototype"

mkdir -p /root/.ssh && chmod 700 /root/.ssh
grep -qF "${DEPLOY_PUBKEY}" /root/.ssh/authorized_keys 2>/dev/null || \
  echo "${DEPLOY_PUBKEY}" >> /root/.ssh/authorized_keys
chmod 600 /root/.ssh/authorized_keys

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker required — install Docker first."
  exit 1
fi

mkdir -p "${APP_DIR}"
echo "Sync repo to ${APP_DIR}, then run: bash ${APP_DIR}/deploy/scripts/remote-deploy.sh"

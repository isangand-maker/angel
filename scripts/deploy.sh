#!/bin/bash
# 서버에서 실행되는 배포 스크립트. GitHub Actions가 SSH로 접속해 호출합니다.
# 이미 git reset --hard로 최신 코드를 받은 상태에서 실행된다고 가정합니다.
set -e
export CI=true
export PORT=5173
export BASE_PATH=/

npm install -g pnpm@10.33.0

pnpm install --no-frozen-lockfile
pnpm run typecheck
pnpm -r --filter '!./artifacts/mockup-sandbox' --if-present run build
pnpm --filter @workspace/db run push

pm2 reload ecosystem.config.cjs --env production

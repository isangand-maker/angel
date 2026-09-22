#!/bin/bash
# 서버에서 실행되는 배포 스크립트. GitHub Actions가 SSH로 접속해 호출합니다.
# 이미 git reset --hard로 최신 코드를 받은 상태에서 실행된다고 가정합니다.
set -e

if ! command -v pnpm >/dev/null 2>&1; then
  npm install -g pnpm
fi

pnpm install --no-frozen-lockfile
pnpm run build
pnpm --filter @workspace/db run push

pm2 reload ecosystem.config.cjs --env production

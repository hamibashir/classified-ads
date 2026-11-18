#!/usr/bin/env bash
# ========================================================
# Zaaz B - Production Deployment Script for Hostinger VPS
# Usage: ./deploy.sh
# ========================================================

set -e

echo ">>> [1/5] Pulling latest changes from Git..."
git pull origin main

echo ">>> [2/5] Building Backend Server..."
cd server
npm ci --production=false
npx prisma generate
npx prisma db push --skip-generate
npm run build
cd ..

echo ">>> [3/5] Building Frontend Next.js..."
cd web
npm ci --production=false
npm run build
cd ..

echo ">>> [4/5] Reloading PM2 Processes..."
pm2 startOrReload ecosystem.config.js --env production
pm2 save

echo ">>> [5/5] Deployment Successful! Zaaz B is Live."

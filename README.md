# Zaaz B

Pakistan's Premier Verified Marketplace. A modern, multi-platform classifieds platform with web, mobile, and API clients. Users can browse and search listings, post ads, save favorites, contact sellers through real-time chat, and manage listings. Administrators can moderate ads, manage categories, review reports, and manage users.

## Project structure

```text
web/       Next.js web application
server/    Express + TypeScript REST API and Socket.IO server
mobile/    Flutter mobile application
```

The backend uses Prisma with MySQL. Uploaded media can be stored locally or through Cloudinary.

## Technology

- **Web:** Next.js 14, React 18, TypeScript, Tailwind CSS, Radix UI
- **API:** Express, TypeScript, Prisma, MySQL, JWT, Google OAuth, Socket.IO
- **Mobile:** Flutter, Dart, Provider, Dio, geolocation, Socket.IO

## Prerequisites

- Node.js 18+
- MySQL
- Flutter SDK 3.13+
- Git

## Local setup

### 1. Start the API

```powershell
cd server
copy .env.example .env
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

The API runs at `http://localhost:5000`. Health check:
`http://localhost:5000/api/v1/health`.

### 2. Start the web app

```powershell
cd web
copy .env.example .env.local
npm install
npm run dev
```

The web app runs at `http://localhost:3000`.

### 3. Run the mobile app

```powershell
cd mobile
flutter pub get
flutter run
```

For a custom API host:

```powershell
flutter run --dart-define=API_BASE_URL=http://<host>:5000/api/v1 --dart-define=SOCKET_URL=http://<host>:5000
```

Android emulators default to `10.0.2.2:5000`; desktop, iOS, and web default to `localhost:5000`.

## Environment configuration

Copy the example files before running:

- `server/.env.example` — database, JWT, storage, OAuth, and CORS settings
- `web/.env.example` — API, Socket.IO, app URL, and Google OAuth settings

Change the development JWT secrets and default admin password for any shared or production environment.

## Useful commands

### Server

```powershell
npm run dev
npm run build
npm run prisma:validate
npm run prisma:generate
```

### Web

```powershell
npm run dev
npm run build
npm run start
npm run lint
```

### Mobile

```powershell
flutter analyze
flutter test
```

## Main API areas

- `/api/v1/auth` — registration, login, refresh, profile, Google OAuth
- `/api/v1/ads` — listing search, publishing, favorites, and seller listings
- `/api/v1/categories` and `/api/v1/locations` — marketplace metadata
- `/api/v1/chat` — conversations and messages
- `/api/v1/admin` — moderation, reports, categories, users, and settings
- `/api/v1/upload` — image uploads

## Database model

Core Prisma models include `User`, `Ad`, `Category`, `AdImage`, `Conversation`, `Message`, `Favorite`, `Report`, and `SystemSetting`.

---

## Hostinger Production Deployment Guide

Deploying Zaaz B on a Hostinger VPS (Ubuntu 22.04 / 24.04 LTS):

### 1. Server Prerequisites
Connect to your Hostinger VPS via SSH and install Node.js 20+, PM2, Nginx, and MySQL (or use Hostinger Managed Database):

```bash
# Update and install dependencies
sudo apt update && sudo apt upgrade -y
sudo apt install -y nginx git curl ufw

# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 process manager
sudo npm install -g pm2
```

### 2. Clone Repository
```bash
cd /var/www
git clone <YOUR_GIT_REPO_URL> zaazb
cd zaazb
```

### 3. Configure Production Environments
Copy the production environment templates and fill in your domain and database credentials:

```bash
# Server configuration
cp server/.env.production.example server/.env
nano server/.env
# Update: DATABASE_URL, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, CLIENT_URL="https://yourdomain.com"

# Web configuration
cp web/.env.production.example web/.env
nano web/.env
# Update: NEXT_PUBLIC_API_URL="https://yourdomain.com/api/v1", NEXT_PUBLIC_SOCKET_URL="https://yourdomain.com", NEXT_PUBLIC_APP_URL="https://yourdomain.com"
```

### 4. Build and Seed Database
```bash
# Backend setup & schema sync
cd /var/www/zaazb/server
npm ci
npx prisma generate
npx prisma db push
npm run db:seed
npm run build

# Frontend Next.js build
cd /var/www/zaazb/web
npm ci
npm run build
```

### 5. Start with PM2
From the root directory (`/var/www/zaazb`):

```bash
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### 6. Configure Nginx & SSL
Copy the ready-to-use configuration file:

```bash
sudo cp hostinger/nginx.conf /etc/nginx/sites-available/zaazb.conf
# Replace 'zaazb.com' with your actual domain
sudo nano /etc/nginx/sites-available/zaazb.conf
sudo ln -s /etc/nginx/sites-available/zaazb.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Install free Let's Encrypt SSL with Certbot
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### 7. Future Deployments
To deploy updates at any time, simply run:
```bash
chmod +x deploy.sh
./deploy.sh
```


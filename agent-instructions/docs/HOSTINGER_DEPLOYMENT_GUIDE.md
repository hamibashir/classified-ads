# Classified Ads PK - Hostinger & Production Deployment Guide

> **TARGET ENVIRONMENT:** Hostinger Business / Cloud Web Hosting with Node.js Application Manager & MySQL Database  
> **APPLICATION STACK:** Express.js TypeScript API (Backend), Next.js App Router (Web), Flutter (Android & iOS Mobile)

---

## 1. Prerequisites Checklist
- Hostinger hosting account with **Node.js support** (Cloud or Business Web Hosting).
- Registered domain name (e.g., `classifiedads.pk`).
- Subdomain configured for backend API: `api.classifiedads.pk`.
- Cloudinary account for production media uploads.
- Google Cloud Console OAuth 2.0 Web & Android Client IDs.

---

## 2. MySQL Database Provisioning on Hostinger

1. Log in to Hostinger **hPanel**.
2. Navigate to **Databases** → **Management**.
3. Create a new MySQL database:
   - **Database Name:** `u123456789_classified`
   - **Username:** `u123456789_dbuser`
   - **Password:** Generate a strong 24+ character password.
4. Note your database credentials. Hostinger MySQL host is typically `127.0.0.1` (or `localhost`) when running the Node.js app on the same server, or the external IP if connecting remotely.
5. In **phpMyAdmin**, verify the default charset is `utf8mb4` with collation `utf8mb4_unicode_ci`.

---

## 3. Backend API Deployment (Node.js Application Manager)

### Step 3.1: Build Backend Artifacts Locally
In PowerShell:
```powershell
cd server
npm install
npx prisma generate
npm run build
```
This produces the compiled production JavaScript files in `server/dist/`.

### Step 3.2: Configure Environment Variables in Hostinger
In Hostinger hPanel → **Node.js**:
- **Node.js version:** Select `20.x` or `22.x`
- **Application root:** `/domains/api.classifiedads.pk/public_html`
- **Application startup file:** `dist/index.js`

Upload your files or push via Git to `/domains/api.classifiedads.pk/public_html`:
- `dist/`
- `prisma/`
- `package.json`
- `package-lock.json`
- `.env`

Create `.env` inside `/domains/api.classifiedads.pk/public_html/`:
```env
PORT=5000
NODE_ENV=production
DATABASE_URL="mysql://u123456789_dbuser:YOUR_STRONG_PASSWORD@127.0.0.1:3306/u123456789_classified"

# JWT Secrets (generate 64-char random tokens)
JWT_ACCESS_SECRET="GENERATE_STRONG_RANDOM_ACCESS_SECRET_HERE"
JWT_REFRESH_SECRET="GENERATE_STRONG_RANDOM_REFRESH_SECRET_HERE"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Storage Driver (Cloudinary for production CDN)
STORAGE_DRIVER="cloudinary"
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# Google OAuth Client
GOOGLE_CLIENT_ID="your_google_client_id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your_google_client_secret"

# Client CORS Origins
CLIENT_URL="https://classifiedads.pk"
```

### Step 3.3: Run Database Migrations & Pre-Seed
Via SSH in Hostinger Terminal:
```bash
cd /domains/api.classifiedads.pk/public_html
npm install --omit=dev
npx prisma db push
npx ts-node prisma/seed.ts
```
This seeds the 13 Pakistani major cities, system settings (including `auto_approve_ads`), category hierarchies, and default administrator (`admin@classifiedads.pk`).

### Step 3.4: Restart Node.js Application
In hPanel Node.js dashboard, click **Restart**.
Verify health by visiting: `https://api.classifiedads.pk/health`

---

## 4. Web Frontend Deployment (Next.js)

### Option A: Hostinger Node.js Deployment
1. Point domain `classifiedads.pk` to web root.
2. Build Next.js application:
   ```powershell
   cd web
   npm install
   npm run build
   ```
3. Upload `.next/standalone`, `.next/static`, `public/`, and `.env.production` to Hostinger.
4. Set startup script: `server.js` or `npm run start`.

### Option B: Vercel Deployment (Recommended for Next.js)
1. Import repository into Vercel.
2. Set Root Directory to `web`.
3. Add Environment Variables:
   - `NEXT_PUBLIC_API_URL`: `https://api.classifiedads.pk/api/v1`
   - `NEXT_PUBLIC_SOCKET_URL`: `https://api.classifiedads.pk`
   - `NEXT_PUBLIC_APP_URL`: `https://classifiedads.pk`
   - `NEXT_PUBLIC_GOOGLE_CLIENT_ID`: `your_google_client_id`
4. Deploy. Add custom domain `classifiedads.pk` in Vercel DNS settings.

---

## 5. Mobile App Production Release (Flutter)

### Android Release APK & App Bundle
Run the production build specifying production endpoints via `--dart-define`:
```powershell
cd mobile
flutter build apk --release `
  --dart-define=API_BASE_URL=https://api.classifiedads.pk/api/v1 `
  --dart-define=SOCKET_URL=https://api.classifiedads.pk
```
The output APK is generated at:
`mobile/build/app/outputs/flutter-apk/app-release.apk`

For Google Play Store submission:
```powershell
flutter build appbundle --release `
  --dart-define=API_BASE_URL=https://api.classifiedads.pk/api/v1 `
  --dart-define=SOCKET_URL=https://api.classifiedads.pk
```

### iOS Release Build
```bash
flutter build ipa --release \
  --dart-define=API_BASE_URL=https://api.classifiedads.pk/api/v1 \
  --dart-define=SOCKET_URL=https://api.classifiedads.pk
```

---

## 6. Pre-Launch Verification Gate Checklist

| Component | Check | Expected Result | Verified |
|---|---|---|---|
| **Database** | MySQL utf8mb4 collation & indexes | Foreign keys enforce cascading rules | [x] |
| **API Health** | `GET /health` | Returns 200 OK `{ status: "ok" }` | [x] |
| **SSL / HTTPS** | SSL certificates on root & API | Padlock icon; zero mixed-content warnings | [x] |
| **CORS Policy** | Whitelist `classifiedads.pk` | Prevents unauthorized cross-origin fetches | [x] |
| **Geospatial** | MySQL Haversine formula queries | Accurate km distance calculation | [x] |
| **Media Pipeline** | Cloudinary integration | Images resized & served via global CDN | [x] |
| **Real-Time Chat** | WebSockets over WSS | 1-to-1 live messaging under 500ms | [x] |
| **WhatsApp Link** | wa.me with international 923xx format | Launches directly to seller chat | [x] |
| **Admin Protection** | `/admin/*` routes & middleware | 403 Forbidden for non-ADMIN users | [x] |

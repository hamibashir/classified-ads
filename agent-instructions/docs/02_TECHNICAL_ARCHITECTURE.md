# 02: Technical Architecture & System Design

> **DOCUMENT STATUS: [STATUS: ACTIVE PROJECT - Classified Ads PK]**  
> *This document is the Single Source of Truth for system architecture, directory structures, API contracts, and infrastructure.*

---

## 1. Confirmed Technology Stack

| Layer | Selected Technology | Version / Configuration | Rationale |
|---|---|---|---|
| **Backend API** | **Node.js + Express.js** | TypeScript, Strict Mode | High throughput, mature ecosystem, seamless WebSocket support. |
| **Real-Time Layer** | **Socket.IO** | Integrated with Express server | Instant in-app messaging, online status, read receipts. |
| **Web Frontend** | **Next.js (App Router)** | TypeScript, React 19 / 18 | Excellent SEO for ads, server-side rendering, fast page loads. |
| **Web UI / Styling** | **Tailwind CSS + shadcn/ui** | Clean, accessible primitives | Modern, lightweight, non-bloated, fully responsive components. |
| **Mobile App** | **Flutter** | Dart, latest stable | Single codebase for Android & iOS; high performance 60fps UI. |
| **Database** | **MySQL** | Version 8.0+ | Robust relational integrity, foreign keys, and spatial index support. |
| **ORM / Migrations** | **Prisma ORM** | Latest stable | Type-safe queries, declarative migrations, schema introspection. |
| **Authentication** | **JWT (Access + Refresh) + Google OAuth** | Dual token strategy | Universal compatibility across Next.js Web and Flutter Mobile. |
| **Input Validation** | **Zod** | Boundary validation | Strict schema validation on all incoming API requests. |
| **Media Pipeline** | **Storage Adapter (Local / Cloudinary)** | Pluggable driver | Zero-config local filesystem in dev; Cloudinary CDN in production. |
| **Package Manager** | **npm** | Windows PowerShell compatible | Consistent tooling across services. |

---

## 2. System Architecture & Data Flow

```
   ┌──────────────────────────┐         ┌──────────────────────────┐
   │ Next.js Web Client       │         │ Flutter Mobile Client    │
   │ (Public + User + /admin) │         │ (Android & iOS)          │
   └─────────────┬────────────┘         └────────────┬─────────────┘
                 │ (HTTP / JSON)                     │ (HTTP / JSON)
                 │                                   │
                 ▼                                   ▼
   ┌───────────────────────────────────────────────────────────────┐
   │ Express.js API Gateway (port 5000)                            │
   │ ├── CORS & Helmet Security Headers                            │
   │ ├── Rate Limiting (express-rate-limit)                        │
   │ ├── Body Parser & Multer Media Upload Middleware              │
   │ ├── JWT & Role-Based Authorization Guard                      │
   │ └── Zod Perimeter Validation                                  │
   └──────────────────────────────┬────────────────────────────────┘
                                  │
         ┌────────────────────────┼────────────────────────┐
         │                        │                        │
         ▼                        ▼                        ▼
   [Controllers]           [Socket.IO Server]       [Storage Adapter]
   - Auth & Users          - Live 1-to-1 Chat       - Local: `server/uploads/`
   - Ads & Geolocation     - Typing Indicators      - Cloud: Cloudinary SDK
   - Categories            - Read Receipts
   - Admin & Moderation
         │
         ▼
   [Prisma ORM Client]
         │
         ▼
   [MySQL Database (Hostinger / Local)]
   - Relational Tables, Foreign Keys, Spatial Indices
```

---

## 3. Workspace Directory Layout

The workspace is organized into clean, independent service directories:

```
Classified-ads/
├── agent-instructions/           # Master framework & frozen specs (docs/ 00-07)
│   ├── GEMINI.md
│   └── docs/
│
├── server/                       # Node.js + Express Backend
│   ├── prisma/
│   │   ├── schema.prisma         # MySQL Prisma models & relations
│   │   └── seed.ts               # Pre-seed categories, cities, default admin
│   ├── src/
│   │   ├── config/               # Env variables, database connection, storage config
│   │   ├── controllers/          # auth, ads, categories, chat, admin controllers
│   │   ├── middleware/           # auth.ts, roleCheck.ts, validate.ts, upload.ts
│   │   ├── routes/               # Express modular route definitions
│   │   ├── services/             # adService (Haversine queries), storageService, chatService
│   │   ├── sockets/              # Socket.IO connection & event handlers
│   │   ├── types/                # Express & domain type declarations
│   │   ├── utils/                # JWT helpers, ApiResponse envelope, slugify
│   │   └── index.ts              # Express application bootstrap & port listener
│   ├── uploads/                  # Local media directory for development
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── web/                          # Next.js Web Frontend & Admin Portal
│   ├── src/
│   │   ├── app/
│   │   │   ├── (public)/         # / (Home), /search, /ads/[slug], /categories
│   │   │   ├── (auth)/           # /login, /register, /forgot-password
│   │   │   ├── (dashboard)/      # /my-ads, /post-ad, /chat, /favorites, /profile
│   │   │   └── (admin)/          # /admin, /admin/moderation, /admin/categories, /admin/users
│   │   ├── components/
│   │   │   ├── ui/               # shadcn/ui components (Button, Dialog, Select, Switch, Table)
│   │   │   ├── ads/              # AdCard, AdGrid, AdFilters, NearbyFeed, ImageGallery
│   │   │   ├── common/           # Navbar, Footer, LocationSelectorModal, CityPicker
│   │   │   └── chat/             # ChatWindow, MessageBubble, ChatList
│   │   ├── hooks/                # useGeolocation, useAuth, useSocket
│   │   ├── lib/                  # api-client.ts, auth.ts, utils.ts
│   │   └── types/                # Shared frontend TypeScript interfaces
│   ├── package.json
│   ├── tailwind.config.ts
│   └── tsconfig.json
│
└── mobile/                       # Flutter Cross-Platform Client
    ├── lib/
    │   ├── core/                 # api_client.dart, storage.dart, theme.dart, constants.dart
    │   ├── features/
    │   │   ├── auth/             # Login & Registration screens
    │   │   ├── ads/              # Home feed (Nearby), Ad details, Post ad screen
    │   │   ├── chat/             # Chat list & real-time messaging screen
    │   │   └── profile/          # User profile, My ads, Favorites
    │   └── main.dart
    └── pubspec.yaml
```

---

## 4. API Design & Conventions

- **Base URL:** `/api/v1`
- **Payload Format:** Strict JSON (except multipart/form-data for image uploads).
- **Standard API Envelope:**
  ```typescript
  // Success Response
  {
    "success": true,
    "data": { ... },
    "message": "Resource retrieved successfully"
  }

  // Error Response
  {
    "success": false,
    "error": {
      "code": "BAD_REQUEST",
      "message": "Validation failed",
      "details": [ ... ]
    }
  }
  ```

### Core API Endpoints Specification:
1. **Authentication:**
   - `POST /api/v1/auth/register` (Email, password, name, phone)
   - `POST /api/v1/auth/login` (Email, password -> Access + Refresh tokens)
   - `POST /api/v1/auth/google` (Google ID token exchange)
   - `POST /api/v1/auth/refresh` (Refresh access token)
   - `GET  /api/v1/auth/me` (Current authenticated user profile)
2. **Categories & Cities:**
   - `GET /api/v1/categories` (Hierarchical list with subcategories & icons)
   - `GET /api/v1/locations/cities` (Supported Pakistani cities list)
3. **Ads & Discovery:**
   - `GET  /api/v1/ads` (Filters: `search`, `category`, `city`, `minPrice`, `maxPrice`, `condition`, `lat`, `lng`, `radius`, `page`, `limit`)
   - `GET  /api/v1/ads/:slug` (Full ad details, seller preview, images)
   - `POST /api/v1/ads` (Authenticated: create ad; applies `auto_approve_ads` toggle)
   - `PUT  /api/v1/ads/:id` (Authenticated: update ad)
   - `PATCH /api/v1/ads/:id/status` (Mark as SOLD / ACTIVE)
   - `DELETE /api/v1/ads/:id` (Delete own ad)
   - `POST /api/v1/ads/:id/report` (Report ad with reason)
4. **Chat & Messages:**
   - `GET  /api/v1/chat/conversations` (User's active conversations)
   - `GET  /api/v1/chat/conversations/:id/messages` (Message history)
   - `POST /api/v1/chat/conversations` (Start conversation for an ad)
5. **Admin Panel (`/api/v1/admin/*` — Requires `role === 'ADMIN'`):**
   - `GET   /api/v1/admin/dashboard` (Counts: active ads, pending, users, reports)
   - `GET   /api/v1/admin/settings` (Fetch system settings)
   - `PUT   /api/v1/admin/settings` (Update toggle e.g. `auto_approve_ads`)
   - `GET   /api/v1/admin/ads/pending` (List ads awaiting approval)
   - `PATCH /api/v1/admin/ads/:id/moderate` (Approve or Reject with reason)
   - `GET   /api/v1/admin/reports` (List reported ads)
   - `PATCH /api/v1/admin/reports/:id` (Resolve or Dismiss report)
   - `POST  /api/v1/admin/categories` (Add / edit category)
   - `PATCH /api/v1/admin/users/:id/ban` (Ban / Unban user)

---

## 5. Geolocation & Spatial Distance Implementation

To power the **"Nearby Ads"** feature, the backend executes the Haversine formula directly in MySQL via raw Prisma queries:

```sql
SELECT id, title, price, locationCity, latitude, longitude,
  ( 6371 * acos( cos( radians(?lat) ) * cos( radians( latitude ) ) 
  * cos( radians( longitude ) - radians(?lng) ) + sin( radians(?lat) ) 
  * sin( radians( latitude ) ) ) ) AS distance
FROM `Ad`
WHERE status = 'ACTIVE'
HAVING distance <= ?radius
ORDER BY distance ASC
LIMIT ?limit OFFSET ?offset;
```

---

## 6. Environment Variables Configuration

### `server/.env.example`
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="mysql://root:password@localhost:3306/classified_ads_pk"

# JWT Secrets
JWT_ACCESS_SECRET="super-secret-access-key-change-in-production"
JWT_REFRESH_SECRET="super-secret-refresh-key-change-in-production"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Storage Configuration
STORAGE_DRIVER="local" # "local" or "cloudinary"
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

# Google OAuth
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Client Origins for CORS
CLIENT_URL="http://localhost:3000"
```

### `web/.env.example`
```env
NEXT_PUBLIC_API_URL="http://localhost:5000/api/v1"
NEXT_PUBLIC_SOCKET_URL="http://localhost:5000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_GOOGLE_CLIENT_ID=""
```

---

## 7. Deployment & Hosting Strategy
- **Database:** Hostinger MySQL Database or local MySQL in development.
- **Backend API (Express):** Deployed via Hostinger Node.js Application Manager (or Railway/Render for seamless WebSockets).
- **Web Frontend (Next.js):** Deployed on Vercel or Hostinger Node.js environment.
- **Mobile Client (Flutter):** Built as Android APK / iOS bundle pointing to the production API URL.


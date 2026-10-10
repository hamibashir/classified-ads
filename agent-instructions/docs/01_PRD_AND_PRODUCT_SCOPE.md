# 01: Product Requirements Document (PRD) & Product Scope

> **DOCUMENT STATUS: [STATUS: ACTIVE PROJECT - Classified Ads PK]**  
> *This document is the Single Source of Truth for product scope, features, and user journeys. Any changes to requirements must be updated here first.*

---

## 1. Executive Summary & Vision
- **Product Name:** Classified Ads PK
- **One-Sentence Pitch:** A fast, location-intelligent Pakistani classifieds marketplace connecting buyers and sellers for vehicles, electronics, property, and goods with instant nearby discovery, real-time in-app chat, and direct WhatsApp/call options.
- **Core Problem Statement:** Existing classified marketplaces in Pakistan are cluttered, slow, laden with spam, and lack fast GPS-based proximity discovery and seamless web/mobile synchronization.
- **Target Audience:** Pakistani individuals, local shopkeepers, and consumers across major cities (Karachi, Lahore, Islamabad, Rawalpindi, Faisalabad, Multan, Peshawar, Quetta, and nationwide).
- **Target Market & Currency:** Pakistan exclusively; Currency: **PKR (Rs)**.

### Success Metrics (KPIs)
- **Geo-Activation:** User arrives on web or mobile, grants location (or picks city), and sees nearby ads in under 1.5 seconds.
- **Ad Posting Velocity:** Seller completes ad posting with multiple photos and location in under 2 minutes.
- **Communication:** Real-time in-app message delivery under 500ms; one-tap WhatsApp / Call connection.
- **Moderation Efficiency:** Zero spam leaks with automated and configurable moderation controls.

---

## 2. User Personas & Core Journeys

### Persona 1: The Buyer (e.g. Ali from Lahore)
- **Goal:** Find reliable used electronics or vehicles close to his neighborhood.
- **Key Flow:** Opens app → Grants location → Instantly sees "Listings Near You" (e.g., 2.5 km away) → Filters by price in PKR and condition → Chats directly in-app or taps "Chat on WhatsApp".

### Persona 2: The Seller (e.g. Usman from Karachi)
- **Goal:** Quickly list a product for sale, receive genuine buyer inquiries, and mark it sold.
- **Key Flow:** Logs in via Email or Google → Taps "Post Ad" → Selects category, uploads images, sets PKR price, picks GPS location → Sets contact preference (Phone visible + WhatsApp enabled) → Manages ad in "My Ads" dashboard.

### Persona 3: The System Administrator
- **Goal:** Maintain marketplace quality, prevent scam ads, manage categories, and handle reports.
- **Key Flow:** Accesses `/admin` → Configures system moderation toggle (`auto_approve_ads`) → Reviews pending ads if review mode is ON → Reviews user-reported flags → Moderates users and manages category tree.

---

## 3. Feature Scope & Prioritization

### P0 (Must-Have for MVP Launch)

- **Feature P0-1: Geolocation Detection & Nearby Listings Feed**
  - **Description:** On initial visit (Web & Mobile), prompt for location permission. If granted, calculate distance (Haversine formula) and display "Ads Near You" sorted by proximity with distance indicators (e.g., "3.2 km away").
  - **Graceful Fallback:** If denied, prompt with a City Selector modal (Karachi, Lahore, Islamabad, Rawalpindi, Peshawar, Multan, Quetta, Faisalabad) and display city-filtered ads.

- **Feature P0-2: Ad Posting Flow & Media Pipeline**
  - **Description:** Multi-step or streamlined form: Title, Category & Subcategory, Condition (New, Like New, Used), PKR Price (with Negotiable toggle), Description, Location (GPS pick or manual city/area), and Contact preferences.
  - **Image Upload:** Upload up to 8 images per ad. Backend supports local storage (`server/uploads/`) in development and Cloudinary in production via environment configuration.

- **Feature P0-3: Ad Discovery, Search & Dynamic Filtering**
  - **Description:** Full-text keyword search, category hierarchy navigation, price range (Min/Max PKR), location filter (City & Radius), and condition filter.

- **Feature P0-4: Dual Channel Communication (In-App Chat & Direct Contact)**
  - **In-App Real-Time Chat:** 1-to-1 live messaging using Socket.IO linked to the specific ad listing, with conversation history and read receipts.
  - **Direct Contact:** Seller can enable public phone visibility and a dedicated "Chat on WhatsApp" button triggering WhatsApp deep-link.

- **Feature P0-5: User Authentication & Role Management**
  - **Description:** Email & Password authentication with secure JWT (access + refresh tokens), plus "Sign in with Google" OAuth 2.0.
  - **Roles:** `USER` (default buyer/seller) and `ADMIN` (system administrator).
  - **User Dashboard:** "My Ads" (Active, Pending, Sold, Expired), "Saved / Favorites", and Profile Settings.

- **Feature P0-6: Full-Featured Admin Panel (`/admin`)**
  - **Auto-Approve Toggle:** Global system setting `auto_approve_ads` (ON = Instant Live, OFF = Goes to Pending queue).
  - **Ad Moderation Queue:** List pending ads with Approve / Reject actions (with predefined reason).
  - **Reports Management:** Review user-flagged ads with actions: Dismiss, Remove Ad, Warn Seller, Ban User.
  - **Category Management:** Full CRUD on categories, subcategories, display order, and icons.
  - **User Management:** Search users, toggle verification badge, ban/unban abusive accounts.

---

### P1 (Post-MVP Enhancements)
- **Phone OTP Verification:** SMS verification via Pakistani SMS gateway.
- **Featured Ad Monetization:** Paid bumping / featured banners integrated with JazzCash / Easypaisa.
- **Bilingual Interface:** English & Urdu language toggle.
- **Push Notifications:** Web Push and Firebase Cloud Messaging (FCM) on mobile for chat alerts.

---

### Non-Goals (Strictly Out of Scope for MVP)
- ❌ **No International Operations:** Multi-currency and outside regions are strictly excluded; Pakistan & PKR only.
- ❌ **No In-App Payment Escrow / Cart:** Peer-to-peer classified model; no physical shipping integration or financial escrow holding.
- ❌ **No Multi-Tenant Enterprise Accounts:** Single marketplace architecture.

---

## 4. Business Logic & Access Rules

### Ad Status Lifecycle
```
[User Submits Ad]
       │
       ▼
[auto_approve_ads == true ?]
   ├── YES ──► Status: ACTIVE (Immediately visible in search & feeds)
   └── NO  ──► Status: PENDING (Visible only to seller & in Admin Approval Queue)
                     │
         ┌───────────┴───────────┐
         ▼                       ▼
    [Admin Approves]        [Admin Rejects]
    Status: ACTIVE          Status: REJECTED (Reason saved)

[Active Ad Actions]
   ├── Seller marks as SOLD ──► Status: SOLD (Visible with "Sold" badge, no new inquiries)
   ├── Seller deletes ────────► Status: DELETED
   └── Reaches lifespan ──────► Status: EXPIRED (Default 30 days)
```

### Permission Matrix
| Resource | Guest | Authenticated User | Admin |
|---|---|---|---|
| Browse & Search Ads | ✅ Yes | ✅ Yes | ✅ Yes |
| View Ad Details & Contact | ✅ Yes | ✅ Yes | ✅ Yes |
| Post New Ad | ❌ Prompt Login | ✅ Yes | ✅ Yes |
| Edit / Delete Ad | ❌ No | ✅ Own Ads only | ✅ All Ads |
| Mark Ad as Sold | ❌ No | ✅ Own Ads only | ✅ All Ads |
| Initiate In-App Chat | ❌ Prompt Login | ✅ Yes | ✅ Yes |
| Report Ad | ❌ Prompt Login | ✅ Yes | ✅ Yes |
| Access `/admin` & Settings | ❌ Forbidden (403) | ❌ Forbidden (403) | ✅ Full Access |

---

## 5. Non-Functional Requirements
- **Performance:** P95 API response time < 250ms; responsive image delivery with thumbnailing.
- **Responsive Web UI:** Fluid layout supporting 375px (mobile web), 768px (tablet), 1024px (laptop), and 1440px (desktop).
- **Mobile Experience:** Smooth Flutter app with 60 FPS transitions and native location dialog integration.
- **Security:** Bcrypt password hashing (min salt rounds 10), HTTP-only JWT cookies or bearer token headers, rate limiting on auth & posting endpoints.
- **Data Integrity:** Cascading rules and relational integrity managed via Prisma + MySQL.

---

## 6. Scope Control Rule
If any additional requirement is proposed during development:
1. Verify if it belongs to P0 above.
2. If it is P1 or unlisted, do not write code for it until P0 is fully verified and explicit approval is provided.
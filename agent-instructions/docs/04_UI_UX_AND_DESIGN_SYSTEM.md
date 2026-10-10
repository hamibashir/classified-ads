# 04: UI/UX & Design System Guidelines

> **DOCUMENT STATUS: [STATUS: ACTIVE PROJECT - Classified Ads PK]**  
> *This document is the Single Source of Truth for visual styling, theme tokens, typography, component rules, and classifieds-specific UX patterns.*

---

## 1. Design Philosophy: Trustworthy, Clean & Fast

- **Marketplace Trust First:** Classified platforms require high credibility. Clear pricing in PKR, verified badges, clean image galleries, and explicit seller locations are paramount.
- **Location-First Cognitive Flow:** Users immediately see listings relative to their current city or GPS proximity.
- **Strict Anti-AI Design Tropes:**
  - ❌ **No Neon Accents or Glowing Borders:** Avoid arbitrary neon green or violet glow effects.
  - ❌ **No Monospace Overload:** Use human typography (Inter / Outfit) for all UI content; reserve monospace strictly for tracking codes or IDs.
  - ❌ **No Emoji Headings:** Ban 🚀, ⚡, 💥 in page titles, filters, and navbars.
  - ❌ **No Cluttered Card Hierarchies:** Avoid nesting cards within cards with heavy multi-layer drop shadows.

---

## 2. Design Tokens & Color Palette

Tailored for a modern, trustworthy Pakistani marketplace:

| Token | Semantic Role | Value (Light Mode) | Value (Dark Mode) |
|---|---|---|---|
| `background` | Primary page canvas | `#F8FAFC` (Slate 50) | `#0B0F17` (Deep Slate) |
| `surface` / `card` | Card & container surface | `#FFFFFF` | `#131B2A` |
| `foreground` | High-contrast body text | `#0F172A` (Slate 900) | `#F1F5F9` (Slate 100) |
| `primary` | Brand & primary actions | `#0F766E` (Teal 700) | `#14B8A6` (Teal 500) |
| `primary-foreground`| Text on primary button | `#FFFFFF` | `#042F2E` |
| `muted` | Secondary surfaces & pills | `#F1F5F9` (Slate 100) | `#1E293B` (Slate 800) |
| `muted-foreground` | Helper text & captions | `#64748B` (Slate 500) | `#94A3B8` (Slate 400) |
| `border` | Dividers & card outlines | `#E2E8F0` (Slate 200) | `#1E293B` (Slate 800) |
| `price-tag` | PKR Price emphasis | `#047857` (Emerald 700)| `#10B981` (Emerald 500)|
| `whatsapp-btn` | Direct WhatsApp action | `#25D366` (Brand Green) | `#25D366` |
| `destructive` | Errors & reject actions | `#DC2626` (Red 600) | `#EF4444` (Red 500) |

---

## 3. Typography Hierarchy

Primary font family: **Inter** (fallback `system-ui, -apple-system, sans-serif`).

| Style | Desktop Size | Mobile Size | Weight | Line Height | Application |
|---|---|---|---|---|---|
| **H1** | 28px - 32px | 22px - 24px | Semi-Bold (600) | 1.25 | Hero heading, ad title on details page |
| **H2** | 22px - 24px | 18px - 20px | Semi-Bold (600) | 1.3 | Category sections, Nearby Ads header |
| **H3 / Ad Title** | 16px - 18px | 15px - 16px | Medium (500) | 1.4 | Ad title inside cards, filter headers |
| **Price Text** | 18px - 20px | 16px - 18px | Bold (700) | 1.2 | `Rs 45,000` / `PKR 125,000` display |
| **Body** | 14px - 15px | 14px | Regular (400) | 1.5 | Ad descriptions, chat message bubbles |
| **Caption / Meta** | 12px - 13px | 11px - 12px | Regular (400) | 1.4 | Timestamps, distance ("2.4 km away"), city |

---

## 4. Classified-Specific UI Patterns

### 4.1 Navbar Location Selector Chip
- Situated prominently in the top header: `[ 📍 Lahore, PK ▾ ]`.
- Clicking opens the **Location Modal**:
  - Option A: "Use my current GPS location" (one-click detection).
  - Option B: Quick-select top Pakistani cities (Karachi, Lahore, Islamabad, Rawalpindi, Peshawar, Multan, Faisalabad, etc.).

### 4.2 Ad Card Structure
- Aspect ratio **4:3** for the primary image with lazy loading and placeholder fallback.
- Price displayed boldly in PKR: **`Rs 45,000`** with a subtle "Negotiable" badge if flagged by seller.
- Two-line truncated title.
- Location and age footer: `📍 Gulberg III, Lahore • 2 hours ago`.
- Proximity tag (when GPS is active): `1.4 km away` in a clean subtle badge.
- Heart icon in the top right to instantly toggle Favorite.

### 4.3 Seller Contact Actions (Ad Details Page)
- **In-App Chat Button:** Primary teal button `💬 Chat with Seller` (opens instant chat modal or conversation page).
- **WhatsApp Button:** Secondary green button `📱 Chat on WhatsApp` (opens `https://wa.me/...` directly).
- **Phone Number Reveal:** Click-to-reveal phone button `📞 Show Phone Number` to prevent phone scraping bots.

### 4.4 Admin Panel Table Patterns (`/admin`)
- Moderation queue with side-by-side preview of ad images, title, user, and price.
- Quick action buttons: **Approve** (green outline) and **Reject** (triggers small modal to select predefined rejection reason).
- Setting toggle switch for `auto_approve_ads` with live status indicator.

---

## 5. Accessibility & Responsive Standards
- **Mobile First:** All layouts must operate smoothly on single-hand touch devices (375px+).
- **Touch Targets:** Minimum 44x44px hit areas on all buttons, filters, and icons.
- **Contrast Ratios:** Text meets WCAG 2.1 AA (at least 4.5:1 against card and page backgrounds).
- **Empty States:** When no ads match a filter or city, show a helpful empty state with "Clear all filters" or "Post the first ad in this area".


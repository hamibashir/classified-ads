# 03: Data Models & Database Schema

> **DOCUMENT STATUS: [STATUS: ACTIVE PROJECT - Classified Ads PK]**  
> *This document is the Single Source of Truth for database entities, relationships, indexes, Prisma schema models, and migration rules.*

---

## 1. Database Architecture & Design Principles

- **Database Engine:** MySQL 8.0+ (InnoDB with utf8mb4 charset).
- **ORM:** Prisma ORM with strict type safety and migrations.
- **Relational Integrity:** Foreign key constraints with explicit `ON DELETE CASCADE` or `RESTRICT`.
- **Indexing Strategy:**
  - Fast slug and search lookups: Unique index on `Ad.slug`, `Category.slug`, `User.email`.
  - Spatial and location queries: Composite indexes on `[locationCity, status]`, `[latitude, longitude]`.
  - Composite uniqueness: `[userId, adId]` on `Favorite` prevents duplicate likes.
- **Audit Fields:** Every primary model includes `createdAt` and `updatedAt`.

---

## 2. Complete Prisma Schema (`server/prisma/schema.prisma`)

```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  USER
  ADMIN
}

enum AdCondition {
  NEW
  LIKE_NEW
  USED_GOOD
  USED_FAIR
}

enum AdStatus {
  PENDING
  ACTIVE
  REJECTED
  SOLD
  EXPIRED
}

enum ReportStatus {
  PENDING
  RESOLVED
  DISMISSED
}

model User {
  id              String         @id @default(uuid())
  email           String         @unique
  passwordHash    String?        // Nullable if registered via Google OAuth
  name            String
  phone           String?
  avatarUrl       String?
  role            Role           @default(USER)
  isPhoneVerified Boolean        @default(false)
  isBanned        Boolean        @default(false)
  googleId        String?        @unique
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  ads             Ad[]
  favorites       Favorite[]
  sentMessages    Message[]
  buyerChats      Conversation[] @relation("BuyerConversations")
  sellerChats     Conversation[] @relation("SellerConversations")
  reportsFiled    Report[]

  @@map("users")
}

model Category {
  id          String     @id @default(uuid())
  name        String
  slug        String     @unique
  icon        String?    // Icon name (e.g., 'car', 'smartphone', 'home')
  order       Int        @default(0)
  parentId    String?
  parent      Category?  @relation("CategoryHierarchy", fields: [parentId], references: [id], onDelete: Cascade)
  children    Category[] @relation("CategoryHierarchy")
  ads         Ad[]
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  @@map("categories")
}

model Ad {
  id              String         @id @default(uuid())
  userId          String
  user            User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  categoryId      String
  category        Category       @relation(fields: [categoryId], references: [id], onDelete: Restrict)
  
  title           String         @db.VarChar(200)
  slug            String         @unique @db.VarChar(255)
  description     String         @db.Text
  price           Decimal        @db.Decimal(12, 2)
  currency        String         @default("PKR")
  isNegotiable    Boolean        @default(false)
  condition       AdCondition    @default(USED_GOOD)
  status          AdStatus       @default(ACTIVE)
  rejectionReason String?        @db.Text
  
  // Geolocation & Contact
  locationCity    String         @db.VarChar(100)
  locationState   String         @default("Punjab") @db.VarChar(100)
  locationAddress String?        @db.VarChar(255)
  latitude        Float?
  longitude       Float?
  showPhone       Boolean        @default(true)
  allowWhatsapp   Boolean        @default(true)
  
  viewsCount      Int            @default(0)
  isFeatured      Boolean        @default(false)
  expiresAt       DateTime?
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  images          AdImage[]
  conversations   Conversation[]
  favorites       Favorite[]
  reports         Report[]

  @@index([userId])
  @@index([categoryId])
  @@index([locationCity, status])
  @@index([status, createdAt])
  @@index([latitude, longitude])
  @@map("ads")
}

model AdImage {
  id        String   @id @default(uuid())
  adId      String
  ad        Ad       @relation(fields: [adId], references: [id], onDelete: Cascade)
  url       String   @db.VarChar(500)
  publicId  String?  @db.VarChar(200) // For Cloudinary management
  order     Int      @default(0)
  createdAt DateTime @default(now())

  @@index([adId])
  @@map("ad_images")
}

model Conversation {
  id        String    @id @default(uuid())
  adId      String
  ad        Ad        @relation(fields: [adId], references: [id], onDelete: Cascade)
  buyerId   String
  buyer     User      @relation("BuyerConversations", fields: [buyerId], references: [id], onDelete: Cascade)
  sellerId  String
  seller    User      @relation("SellerConversations", fields: [sellerId], references: [id], onDelete: Cascade)
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  messages  Message[]

  @@unique([adId, buyerId])
  @@index([buyerId])
  @@index([sellerId])
  @@map("conversations")
}

model Message {
  id             String       @id @default(uuid())
  conversationId String
  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  senderId       String
  sender         User         @relation(fields: [senderId], references: [id], onDelete: Cascade)
  text           String       @db.Text
  attachmentUrl  String?      @db.VarChar(500)
  isRead         Boolean      @default(false)
  createdAt      DateTime     @default(now())

  @@index([conversationId])
  @@map("messages")
}

model Favorite {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  adId      String
  ad        Ad       @relation(fields: [adId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())

  @@unique([userId, adId])
  @@index([userId])
  @@map("favorites")
}

model Report {
  id          String       @id @default(uuid())
  adId        String
  ad          Ad           @relation(fields: [adId], references: [id], onDelete: Cascade)
  reporterId  String
  reporter    User         @relation(fields: [reporterId], references: [id], onDelete: Cascade)
  reason      String       @db.VarChar(100) // e.g., 'SPAM', 'FRAUD', 'INAPPROPRIATE', 'DUPLICATE'
  details     String?      @db.Text
  status      ReportStatus @default(PENDING)
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  @@index([adId])
  @@index([status])
  @@map("reports")
}

model SystemSetting {
  id          String   @id @default(uuid())
  key         String   @unique @db.VarChar(100)
  value       String   @db.Text // JSON or primitive string, e.g. "true"
  description String?  @db.VarChar(255)
  updatedAt   DateTime @updatedAt

  @@map("system_settings")
}
```

---

## 3. Database Seed Data Strategy (`server/prisma/seed.ts`)

1. **System Settings Seed:**
   - Key: `auto_approve_ads`, Value: `"true"`, Description: `Toggles whether new ads go live immediately or require admin review.`
   - Key: `max_images_per_ad`, Value: `"8"`, Description: `Maximum allowed images per ad post.`
   - Key: `ad_expiry_days`, Value: `"30"`, Description: `Days before an active ad expires.`

2. **Default Categories Seed:**
   - **Motors & Vehicles** (Cars, Motorcycles, Spare Parts, Commercial Vehicles)
   - **Mobiles & Tablets** (Smartphones, Tablets, Smart Watches, Accessories)
   - **Electronics & Home Appliances** (Computers & Laptops, TVs, ACs, Generators)
   - **Property** (Houses for Sale, Apartments & Flats, Plots & Land, Commercial Property)
   - **Jobs** (IT & Software, Sales & Marketing, Customer Service)
   - **Fashion & Beauty** (Men, Women, Watches, Jewelry)
   - **Services** (Home Repair, Web Development, Packers & Movers)

3. **Pre-Seeded Pakistani Cities:**
   - Karachi, Lahore, Islamabad, Rawalpindi, Faisalabad, Multan, Peshawar, Quetta, Gujranwala, Sialkot, Hyderabad, Abbottabad, Bahawalpur.

4. **Default Admin User:**
   - Email: `admin@classifiedads.pk` (password securely hashed with bcrypt in seed).


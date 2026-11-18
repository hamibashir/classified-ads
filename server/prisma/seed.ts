import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { PAKISTANI_CITIES } from '../src/constants/cities';

dotenv.config();

const prisma = new PrismaClient();

interface CategorySeed {
  name: string;
  slug: string;
  icon: string;
  order: number;
  subcategories: {
    name: string;
    slug: string;
    icon: string;
    order: number;
  }[];
}

const CATEGORIES_DATA: CategorySeed[] = [
  {
    name: 'Motors & Vehicles',
    slug: 'motors-vehicles',
    icon: 'car',
    order: 1,
    subcategories: [
      { name: 'Cars', slug: 'cars', icon: 'car', order: 1 },
      { name: 'Motorcycles & Scooters', slug: 'motorcycles', icon: 'bike', order: 2 },
      { name: 'Spare Parts & Accessories', slug: 'spare-parts', icon: 'tool', order: 3 },
      { name: 'Commercial Vehicles', slug: 'commercial-vehicles', icon: 'truck', order: 4 },
    ],
  },
  {
    name: 'Mobiles & Tablets',
    slug: 'mobiles-tablets',
    icon: 'smartphone',
    order: 2,
    subcategories: [
      { name: 'Smartphones', slug: 'smartphones', icon: 'smartphone', order: 1 },
      { name: 'Tablets', slug: 'tablets', icon: 'tablet', order: 2 },
      { name: 'Smart Watches', slug: 'smart-watches', icon: 'watch', order: 3 },
      { name: 'Mobile Accessories', slug: 'mobile-accessories', icon: 'headphones', order: 4 },
    ],
  },
  {
    name: 'Electronics & Home Appliances',
    slug: 'electronics-appliances',
    icon: 'tv',
    order: 3,
    subcategories: [
      { name: 'Computers & Laptops', slug: 'computers-laptops', icon: 'laptop', order: 1 },
      { name: 'TVs, Video & Audio', slug: 'tvs-audio', icon: 'tv', order: 2 },
      { name: 'ACs & Coolers', slug: 'acs-coolers', icon: 'wind', order: 3 },
      { name: 'Generators & UPS', slug: 'generators-ups', icon: 'zap', order: 4 },
    ],
  },
  {
    name: 'Property',
    slug: 'property',
    icon: 'home',
    order: 4,
    subcategories: [
      { name: 'Houses for Sale', slug: 'houses-for-sale', icon: 'home', order: 1 },
      { name: 'Apartments & Flats', slug: 'apartments-flats', icon: 'building', order: 2 },
      { name: 'Plots & Land', slug: 'plots-land', icon: 'map-pin', order: 3 },
      { name: 'Commercial Property', slug: 'commercial-property', icon: 'briefcase', order: 4 },
    ],
  },
  {
    name: 'Jobs',
    slug: 'jobs',
    icon: 'briefcase',
    order: 5,
    subcategories: [
      { name: 'IT & Software', slug: 'it-software', icon: 'code', order: 1 },
      { name: 'Sales & Marketing', slug: 'sales-marketing', icon: 'trending-up', order: 2 },
      { name: 'Customer Service', slug: 'customer-service', icon: 'headphones', order: 3 },
    ],
  },
  {
    name: 'Fashion & Beauty',
    slug: 'fashion-beauty',
    icon: 'shirt',
    order: 6,
    subcategories: [
      { name: "Men's Fashion", slug: 'mens-fashion', icon: 'shirt', order: 1 },
      { name: "Women's Fashion", slug: 'womens-fashion', icon: 'shopping-bag', order: 2 },
      { name: 'Watches & Accessories', slug: 'watches-accessories', icon: 'watch', order: 3 },
      { name: 'Jewelry', slug: 'jewelry', icon: 'gem', order: 4 },
    ],
  },
  {
    name: 'Services',
    slug: 'services',
    icon: 'wrench',
    order: 7,
    subcategories: [
      { name: 'Home Repair & Maintenance', slug: 'home-repair', icon: 'wrench', order: 1 },
      { name: 'Web Development & IT', slug: 'web-development', icon: 'code', order: 2 },
      { name: 'Packers & Movers', slug: 'packers-movers', icon: 'truck', order: 3 },
    ],
  },
  {
    name: 'Furniture & Home Decor',
    slug: 'furniture',
    icon: 'armchair',
    order: 8,
    subcategories: [
      { name: 'Sofa & Chairs', slug: 'sofa-chairs', icon: 'armchair', order: 1 },
      { name: 'Beds & Wardrobes', slug: 'beds-wardrobes', icon: 'bed', order: 2 },
      { name: 'Tables & Dining Sets', slug: 'tables-dining', icon: 'table', order: 3 },
      { name: 'Home Decor & Rugs', slug: 'home-decor', icon: 'home', order: 4 },
    ],
  },
  {
    name: 'Animals & Pets',
    slug: 'animals',
    icon: 'dog',
    order: 9,
    subcategories: [
      { name: 'Birds & Parrots', slug: 'birds', icon: 'feather', order: 1 },
      { name: 'Cats & Dogs', slug: 'cats-dogs', icon: 'heart', order: 2 },
      { name: 'Livestock & Cattle', slug: 'livestock', icon: 'truck', order: 3 },
      { name: 'Pet Food & Accessories', slug: 'pet-accessories', icon: 'shopping-bag', order: 4 },
    ],
  },
  {
    name: 'Sports & Hobbies',
    slug: 'sports-hobbies',
    icon: 'book-open',
    order: 10,
    subcategories: [
      { name: 'Gym & Fitness', slug: 'gym-fitness', icon: 'activity', order: 1 },
      { name: 'Sports Equipment', slug: 'sports-equipment', icon: 'target', order: 2 },
      { name: 'Musical Instruments', slug: 'musical-instruments', icon: 'music', order: 3 },
      { name: 'Books & Magazines', slug: 'books-magazines', icon: 'book', order: 4 },
    ],
  },
  {
    name: 'Kids & Babies',
    slug: 'kids',
    icon: 'baby',
    order: 11,
    subcategories: [
      { name: 'Prams & Strollers', slug: 'prams-strollers', icon: 'compass', order: 1 },
      { name: 'Toys & Ride-ons', slug: 'toys-games', icon: 'smile', order: 2 },
      { name: 'Kids Clothing', slug: 'kids-clothing', icon: 'shirt', order: 3 },
      { name: 'Baby Gear & Cots', slug: 'baby-gear', icon: 'shield', order: 4 },
    ],
  },
];

async function seedCategories(): Promise<{ parentCount: number; subCount: number }> {
  console.log('[Seed] Seeding categories hierarchy...');
  let parentCount = 0;
  let subCount = 0;

  for (const catData of CATEGORIES_DATA) {
    const parent = await prisma.category.upsert({
      where: { slug: catData.slug },
      update: {
        name: catData.name,
        icon: catData.icon,
        order: catData.order,
      },
      create: {
        name: catData.name,
        slug: catData.slug,
        icon: catData.icon,
        order: catData.order,
      },
    });
    parentCount++;

    for (const sub of catData.subcategories) {
      await prisma.category.upsert({
        where: { slug: sub.slug },
        update: {
          name: sub.name,
          icon: sub.icon,
          order: sub.order,
          parentId: parent.id,
        },
        create: {
          name: sub.name,
          slug: sub.slug,
          icon: sub.icon,
          order: sub.order,
          parentId: parent.id,
        },
      });
      subCount++;
    }
  }

  return { parentCount, subCount };
}

async function seedCities(): Promise<number> {
  console.log('[Seed] Seeding Pakistani cities and coordinates...');

  await prisma.systemSetting.upsert({
    where: { key: 'supported_cities' },
    update: {
      value: JSON.stringify(PAKISTANI_CITIES),
      description: 'List of supported Pakistani cities with GPS coordinates for proximity searches',
    },
    create: {
      key: 'supported_cities',
      value: JSON.stringify(PAKISTANI_CITIES),
      description: 'List of supported Pakistani cities with GPS coordinates for proximity searches',
    },
  });

  return PAKISTANI_CITIES.length;
}

async function seedSystemSettings(): Promise<number> {
  console.log('[Seed] Seeding default platform system settings...');

  const DEFAULT_SETTINGS = [
    {
      key: 'auto_approve_ads',
      value: 'true',
      description: 'Toggles whether new ads go live immediately or require admin review',
    },
    {
      key: 'max_images_per_ad',
      value: '8',
      description: 'Maximum allowed images per ad post',
    },
    {
      key: 'ad_expiry_days',
      value: '30',
      description: 'Days before an active ad expires',
    },
  ];

  for (const setting of DEFAULT_SETTINGS) {
    await prisma.systemSetting.upsert({
      where: { key: setting.key },
      update: {
        value: setting.value,
        description: setting.description,
      },
      create: {
        key: setting.key,
        value: setting.value,
        description: setting.description,
      },
    });
  }

  return DEFAULT_SETTINGS.length;
}

async function seedAdminUser(): Promise<string> {
  console.log('[Seed] Seeding default administrator account...');

  const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@zaazb.com';
  const plainPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@123456!';
  const passwordHash = await bcrypt.hash(plainPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: 'System Administrator',
      role: Role.ADMIN,
      isPhoneVerified: true,
      phone: '+923001234567',
    },
    create: {
      email: adminEmail,
      name: 'System Administrator',
      passwordHash,
      role: Role.ADMIN,
      phone: '+923001234567',
      isPhoneVerified: true,
      isBanned: false,
    },
  });

  return admin.email;
}

async function main(): Promise<void> {
  console.log('--- Starting Zaaz B Database Seed ---');
  const startTime = Date.now();

  const { parentCount, subCount } = await seedCategories();
  console.log(`[Seed] Successfully seeded ${parentCount} parent categories and ${subCount} subcategories.`);

  const cityCount = await seedCities();
  console.log(`[Seed] Successfully seeded ${cityCount} Pakistani cities with coordinates.`);

  const settingsCount = await seedSystemSettings();
  console.log(`[Seed] Successfully seeded ${settingsCount} core system settings.`);

  const adminEmail = await seedAdminUser();
  console.log(`[Seed] Successfully seeded initial administrator account (${adminEmail}).`);

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`--- Seeding completed in ${duration}s ---`);
}

main()
  .catch((error) => {
    console.error('[Seed Error] Failed to seed database:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

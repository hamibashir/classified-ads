import { PrismaClient, AdCondition, AdStatus } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('[Seed Ads] Checking available user and categories...');
  
  const user = await prisma.user.findFirst({
    where: { isBanned: false },
  });

  if (!user) {
    throw new Error('No active user found to associate ads with.');
  }

  const categories = await prisma.category.findMany({
    where: { parentId: { not: null } },
  });

  const getCatId = (slug: string) => {
    const found = categories.find((c) => c.slug === slug);
    return found ? found.id : categories[0].id;
  };

  const sampleAds = [
    {
      title: 'Suzuki Alto VXR 2023 (First Owner, Bumper to Bumper Original)',
      slug: 'suzuki-alto-vxr-2023-lahore-' + Math.random().toString(36).substring(2, 7),
      description: 'Suzuki Alto VXR 2023 model in pristine condition. Single hand driven, family used car. Chilled AC, genuine mileage, all token taxes paid up to date. Biometric available on the spot.',
      price: 2650000,
      currency: 'PKR',
      isNegotiable: true,
      condition: AdCondition.USED_GOOD,
      status: AdStatus.ACTIVE,
      locationCity: 'Lahore',
      locationState: 'Punjab',
      locationAddress: 'Johar Town, Phase 2',
      latitude: 31.4697,
      longitude: 74.2728,
      categoryId: getCatId('cars'),
      imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80',
    },
    {
      title: 'Honda Civic Oriel 1.8 i-VTEC (Sunroof, UG Leather)',
      slug: 'honda-civic-oriel-18-lahore-' + Math.random().toString(36).substring(2, 7),
      description: 'Honda Civic 2021 model in exceptional showroom condition. Sunroof, leather package, alloy rims, brand new Yokohama tyres installed last month.',
      price: 4950000,
      currency: 'PKR',
      isNegotiable: true,
      condition: AdCondition.LIKE_NEW,
      status: AdStatus.ACTIVE,
      locationCity: 'Lahore',
      locationState: 'Punjab',
      locationAddress: 'Gulberg III, Main Boulevard',
      latitude: 31.5126,
      longitude: 74.3484,
      categoryId: getCatId('cars'),
      imageUrl: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&auto=format&fit=crop&q=80',
    },
    {
      title: 'Apple iPhone 15 Pro 128GB Natural Titanium (PTA Approved)',
      slug: 'apple-iphone-15-pro-128gb-lahore-' + Math.random().toString(36).substring(2, 7),
      description: 'Official PTA approved with box and original cable. Battery health 96%. Water pack, not a single scratch, complete glass protector installed since day one.',
      price: 345000,
      currency: 'PKR',
      isNegotiable: false,
      condition: AdCondition.LIKE_NEW,
      status: AdStatus.ACTIVE,
      locationCity: 'Lahore',
      locationState: 'Punjab',
      locationAddress: 'DHA Phase 5, Commercial',
      latitude: 31.4646,
      longitude: 74.3942,
      categoryId: getCatId('smartphones'),
      imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80',
    },
    {
      title: 'Samsung Galaxy S24 Ultra 512GB Titanium Gray (Official PTA)',
      slug: 'samsung-galaxy-s24-ultra-karachi-' + Math.random().toString(36).substring(2, 7),
      description: 'Brand new pin-packed Samsung S24 Ultra with Samsung Pakistan warranty. 512GB storage, AI features, S-Pen included.',
      price: 389000,
      currency: 'PKR',
      isNegotiable: false,
      condition: AdCondition.NEW,
      status: AdStatus.ACTIVE,
      locationCity: 'Karachi',
      locationState: 'Sindh',
      locationAddress: 'DHA Phase 6',
      latitude: 24.7938,
      longitude: 67.0656,
      categoryId: getCatId('smartphones'),
      imageUrl: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&auto=format&fit=crop&q=80',
    },
    {
      title: 'Honda CD 70 Dream 2024 (Zero Meter, Red Color)',
      slug: 'honda-cd-70-dream-2024-lahore-' + Math.random().toString(36).substring(2, 7),
      description: 'Brand new unregistered Honda CD 70 Dream 2024 model. Delivery invoice and warranty book available. Ready for immediate biometric transfer.',
      price: 168000,
      currency: 'PKR',
      isNegotiable: true,
      condition: AdCondition.NEW,
      status: AdStatus.ACTIVE,
      locationCity: 'Lahore',
      locationState: 'Punjab',
      locationAddress: 'Model Town, Link Road',
      latitude: 31.4827,
      longitude: 74.3184,
      categoryId: getCatId('motorcycles'),
      imageUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop&q=80',
    },
    {
      title: 'Dell XPS 15 9530 Core i9 32GB RAM 1TB SSD RTX 4070 OLED',
      slug: 'dell-xps-15-core-i9-islamabad-' + Math.random().toString(36).substring(2, 7),
      description: 'High-end developer / video editor machine. 3.5K OLED touchscreen, Intel Core i9 13th Gen, 32GB DDR5 RAM, 1TB NVMe, Nvidia RTX 4070 8GB GPU. Flawless condition.',
      price: 485000,
      currency: 'PKR',
      isNegotiable: true,
      condition: AdCondition.USED_GOOD,
      status: AdStatus.ACTIVE,
      locationCity: 'Islamabad',
      locationState: 'Islamabad Capital Territory',
      locationAddress: 'Blue Area, Jinnah Avenue',
      latitude: 33.7167,
      longitude: 73.0667,
      categoryId: getCatId('computers-laptops'),
      imageUrl: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop&q=80',
    },
    {
      title: 'Sony PlayStation 5 Disc Edition with 2 DualSense Controllers',
      slug: 'sony-ps5-disc-edition-lahore-' + Math.random().toString(36).substring(2, 7),
      description: 'Japanese model PS5 in mint condition. Comes with 2 controllers, charging dock, HDMI 2.1 cable, and 3 disc games (Spider-Man 2, God of War Ragnarok, FC 24).',
      price: 155000,
      currency: 'PKR',
      isNegotiable: true,
      condition: AdCondition.USED_GOOD,
      status: AdStatus.ACTIVE,
      locationCity: 'Lahore',
      locationState: 'Punjab',
      locationAddress: 'Gulberg III, Hafeez Centre',
      latitude: 31.5126,
      longitude: 74.3484,
      categoryId: getCatId('tvs-audio'),
      imageUrl: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&auto=format&fit=crop&q=80',
    },
    {
      title: 'Brand New 10 Marla Luxury Modern House for Sale',
      slug: '10-marla-luxury-modern-house-islamabad-' + Math.random().toString(36).substring(2, 7),
      description: '10 Marla designer built house with 5 master bedrooms, 6 attached Italian bathrooms, 2 dirty kitchens, solid ash wood doors, and basement home theater.',
      price: 42000000,
      currency: 'PKR',
      isNegotiable: true,
      condition: AdCondition.NEW,
      status: AdStatus.ACTIVE,
      locationCity: 'Islamabad',
      locationState: 'Islamabad Capital Territory',
      locationAddress: 'Sector G-13/2',
      latitude: 33.6492,
      longitude: 72.9696,
      categoryId: getCatId('houses-for-sale'),
      imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80',
    },
    {
      title: 'Canon EOS R6 Mark II Mirrorless Camera with 24-105mm Lens',
      slug: 'canon-eos-r6-mark-ii-lahore-' + Math.random().toString(36).substring(2, 7),
      description: 'Used for only two indoor studio shoots. Shutter count below 3500. Includes extra LP-E6NH battery, 128GB SanDisk Extreme Pro V60 card, and original packing.',
      price: 720000,
      currency: 'PKR',
      isNegotiable: true,
      condition: AdCondition.LIKE_NEW,
      status: AdStatus.ACTIVE,
      locationCity: 'Lahore',
      locationState: 'Punjab',
      locationAddress: 'Gulberg III, Hafeez Centre',
      latitude: 31.5126,
      longitude: 74.3484,
      categoryId: getCatId('tvs-audio'),
      imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80',
    },
    {
      title: 'Toyota Corolla Altis Grande 1.8 2022 (Super White)',
      slug: 'toyota-corolla-altis-grande-karachi-' + Math.random().toString(36).substring(2, 7),
      description: 'Toyota Corolla Grande 2022 in bumper to bumper genuine condition. Maintained only through authorized Toyota 3S dealership. Paddle shifters, sunroof, leather seats.',
      price: 6850000,
      currency: 'PKR',
      isNegotiable: true,
      condition: AdCondition.LIKE_NEW,
      status: AdStatus.ACTIVE,
      locationCity: 'Karachi',
      locationState: 'Sindh',
      locationAddress: 'Clifton, Block 4',
      latitude: 24.8138,
      longitude: 67.0299,
      categoryId: getCatId('cars'),
      imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80',
    },
  ];

  console.log(`[Seed Ads] Inserting ${sampleAds.length} verified listings...`);

  const thirtyDaysLater = new Date();
  thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);

  for (const adData of sampleAds) {
    const { imageUrl, ...adProps } = adData;
    
    await prisma.ad.create({
      data: {
        ...adProps,
        userId: user.id,
        showPhone: true,
        allowWhatsapp: true,
        viewsCount: Math.floor(Math.random() * 50) + 10,
        expiresAt: thirtyDaysLater,
        images: {
          create: [
            {
              url: imageUrl,
              publicId: 'unsplash_' + Math.random().toString(36).substring(2, 7),
              order: 0,
            },
          ],
        },
      },
    });
  }

  const count = await prisma.ad.count();
  console.log(`[Seed Ads] Successfully populated database. Total active ads now: ${count}`);
}

main()
  .catch((e) => {
    console.error('[Seed Ads Error]', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

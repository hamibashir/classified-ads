import {
  Car,
  Calendar,
  Fuel,
  Settings2,
  Gauge,
  FileCheck,
  Smartphone,
  ShieldCheck,
  HardDrive,
  Cpu,
  Tv,
  Sparkles,
  Home,
  Maximize2,
  Bed,
  Bath,
  Armchair,
  Bike,
  Zap,
  Briefcase,
  GraduationCap,
  TrendingUp,
  Wrench,
  Shirt,
  Ruler,
  Layers,
  Dog,
  Syringe,
  LucideIcon,
} from 'lucide-react';

export type CategoryFieldType = 'select' | 'text' | 'number';

export interface CategoryField {
  key: string;
  label: string;
  type: CategoryFieldType;
  options?: string[];
  icon: LucideIcon;
  placeholder?: string;
  isFilterable?: boolean;
}

export const CATEGORY_FIELDS_REGISTRY: Record<string, CategoryField[]> = {
  // 1. Motors & Vehicles
  'motors-vehicles': [
    {
      key: 'make',
      label: 'Make / Brand',
      type: 'select',
      icon: Car,
      isFilterable: true,
      options: [
        'Toyota',
        'Honda',
        'Suzuki',
        'Hyundai',
        'KIA',
        'Nissan',
        'Daihatsu',
        'Changan',
        'MG',
        'Haval',
        'Audi',
        'BMW',
        'Mercedes',
        'Other',
      ],
    },
    {
      key: 'modelYear',
      label: 'Model Year',
      type: 'select',
      icon: Calendar,
      isFilterable: true,
      options: [
        '2025',
        '2024',
        '2023',
        '2022',
        '2021',
        '2020',
        '2019',
        '2018',
        '2017',
        '2016',
        '2015',
        '2010-2014',
        'Before 2010',
      ],
    },
    {
      key: 'fuelType',
      label: 'Fuel Type',
      type: 'select',
      icon: Fuel,
      isFilterable: true,
      options: ['Petrol', 'Hybrid', 'Diesel', 'Electric', 'CNG'],
    },
    {
      key: 'transmission',
      label: 'Transmission',
      type: 'select',
      icon: Settings2,
      isFilterable: true,
      options: ['Automatic', 'Manual'],
    },
    {
      key: 'mileage',
      label: 'Mileage (KM)',
      type: 'text',
      icon: Gauge,
      placeholder: 'e.g. 45,000 km',
      isFilterable: false,
    },
    {
      key: 'registeredIn',
      label: 'Registration City',
      type: 'select',
      icon: FileCheck,
      isFilterable: true,
      options: [
        'Lahore',
        'Karachi',
        'Islamabad',
        'Rawalpindi',
        'Punjab',
        'Sindh',
        'Unregistered',
      ],
    },
  ],

  // 2. Mobiles & Tablets
  'mobiles-tablets': [
    {
      key: 'brand',
      label: 'Brand',
      type: 'select',
      icon: Smartphone,
      isFilterable: true,
      options: [
        'Apple',
        'Samsung',
        'Xiaomi',
        'Vivo',
        'Oppo',
        'Infinix',
        'Tecno',
        'Google Pixel',
        'OnePlus',
        'Realme',
        'Honor',
        'Other',
      ],
    },
    {
      key: 'ptaStatus',
      label: 'PTA Status',
      type: 'select',
      icon: ShieldCheck,
      isFilterable: true,
      options: ['PTA Approved', 'Non-PTA', 'JV / Gevey', 'Sim Working'],
    },
    {
      key: 'storage',
      label: 'Storage Capacity',
      type: 'select',
      icon: HardDrive,
      isFilterable: true,
      options: ['32 GB', '64 GB', '128 GB', '256 GB', '512 GB', '1 TB'],
    },
    {
      key: 'ram',
      label: 'RAM Size',
      type: 'select',
      icon: Cpu,
      isFilterable: true,
      options: ['3 GB', '4 GB', '6 GB', '8 GB', '12 GB', '16 GB+'],
    },
  ],

  // 3. Electronics & Home Appliances
  'electronics-appliances': [
    {
      key: 'deviceType',
      label: 'Device Type',
      type: 'select',
      icon: Tv,
      isFilterable: true,
      options: [
        'Laptops & Computers',
        'TVs & Home Audio',
        'ACs & Inverters',
        'Refrigerators & Freezers',
        'Washing Machines',
        'Cameras & Lenses',
        'Kitchen Appliances',
        'Generators & UPS',
        'Other Electronics',
      ],
    },
    {
      key: 'brand',
      label: 'Brand',
      type: 'select',
      icon: Sparkles,
      isFilterable: true,
      options: [
        'Apple',
        'Dell',
        'HP',
        'Lenovo',
        'Sony',
        'Samsung',
        'LG',
        'Haier',
        'Dawlance',
        'Gree',
        'Canon',
        'Nikon',
        'Other',
      ],
    },
    {
      key: 'warranty',
      label: 'Warranty Status',
      type: 'select',
      icon: ShieldCheck,
      isFilterable: true,
      options: ['Company Warranty Available', 'Shop Warranty', 'No Warranty / Expired'],
    },
  ],

  // 4. Property
  property: [
    {
      key: 'propertyType',
      label: 'Property Type',
      type: 'select',
      icon: Home,
      isFilterable: true,
      options: [
        'Houses',
        'Flats & Apartments',
        'Residential Plots',
        'Commercial Plots',
        'Commercial Shops / Offices',
        'Agricultural Land',
        'Portions & Floors',
        'Rooms & Hostels',
      ],
    },
    {
      key: 'areaSize',
      label: 'Area / Size',
      type: 'select',
      icon: Maximize2,
      isFilterable: true,
      options: [
        '3 Marla',
        '5 Marla',
        '7 Marla',
        '10 Marla',
        '1 Kanal',
        '2 Kanal+',
        'Under 500 Sq Ft',
        '500 - 1000 Sq Ft',
        '1000 - 2000 Sq Ft',
      ],
    },
    {
      key: 'bedrooms',
      label: 'Bedrooms',
      type: 'select',
      icon: Bed,
      isFilterable: true,
      options: ['Studio', '1', '2', '3', '4', '5', '6+'],
    },
    {
      key: 'bathrooms',
      label: 'Bathrooms',
      type: 'select',
      icon: Bath,
      isFilterable: true,
      options: ['1', '2', '3', '4', '5+'],
    },
    {
      key: 'furnishing',
      label: 'Furnishing',
      type: 'select',
      icon: Armchair,
      isFilterable: true,
      options: ['Furnished', 'Semi-Furnished', 'Unfurnished'],
    },
  ],

  // 5. Bikes & Motorcycles
  motorcycles: [
    {
      key: 'make',
      label: 'Make',
      type: 'select',
      icon: Bike,
      isFilterable: true,
      options: [
        'Honda',
        'Yamaha',
        'Suzuki',
        'United',
        'Road Prince',
        'Super Power',
        'Kawasaki',
        'Hi-Speed',
        'Other',
      ],
    },
    {
      key: 'engineCapacity',
      label: 'Engine Capacity',
      type: 'select',
      icon: Gauge,
      isFilterable: true,
      options: ['70 cc', '100 cc', '110 cc', '125 cc', '150 cc', '200 cc+'],
    },
    {
      key: 'modelYear',
      label: 'Model Year',
      type: 'select',
      icon: Calendar,
      isFilterable: true,
      options: ['2025', '2024', '2023', '2022', '2021', '2020', '2018-2019', 'Older'],
    },
    {
      key: 'startType',
      label: 'Starting',
      type: 'select',
      icon: Zap,
      isFilterable: true,
      options: ['Kick Start', 'Self Start', 'Both'],
    },
  ],

  // 6. Jobs
  jobs: [
    {
      key: 'jobType',
      label: 'Job Type',
      type: 'select',
      icon: Briefcase,
      isFilterable: true,
      options: ['Full-Time', 'Part-Time', 'Remote / Work from Home', 'Contract', 'Internship'],
    },
    {
      key: 'careerLevel',
      label: 'Career Level',
      type: 'select',
      icon: TrendingUp,
      isFilterable: true,
      options: ['Entry Level', 'Mid Level', 'Senior', 'Manager / Director'],
    },
    {
      key: 'education',
      label: 'Minimum Education',
      type: 'select',
      icon: GraduationCap,
      isFilterable: true,
      options: ['Matric / O-Level', 'Intermediate / A-Level', 'Bachelor', 'Master', 'Doctorate'],
    },
  ],

  // 7. Services
  services: [
    {
      key: 'serviceType',
      label: 'Service Type',
      type: 'select',
      icon: Wrench,
      isFilterable: true,
      options: [
        'Home Repairs & Electrician',
        'Car Repair & Inspection',
        'Moving & Shifting',
        'Painting & Renovation',
        'Tuitions & Academics',
        'IT, Web & Graphic Design',
        'Tax & Legal Consultancy',
        'Event & Catering',
        'Other',
      ],
    },
  ],

  // 8. Fashion & Beauty
  'fashion-beauty': [
    {
      key: 'gender',
      label: 'Target',
      type: 'select',
      icon: Shirt,
      isFilterable: true,
      options: ['Men', 'Women', 'Unisex', 'Kids & Babies'],
    },
    {
      key: 'productType',
      label: 'Item Type',
      type: 'select',
      icon: Sparkles,
      isFilterable: true,
      options: [
        'Clothing',
        'Footwear & Shoes',
        'Watches',
        'Bags & Wallets',
        'Jewelry & Accessories',
        'Fragrances & Perfumes',
      ],
    },
    {
      key: 'size',
      label: 'Size',
      type: 'select',
      icon: Ruler,
      isFilterable: true,
      options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'],
    },
  ],

  // 9. Furniture & Home Decor
  'furniture-home-decor': [
    {
      key: 'furnitureType',
      label: 'Furniture Type',
      type: 'select',
      icon: Armchair,
      isFilterable: true,
      options: [
        'Sofas & Couches',
        'Beds & Wardrobes',
        'Dining Tables & Chairs',
        'Office Furniture',
        'Coffee & Center Tables',
        'Rugs & Curtains',
        'Home Decor & Lighting',
      ],
    },
    {
      key: 'material',
      label: 'Primary Material',
      type: 'select',
      icon: Layers,
      isFilterable: true,
      options: ['Solid Wood (Sheesham/Teak)', 'Engineered Wood / MDF', 'Metal / Iron', 'Glass', 'Leather / Fabric'],
    },
  ],

  // 10. Animals & Pets
  animals: [
    {
      key: 'petType',
      label: 'Animal Type',
      type: 'select',
      icon: Dog,
      isFilterable: true,
      options: ['Dogs', 'Cats', 'Birds & Parrots', 'Goats & Sheep', 'Cows & Buffaloes', 'Horses', 'Fish & Aquariums'],
    },
    {
      key: 'vaccinated',
      label: 'Vaccinated',
      type: 'select',
      icon: Syringe,
      isFilterable: true,
      options: ['Yes', 'No'],
    },
  ],
};

/**
 * Returns custom fields configured for a category slug with fuzzy slug matching
 */
export function getFieldsForCategory(categorySlug?: string | null): CategoryField[] {
  if (!categorySlug) return [];

  if (CATEGORY_FIELDS_REGISTRY[categorySlug]) {
    return CATEGORY_FIELDS_REGISTRY[categorySlug];
  }

  const lower = categorySlug.toLowerCase();
  if (lower.includes('motor') || lower.includes('car') || lower.includes('vehicle')) {
    return CATEGORY_FIELDS_REGISTRY['motors-vehicles'] || [];
  }
  if (lower.includes('mobile') || lower.includes('phone') || lower.includes('tablet')) {
    return CATEGORY_FIELDS_REGISTRY['mobiles-tablets'] || [];
  }
  if (lower.includes('electron') || lower.includes('appliance')) {
    return CATEGORY_FIELDS_REGISTRY['electronics-appliances'] || [];
  }
  if (lower.includes('proper') || lower.includes('house') || lower.includes('plot') || lower.includes('flat')) {
    return CATEGORY_FIELDS_REGISTRY['property'] || [];
  }
  if (lower.includes('bike')) {
    return CATEGORY_FIELDS_REGISTRY['motorcycles'] || [];
  }
  if (lower.includes('job')) {
    return CATEGORY_FIELDS_REGISTRY['jobs'] || [];
  }
  if (lower.includes('service')) {
    return CATEGORY_FIELDS_REGISTRY['services'] || [];
  }
  if (lower.includes('fashion') || lower.includes('beauty')) {
    return CATEGORY_FIELDS_REGISTRY['fashion-beauty'] || [];
  }
  if (lower.includes('furnitur')) {
    return CATEGORY_FIELDS_REGISTRY['furniture-home-decor'] || [];
  }
  if (lower.includes('animal') || lower.includes('pet')) {
    return CATEGORY_FIELDS_REGISTRY['animals'] || [];
  }

  return [];
}

/**
 * Returns only filterable fields for a category
 */
export function getFilterableFieldsForCategory(categorySlug?: string | null): CategoryField[] {
  return getFieldsForCategory(categorySlug).filter((f) => f.isFilterable !== false);
}

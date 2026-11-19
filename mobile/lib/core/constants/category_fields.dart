import 'package:flutter/material.dart';

/// Type of custom input field for a category
enum CategoryFieldType {
  select,
  text,
  number,
}

/// Represents a single customizable field for a marketplace category
class CategoryField {
  final String key;
  final String label;
  final CategoryFieldType type;
  final List<String> options;
  final IconData icon;
  final String? placeholder;
  final bool isFilterable;

  const CategoryField({
    required this.key,
    required this.label,
    required this.type,
    this.options = const [],
    this.icon = Icons.tune,
    this.placeholder,
    this.isFilterable = true,
  });
}

/// Registry mapping categories to their specific custom attributes
class CategoryFieldsRegistry {
  static const Map<String, List<CategoryField>> _categoryFields = {
    // 1. Motors & Vehicles
    'motors-vehicles': [
      CategoryField(
        key: 'make',
        label: 'Make / Brand',
        type: CategoryFieldType.select,
        icon: Icons.directions_car_outlined,
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
      ),
      CategoryField(
        key: 'modelYear',
        label: 'Model Year',
        type: CategoryFieldType.select,
        icon: Icons.calendar_today_outlined,
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
      ),
      CategoryField(
        key: 'fuelType',
        label: 'Fuel Type',
        type: CategoryFieldType.select,
        icon: Icons.local_gas_station_outlined,
        options: ['Petrol', 'Hybrid', 'Diesel', 'Electric', 'CNG'],
      ),
      CategoryField(
        key: 'transmission',
        label: 'Transmission',
        type: CategoryFieldType.select,
        icon: Icons.settings_suggest_outlined,
        options: ['Automatic', 'Manual'],
      ),
      CategoryField(
        key: 'mileage',
        label: 'Mileage (KM)',
        type: CategoryFieldType.text,
        icon: Icons.speed_outlined,
        placeholder: 'e.g. 45,000 km',
        isFilterable: false,
      ),
      CategoryField(
        key: 'registeredIn',
        label: 'Registration City',
        type: CategoryFieldType.select,
        icon: Icons.app_registration_outlined,
        options: [
          'Lahore',
          'Karachi',
          'Islamabad',
          'Rawalpindi',
          'Punjab',
          'Sindh',
          'Unregistered',
        ],
      ),
    ],

    // 2. Mobiles & Tablets
    'mobiles-tablets': [
      CategoryField(
        key: 'brand',
        label: 'Brand',
        type: CategoryFieldType.select,
        icon: Icons.phone_android_outlined,
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
      ),
      CategoryField(
        key: 'ptaStatus',
        label: 'PTA Status',
        type: CategoryFieldType.select,
        icon: Icons.verified_user_outlined,
        options: ['PTA Approved', 'Non-PTA', 'JV / Gevey', 'Sim Working'],
      ),
      CategoryField(
        key: 'storage',
        label: 'Storage Capacity',
        type: CategoryFieldType.select,
        icon: Icons.sd_storage_outlined,
        options: ['32 GB', '64 GB', '128 GB', '256 GB', '512 GB', '1 TB'],
      ),
      CategoryField(
        key: 'ram',
        label: 'RAM Size',
        type: CategoryFieldType.select,
        icon: Icons.memory_outlined,
        options: ['3 GB', '4 GB', '6 GB', '8 GB', '12 GB', '16 GB+'],
      ),
    ],

    // 3. Electronics & Home Appliances
    'electronics-appliances': [
      CategoryField(
        key: 'deviceType',
        label: 'Device Type',
        type: CategoryFieldType.select,
        icon: Icons.devices_other_outlined,
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
      ),
      CategoryField(
        key: 'brand',
        label: 'Brand',
        type: CategoryFieldType.select,
        icon: Icons.branding_watermark_outlined,
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
      ),
      CategoryField(
        key: 'warranty',
        label: 'Warranty Status',
        type: CategoryFieldType.select,
        icon: Icons.shield_outlined,
        options: ['Company Warranty Available', 'Shop Warranty', 'No Warranty / Expired'],
      ),
    ],

    // 4. Property
    'property': [
      CategoryField(
        key: 'propertyType',
        label: 'Property Type',
        type: CategoryFieldType.select,
        icon: Icons.home_work_outlined,
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
      ),
      CategoryField(
        key: 'areaSize',
        label: 'Area / Size',
        type: CategoryFieldType.select,
        icon: Icons.square_foot_outlined,
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
      ),
      CategoryField(
        key: 'bedrooms',
        label: 'Bedrooms',
        type: CategoryFieldType.select,
        icon: Icons.bed_outlined,
        options: ['Studio', '1', '2', '3', '4', '5', '6+'],
      ),
      CategoryField(
        key: 'bathrooms',
        label: 'Bathrooms',
        type: CategoryFieldType.select,
        icon: Icons.bathtub_outlined,
        options: ['1', '2', '3', '4', '5+'],
      ),
      CategoryField(
        key: 'furnishing',
        label: 'Furnishing',
        type: CategoryFieldType.select,
        icon: Icons.chair_outlined,
        options: ['Furnished', 'Semi-Furnished', 'Unfurnished'],
      ),
    ],

    // 5. Bikes & Motorcycles
    'motorcycles': [
      CategoryField(
        key: 'make',
        label: 'Make',
        type: CategoryFieldType.select,
        icon: Icons.two_wheeler_outlined,
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
      ),
      CategoryField(
        key: 'engineCapacity',
        label: 'Engine Capacity',
        type: CategoryFieldType.select,
        icon: Icons.speed_outlined,
        options: ['70 cc', '100 cc', '110 cc', '125 cc', '150 cc', '200 cc+'],
      ),
      CategoryField(
        key: 'modelYear',
        label: 'Model Year',
        type: CategoryFieldType.select,
        icon: Icons.calendar_today_outlined,
        options: ['2025', '2024', '2023', '2022', '2021', '2020', '2018-2019', 'Older'],
      ),
      CategoryField(
        key: 'startType',
        label: 'Starting',
        type: CategoryFieldType.select,
        icon: Icons.electric_bolt_outlined,
        options: ['Kick Start', 'Self Start', 'Both'],
      ),
    ],

    // 6. Jobs
    'jobs': [
      CategoryField(
        key: 'jobType',
        label: 'Job Type',
        type: CategoryFieldType.select,
        icon: Icons.work_outline,
        options: ['Full-Time', 'Part-Time', 'Remote / Work from Home', 'Contract', 'Internship'],
      ),
      CategoryField(
        key: 'careerLevel',
        label: 'Career Level',
        type: CategoryFieldType.select,
        icon: Icons.stairs_outlined,
        options: ['Entry Level', 'Mid Level', 'Senior', 'Manager / Director'],
      ),
      CategoryField(
        key: 'education',
        label: 'Minimum Education',
        type: CategoryFieldType.select,
        icon: Icons.school_outlined,
        options: ['Matric / O-Level', 'Intermediate / A-Level', 'Bachelor', 'Master', 'Doctorate'],
      ),
    ],

    // 7. Services
    'services': [
      CategoryField(
        key: 'serviceType',
        label: 'Service Type',
        type: CategoryFieldType.select,
        icon: Icons.home_repair_service_outlined,
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
      ),
    ],

    // 8. Fashion & Beauty
    'fashion-beauty': [
      CategoryField(
        key: 'gender',
        label: 'Target',
        type: CategoryFieldType.select,
        icon: Icons.people_outline,
        options: ['Men', 'Women', 'Unisex', 'Kids & Babies'],
      ),
      CategoryField(
        key: 'productType',
        label: 'Item Type',
        type: CategoryFieldType.select,
        icon: Icons.checkroom_outlined,
        options: [
          'Clothing',
          'Footwear & Shoes',
          'Watches',
          'Bags & Wallets',
          'Jewelry & Accessories',
          'Fragrances & Perfumes',
        ],
      ),
      CategoryField(
        key: 'size',
        label: 'Size',
        type: CategoryFieldType.select,
        icon: Icons.straighten_outlined,
        options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'],
      ),
    ],

    // 9. Furniture & Home Decor
    'furniture-home-decor': [
      CategoryField(
        key: 'furnitureType',
        label: 'Furniture Type',
        type: CategoryFieldType.select,
        icon: Icons.chair_outlined,
        options: [
          'Sofas & Couches',
          'Beds & Wardrobes',
          'Dining Tables & Chairs',
          'Office Furniture',
          'Coffee & Center Tables',
          'Rugs & Curtains',
          'Home Decor & Lighting',
        ],
      ),
      CategoryField(
        key: 'material',
        label: 'Primary Material',
        type: CategoryFieldType.select,
        icon: Icons.layers_outlined,
        options: ['Solid Wood (Sheesham/Teak)', 'Engineered Wood / MDF', 'Metal / Iron', 'Glass', 'Leather / Fabric'],
      ),
    ],

    // 10. Animals & Pets
    'animals': [
      CategoryField(
        key: 'petType',
        label: 'Animal Type',
        type: CategoryFieldType.select,
        icon: Icons.pets_outlined,
        options: ['Dogs', 'Cats', 'Birds & Parrots', 'Goats & Sheep', 'Cows & Buffaloes', 'Horses', 'Fish & Aquariums'],
      ),
      CategoryField(
        key: 'vaccinated',
        label: 'Vaccinated',
        type: CategoryFieldType.select,
        icon: Icons.vaccines_outlined,
        options: ['Yes', 'No'],
      ),
    ],
  };

  /// Returns all custom fields configured for a given category slug
  static List<CategoryField> getFieldsForCategory(String? categorySlug) {
    if (categorySlug == null || categorySlug.isEmpty) return const [];
    
    // Exact match
    if (_categoryFields.containsKey(categorySlug)) {
      return _categoryFields[categorySlug]!;
    }

    // Normalized match (e.g. 'bikes' -> 'motorcycles', 'cars' -> 'motors-vehicles')
    final lower = categorySlug.toLowerCase();
    if (lower.contains('motor') || lower.contains('car') || lower.contains('vehicle')) {
      return _categoryFields['motors-vehicles'] ?? const [];
    }
    if (lower.contains('mobile') || lower.contains('phone') || lower.contains('tablet')) {
      return _categoryFields['mobiles-tablets'] ?? const [];
    }
    if (lower.contains('electron') || lower.contains('appliance')) {
      return _categoryFields['electronics-appliances'] ?? const [];
    }
    if (lower.contains('proper') || lower.contains('house') || lower.contains('plot') || lower.contains('flat')) {
      return _categoryFields['property'] ?? const [];
    }
    if (lower.contains('bike')) {
      return _categoryFields['motorcycles'] ?? const [];
    }
    if (lower.contains('job')) {
      return _categoryFields['jobs'] ?? const [];
    }
    if (lower.contains('service')) {
      return _categoryFields['services'] ?? const [];
    }
    if (lower.contains('fashion') || lower.contains('beauty')) {
      return _categoryFields['fashion-beauty'] ?? const [];
    }
    if (lower.contains('furnitur')) {
      return _categoryFields['furniture-home-decor'] ?? const [];
    }
    if (lower.contains('animal') || lower.contains('pet')) {
      return _categoryFields['animals'] ?? const [];
    }

    return const [];
  }

  /// Returns only filterable fields for a category
  static List<CategoryField> getFilterableFieldsForCategory(String? categorySlug) {
    return getFieldsForCategory(categorySlug).where((f) => f.isFilterable).toList();
  }
}

class AppConstants {
  static const String appName = 'Classified Ads PK';
  static const String currency = 'PKR';
  static const String currencySymbol = 'Rs ';
  
  // Default Pakistani Cities for selector & fallback
  static const List<String> defaultPakistaniCities = [
    'Karachi',
    'Lahore',
    'Islamabad',
    'Rawalpindi',
    'Faisalabad',
    'Multan',
    'Peshawar',
    'Quetta',
    'Gujranwala',
    'Sialkot',
    'Hyderabad',
    'Abbottabad',
    'Bahawalpur',
  ];

  // Ad condition values matching backend Prisma enum
  static const Map<String, String> adConditions = {
    'NEW': 'New',
    'LIKE_NEW': 'Like New',
    'USED_GOOD': 'Used (Good)',
    'USED_FAIR': 'Used (Fair)',
  };
}

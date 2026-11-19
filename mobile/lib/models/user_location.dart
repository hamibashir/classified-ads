class UserLocation {
  final String cityName;
  final String province;
  final double latitude;
  final double longitude;
  final bool isGps;

  const UserLocation({
    required this.cityName,
    required this.province,
    required this.latitude,
    required this.longitude,
    this.isGps = false,
  });

  bool get isAllPakistan =>
      cityName == 'All Pakistan' || cityName == 'Pakistan' || cityName.isEmpty;

  String get displayName {
    if (isGps) {
      return 'Near Me';
    }
    if (isAllPakistan) {
      return 'All Pakistan';
    }
    return cityName;
  }

  Map<String, dynamic> toJson() {
    return {
      'cityName': cityName,
      'province': province,
      'latitude': latitude,
      'longitude': longitude,
      'isGps': isGps,
    };
  }

  factory UserLocation.fromJson(Map<String, dynamic> json) {
    return UserLocation(
      cityName: json['cityName']?.toString() ?? 'All Pakistan',
      province: json['province']?.toString() ?? 'Pakistan',
      latitude: (json['latitude'] as num?)?.toDouble() ?? 30.3753,
      longitude: (json['longitude'] as num?)?.toDouble() ?? 69.3451,
      isGps: json['isGps'] == true,
    );
  }

  static const allPakistan = UserLocation(
    cityName: 'All Pakistan',
    province: 'Pakistan',
    latitude: 30.3753,
    longitude: 69.3451,
    isGps: false,
  );

  static const defaultLocation = allPakistan;
}

class CityInfo {
  final String name;
  final String province;
  final double latitude;
  final double longitude;
  final bool isPopular;

  const CityInfo({
    required this.name,
    required this.province,
    required this.latitude,
    required this.longitude,
    this.isPopular = false,
  });

  static const List<CityInfo> pakistaniCities = [
    CityInfo(name: 'Lahore', province: 'Punjab', latitude: 31.5204, longitude: 74.3587, isPopular: true),
    CityInfo(name: 'Karachi', province: 'Sindh', latitude: 24.8607, longitude: 67.0011, isPopular: true),
    CityInfo(name: 'Islamabad', province: 'Islamabad Capital Territory', latitude: 33.6844, longitude: 73.0479, isPopular: true),
    CityInfo(name: 'Rawalpindi', province: 'Punjab', latitude: 33.5651, longitude: 73.0169, isPopular: true),
    CityInfo(name: 'Faisalabad', province: 'Punjab', latitude: 31.4504, longitude: 73.1350, isPopular: true),
    CityInfo(name: 'Multan', province: 'Punjab', latitude: 30.1575, longitude: 71.5249, isPopular: true),
    CityInfo(name: 'Peshawar', province: 'Khyber Pakhtunkhwa', latitude: 34.0151, longitude: 71.5249, isPopular: true),
    CityInfo(name: 'Quetta', province: 'Balochistan', latitude: 30.1798, longitude: 66.9750, isPopular: true),
    CityInfo(name: 'Sialkot', province: 'Punjab', latitude: 32.4945, longitude: 74.5229, isPopular: true),
    CityInfo(name: 'Gujranwala', province: 'Punjab', latitude: 32.1877, longitude: 74.1945, isPopular: true),
    CityInfo(name: 'Hyderabad', province: 'Sindh', latitude: 25.3960, longitude: 68.3578),
    CityInfo(name: 'Bahawalpur', province: 'Punjab', latitude: 29.3544, longitude: 71.6911),
    CityInfo(name: 'Sargodha', province: 'Punjab', latitude: 32.0836, longitude: 72.6711),
  ];
}

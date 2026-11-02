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

  String get displayName {
    if (isGps) {
      return '📍 Near Me';
    }
    return '📍 $cityName';
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
      cityName: json['cityName']?.toString() ?? 'Lahore',
      province: json['province']?.toString() ?? 'Punjab',
      latitude: (json['latitude'] as num?)?.toDouble() ?? 31.5204,
      longitude: (json['longitude'] as num?)?.toDouble() ?? 74.3587,
      isGps: json['isGps'] == true,
    );
  }

  static const defaultLocation = UserLocation(
    cityName: 'Lahore',
    province: 'Punjab',
    latitude: 31.5204,
    longitude: 74.3587,
    isGps: false,
  );
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
    required this.isPopular,
  });

  static const List<CityInfo> pakistaniCities = [
    CityInfo(name: 'Karachi', province: 'Sindh', latitude: 24.8607, longitude: 67.0011, isPopular: true),
    CityInfo(name: 'Lahore', province: 'Punjab', latitude: 31.5204, longitude: 74.3587, isPopular: true),
    CityInfo(name: 'Islamabad', province: 'Islamabad Capital Territory', latitude: 33.6844, longitude: 73.0479, isPopular: true),
    CityInfo(name: 'Rawalpindi', province: 'Punjab', latitude: 33.5651, longitude: 73.0169, isPopular: true),
    CityInfo(name: 'Faisalabad', province: 'Punjab', latitude: 31.4504, longitude: 73.1350, isPopular: true),
    CityInfo(name: 'Multan', province: 'Punjab', latitude: 30.1575, longitude: 71.5249, isPopular: true),
    CityInfo(name: 'Peshawar', province: 'Khyber Pakhtunkhwa', latitude: 34.0151, longitude: 71.5249, isPopular: true),
    CityInfo(name: 'Quetta', province: 'Balochistan', latitude: 30.1798, longitude: 66.9750, isPopular: true),
    CityInfo(name: 'Gujranwala', province: 'Punjab', latitude: 32.1877, longitude: 74.1945, isPopular: false),
    CityInfo(name: 'Sialkot', province: 'Punjab', latitude: 32.4945, longitude: 74.5229, isPopular: false),
    CityInfo(name: 'Hyderabad', province: 'Sindh', latitude: 25.3960, longitude: 68.3578, isPopular: false),
    CityInfo(name: 'Abbottabad', province: 'Khyber Pakhtunkhwa', latitude: 34.1688, longitude: 73.2215, isPopular: false),
    CityInfo(name: 'Bahawalpur', province: 'Punjab', latitude: 29.3544, longitude: 71.6911, isPopular: false),
  ];
}

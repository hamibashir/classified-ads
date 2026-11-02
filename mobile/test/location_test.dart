import 'package:flutter_test/flutter_test.dart';
import 'package:classified_ads_mobile/models/user_location.dart';
import 'package:classified_ads_mobile/core/providers/location_provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() {
    SharedPreferences.setMockInitialValues({});
  });

  group('UserLocation Model Tests', () {
    test('serializes and deserializes correctly', () {
      const location = UserLocation(
        cityName: 'Islamabad',
        province: 'Islamabad Capital Territory',
        latitude: 33.6844,
        longitude: 73.0479,
        isGps: false,
      );

      final json = location.toJson();
      final parsed = UserLocation.fromJson(json);

      expect(parsed.cityName, 'Islamabad');
      expect(parsed.province, 'Islamabad Capital Territory');
      expect(parsed.latitude, 33.6844);
      expect(parsed.longitude, 73.0479);
      expect(parsed.isGps, isFalse);
      expect(parsed.displayName, '📍 Islamabad');
    });

    test('displays "📍 Near Me" when isGps is true', () {
      const gpsLocation = UserLocation(
        cityName: 'Nearby',
        province: 'Pakistan',
        latitude: 31.5204,
        longitude: 74.3587,
        isGps: true,
      );

      expect(gpsLocation.displayName, '📍 Near Me');
    });

    test('contains 13 pre-seeded Pakistani cities', () {
      expect(CityInfo.pakistaniCities.length, 13);
      final names = CityInfo.pakistaniCities.map((c) => c.name).toList();
      expect(names, contains('Karachi'));
      expect(names, contains('Lahore'));
      expect(names, contains('Islamabad'));
      expect(names, contains('Peshawar'));
      expect(names, contains('Quetta'));
    });
  });

  group('LocationProvider Tests', () {
    test('initializes with default Lahore location', () {
      final provider = LocationProvider();
      expect(provider.currentLocation.cityName, 'Lahore');
      expect(provider.currentLocation.province, 'Punjab');
      expect(provider.isLoading, isFalse);
    });

    test('selectCity updates currentLocation and notifies', () async {
      final provider = LocationProvider();
      final karachi = CityInfo.pakistaniCities.firstWhere((c) => c.name == 'Karachi');

      var notified = false;
      provider.addListener(() {
        notified = true;
      });

      await provider.selectCity(karachi);

      expect(notified, isTrue);
      expect(provider.currentLocation.cityName, 'Karachi');
      expect(provider.currentLocation.province, 'Sindh');
      expect(provider.currentLocation.latitude, 24.8607);
      expect(provider.currentLocation.isGps, isFalse);
    });
  });
}

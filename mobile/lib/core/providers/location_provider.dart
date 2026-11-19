import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../models/user_location.dart';
import '../services/location_service.dart';

class LocationProvider extends ChangeNotifier {
  static const String _storageKey = 'pk_user_location';

  final LocationService _locationService;
  UserLocation _currentLocation = UserLocation.defaultLocation;
  bool _isLoading = false;
  String? _errorMessage;

  LocationProvider({LocationService? locationService})
      : _locationService = locationService ?? LocationService();

  UserLocation get currentLocation => _currentLocation;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  Future<void> init() async {
    await loadSavedLocation();
  }

  Future<void> loadSavedLocation() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final savedJson = prefs.getString(_storageKey);
      if (savedJson != null) {
        final map = jsonDecode(savedJson) as Map<String, dynamic>;
        _currentLocation = UserLocation.fromJson(map);
        notifyListeners();
      }
    } catch (_) {
      // Fallback to default Lahore
      _currentLocation = UserLocation.defaultLocation;
    }
  }

  Future<bool> detectGpsLocation() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final position = await _locationService.getCurrentPosition();
      if (position != null) {
        _currentLocation = UserLocation(
          cityName: 'Nearby',
          province: 'Pakistan',
          latitude: position.latitude,
          longitude: position.longitude,
          isGps: true,
        );
        await _saveLocationToPrefs(_currentLocation);
        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        _errorMessage = 'Could not access GPS. Please choose a city.';
        _isLoading = false;
        notifyListeners();
        return false;
      }
    } catch (e) {
      _errorMessage = 'Location error: ${e.toString()}';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> selectAllPakistan() async {
    _currentLocation = UserLocation.allPakistan;
    _errorMessage = null;
    await _saveLocationToPrefs(_currentLocation);
    notifyListeners();
  }

  Future<void> selectCity(CityInfo city) async {
    _currentLocation = UserLocation(
      cityName: city.name,
      province: city.province,
      latitude: city.latitude,
      longitude: city.longitude,
      isGps: false,
    );
    _errorMessage = null;
    await _saveLocationToPrefs(_currentLocation);
    notifyListeners();
  }

  Future<void> _saveLocationToPrefs(UserLocation location) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_storageKey, jsonEncode(location.toJson()));
    } catch (_) {}
  }
}

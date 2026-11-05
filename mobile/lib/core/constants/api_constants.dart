import 'package:flutter/foundation.dart';

class ApiConstants {
  static const String _envBaseUrl = String.fromEnvironment('API_BASE_URL');
  static const String _envSocketUrl = String.fromEnvironment('SOCKET_URL');

  // Automatically resolves host based on platform:
  // - Flutter Web: http://localhost:5000/api/v1
  // - Android Emulator: http://10.0.2.2:5000/api/v1
  // - iOS / Desktop: http://localhost:5000/api/v1
  // - Explicit override: via --dart-define=API_BASE_URL=...
  static String get baseUrl {
    if (_envBaseUrl.isNotEmpty) return _envBaseUrl;
    if (kIsWeb) return 'http://localhost:5000/api/v1';
    if (defaultTargetPlatform == TargetPlatform.android) {
      return 'http://10.0.2.2:5000/api/v1';
    }
    return 'http://localhost:5000/api/v1';
  }

  static String get socketUrl {
    if (_envSocketUrl.isNotEmpty) return _envSocketUrl;
    if (kIsWeb) return 'http://localhost:5000';
    if (defaultTargetPlatform == TargetPlatform.android) {
      return 'http://10.0.2.2:5000';
    }
    return 'http://localhost:5000';
  }

  // Authentication endpoints
  static const String login = '/auth/login';
  static const String register = '/auth/register';
  static const String googleAuth = '/auth/google';
  static const String refresh = '/auth/refresh';
  static const String me = '/auth/me';

  // Marketplace endpoints
  static const String ads = '/ads';
  static const String categories = '/categories';
  static const String cities = '/locations/cities';
  static const String upload = '/upload';

  // Chat endpoints
  static const String conversations = '/chat/conversations';

  // User endpoints
  static const String myAds = '/ads/my';
  static const String favorites = '/ads/favorites';
}

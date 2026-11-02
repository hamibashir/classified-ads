class ApiConstants {
  // In development, Android emulator connects to host machine via 10.0.2.2.
  // For physical Android / iOS, override with host machine LAN IP.
  static const String baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://10.0.2.2:5000/api/v1',
  );

  static const String socketUrl = String.fromEnvironment(
    'SOCKET_URL',
    defaultValue: 'http://10.0.2.2:5000',
  );

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

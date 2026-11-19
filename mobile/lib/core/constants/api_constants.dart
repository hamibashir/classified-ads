class ApiConstants {
  static const String _envBaseUrl = String.fromEnvironment('API_BASE_URL');
  static const String _envSocketUrl = String.fromEnvironment('SOCKET_URL');

  // Production Zaaz B API endpoints (override with --dart-define=API_BASE_URL=... for local dev)
  static String get baseUrl {
    if (_envBaseUrl.isNotEmpty) return _envBaseUrl;
    return 'https://api.zaazb.com/api/v1';
  }

  static String get socketUrl {
    if (_envSocketUrl.isNotEmpty) return _envSocketUrl;
    return 'https://api.zaazb.com';
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
  static String conversation(String id) => '/chat/conversations/$id';
  static String conversationMessages(String id) => '/chat/conversations/$id/messages';

  // User endpoints
  static const String myAds = '/ads/my';
  static const String favorites = '/ads/favorites';
}

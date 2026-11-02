import 'package:flutter_test/flutter_test.dart';
import 'package:classified_ads_mobile/models/api_response.dart';
import 'package:classified_ads_mobile/core/network/api_client.dart';
import 'package:classified_ads_mobile/core/constants/api_constants.dart';

void main() {
  group('ApiResponse parsing tests', () {
    test('parses success envelope correctly', () {
      final json = {
        'success': true,
        'message': 'Ads retrieved',
        'data': {'count': 5, 'items': ['ad1', 'ad2']},
      };

      final response = ApiResponse<Map<String, dynamic>>.fromJson(
        json,
        (data) => data as Map<String, dynamic>,
      );

      expect(response.success, isTrue);
      expect(response.message, 'Ads retrieved');
      expect(response.data?['count'], 5);
      expect(response.error, isNull);
    });

    test('parses error envelope correctly', () {
      final json = {
        'success': false,
        'error': {
          'code': 'UNAUTHORIZED',
          'message': 'Invalid token',
          'details': 'Token expired',
        },
      };

      final response = ApiResponse<dynamic>.fromJson(json, null);

      expect(response.success, isFalse);
      expect(response.error, isNotNull);
      expect(response.error!.code, 'UNAUTHORIZED');
      expect(response.error!.message, 'Invalid token');
      expect(response.error!.details, 'Token expired');
    });

    test('ApiResponse.failure constructs valid error object', () {
      final failure = ApiResponse<void>.failure(
        code: 'NETWORK_ERROR',
        message: 'Could not connect',
      );

      expect(failure.success, isFalse);
      expect(failure.error?.code, 'NETWORK_ERROR');
      expect(failure.error?.message, 'Could not connect');
    });
  });

  group('ApiClient configuration tests', () {
    test('initializes with default options and headers', () {
      final client = ApiClient(baseUrl: 'http://localhost:5000/api/v1');
      expect(client.rawDio.options.baseUrl, 'http://localhost:5000/api/v1');
      expect(client.rawDio.options.headers['Content-Type'], 'application/json');
      expect(client.rawDio.options.headers['Accept'], 'application/json');
      expect(client.rawDio.interceptors.isNotEmpty, isTrue);
    });

    test('contains default ApiConstants endpoints', () {
      expect(ApiConstants.login, '/auth/login');
      expect(ApiConstants.register, '/auth/register');
      expect(ApiConstants.refresh, '/auth/refresh');
      expect(ApiConstants.ads, '/ads');
    });
  });
}

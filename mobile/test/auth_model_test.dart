import 'package:flutter_test/flutter_test.dart';
import 'package:classified_ads_mobile/models/user_model.dart';
import 'package:classified_ads_mobile/core/providers/auth_provider.dart';

void main() {
  group('UserModel Tests', () {
    test('parses UserModel from json and verifies attributes', () {
      final json = {
        'id': 'usr-101',
        'email': 'seller@classifiedads.pk',
        'name': 'Babar Azam',
        'phone': '03001234567',
        'role': 'USER',
        'isPhoneVerified': true,
        'isBanned': false,
        'createdAt': '2026-01-15T10:00:00.000Z',
      };

      final user = UserModel.fromJson(json);

      expect(user.id, 'usr-101');
      expect(user.name, 'Babar Azam');
      expect(user.email, 'seller@classifiedads.pk');
      expect(user.phone, '03001234567');
      expect(user.isAdmin, isFalse);
      expect(user.isPhoneVerified, isTrue);
      expect(user.isBanned, isFalse);
      expect(user.createdAt, isNotNull);
    });

    test('correctly identifies ADMIN role', () {
      const admin = UserModel(
        id: 'admin-1',
        email: 'admin@classifiedads.pk',
        name: 'Super Admin',
        role: 'ADMIN',
      );

      expect(admin.isAdmin, isTrue);
    });
  });

  group('AuthProvider State Tests', () {
    test('initial state is unauthenticated', () {
      final authProvider = AuthProvider();
      expect(authProvider.isAuthenticated, isFalse);
      expect(authProvider.user, isNull);
      expect(authProvider.isLoading, isFalse);
    });
  });
}

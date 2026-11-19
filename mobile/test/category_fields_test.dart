import 'package:flutter_test/flutter_test.dart';
import 'package:classified_ads_mobile/core/constants/category_fields.dart';
import 'package:classified_ads_mobile/models/ad_model.dart';

void main() {
  group('CategoryFieldsRegistry Tests', () {
    test('resolves custom fields for motors-vehicles', () {
      final fields = CategoryFieldsRegistry.getFieldsForCategory('motors-vehicles');
      expect(fields.isNotEmpty, true);
      expect(fields.any((f) => f.key == 'make'), true);
      expect(fields.any((f) => f.key == 'fuelType'), true);
      expect(fields.any((f) => f.key == 'transmission'), true);
    });

    test('resolves custom fields for mobiles-tablets', () {
      final fields = CategoryFieldsRegistry.getFieldsForCategory('mobiles-tablets');
      expect(fields.isNotEmpty, true);
      expect(fields.any((f) => f.key == 'brand'), true);
      expect(fields.any((f) => f.key == 'ptaStatus'), true);
      expect(fields.any((f) => f.key == 'storage'), true);
    });

    test('resolves custom fields for property and bikes', () {
      final propFields = CategoryFieldsRegistry.getFieldsForCategory('property');
      expect(propFields.any((f) => f.key == 'propertyType'), true);
      expect(propFields.any((f) => f.key == 'bedrooms'), true);

      final bikeFields = CategoryFieldsRegistry.getFieldsForCategory('motorcycles');
      expect(bikeFields.any((f) => f.key == 'engineCapacity'), true);
    });

    test('fuzzy resolves slug variations', () {
      final bikeFields = CategoryFieldsRegistry.getFieldsForCategory('bikes');
      expect(bikeFields.isNotEmpty, true);

      final carFields = CategoryFieldsRegistry.getFieldsForCategory('cars');
      expect(carFields.isNotEmpty, true);
    });
  });

  group('AdModel Custom Fields Parsing Tests', () {
    test('parses custom fields directly from json map', () {
      final json = {
        'id': 'ad-101',
        'userId': 'usr-1',
        'categoryId': 'cat-1',
        'title': 'Toyota Yaris ATIV 2022',
        'slug': 'toyota-yaris-2022',
        'description': 'Mint condition home used car.',
        'price': 4200000,
        'locationCity': 'Lahore',
        'customFields': {
          'make': 'Toyota',
          'fuelType': 'Petrol',
          'transmission': 'Automatic',
        },
        'createdAt': '2026-11-20T00:00:00.000Z',
      };

      final ad = AdModel.fromJson(json);
      expect(ad.customFields['make'], 'Toyota');
      expect(ad.customFields['fuelType'], 'Petrol');
      expect(ad.customFields['transmission'], 'Automatic');
      expect(ad.cleanDescription, 'Mint condition home used car.');
    });

    test('parses embedded specifications from description and cleans user description', () {
      const rawDescription = '''
First owner car, total genuine body. Complete service history available.

===SPECIFICATIONS===
{"make":"Honda","modelYear":"2023","fuelType":"Hybrid"}
====================
''';

      final json = {
        'id': 'ad-102',
        'userId': 'usr-1',
        'categoryId': 'cat-1',
        'title': 'Honda Civic RS 2023',
        'slug': 'honda-civic-2023',
        'description': rawDescription,
        'price': 8500000,
        'locationCity': 'Islamabad',
        'createdAt': '2026-11-20T00:00:00.000Z',
      };

      final ad = AdModel.fromJson(json);
      expect(ad.customFields['make'], 'Honda');
      expect(ad.customFields['modelYear'], '2023');
      expect(ad.customFields['fuelType'], 'Hybrid');
      expect(ad.cleanDescription, 'First owner car, total genuine body. Complete service history available.');
    });
  });
}

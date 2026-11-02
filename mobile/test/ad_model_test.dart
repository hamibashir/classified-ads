import 'package:flutter_test/flutter_test.dart';
import 'package:classified_ads_mobile/models/ad_model.dart';
import 'package:classified_ads_mobile/models/category_model.dart';

void main() {
  group('CategoryModel Tests', () {
    test('parses CategoryModel from json', () {
      final json = {
        'id': 'cat-1',
        'name': 'Motors & Vehicles',
        'slug': 'motors-vehicles',
        'icon': 'car',
        'order': 1,
        '_count': {'ads': 15},
      };

      final cat = CategoryModel.fromJson(json);
      expect(cat.id, 'cat-1');
      expect(cat.name, 'Motors & Vehicles');
      expect(cat.adsCount, 15);
    });
  });

  group('AdModel Tests', () {
    test('parses full AdModel and formats PKR price with commas', () {
      final json = {
        'id': 'ad-101',
        'userId': 'user-1',
        'categoryId': 'cat-1',
        'title': 'Toyota Corolla GLI 2018 Clean Condition',
        'slug': 'toyota-corolla-gli-2018-clean-condition',
        'description': 'Bumper to bumper original. Islamabad registered.',
        'price': 3450000,
        'currency': 'PKR',
        'isNegotiable': true,
        'condition': 'USED_GOOD',
        'locationCity': 'Islamabad',
        'locationState': 'Islamabad Capital Territory',
        'distance': 3.42,
        'images': [
          {'url': 'http://10.0.2.2:5000/uploads/corolla1.jpg'},
          {'url': 'http://10.0.2.2:5000/uploads/corolla2.jpg'},
        ],
        'user': {
          'id': 'user-1',
          'name': 'Ahmed Khan',
          'phone': '03001234567',
          'isPhoneVerified': true,
        },
      };

      final ad = AdModel.fromJson(json);

      expect(ad.id, 'ad-101');
      expect(ad.title, 'Toyota Corolla GLI 2018 Clean Condition');
      expect(ad.formattedPrice, 'Rs 34,50,000');
      expect(ad.formattedDistance, '3.4 km away');
      expect(ad.isNegotiable, isTrue);
      expect(ad.images.length, 2);
      expect(ad.primaryImageUrl, 'http://10.0.2.2:5000/uploads/corolla1.jpg');
      expect(ad.seller?.name, 'Ahmed Khan');
      expect(ad.seller?.isPhoneVerified, isTrue);
    });

    test('formats distance under 1 km as meters', () {
      final ad = AdModel(
        id: 'ad-2',
        userId: 'u1',
        categoryId: 'c1',
        title: 'iPhone 13 128GB',
        slug: 'iphone-13-128gb',
        description: 'PTA approved',
        price: 145000,
        locationCity: 'Lahore',
        distance: 0.45,
        createdAt: DateTime.now(),
      );

      expect(ad.formattedDistance, '450 m away');
      expect(ad.formattedPrice, 'Rs 1,45,000');
    });
  });
}

import 'package:flutter_test/flutter_test.dart';
import 'package:classified_ads_mobile/core/constants/app_constants.dart';

void main() {
  group('Post Ad Validation & Constants Tests', () {
    test('verifies Pakistani ad conditions count and values', () {
      expect(AppConstants.adConditions.length, 4);
      expect(AppConstants.adConditions['NEW'], 'New');
      expect(AppConstants.adConditions['LIKE_NEW'], 'Like New');
      expect(AppConstants.adConditions['USED_GOOD'], 'Used (Good)');
      expect(AppConstants.adConditions['USED_FAIR'], 'Used (Fair)');
    });

    test('validates title and description length criteria', () {
      bool isTitleValid(String t) => t.trim().length >= 5;
      bool isDescValid(String d) => d.trim().length >= 10;
      bool isPriceValid(String p) {
        final val = double.tryParse(p);
        return val != null && val > 0;
      }

      expect(isTitleValid('Car'), isFalse);
      expect(isTitleValid('Honda City 2020'), isTrue);

      expect(isDescValid('Short'), isFalse);
      expect(isDescValid('Genuine condition, first owner, all original'), isTrue);

      expect(isPriceValid('0'), isFalse);
      expect(isPriceValid('-500'), isFalse);
      expect(isPriceValid('abc'), isFalse);
      expect(isPriceValid('50000'), isTrue);
    });
  });
}

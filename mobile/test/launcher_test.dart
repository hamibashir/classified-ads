import 'package:flutter_test/flutter_test.dart';
import 'package:classified_ads_mobile/core/utils/launcher_utils.dart';

void main() {
  group('LauncherUtils Pakistani Phone Formatting Tests', () {
    test('formats local 03xx Pakistani phone number to 923xx', () {
      final formatted = LauncherUtils.formatPakistaniPhoneForWhatsApp('03001234567');
      expect(formatted, '923001234567');
    });

    test('strips + from +923xx phone number', () {
      final formatted = LauncherUtils.formatPakistaniPhoneForWhatsApp('+923001234567');
      expect(formatted, '923001234567');
    });

    test('replaces leading 0092 with 92', () {
      final formatted = LauncherUtils.formatPakistaniPhoneForWhatsApp('00923001234567');
      expect(formatted, '923001234567');
    });

    test('strips dashes and spaces', () {
      final formatted = LauncherUtils.formatPakistaniPhoneForWhatsApp('0300 - 123 4567');
      expect(formatted, '923001234567');
    });

    test('creates valid WhatsApp URL with encoded message', () {
      final uri = LauncherUtils.createWhatsAppUri(
        phone: '03001234567',
        adTitle: 'Honda Civic 2020',
      );

      expect(uri.scheme, 'https');
      expect(uri.host, 'wa.me');
      expect(uri.path, '/923001234567');
      expect(uri.queryParameters['text'], contains('Honda Civic 2020'));
      expect(uri.queryParameters['text'], contains('Zaaz B'));
    });
  });
}

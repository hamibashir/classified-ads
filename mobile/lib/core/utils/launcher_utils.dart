import 'package:url_launcher/url_launcher.dart';

class LauncherUtils {
  static String formatPakistaniPhoneForWhatsApp(String phone) {
    // Strip all non-digit characters
    String cleaned = phone.replaceAll(RegExp(r'\D'), '');

    if (cleaned.startsWith('0092')) {
      cleaned = cleaned.substring(2); // remove leading 00
    } else if (cleaned.startsWith('03')) {
      cleaned = '92${cleaned.substring(1)}'; // replace leading 0 with 92
    } else if (cleaned.startsWith('3') && cleaned.length == 10) {
      cleaned = '92$cleaned';
    }

    return cleaned;
  }

  static Uri createWhatsAppUri({
    required String phone,
    required String adTitle,
  }) {
    final formattedPhone = formatPakistaniPhoneForWhatsApp(phone);
    final text = 'Assalam-o-Alaikum, I saw your ad "$adTitle" on Zaaz B. Is it still available?';
    return Uri.parse(
      'https://wa.me/$formattedPhone?text=${Uri.encodeComponent(text)}',
    );
  }

  static Future<bool> launchWhatsApp({
    required String phone,
    required String adTitle,
  }) async {
    final uri = createWhatsAppUri(phone: phone, adTitle: adTitle);
    return launchUrl(uri, mode: LaunchMode.externalApplication);
  }

  static Future<bool> launchPhoneDialer(String phone) async {
    final cleaned = phone.replaceAll(RegExp(r'[^\d+]'), '');
    final uri = Uri.parse('tel:$cleaned');
    return launchUrl(uri);
  }

  static Future<bool> launchBrowserUrl(String url) async {
    final uri = Uri.parse(url);
    return launchUrl(uri, mode: LaunchMode.externalApplication);
  }
}

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:classified_ads_mobile/core/theme/app_colors.dart';
import 'package:classified_ads_mobile/core/theme/app_theme.dart';

void main() {
  test('AppTheme light theme contains valid tokens and extensions', () {
    final theme = AppTheme.lightTheme;
    expect(theme.useMaterial3, isTrue);
    expect(theme.colorScheme.primary, const Color(0xFF0F766E)); // Teal 700
    expect(theme.scaffoldBackgroundColor, const Color(0xFFF8FAFC)); // Slate 50

    final marketplace = theme.extension<MarketplaceColors>();
    expect(marketplace, isNotNull);
    expect(marketplace!.priceColor, const Color(0xFF047857)); // Emerald 700
    expect(marketplace.whatsappColor, const Color(0xFF25D366)); // WhatsApp green
  });

  test('AppTheme dark theme contains valid tokens and extensions', () {
    final theme = AppTheme.darkTheme;
    expect(theme.useMaterial3, isTrue);
    expect(theme.colorScheme.primary, const Color(0xFF14B8A6)); // Teal 500
    expect(theme.scaffoldBackgroundColor, const Color(0xFF0B0F17)); // Deep Slate

    final marketplace = theme.extension<MarketplaceColors>();
    expect(marketplace, isNotNull);
    expect(marketplace!.priceColor, const Color(0xFF10B981)); // Emerald 500
  });
}

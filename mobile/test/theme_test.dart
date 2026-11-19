import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:classified_ads_mobile/core/theme/app_colors.dart';
import 'package:classified_ads_mobile/core/theme/app_theme.dart';

void main() {
  test('AppTheme light theme contains valid tokens and extensions', () {
    final theme = AppTheme.lightTheme;
    expect(theme.useMaterial3, isTrue);
    expect(theme.colorScheme.primary, AppColors.primaryLight);
    expect(theme.scaffoldBackgroundColor, AppColors.backgroundLight);

    final marketplace = theme.extension<MarketplaceColors>();
    expect(marketplace, isNotNull);
    expect(marketplace!.priceColor, AppColors.priceLight);
    expect(marketplace.whatsappColor, AppColors.whatsapp);
  });

  test('AppTheme dark theme contains valid tokens and extensions', () {
    final theme = AppTheme.darkTheme;
    expect(theme.useMaterial3, isTrue);
    expect(theme.colorScheme.primary, AppColors.primaryDark);
    expect(theme.scaffoldBackgroundColor, AppColors.backgroundDark);

    final marketplace = theme.extension<MarketplaceColors>();
    expect(marketplace, isNotNull);
    expect(marketplace!.priceColor, AppColors.priceDark);
  });
}

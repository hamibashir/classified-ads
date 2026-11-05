import 'package:flutter/material.dart';

class AppColors {
  // Light Theme (Option 1: Swiss Editorial & Racing Forest)
  static const Color primaryLight = Color(0xFF0D382B); // British Racing Forest
  static const Color primaryForegroundLight = Color(0xFFFFFFFF);
  static const Color backgroundLight = Color(0xFFFBFBFB); // Alabaster White
  static const Color surfaceLight = Color(0xFFFFFFFF);
  static const Color cardLight = Color(0xFFFFFFFF);
  static const Color foregroundLight = Color(0xFF09090B); // Jet Black
  static const Color mutedLight = Color(0xFFF4F4F5); // Zinc 100
  static const Color mutedForegroundLight = Color(0xFF52525B); // Zinc 600
  static const Color borderLight = Color(0xFFE4E4E7); // Zinc 200 Hairline
  static const Color priceLight = Color(0xFF044E39); // Deep Rich Emerald

  // Dark Theme (OLED Pitch Obsidian)
  static const Color primaryDark = Color(0xFF2DD4BF); // Mint Teal Refined
  static const Color primaryForegroundDark = Color(0xFF042F2E); // Deep Forest
  static const Color backgroundDark = Color(0xFF0A0A0B); // Pitch Obsidian
  static const Color surfaceDark = Color(0xFF121214); // Deep Zinc Card
  static const Color cardDark = Color(0xFF121214);
  static const Color foregroundDark = Color(0xFFFAFAFA); // Pure Milk
  static const Color mutedDark = Color(0xFF27272A); // Zinc 800
  static const Color mutedForegroundDark = Color(0xFFA1A1AA); // Zinc 400
  static const Color borderDark = Color(0xFF27272A); // Zinc 800 Hairline
  static const Color priceDark = Color(0xFF34D399); // Luminous Jade

  // Universal Marketplace Accents
  static const Color whatsapp = Color(0xFF1FAF56); // Refined WhatsApp
  static const Color destructive = Color(0xFFDC2626);
  static const Color warning = Color(0xFFF59E0B);
  static const Color negotiableBadge = Color(0xFF0284C7); // Trust Sky Blue
}

@immutable
class MarketplaceColors extends ThemeExtension<MarketplaceColors> {
  final Color? priceColor;
  final Color? whatsappColor;
  final Color? negotiableBadgeColor;
  final Color? borderColor;

  const MarketplaceColors({
    required this.priceColor,
    required this.whatsappColor,
    required this.negotiableBadgeColor,
    required this.borderColor,
  });

  @override
  MarketplaceColors copyWith({
    Color? priceColor,
    Color? whatsappColor,
    Color? negotiableBadgeColor,
    Color? borderColor,
  }) {
    return MarketplaceColors(
      priceColor: priceColor ?? this.priceColor,
      whatsappColor: whatsappColor ?? this.whatsappColor,
      negotiableBadgeColor: negotiableBadgeColor ?? this.negotiableBadgeColor,
      borderColor: borderColor ?? this.borderColor,
    );
  }

  @override
  MarketplaceColors lerp(ThemeExtension<MarketplaceColors>? other, double t) {
    if (other is! MarketplaceColors) return this;
    return MarketplaceColors(
      priceColor: Color.lerp(priceColor, other.priceColor, t),
      whatsappColor: Color.lerp(whatsappColor, other.whatsappColor, t),
      negotiableBadgeColor: Color.lerp(negotiableBadgeColor, other.negotiableBadgeColor, t),
      borderColor: Color.lerp(borderColor, other.borderColor, t),
    );
  }

  static const light = MarketplaceColors(
    priceColor: AppColors.priceLight,
    whatsappColor: AppColors.whatsapp,
    negotiableBadgeColor: AppColors.negotiableBadge,
    borderColor: AppColors.borderLight,
  );

  static const dark = MarketplaceColors(
    priceColor: AppColors.priceDark,
    whatsappColor: AppColors.whatsapp,
    negotiableBadgeColor: AppColors.negotiableBadge,
    borderColor: AppColors.borderDark,
  );
}

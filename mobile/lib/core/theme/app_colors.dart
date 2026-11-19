import 'package:flutter/material.dart';

class AppColors {
  // Light Theme (Zaaz B Executive Forest Emerald & Gallery White)
  static const Color primaryLight = Color(0xFF064E3B); // Executive Forest Emerald
  static const Color primaryForegroundLight = Color(0xFFFFFFFF);
  static const Color backgroundLight = Color(0xFFF8F9FA); // Gallery White
  static const Color surfaceLight = Color(0xFFFFFFFF);
  static const Color cardLight = Color(0xFFFFFFFF);
  static const Color foregroundLight = Color(0xFF030712); // Obsidian
  static const Color mutedLight = Color(0xFFF3F4F6); // Slate 100
  static const Color mutedForegroundLight = Color(0xFF6B7280); // Slate 500
  static const Color borderLight = Color(0xFFE5E7EB); // Zinc Hairline
  static const Color priceLight = Color(0xFF064E3B); // Forest Emerald

  // Dark Theme (Pitch Obsidian & Luminous Jade)
  static const Color primaryDark = Color(0xFF34D399); // Luminous Jade / Mint
  static const Color primaryForegroundDark = Color(0xFF064E3B); // Deep Forest
  static const Color backgroundDark = Color(0xFF030712); // Pitch Obsidian
  static const Color surfaceDark = Color(0xFF090D16); // Carbon Navy Surface
  static const Color cardDark = Color(0xFF090D16);
  static const Color foregroundDark = Color(0xFFF8F9FA); // Crisp Gallery White
  static const Color mutedDark = Color(0xFF1E293B); // Slate 800
  static const Color mutedForegroundDark = Color(0xFF94A3B8); // Slate 400
  static const Color borderDark = Color(0xFF1E293B); // Hairline Slate
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

import 'package:flutter/material.dart';

class AppColors {
  // Light Theme
  static const Color primaryLight = Color(0xFF0F766E); // Teal 700
  static const Color primaryForegroundLight = Color(0xFFFFFFFF);
  static const Color backgroundLight = Color(0xFFF8FAFC); // Slate 50
  static const Color surfaceLight = Color(0xFFFFFFFF);
  static const Color cardLight = Color(0xFFFFFFFF);
  static const Color foregroundLight = Color(0xFF0F172A); // Slate 900
  static const Color mutedLight = Color(0xFFF1F5F9); // Slate 100
  static const Color mutedForegroundLight = Color(0xFF64748B); // Slate 500
  static const Color borderLight = Color(0xFFE2E8F0); // Slate 200
  static const Color priceLight = Color(0xFF047857); // Emerald 700

  // Dark Theme
  static const Color primaryDark = Color(0xFF14B8A6); // Teal 500
  static const Color primaryForegroundDark = Color(0xFF042F2E);
  static const Color backgroundDark = Color(0xFF0B0F17); // Deep Slate
  static const Color surfaceDark = Color(0xFF131B2A);
  static const Color cardDark = Color(0xFF131B2A);
  static const Color foregroundDark = Color(0xFFF1F5F9); // Slate 100
  static const Color mutedDark = Color(0xFF1E293B); // Slate 800
  static const Color mutedForegroundDark = Color(0xFF94A3B8); // Slate 400
  static const Color borderDark = Color(0xFF1E293B); // Slate 800
  static const Color priceDark = Color(0xFF10B981); // Emerald 500

  // Universal Marketplace Accents
  static const Color whatsapp = Color(0xFF25D366);
  static const Color destructive = Color(0xFFDC2626);
  static const Color warning = Color(0xFFF59E0B);
  static const Color negotiableBadge = Color(0xFF0284C7); // Sky 600
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

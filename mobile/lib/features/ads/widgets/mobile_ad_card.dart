import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../models/ad_model.dart';

class MobileAdCard extends StatelessWidget {
  const MobileAdCard({
    super.key,
    required this.ad,
    required this.onTap,
    required this.onToggleFavorite,
  });

  final AdModel ad;
  final VoidCallback onTap;
  final VoidCallback onToggleFavorite;

  static const _radius = BorderRadius.all(Radius.circular(14));

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final marketplace = theme.extension<MarketplaceColors>();
    final mutedColor = isDark
        ? AppColors.mutedForegroundDark
        : AppColors.mutedForegroundLight;
    final priceColor = marketplace?.priceColor ??
        (isDark ? theme.colorScheme.primary : AppColors.priceLight);

    final location = ad.locationCity.trim();
    final age = _relativeTime(ad.createdAt);
    final footer = location.isEmpty ? age : '$location · $age';

    Widget buildPhotoStack() {
      return Stack(
        fit: StackFit.expand,
        children: [
          _buildPhoto(context),
          if (ad.isFeatured)
            PositionedDirectional(
              top: 10,
              start: 10,
              end: 52,
              child: Align(
                alignment: AlignmentDirectional.topStart,
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    color: const Color(0xFFF7F1E6),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: const Padding(
                    padding: EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                    child: Text(
                      'Featured',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        color: Color(0xFF513D27),
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                        height: 1.2,
                      ),
                    ),
                  ),
                ),
              ),
            ),
          PositionedDirectional(
            top: 0,
            end: 0,
            child: SizedBox.square(
              dimension: 48,
              child: Material(
                type: MaterialType.transparency,
                child: IconButton(
                  padding: EdgeInsets.zero,
                  tooltip: ad.isFavorite
                      ? 'Remove from favorites'
                      : 'Add to favorites',
                  isSelected: ad.isFavorite,
                  icon: _favoriteIcon(Icons.favorite_border, Colors.white),
                  selectedIcon: _favoriteIcon(
                    Icons.favorite,
                    const Color(0xFFFFA5AD),
                  ),
                  onPressed: () {
                    HapticFeedback.lightImpact();
                    onToggleFavorite();
                  },
                ),
              ),
            ),
          ),
        ],
      );
    }

    return RepaintBoundary(
      child: Material(
        color: isDark ? AppColors.cardDark : Colors.white,
        shape: RoundedRectangleBorder(
          borderRadius: _radius,
          side: BorderSide(
            color: isDark ? AppColors.borderDark : const Color(0xFFE8E9EB),
          ),
        ),
        clipBehavior: Clip.antiAlias,
        child: InkWell(
          onTap: onTap,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Expanded(child: buildPhotoStack()),
              Padding(
                padding: const EdgeInsets.fromLTRB(10, 8, 10, 9),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      ad.formattedPrice,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: AppTextStyles.price.copyWith(
                        color: priceColor,
                        fontSize: 16,
                        fontWeight: FontWeight.w800,
                        height: 1.15,
                      ),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      ad.title,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: theme.colorScheme.onSurface,
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        height: 1.25,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      footer,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: mutedColor,
                        fontSize: 11,
                        height: 1.2,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPhoto(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    final url = ad.primaryImageUrl.trim();
    final placeholder = ColoredBox(
      color: colors.surfaceContainerHighest,
      child: Center(
        child: Icon(
          Icons.image_outlined,
          size: 24,
          color: colors.onSurfaceVariant,
        ),
      ),
    );

    if (url.isEmpty) return placeholder;

    return Image.network(
      url,
      fit: BoxFit.cover,
      cacheWidth: kIsWeb ? null : 600,
      excludeFromSemantics: true,
      frameBuilder: (context, child, frame, wasSynchronouslyLoaded) {
        return wasSynchronouslyLoaded || frame != null ? child : placeholder;
      },
      errorBuilder: (context, error, stackTrace) => placeholder,
    );
  }

  static Widget _favoriteIcon(IconData icon, Color color) {
    return DecoratedBox(
      decoration: const BoxDecoration(
        color: Color(0xA6000000),
        shape: BoxShape.circle,
      ),
      child: SizedBox.square(
        dimension: 32,
        child: Icon(icon, size: 17, color: color),
      ),
    );
  }

  static String _relativeTime(DateTime createdAt) {
    final age = DateTime.now().difference(createdAt);
    if (age.inDays > 0) return '${age.inDays}d ago';
    if (age.inHours > 0) return '${age.inHours}h ago';
    if (age.inMinutes > 0) return '${age.inMinutes}m ago';
    return 'Just now';
  }
}
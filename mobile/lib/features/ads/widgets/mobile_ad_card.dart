import 'package:flutter/material.dart';
import '../../../models/ad_model.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';

class MobileAdCard extends StatelessWidget {
  final AdModel ad;
  final VoidCallback onTap;
  final VoidCallback onToggleFavorite;

  const MobileAdCard({
    super.key,
    required this.ad,
    required this.onTap,
    required this.onToggleFavorite,
  });

  String _formatRelativeTime(DateTime dateTime) {
    final diff = DateTime.now().difference(dateTime);
    if (diff.inDays > 0) {
      return '${diff.inDays}d ago';
    } else if (diff.inHours > 0) {
      return '${diff.inHours}h ago';
    } else if (diff.inMinutes > 0) {
      return '${diff.inMinutes}m ago';
    }
    return 'Just now';
  }

  @override
  Widget build(BuildContext context) {
    final marketplace = Theme.of(context).extension<MarketplaceColors>();

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14.0),
      child: Container(
        decoration: BoxDecoration(
          color: AppColors.cardLight,
          borderRadius: BorderRadius.circular(14.0),
          border: Border.all(color: AppColors.borderLight, width: 1.0),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.03),
              blurRadius: 4.0,
              offset: const Offset(0, 1),
            ),
          ],
        ),
        clipBehavior: Clip.antiAlias,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 4:3 Image Container with Overlays
            AspectRatio(
              aspectRatio: 4 / 3,
              child: Stack(
                fit: StackFit.expand,
                children: [
                  // Image or fallback
                  ad.primaryImageUrl.isNotEmpty
                      ? Image.network(
                          ad.primaryImageUrl,
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) => _buildPlaceholder(),
                        )
                      : _buildPlaceholder(),

                  // Distance tag if proximity is present
                  if (ad.formattedDistance.isNotEmpty)
                    Positioned(
                      bottom: 8.0,
                      left: 8.0,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8.0, vertical: 4.0),
                        decoration: BoxDecoration(
                          color: Colors.black.withValues(alpha: 0.65),
                          borderRadius: BorderRadius.circular(6.0),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.near_me, size: 12.0, color: Colors.white),
                            const SizedBox(width: 4.0),
                            Text(
                              ad.formattedDistance,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 11.0,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),

                  // Favorite Heart Button
                  Positioned(
                    top: 6.0,
                    right: 6.0,
                    child: Material(
                      color: Colors.white.withValues(alpha: 0.85),
                      shape: const CircleBorder(),
                      child: InkWell(
                        onTap: onToggleFavorite,
                        customBorder: const CircleBorder(),
                        child: Padding(
                          padding: const EdgeInsets.all(6.0),
                          child: Icon(
                            ad.isFavorite ? Icons.favorite : Icons.favorite_border,
                            size: 18.0,
                            color: ad.isFavorite ? AppColors.destructive : AppColors.foregroundLight,
                          ),
                        ),
                      ),
                    ),
                  ),

                  // Featured Ribbon if applicable
                  if (ad.isFeatured)
                    Positioned(
                      top: 8.0,
                      left: 8.0,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6.0, vertical: 2.0),
                        decoration: BoxDecoration(
                          color: AppColors.primaryLight,
                          borderRadius: BorderRadius.circular(4.0),
                        ),
                        child: const Text(
                          'FEATURED',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 9.0,
                            fontWeight: FontWeight.w700,
                            letterSpacing: 0.5,
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            ),

            // Details Body
            Padding(
              padding: const EdgeInsets.all(10.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Price row with Negotiable badge
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          ad.formattedPrice,
                          style: AppTextStyles.price.copyWith(
                            color: marketplace?.priceColor ?? AppColors.priceLight,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      if (ad.isNegotiable)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 5.0, vertical: 2.0),
                          decoration: BoxDecoration(
                            color: AppColors.mutedLight,
                            borderRadius: BorderRadius.circular(4.0),
                          ),
                          child: const Text(
                            'Neg.',
                            style: TextStyle(
                              fontSize: 10.0,
                              fontWeight: FontWeight.w600,
                              color: AppColors.mutedForegroundLight,
                            ),
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 4.0),

                  // Ad Title (max 2 lines)
                  Text(
                    ad.title,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: AppTextStyles.adTitle.copyWith(
                      color: AppColors.foregroundLight,
                    ),
                  ),
                  const SizedBox(height: 6.0),

                  // Location and Date Footer
                  Row(
                    children: [
                      const Icon(
                        Icons.location_on_outlined,
                        size: 13.0,
                        color: AppColors.mutedForegroundLight,
                      ),
                      const SizedBox(width: 2.0),
                      Expanded(
                        child: Text(
                          ad.locationCity,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: AppTextStyles.meta.copyWith(
                            color: AppColors.mutedForegroundLight,
                          ),
                        ),
                      ),
                      Text(
                        '• ${_formatRelativeTime(ad.createdAt)}',
                        style: AppTextStyles.meta.copyWith(
                          color: AppColors.mutedForegroundLight,
                        ),
                      ),
                      if (ad.seller?.isPhoneVerified == true) ...[
                        const SizedBox(width: 4.0),
                        const Icon(
                          Icons.verified,
                          size: 13.0,
                          color: AppColors.primaryLight,
                        ),
                      ],
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPlaceholder() {
    return Container(
      color: AppColors.mutedLight,
      child: const Center(
        child: Icon(
          Icons.image_outlined,
          size: 36.0,
          color: AppColors.mutedForegroundLight,
        ),
      ),
    );
  }
}

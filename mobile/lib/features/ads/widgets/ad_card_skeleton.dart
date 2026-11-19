import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/shimmer_box.dart';

/// Pixel-perfect skeleton loading placeholder matching [MobileAdCard] layout geometry.
class AdCardSkeleton extends StatelessWidget {
  const AdCardSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      decoration: BoxDecoration(
        color: isDark ? AppColors.cardDark : Colors.white,
        borderRadius: BorderRadius.circular(14.0),
        border: Border.all(
          color: isDark ? AppColors.borderDark : const Color(0xFFE8E9EB),
          width: 1.0,
        ),
      ),
      clipBehavior: Clip.antiAlias,
      child: ShimmerEffect(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Top Image Placeholder with heart circle overlay
            Expanded(
              child: AspectRatio(
                aspectRatio: 3 / 2,
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    const ShimmerBox(borderRadius: 0),
                    Positioned(
                      top: 8.0,
                      right: 8.0,
                      child: Container(
                        width: 28.0,
                        height: 28.0,
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.25),
                          shape: BoxShape.circle,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // Card Body with matching minimal geometry
            const Padding(
              padding: EdgeInsets.fromLTRB(10.0, 8.0, 10.0, 9.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Price placeholder
                  ShimmerBox(
                    width: 90.0,
                    height: 16.0,
                    borderRadius: 4.0,
                  ),
                  SizedBox(height: 5.0),

                  // Title lines
                  ShimmerBox(
                    width: double.infinity,
                    height: 12.0,
                    borderRadius: 3.0,
                  ),
                  SizedBox(height: 4.0),
                  ShimmerBox(
                    width: 100.0,
                    height: 12.0,
                    borderRadius: 3.0,
                  ),
                  SizedBox(height: 7.0),

                  // Location & Time metadata
                  Row(
                    children: [
                      ShimmerBox(
                        width: 12.0,
                        height: 12.0,
                        borderRadius: 2.0,
                      ),
                      SizedBox(width: 4.0),
                      ShimmerBox(
                        width: 80.0,
                        height: 10.0,
                        borderRadius: 2.0,
                      ),
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
}

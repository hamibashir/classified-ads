import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/shimmer_box.dart';

/// Skeleton screen matching [AdDetailsScreen] layout geometry.
class AdDetailsSkeleton extends StatelessWidget {
  const AdDetailsSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? AppColors.backgroundDark : AppColors.backgroundLight,
      appBar: AppBar(
        backgroundColor: isDark ? AppColors.surfaceDark : AppColors.surfaceLight,
        elevation: 0,
        leading: const BackButton(),
        title: const ShimmerBox(width: 120, height: 16, borderRadius: 4.0),
      ),
      body: ShimmerEffect(
        child: SingleChildScrollView(
          physics: const NeverScrollableScrollPhysics(),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Hero Image 4:3 placeholder
              const AspectRatio(
                aspectRatio: 4 / 3,
                child: ShimmerBox(borderRadius: 0),
              ),

              Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Price Row
                    const Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        ShimmerBox(width: 150, height: 28, borderRadius: 6.0),
                        ShimmerBox(width: 80, height: 22, borderRadius: 6.0),
                      ],
                    ),
                    const SizedBox(height: 12.0),

                    // Title
                    const ShimmerBox(width: double.infinity, height: 20, borderRadius: 4.0),
                    const SizedBox(height: 8.0),
                    const ShimmerBox(width: 220, height: 20, borderRadius: 4.0),
                    const SizedBox(height: 12.0),

                    // Location & Date
                    const Row(
                      children: [
                        ShimmerBox(width: 16, height: 16, borderRadius: 3.0),
                        SizedBox(width: 6.0),
                        ShimmerBox(width: 100, height: 14, borderRadius: 3.0),
                        SizedBox(width: 12.0),
                        ShimmerBox(width: 80, height: 14, borderRadius: 3.0),
                      ],
                    ),
                    const SizedBox(height: 20.0),

                    // Divider
                    Container(
                      height: 1.0,
                      color: isDark ? AppColors.borderDark : AppColors.borderLight,
                    ),
                    const SizedBox(height: 20.0),

                    // Specifications Grid Skeleton (2x2)
                    const ShimmerBox(width: 120, height: 16, borderRadius: 4.0),
                    const SizedBox(height: 12.0),
                    Row(
                      children: [
                        Expanded(
                          child: Container(
                            height: 60,
                            padding: const EdgeInsets.all(8.0),
                            decoration: BoxDecoration(
                              color: isDark ? AppColors.mutedDark : AppColors.mutedLight,
                              borderRadius: BorderRadius.circular(8.0),
                            ),
                          ),
                        ),
                        const SizedBox(width: 10.0),
                        Expanded(
                          child: Container(
                            height: 60,
                            padding: const EdgeInsets.all(8.0),
                            decoration: BoxDecoration(
                              color: isDark ? AppColors.mutedDark : AppColors.mutedLight,
                              borderRadius: BorderRadius.circular(8.0),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 20.0),

                    // Description Lines
                    const ShimmerBox(width: 100, height: 16, borderRadius: 4.0),
                    const SizedBox(height: 10.0),
                    const ShimmerBox(width: double.infinity, height: 12, borderRadius: 3.0),
                    const SizedBox(height: 6.0),
                    const ShimmerBox(width: double.infinity, height: 12, borderRadius: 3.0),
                    const SizedBox(height: 6.0),
                    const ShimmerBox(width: 240, height: 12, borderRadius: 3.0),
                    const SizedBox(height: 24.0),

                    // Seller Card Skeleton
                    Container(
                      height: 80,
                      decoration: BoxDecoration(
                        color: isDark ? AppColors.cardDark : AppColors.cardLight,
                        borderRadius: BorderRadius.circular(12.0),
                        border: Border.all(
                          color: isDark ? AppColors.borderDark : AppColors.borderLight,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
      bottomNavigationBar: SafeArea(
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
          decoration: BoxDecoration(
            color: isDark ? AppColors.surfaceDark : AppColors.surfaceLight,
            border: Border(
              top: BorderSide(
                color: isDark ? AppColors.borderDark : AppColors.borderLight,
              ),
            ),
          ),
          child: ShimmerEffect(
            child: Row(
              children: [
                Expanded(
                  child: Container(
                    height: 44,
                    decoration: BoxDecoration(
                      color: isDark ? AppColors.mutedDark : AppColors.mutedLight,
                      borderRadius: BorderRadius.circular(10.0),
                    ),
                  ),
                ),
                const SizedBox(width: 8.0),
                Expanded(
                  child: Container(
                    height: 44,
                    decoration: BoxDecoration(
                      color: isDark ? AppColors.mutedDark : AppColors.mutedLight,
                      borderRadius: BorderRadius.circular(10.0),
                    ),
                  ),
                ),
                const SizedBox(width: 8.0),
                Expanded(
                  child: Container(
                    height: 44,
                    decoration: BoxDecoration(
                      color: isDark ? AppColors.mutedDark : AppColors.mutedLight,
                      borderRadius: BorderRadius.circular(10.0),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

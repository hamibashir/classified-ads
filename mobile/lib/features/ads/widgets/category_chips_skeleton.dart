import 'package:flutter/material.dart';
import '../../../core/widgets/shimmer_box.dart';

/// Skeleton shimmer placeholder matching the horizontal [CategoryChipsBar].
class CategoryChipsSkeleton extends StatelessWidget {
  const CategoryChipsSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 90.0,
      child: ShimmerEffect(
        child: ListView.separated(
          padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
          scrollDirection: Axis.horizontal,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: 6,
          separatorBuilder: (context, index) => const SizedBox(width: 12.0),
          itemBuilder: (context, index) {
            return const SizedBox(
              width: 72.0,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  ShimmerBox(
                    width: 44.0,
                    height: 44.0,
                    shape: BoxShape.circle,
                  ),
                  SizedBox(height: 6.0),
                  ShimmerBox(
                    width: 48.0,
                    height: 10.0,
                    borderRadius: 3.0,
                  ),
                ],
              ),
            );
          },
        ),
      ),
    );
  }
}

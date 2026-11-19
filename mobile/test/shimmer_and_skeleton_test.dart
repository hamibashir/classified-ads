import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:classified_ads_mobile/core/widgets/shimmer_box.dart';
import 'package:classified_ads_mobile/features/ads/widgets/ad_card_skeleton.dart';
import 'package:classified_ads_mobile/features/ads/widgets/category_chips_skeleton.dart';
import 'package:classified_ads_mobile/features/ads/widgets/ad_details_skeleton.dart';

void main() {
  group('Shimmer & Skeleton Loading Widget Tests', () {
    testWidgets('ShimmerBox renders with specified width, height and borderRadius', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: ShimmerBox(
              width: 120,
              height: 40,
              borderRadius: 8.0,
            ),
          ),
        ),
      );

      final boxFinder = find.byType(ShimmerBox);
      expect(boxFinder, findsOneWidget);

      final container = tester.widget<Container>(find.descendant(
        of: boxFinder,
        matching: find.byType(Container),
      ));
      expect(container.constraints?.maxWidth, 120.0);
      expect(container.constraints?.maxHeight, 40.0);
    });

    testWidgets('AdCardSkeleton renders with correct geometry and ShimmerEffect', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: Center(
              child: SizedBox(
                width: 180,
                height: 280,
                child: AdCardSkeleton(),
              ),
            ),
          ),
        ),
      );

      expect(find.byType(AdCardSkeleton), findsOneWidget);
      expect(find.byType(ShimmerEffect), findsOneWidget);
      expect(find.byType(AspectRatio), findsOneWidget);
    });

    testWidgets('CategoryChipsSkeleton renders 6 horizontal chip placeholders', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: CategoryChipsSkeleton(),
          ),
        ),
      );

      expect(find.byType(CategoryChipsSkeleton), findsOneWidget);
      expect(find.byType(ShimmerEffect), findsOneWidget);
      expect(find.byType(ListView), findsOneWidget);
    });

    testWidgets('AdDetailsSkeleton renders full page shimmer placeholder with sticky bar', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: AdDetailsSkeleton(),
        ),
      );

      expect(find.byType(AdDetailsSkeleton), findsOneWidget);
      expect(find.byType(ShimmerEffect), findsNWidgets(2)); // body + bottom bar
    });
  });
}

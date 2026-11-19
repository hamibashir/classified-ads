import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:classified_ads_mobile/core/constants/app_constants.dart';
import 'package:classified_ads_mobile/core/providers/ads_provider.dart';
import 'package:classified_ads_mobile/core/providers/location_provider.dart';
import 'package:classified_ads_mobile/core/theme/app_theme.dart';
import 'package:classified_ads_mobile/features/ads/screens/home_screen.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() {
    SharedPreferences.setMockInitialValues({});
  });

  testWidgets('App smoke test with HomeScreen and Providers', (WidgetTester tester) async {
    final locationProvider = LocationProvider();
    final adsProvider = AdsProvider();

    await tester.pumpWidget(
      MultiProvider(
        providers: [
          ChangeNotifierProvider<LocationProvider>.value(value: locationProvider),
          ChangeNotifierProvider<AdsProvider>.value(value: adsProvider),
        ],
        child: MaterialApp(
          theme: AppTheme.lightTheme,
          home: const HomeScreen(autoLoad: false),
        ),
      ),
    );

    await tester.pump();

    expect(find.text(AppConstants.brandInsignia), findsOneWidget);
    expect(
      find.byWidgetPredicate((w) => w is RichText && w.text.toPlainText().contains('Zaaz')),
      findsWidgets,
    );
    expect(find.byType(TextField), findsOneWidget);
  });
}

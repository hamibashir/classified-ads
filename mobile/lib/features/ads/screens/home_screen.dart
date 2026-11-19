import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/providers/ads_provider.dart';
import '../../../core/providers/location_provider.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../widgets/category_chips_bar.dart';
import '../widgets/city_selector_bottom_sheet.dart';
import '../widgets/mobile_ad_card.dart';
import 'ad_details_screen.dart';

class HomeScreen extends StatefulWidget {
  final Function(String slug)? onAdSelected;
  final bool autoLoad;

  const HomeScreen({
    super.key,
    this.onAdSelected,
    this.autoLoad = true,
  });

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    if (widget.autoLoad) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _loadInitialData();
      });
    }
  }

  void _loadInitialData() {
    final locationProvider = context.read<LocationProvider>();
    final adsProvider = context.read<AdsProvider>();

    adsProvider.fetchCategories();
    adsProvider.fetchAds(location: locationProvider.currentLocation);
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final locationProvider = context.watch<LocationProvider>();
    final adsProvider = context.watch<AdsProvider>();
    final currentLocation = locationProvider.currentLocation;

    return Scaffold(
      backgroundColor: AppColors.backgroundLight,
      appBar: AppBar(
        titleSpacing: 16.0,
        title: Row(
          children: [
            // ZB Monogram Insignia
            Container(
              width: 34.0,
              height: 34.0,
              decoration: BoxDecoration(
                color: AppColors.foregroundLight,
                borderRadius: BorderRadius.circular(10.0),
              ),
              alignment: Alignment.center,
              child: const Text(
                AppConstants.brandInsignia,
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 14.0,
                  fontWeight: FontWeight.w900,
                  letterSpacing: -0.5,
                ),
              ),
            ),
            const SizedBox(width: 10.0),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  RichText(
                    text: const TextSpan(
                      text: 'Zaaz ',
                      style: TextStyle(
                        fontSize: 16.0,
                        fontWeight: FontWeight.w800,
                        color: AppColors.foregroundLight,
                        letterSpacing: -0.3,
                      ),
                      children: [
                        TextSpan(
                          text: 'B',
                          style: TextStyle(
                            color: AppColors.primaryLight,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                      ],
                    ),
                  ),
                  // Location Chip button
                  InkWell(
                    onTap: () => CitySelectorBottomSheet.show(context),
                    borderRadius: BorderRadius.circular(4.0),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(vertical: 1.0),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(
                            Icons.location_on_outlined,
                            size: 13.0,
                            color: AppColors.primaryLight,
                          ),
                          const SizedBox(width: 2.0),
                          Flexible(
                            child: Text(
                              currentLocation.displayName,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(
                                fontSize: 11.5,
                                fontWeight: FontWeight.w600,
                                color: AppColors.primaryLight,
                              ),
                            ),
                          ),
                          const Icon(
                            Icons.arrow_drop_down,
                            size: 15.0,
                            color: AppColors.primaryLight,
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_none_outlined),
            tooltip: 'Notifications',
            onPressed: () {},
          ),
        ],
      ),
      body: RefreshIndicator(
        color: AppColors.primaryLight,
        onRefresh: () async {
          await adsProvider.fetchCategories();
          await adsProvider.fetchAds(
            location: locationProvider.currentLocation,
            refresh: true,
          );
        },
        child: CustomScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          slivers: [
            // Search Bar Header
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16.0, 12.0, 16.0, 4.0),
                child: TextField(
                  controller: _searchController,
                  decoration: InputDecoration(
                    hintText: 'Search cars, mobiles, laptops, flats...',
                    prefixIcon: const Icon(Icons.search, size: 20.0),
                    suffixIcon: _searchController.text.isNotEmpty
                        ? IconButton(
                            icon: const Icon(Icons.clear, size: 18.0),
                            onPressed: () {
                              _searchController.clear();
                              adsProvider.setSearchQuery('', currentLocation);
                            },
                          )
                        : null,
                  ),
                  onSubmitted: (query) {
                    adsProvider.setSearchQuery(query, currentLocation);
                  },
                ),
              ),
            ),

            // Horizontal Categories Bar
            SliverToBoxAdapter(
              child: CategoryChipsBar(
                categories: adsProvider.categories,
                selectedCategoryId: adsProvider.selectedCategoryId,
                onSelectCategory: (catId) {
                  adsProvider.selectCategory(catId, currentLocation);
                },
              ),
            ),

            // Section Heading: "Listings Near You"
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16.0, 12.0, 16.0, 8.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      currentLocation.isGps
                          ? 'Ads Near You'
                          : 'Ads in ${currentLocation.cityName}',
                      style: AppTextStyles.h2,
                    ),
                    if (adsProvider.ads.isNotEmpty)
                      Text(
                        '${adsProvider.ads.length} ads',
                        style: AppTextStyles.caption.copyWith(
                          color: AppColors.mutedForegroundLight,
                        ),
                      ),
                  ],
                ),
              ),
            ),

            // Ads Feed State
            if (adsProvider.isLoadingAds && adsProvider.ads.isEmpty)
              const SliverFillRemaining(
                hasScrollBody: false,
                child: Center(
                  child: CircularProgressIndicator(color: AppColors.primaryLight),
                ),
              )
            else if (adsProvider.errorMessage != null && adsProvider.ads.isEmpty)
              SliverFillRemaining(
                hasScrollBody: false,
                child: Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24.0),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(
                          Icons.cloud_off_outlined,
                          size: 48.0,
                          color: AppColors.mutedForegroundLight,
                        ),
                        const SizedBox(height: 12.0),
                        Text(
                          adsProvider.errorMessage!,
                          textAlign: TextAlign.center,
                          style: AppTextStyles.body,
                        ),
                        const SizedBox(height: 16.0),
                        ElevatedButton(
                          onPressed: () {
                            adsProvider.fetchAds(
                              location: currentLocation,
                              refresh: true,
                            );
                          },
                          child: const Text('Try Again'),
                        ),
                      ],
                    ),
                  ),
                ),
              )
            else if (adsProvider.ads.isEmpty)
              SliverFillRemaining(
                hasScrollBody: false,
                child: Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24.0),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(
                          Icons.search_off_outlined,
                          size: 56.0,
                          color: AppColors.mutedForegroundLight,
                        ),
                        const SizedBox(height: 12.0),
                        const Text(
                          'No ads found in this area',
                          style: AppTextStyles.h2,
                        ),
                        const SizedBox(height: 6.0),
                        const Text(
                          'Try expanding your radius or picking another Pakistani city.',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            color: AppColors.mutedForegroundLight,
                            fontSize: 14.0,
                          ),
                        ),
                        const SizedBox(height: 16.0),
                        OutlinedButton(
                          onPressed: () => CitySelectorBottomSheet.show(context),
                          child: const Text('Change City'),
                        ),
                      ],
                    ),
                  ),
                ),
              )
            else
              // 2-Column Responsive Ad Grid
              SliverPadding(
                padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
                sliver: SliverGrid(
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    mainAxisSpacing: 12.0,
                    crossAxisSpacing: 12.0,
                    childAspectRatio: 0.64,
                  ),
                  delegate: SliverChildBuilderDelegate(
                    (context, index) {
                      final ad = adsProvider.ads[index];
                      return MobileAdCard(
                        ad: ad,
                        onTap: () {
                          if (widget.onAdSelected != null) {
                            widget.onAdSelected!(ad.slug);
                          } else {
                            Navigator.of(context).push(
                              MaterialPageRoute(
                                builder: (_) => AdDetailsScreen(
                                  slug: ad.slug,
                                  initialAd: ad,
                                ),
                              ),
                            );
                          }
                        },
                        onToggleFavorite: () {
                          adsProvider.toggleFavorite(ad.id);
                        },
                      );
                    },
                    childCount: adsProvider.ads.length,
                  ),
                ),
              ),

            const SliverToBoxAdapter(
              child: SizedBox(height: 32.0),
            ),
          ],
        ),
      ),
    );
  }
}

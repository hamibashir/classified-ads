import 'dart:async';
import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/providers/ads_provider.dart';
import '../../../core/providers/location_provider.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../models/user_location.dart';
import '../widgets/ad_card_skeleton.dart';
import '../widgets/category_chips_bar.dart';
import '../widgets/category_chips_skeleton.dart';
import '../widgets/city_selector_bottom_sheet.dart';
import '../widgets/filter_bottom_sheet.dart';
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
  Timer? _debounceTimer;

  void _onSearchChanged(String query, UserLocation currentLocation) {
    _debounceTimer?.cancel();
    _debounceTimer = Timer(const Duration(milliseconds: 350), () {
      if (mounted) {
        context.read<AdsProvider>().setSearchQuery(query, currentLocation);
      }
    });
  }

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
    _debounceTimer?.cancel();
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final locationProvider = context.watch<LocationProvider>();
    final adsProvider = context.watch<AdsProvider>();
    final currentLocation = locationProvider.currentLocation;

    return Scaffold(
      backgroundColor: isDark ? AppColors.backgroundDark : AppColors.backgroundLight,
      appBar: AppBar(
        titleSpacing: 16.0,
        elevation: 0,
        backgroundColor: isDark ? AppColors.surfaceDark : Colors.white,
        title: Row(
          children: [
            // ZB Monogram Insignia with Gradient
            Container(
              width: 36.0,
              height: 36.0,
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF064E3B), Color(0xFF047857)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(10.0),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF064E3B).withValues(alpha: 0.25),
                    blurRadius: 6.0,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              alignment: Alignment.center,
              child: const Text(
                AppConstants.brandInsignia,
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 14.5,
                  fontWeight: FontWeight.w900,
                  letterSpacing: -0.5,
                ),
              ),
            ),
            const SizedBox(width: 10.0),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  RichText(
                    text: TextSpan(
                      text: 'Zaaz ',
                      style: TextStyle(
                        fontSize: 17.0,
                        fontWeight: FontWeight.w800,
                        color: isDark ? AppColors.foregroundDark : AppColors.foregroundLight,
                        letterSpacing: -0.4,
                      ),
                      children: const [
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
                  const Text(
                    'Premier Marketplace',
                    style: TextStyle(
                      fontSize: 10.5,
                      color: AppColors.mutedForegroundLight,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),
            // Location Pill Badge
            InkWell(
              onTap: () {
                HapticFeedback.lightImpact();
                CitySelectorBottomSheet.show(context);
              },
              borderRadius: BorderRadius.circular(20.0),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 10.0, vertical: 5.0),
                decoration: BoxDecoration(
                  color: isDark ? AppColors.mutedDark : AppColors.mutedLight,
                  borderRadius: BorderRadius.circular(20.0),
                  border: Border.all(
                    color: isDark ? AppColors.borderDark : AppColors.borderLight,
                  ),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(
                      Icons.location_on,
                      size: 13.0,
                      color: AppColors.primaryLight,
                    ),
                    const SizedBox(width: 3.0),
                    ConstrainedBox(
                      constraints: const BoxConstraints(maxWidth: 95.0),
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
                      size: 14.0,
                      color: AppColors.primaryLight,
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
      body: RefreshIndicator(
        color: AppColors.primaryLight,
        onRefresh: () async {
          HapticFeedback.lightImpact();
          await adsProvider.fetchCategories();
          await adsProvider.fetchAds(
            location: locationProvider.currentLocation,
            refresh: true,
          );
        },
        child: CustomScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          slivers: [
            // Modern Search & Filter Bar
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16.0, 10.0, 16.0, 4.0),
                child: Row(
                  children: [
                    Expanded(
                      child: Container(
                        decoration: BoxDecoration(
                          color: isDark ? AppColors.surfaceDark : Colors.white,
                          borderRadius: BorderRadius.circular(14.0),
                          border: Border.all(
                            color: isDark ? AppColors.borderDark : AppColors.borderLight,
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.02),
                              blurRadius: 4.0,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: TextField(
                          controller: _searchController,
                          decoration: InputDecoration(
                            hintText: 'Search cars, mobiles, flats...',
                            hintStyle: TextStyle(
                              fontSize: 13.5,
                              color: isDark ? AppColors.mutedForegroundDark : AppColors.mutedForegroundLight,
                            ),
                            prefixIcon: const Icon(Icons.search, size: 20.0, color: AppColors.primaryLight),
                            suffixIcon: _searchController.text.isNotEmpty
                                ? IconButton(
                                    icon: const Icon(Icons.clear, size: 18.0),
                                    onPressed: () {
                                      _searchController.clear();
                                      adsProvider.setSearchQuery('', currentLocation);
                                    },
                                  )
                                : null,
                            border: InputBorder.none,
                            enabledBorder: InputBorder.none,
                            focusedBorder: InputBorder.none,
                            contentPadding: const EdgeInsets.symmetric(horizontal: 14.0, vertical: 12.0),
                          ),
                          onChanged: (val) => _onSearchChanged(val, currentLocation),
                          onSubmitted: (query) {
                            _debounceTimer?.cancel();
                            adsProvider.setSearchQuery(query, currentLocation);
                          },
                        ),
                      ),
                    ),
                    const SizedBox(width: 8.0),
                    // Filter Action Button
                    InkWell(
                      onTap: () {
                        HapticFeedback.lightImpact();
                        FilterBottomSheet.show(context);
                      },
                      borderRadius: BorderRadius.circular(14.0),
                      child: Container(
                        width: 48.0,
                        height: 48.0,
                        decoration: BoxDecoration(
                          color: adsProvider.activeFilterCount > 0
                              ? AppColors.primaryLight
                              : (isDark ? AppColors.surfaceDark : Colors.white),
                          borderRadius: BorderRadius.circular(14.0),
                          border: Border.all(
                            color: adsProvider.activeFilterCount > 0
                                ? AppColors.primaryLight
                                : (isDark ? AppColors.borderDark : AppColors.borderLight),
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.02),
                              blurRadius: 4.0,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: Stack(
                          alignment: Alignment.center,
                          children: [
                            Icon(
                              Icons.tune,
                              size: 21.0,
                              color: adsProvider.activeFilterCount > 0
                                  ? Colors.white
                                  : (isDark ? AppColors.foregroundDark : AppColors.foregroundLight),
                            ),
                            if (adsProvider.activeFilterCount > 0)
                              Positioned(
                                top: 7.0,
                                right: 7.0,
                                child: Container(
                                  width: 8.0,
                                  height: 8.0,
                                  decoration: const BoxDecoration(
                                    color: Color(0xFF34D399),
                                    shape: BoxShape.circle,
                                  ),
                                ),
                              ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // Active Filter Chips (if any filter is applied)
            if (adsProvider.activeFilterCount > 0)
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.only(top: 4.0, bottom: 2.0),
                  child: SizedBox(
                    height: 36.0,
                    child: ListView(
                      scrollDirection: Axis.horizontal,
                      padding: const EdgeInsets.symmetric(horizontal: 16.0),
                      children: [
                        if (adsProvider.minPrice != null || adsProvider.maxPrice != null)
                          _buildActiveChip(
                            label: 'PKR ${adsProvider.minPrice?.toInt() ?? 0} - ${adsProvider.maxPrice?.toInt() ?? 'Any'}',
                            onDeleted: () {
                              adsProvider.applyFilters(
                                minPrice: null,
                                maxPrice: null,
                                condition: adsProvider.condition,
                                sortBy: adsProvider.sortBy,
                                location: currentLocation,
                              );
                            },
                          ),
                        if (adsProvider.condition != null)
                          _buildActiveChip(
                            label: adsProvider.condition!,
                            onDeleted: () {
                              adsProvider.applyFilters(
                                minPrice: adsProvider.minPrice,
                                maxPrice: adsProvider.maxPrice,
                                condition: null,
                                sortBy: adsProvider.sortBy,
                                location: currentLocation,
                              );
                            },
                          ),
                        if (adsProvider.sortBy != 'newest')
                          _buildActiveChip(
                            label: adsProvider.sortBy == 'price_asc' ? 'Low to High' : 'High to Low',
                            onDeleted: () {
                              adsProvider.applyFilters(
                                minPrice: adsProvider.minPrice,
                                maxPrice: adsProvider.maxPrice,
                                condition: adsProvider.condition,
                                sortBy: 'newest',
                                location: currentLocation,
                              );
                            },
                          ),
                        ActionChip(
                          label: const Text('Clear All', style: TextStyle(color: AppColors.destructive, fontSize: 11.5, fontWeight: FontWeight.w600)),
                          onPressed: () {
                            HapticFeedback.lightImpact();
                            adsProvider.resetFilters(currentLocation);
                          },
                        ),
                      ],
                    ),
                  ),
                ),
              ),

            // Horizontal Categories Bar or Skeleton
            SliverToBoxAdapter(
              child: adsProvider.isLoadingCategories && adsProvider.categories.isEmpty
                  ? const CategoryChipsSkeleton()
                  : CategoryChipsBar(
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
                padding: const EdgeInsets.fromLTRB(16.0, 10.0, 16.0, 6.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      currentLocation.isGps
                          ? 'Ads Near You'
                          : currentLocation.isAllPakistan
                              ? 'Fresh Recommendations'
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

            // Ads Feed State: High-Performance Shimmer Grid
            if (adsProvider.isLoadingAds && adsProvider.ads.isEmpty)
              SliverPadding(
                padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
                sliver: SliverGrid(
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    mainAxisSpacing: 12.0,
                    crossAxisSpacing: 12.0,
                    childAspectRatio: 0.78,
                  ),
                  delegate: SliverChildBuilderDelegate(
                    (context, index) => const AdCardSkeleton(),
                    childCount: 4,
                  ),
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
                          'No ads found with these filters',
                          style: AppTextStyles.h2,
                        ),
                        const SizedBox(height: 6.0),
                        const Text(
                          'Try clearing your filters or searching across all of Pakistan.',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            color: AppColors.mutedForegroundLight,
                            fontSize: 13.5,
                          ),
                        ),
                        const SizedBox(height: 16.0),
                        Wrap(
                          alignment: WrapAlignment.center,
                          spacing: 8.0,
                          runSpacing: 8.0,
                          children: [
                            if (adsProvider.activeFilterCount > 0 || adsProvider.selectedCategoryId != null)
                              OutlinedButton(
                                onPressed: () {
                                  HapticFeedback.lightImpact();
                                  adsProvider.selectCategory(null, currentLocation);
                                  adsProvider.resetFilters(currentLocation);
                                },
                                child: const Text('Reset Filters'),
                              ),
                            ElevatedButton(
                              onPressed: () => CitySelectorBottomSheet.show(context),
                              child: const Text('Change City'),
                            ),
                          ],
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
                    childAspectRatio: 0.78,
                  ),
                  delegate: SliverChildBuilderDelegate(
                    (context, index) {
                      final ad = adsProvider.ads[index];
                      return MobileAdCard(
                        key: ValueKey(ad.id),
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
                    childCount: math.min(12, adsProvider.ads.length),
                    findChildIndexCallback: (Key key) {
                      if (key is ValueKey<String>) {
                        final index = adsProvider.ads.indexWhere((ad) => ad.id == key.value);
                        return index >= 0 ? index : null;
                      }
                      return null;
                    },
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

  Widget _buildActiveChip({required String label, required VoidCallback onDeleted}) {
    return Padding(
      padding: const EdgeInsets.only(right: 6.0),
      child: Chip(
        label: Text(label, style: const TextStyle(fontSize: 11.5)),
        deleteIcon: const Icon(Icons.close, size: 14.0),
        onDeleted: () {
          HapticFeedback.lightImpact();
          onDeleted();
        },
        backgroundColor: AppColors.mutedLight,
        side: const BorderSide(color: AppColors.borderLight),
      ),
    );
  }
}

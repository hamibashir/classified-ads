import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/providers/location_provider.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../models/user_location.dart';

class CitySelectorBottomSheet extends StatefulWidget {
  const CitySelectorBottomSheet({super.key});

  static Future<void> show(BuildContext context) {
    return showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => const CitySelectorBottomSheet(),
    );
  }

  @override
  State<CitySelectorBottomSheet> createState() => _CitySelectorBottomSheetState();
}

class _CitySelectorBottomSheetState extends State<CitySelectorBottomSheet> {
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final locationProvider = context.watch<LocationProvider>();
    final currentLoc = locationProvider.currentLocation;

    final filteredCities = CityInfo.pakistaniCities.where((city) {
      if (_searchQuery.isEmpty) return true;
      return city.name.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          city.province.toLowerCase().contains(_searchQuery.toLowerCase());
    }).toList();

    return Container(
      height: MediaQuery.of(context).size.height * 0.75,
      decoration: const BoxDecoration(
        color: AppColors.surfaceLight,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20.0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Drag handle
          Center(
            child: Container(
              margin: const EdgeInsets.only(top: 12.0, bottom: 8.0),
              width: 40.0,
              height: 4.0,
              decoration: BoxDecoration(
                color: AppColors.borderLight,
                borderRadius: BorderRadius.circular(2.0),
              ),
            ),
          ),

          // Header
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 8.0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Select Location',
                  style: AppTextStyles.h2,
                ),
                IconButton(
                  icon: const Icon(Icons.close, size: 22.0),
                  onPressed: () => Navigator.of(context).pop(),
                ),
              ],
            ),
          ),

          // Search bar
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 8.0),
            child: TextField(
              controller: _searchController,
              decoration: const InputDecoration(
                hintText: 'Search Pakistani city...',
                prefixIcon: Icon(Icons.search, size: 20.0),
              ),
              onChanged: (val) {
                setState(() {
                  _searchQuery = val.trim();
                });
              },
            ),
          ),

          // GPS Location Action Button
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 8.0),
            child: InkWell(
              onTap: locationProvider.isLoading
                  ? null
                  : () async {
                      final success = await locationProvider.detectGpsLocation();
                      if (context.mounted) {
                        if (success) {
                          Navigator.of(context).pop();
                        } else {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text(
                                locationProvider.errorMessage ??
                                    'Could not fetch GPS. Please select a city below.',
                              ),
                            ),
                          );
                        }
                      }
                    },
              borderRadius: BorderRadius.circular(10.0),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 14.0),
                decoration: BoxDecoration(
                  border: Border.all(color: AppColors.primaryLight, width: 1.5),
                  borderRadius: BorderRadius.circular(10.0),
                  color: AppColors.primaryLight.withValues(alpha: 0.05),
                ),
                child: Row(
                  children: [
                    if (locationProvider.isLoading)
                      const SizedBox(
                        width: 20.0,
                        height: 20.0,
                        child: CircularProgressIndicator(
                          strokeWidth: 2.0,
                          color: AppColors.primaryLight,
                        ),
                      )
                    else
                      const Icon(Icons.my_location, color: AppColors.primaryLight, size: 20.0),
                    const SizedBox(width: 12.0),
                    const Expanded(
                      child: Text(
                        'Use my current GPS location',
                        style: TextStyle(
                          color: AppColors.primaryLight,
                          fontWeight: FontWeight.w600,
                          fontSize: 14.0,
                        ),
                      ),
                    ),
                    if (currentLoc.isGps)
                      const Icon(Icons.check_circle, color: AppColors.primaryLight, size: 20.0),
                  ],
                ),
              ),
            ),
          ),

          const Divider(height: 16.0),

          // Popular Cities Title
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 20.0, vertical: 6.0),
            child: Text(
              'Cities in Pakistan',
              style: TextStyle(
                color: AppColors.mutedForegroundLight,
                fontSize: 13.0,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),

          // Cities List
          Expanded(
            child: ListView.builder(
              itemCount: filteredCities.length,
              itemBuilder: (context, index) {
                final city = filteredCities[index];
                final isSelected = !currentLoc.isGps && currentLoc.cityName == city.name;

                return ListTile(
                  contentPadding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 2.0),
                  leading: Icon(
                    Icons.location_city,
                    color: isSelected ? AppColors.primaryLight : AppColors.mutedForegroundLight,
                    size: 22.0,
                  ),
                  title: Text(
                    city.name,
                    style: TextStyle(
                      fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
                      color: isSelected ? AppColors.primaryLight : AppColors.foregroundLight,
                    ),
                  ),
                  subtitle: Text(
                    city.province,
                    style: AppTextStyles.caption.copyWith(
                      color: AppColors.mutedForegroundLight,
                    ),
                  ),
                  trailing: isSelected
                      ? const Icon(Icons.check, color: AppColors.primaryLight)
                      : null,
                  onTap: () async {
                    await locationProvider.selectCity(city);
                    if (context.mounted) {
                      Navigator.of(context).pop();
                    }
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

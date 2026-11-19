import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/category_fields.dart';
import '../../../core/providers/ads_provider.dart';
import '../../../core/providers/location_provider.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../models/category_model.dart';

class FilterBottomSheet extends StatefulWidget {
  const FilterBottomSheet({super.key});

  static Future<void> show(BuildContext context) {
    return showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => const FilterBottomSheet(),
    );
  }

  @override
  State<FilterBottomSheet> createState() => _FilterBottomSheetState();
}

class _FilterBottomSheetState extends State<FilterBottomSheet> {
  late final TextEditingController _minPriceController;
  late final TextEditingController _maxPriceController;
  String? _selectedCondition;
  String _selectedSortBy = 'newest';
  String? _selectedCategoryId;
  late Map<String, String> _customFilters;

  @override
  void initState() {
    super.initState();
    final adsProvider = context.read<AdsProvider>();
    _minPriceController = TextEditingController(
      text: adsProvider.minPrice != null && adsProvider.minPrice! > 0
          ? adsProvider.minPrice!.toInt().toString()
          : '',
    );
    _maxPriceController = TextEditingController(
      text: adsProvider.maxPrice != null && adsProvider.maxPrice! > 0
          ? adsProvider.maxPrice!.toInt().toString()
          : '',
    );
    _selectedCondition = adsProvider.condition;
    _selectedSortBy = adsProvider.sortBy;
    _selectedCategoryId = adsProvider.selectedCategoryId;
    _customFilters = Map<String, String>.from(adsProvider.customFilters);
  }

  @override
  void dispose() {
    _minPriceController.dispose();
    _maxPriceController.dispose();
    super.dispose();
  }

  void _applyQuickPrice(double? min, double? max) {
    HapticFeedback.lightImpact();
    setState(() {
      _minPriceController.text = min != null ? min.toInt().toString() : '';
      _maxPriceController.text = max != null ? max.toInt().toString() : '';
    });
  }

  CategoryModel? _getSelectedCategory(List<CategoryModel> categories) {
    if (_selectedCategoryId == null) return null;
    try {
      return categories.firstWhere((c) => c.id == _selectedCategoryId);
    } catch (_) {
      return null;
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final adsProvider = context.watch<AdsProvider>();
    final locationProvider = context.read<LocationProvider>();
    final activeCat = _getSelectedCategory(adsProvider.categories);
    final customFields = CategoryFieldsRegistry.getFilterableFieldsForCategory(activeCat?.slug);

    final totalActiveFilters = (_minPriceController.text.isNotEmpty ? 1 : 0) +
        (_maxPriceController.text.isNotEmpty ? 1 : 0) +
        (_selectedCondition != null ? 1 : 0) +
        (_selectedSortBy != 'newest' ? 1 : 0) +
        (_selectedCategoryId != null ? 1 : 0) +
        _customFilters.length;

    return Container(
      height: MediaQuery.of(context).size.height * 0.90,
      decoration: BoxDecoration(
        color: isDark ? AppColors.surfaceDark : AppColors.surfaceLight,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24.0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Drag handle
          Center(
            child: Container(
              margin: const EdgeInsets.only(top: 12.0, bottom: 8.0),
              width: 44.0,
              height: 4.5,
              decoration: BoxDecoration(
                color: isDark ? AppColors.borderDark : AppColors.borderLight,
                borderRadius: BorderRadius.circular(3.0),
              ),
            ),
          ),

          // Header: "Filters" + Reset Action
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 8.0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    const Text('Filters & Specifications', style: AppTextStyles.h2),
                    if (totalActiveFilters > 0) ...[
                      const SizedBox(width: 8.0),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8.0, vertical: 2.0),
                        decoration: BoxDecoration(
                          color: AppColors.primaryLight,
                          borderRadius: BorderRadius.circular(12.0),
                        ),
                        child: Text(
                          '$totalActiveFilters',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 12.0,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
                TextButton(
                  onPressed: () {
                    HapticFeedback.lightImpact();
                    _minPriceController.clear();
                    _maxPriceController.clear();
                    setState(() {
                      _selectedCondition = null;
                      _selectedSortBy = 'newest';
                      _selectedCategoryId = null;
                      _customFilters.clear();
                    });
                    adsProvider.resetFilters(locationProvider.currentLocation);
                    Navigator.of(context).pop();
                  },
                  child: const Text(
                    'Reset All',
                    style: TextStyle(
                      color: AppColors.destructive,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
          ),

          const Divider(height: 1.0),

          // Scrollable Filter Sections
          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(20.0),
              children: [
                // 1. Category Selector (Auto-updates dynamic specifications below)
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Category', style: AppTextStyles.h3),
                    if (_selectedCategoryId != null)
                      TextButton(
                        onPressed: () {
                          HapticFeedback.lightImpact();
                          setState(() {
                            _selectedCategoryId = null;
                            _customFilters.clear();
                          });
                        },
                        child: const Text('Clear', style: TextStyle(fontSize: 13.0)),
                      ),
                  ],
                ),
                const SizedBox(height: 8.0),
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      ChoiceChip(
                        label: const Text('All Categories'),
                        selected: _selectedCategoryId == null,
                        onSelected: (val) {
                          if (val) {
                            HapticFeedback.lightImpact();
                            setState(() {
                              _selectedCategoryId = null;
                              _customFilters.clear();
                            });
                          }
                        },
                      ),
                      const SizedBox(width: 8.0),
                      ...adsProvider.categories.map((cat) {
                        final isSelected = _selectedCategoryId == cat.id;
                        return Padding(
                          padding: const EdgeInsets.only(right: 8.0),
                          child: ChoiceChip(
                            label: Text(cat.name),
                            selected: isSelected,
                            onSelected: (val) {
                              HapticFeedback.lightImpact();
                              setState(() {
                                _selectedCategoryId = val ? cat.id : null;
                                _customFilters.clear();
                              });
                            },
                          ),
                        );
                      }),
                    ],
                  ),
                ),

                const SizedBox(height: 20.0),

                // 2. Dynamic Custom Fields for Selected Category (Auto-updates)
                if (customFields.isNotEmpty) ...[
                  Container(
                    padding: const EdgeInsets.all(16.0),
                    decoration: BoxDecoration(
                      color: isDark ? AppColors.cardDark : const Color(0xFFF1F5F9),
                      borderRadius: BorderRadius.circular(16.0),
                      border: Border.all(
                        color: isDark ? AppColors.borderDark : const Color(0xFFE2E8F0),
                      ),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.tune, size: 18.0, color: AppColors.primaryLight),
                            const SizedBox(width: 8.0),
                            Text(
                              '${activeCat?.name ?? ''} Specifications',
                              style: AppTextStyles.bodyMedium.copyWith(
                                fontWeight: FontWeight.w700,
                                color: isDark ? AppColors.primaryDark : AppColors.primaryLight,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 14.0),
                        ...customFields.map((field) {
                          final currentValue = _customFilters[field.key];
                          return Padding(
                            padding: const EdgeInsets.only(bottom: 14.0),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Icon(field.icon, size: 15.0, color: AppColors.mutedForegroundLight),
                                    const SizedBox(width: 6.0),
                                    Text(
                                      field.label,
                                      style: AppTextStyles.caption.copyWith(
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                    if (currentValue != null) ...[
                                      const Spacer(),
                                      GestureDetector(
                                        onTap: () {
                                          setState(() => _customFilters.remove(field.key));
                                        },
                                        child: const Text(
                                          'Clear',
                                          style: TextStyle(
                                            fontSize: 12.0,
                                            color: AppColors.destructive,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ],
                                ),
                                const SizedBox(height: 8.0),
                                SingleChildScrollView(
                                  scrollDirection: Axis.horizontal,
                                  child: Row(
                                    children: field.options.map((opt) {
                                      final isSelected = currentValue == opt;
                                      return Padding(
                                        padding: const EdgeInsets.only(right: 6.0),
                                        child: ChoiceChip(
                                          label: Text(opt, style: const TextStyle(fontSize: 12.5)),
                                          selected: isSelected,
                                          onSelected: (selected) {
                                            HapticFeedback.lightImpact();
                                            setState(() {
                                              if (selected) {
                                                _customFilters[field.key] = opt;
                                              } else {
                                                _customFilters.remove(field.key);
                                              }
                                            });
                                          },
                                        ),
                                      );
                                    }).toList(),
                                  ),
                                ),
                              ],
                            ),
                          );
                        }),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24.0),
                ],

                // 3. Price Range (PKR) Section
                const Text('Price Range (PKR)', style: AppTextStyles.h3),
                const SizedBox(height: 12.0),
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _minPriceController,
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(
                          labelText: 'Min Price',
                          prefixText: 'PKR ',
                          hintText: '0',
                        ),
                      ),
                    ),
                    const Padding(
                      padding: EdgeInsets.symmetric(horizontal: 12.0),
                      child: Text('—', style: TextStyle(color: AppColors.mutedForegroundLight)),
                    ),
                    Expanded(
                      child: TextField(
                        controller: _maxPriceController,
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(
                          labelText: 'Max Price',
                          prefixText: 'PKR ',
                          hintText: 'Any',
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12.0),

                // Quick Budget Pills
                Wrap(
                  spacing: 6.0,
                  runSpacing: 6.0,
                  children: [
                    _buildQuickBudgetPill('Under 50K', null, 50000),
                    _buildQuickBudgetPill('50K - 200K', 50000, 200000),
                    _buildQuickBudgetPill('200K - 1M', 200000, 1000000),
                    _buildQuickBudgetPill('1M+', 1000000, null),
                  ],
                ),

                const SizedBox(height: 24.0),

                // 4. Condition Section
                const Text('Item Condition', style: AppTextStyles.h3),
                const SizedBox(height: 10.0),
                Wrap(
                  spacing: 8.0,
                  runSpacing: 8.0,
                  children: [
                    _buildConditionChip('All Conditions', null),
                    _buildConditionChip('Brand New', 'NEW'),
                    _buildConditionChip('Like New', 'LIKE_NEW'),
                    _buildConditionChip('Used (Good)', 'USED_GOOD'),
                    _buildConditionChip('Used (Fair)', 'USED_FAIR'),
                  ],
                ),

                const SizedBox(height: 24.0),

                // 5. Sort By Section
                const Text('Sort Listings', style: AppTextStyles.h3),
                const SizedBox(height: 10.0),
                Wrap(
                  spacing: 8.0,
                  runSpacing: 8.0,
                  children: [
                    _buildSortChip('Newest First', 'newest'),
                    _buildSortChip('Price: Low to High', 'price_asc'),
                    _buildSortChip('Price: High to Low', 'price_desc'),
                  ],
                ),

                const SizedBox(height: 24.0),
              ],
            ),
          ),

          // Floating Apply Action Button
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20.0, 8.0, 20.0, 16.0),
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primaryLight,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16.0),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14.0),
                  ),
                ),
                onPressed: () {
                  HapticFeedback.lightImpact();
                  final min = double.tryParse(_minPriceController.text.trim());
                  final max = double.tryParse(_maxPriceController.text.trim());

                  adsProvider.applyFilters(
                    minPrice: min,
                    maxPrice: max,
                    condition: _selectedCondition,
                    sortBy: _selectedSortBy,
                    categoryId: _selectedCategoryId,
                    customFilters: _customFilters,
                    location: locationProvider.currentLocation,
                  );

                  Navigator.of(context).pop();
                },
                child: Text(
                  totalActiveFilters > 0
                      ? 'Apply Filters ($totalActiveFilters)'
                      : 'Apply Filters',
                  style: const TextStyle(fontSize: 16.0, fontWeight: FontWeight.w700),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSortChip(String label, String value) {
    final isSelected = _selectedSortBy == value;
    return ChoiceChip(
      label: Text(label),
      selected: isSelected,
      onSelected: (val) {
        if (val) {
          HapticFeedback.lightImpact();
          setState(() => _selectedSortBy = value);
        }
      },
    );
  }

  Widget _buildConditionChip(String label, String? value) {
    final isSelected = _selectedCondition == value;
    return ChoiceChip(
      label: Text(label),
      selected: isSelected,
      onSelected: (val) {
        HapticFeedback.lightImpact();
        setState(() => _selectedCondition = value);
      },
    );
  }

  Widget _buildQuickBudgetPill(String label, double? min, double? max) {
    return ActionChip(
      label: Text(label, style: const TextStyle(fontSize: 12.0)),
      onPressed: () => _applyQuickPrice(min, max),
      backgroundColor: AppColors.mutedLight,
      side: const BorderSide(color: AppColors.borderLight),
    );
  }
}

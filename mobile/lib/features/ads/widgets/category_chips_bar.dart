import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../models/category_model.dart';
import '../../../core/theme/app_colors.dart';

class CategoryChipsBar extends StatelessWidget {
  final List<CategoryModel> categories;
  final String? selectedCategoryId;
  final Function(String? categoryId) onSelectCategory;

  const CategoryChipsBar({
    super.key,
    required this.categories,
    required this.selectedCategoryId,
    required this.onSelectCategory,
  });

  IconData _getCategoryIcon(String? iconName, String categoryName) {
    final lower = categoryName.toLowerCase();
    if (lower.contains('bike') || lower.contains('cycle')) {
      return Icons.two_wheeler_outlined;
    } else if (lower.contains('motor') || lower.contains('car') || lower.contains('vehicle')) {
      return Icons.directions_car_filled_outlined;
    } else if (lower.contains('mobile') || lower.contains('phone')) {
      return Icons.phone_android_outlined;
    } else if (lower.contains('electronic') || lower.contains('appliance')) {
      return Icons.laptop_chromebook_outlined;
    } else if (lower.contains('property') || lower.contains('house') || lower.contains('plot')) {
      return Icons.home_work_outlined;
    } else if (lower.contains('job')) {
      return Icons.work_outline;
    } else if (lower.contains('fashion') || lower.contains('cloth')) {
      return Icons.checkroom_outlined;
    } else if (lower.contains('service')) {
      return Icons.handyman_outlined;
    } else if (lower.contains('furniture') || lower.contains('sofa') || lower.contains('bed')) {
      return Icons.chair_outlined;
    } else if (lower.contains('animal') || lower.contains('pet') || lower.contains('dog') || lower.contains('cat')) {
      return Icons.pets_outlined;
    } else if (lower.contains('hobby') || lower.contains('sport') || lower.contains('book')) {
      return Icons.sports_tennis_outlined;
    } else if (lower.contains('kid') || lower.contains('baby') || lower.contains('toy')) {
      return Icons.child_care_outlined;
    }
    return Icons.category_outlined;
  }

  // Pre-seeded fallback categories in case server takes a moment
  static const List<Map<String, dynamic>> _fallbackCategories = [
    {'name': 'Motors', 'icon': 'car'},
    {'name': 'Mobiles', 'icon': 'smartphone'},
    {'name': 'Electronics', 'icon': 'tv'},
    {'name': 'Property', 'icon': 'home'},
    {'name': 'Bikes', 'icon': 'bike'},
    {'name': 'Jobs', 'icon': 'briefcase'},
    {'name': 'Services', 'icon': 'wrench'},
    {'name': 'Fashion', 'icon': 'shirt'},
    {'name': 'Furniture', 'icon': 'armchair'},
    {'name': 'Animals', 'icon': 'dog'},
    {'name': 'Hobbies', 'icon': 'book-open'},
    {'name': 'Kids', 'icon': 'baby'},
  ];

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    // Resolve active category if one has children
    CategoryModel? activeCategory;
    if (selectedCategoryId != null) {
      for (final cat in categories) {
        if (cat.id == selectedCategoryId) {
          activeCategory = cat;
          break;
        }
        for (final child in cat.children) {
          if (child.id == selectedCategoryId) {
            activeCategory = cat;
            break;
          }
        }
      }
    }

    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Primary Category Icons Row
        SizedBox(
          height: 94.0,
          child: ListView.separated(
            padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 6.0),
            scrollDirection: Axis.horizontal,
            itemCount: categories.isNotEmpty ? categories.length + 1 : _fallbackCategories.length + 1,
            separatorBuilder: (context, index) => const SizedBox(width: 14.0),
            itemBuilder: (context, index) {
              if (index == 0) {
                final isAllSelected = selectedCategoryId == null;
                return _CategoryItem(
                  title: 'All',
                  icon: Icons.grid_view_rounded,
                  isSelected: isAllSelected,
                  isDark: isDark,
                  onTap: () => onSelectCategory(null),
                );
              }

              if (categories.isNotEmpty) {
                final category = categories[index - 1];
                final isSelected = selectedCategoryId == category.id ||
                    category.children.any((c) => c.id == selectedCategoryId);
                return _CategoryItem(
                  title: category.name,
                  icon: _getCategoryIcon(category.icon, category.name),
                  isSelected: isSelected,
                  isDark: isDark,
                  adCount: category.adsCount,
                  onTap: () => onSelectCategory(category.id),
                );
              } else {
                final fallback = _fallbackCategories[index - 1];
                return _CategoryItem(
                  title: fallback['name'],
                  icon: _getCategoryIcon(fallback['icon'], fallback['name']),
                  isSelected: false,
                  isDark: isDark,
                  onTap: () {},
                );
              }
            },
          ),
        ),

        // Subcategory Pills Row (if active category has subcategories)
        if (activeCategory != null && activeCategory.children.isNotEmpty) ...[
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 2.0),
            child: SizedBox(
              height: 36.0,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                physics: const BouncingScrollPhysics(),
                itemCount: activeCategory.children.length + 1,
                separatorBuilder: (context, index) => const SizedBox(width: 8.0),
                itemBuilder: (context, index) {
                  if (index == 0) {
                    final isParentSelected = selectedCategoryId == activeCategory!.id;
                    return ChoiceChip(
                      label: Text('All ${activeCategory.name}'),
                      selected: isParentSelected,
                      labelStyle: TextStyle(
                        fontSize: 12.0,
                        fontWeight: FontWeight.w600,
                        color: isParentSelected ? Colors.white : (isDark ? AppColors.foregroundDark : AppColors.foregroundLight),
                      ),
                      selectedColor: AppColors.primaryLight,
                      onSelected: (val) {
                        HapticFeedback.lightImpact();
                        onSelectCategory(activeCategory!.id);
                      },
                    );
                  }

                  final subcat = activeCategory!.children[index - 1];
                  final isSubcatSelected = selectedCategoryId == subcat.id;
                  return ChoiceChip(
                    label: Text(subcat.name),
                    selected: isSubcatSelected,
                    labelStyle: TextStyle(
                      fontSize: 12.0,
                      fontWeight: isSubcatSelected ? FontWeight.w600 : FontWeight.w500,
                      color: isSubcatSelected ? Colors.white : (isDark ? AppColors.foregroundDark : AppColors.foregroundLight),
                    ),
                    selectedColor: AppColors.primaryLight,
                    onSelected: (val) {
                      HapticFeedback.lightImpact();
                      onSelectCategory(subcat.id);
                    },
                  );
                },
              ),
            ),
          ),
          const SizedBox(height: 6.0),
        ],
      ],
    );
  }
}

class _CategoryItem extends StatelessWidget {
  final String title;
  final IconData icon;
  final bool isSelected;
  final bool isDark;
  final int adCount;
  final VoidCallback onTap;

  const _CategoryItem({
    required this.title,
    required this.icon,
    required this.isSelected,
    required this.isDark,
    this.adCount = 0,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () {
        HapticFeedback.lightImpact();
        onTap();
      },
      borderRadius: BorderRadius.circular(16.0),
      child: Container(
        width: 74.0,
        padding: const EdgeInsets.symmetric(vertical: 4.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 50.0,
              height: 50.0,
              decoration: BoxDecoration(
                gradient: isSelected
                    ? const LinearGradient(
                        colors: [Color(0xFF064E3B), Color(0xFF047857)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      )
                    : null,
                color: isSelected
                    ? null
                    : (isDark ? AppColors.mutedDark : AppColors.mutedLight),
                shape: BoxShape.circle,
                border: Border.all(
                  color: isSelected
                      ? const Color(0xFF34D399)
                      : (isDark ? AppColors.borderDark : AppColors.borderLight),
                  width: isSelected ? 2.0 : 1.0,
                ),
                boxShadow: isSelected
                    ? [
                        BoxShadow(
                          color: AppColors.primaryLight.withValues(alpha: 0.3),
                          blurRadius: 8.0,
                          offset: const Offset(0, 3),
                        ),
                      ]
                    : null,
              ),
              child: Icon(
                icon,
                size: 24.0,
                color: isSelected
                    ? Colors.white
                    : (isDark ? AppColors.foregroundDark : AppColors.foregroundLight),
              ),
            ),
            const SizedBox(height: 6.0),
            Text(
              title,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 11.5,
                fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                color: isSelected
                    ? AppColors.primaryLight
                    : (isDark ? AppColors.foregroundDark : AppColors.foregroundLight),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

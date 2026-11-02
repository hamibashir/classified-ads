import 'package:flutter/material.dart';
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
    if (lower.contains('motor') || lower.contains('car') || lower.contains('vehicle')) {
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
    }
    return Icons.category_outlined;
  }

  @override
  Widget build(BuildContext context) {
    if (categories.isEmpty) {
      return const SizedBox.shrink();
    }

    return SizedBox(
      height: 90.0,
      child: ListView.separated(
        padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
        scrollDirection: Axis.horizontal,
        itemCount: categories.length + 1, // +1 for "All" option
        separatorBuilder: (context, index) => const SizedBox(width: 12.0),
        itemBuilder: (context, index) {
          if (index == 0) {
            final isAllSelected = selectedCategoryId == null;
            return _CategoryItem(
              title: 'All',
              icon: Icons.grid_view_rounded,
              isSelected: isAllSelected,
              onTap: () => onSelectCategory(null),
            );
          }

          final category = categories[index - 1];
          final isSelected = selectedCategoryId == category.id;
          return _CategoryItem(
            title: category.name,
            icon: _getCategoryIcon(category.icon, category.name),
            isSelected: isSelected,
            onTap: () => onSelectCategory(category.id),
          );
        },
      ),
    );
  }
}

class _CategoryItem extends StatelessWidget {
  final String title;
  final IconData icon;
  final bool isSelected;
  final VoidCallback onTap;

  const _CategoryItem({
    required this.title,
    required this.icon,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12.0),
      child: Container(
        width: 72.0,
        padding: const EdgeInsets.symmetric(vertical: 6.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 44.0,
              height: 44.0,
              decoration: BoxDecoration(
                color: isSelected
                    ? AppColors.primaryLight
                    : AppColors.mutedLight,
                shape: BoxShape.circle,
                border: Border.all(
                  color: isSelected
                      ? AppColors.primaryLight
                      : AppColors.borderLight,
                  width: 1.0,
                ),
              ),
              child: Icon(
                icon,
                size: 22.0,
                color: isSelected
                    ? Colors.white
                    : AppColors.foregroundLight,
              ),
            ),
            const SizedBox(height: 6.0),
            Text(
              title,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 11.0,
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                color: isSelected
                    ? AppColors.primaryLight
                    : AppColors.foregroundLight,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

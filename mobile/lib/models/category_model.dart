class CategoryModel {
  final String id;
  final String name;
  final String slug;
  final String? icon;
  final int order;
  final String? parentId;
  final List<CategoryModel> children;
  final int adsCount;

  const CategoryModel({
    required this.id,
    required this.name,
    required this.slug,
    this.icon,
    this.order = 0,
    this.parentId,
    this.children = const [],
    this.adsCount = 0,
  });

  factory CategoryModel.fromJson(Map<String, dynamic> json) {
    return CategoryModel(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      slug: json['slug']?.toString() ?? '',
      icon: json['icon']?.toString(),
      order: (json['order'] as num?)?.toInt() ?? 0,
      parentId: json['parentId']?.toString(),
      children: json['children'] is List
          ? (json['children'] as List)
              .map((c) => CategoryModel.fromJson(c as Map<String, dynamic>))
              .toList()
          : const [],
      adsCount: (json['adCount'] as num?)?.toInt() ??
          (json['_count'] is Map && json['_count']['ads'] is num
              ? (json['_count']['ads'] as num).toInt()
              : 0),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'slug': slug,
      'icon': icon,
      'order': order,
      if (parentId != null) 'parentId': parentId,
      'children': children.map((c) => c.toJson()).toList(),
      '_count': {'ads': adsCount},
    };
  }
}

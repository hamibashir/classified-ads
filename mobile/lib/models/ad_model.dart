import 'package:intl/intl.dart';

class AdSeller {
  final String id;
  final String name;
  final String? phone;
  final String? avatarUrl;
  final bool isPhoneVerified;
  final DateTime? memberSince;

  const AdSeller({
    required this.id,
    required this.name,
    this.phone,
    this.avatarUrl,
    this.isPhoneVerified = false,
    this.memberSince,
  });

  factory AdSeller.fromJson(Map<String, dynamic> json) {
    return AdSeller(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? 'Seller',
      phone: json['phone']?.toString(),
      avatarUrl: json['avatarUrl']?.toString(),
      isPhoneVerified: json['isPhoneVerified'] == true,
      memberSince: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'].toString())
          : null,
    );
  }
}

class AdCategoryRef {
  final String id;
  final String name;
  final String slug;

  const AdCategoryRef({
    required this.id,
    required this.name,
    required this.slug,
  });

  factory AdCategoryRef.fromJson(Map<String, dynamic> json) {
    return AdCategoryRef(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      slug: json['slug']?.toString() ?? '',
    );
  }
}

class AdModel {
  final String id;
  final String userId;
  final String categoryId;
  final String title;
  final String slug;
  final String description;
  final double price;
  final String currency;
  final bool isNegotiable;
  final String condition;
  final String status;
  final String locationCity;
  final String locationState;
  final String? locationAddress;
  final double? latitude;
  final double? longitude;
  final bool showPhone;
  final bool allowWhatsapp;
  final int viewsCount;
  final bool isFeatured;
  final double? distance;
  final List<String> images;
  final AdSeller? seller;
  final AdCategoryRef? category;
  final DateTime createdAt;
  final bool isFavorite;

  const AdModel({
    required this.id,
    required this.userId,
    required this.categoryId,
    required this.title,
    required this.slug,
    required this.description,
    required this.price,
    this.currency = 'PKR',
    this.isNegotiable = false,
    this.condition = 'USED_GOOD',
    this.status = 'ACTIVE',
    required this.locationCity,
    this.locationState = 'Punjab',
    this.locationAddress,
    this.latitude,
    this.longitude,
    this.showPhone = true,
    this.allowWhatsapp = true,
    this.viewsCount = 0,
    this.isFeatured = false,
    this.distance,
    this.images = const [],
    this.seller,
    this.category,
    required this.createdAt,
    this.isFavorite = false,
  });

  String get formattedPrice {
    final formatter = NumberFormat('#,##,###', 'en_US');
    return 'Rs ${formatter.format(price.toInt())}';
  }

  String get primaryImageUrl {
    if (images.isNotEmpty) {
      return images.first;
    }
    return '';
  }

  String get formattedDistance {
    if (distance == null) return '';
    if (distance! < 1.0) {
      return '${(distance! * 1000).toInt()} m away';
    }
    return '${distance!.toStringAsFixed(1)} km away';
  }

  String get conditionLabel {
    switch (condition) {
      case 'NEW':
        return 'Brand New';
      case 'LIKE_NEW':
        return 'Like New';
      case 'USED_GOOD':
        return 'Used (Good)';
      case 'USED_FAIR':
        return 'Used (Fair)';
      default:
        return 'Used';
    }
  }

  AdModel copyWith({
    bool? isFavorite,
    String? status,
  }) {
    return AdModel(
      id: id,
      userId: userId,
      categoryId: categoryId,
      title: title,
      slug: slug,
      description: description,
      price: price,
      currency: currency,
      isNegotiable: isNegotiable,
      condition: condition,
      status: status ?? this.status,
      locationCity: locationCity,
      locationState: locationState,
      locationAddress: locationAddress,
      latitude: latitude,
      longitude: longitude,
      showPhone: showPhone,
      allowWhatsapp: allowWhatsapp,
      viewsCount: viewsCount,
      isFeatured: isFeatured,
      distance: distance,
      images: images,
      seller: seller,
      category: category,
      createdAt: createdAt,
      isFavorite: isFavorite ?? this.isFavorite,
    );
  }

  factory AdModel.fromJson(Map<String, dynamic> json) {
    // Process images (either strings or [{ url: '...' }])
    final rawImages = json['images'];
    final imageList = <String>[];
    if (rawImages is List) {
      for (final img in rawImages) {
        if (img is String) {
          imageList.add(img);
        } else if (img is Map && img['url'] != null) {
          imageList.add(img['url'].toString());
        }
      }
    }

    final rawPrice = json['price'];
    double parsedPrice = 0.0;
    if (rawPrice is num) {
      parsedPrice = rawPrice.toDouble();
    } else if (rawPrice is String) {
      parsedPrice = double.tryParse(rawPrice) ?? 0.0;
    }

    double? parsedDistance;
    final rawDistance = json['distance'];
    if (rawDistance is num) {
      parsedDistance = rawDistance.toDouble();
    } else if (rawDistance is String) {
      parsedDistance = double.tryParse(rawDistance);
    }

    return AdModel(
      id: json['id']?.toString() ?? '',
      userId: json['userId']?.toString() ?? '',
      categoryId: json['categoryId']?.toString() ?? '',
      title: json['title']?.toString() ?? '',
      slug: json['slug']?.toString() ?? '',
      description: json['description']?.toString() ?? '',
      price: parsedPrice,
      currency: json['currency']?.toString() ?? 'PKR',
      isNegotiable: json['isNegotiable'] == true,
      condition: json['condition']?.toString() ?? 'USED_GOOD',
      status: json['status']?.toString() ?? 'ACTIVE',
      locationCity: json['locationCity']?.toString() ?? '',
      locationState: json['locationState']?.toString() ?? 'Punjab',
      locationAddress: json['locationAddress']?.toString(),
      latitude: (json['latitude'] as num?)?.toDouble(),
      longitude: (json['longitude'] as num?)?.toDouble(),
      showPhone: json['showPhone'] != false,
      allowWhatsapp: json['allowWhatsapp'] != false,
      viewsCount: (json['viewsCount'] as num?)?.toInt() ?? 0,
      isFeatured: json['isFeatured'] == true,
      distance: parsedDistance,
      images: imageList,
      seller: json['user'] is Map<String, dynamic>
          ? AdSeller.fromJson(json['user'] as Map<String, dynamic>)
          : null,
      category: json['category'] is Map<String, dynamic>
          ? AdCategoryRef.fromJson(json['category'] as Map<String, dynamic>)
          : null,
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'].toString()) ?? DateTime.now()
          : DateTime.now(),
      isFavorite: json['isFavorite'] == true,
    );
  }
}

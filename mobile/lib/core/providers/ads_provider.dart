import 'package:flutter/material.dart';
import '../../models/ad_model.dart';
import '../../models/category_model.dart';
import '../../models/user_location.dart';
import '../network/api_client.dart';
import '../constants/api_constants.dart';

class AdsProvider extends ChangeNotifier {
  final ApiClient _apiClient;

  List<CategoryModel> _categories = [];
  List<AdModel> _ads = [];
  String? _selectedCategoryId;
  String _searchQuery = '';
  double? _minPrice;
  double? _maxPrice;
  String? _condition; // 'NEW', 'LIKE_NEW', 'USED_GOOD', 'USED_FAIR'
  String _sortBy = 'newest'; // 'newest', 'price_asc', 'price_desc'
  Map<String, String> _customFilters = {};
  bool _isLoadingAds = false;
  bool _isLoadingCategories = false;
  String? _errorMessage;

  AdsProvider({ApiClient? apiClient}) : _apiClient = apiClient ?? ApiClient();

  List<CategoryModel> get categories => _categories;
  List<AdModel> get ads => _ads;
  String? get selectedCategoryId => _selectedCategoryId;
  String get searchQuery => _searchQuery;
  double? get minPrice => _minPrice;
  double? get maxPrice => _maxPrice;
  String? get condition => _condition;
  String get sortBy => _sortBy;
  Map<String, String> get customFilters => _customFilters;
  bool get isLoadingAds => _isLoadingAds;
  bool get isLoadingCategories => _isLoadingCategories;
  String? get errorMessage => _errorMessage;

  int get activeFilterCount {
    int count = 0;
    if (_minPrice != null && _minPrice! > 0) count++;
    if (_maxPrice != null && _maxPrice! > 0) count++;
    if (_condition != null && _condition!.isNotEmpty) count++;
    if (_sortBy != 'newest') count++;
    count += _customFilters.length;
    return count;
  }

  Future<void> fetchCategories() async {
    _isLoadingCategories = true;
    notifyListeners();

    final response = await _apiClient.get<List<CategoryModel>>(
      ApiConstants.categories,
      fromJsonT: (data) {
        if (data is Map && data['categories'] is List) {
          return (data['categories'] as List)
              .map((c) => CategoryModel.fromJson(c as Map<String, dynamic>))
              .toList();
        } else if (data is List) {
          return data
              .map((c) => CategoryModel.fromJson(c as Map<String, dynamic>))
              .toList();
        }
        return <CategoryModel>[];
      },
    );

    if (response.success && response.data != null) {
      _categories = response.data!;
    }
    _isLoadingCategories = false;
    notifyListeners();
  }

  Future<void> fetchAds({
    required UserLocation location,
    bool refresh = false,
  }) async {
    _isLoadingAds = true;
    _errorMessage = null;
    if (refresh) {
      _ads = [];
    }
    notifyListeners();

    final queryParams = <String, dynamic>{
      'limit': 24,
    };

    if (location.isGps) {
      queryParams['lat'] = location.latitude;
      queryParams['lng'] = location.longitude;
      queryParams['radius'] = 50; // 50km radius
    } else if (!location.isAllPakistan) {
      queryParams['city'] = location.cityName;
    }

    if (_selectedCategoryId != null && _selectedCategoryId!.isNotEmpty) {
      queryParams['category'] = _selectedCategoryId;
    }

    if (_searchQuery.isNotEmpty) {
      queryParams['search'] = _searchQuery;
    }

    if (_minPrice != null && _minPrice! > 0) {
      queryParams['minPrice'] = _minPrice;
    }

    if (_maxPrice != null && _maxPrice! > 0) {
      queryParams['maxPrice'] = _maxPrice;
    }

    if (_condition != null && _condition!.isNotEmpty) {
      queryParams['condition'] = _condition;
    }

    if (_sortBy.isNotEmpty) {
      queryParams['sortBy'] = _sortBy;
    }

    final response = await _apiClient.get<List<AdModel>>(
      ApiConstants.ads,
      queryParameters: queryParams,
      fromJsonT: (data) {
        if (data is Map && data['ads'] is List) {
          return (data['ads'] as List)
              .map((a) => AdModel.fromJson(a as Map<String, dynamic>))
              .toList();
        } else if (data is List) {
          return data
              .map((a) => AdModel.fromJson(a as Map<String, dynamic>))
              .toList();
        }
        return <AdModel>[];
      },
    );

    if (response.success && response.data != null) {
      List<AdModel> fetched = response.data!;
      if (_customFilters.isNotEmpty) {
        fetched = fetched.where((ad) {
          for (final entry in _customFilters.entries) {
            final filterKey = entry.key.toLowerCase();
            final filterVal = entry.value.toLowerCase();
            bool matched = false;
            for (final spec in ad.customFields.entries) {
              if (spec.key.toLowerCase().contains(filterKey) || filterKey.contains(spec.key.toLowerCase())) {
                if (spec.value.toLowerCase() == filterVal || spec.value.toLowerCase().contains(filterVal)) {
                  matched = true;
                  break;
                }
              }
            }
            if (!matched) {
              if (ad.title.toLowerCase().contains(filterVal) || ad.description.toLowerCase().contains(filterVal)) {
                matched = true;
              }
            }
            if (!matched) return false;
          }
          return true;
        }).toList();
      }
      _ads = fetched;
      _errorMessage = null;
    } else {
      _errorMessage = response.error?.message ?? 'Failed to load ads.';
    }

    _isLoadingAds = false;
    notifyListeners();
  }

  void selectCategory(String? categoryId, UserLocation location) {
    if (_selectedCategoryId == categoryId) {
      _selectedCategoryId = null; // Toggle off / back to All
    } else {
      _selectedCategoryId = categoryId;
    }
    _customFilters.clear();
    fetchAds(location: location, refresh: true);
  }

  void setSearchQuery(String query, UserLocation location) {
    _searchQuery = query.trim().replaceAll(RegExp(r'\s+'), ' ');
    fetchAds(location: location, refresh: true);
  }

  void applyFilters({
    double? minPrice,
    double? maxPrice,
    String? condition,
    String? sortBy,
    String? categoryId,
    Map<String, String>? customFilters,
    required UserLocation location,
  }) {
    _minPrice = minPrice;
    _maxPrice = maxPrice;
    _condition = condition;
    if (sortBy != null) _sortBy = sortBy;
    if (categoryId != null) _selectedCategoryId = categoryId;
    if (customFilters != null) _customFilters = Map.from(customFilters);
    fetchAds(location: location, refresh: true);
  }

  void resetFilters(UserLocation location) {
    _minPrice = null;
    _maxPrice = null;
    _condition = null;
    _sortBy = 'newest';
    _customFilters.clear();
    fetchAds(location: location, refresh: true);
  }

  void toggleFavorite(String adId) {
    final index = _ads.indexWhere((ad) => ad.id == adId);
    if (index != -1) {
      final current = _ads[index];
      _ads[index] = current.copyWith(isFavorite: !current.isFavorite);
      notifyListeners();
    }
  }
}

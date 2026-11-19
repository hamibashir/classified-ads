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
  bool _isLoadingAds = false;
  bool _isLoadingCategories = false;
  String? _errorMessage;

  AdsProvider({ApiClient? apiClient}) : _apiClient = apiClient ?? ApiClient();

  List<CategoryModel> get categories => _categories;
  List<AdModel> get ads => _ads;
  String? get selectedCategoryId => _selectedCategoryId;
  String get searchQuery => _searchQuery;
  bool get isLoadingAds => _isLoadingAds;
  bool get isLoadingCategories => _isLoadingCategories;
  String? get errorMessage => _errorMessage;

  Future<void> fetchCategories() async {
    _isLoadingCategories = true;
    notifyListeners();

    final response = await _apiClient.get<List<CategoryModel>>(
      ApiConstants.categories,
      fromJsonT: (data) {
        if (data is List) {
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
      'limit': 20,
    };

    if (location.isGps) {
      queryParams['lat'] = location.latitude;
      queryParams['lng'] = location.longitude;
      queryParams['radius'] = 50; // 50km radius
    } else {
      queryParams['city'] = location.cityName;
    }

    if (_selectedCategoryId != null && _selectedCategoryId!.isNotEmpty) {
      queryParams['category'] = _selectedCategoryId;
    }

    if (_searchQuery.isNotEmpty) {
      queryParams['search'] = _searchQuery;
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
      _ads = response.data!;
      _errorMessage = null;
    } else {
      _errorMessage = response.error?.message ?? 'Failed to load ads.';
    }

    _isLoadingAds = false;
    notifyListeners();
  }

  void selectCategory(String? categoryId, UserLocation location) {
    if (_selectedCategoryId == categoryId) {
      _selectedCategoryId = null; // Unselect / toggle back to All
    } else {
      _selectedCategoryId = categoryId;
    }
    fetchAds(location: location, refresh: true);
  }

  void setSearchQuery(String query, UserLocation location) {
    _searchQuery = query.trim().replaceAll(RegExp(r'\s+'), ' ');
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

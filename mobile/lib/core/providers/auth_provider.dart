import 'package:flutter/material.dart';
import '../../models/user_model.dart';
import '../network/api_client.dart';
import '../storage/token_storage.dart';
import '../constants/api_constants.dart';

class AuthProvider extends ChangeNotifier {
  final ApiClient _apiClient;
  final TokenStorage _tokenStorage;

  UserModel? _user;
  bool _isLoading = false;
  String? _errorMessage;

  AuthProvider({ApiClient? apiClient, TokenStorage? tokenStorage})
      : _apiClient = apiClient ?? ApiClient(),
        _tokenStorage = tokenStorage ?? TokenStorage();

  UserModel? get user => _user;
  bool get isAuthenticated => _user != null;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  Future<void> checkAuthStatus() async {
    final hasToken = await _tokenStorage.hasAccessToken();
    if (!hasToken) {
      _user = null;
      notifyListeners();
      return;
    }

    _isLoading = true;
    notifyListeners();

    final response = await _apiClient.get<UserModel>(
      ApiConstants.me,
      fromJsonT: (data) {
        if (data is Map<String, dynamic>) {
          if (data['user'] is Map<String, dynamic>) {
            return UserModel.fromJson(data['user'] as Map<String, dynamic>);
          }
          return UserModel.fromJson(data);
        }
        throw Exception('Invalid user format');
      },
    );

    if (response.success && response.data != null) {
      _user = response.data;
      _errorMessage = null;
    } else {
      _user = null;
      await _tokenStorage.clearTokens();
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<bool> login({
    required String email,
    required String password,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    final response = await _apiClient.post<Map<String, dynamic>>(
      ApiConstants.login,
      data: {
        'email': email.trim(),
        'password': password,
      },
      fromJsonT: (data) => data as Map<String, dynamic>,
    );

    if (response.success && response.data != null) {
      final data = response.data!;
      final tokens = data['tokens'] is Map ? data['tokens'] as Map<String, dynamic> : null;
      final accessToken = (tokens?['accessToken'] ?? data['accessToken'])?.toString();
      final refreshToken = (tokens?['refreshToken'] ?? data['refreshToken'])?.toString();
      final userData = (data['user'] is Map ? data['user'] : data) as Map<String, dynamic>?;

      if (accessToken != null && accessToken.isNotEmpty && userData != null) {
        await _tokenStorage.saveTokens(
          accessToken: accessToken,
          refreshToken: refreshToken ?? '',
        );
        _user = UserModel.fromJson(userData);
        _isLoading = false;
        _errorMessage = null;
        notifyListeners();
        return true;
      }
    }

    _errorMessage = response.error?.message ?? 'Login failed. Please check your credentials.';
    _isLoading = false;
    notifyListeners();
    return false;
  }

  Future<bool> register({
    required String name,
    required String email,
    required String password,
    String? phone,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    final payload = <String, dynamic>{
      'name': name.trim(),
      'email': email.trim(),
      'password': password,
    };
    if (phone != null && phone.trim().isNotEmpty) {
      payload['phone'] = phone.trim();
    }

    final response = await _apiClient.post<Map<String, dynamic>>(
      ApiConstants.register,
      data: payload,
      fromJsonT: (data) => data as Map<String, dynamic>,
    );

    if (response.success && response.data != null) {
      final data = response.data!;
      final tokens = data['tokens'] is Map ? data['tokens'] as Map<String, dynamic> : null;
      final accessToken = (tokens?['accessToken'] ?? data['accessToken'])?.toString();
      final refreshToken = (tokens?['refreshToken'] ?? data['refreshToken'])?.toString();
      final userData = (data['user'] is Map ? data['user'] : data) as Map<String, dynamic>?;

      if (accessToken != null && accessToken.isNotEmpty && userData != null) {
        await _tokenStorage.saveTokens(
          accessToken: accessToken,
          refreshToken: refreshToken ?? '',
        );
        _user = UserModel.fromJson(userData);
        _isLoading = false;
        _errorMessage = null;
        notifyListeners();
        return true;
      }
    }

    _errorMessage = response.error?.message ?? 'Registration failed. Please check inputs.';
    _isLoading = false;
    notifyListeners();
    return false;
  }

  Future<void> logout() async {
    await _tokenStorage.clearTokens();
    _user = null;
    notifyListeners();
  }
}

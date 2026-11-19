import 'dart:io';
import 'package:dio/dio.dart';
import '../constants/api_constants.dart';
import '../storage/token_storage.dart';
import '../../models/api_response.dart';

class ApiClient {
  final Dio _dio;
  final TokenStorage _tokenStorage;
  bool _isRefreshing = false;

  ApiClient({
    Dio? dio,
    TokenStorage? tokenStorage,
    String? baseUrl,
  })  : _tokenStorage = tokenStorage ?? TokenStorage(),
        _dio = dio ??
            Dio(
              BaseOptions(
                baseUrl: baseUrl ?? ApiConstants.baseUrl,
                connectTimeout: const Duration(seconds: 15),
                receiveTimeout: const Duration(seconds: 15),
                headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json',
                },
              ),
            ) {
    _dio.interceptors.add(
      QueuedInterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await _tokenStorage.getAccessToken();
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
        onError: (DioException error, handler) async {
          final requestOptions = error.requestOptions;
          final isAuthPath = requestOptions.path.contains('/auth/login') ||
              requestOptions.path.contains('/auth/register') ||
              requestOptions.path.contains('/auth/refresh');

          if (error.response?.statusCode == 401 && !isAuthPath && !_isRefreshing) {
            _isRefreshing = true;
            try {
              final refreshToken = await _tokenStorage.getRefreshToken();
              if (refreshToken != null && refreshToken.isNotEmpty) {
                // Standalone dio to refresh without triggering interceptor loop
                final refreshDio = Dio(
                  BaseOptions(
                    baseUrl: _dio.options.baseUrl,
                    headers: {'Content-Type': 'application/json'},
                  ),
                );

                final response = await refreshDio.post(
                  ApiConstants.refresh,
                  data: {'refreshToken': refreshToken},
                );

                if (response.statusCode == 200 && response.data != null) {
                  final data = response.data['data'] as Map<String, dynamic>?;
                  final newAccessToken = data?['accessToken']?.toString();
                  final newRefreshToken = data?['refreshToken']?.toString();

                  if (newAccessToken != null) {
                    await _tokenStorage.saveTokens(
                      accessToken: newAccessToken,
                      refreshToken: newRefreshToken ?? refreshToken,
                    );

                    requestOptions.headers['Authorization'] = 'Bearer $newAccessToken';
                    final retryResponse = await _dio.fetch(requestOptions);
                    _isRefreshing = false;
                    return handler.resolve(retryResponse);
                  }
                }
              }
            } catch (_) {
              await _tokenStorage.clearTokens();
            } finally {
              _isRefreshing = false;
            }
          }
          return handler.next(error);
        },
      ),
    );
  }

  Dio get rawDio => _dio;
  TokenStorage get tokenStorage => _tokenStorage;

  Future<ApiResponse<T>> get<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
    Options? options,
    T Function(dynamic data)? fromJsonT,
  }) async {
    try {
      final response = await _dio.get(
        path,
        queryParameters: queryParameters,
        options: options,
      );
      return _parseResponse<T>(response, fromJsonT);
    } on DioException catch (e) {
      return _handleDioError<T>(e);
    } catch (e) {
      return ApiResponse.failure(
        code: 'CLIENT_ERROR',
        message: e.toString(),
      );
    }
  }

  Future<ApiResponse<T>> post<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    T Function(dynamic data)? fromJsonT,
  }) async {
    try {
      final response = await _dio.post(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
      );
      return _parseResponse<T>(response, fromJsonT);
    } on DioException catch (e) {
      return _handleDioError<T>(e);
    } catch (e) {
      return ApiResponse.failure(
        code: 'CLIENT_ERROR',
        message: e.toString(),
      );
    }
  }

  Future<ApiResponse<T>> put<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    T Function(dynamic data)? fromJsonT,
  }) async {
    try {
      final response = await _dio.put(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
      );
      return _parseResponse<T>(response, fromJsonT);
    } on DioException catch (e) {
      return _handleDioError<T>(e);
    } catch (e) {
      return ApiResponse.failure(
        code: 'CLIENT_ERROR',
        message: e.toString(),
      );
    }
  }

  Future<ApiResponse<T>> patch<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    T Function(dynamic data)? fromJsonT,
  }) async {
    try {
      final response = await _dio.patch(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
      );
      return _parseResponse<T>(response, fromJsonT);
    } on DioException catch (e) {
      return _handleDioError<T>(e);
    } catch (e) {
      return ApiResponse.failure(
        code: 'CLIENT_ERROR',
        message: e.toString(),
      );
    }
  }

  Future<ApiResponse<T>> delete<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    T Function(dynamic data)? fromJsonT,
  }) async {
    try {
      final response = await _dio.delete(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
      );
      return _parseResponse<T>(response, fromJsonT);
    } on DioException catch (e) {
      return _handleDioError<T>(e);
    } catch (e) {
      return ApiResponse.failure(
        code: 'CLIENT_ERROR',
        message: e.toString(),
      );
    }
  }

  Future<ApiResponse<List<String>>> uploadImages(
    List<File> imageFiles, {
    ProgressCallback? onSendProgress,
  }) async {
    try {
      final formData = FormData();
      for (final file in imageFiles) {
        formData.files.add(
          MapEntry(
            'images',
            await MultipartFile.fromFile(
              file.path,
              filename: file.path.split(RegExp(r'[\\/]')).last,
            ),
          ),
        );
      }

      final response = await _dio.post(
        ApiConstants.upload,
        data: formData,
        onSendProgress: onSendProgress,
        options: Options(
          contentType: 'multipart/form-data',
        ),
      );

      return _parseResponse<List<String>>(response, (data) {
        if (data is List) {
          return data.map((item) => item.toString()).toList();
        }
        return <String>[];
      });
    } on DioException catch (e) {
      return _handleDioError<List<String>>(e);
    } catch (e) {
      return ApiResponse.failure(
        code: 'UPLOAD_FAILED',
        message: e.toString(),
      );
    }
  }

  ApiResponse<T> _parseResponse<T>(
    Response response,
    T Function(dynamic data)? fromJsonT,
  ) {
    if (response.data is Map<String, dynamic>) {
      return ApiResponse<T>.fromJson(
        response.data as Map<String, dynamic>,
        fromJsonT,
      );
    }
    return ApiResponse<T>(
      success: true,
      data: response.data as T?,
    );
  }

  ApiResponse<T> _handleDioError<T>(DioException error) {
    if (error.response?.data is Map<String, dynamic>) {
      final json = error.response!.data as Map<String, dynamic>;
      return ApiResponse<T>.fromJson(json, null);
    }

    String code = 'NETWORK_ERROR';
    String message = 'Unable to connect to server. Please check your connection.';

    if (error.type == DioExceptionType.connectionTimeout ||
        error.type == DioExceptionType.receiveTimeout) {
      code = 'TIMEOUT';
      message = 'Connection timed out. Please try again.';
    } else if (error.response != null) {
      code = 'HTTP_${error.response?.statusCode ?? 500}';
      message = error.response?.statusMessage ?? 'Server error';
    }

    return ApiResponse.failure(
      code: code,
      message: message,
      details: error.error?.toString(),
    );
  }
}

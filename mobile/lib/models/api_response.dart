class ApiError {
  final String code;
  final String message;
  final dynamic details;

  ApiError({
    required this.code,
    required this.message,
    this.details,
  });

  factory ApiError.fromJson(Map<String, dynamic> json) {
    return ApiError(
      code: json['code']?.toString() ?? 'UNKNOWN_ERROR',
      message: json['message']?.toString() ?? 'An unexpected error occurred',
      details: json['details'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'code': code,
      'message': message,
      if (details != null) 'details': details,
    };
  }
}

class ApiResponse<T> {
  final bool success;
  final T? data;
  final String? message;
  final ApiError? error;

  ApiResponse({
    required this.success,
    this.data,
    this.message,
    this.error,
  });

  factory ApiResponse.fromJson(
    Map<String, dynamic> json,
    T Function(dynamic data)? fromJsonT,
  ) {
    final success = json['success'] == true;
    T? parsedData;
    if (success && json['data'] != null && fromJsonT != null) {
      parsedData = fromJsonT(json['data']);
    } else if (success && json['data'] != null) {
      parsedData = json['data'] as T?;
    }

    ApiError? apiError;
    if (!success && json['error'] != null) {
      if (json['error'] is Map<String, dynamic>) {
        apiError = ApiError.fromJson(json['error'] as Map<String, dynamic>);
      } else if (json['error'] is String) {
        apiError = ApiError(
          code: 'ERROR',
          message: json['error'] as String,
        );
      }
    }

    return ApiResponse<T>(
      success: success,
      data: parsedData,
      message: json['message']?.toString(),
      error: apiError,
    );
  }

  factory ApiResponse.failure({
    required String code,
    required String message,
    dynamic details,
  }) {
    return ApiResponse<T>(
      success: false,
      error: ApiError(
        code: code,
        message: message,
        details: details,
      ),
    );
  }
}

class UserModel {
  final String id;
  final String email;
  final String name;
  final String? phone;
  final String? avatarUrl;
  final String role;
  final bool isPhoneVerified;
  final bool isBanned;
  final DateTime? createdAt;

  const UserModel({
    required this.id,
    required this.email,
    required this.name,
    this.phone,
    this.avatarUrl,
    this.role = 'USER',
    this.isPhoneVerified = false,
    this.isBanned = false,
    this.createdAt,
  });

  bool get isAdmin => role == 'ADMIN';

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id']?.toString() ?? '',
      email: json['email']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      phone: json['phone']?.toString(),
      avatarUrl: json['avatarUrl']?.toString(),
      role: json['role']?.toString() ?? 'USER',
      isPhoneVerified: json['isPhoneVerified'] == true,
      isBanned: json['isBanned'] == true,
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'].toString())
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'name': name,
      'phone': phone,
      'avatarUrl': avatarUrl,
      'role': role,
      'isPhoneVerified': isPhoneVerified,
      'isBanned': isBanned,
      if (createdAt != null) 'createdAt': createdAt!.toIso8601String(),
    };
  }
}

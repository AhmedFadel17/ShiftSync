// lib/data/models/user_model.dart

enum UserRole { user, admin }

class UserModel {
  final String id;
  final String fullName;
  final String email;
  final String userName;
  final UserRole role;
  final bool isActive;
  final DateTime createdAt;

  const UserModel({
    required this.id,
    required this.fullName,
    required this.email,
    required this.userName,
    required this.role,
    required this.isActive,
    required this.createdAt,
  });

  String get firstName => fullName.split(' ').first;
  String get initials {
    final parts = fullName.trim().split(' ');
    if (parts.length >= 2) return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    return fullName.isNotEmpty ? fullName[0].toUpperCase() : 'U';
  }

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] as String? ?? '',
      fullName: json['fullName'] as String? ?? 'Unknown',
      email: json['email'] as String? ?? '',
      userName: json['userName'] as String? ?? '',
      role: (json['role'] as int? ?? 1) == 2 ? UserRole.admin : UserRole.user,
      isActive: json['isActive'] as bool? ?? true,
      createdAt: DateTime.tryParse(json['createdAt'] as String? ?? '') ?? DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'fullName': fullName,
    'email': email,
    'userName': userName,
    'role': role == UserRole.admin ? 2 : 1,
    'isActive': isActive,
    'createdAt': createdAt.toIso8601String(),
  };

  // Mock for demo
  static UserModel get mock => UserModel(
    id: 'emp-001',
    fullName: 'Alex Rivera',
    email: 'alex.rivera@shiftsync.io',
    userName: 'alex.rivera',
    role: UserRole.user,
    isActive: true,
    createdAt: DateTime(2024, 1, 15),
  );
}

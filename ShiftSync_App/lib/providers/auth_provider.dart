// lib/providers/auth_provider.dart
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:shiftsync_app/core/constants/api_constants.dart';
import 'package:shiftsync_app/data/models/user_model.dart';

class AuthProvider extends ChangeNotifier {
  UserModel? _user;
  String? _token;
  bool _isLoading = false;
  String? _error;

  UserModel? get user => _user;
  String? get token => _token;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isAuthenticated => _token != null && _user != null;

  // Set to false for live API JWT authentication
  static const bool _useMockAuth = false;

  AuthProvider() {
    _initAuth();
  }

  Future<void> _initAuth() async {
    if (_useMockAuth) {
      _user = UserModel.mock;
      _token = 'mock-dev-token';
      notifyListeners();
      return;
    }

    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString('auth_token');
    final userJson = prefs.getString('user_data');
    if (_token != null && userJson != null) {
      try {
        _user = UserModel.fromJson(
          jsonDecode(userJson) as Map<String, dynamic>,
        );
      } catch (_) {
        await logout();
      }
    }
    notifyListeners();
  }

  Future<bool> login(String email, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await http
          .post(
            Uri.parse('${ApiConstants.baseUrl}${ApiConstants.login}'),
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode({'email': email, 'password': password}),
          )
          .timeout(const Duration(seconds: 15));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body) as Map<String, dynamic>;
        final authData = data['data'] as Map<String, dynamic>? ?? data;
        _token = authData['token'] as String?;
        _user = UserModel(
          id: authData['userId'] as String? ?? '',
          fullName: authData['fullName'] as String? ?? '',
          email: authData['email'] as String? ?? email,
          userName: email.split('@').first,
          role: (authData['role'] as String?) == 'Admin'
              ? UserRole.admin
              : UserRole.user,
          isActive: true,
          createdAt: DateTime.now(),
        );

        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('auth_token', _token ?? '');
        await prefs.setString('user_data', jsonEncode(_user!.toJson()));

        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        final body = jsonDecode(response.body) as Map<String, dynamic>?;
        _error = body?['message'] as String? ??
            'Invalid credentials. Please try again.';
        _isLoading = false;
        notifyListeners();
        return false;
      }
    } catch (e) {
      _error = 'Unable to connect to ShiftSync API (${ApiConstants.baseUrl}). Please ensure backend is running.';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    _token = null;
    _user = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
    await prefs.remove('user_data');
    notifyListeners();
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}

// lib/data/services/api_service.dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shiftsync_app/core/constants/api_constants.dart';
import 'package:shiftsync_app/data/models/attendance_model.dart';
import 'package:shiftsync_app/data/models/break_model.dart';
import 'package:shiftsync_app/data/models/user_shift_model.dart';

class ApiService {
  final String? token;
  const ApiService({this.token});

  Map<String, String> get _headers => {
    'Content-Type': 'application/json',
    if (token != null && token!.isNotEmpty) 'Authorization': 'Bearer $token',
  };

  // ── Shifts & Schedule ───────────────────────────────────────────────────────
  Future<List<UserShiftModel>> getUserShifts(String userId) async {
    try {
      final uri = Uri.parse('${ApiConstants.baseUrl}${ApiConstants.userShifts}?userId=$userId&pageSize=50');
      final res = await http.get(uri, headers: _headers).timeout(const Duration(seconds: 10));
      if (res.statusCode == 200) {
        final decoded = jsonDecode(res.body) as Map<String, dynamic>;
        final data = decoded['data'] ?? decoded;
        final items = (data is Map && data.containsKey('items')) ? data['items'] as List : (data as List);
        return items.map((e) => UserShiftModel.fromJson(e as Map<String, dynamic>)).toList();
      }
    } catch (_) {}
    return [];
  }

  // ── Attendances ────────────────────────────────────────────────────────────
  Future<List<AttendanceModel>> getAttendances(String userId) async {
    try {
      final uri = Uri.parse('${ApiConstants.baseUrl}${ApiConstants.attendances}?userId=$userId&pageSize=50');
      final res = await http.get(uri, headers: _headers).timeout(const Duration(seconds: 10));
      if (res.statusCode == 200) {
        final decoded = jsonDecode(res.body) as Map<String, dynamic>;
        final data = decoded['data'] ?? decoded;
        final items = (data is Map && data.containsKey('items')) ? data['items'] as List : (data as List);
        return items.map((e) => AttendanceModel.fromJson(e as Map<String, dynamic>)).toList();
      }
    } catch (_) {}
    return [];
  }

  Future<AttendanceModel?> checkIn({
    required int userShiftId,
    required double latitude,
    required double longitude,
  }) async {
    try {
      final uri = Uri.parse('${ApiConstants.baseUrl}${ApiConstants.attendances}/check-in');
      final res = await http
          .post(
            uri,
            headers: _headers,
            body: jsonEncode({
              'userShiftId': userShiftId,
              'latitude': latitude,
              'longitude': longitude,
            }),
          )
          .timeout(const Duration(seconds: 12));

      if (res.statusCode == 200 || res.statusCode == 201) {
        final decoded = jsonDecode(res.body) as Map<String, dynamic>;
        final data = decoded['data'] as Map<String, dynamic>? ?? decoded;
        return AttendanceModel.fromJson(data);
      }
    } catch (_) {}
    return null;
  }

  Future<AttendanceModel?> checkOut({
    required int attendanceId,
    required double latitude,
    required double longitude,
  }) async {
    try {
      final uri = Uri.parse('${ApiConstants.baseUrl}${ApiConstants.attendances}/$attendanceId/check-out');
      final res = await http
          .put(
            uri,
            headers: _headers,
            body: jsonEncode({
              'latitude': latitude,
              'longitude': longitude,
            }),
          )
          .timeout(const Duration(seconds: 12));

      if (res.statusCode == 200) {
        final decoded = jsonDecode(res.body) as Map<String, dynamic>;
        final data = decoded['data'] as Map<String, dynamic>? ?? decoded;
        return AttendanceModel.fromJson(data);
      }
    } catch (_) {}
    return null;
  }

  // ── Break Types ────────────────────────────────────────────────────────────
  Future<List<BreakTypeModel>> getBreakTypes() async {
    try {
      final uri = Uri.parse('${ApiConstants.baseUrl}${ApiConstants.breakTypes}?pageSize=50');
      final res = await http.get(uri, headers: _headers).timeout(const Duration(seconds: 10));
      if (res.statusCode == 200) {
        final decoded = jsonDecode(res.body) as Map<String, dynamic>;
        final data = decoded['data'] ?? decoded;
        final items = (data is Map && data.containsKey('items')) ? data['items'] as List : (data as List);
        return items.map((e) => BreakTypeModel.fromJson(e as Map<String, dynamic>)).toList();
      }
    } catch (_) {}
    return BreakTypeModel.defaultTypes;
  }

  // ── Attendance Breaks ──────────────────────────────────────────────────────
  Future<List<AttendanceBreakModel>> getAttendanceBreaks(int attendanceId) async {
    try {
      final uri = Uri.parse('${ApiConstants.baseUrl}${ApiConstants.attendanceBreaks}?attendanceId=$attendanceId&pageSize=50');
      final res = await http.get(uri, headers: _headers).timeout(const Duration(seconds: 10));
      if (res.statusCode == 200) {
        final decoded = jsonDecode(res.body) as Map<String, dynamic>;
        final data = decoded['data'] ?? decoded;
        final items = (data is Map && data.containsKey('items')) ? data['items'] as List : (data as List);
        return items.map((e) => AttendanceBreakModel.fromJson(e as Map<String, dynamic>)).toList();
      }
    } catch (_) {}
    return [];
  }

  Future<AttendanceBreakModel?> requestBreak({
    required int attendanceId,
    required int breakTypeId,
    String? note,
  }) async {
    try {
      final uri = Uri.parse('${ApiConstants.baseUrl}${ApiConstants.attendanceBreaks}/request');
      final res = await http
          .post(
            uri,
            headers: _headers,
            body: jsonEncode({
              'attendanceId': attendanceId,
              'breakTypeId': breakTypeId,
              'note': note,
            }),
          )
          .timeout(const Duration(seconds: 12));

      if (res.statusCode == 200 || res.statusCode == 201) {
        final decoded = jsonDecode(res.body) as Map<String, dynamic>;
        final data = decoded['data'] as Map<String, dynamic>? ?? decoded;
        return AttendanceBreakModel.fromJson(data);
      }
    } catch (_) {}
    return null;
  }

  Future<AttendanceBreakModel?> endBreak(int breakId) async {
    try {
      final uri = Uri.parse('${ApiConstants.baseUrl}${ApiConstants.attendanceBreaks}/$breakId/end');
      final res = await http.post(uri, headers: _headers).timeout(const Duration(seconds: 12));
      if (res.statusCode == 200) {
        final decoded = jsonDecode(res.body) as Map<String, dynamic>;
        final data = decoded['data'] as Map<String, dynamic>? ?? decoded;
        return AttendanceBreakModel.fromJson(data);
      }
    } catch (_) {}
    return null;
  }
}

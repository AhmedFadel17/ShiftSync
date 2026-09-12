// lib/data/models/attendance_model.dart
import 'package:intl/intl.dart';

class AttendanceModel {
  final int id;
  final String userId;
  final int userShiftId;
  final DateTime checkInTime;
  final double? checkInLatitude;
  final double? checkInLongitude;
  final DateTime? checkOutTime;
  final double? checkOutLatitude;
  final double? checkOutLongitude;
  final String? userFullName;
  final String? shiftName;

  const AttendanceModel({
    required this.id,
    required this.userId,
    required this.userShiftId,
    required this.checkInTime,
    this.checkInLatitude,
    this.checkInLongitude,
    this.checkOutTime,
    this.checkOutLatitude,
    this.checkOutLongitude,
    this.userFullName,
    this.shiftName,
  });

  bool get isOngoing => checkOutTime == null;

  Duration? get duration {
    if (checkOutTime == null) {
      return DateTime.now().difference(checkInTime);
    }
    return checkOutTime!.difference(checkInTime);
  }

  double get hoursWorked {
    final d = duration;
    if (d == null) return 0;
    return d.inMinutes / 60.0;
  }

  String get formattedCheckIn =>
      DateFormat('hh:mm a').format(checkInTime);

  String get formattedCheckOut =>
      checkOutTime != null ? DateFormat('hh:mm a').format(checkOutTime!) : '--:-- --';

  String get formattedDate => DateFormat('EEE, MMM d').format(checkInTime);

  String get elapsedDisplay {
    final d = duration ?? Duration.zero;
    final h = d.inHours.toString().padLeft(2, '0');
    final m = (d.inMinutes % 60).toString().padLeft(2, '0');
    return '${h}h ${m}m';
  }

  factory AttendanceModel.fromJson(Map<String, dynamic> json) {
    return AttendanceModel(
      id: json['id'] as int? ?? 0,
      userId: json['userId'] as String? ?? '',
      userShiftId: json['userShiftId'] as int? ?? 0,
      checkInTime: DateTime.tryParse(json['checkInTime'] as String? ?? '') ?? DateTime.now(),
      checkInLatitude: (json['checkInLatitude'] as num?)?.toDouble(),
      checkInLongitude: (json['checkInLongitude'] as num?)?.toDouble(),
      checkOutTime: json['checkOutTime'] != null
          ? DateTime.tryParse(json['checkOutTime'] as String)
          : null,
      checkOutLatitude: (json['checkOutLatitude'] as num?)?.toDouble(),
      checkOutLongitude: (json['checkOutLongitude'] as num?)?.toDouble(),
      userFullName: json['userFullName'] as String?,
      shiftName: json['shiftName'] as String?,
    );
  }

  // Mock completed attendance records
  static List<AttendanceModel> get mockHistory {
    final now = DateTime.now();
    return [
      AttendanceModel(
        id: 10, userId: 'emp-001', userShiftId: 1,
        checkInTime: now.subtract(const Duration(days: 1, hours: 8)),
        checkOutTime: now.subtract(const Duration(days: 1)),
        shiftName: 'Morning Care',
      ),
      AttendanceModel(
        id: 9, userId: 'emp-001', userShiftId: 1,
        checkInTime: now.subtract(const Duration(days: 2, hours: 8)),
        checkOutTime: now.subtract(const Duration(days: 2)),
        shiftName: 'Morning Care',
      ),
      AttendanceModel(
        id: 8, userId: 'emp-001', userShiftId: 2,
        checkInTime: now.subtract(const Duration(days: 3, hours: 18)),
        checkOutTime: now.subtract(const Duration(days: 3, hours: 10)),
        shiftName: 'Evening Round',
      ),
      AttendanceModel(
        id: 7, userId: 'emp-001', userShiftId: 1,
        checkInTime: now.subtract(const Duration(days: 4, hours: 8)),
        checkOutTime: now.subtract(const Duration(days: 4)),
        shiftName: 'Morning Care',
      ),
      AttendanceModel(
        id: 6, userId: 'emp-001', userShiftId: 1,
        checkInTime: now.subtract(const Duration(days: 5, hours: 8)),
        checkOutTime: now.subtract(const Duration(days: 5)),
        shiftName: 'Morning Care',
      ),
    ];
  }
}

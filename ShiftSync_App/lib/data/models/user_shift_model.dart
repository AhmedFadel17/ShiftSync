// lib/data/models/user_shift_model.dart
import 'package:shiftsync_app/data/models/shift_model.dart';
import 'package:shiftsync_app/data/models/user_model.dart';
import 'package:intl/intl.dart';

enum UserShiftStatus { scheduled, pendingSwap, confirmed }

class UserShiftModel {
  final int id;
  final String userId;
  final int shiftId;
  final DateTime date;
  final UserModel? user;
  final ShiftModel? shift;
  UserShiftStatus status;

  UserShiftModel({
    required this.id,
    required this.userId,
    required this.shiftId,
    required this.date,
    this.user,
    this.shift,
    this.status = UserShiftStatus.scheduled,
  });

  String get formattedDate => DateFormat('EEE, MMM d, yyyy').format(date);
  String get shortDate => DateFormat('MMM d').format(date);
  bool get isToday {
    final now = DateTime.now();
    return date.year == now.year && date.month == now.month && date.day == now.day;
  }
  bool get isFuture => date.isAfter(DateTime.now());
  bool get isPast => date.isBefore(DateTime(DateTime.now().year, DateTime.now().month, DateTime.now().day));

  factory UserShiftModel.fromJson(Map<String, dynamic> json) {
    return UserShiftModel(
      id: json['id'] as int? ?? 0,
      userId: json['userId'] as String? ?? '',
      shiftId: json['shiftId'] as int? ?? 0,
      date: DateTime.tryParse(json['date'] as String? ?? '') ?? DateTime.now(),
      user: json['user'] != null ? UserModel.fromJson(json['user'] as Map<String, dynamic>) : null,
      shift: json['shift'] != null ? ShiftModel.fromJson(json['shift'] as Map<String, dynamic>) : null,
    );
  }

  // Mock user-shifts for demo
  static List<UserShiftModel> get mockList {
    final now = DateTime.now();
    return [
      UserShiftModel(
        id: 1, userId: 'emp-001', shiftId: 1,
        date: now,
        shift: ShiftModel.mockList[0],
        status: UserShiftStatus.confirmed,
      ),
      UserShiftModel(
        id: 2, userId: 'emp-001', shiftId: 1,
        date: now.add(const Duration(days: 1)),
        shift: ShiftModel.mockList[0],
        status: UserShiftStatus.scheduled,
      ),
      UserShiftModel(
        id: 3, userId: 'emp-001', shiftId: 2,
        date: now.add(const Duration(days: 3)),
        shift: ShiftModel.mockList[1],
        status: UserShiftStatus.scheduled,
      ),
      UserShiftModel(
        id: 4, userId: 'emp-001', shiftId: 1,
        date: now.add(const Duration(days: 5)),
        shift: ShiftModel.mockList[0],
        status: UserShiftStatus.pendingSwap,
      ),
      UserShiftModel(
        id: 5, userId: 'emp-001', shiftId: 3,
        date: now.add(const Duration(days: 7)),
        shift: ShiftModel.mockList[2],
        status: UserShiftStatus.scheduled,
      ),
    ];
  }
}

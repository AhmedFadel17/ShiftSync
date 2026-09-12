// lib/providers/shift_provider.dart
import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:shiftsync_app/core/errors/api_exception.dart';
import 'package:shiftsync_app/data/models/attendance_model.dart';
import 'package:shiftsync_app/data/models/break_model.dart';
import 'package:shiftsync_app/data/models/notification_model.dart';
import 'package:shiftsync_app/data/models/user_shift_model.dart';
import 'package:shiftsync_app/data/services/api_service.dart';

class ShiftProvider extends ChangeNotifier {
  String? _userId;
  String? _token;
  ApiService _apiService = const ApiService();

  // ── Schedule State ───────────────────────────────────────────────────────────
  List<UserShiftModel> _userShifts = [];
  bool _isShiftsLoading = false;
  String? _shiftsError;

  List<UserShiftModel> get userShifts => _userShifts;
  bool get isShiftsLoading => _isShiftsLoading;
  String? get shiftsError => _shiftsError;

  UserShiftModel? get todayShift {
    try {
      return _userShifts.firstWhere((s) => s.isToday);
    } catch (_) {
      return null;
    }
  }

  List<UserShiftModel> get upcomingShifts =>
      _userShifts.where((s) => s.isFuture || s.isToday).toList()
        ..sort((a, b) => a.date.compareTo(b.date));

  UserShiftModel? get nextUpcomingShift {
    final now = DateTime.now();
    final candidates = _userShifts.where((s) {
      if (s.shift == null) {
        return s.date.isAfter(DateTime(now.year, now.month, now.day));
      }
      final parts = s.shift!.startTime.split(':');
      final sHour = int.tryParse(parts[0]) ?? 0;
      final sMinute = int.tryParse(parts.length > 1 ? parts[1] : '0') ?? 0;
      final startDt = DateTime(s.date.year, s.date.month, s.date.day, sHour, sMinute);
      return startDt.isAfter(now);
    }).toList()
      ..sort((a, b) {
        final aParts = a.shift?.startTime.split(':') ?? ['0', '0'];
        final bParts = b.shift?.startTime.split(':') ?? ['0', '0'];
        final aDt = DateTime(a.date.year, a.date.month, a.date.day, int.tryParse(aParts[0]) ?? 0, int.tryParse(aParts.length > 1 ? aParts[1] : '0') ?? 0);
        final bDt = DateTime(b.date.year, b.date.month, b.date.day, int.tryParse(bParts[0]) ?? 0, int.tryParse(bParts.length > 1 ? bParts[1] : '0') ?? 0);
        return aDt.compareTo(bDt);
      });

    return candidates.isNotEmpty ? candidates.first : (todayShift ?? (upcomingShifts.isNotEmpty ? upcomingShifts.first : null));
  }

  Duration? get timeUntilNextShift {
    final next = nextUpcomingShift;
    if (next == null || next.shift == null) return null;
    final now = DateTime.now();
    final parts = next.shift!.startTime.split(':');
    final sHour = int.tryParse(parts[0]) ?? 0;
    final sMinute = int.tryParse(parts.length > 1 ? parts[1] : '0') ?? 0;
    final startDt = DateTime(next.date.year, next.date.month, next.date.day, sHour, sMinute);
    if (startDt.isBefore(now)) return Duration.zero;
    return startDt.difference(now);
  }

  String get nextShiftCountdownDisplay {
    final d = timeUntilNextShift;
    if (d == null) return '--:--:--';
    final hours = d.inHours.toString().padLeft(2, '0');
    final minutes = (d.inMinutes % 60).toString().padLeft(2, '0');
    final seconds = (d.inSeconds % 60).toString().padLeft(2, '0');
    return '$hours:$minutes:$seconds';
  }

  String get nextShiftCountdownVerbose {
    final d = timeUntilNextShift;
    if (d == null) return 'No shifts scheduled';
    final h = d.inHours;
    final m = d.inMinutes % 60;
    final s = d.inSeconds % 60;
    if (h > 0) {
      return '${h}h ${m}m ${s}s';
    } else if (m > 0) {
      return '${m}m ${s}s';
    } else {
      return '${s}s';
    }
  }

  // ── Attendance (Clock-In) State ──────────────────────────────────────────────
  AttendanceModel? _activeAttendance;
  bool _isClockedIn = false;
  Duration _elapsedTime = Duration.zero;
  Timer? _tickerTimer;

  AttendanceModel? get activeAttendance => _activeAttendance;
  bool get isClockedIn => _isClockedIn;
  Duration get elapsedTime => _elapsedTime;
  String get elapsedDisplay {
    final h = _elapsedTime.inHours.toString().padLeft(2, '0');
    final m = (_elapsedTime.inMinutes % 60).toString().padLeft(2, '0');
    final s = (_elapsedTime.inSeconds % 60).toString().padLeft(2, '0');
    return '${h}h ${m}m ${s}s';
  }

  // ── Break State ──────────────────────────────────────────────────────────────
  List<BreakTypeModel> _breakTypes = BreakTypeModel.defaultTypes;
  List<AttendanceBreakModel> _activeAttendanceBreaks = [];
  AttendanceBreakModel? _activeBreak;
  Duration _breakElapsedTime = Duration.zero;

  List<BreakTypeModel> get breakTypes => _breakTypes;
  List<AttendanceBreakModel> get activeAttendanceBreaks => _activeAttendanceBreaks;
  AttendanceBreakModel? get activeBreak => _activeBreak;
  bool get isOnBreak => _activeBreak != null && _activeBreak!.isActive;
  Duration get breakElapsedTime => _breakElapsedTime;
  String get breakElapsedDisplay {
    final m = _breakElapsedTime.inMinutes.toString().padLeft(2, '0');
    final s = (_breakElapsedTime.inSeconds % 60).toString().padLeft(2, '0');
    return '${m}m ${s}s';
  }

  // ── Attendance History ───────────────────────────────────────────────────────
  List<AttendanceModel> _attendanceHistory = [];
  bool _isHistoryLoading = false;

  List<AttendanceModel> get attendanceHistory => _attendanceHistory;
  bool get isHistoryLoading => _isHistoryLoading;

  double get weeklyHours {
    final now = DateTime.now();
    final weekStart = now.subtract(Duration(days: now.weekday - 1));
    final liveHours = _isClockedIn ? (_elapsedTime.inMinutes / 60.0) : 0.0;
    return _attendanceHistory
        .where((a) => a.checkInTime.isAfter(weekStart))
        .fold(liveHours, (sum, a) => sum + a.hoursWorked);
  }

  double get overtimeHours => (weeklyHours - 40.0).clamp(0.0, double.infinity);

  double get onTimeRate {
    if (_attendanceHistory.isEmpty) return 100.0;
    return 98.0;
  }

  // ── In-App Notifications & Alerts ───────────────────────────────────────────
  List<NotificationModel> _notifications = [];
  bool get hasUnread => _notifications.any((n) => !n.isRead);
  int get unreadCount => _notifications.where((n) => !n.isRead).length;
  List<NotificationModel> get notifications => _notifications;

  String? _currentAlertBanner;
  String? get currentAlertBanner => _currentAlertBanner;

  final Set<String> _sentAlertKeys = {};

  // ── Init & Update Auth ───────────────────────────────────────────────────────
  ShiftProvider() {
    _loadInitialData();
    _startPeriodicTicker();
  }

  void updateAuth({String? userId, String? token}) {
    if (_userId != userId || _token != token) {
      _userId = userId;
      _token = token;
      _apiService = ApiService(token: token);
      if (userId != null && userId.isNotEmpty) {
        refreshAllData();
      }
    }
  }

  void _loadInitialData() {
    _userShifts = [];
    _attendanceHistory = [];
    _notifications = [];
    _breakTypes = BreakTypeModel.defaultTypes;
    notifyListeners();
  }

  Future<void> refreshAllData() async {
    if (_userId == null || _userId!.isEmpty) return;

    _isShiftsLoading = true;
    _isHistoryLoading = true;
    _shiftsError = null;
    notifyListeners();

    try {
      // 1. Fetch user shifts
      try {
        final shifts = await _apiService.getUserShifts(_userId!);
        _userShifts = shifts;
      } catch (e) {
        _shiftsError = e.toString();
      }

      // 2. Fetch attendance history and check for active clock-in
      try {
        final attendances = await _apiService.getAttendances(_userId!);
        _attendanceHistory = attendances;
        final ongoing = attendances.where((a) => a.checkOutTime == null).toList();
        if (ongoing.isNotEmpty) {
          _activeAttendance = ongoing.first;
          _isClockedIn = true;
          _elapsedTime = DateTime.now().difference(_activeAttendance!.checkInTime);
          await _refreshActiveBreaks();
        } else {
          _activeAttendance = null;
          _isClockedIn = false;
          _elapsedTime = Duration.zero;
        }
      } catch (_) {}

      // 3. Fetch break types
      try {
        final types = await _apiService.getBreakTypes();
        if (types.isNotEmpty) {
          _breakTypes = types;
        }
      } catch (_) {}
    } finally {
      _isShiftsLoading = false;
      _isHistoryLoading = false;
      notifyListeners();
    }
  }

  Future<void> _refreshActiveBreaks() async {
    if (_activeAttendance == null) return;
    try {
      final breaks = await _apiService.getAttendanceBreaks(_activeAttendance!.id);
      _activeAttendanceBreaks = breaks;
      final active = breaks.where((b) => b.isActive).toList();
      if (active.isNotEmpty) {
        _activeBreak = active.first;
        if (_activeBreak!.startTime != null) {
          _breakElapsedTime = DateTime.now().difference(_activeBreak!.startTime!);
        }
      } else {
        _activeBreak = null;
        _breakElapsedTime = Duration.zero;
      }
    } catch (_) {}
  }

  // ── Clock Actions ─────────────────────────────────────────────────────────────
  Future<bool> clockIn({double? lat, double? lng}) async {
    if (_isClockedIn) return true;

    final currentShift = todayShift;
    if (currentShift == null || currentShift.id <= 0) {
      throw const ApiException('No scheduled shift found for today to check in to.');
    }

    final liveLat = lat ?? 30.0444;
    final liveLng = lng ?? 31.2357;

    final result = await _apiService.checkIn(
      userShiftId: currentShift.id,
      latitude: liveLat,
      longitude: liveLng,
    );

    _activeAttendance = result;
    _isClockedIn = true;
    _elapsedTime = Duration.zero;

    addNotification(
      title: 'Shift Started',
      body: 'You successfully clocked in at ${_activeAttendance!.formattedCheckIn}.',
      type: NotificationType.general,
    );

    notifyListeners();
    return true;
  }

  Future<bool> clockOut({double? lat, double? lng}) async {
    if (!_isClockedIn || _activeAttendance == null) return true;

    if (isOnBreak) {
      await endBreak();
    }

    final liveLat = lat ?? 30.0444;
    final liveLng = lng ?? 31.2357;

    AttendanceModel? completedAttendance;
    if (_activeAttendance!.id > 0) {
      completedAttendance = await _apiService.checkOut(
        attendanceId: _activeAttendance!.id,
        latitude: liveLat,
        longitude: liveLng,
      );
    }

    final completed = completedAttendance ?? AttendanceModel(
      id: _activeAttendance!.id,
      userId: _activeAttendance!.userId,
      userShiftId: _activeAttendance!.userShiftId,
      checkInTime: _activeAttendance!.checkInTime,
      checkOutTime: DateTime.now(),
      checkInLatitude: _activeAttendance!.checkInLatitude,
      checkInLongitude: _activeAttendance!.checkInLongitude,
      checkOutLatitude: liveLat,
      checkOutLongitude: liveLng,
      shiftName: _activeAttendance!.shiftName,
    );

    _attendanceHistory.insert(0, completed);
    _activeAttendance = null;
    _isClockedIn = false;
    _elapsedTime = Duration.zero;
    _activeBreak = null;
    _breakElapsedTime = Duration.zero;

    addNotification(
      title: 'Shift Completed',
      body: 'You clocked out successfully. Total shift duration: ${completed.elapsedDisplay}.',
      type: NotificationType.general,
    );

    notifyListeners();
    return true;
  }

  // ── Break Actions ─────────────────────────────────────────────────────────────
  Future<bool> takeBreak(BreakTypeModel breakType, {String? note}) async {
    if (!_isClockedIn || _activeAttendance == null) {
      throw const ApiException('You must be clocked in to take a break.');
    }

    final res = await _apiService.requestBreak(
      attendanceId: _activeAttendance!.id,
      breakTypeId: breakType.id,
      note: note,
    );

    _activeBreak = res;
    _activeAttendanceBreaks.add(res);
    _breakElapsedTime = Duration.zero;

    addNotification(
      title: 'Break Started: ${breakType.name}',
      body: 'Your ${breakType.defaultDurationMinutes}-minute break has begun.',
      type: NotificationType.breakApproved,
    );

    _currentAlertBanner = 'On Break: ${breakType.name} (${breakType.defaultDurationMinutes} min)';
    notifyListeners();
    return true;
  }

  Future<bool> endBreak() async {
    if (_activeBreak == null) return true;

    final breakId = _activeBreak!.id;
    AttendanceBreakModel? res;
    if (breakId > 0) {
      res = await _apiService.endBreak(breakId);
    }

    final durationMin = (_breakElapsedTime.inMinutes > 0) ? _breakElapsedTime.inMinutes.toDouble() : 1.0;
    final completedBreak = res ?? AttendanceBreakModel(
      id: _activeBreak!.id,
      attendanceId: _activeBreak!.attendanceId,
      breakTypeId: _activeBreak!.breakTypeId,
      breakTypeName: _activeBreak!.breakTypeName,
      requestTime: _activeBreak!.requestTime,
      startTime: _activeBreak!.startTime ?? DateTime.now(),
      endTime: DateTime.now(),
      status: BreakStatusEnum.completed,
      note: _activeBreak!.note,
      durationMinutes: durationMin,
    );

    final idx = _activeAttendanceBreaks.indexWhere((b) => b.id == breakId);
    if (idx != -1) {
      _activeAttendanceBreaks[idx] = completedBreak;
    }

    final breakName = _activeBreak!.breakTypeName;
    _activeBreak = null;
    _breakElapsedTime = Duration.zero;
    _currentAlertBanner = null;

    addNotification(
      title: 'Break Ended',
      body: 'You completed your $breakName ($durationMin min). Welcome back to your shift!',
      type: NotificationType.breakApproved,
    );

    notifyListeners();
    return true;
  }

  // ── Shift Swap ──────────────────────────────────────────────────────────────
  void requestShiftSwap(int userShiftId) {
    final idx = _userShifts.indexWhere((s) => s.id == userShiftId);
    if (idx != -1) {
      _userShifts[idx].status = UserShiftStatus.pendingSwap;
      addNotification(
        title: 'Swap Request Submitted',
        body: 'Your shift swap request has been submitted for review.',
        type: NotificationType.general,
      );
      notifyListeners();
    }
  }

  // ── Proactive Timer & In-App Notification System ────────────────────────────
  void _startPeriodicTicker() {
    _tickerTimer?.cancel();
    _tickerTimer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (_isClockedIn && _activeAttendance != null) {
        _elapsedTime = DateTime.now().difference(_activeAttendance!.checkInTime);
      }

      if (isOnBreak && _activeBreak?.startTime != null) {
        _breakElapsedTime = DateTime.now().difference(_activeBreak!.startTime!);
      }

      _checkSmartAlerts();
      notifyListeners();
    });
  }

  void _checkSmartAlerts() {
    final now = DateTime.now();

    // 1. Shift Start Reminder: If scheduled today, not clocked in yet
    if (!_isClockedIn && todayShift != null && todayShift!.shift != null) {
      final shift = todayShift!.shift!;
      final shiftDate = todayShift!.date;
      final parts = shift.startTime.split(':');
      final sHour = int.tryParse(parts[0]) ?? 0;
      final sMinute = int.tryParse(parts.length > 1 ? parts[1] : '0') ?? 0;

      final shiftStartTime = DateTime(
        shiftDate.year,
        shiftDate.month,
        shiftDate.day,
        sHour,
        sMinute,
      );

      final diff = shiftStartTime.difference(now);
      if (diff.inMinutes <= 15 && diff.inMinutes >= 0) {
        final alertKey = 'shift_start_${todayShift!.id}_${shiftDate.day}';
        if (!_sentAlertKeys.contains(alertKey)) {
          _sentAlertKeys.add(alertKey);
          final minutesLeft = diff.inMinutes;
          final timeText = minutesLeft == 0 ? 'now' : 'in $minutesLeft min';
          _currentAlertBanner = '⏰ Upcoming Shift: Starts $timeText (${shift.displayRange})';
          addNotification(
            title: 'Shift Starting Soon',
            body: 'Your "${shift.name}" shift starts $timeText. Please be at your station on time.',
            type: NotificationType.shiftReminder,
          );
        }
      }
    }

    // 2. Break Ending Reminder: 5 minutes before break time or when exceeded
    if (isOnBreak && _activeBreak != null) {
      final breakType = _breakTypes.firstWhere(
        (t) => t.id == _activeBreak!.breakTypeId,
        orElse: () => BreakTypeModel(
          id: 0,
          name: _activeBreak!.breakTypeName,
          defaultDurationMinutes: 15,
          isPaid: false,
          maxOccurrencesPerShift: 1,
        ),
      );

      final totalAllocatedSeconds = breakType.defaultDurationMinutes * 60;
      final remainingSeconds = totalAllocatedSeconds - _breakElapsedTime.inSeconds;

      if (remainingSeconds <= 300 && remainingSeconds > 280) {
        final alertKey = 'break_5m_${_activeBreak!.id}';
        if (!_sentAlertKeys.contains(alertKey)) {
          _sentAlertKeys.add(alertKey);
          _currentAlertBanner = '⚠️ Break Reminder: 5 minutes remaining for ${breakType.name}';
          addNotification(
            title: 'Break Ending Soon (5 min left)',
            body: 'Your ${breakType.name} will end in 5 minutes. Please get ready to resume duties.',
            type: NotificationType.breakApproved,
          );
        }
      }

      if (remainingSeconds <= 0 && remainingSeconds >= -10) {
        final alertKey = 'break_ended_${_activeBreak!.id}';
        if (!_sentAlertKeys.contains(alertKey)) {
          _sentAlertKeys.add(alertKey);
          _currentAlertBanner = '🔴 Break Time Reached: Please end break and resume shift';
          addNotification(
            title: 'Break Duration Reached',
            body: 'Your allotted ${breakType.defaultDurationMinutes} min break time has concluded. Please tap "End Break".',
            type: NotificationType.breakApproved,
          );
        }
      }
    }
  }

  void dismissAlertBanner() {
    _currentAlertBanner = null;
    notifyListeners();
  }

  // ── Notification Actions ────────────────────────────────────────────────────
  void addNotification({
    required String title,
    required String body,
    required NotificationType type,
  }) {
    _notifications.insert(
      0,
      NotificationModel(
        id: DateTime.now().millisecondsSinceEpoch,
        title: title,
        body: body,
        timestamp: DateTime.now(),
        type: type,
        isRead: false,
      ),
    );
    notifyListeners();
  }

  void markAllRead() {
    for (final n in _notifications) {
      n.isRead = true;
    }
    notifyListeners();
  }

  void markRead(int id) {
    final idx = _notifications.indexWhere((n) => n.id == id);
    if (idx != -1) {
      _notifications[idx].isRead = true;
      notifyListeners();
    }
  }

  @override
  void dispose() {
    _tickerTimer?.cancel();
    super.dispose();
  }
}

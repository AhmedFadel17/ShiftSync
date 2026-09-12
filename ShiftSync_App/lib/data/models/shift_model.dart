// lib/data/models/shift_model.dart

class ShiftModel {
  final int id;
  final String name;
  final String startTime; // "HH:mm:ss"
  final String endTime;   // "HH:mm:ss"
  final int maxAllowedBreaksDurationMinutes;
  final int minActiveEmployeesRequired;
  final bool isActive;

  const ShiftModel({
    required this.id,
    required this.name,
    required this.startTime,
    required this.endTime,
    required this.maxAllowedBreaksDurationMinutes,
    required this.minActiveEmployeesRequired,
    required this.isActive,
  });

  String get formattedStartTime => _formatTime(startTime);
  String get formattedEndTime => _formatTime(endTime);
  String get displayRange => '$formattedStartTime – $formattedEndTime';

  Duration get shiftDuration {
    try {
      final start = _parseTime(startTime);
      final end = _parseTime(endTime);
      if (end.isAfter(start)) return end.difference(start);
      // Night shift crosses midnight
      return end.add(const Duration(hours: 24)).difference(start);
    } catch (_) {
      return Duration.zero;
    }
  }

  double get totalHours => shiftDuration.inMinutes / 60.0;

  static DateTime _parseTime(String time) {
    final parts = time.split(':');
    final now = DateTime.now();
    return DateTime(now.year, now.month, now.day,
      int.tryParse(parts[0]) ?? 0,
      int.tryParse(parts.length > 1 ? parts[1] : '0') ?? 0,
    );
  }

  static String _formatTime(String time) {
    final parts = time.split(':');
    final h = int.tryParse(parts[0]) ?? 0;
    final m = int.tryParse(parts.length > 1 ? parts[1] : '0') ?? 0;
    final period = h >= 12 ? 'PM' : 'AM';
    final displayH = h == 0 ? 12 : (h > 12 ? h - 12 : h);
    return '${displayH.toString().padLeft(2, '0')}:${m.toString().padLeft(2, '0')} $period';
  }

  factory ShiftModel.fromJson(Map<String, dynamic> json) {
    return ShiftModel(
      id: json['id'] as int? ?? 0,
      name: json['name'] as String? ?? 'Unnamed Shift',
      startTime: json['startTime'] as String? ?? '00:00:00',
      endTime: json['endTime'] as String? ?? '00:00:00',
      maxAllowedBreaksDurationMinutes: json['maxAllowedBreaksDurationMinutes'] as int? ?? 30,
      minActiveEmployeesRequired: json['minActiveEmployeesRequired'] as int? ?? 1,
      isActive: json['isActive'] as bool? ?? true,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'startTime': startTime,
    'endTime': endTime,
    'maxAllowedBreaksDurationMinutes': maxAllowedBreaksDurationMinutes,
    'minActiveEmployeesRequired': minActiveEmployeesRequired,
    'isActive': isActive,
  };

  // Mock shifts for demo
  static List<ShiftModel> get mockList => [
    const ShiftModel(
      id: 1, name: 'Morning Care', startTime: '08:00:00', endTime: '16:00:00',
      maxAllowedBreaksDurationMinutes: 45, minActiveEmployeesRequired: 4, isActive: true,
    ),
    const ShiftModel(
      id: 2, name: 'Evening Round', startTime: '16:00:00', endTime: '00:00:00',
      maxAllowedBreaksDurationMinutes: 45, minActiveEmployeesRequired: 3, isActive: true,
    ),
    const ShiftModel(
      id: 3, name: 'Night Watch', startTime: '00:00:00', endTime: '08:00:00',
      maxAllowedBreaksDurationMinutes: 60, minActiveEmployeesRequired: 2, isActive: true,
    ),
  ];
}

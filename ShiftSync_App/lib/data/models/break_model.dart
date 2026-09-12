// lib/data/models/break_model.dart

enum BreakStatusEnum {
  approved(1, 'Approved'),
  waitingQueue(2, 'Waiting Queue'),
  rejected(3, 'Rejected'),
  completed(4, 'Completed');

  final int value;
  final String label;
  const BreakStatusEnum(this.value, this.label);

  static BreakStatusEnum fromValue(dynamic val) {
    if (val is int) {
      return BreakStatusEnum.values.firstWhere(
        (e) => e.value == val,
        orElse: () => BreakStatusEnum.approved,
      );
    }
    if (val is String) {
      final clean = val.toLowerCase();
      if (clean == 'approved') return BreakStatusEnum.approved;
      if (clean == 'waitingqueue' || clean == 'queue') return BreakStatusEnum.waitingQueue;
      if (clean == 'rejected') return BreakStatusEnum.rejected;
      if (clean == 'completed') return BreakStatusEnum.completed;
    }
    return BreakStatusEnum.approved;
  }
}

class BreakTypeModel {
  final int id;
  final String name;
  final String? description;
  final int defaultDurationMinutes;
  final bool isPaid;
  final int maxOccurrencesPerShift;
  final bool isActive;

  BreakTypeModel({
    required this.id,
    required this.name,
    this.description,
    required this.defaultDurationMinutes,
    required this.isPaid,
    required this.maxOccurrencesPerShift,
    this.isActive = true,
  });

  factory BreakTypeModel.fromJson(Map<String, dynamic> json) {
    return BreakTypeModel(
      id: json['id'] as int? ?? 0,
      name: json['name'] as String? ?? 'Break',
      description: json['description'] as String?,
      defaultDurationMinutes: json['defaultDurationMinutes'] as int? ?? 15,
      isPaid: json['isPaid'] as bool? ?? false,
      maxOccurrencesPerShift: json['maxOccurrencesPerShift'] as int? ?? 1,
      isActive: json['isActive'] as bool? ?? true,
    );
  }

  static List<BreakTypeModel> get defaultTypes => [
    BreakTypeModel(
      id: 1,
      name: 'Lunch Break',
      description: 'Standard meal break',
      defaultDurationMinutes: 30,
      isPaid: false,
      maxOccurrencesPerShift: 1,
    ),
    BreakTypeModel(
      id: 2,
      name: 'Coffee / Rest Break',
      description: 'Quick refreshment',
      defaultDurationMinutes: 15,
      isPaid: true,
      maxOccurrencesPerShift: 2,
    ),
    BreakTypeModel(
      id: 3,
      name: 'Short Pause',
      description: 'Brief rest period',
      defaultDurationMinutes: 10,
      isPaid: true,
      maxOccurrencesPerShift: 3,
    ),
  ];
}

class AttendanceBreakModel {
  final int id;
  final int attendanceId;
  final int breakTypeId;
  final String breakTypeName;
  final DateTime requestTime;
  final DateTime? startTime;
  final DateTime? endTime;
  final BreakStatusEnum status;
  final String? note;
  final double? durationMinutes;

  AttendanceBreakModel({
    required this.id,
    required this.attendanceId,
    required this.breakTypeId,
    required this.breakTypeName,
    required this.requestTime,
    this.startTime,
    this.endTime,
    required this.status,
    this.note,
    this.durationMinutes,
  });

  bool get isActive => status == BreakStatusEnum.approved && endTime == null;
  bool get isQueued => status == BreakStatusEnum.waitingQueue;
  bool get isCompleted => status == BreakStatusEnum.completed || endTime != null;

  factory AttendanceBreakModel.fromJson(Map<String, dynamic> json) {
    return AttendanceBreakModel(
      id: json['id'] as int? ?? 0,
      attendanceId: json['attendanceId'] as int? ?? 0,
      breakTypeId: json['breakTypeId'] as int? ?? 0,
      breakTypeName: json['breakTypeName'] as String? ?? 'Break',
      requestTime: json['requestTime'] != null
          ? DateTime.tryParse(json['requestTime'].toString()) ?? DateTime.now()
          : DateTime.now(),
      startTime: json['startTime'] != null
          ? DateTime.tryParse(json['startTime'].toString())
          : null,
      endTime: json['endTime'] != null
          ? DateTime.tryParse(json['endTime'].toString())
          : null,
      status: BreakStatusEnum.fromValue(json['status'] ?? json['statusName']),
      note: json['note'] as String?,
      durationMinutes: (json['durationMinutes'] as num?)?.toDouble(),
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'attendanceId': attendanceId,
    'breakTypeId': breakTypeId,
    'breakTypeName': breakTypeName,
    'requestTime': requestTime.toIso8601String(),
    'startTime': startTime?.toIso8601String(),
    'endTime': endTime?.toIso8601String(),
    'status': status.value,
    'note': note,
    'durationMinutes': durationMinutes,
  };
}

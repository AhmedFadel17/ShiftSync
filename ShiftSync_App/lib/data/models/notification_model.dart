// lib/data/models/notification_model.dart
import 'package:flutter/material.dart';
import 'package:shiftsync_app/core/theme/app_theme.dart';

enum NotificationType {
  shiftReminder,
  scheduleChange,
  swapApproved,
  swapDeclined,
  breakApproved,
  general,
}

class NotificationModel {
  final int id;
  final String title;
  final String body;
  final DateTime timestamp;
  final NotificationType type;
  bool isRead;

  NotificationModel({
    required this.id,
    required this.title,
    required this.body,
    required this.timestamp,
    required this.type,
    this.isRead = false,
  });

  IconData get icon {
    switch (type) {
      case NotificationType.shiftReminder: return Icons.alarm_rounded;
      case NotificationType.scheduleChange: return Icons.event_note_rounded;
      case NotificationType.swapApproved: return Icons.swap_horiz_rounded;
      case NotificationType.swapDeclined: return Icons.swap_horiz_rounded;
      case NotificationType.breakApproved: return Icons.coffee_rounded;
      case NotificationType.general: return Icons.notifications_rounded;
    }
  }

  Color get iconColor {
    switch (type) {
      case NotificationType.shiftReminder: return AppColors.primary;
      case NotificationType.scheduleChange: return AppColors.warning;
      case NotificationType.swapApproved: return AppColors.secondary;
      case NotificationType.swapDeclined: return AppColors.error;
      case NotificationType.breakApproved: return AppColors.secondary;
      case NotificationType.general: return AppColors.onSurfaceVariant;
    }
  }

  Color get iconBgColor {
    switch (type) {
      case NotificationType.shiftReminder: return AppColors.primaryContainer;
      case NotificationType.scheduleChange: return AppColors.warningContainer;
      case NotificationType.swapApproved: return AppColors.secondaryContainer;
      case NotificationType.swapDeclined: return AppColors.errorContainer;
      case NotificationType.breakApproved: return AppColors.secondaryContainer;
      case NotificationType.general: return AppColors.surfaceContainer;
    }
  }

  String get timeAgo {
    final diff = DateTime.now().difference(timestamp);
    if (diff.inMinutes < 1) return 'Just now';
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    return '${diff.inDays}d ago';
  }
}

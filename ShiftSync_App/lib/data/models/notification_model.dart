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

  // Mock notifications for demo
  static List<NotificationModel> get mockList {
    final now = DateTime.now();
    return [
      NotificationModel(
        id: 1,
        title: 'Shift Reminder',
        body: 'Your Morning Care shift starts in 1 hour. Please check in on time.',
        timestamp: now.subtract(const Duration(minutes: 45)),
        type: NotificationType.shiftReminder,
        isRead: false,
      ),
      NotificationModel(
        id: 2,
        title: 'Swap Request Approved',
        body: 'Your shift swap request for Sep 15 has been approved by management.',
        timestamp: now.subtract(const Duration(hours: 2)),
        type: NotificationType.swapApproved,
        isRead: false,
      ),
      NotificationModel(
        id: 3,
        title: 'Schedule Updated',
        body: 'Your schedule for next week has been updated. Check your upcoming shifts.',
        timestamp: now.subtract(const Duration(hours: 5)),
        type: NotificationType.scheduleChange,
        isRead: true,
      ),
      NotificationModel(
        id: 4,
        title: 'Break Request Approved',
        body: 'Your 30-minute break request has been approved. Enjoy your break!',
        timestamp: now.subtract(const Duration(hours: 8)),
        type: NotificationType.breakApproved,
        isRead: true,
      ),
      NotificationModel(
        id: 5,
        title: 'Swap Request Declined',
        body: 'Your shift swap request for Sep 18 was declined. Insufficient coverage.',
        timestamp: now.subtract(const Duration(days: 1)),
        type: NotificationType.swapDeclined,
        isRead: true,
      ),
      NotificationModel(
        id: 6,
        title: 'Shift Reminder',
        body: 'Tomorrow\'s Evening Round shift starts at 04:00 PM. Be prepared.',
        timestamp: now.subtract(const Duration(days: 1, hours: 4)),
        type: NotificationType.shiftReminder,
        isRead: true,
      ),
    ];
  }
}

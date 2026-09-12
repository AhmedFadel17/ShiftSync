// lib/screens/notifications/notifications_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:shiftsync_app/core/theme/app_theme.dart';
import 'package:shiftsync_app/data/models/notification_model.dart';
import 'package:shiftsync_app/providers/shift_provider.dart';

class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final shiftProv = context.watch<ShiftProvider>();
    final notifications = shiftProv.notifications;
    final unread = shiftProv.unreadCount;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Row(
          children: [
            const Text('Notifications'),
            if (unread > 0) ...[
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                decoration: BoxDecoration(
                  color: AppColors.error,
                  borderRadius: BorderRadius.circular(100),
                ),
                child: Text(
                  '$unread',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 11,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
            ],
          ],
        ),
        actions: [
          if (unread > 0)
            Padding(
              padding: const EdgeInsets.only(right: 12),
              child: TextButton.icon(
                onPressed: () {
                  HapticFeedback.lightImpact();
                  shiftProv.markAllRead();
                },
                icon: const Icon(Icons.done_all_rounded, size: 16),
                label: const Text('Mark all read'),
                style: TextButton.styleFrom(
                  foregroundColor: AppColors.primary,
                  textStyle: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ),
        ],
      ),
      body: notifications.isEmpty
          ? _EmptyNotifications()
          : ListView.builder(
              physics: const BouncingScrollPhysics(),
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 100),
              itemCount: notifications.length,
              itemBuilder: (context, index) {
                // Group by read/unread
                final n = notifications[index];

                return Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (isFirstUnreadSection(notifications, index)) ...[
                      _SectionHeader(label: 'New', count: unread),
                      const SizedBox(height: 8),
                    ],
                    if (isFirstReadSection(notifications, index)) ...[
                      const SizedBox(height: 8),
                      const _SectionHeader(label: 'Earlier'),
                      const SizedBox(height: 8),
                    ],
                    Padding(
                      padding: const EdgeInsets.only(bottom: 8),
                      child: _NotificationTile(
                        notification: n,
                        onTap: () {
                          HapticFeedback.selectionClick();
                          shiftProv.markRead(n.id);
                        },
                      ),
                    ),
                  ],
                );
              },
            ),
    );
  }

  bool isFirstUnreadSection(List<NotificationModel> list, int index) {
    return !list[index].isRead && (index == 0 || list[index - 1].isRead);
  }

  bool isFirstReadSection(List<NotificationModel> list, int index) {
    return list[index].isRead && (index == 0 || !list[index - 1].isRead);
  }
}

// ─── Section Header ───────────────────────────────────────────────────────────

class _SectionHeader extends StatelessWidget {
  final String label;
  final int? count;

  const _SectionHeader({required this.label, this.count});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w800,
            color: AppColors.onSurfaceVariant,
            letterSpacing: 0.5,
          ),
        ),
        if (count != null) ...[
          const SizedBox(width: 6),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
            decoration: BoxDecoration(
              color: AppColors.primaryContainer,
              borderRadius: BorderRadius.circular(100),
            ),
            child: Text(
              '$count',
              style: const TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.w800,
                color: AppColors.primary,
              ),
            ),
          ),
        ],
        const SizedBox(width: 8),
        Expanded(
          child: Container(
            height: 1,
            color: AppColors.outlineVariant,
          ),
        ),
      ],
    );
  }
}

// ─── Notification Tile ────────────────────────────────────────────────────────

class _NotificationTile extends StatelessWidget {
  final NotificationModel notification;
  final VoidCallback onTap;

  const _NotificationTile({required this.notification, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final n = notification;
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: n.isRead ? Colors.white : AppColors.primaryContainer.withOpacity(0.5),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: n.isRead ? AppColors.outlineVariant : AppColors.primary.withOpacity(0.25),
          ),
          boxShadow: n.isRead
              ? []
              : [BoxShadow(color: AppColors.primary.withOpacity(0.08), blurRadius: 12, offset: const Offset(0, 3))],
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Icon
            Container(
              width: 42,
              height: 42,
              decoration: BoxDecoration(
                color: n.iconBgColor,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(n.icon, color: n.iconColor, size: 20),
            ),
            const SizedBox(width: 12),

            // Content
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          n.title,
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: n.isRead ? FontWeight.w600 : FontWeight.w800,
                            color: AppColors.onSurface,
                          ),
                        ),
                      ),
                      Text(
                        n.timeAgo,
                        style: const TextStyle(
                          fontSize: 10,
                          color: AppColors.onSurfaceVariant,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    n.body,
                    style: TextStyle(
                      fontSize: 12,
                      color: n.isRead ? AppColors.onSurfaceVariant : AppColors.onSurface,
                      height: 1.4,
                      fontWeight: n.isRead ? FontWeight.w400 : FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),

            // Unread dot
            if (!n.isRead) ...[
              const SizedBox(width: 8),
              Container(
                width: 8,
                height: 8,
                margin: const EdgeInsets.only(top: 3),
                decoration: const BoxDecoration(
                  color: AppColors.primary,
                  shape: BoxShape.circle,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

// ─── Empty State ──────────────────────────────────────────────────────────────

class _EmptyNotifications extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              color: AppColors.surfaceContainer,
              borderRadius: BorderRadius.circular(22),
            ),
            child: const Icon(Icons.notifications_none_rounded, size: 40, color: AppColors.onSurfaceVariant),
          ),
          const SizedBox(height: 20),
          const Text(
            'All Caught Up!',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.onSurface),
          ),
          const SizedBox(height: 8),
          const Text(
            'No notifications right now.\nWe\'ll notify you about shift changes.',
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 14, color: AppColors.onSurfaceVariant, height: 1.5),
          ),
        ],
      ),
    );
  }
}

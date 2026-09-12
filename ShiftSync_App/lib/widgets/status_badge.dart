// lib/widgets/status_badge.dart
import 'package:flutter/material.dart';
import 'package:shiftsync_app/core/theme/app_theme.dart';
import 'package:shiftsync_app/data/models/user_shift_model.dart';

class StatusBadge extends StatelessWidget {
  final String label;
  final Color color;
  final Color backgroundColor;
  final IconData? icon;
  final bool pulsate;

  const StatusBadge({
    super.key,
    required this.label,
    required this.color,
    required this.backgroundColor,
    this.icon,
    this.pulsate = false,
  });

  factory StatusBadge.fromShiftStatus(UserShiftStatus status) {
    switch (status) {
      case UserShiftStatus.confirmed:
        return const StatusBadge(
          label: 'Confirmed',
          color: AppColors.secondary,
          backgroundColor: AppColors.secondaryContainer,
          icon: Icons.check_circle_rounded,
        );
      case UserShiftStatus.pendingSwap:
        return StatusBadge(
          label: 'Pending Swap',
          color: AppColors.warning,
          backgroundColor: AppColors.warningContainer,
          icon: Icons.swap_horiz_rounded,
          pulsate: true,
        );
      case UserShiftStatus.scheduled:
        return const StatusBadge(
          label: 'Scheduled',
          color: AppColors.statusScheduled,
          backgroundColor: Color(0xFFDBEAFE),
          icon: Icons.calendar_today_rounded,
        );
    }
  }

  factory StatusBadge.onShift() => const StatusBadge(
    label: 'ON SHIFT',
    color: AppColors.secondary,
    backgroundColor: AppColors.secondaryContainer,
    icon: Icons.radio_button_checked_rounded,
    pulsate: true,
  );

  factory StatusBadge.offDuty() => const StatusBadge(
    label: 'OFF DUTY',
    color: AppColors.onSurfaceVariant,
    backgroundColor: AppColors.surfaceContainer,
    icon: Icons.circle_outlined,
  );

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(100),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, size: 12, color: color),
            const SizedBox(width: 4),
          ],
          Text(
            label,
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w700,
              color: color,
              letterSpacing: 0.3,
            ),
          ),
        ],
      ),
    );
  }
}

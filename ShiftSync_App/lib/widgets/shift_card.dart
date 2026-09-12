// lib/widgets/shift_card.dart
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:shiftsync_app/core/theme/app_theme.dart';
import 'package:shiftsync_app/data/models/user_shift_model.dart';
import 'package:shiftsync_app/widgets/app_card.dart';
import 'package:shiftsync_app/widgets/status_badge.dart';

class ShiftCard extends StatelessWidget {
  final UserShiftModel userShift;
  final VoidCallback? onSwapRequested;
  final bool compact;

  const ShiftCard({
    super.key,
    required this.userShift,
    this.onSwapRequested,
    this.compact = false,
  });

  @override
  Widget build(BuildContext context) {
    final shift = userShift.shift;

    return AppCard(
      padding: EdgeInsets.all(compact ? 14 : 18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header row
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Shift color strip + icon
              Container(
                width: 42,
                height: 42,
                decoration: BoxDecoration(
                  gradient: AppColors.primaryGradient,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(
                  Icons.work_history_rounded,
                  color: Colors.white,
                  size: 20,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      shift?.name ?? 'Shift #${userShift.shiftId}',
                      style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                        color: AppColors.onSurface,
                        letterSpacing: -0.2,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      userShift.formattedDate,
                      style: const TextStyle(
                        fontSize: 12,
                        color: AppColors.onSurfaceVariant,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
              StatusBadge.fromShiftStatus(userShift.status),
            ],
          ),

          const SizedBox(height: 14),
          Container(
            height: 1,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [AppColors.outline.withOpacity(0.0), AppColors.outline.withOpacity(0.5), AppColors.outline.withOpacity(0.0)],
              ),
            ),
          ),
          const SizedBox(height: 14),

          // Time info row
          if (shift != null)
            Row(
              children: [
                _InfoChip(
                  icon: Icons.schedule_rounded,
                  label: shift.displayRange,
                ),
                const SizedBox(width: 8),
                _InfoChip(
                  icon: Icons.timer_rounded,
                  label: '${shift.totalHours.toStringAsFixed(1)}h',
                  color: AppColors.primary,
                ),
              ],
            ),

          // Swap button — shown when not already a pending swap
          if (onSwapRequested != null &&
              userShift.status != UserShiftStatus.pendingSwap) ...[
            const SizedBox(height: 12),
            GestureDetector(
              onTap: () {
                HapticFeedback.lightImpact();
                onSwapRequested?.call();
              },
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(vertical: 10),
                decoration: BoxDecoration(
                  color: AppColors.primaryContainer,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.swap_horiz_rounded, size: 16, color: AppColors.primary),
                    SizedBox(width: 6),
                    Text(
                      'Request Shift Swap',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: AppColors.primary,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _InfoChip extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;

  const _InfoChip({
    required this.icon,
    required this.label,
    this.color = AppColors.onSurfaceVariant,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: AppColors.surfaceContainer,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 13, color: color),
          const SizedBox(width: 5),
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: color,
            ),
          ),
        ],
      ),
    );
  }
}

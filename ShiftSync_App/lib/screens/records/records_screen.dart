// lib/screens/records/records_screen.dart
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import 'package:shiftsync_app/core/theme/app_theme.dart';
import 'package:shiftsync_app/data/models/attendance_model.dart';
import 'package:shiftsync_app/providers/shift_provider.dart';
import 'package:shiftsync_app/widgets/app_card.dart';
import 'package:shiftsync_app/widgets/summary_card.dart';

class RecordsScreen extends StatelessWidget {
  const RecordsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final shiftProv = context.watch<ShiftProvider>();
    final history = shiftProv.attendanceHistory;
    final weekHours = shiftProv.weeklyHours;
    final overtime = shiftProv.overtimeHours;
    final onTimeRate = shiftProv.onTimeRate;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Shift Records'),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 16),
            child: IconButton(
              icon: const Icon(Icons.filter_list_rounded),
              tooltip: 'Filter',
              onPressed: () {},
              style: IconButton.styleFrom(
                backgroundColor: AppColors.surfaceContainer,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
          ),
        ],
      ),
      body: CustomScrollView(
        physics: const BouncingScrollPhysics(),
        slivers: [
          SliverPadding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 100),
            sliver: SliverList(
              delegate: SliverChildListDelegate([
                // ── Summary Banner ──────────────────────────────────────────────
                AppCard(
                  padding: const EdgeInsets.all(20),
                  gradient: AppColors.heroGradient,
                  border: Border.all(color: Colors.transparent),
                  shadows: [],
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.15),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: const Icon(Icons.analytics_rounded, color: Colors.white, size: 18),
                          ),
                          const SizedBox(width: 10),
                          const Text(
                            'This Week\'s Summary',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 14,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      // Weekly hours bar
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text(
                            '${weekHours.toStringAsFixed(1)}',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 42,
                              fontWeight: FontWeight.w900,
                              letterSpacing: -2,
                            ),
                          ),
                          const Padding(
                            padding: EdgeInsets.only(bottom: 8, left: 4),
                            child: Text(
                              'hrs',
                              style: TextStyle(
                                color: Colors.white70,
                                fontSize: 18,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                          const Spacer(),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                decoration: BoxDecoration(
                                  color: overtime > 0
                                      ? AppColors.warning.withOpacity(0.3)
                                      : Colors.white.withOpacity(0.15),
                                  borderRadius: BorderRadius.circular(100),
                                ),
                                child: Text(
                                  '${overtime.toStringAsFixed(1)}h OT',
                                  style: TextStyle(
                                    color: overtime > 0 ? AppColors.warning : Colors.white70,
                                    fontSize: 12,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                              ),
                              const SizedBox(height: 6),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                decoration: BoxDecoration(
                                  color: AppColors.secondary.withOpacity(0.3),
                                  borderRadius: BorderRadius.circular(100),
                                ),
                                child: Text(
                                  '${onTimeRate.toStringAsFixed(0)}% on-time',
                                  style: const TextStyle(
                                    color: AppColors.secondary,
                                    fontSize: 12,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      // Progress bar
                      ClipRRect(
                        borderRadius: BorderRadius.circular(4),
                        child: LinearProgressIndicator(
                          value: (weekHours / 40.0).clamp(0.0, 1.0),
                          backgroundColor: Colors.white.withOpacity(0.15),
                          valueColor: const AlwaysStoppedAnimation(AppColors.secondary),
                          minHeight: 6,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        '${weekHours.toStringAsFixed(1)} / 40.0h standard week',
                        style: TextStyle(
                          color: Colors.white.withOpacity(0.6),
                          fontSize: 11,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 12),

                // ── KPI Cards ────────────────────────────────────────────────────
                Row(
                  children: [
                    Expanded(
                      child: SummaryCard(
                        label: 'Weekly Hours',
                        value: '${weekHours.toStringAsFixed(1)}h',
                        sublabel: 'Logged this week',
                        icon: Icons.schedule_rounded,
                        color: AppColors.primary,
                        backgroundColor: AppColors.primaryContainer,
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: SummaryCard(
                        label: 'Overtime',
                        value: '${overtime.toStringAsFixed(1)}h',
                        sublabel: overtime > 0 ? 'Above standard' : 'Within standard',
                        icon: Icons.more_time_rounded,
                        color: overtime > 0 ? AppColors.warning : AppColors.secondary,
                        backgroundColor: overtime > 0
                            ? AppColors.warningContainer
                            : AppColors.secondaryContainer,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                SummaryCard(
                  label: 'On-Time Rate',
                  value: '${onTimeRate.toStringAsFixed(0)}%',
                  sublabel: 'Based on check-in history',
                  icon: Icons.verified_rounded,
                  color: AppColors.secondary,
                  backgroundColor: AppColors.secondaryContainer,
                ),

                const SizedBox(height: 24),

                // ── History List ──────────────────────────────────────────────────
                const Text(
                  'Past Shifts',
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                    color: AppColors.onSurface,
                  ),
                ),
                const SizedBox(height: 12),

                if (history.isEmpty)
                  Center(
                    child: Padding(
                      padding: const EdgeInsets.all(40),
                      child: Column(
                        children: [
                          const Icon(Icons.history_rounded, size: 40, color: AppColors.onSurfaceVariant),
                          const SizedBox(height: 12),
                          const Text(
                            'No attendance records yet',
                            style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: AppColors.onSurface),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Your shift history will appear here',
                            style: TextStyle(fontSize: 13, color: AppColors.onSurfaceVariant.withOpacity(0.8)),
                          ),
                        ],
                      ),
                    ),
                  )
                else
                  ...history.map((att) => Padding(
                    padding: const EdgeInsets.only(bottom: 10),
                    child: _AttendanceRecord(attendance: att),
                  )),
              ]),
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Attendance Record Row Card ───────────────────────────────────────────────

class _AttendanceRecord extends StatelessWidget {
  final AttendanceModel attendance;
  const _AttendanceRecord({required this.attendance});

  @override
  Widget build(BuildContext context) {
    final hours = attendance.hoursWorked;
    final isOvertime = hours > 8.5;

    return AppCard(
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          // Date column
          Container(
            width: 48,
            height: 56,
            decoration: BoxDecoration(
              gradient: AppColors.primaryGradient,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  DateFormat('dd').format(attendance.checkInTime),
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.w800,
                    height: 1.0,
                  ),
                ),
                Text(
                  DateFormat('MMM').format(attendance.checkInTime).toUpperCase(),
                  style: const TextStyle(
                    color: Colors.white70,
                    fontSize: 9,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 0.5,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 14),

          // Details
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        attendance.shiftName ?? 'Shift',
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                          color: AppColors.onSurface,
                        ),
                      ),
                    ),
                    if (isOvertime)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: AppColors.warningContainer,
                          borderRadius: BorderRadius.circular(100),
                        ),
                        child: const Text(
                          'OVERTIME',
                          style: TextStyle(
                            fontSize: 9,
                            fontWeight: FontWeight.w800,
                            color: AppColors.warning,
                            letterSpacing: 0.5,
                          ),
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  DateFormat('EEEE').format(attendance.checkInTime),
                  style: const TextStyle(
                    fontSize: 11,
                    color: AppColors.onSurfaceVariant,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    _TimeChip(
                      icon: Icons.login_rounded,
                      time: attendance.formattedCheckIn,
                      color: AppColors.secondary,
                    ),
                    const SizedBox(width: 8),
                    const Icon(Icons.arrow_forward_rounded, size: 12, color: AppColors.onSurfaceVariant),
                    const SizedBox(width: 8),
                    _TimeChip(
                      icon: Icons.logout_rounded,
                      time: attendance.formattedCheckOut,
                      color: AppColors.error,
                    ),
                  ],
                ),
              ],
            ),
          ),

          // Duration
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                '${hours.toStringAsFixed(1)}h',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w800,
                  color: isOvertime ? AppColors.warning : AppColors.primary,
                  letterSpacing: -0.5,
                ),
              ),
              Text(
                'total',
                style: const TextStyle(
                  fontSize: 10,
                  color: AppColors.onSurfaceVariant,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _TimeChip extends StatelessWidget {
  final IconData icon;
  final String time;
  final Color color;

  const _TimeChip({required this.icon, required this.time, required this.color});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 11, color: color),
        const SizedBox(width: 3),
        Text(
          time,
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w600,
            color: color,
          ),
        ),
      ],
    );
  }
}

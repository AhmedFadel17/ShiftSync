// lib/screens/home/home_screen.dart
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import 'package:shiftsync_app/core/theme/app_theme.dart';
import 'package:shiftsync_app/data/models/break_model.dart';
import 'package:shiftsync_app/providers/auth_provider.dart';
import 'package:shiftsync_app/providers/shift_provider.dart';
import 'package:shiftsync_app/widgets/app_card.dart';
import 'package:shiftsync_app/widgets/clock_in_button.dart';
import 'package:shiftsync_app/widgets/status_badge.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  String get _greeting {
    final h = DateTime.now().hour;
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final shiftProv = context.watch<ShiftProvider>();
    final user = auth.user;
    final todayShift = shiftProv.todayShift;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: RefreshIndicator(
        onRefresh: () async {
          await shiftProv.refreshAllData();
        },
        child: CustomScrollView(
          physics: const AlwaysScrollableScrollPhysics(
            parent: BouncingScrollPhysics(),
          ),
          slivers: [
            // ── Hero App Bar ──────────────────────────────────────────────────────
            SliverAppBar(
              expandedHeight: 180,
              floating: false,
              pinned: true,
              stretch: true,
              backgroundColor: Colors.transparent,
              elevation: 0,
              flexibleSpace: FlexibleSpaceBar(
                collapseMode: CollapseMode.pin,
                background: Container(
                  decoration: const BoxDecoration(
                    gradient: AppColors.heroGradient,
                  ),
                  child: SafeArea(
                    child: Padding(
                      padding: const EdgeInsets.fromLTRB(20, 12, 20, 20),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              // Avatar
                              Container(
                                width: 46,
                                height: 46,
                                decoration: BoxDecoration(
                                  gradient: const LinearGradient(
                                    colors: [Color(0xFF818CF8), Color(0xFF6366F1)],
                                  ),
                                  borderRadius: BorderRadius.circular(14),
                                  border: Border.all(
                                    color: Colors.white.withOpacity(0.3),
                                    width: 2,
                                  ),
                                ),
                                child: Center(
                                  child: Text(
                                    user?.initials ?? 'U',
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 16,
                                      fontWeight: FontWeight.w800,
                                    ),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      '$_greeting 👋',
                                      style: TextStyle(
                                        color: Colors.white.withOpacity(0.7),
                                        fontSize: 12,
                                        fontWeight: FontWeight.w500,
                                      ),
                                    ),
                                    Text(
                                      user?.fullName.isNotEmpty == true
                                          ? user!.fullName
                                          : 'Alex Morgan',
                                      style: const TextStyle(
                                        color: Colors.white,
                                        fontSize: 20,
                                        fontWeight: FontWeight.w800,
                                        letterSpacing: -0.5,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              // Department badge
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 10,
                                  vertical: 5,
                                ),
                                decoration: BoxDecoration(
                                  color: Colors.white.withOpacity(0.15),
                                  borderRadius: BorderRadius.circular(100),
                                  border: Border.all(
                                    color: Colors.white.withOpacity(0.2),
                                  ),
                                ),
                                child: const Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Icon(
                                      Icons.local_hospital_rounded,
                                      size: 12,
                                      color: Colors.white,
                                    ),
                                    SizedBox(width: 4),
                                    Text(
                                      'Emergency Care',
                                      style: TextStyle(
                                        color: Colors.white,
                                        fontSize: 11,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),
                          // Date and live status row
                          Row(
                            children: [
                              Icon(
                                Icons.calendar_today_rounded,
                                size: 13,
                                color: Colors.white.withOpacity(0.6),
                              ),
                              const SizedBox(width: 5),
                              Text(
                                DateFormat('EEEE, MMMM d, yyyy').format(
                                  DateTime.now(),
                                ),
                                style: TextStyle(
                                  color: Colors.white.withOpacity(0.7),
                                  fontSize: 12,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                              const Spacer(),
                              if (shiftProv.isOnBreak)
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 8,
                                    vertical: 3,
                                  ),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFF59E0B).withOpacity(0.25),
                                    borderRadius: BorderRadius.circular(100),
                                    border: Border.all(
                                      color: const Color(0xFFF59E0B).withOpacity(0.6),
                                    ),
                                  ),
                                  child: const Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Icon(
                                        Icons.coffee_rounded,
                                        size: 11,
                                        color: Color(0xFFFDE68A),
                                      ),
                                      SizedBox(width: 4),
                                      Text(
                                        'ON BREAK',
                                        style: TextStyle(
                                          color: Color(0xFFFDE68A),
                                          fontSize: 10,
                                          fontWeight: FontWeight.w800,
                                          letterSpacing: 0.8,
                                        ),
                                      ),
                                    ],
                                  ),
                                )
                              else if (shiftProv.isClockedIn)
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 8,
                                    vertical: 3,
                                  ),
                                  decoration: BoxDecoration(
                                    color: AppColors.secondary.withOpacity(0.25),
                                    borderRadius: BorderRadius.circular(100),
                                    border: Border.all(
                                      color: AppColors.secondary.withOpacity(0.5),
                                    ),
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Container(
                                        width: 6,
                                        height: 6,
                                        decoration: const BoxDecoration(
                                          color: AppColors.secondary,
                                          shape: BoxShape.circle,
                                        ),
                                      ),
                                      const SizedBox(width: 5),
                                      const Text(
                                        'LIVE',
                                        style: TextStyle(
                                          color: AppColors.secondary,
                                          fontSize: 10,
                                          fontWeight: FontWeight.w800,
                                          letterSpacing: 1.0,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),

            // ── Body Content ──────────────────────────────────────────────────────
            SliverPadding(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
              sliver: SliverList(
                delegate: SliverChildListDelegate([
                  // ── In-App Alert Banner ──────────────────────────────────────
                  if (shiftProv.currentAlertBanner != null) ...[
                    _InAppAlertBanner(
                      message: shiftProv.currentAlertBanner!,
                      onDismiss: () => shiftProv.dismissAlertBanner(),
                    ),
                    const SizedBox(height: 14),
                  ],

                  // ── Active Clock-In / Break Card ─────────────────────────────
                  _ActiveShiftCard(shiftProv: shiftProv),
                  const SizedBox(height: 16),

                  // ── Today's Schedule ────────────────────────────────────────────
                  if (todayShift != null) ...[
                    _TodayScheduleCard(userShift: todayShift),
                    const SizedBox(height: 16),
                  ],

                  // ── Quick Actions ────────────────────────────────────────────────
                  const _QuickActionsRow(),
                  const SizedBox(height: 24),
                ]),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─── In-App Alert Banner ──────────────────────────────────────────────────────

class _InAppAlertBanner extends StatelessWidget {
  final String message;
  final VoidCallback onDismiss;

  const _InAppAlertBanner({
    required this.message,
    required this.onDismiss,
  });

  @override
  Widget build(BuildContext context) {
    final isBreak = message.contains('Break');
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: isBreak ? const Color(0xFFFEF3C7) : const Color(0xFFE0E7FF),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isBreak ? const Color(0xFFF59E0B) : const Color(0xFF6366F1),
          width: 1.5,
        ),
        boxShadow: [
          BoxShadow(
            color: (isBreak ? const Color(0xFFF59E0B) : const Color(0xFF6366F1))
                .withOpacity(0.12),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        children: [
          Icon(
            isBreak ? Icons.coffee_rounded : Icons.alarm_rounded,
            color: isBreak ? const Color(0xFFD97706) : const Color(0xFF4F46E5),
            size: 20,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              message,
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: isBreak ? const Color(0xFF92400E) : const Color(0xFF3730A3),
                height: 1.3,
              ),
            ),
          ),
          IconButton(
            onPressed: onDismiss,
            icon: const Icon(Icons.close_rounded, size: 18),
            color: isBreak ? const Color(0xFF92400E) : const Color(0xFF3730A3),
            visualDensity: VisualDensity.compact,
            padding: EdgeInsets.zero,
            constraints: const BoxConstraints(),
          ),
        ],
      ),
    );
  }
}

// ─── Active Shift Card ────────────────────────────────────────────────────────

class _ActiveShiftCard extends StatelessWidget {
  final ShiftProvider shiftProv;

  const _ActiveShiftCard({required this.shiftProv});

  @override
  Widget build(BuildContext context) {
    final isOnBreak = shiftProv.isOnBreak;
    final isClockedIn = shiftProv.isClockedIn;

    return AppCard(
      padding: const EdgeInsets.all(20),
      gradient: isOnBreak
          ? const LinearGradient(
              colors: [Color(0xFFFFFBEB), Color(0xFFFEF3C7)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            )
          : isClockedIn
              ? const LinearGradient(
                  colors: [Color(0xFFF0FDF4), Color(0xFFDCFCE7)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                )
              : null,
      border: Border.all(
        color: isOnBreak
            ? const Color(0xFFF59E0B).withOpacity(0.4)
            : isClockedIn
                ? AppColors.secondary.withOpacity(0.3)
                : AppColors.outlineVariant,
      ),
      shadows: [
        BoxShadow(
          color: (isOnBreak
                  ? const Color(0xFFF59E0B)
                  : isClockedIn
                      ? AppColors.secondary
                      : AppColors.primary)
              .withOpacity(0.1),
          blurRadius: 20,
          offset: const Offset(0, 4),
        ),
      ],
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: isOnBreak
                      ? const Color(0xFFF59E0B).withOpacity(0.15)
                      : isClockedIn
                          ? AppColors.secondary.withOpacity(0.15)
                          : AppColors.primary.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(
                  isOnBreak
                      ? Icons.coffee_rounded
                      : isClockedIn
                          ? Icons.radio_button_checked_rounded
                          : Icons.schedule_rounded,
                  color: isOnBreak
                      ? const Color(0xFFD97706)
                      : isClockedIn
                          ? AppColors.secondary
                          : AppColors.primary,
                  size: 18,
                ),
              ),
              const SizedBox(width: 10),
              Text(
                isOnBreak
                    ? 'Break in Progress'
                    : isClockedIn
                        ? 'Active Shift'
                        : 'Ready to Start',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: isOnBreak
                      ? const Color(0xFFB45309)
                      : isClockedIn
                          ? AppColors.secondary
                          : AppColors.onSurfaceVariant,
                ),
              ),
              const Spacer(),
              if (isOnBreak)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF59E0B),
                    borderRadius: BorderRadius.circular(100),
                  ),
                  child: const Text(
                    'ON BREAK',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 11,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                )
              else if (isClockedIn)
                StatusBadge.onShift(),
            ],
          ),

          const SizedBox(height: 16),

          // Elapsed time display
          if (isOnBreak) ...[
            Center(
              child: Column(
                children: [
                  Text(
                    shiftProv.activeBreak?.breakTypeName ?? 'Break',
                    style: const TextStyle(
                      fontSize: 14,
                      color: Color(0xFF92400E),
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    shiftProv.breakElapsedDisplay,
                    style: const TextStyle(
                      fontSize: 36,
                      fontWeight: FontWeight.w800,
                      color: Color(0xFFD97706),
                      letterSpacing: -1.0,
                      fontFeatures: [FontFeature.tabularFigures()],
                    ),
                  ),
                  Text(
                    'Shift running: ${shiftProv.elapsedDisplay}',
                    style: const TextStyle(
                      fontSize: 12,
                      color: Color(0xFFB45309),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // End Break Action Button
            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton.icon(
                onPressed: () => _showEndBreakConfirm(context),
                icon: const Icon(Icons.stop_circle_rounded, color: Colors.white),
                label: const Text(
                  'End Break & Resume Shift',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFD97706),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                  elevation: 2,
                ),
              ),
            ),
          ] else if (isClockedIn) ...[
            Center(
              child: Column(
                children: [
                  const Text(
                    'Time Elapsed',
                    style: TextStyle(
                      fontSize: 12,
                      color: AppColors.onSurfaceVariant,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    shiftProv.elapsedDisplay,
                    style: const TextStyle(
                      fontSize: 36,
                      fontWeight: FontWeight.w800,
                      color: AppColors.secondary,
                      letterSpacing: -1.0,
                      fontFeatures: [FontFeature.tabularFigures()],
                    ),
                  ),
                  Text(
                    'Started at ${shiftProv.activeAttendance?.formattedCheckIn ?? "--"}',
                    style: const TextStyle(
                      fontSize: 12,
                      color: AppColors.onSurfaceVariant,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Active Shift Dual Controls: Take Break & Clock Out
            Row(
              children: [
                // Take Break button
                Expanded(
                  child: SizedBox(
                    height: 52,
                    child: OutlinedButton.icon(
                      onPressed: () => _showTakeBreakSheet(context),
                      icon: const Icon(
                        Icons.coffee_rounded,
                        size: 18,
                        color: Color(0xFFD97706),
                      ),
                      label: const Text(
                        'Take Break',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                          color: Color(0xFFD97706),
                        ),
                      ),
                      style: OutlinedButton.styleFrom(
                        backgroundColor: const Color(0xFFFEF3C7),
                        side: const BorderSide(color: Color(0xFFF59E0B), width: 1.5),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                // Clock Out button
                Expanded(
                  child: SizedBox(
                    height: 52,
                    child: ElevatedButton.icon(
                      onPressed: () => _showClockOutConfirm(context),
                      icon: const Icon(
                        Icons.logout_rounded,
                        size: 18,
                        color: Colors.white,
                      ),
                      label: const Text(
                        'Clock Out',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                          color: Colors.white,
                        ),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.error,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ] else ...[
            // Current time display (Off Shift)
            StreamBuilder(
              stream: Stream.periodic(const Duration(seconds: 1)),
              builder: (context, _) {
                return Center(
                  child: Text(
                    DateFormat('hh:mm:ss a').format(DateTime.now()),
                    style: const TextStyle(
                      fontSize: 32,
                      fontWeight: FontWeight.w800,
                      color: AppColors.onSurface,
                      letterSpacing: -1.0,
                      fontFeatures: [FontFeature.tabularFigures()],
                    ),
                  ),
                );
              },
            ),
            const SizedBox(height: 6),
            Center(
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(
                    Icons.location_on_rounded,
                    size: 13,
                    color: AppColors.onSurfaceVariant,
                  ),
                  const SizedBox(width: 3),
                  Text(
                    'GPS Location Ready',
                    style: TextStyle(
                      fontSize: 12,
                      color: AppColors.onSurfaceVariant.withOpacity(0.8),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Clock-In button
            ClockInButton(
              isClockedIn: false,
              onClockIn: () => shiftProv.clockIn(),
              onClockOut: () {},
            ),
          ],
        ],
      ),
    );
  }

  void _showTakeBreakSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _TakeBreakSheet(shiftProv: shiftProv),
    );
  }

  void _showEndBreakConfirm(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (_) => _EndBreakSheet(
        onConfirm: () async {
          Navigator.pop(context);
          await shiftProv.endBreak();
        },
      ),
    );
  }

  void _showClockOutConfirm(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (_) => _ClockOutSheet(
        onConfirm: () {
          shiftProv.clockOut();
          Navigator.pop(context);
        },
      ),
    );
  }
}

// ─── Take Break Sheet ─────────────────────────────────────────────────────────

class _TakeBreakSheet extends StatefulWidget {
  final ShiftProvider shiftProv;
  const _TakeBreakSheet({required this.shiftProv});

  @override
  State<_TakeBreakSheet> createState() => _TakeBreakSheetState();
}

class _TakeBreakSheetState extends State<_TakeBreakSheet> {
  BreakTypeModel? _selectedType;
  final TextEditingController _noteCtrl = TextEditingController();
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    if (widget.shiftProv.breakTypes.isNotEmpty) {
      _selectedType = widget.shiftProv.breakTypes.first;
    }
  }

  @override
  void dispose() {
    _noteCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final types = widget.shiftProv.breakTypes;

    return Container(
      margin: const EdgeInsets.all(16),
      padding: EdgeInsets.fromLTRB(
        24,
        24,
        24,
        MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: const Color(0xFFFEF3C7),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(
                  Icons.coffee_rounded,
                  color: Color(0xFFD97706),
                  size: 22,
                ),
              ),
              const SizedBox(width: 12),
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Take a Break',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w800,
                        color: AppColors.onSurface,
                      ),
                    ),
                    Text(
                      'Select a break type to pause active duties',
                      style: TextStyle(
                        fontSize: 12,
                        color: AppColors.onSurfaceVariant,
                      ),
                    ),
                  ],
                ),
              ),
              IconButton(
                onPressed: () => Navigator.pop(context),
                icon: const Icon(Icons.close_rounded),
                visualDensity: VisualDensity.compact,
              ),
            ],
          ),
          const SizedBox(height: 18),

          const Text(
            'Available Break Options',
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w700,
              color: AppColors.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 10),

          for (final type in types) ...[
            GestureDetector(
              onTap: () {
                setState(() => _selectedType = type);
                HapticFeedback.selectionClick();
              },
              child: Container(
                margin: const EdgeInsets.only(bottom: 8),
                padding: const EdgeInsets.symmetric(
                  horizontal: 14,
                  vertical: 12,
                ),
                decoration: BoxDecoration(
                  color: _selectedType?.id == type.id
                      ? const Color(0xFFFFFBEB)
                      : const Color(0xFFF8FAFC),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: _selectedType?.id == type.id
                        ? const Color(0xFFF59E0B)
                        : AppColors.outlineVariant,
                    width: _selectedType?.id == type.id ? 1.5 : 1,
                  ),
                ),
                child: Row(
                  children: [
                    Icon(
                      _selectedType?.id == type.id
                          ? Icons.radio_button_checked_rounded
                          : Icons.radio_button_off_rounded,
                      color: _selectedType?.id == type.id
                          ? const Color(0xFFD97706)
                          : AppColors.onSurfaceVariant,
                      size: 20,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            type.name,
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w700,
                              color: _selectedType?.id == type.id
                                  ? const Color(0xFF92400E)
                                  : AppColors.onSurface,
                            ),
                          ),
                          Text(
                            '${type.defaultDurationMinutes} mins • ${type.isPaid ? 'Paid' : 'Unpaid'}',
                            style: TextStyle(
                              fontSize: 12,
                              color: _selectedType?.id == type.id
                                  ? const Color(0xFFB45309)
                                  : AppColors.onSurfaceVariant,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: _selectedType?.id == type.id
                            ? const Color(0xFFF59E0B)
                            : Colors.black.withOpacity(0.06),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        '${type.defaultDurationMinutes}m',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: _selectedType?.id == type.id
                              ? Colors.white
                              : AppColors.onSurfaceVariant,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],


          const SizedBox(height: 12),
          // Note field
          TextField(
            controller: _noteCtrl,
            decoration: InputDecoration(
              hintText: 'Add an optional note or reason...',
              hintStyle: const TextStyle(fontSize: 13, color: AppColors.onSurfaceVariant),
              filled: true,
              fillColor: const Color(0xFFF8FAFC),
              contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(14),
                borderSide: const BorderSide(color: AppColors.outlineVariant),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(14),
                borderSide: const BorderSide(color: AppColors.outlineVariant),
              ),
            ),
          ),
          const SizedBox(height: 20),

          // Confirm Action Button
          SizedBox(
            width: double.infinity,
            height: 50,
            child: ElevatedButton(
              onPressed: _isSubmitting || _selectedType == null
                  ? null
                  : () async {
                      setState(() => _isSubmitting = true);
                      await widget.shiftProv.takeBreak(
                        _selectedType!,
                        note: _noteCtrl.text.trim().isNotEmpty ? _noteCtrl.text.trim() : null,
                      );
                      if (mounted) {
                        Navigator.pop(context);
                      }
                    },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFD97706),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
              ),
              child: _isSubmitting
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        color: Colors.white,
                        strokeWidth: 2,
                      ),
                    )
                  : Text(
                      'Start ${_selectedType?.name ?? 'Break'}',
                      style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                      ),
                    ),
            ),
          ),
        ],
      ),
    );
  }
}

// ─── End Break Sheet ──────────────────────────────────────────────────────────

class _EndBreakSheet extends StatelessWidget {
  final VoidCallback onConfirm;
  const _EndBreakSheet({required this.onConfirm});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: const Color(0xFFFEF3C7),
              borderRadius: BorderRadius.circular(14),
            ),
            child: const Icon(
              Icons.check_circle_outline_rounded,
              color: Color(0xFFD97706),
              size: 26,
            ),
          ),
          const SizedBox(height: 16),
          const Text(
            'End Break & Resume Shift?',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w800,
              color: AppColors.onSurface,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'This will complete your break session and return your status to active on-duty shift.',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 14,
              color: AppColors.onSurfaceVariant,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 24),
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: () => Navigator.pop(context),
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                    side: const BorderSide(color: AppColors.outline),
                  ),
                  child: const Text(
                    'Cancel',
                    style: TextStyle(color: AppColors.onSurfaceVariant),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ElevatedButton(
                  onPressed: onConfirm,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFD97706),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                  ),
                  child: const Text(
                    'End Break',
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

// ─── Clock Out Sheet ──────────────────────────────────────────────────────────

class _ClockOutSheet extends StatelessWidget {
  final VoidCallback onConfirm;
  const _ClockOutSheet({required this.onConfirm});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: AppColors.errorContainer,
              borderRadius: BorderRadius.circular(14),
            ),
            child: const Icon(
              Icons.logout_rounded,
              color: AppColors.error,
              size: 24,
            ),
          ),
          const SizedBox(height: 16),
          const Text(
            'Clock Out Now?',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: AppColors.onSurface,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'This will record your check-out time and end your active shift.',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 14,
              color: AppColors.onSurfaceVariant,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 24),
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: () => Navigator.pop(context),
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                    side: const BorderSide(color: AppColors.outline),
                  ),
                  child: const Text(
                    'Cancel',
                    style: TextStyle(color: AppColors.onSurfaceVariant),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ElevatedButton(
                  onPressed: onConfirm,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.error,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                  ),
                  child: const Text(
                    'Clock Out',
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
        ],
      ),
    );
  }
}

// ─── Today's Schedule Card ────────────────────────────────────────────────────

class _TodayScheduleCard extends StatelessWidget {
  final dynamic userShift; // UserShiftModel

  const _TodayScheduleCard({required this.userShift});

  @override
  Widget build(BuildContext context) {
    final shift = userShift.shift;
    return AppCard(
      padding: const EdgeInsets.all(18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.today_rounded, size: 16, color: AppColors.primary),
              SizedBox(width: 6),
              Text(
                'Today\'s Schedule',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: AppColors.primary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          if (shift != null) ...[
            Text(
              shift.name,
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w800,
                color: AppColors.onSurface,
                letterSpacing: -0.4,
              ),
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                _DetailItem(icon: Icons.schedule_rounded, text: shift.displayRange),
                const SizedBox(width: 16),
                _DetailItem(
                  icon: Icons.timer_rounded,
                  text: '${shift.totalHours.toStringAsFixed(1)}h shift',
                ),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                _DetailItem(
                  icon: Icons.coffee_rounded,
                  text: '${shift.maxAllowedBreaksDurationMinutes}m break allowed',
                ),
                const SizedBox(width: 16),
                const _DetailItem(
                  icon: Icons.location_city_rounded,
                  text: 'Floor 3 – East Wing',
                ),
              ],
            ),
            const SizedBox(height: 12),
            const Row(
              children: [
                Icon(
                  Icons.person_rounded,
                  size: 14,
                  color: AppColors.onSurfaceVariant,
                ),
                SizedBox(width: 5),
                Text(
                  'Supervisor: Dr. Sarah Malik',
                  style: TextStyle(
                    fontSize: 12,
                    color: AppColors.onSurfaceVariant,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}

class _DetailItem extends StatelessWidget {
  final IconData icon;
  final String text;
  const _DetailItem({required this.icon, required this.text});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 13, color: AppColors.onSurfaceVariant),
        const SizedBox(width: 4),
        Text(
          text,
          style: const TextStyle(
            fontSize: 12,
            color: AppColors.onSurfaceVariant,
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }
}

// ─── Quick Actions Row ────────────────────────────────────────────────────────

class _QuickActionsRow extends StatelessWidget {
  const _QuickActionsRow();

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Quick Actions',
          style: TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.w700,
            color: AppColors.onSurface,
          ),
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: _QuickActionButton(
                icon: Icons.swap_horiz_rounded,
                label: 'Request\nSwap',
                color: AppColors.primary,
                bgColor: AppColors.primaryContainer,
                onTap: () => _showComingSoon(context, 'Shift Swap Request'),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: _QuickActionButton(
                icon: Icons.event_busy_rounded,
                label: 'Report\nAbsence',
                color: AppColors.error,
                bgColor: AppColors.errorContainer,
                onTap: () => _showComingSoon(context, 'Absence Report'),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: _QuickActionButton(
                icon: Icons.receipt_long_rounded,
                label: 'View\nTimesheet',
                color: AppColors.secondary,
                bgColor: AppColors.secondaryContainer,
                onTap: () => _showComingSoon(context, 'Timesheet'),
              ),
            ),
          ],
        ),
      ],
    );
  }

  void _showComingSoon(BuildContext context, String feature) {
    HapticFeedback.lightImpact();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('$feature – Coming soon'),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        backgroundColor: AppColors.onSurface,
      ),
    );
  }
}

class _QuickActionButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final Color bgColor;
  final VoidCallback onTap;

  const _QuickActionButton({
    required this.icon,
    required this.label,
    required this.color,
    required this.bgColor,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        HapticFeedback.lightImpact();
        onTap();
      },
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 10),
        decoration: BoxDecoration(
          color: bgColor,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: color.withOpacity(0.2)),
        ),
        child: Column(
          children: [
            Icon(icon, color: color, size: 24),
            const SizedBox(height: 8),
            Text(
              label,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w600,
                color: color,
                height: 1.3,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

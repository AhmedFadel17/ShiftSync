// lib/screens/schedule/schedule_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import 'package:shiftsync_app/core/theme/app_theme.dart';
import 'package:shiftsync_app/data/models/user_shift_model.dart';
import 'package:shiftsync_app/providers/shift_provider.dart';
import 'package:shiftsync_app/widgets/shift_card.dart';

class ScheduleScreen extends StatefulWidget {
  const ScheduleScreen({super.key});

  @override
  State<ScheduleScreen> createState() => _ScheduleScreenState();
}

class _ScheduleScreenState extends State<ScheduleScreen> {
  DateTime _selectedDay = DateTime.now();

  List<DateTime> get _weekDays {
    // Generate 14 days from today
    return List.generate(
      14,
      (i) => DateTime.now().add(Duration(days: i)),
    );
  }

  @override
  Widget build(BuildContext context) {
    final shiftProv = context.watch<ShiftProvider>();
    final allShifts = shiftProv.userShifts;
    final upcomingShifts = shiftProv.upcomingShifts;

    // Filter shifts matching selected day from all user shifts
    final selectedDayShifts = allShifts
        .where((s) =>
            s.date.year == _selectedDay.year &&
            s.date.month == _selectedDay.month &&
            s.date.day == _selectedDay.day)
        .toList();

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('My Schedule'),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 16),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
              decoration: BoxDecoration(
                color: AppColors.primaryContainer,
                borderRadius: BorderRadius.circular(100),
              ),
              child: Text(
                '${upcomingShifts.length} upcoming',
                style: const TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  color: AppColors.primary,
                ),
              ),
            ),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          await shiftProv.refreshAllData();
        },
        child: Column(
          children: [
            // ── Horizontal Date Strip ──────────────────────────────────────────────
            Container(
              color: Colors.white,
              padding: const EdgeInsets.fromLTRB(0, 4, 0, 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Text(
                      DateFormat('MMMM yyyy').format(_selectedDay),
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: AppColors.onSurface,
                      ),
                    ),
                  ),
                  const SizedBox(height: 10),
                  SizedBox(
                    height: 76,
                    child: ListView.builder(
                      scrollDirection: Axis.horizontal,
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      itemCount: _weekDays.length,
                      itemBuilder: (context, index) {
                        final day = _weekDays[index];
                        final isSelected = day.day == _selectedDay.day &&
                            day.month == _selectedDay.month;
                        final isToday = day.day == DateTime.now().day &&
                            day.month == DateTime.now().month;
                        final hasShift = allShifts.any((s) =>
                            s.date.year == day.year &&
                            s.date.month == day.month &&
                            s.date.day == day.day);

                        return GestureDetector(
                          onTap: () {
                            HapticFeedback.selectionClick();
                            setState(() => _selectedDay = day);
                          },
                          child: AnimatedContainer(
                            duration: const Duration(milliseconds: 200),
                            width: 52,
                            margin: const EdgeInsets.symmetric(horizontal: 3),
                            decoration: BoxDecoration(
                              gradient: isSelected ? AppColors.primaryGradient : null,
                              color: isSelected ? null : (isToday ? AppColors.primaryContainer : Colors.transparent),
                              borderRadius: BorderRadius.circular(14),
                            ),
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Text(
                                  DateFormat('EEE').format(day).toUpperCase(),
                                  style: TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.w700,
                                    color: isSelected
                                        ? Colors.white.withOpacity(0.8)
                                        : AppColors.onSurfaceVariant,
                                    letterSpacing: 0.5,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  day.day.toString(),
                                  style: TextStyle(
                                    fontSize: 20,
                                    fontWeight: FontWeight.w800,
                                    color: isSelected
                                        ? Colors.white
                                        : (isToday ? AppColors.primary : AppColors.onSurface),
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Container(
                                  width: 5,
                                  height: 5,
                                  decoration: BoxDecoration(
                                    color: hasShift
                                        ? (isSelected ? Colors.white : AppColors.primary)
                                        : Colors.transparent,
                                    shape: BoxShape.circle,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ),
            ),

            // ── Shift List ─────────────────────────────────────────────────────────
            Expanded(
              child: CustomScrollView(
                physics: const AlwaysScrollableScrollPhysics(
                  parent: BouncingScrollPhysics(),
                ),
                slivers: [
                  SliverPadding(
                    padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
                    sliver: selectedDayShifts.isEmpty
                        ? SliverFillRemaining(
                            hasScrollBody: false,
                            child: _EmptyDayState(
                              selectedDay: _selectedDay,
                            ),
                          )
                        : SliverList(
                            delegate: SliverChildBuilderDelegate(
                              (context, index) => Padding(
                                padding: const EdgeInsets.only(bottom: 12),
                                child: ShiftCard(
                                  userShift: selectedDayShifts[index],
                                  onSwapRequested: () {
                                    _showSwapSheet(context, selectedDayShifts[index], shiftProv);
                                  },
                                ),
                              ),
                              childCount: selectedDayShifts.length,
                            ),
                          ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showSwapSheet(
      BuildContext context, UserShiftModel shift, ShiftProvider prov) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _SwapRequestSheet(
        shift: shift,
        onConfirm: (teammate) {
          prov.requestShiftSwap(shift.id);
          Navigator.pop(context);
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Swap requested with $teammate'),
              behavior: SnackBarBehavior.floating,
              backgroundColor: AppColors.secondary,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
          );
        },
      ),
    );
  }
}

// ─── Empty Day State ──────────────────────────────────────────────────────────

class _EmptyDayState extends StatelessWidget {
  final DateTime selectedDay;
  const _EmptyDayState({required this.selectedDay});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 72,
            height: 72,
            decoration: BoxDecoration(
              color: AppColors.surfaceContainer,
              borderRadius: BorderRadius.circular(20),
            ),
            child: const Icon(
              Icons.event_available_rounded,
              size: 36,
              color: AppColors.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 16),
          Text(
            'No shifts on ${DateFormat('MMMM d').format(selectedDay)}',
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: AppColors.onSurface,
            ),
          ),
          const SizedBox(height: 6),
          const Text(
            'Enjoy your day off!',
            style: TextStyle(
              fontSize: 13,
              color: AppColors.onSurfaceVariant,
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Swap Request Bottom Sheet ────────────────────────────────────────────────

class _SwapRequestSheet extends StatefulWidget {
  final UserShiftModel shift;
  final ValueChanged<String> onConfirm;

  const _SwapRequestSheet({required this.shift, required this.onConfirm});

  @override
  State<_SwapRequestSheet> createState() => _SwapRequestSheetState();
}

class _SwapRequestSheetState extends State<_SwapRequestSheet> {
  String? _selectedTeammate;
  final _teammates = const [
    'Maria Chen',
    'Jordan Smith',
    'Priya Nair',
    'Carlos Mendez',
    'Aisha Williams',
  ];

  @override
  Widget build(BuildContext context) {
    final shift = widget.shift.shift;
    return DraggableScrollableSheet(
      initialChildSize: 0.65,
      minChildSize: 0.4,
      maxChildSize: 0.9,
      builder: (context, controller) => Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
        ),
        child: ListView(
          controller: controller,
          padding: const EdgeInsets.fromLTRB(20, 0, 20, 40),
          children: [
            // Handle
            Center(
              child: Container(
                margin: const EdgeInsets.only(top: 12, bottom: 20),
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: AppColors.outline,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),

            // Sheet header
            Row(
              children: [
                Container(
                  width: 44, height: 44,
                  decoration: BoxDecoration(
                    color: AppColors.primaryContainer,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(Icons.swap_horiz_rounded, color: AppColors.primary),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Request Shift Swap',
                        style: TextStyle(fontSize: 17, fontWeight: FontWeight.w800, color: AppColors.onSurface),
                      ),
                      Text(
                        shift?.displayRange ?? '',
                        style: const TextStyle(fontSize: 12, color: AppColors.onSurfaceVariant),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),

            // Shift info chip
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppColors.surfaceContainer,
                borderRadius: BorderRadius.circular(14),
              ),
              child: Row(
                children: [
                  const Icon(Icons.work_rounded, size: 16, color: AppColors.primary),
                  const SizedBox(width: 10),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        shift?.name ?? 'Shift',
                        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.onSurface),
                      ),
                      Text(
                        widget.shift.formattedDate,
                        style: const TextStyle(fontSize: 12, color: AppColors.onSurfaceVariant),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            const Text(
              'Select a replacement teammate',
              style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.onSurface),
            ),
            const SizedBox(height: 12),

            // Teammate list
            ..._teammates.map((name) => GestureDetector(
              onTap: () {
                HapticFeedback.selectionClick();
                setState(() => _selectedTeammate = name);
              },
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                margin: const EdgeInsets.only(bottom: 8),
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: _selectedTeammate == name
                      ? AppColors.primaryContainer
                      : Colors.white,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: _selectedTeammate == name
                        ? AppColors.primary.withOpacity(0.5)
                        : AppColors.outlineVariant,
                  ),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 38,
                      height: 38,
                      decoration: BoxDecoration(
                        gradient: AppColors.primaryGradient,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Center(
                        child: Text(
                          name[0],
                          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(name, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.onSurface)),
                          const Text('Available for swap', style: TextStyle(fontSize: 11, color: AppColors.secondary)),
                        ],
                      ),
                    ),
                    if (_selectedTeammate == name)
                      const Icon(Icons.check_circle_rounded, color: AppColors.primary, size: 20),
                  ],
                ),
              ),
            )),

            const SizedBox(height: 16),

            ElevatedButton(
              onPressed: _selectedTeammate != null
                  ? () => widget.onConfirm(_selectedTeammate!)
                  : null,
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              ),
              child: const Text(
                'Submit Swap Request',
                style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

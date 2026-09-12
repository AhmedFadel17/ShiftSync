// lib/screens/shell/main_shell.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shiftsync_app/core/theme/app_theme.dart';
import 'package:shiftsync_app/providers/shift_provider.dart';
import 'package:shiftsync_app/screens/home/home_screen.dart';
import 'package:shiftsync_app/screens/notifications/notifications_screen.dart';
import 'package:shiftsync_app/screens/records/records_screen.dart';
import 'package:shiftsync_app/screens/schedule/schedule_screen.dart';

class MainShell extends StatefulWidget {
  const MainShell({super.key});

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  int _currentIndex = 0;

  final List<Widget> _screens = const [
    HomeScreen(),
    ScheduleScreen(),
    RecordsScreen(),
    NotificationsScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    final shiftProv = context.watch<ShiftProvider>();

    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: AppColors.onSurface.withOpacity(0.06),
              blurRadius: 20,
              offset: const Offset(0, -4),
            ),
          ],
        ),
        child: SafeArea(
          child: SizedBox(
            height: 68,
            child: Row(
              children: [
                _NavItem(
                  icon: Icons.home_rounded,
                  activeIcon: Icons.home_rounded,
                  label: 'Home',
                  isActive: _currentIndex == 0,
                  onTap: () => _setTab(0),
                  badge: shiftProv.isClockedIn ? 'LIVE' : null,
                  badgeColor: AppColors.secondary,
                ),
                _NavItem(
                  icon: Icons.calendar_month_outlined,
                  activeIcon: Icons.calendar_month_rounded,
                  label: 'Schedule',
                  isActive: _currentIndex == 1,
                  onTap: () => _setTab(1),
                ),
                _NavItem(
                  icon: Icons.history_outlined,
                  activeIcon: Icons.history_rounded,
                  label: 'Records',
                  isActive: _currentIndex == 2,
                  onTap: () => _setTab(2),
                ),
                _NavItem(
                  icon: Icons.notifications_outlined,
                  activeIcon: Icons.notifications_rounded,
                  label: 'Alerts',
                  isActive: _currentIndex == 3,
                  onTap: () => _setTab(3),
                  badge: shiftProv.unreadCount > 0 ? '${shiftProv.unreadCount}' : null,
                  badgeColor: AppColors.error,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _setTab(int index) {
    setState(() => _currentIndex = index);
  }
}

class _NavItem extends StatelessWidget {
  final IconData icon;
  final IconData activeIcon;
  final String label;
  final bool isActive;
  final VoidCallback onTap;
  final String? badge;
  final Color? badgeColor;

  const _NavItem({
    required this.icon,
    required this.activeIcon,
    required this.label,
    required this.isActive,
    required this.onTap,
    this.badge,
    this.badgeColor,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        behavior: HitTestBehavior.opaque,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          curve: Curves.easeInOut,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Stack(
                clipBehavior: Clip.none,
                children: [
                  AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                    decoration: BoxDecoration(
                      color: isActive ? AppColors.primaryContainer : Colors.transparent,
                      borderRadius: BorderRadius.circular(100),
                    ),
                    child: Icon(
                      isActive ? activeIcon : icon,
                      color: isActive ? AppColors.primary : AppColors.onSurfaceVariant,
                      size: 22,
                    ),
                  ),
                  if (badge != null)
                    Positioned(
                      top: -2,
                      right: 0,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                        constraints: const BoxConstraints(minWidth: 16, minHeight: 16),
                        decoration: BoxDecoration(
                          color: badgeColor ?? AppColors.error,
                          borderRadius: BorderRadius.circular(100),
                        ),
                        child: Text(
                          badge!,
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 9,
                            fontWeight: FontWeight.w800,
                            letterSpacing: 0.3,
                          ),
                        ),
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 3),
              AnimatedDefaultTextStyle(
                duration: const Duration(milliseconds: 200),
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: isActive ? FontWeight.w700 : FontWeight.w500,
                  color: isActive ? AppColors.primary : AppColors.onSurfaceVariant,
                ),
                child: Text(label),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

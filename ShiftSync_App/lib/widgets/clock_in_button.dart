// lib/widgets/clock_in_button.dart
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:shiftsync_app/core/theme/app_theme.dart';

class ClockInButton extends StatefulWidget {
  final bool isClockedIn;
  final VoidCallback onClockIn;
  final VoidCallback onClockOut;

  const ClockInButton({
    super.key,
    required this.isClockedIn,
    required this.onClockIn,
    required this.onClockOut,
  });

  @override
  State<ClockInButton> createState() => _ClockInButtonState();
}

class _ClockInButtonState extends State<ClockInButton>
    with SingleTickerProviderStateMixin {
  late AnimationController _pulseController;
  late Animation<double> _pulseAnimation;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    )..repeat(reverse: true);
    _pulseAnimation = Tween<double>(begin: 1.0, end: 1.05).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  void _onPressed() {
    HapticFeedback.mediumImpact();
    if (widget.isClockedIn) {
      widget.onClockOut();
    } else {
      widget.onClockIn();
    }
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: _onPressed,
      child: AnimatedBuilder(
        animation: _pulseAnimation,
        builder: (context, child) {
          return Transform.scale(
            scale: widget.isClockedIn ? _pulseAnimation.value : 1.0,
            child: child,
          );
        },
        child: Container(
          width: double.infinity,
          height: 64,
          decoration: BoxDecoration(
            gradient: widget.isClockedIn
                ? const LinearGradient(
                    colors: [Color(0xFF059669), Color(0xFF10B981)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  )
                : AppColors.primaryGradient,
            borderRadius: BorderRadius.circular(18),
            boxShadow: [
              BoxShadow(
                color: (widget.isClockedIn ? AppColors.secondary : AppColors.primary)
                    .withOpacity(0.35),
                blurRadius: 20,
                spreadRadius: 0,
                offset: const Offset(0, 6),
              ),
            ],
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.2),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  widget.isClockedIn
                      ? Icons.logout_rounded
                      : Icons.login_rounded,
                  color: Colors.white,
                  size: 20,
                ),
              ),
              const SizedBox(width: 14),
              Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    widget.isClockedIn ? 'Clock Out' : 'Clock In',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 17,
                      fontWeight: FontWeight.w700,
                      letterSpacing: -0.3,
                    ),
                  ),
                  Text(
                    widget.isClockedIn ? 'Tap to end your shift' : 'Tap to start your shift',
                    style: TextStyle(
                      color: Colors.white.withOpacity(0.8),
                      fontSize: 12,
                      fontWeight: FontWeight.w400,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

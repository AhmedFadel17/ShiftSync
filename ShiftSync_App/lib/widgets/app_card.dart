// lib/widgets/app_card.dart
import 'package:flutter/material.dart';
import 'package:shiftsync_app/core/theme/app_theme.dart';

class AppCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry? padding;
  final VoidCallback? onTap;
  final Color? color;
  final double radius;
  final List<BoxShadow>? shadows;
  final Border? border;
  final Gradient? gradient;

  const AppCard({
    super.key,
    required this.child,
    this.padding,
    this.onTap,
    this.color,
    this.radius = 20,
    this.shadows,
    this.border,
    this.gradient,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(radius),
        splashColor: AppColors.primary.withOpacity(0.06),
        highlightColor: AppColors.primary.withOpacity(0.03),
        child: Ink(
          decoration: BoxDecoration(
            color: gradient == null ? (color ?? Colors.white) : null,
            gradient: gradient,
            borderRadius: BorderRadius.circular(radius),
            boxShadow: shadows ?? [AppColors.cardShadow],
            border: border ?? Border.all(color: AppColors.outlineVariant, width: 1),
          ),
          child: Padding(
            padding: padding ?? const EdgeInsets.all(20),
            child: child,
          ),
        ),
      ),
    );
  }
}

// test/widget_test.dart
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:shiftsync_app/main.dart';
import 'package:shiftsync_app/providers/auth_provider.dart';
import 'package:shiftsync_app/providers/shift_provider.dart';

void main() {
  testWidgets('ShiftSync app smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(
      MultiProvider(
        providers: [
          ChangeNotifierProvider(create: (_) => AuthProvider()),
          ChangeNotifierProvider(create: (_) => ShiftProvider()),
        ],
        child: const ShiftSyncApp(),
      ),
    );
    // App should render without throwing
    expect(find.byType(ShiftSyncApp), findsOneWidget);
  });
}

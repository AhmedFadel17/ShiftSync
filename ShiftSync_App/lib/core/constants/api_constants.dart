// lib/core/constants/api_constants.dart

class ApiConstants {
  // Adjust this to match your dev machine's IP when testing on a physical device
  // For Android emulator use: http://10.0.2.2:7087
  // For physical device use: http://<your-machine-local-IP>:7087
  static const String baseUrl = 'https://truantly-toothiest-shenita.ngrok-free.dev';
  //'https://localhost:7087';

  // Endpoints
  static const String login = '/api/Auth/Login';
  static const String register = '/api/Auth/Register';
  static const String users = '/api/Users';
  static const String shifts = '/api/Shifts';
  static const String userShifts = '/api/UserShifts';
  static const String attendances = '/api/Attendances';
  static const String attendanceBreaks = '/api/AttendanceBreaks';
  static const String breakTypes = '/api/BreakTypes';
}

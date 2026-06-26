// ─────────────────────────────────────────────────────────────────────────────
// Blueprint theme — technical-drawing palette (blue paper, cyan linework).
// One source of truth for colors, gradients and text styles.
// ─────────────────────────────────────────────────────────────────────────────
import 'package:flutter/material.dart';

class Bp {
  // palette
  static const bg = Color(0xFF08182E);
  static const bg2 = Color(0xFF0A1F3A);
  static const accent = Color(0xFF5FB0FF);
  static const accent2 = Color(0xFF8FD4FF);
  static const ink = Color(0xFFDCE9FF);
  static const muted = Color(0xFF7E9BC4);
  static const edge = Color(0x475FB0FF); // accent @ ~28%
  static const panel = Color(0xB80A1C34); // frosted navy

  // type
  static const mono = 'monospace';
  static const titleStyle = TextStyle(color: ink, fontSize: 15, fontWeight: FontWeight.w600, letterSpacing: .4);
  static const bodyStyle = TextStyle(color: ink, fontSize: 13.5, height: 1.5);
  static const labelStyle = TextStyle(color: muted, fontSize: 11, fontFamily: mono, letterSpacing: .5);
  static const dataKey = TextStyle(color: muted, fontSize: 12, fontFamily: mono);
  static const dataVal = TextStyle(color: ink, fontSize: 12, fontFamily: mono);

  // surfaces
  static BoxDecoration glass({double radius = 18}) => BoxDecoration(
        color: panel,
        borderRadius: BorderRadius.circular(radius),
        border: Border.all(color: edge),
        boxShadow: const [BoxShadow(color: Color(0x8C000000), blurRadius: 40, offset: Offset(0, 18))],
      );

  static const sendGradient = LinearGradient(
    begin: Alignment.topCenter, end: Alignment.bottomCenter,
    colors: [Color(0xFF6FBCFF), Color(0xFF3D86E6)],
  );

  // a faint blueprint grid you can paint behind anything
  static Widget grid({Widget? child}) => CustomPaint(painter: _GridPainter(), child: child);
}

class _GridPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final p = Paint()
      ..color = const Color(0x145FB0FF)
      ..strokeWidth = 1;
    const step = 42.0;
    for (double x = 0; x < size.width; x += step) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), p);
    }
    for (double y = 0; y < size.height; y += step) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), p);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

// ─────────────────────────────────────────────────────────────────────────────
// Scene embed (non-web fallback). Mobile/desktop don't get the iframe bridge;
// for those, swap in webview_flutter + a JavaScriptChannel. This keeps the rest
// of the app compiling on every platform.
// ─────────────────────────────────────────────────────────────────────────────
import 'dart:async';
import 'package:flutter/widgets.dart';
import 'blueprint_agent.dart';
import 'blueprint_theme.dart';

class SceneController {
  SceneController({required String sceneUrl});

  Widget view() => const ColoredBox(
        color: Bp.bg,
        child: Center(
          child: Text('3D scene runs on Flutter Web build',
              style: TextStyle(color: Bp.muted, fontFamily: Bp.mono, fontSize: 12)),
        ),
      );

  Stream<String> get partTaps => const Stream.empty();
  Future<void> runActions(List<SceneAction> actions) async {}
  void runOne(String tool, [Map<String, dynamic> args = const {}]) {}
  void dispose() {}
}

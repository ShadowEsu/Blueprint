// ─────────────────────────────────────────────────────────────────────────────
// Scene embed (Flutter WEB) — hosts the Three.js scene in an <iframe> and bridges
// to it with postMessage. Flutter → scene: run actions. scene → Flutter: part taps.
// This file is only compiled on web (see blueprint_scene.dart barrel).
// ─────────────────────────────────────────────────────────────────────────────
import 'dart:async';
import 'dart:convert';
import 'dart:html' as html;
import 'dart:ui_web' as ui_web;
import 'package:flutter/widgets.dart';
import 'blueprint_agent.dart';

class SceneController {
  final String sceneUrl; // e.g. http://localhost:5500/blueprint-scene.html
  final String _viewType;
  late final html.IFrameElement _iframe;
  final _taps = StreamController<String>.broadcast();

  SceneController({required this.sceneUrl})
      : _viewType = 'bp-scene-${DateTime.now().microsecondsSinceEpoch}' {
    _iframe = html.IFrameElement()
      ..src = sceneUrl
      ..style.border = 'none'
      ..style.width = '100%'
      ..style.height = '100%';
    // ignore: undefined_prefixed_name
    ui_web.platformViewRegistry.registerViewFactory(_viewType, (int _) => _iframe);
    html.window.onMessage.listen((e) {
      try {
        final d = jsonDecode(e.data as String);
        if (d is Map && d['type'] == 'partTap') _taps.add(d['part'] as String);
      } catch (_) {}
    });
  }

  Widget view() => HtmlElementView(viewType: _viewType);
  Stream<String> get partTaps => _taps.stream;

  Future<void> runActions(List<SceneAction> actions) async {
    for (final a in actions) {
      _post({'type': 'action', 'tool': a.tool, 'args': a.args});
      await Future.delayed(const Duration(milliseconds: 480));
    }
  }

  void runOne(String tool, [Map<String, dynamic> args = const {}]) =>
      _post({'type': 'action', 'tool': tool, 'args': args});

  void _post(Map<String, dynamic> m) =>
      _iframe.contentWindow?.postMessage(jsonEncode(m), '*');

  void dispose() => _taps.close();
}

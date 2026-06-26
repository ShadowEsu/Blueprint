// ─────────────────────────────────────────────────────────────────────────────
// BlueprintScreen — composes the 3D scene (full-screen) with the Blueprint
// bubble overlaid bottom-right. Drop this in as a route/home.
//
//   BlueprintScreen(
//     agentUrl: 'http://localhost:8000',
//     sceneUrl: 'http://localhost:5500/blueprint-scene.html',
//   )
// ─────────────────────────────────────────────────────────────────────────────
import 'package:flutter/material.dart';
import 'blueprint_agent.dart';
import 'blueprint_bubble.dart';
import 'blueprint_scene.dart';
import 'blueprint_theme.dart';

class BlueprintScreen extends StatefulWidget {
  final String agentUrl;
  final String sceneUrl;
  final String? anonKey;
  const BlueprintScreen({
    super.key,
    required this.agentUrl,
    required this.sceneUrl,
    this.anonKey,
  });

  @override
  State<BlueprintScreen> createState() => _BlueprintScreenState();
}

class _BlueprintScreenState extends State<BlueprintScreen> {
  late final BlueprintAgent _agent =
      BlueprintAgent(endpoint: Uri.parse(widget.agentUrl), anonKey: widget.anonKey);
  late final SceneController _scene = SceneController(sceneUrl: widget.sceneUrl);

  @override
  void initState() {
    super.initState();
    // Tapping a part in the 3D scene asks Blueprint about it.
    _scene.partTaps.listen((part) {
      // handled inside the bubble via onSubmit; here we could auto-open, etc.
    });
  }

  @override
  void dispose() {
    _scene.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Bp.bg,
      body: Stack(
        children: [
          Positioned.fill(child: _scene.view()),
          BlueprintBubble(
            onSubmit: (text) => _agent.send(text),
            onActions: (actions) => _scene.runActions(actions),
          ),
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Atlas AI — Flutter client + action executor.
//
// Two pieces, mirroring the server's design:
//   • AtlasAgent     — calls the edge function, returns a typed AgentResponse.
//   • ActionExecutor — a registry of handlers, one per scene tool. Adding a new
//                      scene action on the client is `executor.register('name', ...)`
//                      — exactly as flexible as adding a tool on the server.
//
// No third-party packages required (uses dart:convert + http). Drop into lib/.
// ─────────────────────────────────────────────────────────────────────────────

import 'dart:convert';
import 'package:http/http.dart' as http;

/// A scene command returned by the agent, e.g. focus_camera{target: rear}.
class SceneAction {
  final String tool;
  final Map<String, dynamic> args;
  SceneAction(this.tool, this.args);

  factory SceneAction.fromJson(Map<String, dynamic> j) =>
      SceneAction(j['tool'] as String, Map<String, dynamic>.from(j['args'] ?? {}));
}

/// The full response: what Atlas says, what to do, and any structured data.
class AgentResponse {
  final String speech;
  final List<SceneAction> actions;
  final Map<String, dynamic> data;
  AgentResponse({required this.speech, required this.actions, required this.data});

  factory AgentResponse.fromJson(Map<String, dynamic> j) => AgentResponse(
        speech: (j['speech'] ?? '') as String,
        actions: ((j['actions'] ?? []) as List)
            .map((a) => SceneAction.fromJson(Map<String, dynamic>.from(a)))
            .toList(),
        data: Map<String, dynamic>.from(j['data'] ?? {}),
      );
}

/// One past turn of conversation, sent for context.
class ChatTurn {
  final String role; // 'user' | 'assistant'
  final String content;
  ChatTurn(this.role, this.content);
  Map<String, dynamic> toJson() => {'role': role, 'content': content};
}

/// Talks to the Supabase Edge Function.
class AtlasAgent {
  final Uri endpoint; // https://<project>.supabase.co/functions/v1/agent
  final String anonKey;
  AtlasAgent({required this.endpoint, required this.anonKey});

  Future<AgentResponse> send(
    String message, {
    Map<String, dynamic>? context,
    List<ChatTurn> history = const [],
  }) async {
    final res = await http.post(
      endpoint,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $anonKey',
      },
      body: jsonEncode({
        'message': message,
        'context': context ?? {},
        'history': history.map((t) => t.toJson()).toList(),
      }),
    );
    if (res.statusCode != 200) {
      throw Exception('Atlas error ${res.statusCode}: ${res.body}');
    }
    return AgentResponse.fromJson(jsonDecode(res.body));
  }
}

/// Signature for a handler that performs one scene action.
typedef ActionHandler = Future<void> Function(Map<String, dynamic> args);

/// Registry of scene-action handlers. The client-side twin of the tool registry.
///
/// Usage:
///   final exec = ActionExecutor()
///     ..register('focus_camera', (a) => scene.focusCamera(a['target']))
///     ..register('highlight',    (a) => scene.highlight(a['target']))
///     ..register('set_paint',    (a) => scene.setPaint(a['color']));
///
///   await exec.run(response.actions);
class ActionExecutor {
  final Map<String, ActionHandler> _handlers = {};

  ActionExecutor register(String tool, ActionHandler handler) {
    _handlers[tool] = handler;
    return this;
  }

  /// Run actions in order. Unknown actions are logged, not fatal — so the app
  /// keeps working when the model uses a tool the client hasn't wired up yet.
  Future<void> run(List<SceneAction> actions) async {
    for (final a in actions) {
      final handler = _handlers[a.tool];
      if (handler == null) {
        // ignore: avoid_print
        print('[Atlas] no handler for action "${a.tool}" — skipping');
        continue;
      }
      await handler(a.args);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Example wiring (pseudo — point the handlers at your Three.js bridge).
//
//   final atlas = AtlasAgent(
//     endpoint: Uri.parse('https://YOURPROJECT.supabase.co/functions/v1/agent'),
//     anonKey: 'YOUR_SUPABASE_ANON_KEY',
//   );
//
//   final executor = ActionExecutor()
//     ..register('focus_camera', (a) => sceneBridge.call('focusCamera', a))
//     ..register('highlight',    (a) => sceneBridge.call('highlight', a))
//     ..register('explode',      (a) => sceneBridge.call('explode', a))
//     ..register('reset_view',   (a) => sceneBridge.call('resetView', a))
//     ..register('show_labels',  (a) => sceneBridge.call('showLabels', a))
//     ..register('show_specs',   (a) => showSpecCard(a['part'], lastResponse.data))
//     ..register('set_paint',    (a) => sceneBridge.call('setPaint', a));
//
//   Future<void> onUserMessage(String text) async {
//     final r = await atlas.send(text, context: {
//       'carId': 'demo-gt',
//       'selectedPart': selectedPart,
//       'mode': currentMode,
//     });
//     await executor.run(r.actions);   // the car moves
//     bubble.show(r.speech);           // Atlas speaks
//   }
// ─────────────────────────────────────────────────────────────────────────────

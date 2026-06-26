// ─────────────────────────────────────────────────────────────────────────────
// Blueprint agent client — talks to the Supabase Edge Function and returns a
// typed { speech, actions[], data } response. Same contract as types.ts.
// ─────────────────────────────────────────────────────────────────────────────
import 'dart:convert';
import 'package:http/http.dart' as http;

class SceneAction {
  final String tool;
  final Map<String, dynamic> args;
  SceneAction(this.tool, this.args);
  factory SceneAction.fromJson(Map<String, dynamic> j) =>
      SceneAction(j['tool'] as String, Map<String, dynamic>.from(j['args'] ?? {}));
}

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

class ChatTurn {
  final String role; // 'user' | 'assistant'
  final String content;
  ChatTurn(this.role, this.content);
  Map<String, dynamic> toJson() => {'role': role, 'content': content};
}

class BlueprintAgent {
  final Uri endpoint; // https://<project>.supabase.co/functions/v1/agent  (or http://localhost:8000)
  final String? anonKey;
  BlueprintAgent({required this.endpoint, this.anonKey});

  Future<AgentResponse> send(String message,
      {Map<String, dynamic>? context, List<ChatTurn> history = const []}) async {
    final res = await http.post(
      endpoint,
      headers: {
        'Content-Type': 'application/json',
        if (anonKey != null) 'Authorization': 'Bearer $anonKey',
      },
      body: jsonEncode({
        'message': message,
        'context': context ?? {'car': '911 GT3 RS'},
        'history': history.map((t) => t.toJson()).toList(),
      }),
    );
    if (res.statusCode != 200) {
      throw Exception('Blueprint error ${res.statusCode}: ${res.body}');
    }
    return AgentResponse.fromJson(jsonDecode(res.body));
  }
}

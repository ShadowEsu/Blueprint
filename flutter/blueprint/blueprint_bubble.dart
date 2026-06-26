// ─────────────────────────────────────────────────────────────────────────────
// BlueprintBubble — the sleek, blueprint-themed AI bubble.
//
// A breathing orb that expands into a frosted panel with chips, an input, chat
// messages, action traces and verified spec cards. Self-contained; you feed it
// two callbacks: onSubmit (ask the agent) and onActions (run scene actions).
// ─────────────────────────────────────────────────────────────────────────────
import 'package:flutter/material.dart';
import 'blueprint_agent.dart';
import 'blueprint_theme.dart';

enum _Kind { me, bp, acts, specs }

class _Msg {
  final _Kind kind;
  final String? text;
  final Map<String, dynamic>? specs; // for spec cards
  _Msg(this.kind, {this.text, this.specs});
}

class BlueprintBubble extends StatefulWidget {
  final Future<AgentResponse> Function(String text) onSubmit;
  final Future<void> Function(List<SceneAction> actions) onActions;
  final List<String> suggestions;

  const BlueprintBubble({
    super.key,
    required this.onSubmit,
    required this.onActions,
    this.suggestions = const [
      'Show me the engine',
      'Explain the suspension',
      'Explode the whole car',
      'Isolate the brakes',
      'Paint it Nardo Grey',
      'Reset view',
    ],
  });

  @override
  State<BlueprintBubble> createState() => _BlueprintBubbleState();
}

class _BlueprintBubbleState extends State<BlueprintBubble> with TickerProviderStateMixin {
  bool _open = false;
  bool _busy = false;
  final _msgs = <_Msg>[
    _Msg(_Kind.bp, text: 'Ask me to show, explain, explode, isolate, or repaint any part of this car.'),
  ];
  final _input = TextEditingController();
  final _scroll = ScrollController();
  late final AnimationController _breath =
      AnimationController(vsync: this, duration: const Duration(seconds: 3))..repeat(reverse: true);

  @override
  void dispose() {
    _breath.dispose();
    _input.dispose();
    _scroll.dispose();
    super.dispose();
  }

  Future<void> _ask(String text) async {
    text = text.trim();
    if (text.isEmpty || _busy) return;
    setState(() {
      _busy = true;
      _msgs.add(_Msg(_Kind.me, text: text));
    });
    _input.clear();
    _scrollDown();
    try {
      final r = await widget.onSubmit(text);
      if (r.actions.isNotEmpty) {
        _msgs.add(_Msg(_Kind.acts,
            text: r.actions.map((a) => '${a.tool}(${a.args.values.join(',')})').join('  →  ')));
      }
      if (r.speech.isNotEmpty) _msgs.add(_Msg(_Kind.bp, text: r.speech));
      final facts = r.data['get_part_facts'];
      if (facts is Map && facts['found'] != false && facts['facts'] is Map) {
        _msgs.add(_Msg(_Kind.specs, specs: Map<String, dynamic>.from(facts)));
      }
      setState(() {});
      _scrollDown();
      await widget.onActions(r.actions);
    } catch (e) {
      setState(() => _msgs.add(_Msg(_Kind.bp, text: '⚠️ $e')));
    } finally {
      setState(() => _busy = false);
      _scrollDown();
    }
  }

  void _scrollDown() => WidgetsBinding.instance.addPostFrameCallback((_) {
        if (_scroll.hasClients) _scroll.animateTo(_scroll.position.maxScrollExtent,
            duration: const Duration(milliseconds: 200), curve: Curves.easeOut);
      });

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: Alignment.bottomRight,
      child: Padding(
        padding: const EdgeInsets.all(26),
        child: AnimatedSwitcher(
          duration: const Duration(milliseconds: 260),
          transitionBuilder: (child, anim) => FadeTransition(
            opacity: anim,
            child: ScaleTransition(
              scale: Tween(begin: .85, end: 1.0).animate(CurvedAnimation(parent: anim, curve: Curves.easeOutBack)),
              alignment: Alignment.bottomRight,
              child: child,
            ),
          ),
          child: _open ? _panel() : _orb(),
        ),
      ),
    );
  }

  // ── Orb ────────────────────────────────────────────────────────────────────
  Widget _orb() => GestureDetector(
        key: const ValueKey('orb'),
        onTap: () => setState(() => _open = true),
        child: AnimatedBuilder(
          animation: _breath,
          builder: (_, __) {
            final g = _breath.value; // 0..1
            return Container(
              width: 66,
              height: 66,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: const RadialGradient(
                  center: Alignment(0, -.1),
                  radius: .9,
                  colors: [Color(0x4D5FB0FF), Color(0xEB08162C)],
                  stops: [0, .72],
                ),
                border: Border.all(color: Bp.edge),
                boxShadow: [
                  BoxShadow(color: Bp.accent.withOpacity(.30 + .25 * g), blurRadius: 22 + 18 * g, spreadRadius: 1),
                ],
              ),
              child: Center(
                child: Container(
                  width: 15,
                  height: 15,
                  decoration: const BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: RadialGradient(colors: [Color(0xFFEAF4FF), Color(0xFF8FD4FF)]),
                    boxShadow: [BoxShadow(color: Color(0xFF8FD4FF), blurRadius: 14)],
                  ),
                ),
              ),
            );
          },
        ),
      );

  // ── Panel ──────────────────────────────────────────────────────────────────
  Widget _panel() => Container(
        key: const ValueKey('panel'),
        width: 392,
        constraints: const BoxConstraints(maxHeight: 560),
        decoration: Bp.glass(),
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          _header(),
          Flexible(
            child: ListView.builder(
              controller: _scroll,
              padding: const EdgeInsets.fromLTRB(16, 14, 16, 6),
              itemCount: _msgs.length,
              itemBuilder: (_, i) => _msgWidget(_msgs[i]),
            ),
          ),
          _chips(),
          _inputRow(),
        ]),
      );

  Widget _header() => Container(
        padding: const EdgeInsets.fromLTRB(18, 15, 14, 15),
        decoration: const BoxDecoration(
          border: Border(bottom: BorderSide(color: Color(0x1F7FD0FF))),
        ),
        child: Row(children: [
          Container(
            width: 11, height: 11,
            decoration: const BoxDecoration(shape: BoxShape.circle, color: Bp.accent,
                boxShadow: [BoxShadow(color: Bp.accent, blurRadius: 12)]),
          ),
          const SizedBox(width: 10),
          const Text('Blueprint', style: Bp.titleStyle),
          const Spacer(),
          if (_busy)
            const SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2, color: Bp.accent)),
          const SizedBox(width: 12),
          GestureDetector(
            onTap: () => setState(() => _open = false),
            child: const Icon(Icons.close_rounded, color: Bp.muted, size: 20),
          ),
        ]),
      );

  Widget _msgWidget(_Msg m) {
    switch (m.kind) {
      case _Kind.me:
        return _bubbleRow(m.text!, Alignment.centerRight,
            const Color(0x295FB0FF), const Color(0x385FB0FF));
      case _Kind.bp:
        return _bubbleRow(m.text!, Alignment.centerLeft,
            const Color(0x0AFFFFFF), const Color(0x1F7FD0FF));
      case _Kind.acts:
        return Align(
          alignment: Alignment.centerLeft,
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 4),
            child: Text(m.text!, style: Bp.labelStyle),
          ),
        );
      case _Kind.specs:
        return _specCard(m.specs!);
    }
  }

  Widget _bubbleRow(String text, Alignment align, Color fill, Color border) => Align(
        alignment: align,
        child: Container(
          margin: const EdgeInsets.symmetric(vertical: 5),
          padding: const EdgeInsets.symmetric(horizontal: 13, vertical: 10),
          constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width.clamp(0, 340) * .9),
          decoration: BoxDecoration(
            color: fill,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: border),
          ),
          child: Text(text, style: Bp.bodyStyle),
        ),
      );

  Widget _specCard(Map<String, dynamic> info) {
    final facts = Map<String, dynamic>.from(info['facts'] as Map);
    return Align(
      alignment: Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 6),
        padding: const EdgeInsets.fromLTRB(13, 11, 13, 9),
        decoration: BoxDecoration(
          color: const Color(0x125FB0FF),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Bp.edge),
        ),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text('${(info['part'] ?? '').toString().toUpperCase()} — ${info['car'] ?? ''}',
              style: const TextStyle(color: Bp.accent2, fontFamily: Bp.mono, fontSize: 12, letterSpacing: .5)),
          const SizedBox(height: 6),
          ...facts.entries.map((e) => Padding(
                padding: const EdgeInsets.symmetric(vertical: 2),
                child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                  Text(e.key, style: Bp.dataKey),
                  Flexible(child: Text('${e.value}', style: Bp.dataVal, textAlign: TextAlign.right)),
                ]),
              )),
        ]),
      ),
    );
  }

  Widget _chips() => Padding(
        padding: const EdgeInsets.fromLTRB(14, 4, 14, 10),
        child: Wrap(
          spacing: 7,
          runSpacing: 7,
          children: widget.suggestions
              .map((s) => GestureDetector(
                    onTap: () => _ask(s),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 11, vertical: 6),
                      decoration: BoxDecoration(
                        color: const Color(0x145FB0FF),
                        borderRadius: BorderRadius.circular(18),
                        border: Border.all(color: const Color(0x337FD0FF)),
                      ),
                      child: Text(s, style: const TextStyle(color: Bp.ink, fontSize: 12)),
                    ),
                  ))
              .toList(),
        ),
      );

  Widget _inputRow() => Container(
        padding: const EdgeInsets.fromLTRB(14, 12, 14, 14),
        decoration: const BoxDecoration(border: Border(top: BorderSide(color: Color(0x1F7FD0FF)))),
        child: Row(children: [
          Expanded(
            child: TextField(
              controller: _input,
              style: Bp.bodyStyle,
              cursorColor: Bp.accent,
              onSubmitted: _ask,
              decoration: InputDecoration(
                hintText: 'Ask anything…',
                hintStyle: const TextStyle(color: Bp.muted, fontSize: 13.5),
                filled: true,
                fillColor: const Color(0x8C040E1C),
                contentPadding: const EdgeInsets.symmetric(horizontal: 13, vertical: 11),
                enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(11), borderSide: const BorderSide(color: Bp.edge)),
                focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(11), borderSide: const BorderSide(color: Bp.accent)),
              ),
            ),
          ),
          const SizedBox(width: 8),
          GestureDetector(
            onTap: () => _ask(_input.text),
            child: Container(
              height: 44,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              decoration: BoxDecoration(gradient: Bp.sendGradient, borderRadius: BorderRadius.circular(11)),
              alignment: Alignment.center,
              child: const Text('Ask', style: TextStyle(color: Color(0xFF04122A), fontWeight: FontWeight.w700)),
            ),
          ),
        ]),
      );
}

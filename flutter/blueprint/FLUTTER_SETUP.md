# Blueprint — Flutter UI

Sleek blueprint-themed UI for the Blueprint AI car explorer. The 3D scene runs in
a web view; all the chrome (orb, panel, chips, input, spec cards) is native Flutter.

## Files

```
blueprint_theme.dart        # palette, gradients, text styles, grid painter
blueprint_agent.dart        # HTTP client → {speech, actions, data}
blueprint_bubble.dart       # the orb + expandable panel UI (the redesign)
blueprint_scene.dart        # platform picker (web iframe vs stub)
blueprint_scene_web.dart    #   web: <iframe> + postMessage bridge
blueprint_scene_stub.dart   #   non-web fallback
blueprint_screen.dart       # composes scene + bubble overlay
```
Plus the scene page it loads: `../../web-test/blueprint-scene.html`.

## Dependencies

In your app's `pubspec.yaml`:

```yaml
dependencies:
  http: ^1.2.0
```

(No `webview_flutter` needed for the **web** build — it uses an iframe. For a
mobile build later, add `webview_flutter` and back `blueprint_scene_stub.dart`
with a `WebViewController` + `JavaScriptChannel`.)

## Run it (Flutter Web)

Three things run together:

```bash
# 1) the agent
cd atlas-ai && deno task serve                    # http://localhost:8000

# 2) the scene page + model (so the iframe can load them)
cd atlas-ai/web-test && python3 -m http.server 5500

# 3) your Flutter app
flutter run -d chrome
```

Copy the `blueprint/` folder into your app's `lib/`, then point your home at it:

```dart
import 'package:flutter/material.dart';
import 'blueprint/blueprint_screen.dart';

void main() => runApp(const MaterialApp(
      debugShowCheckedModeBanner: false,
      home: BlueprintScreen(
        agentUrl: 'http://localhost:8000',
        sceneUrl: 'http://localhost:5500/blueprint-scene.html',
      ),
    ));
```

That's it: the GT3 RS renders behind, the Blueprint orb sits bottom-right, and
asking it things ("show me the engine", "explode the whole car") drives the model.

## Any car model

The scene auto-classifies parts from a model's node names — no per-model code.
Drop a `.glb` into `web-test/models/` and load it with a query param:

```dart
sceneUrl: 'http://localhost:5500/blueprint-scene.html?model=mycar.glb',
```

## How it fits together

```
BlueprintBubble ──onSubmit──> BlueprintAgent ──HTTP──> agent (verified data)
       │                                                     │
       └──onActions(actions)──> SceneController ──postMessage──> blueprint-scene.html
                                                              (window.BlueprintScene)
```

The bubble never knows about Three.js; the scene never knows about the LLM. Same
clean seam as the rest of the project — swap either side freely.

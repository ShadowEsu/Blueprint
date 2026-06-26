// Picks the right SceneController for the platform (web iframe vs stub).
export 'blueprint_scene_web.dart' if (dart.library.io) 'blueprint_scene_stub.dart';

Hypercar Engine Teardown — interactive prototype
=================================================

OPEN
  Run a local server in this folder (loaders fetch the .glb files, which file://
  blocks in most browsers):
      python3 -m http.server
  then open  http://localhost:8000/index.html
  Needs internet (Three.js loads from CDN).

FLOW
  index.html         Car picker -> click a car's engine
  engine.html?car=…  Engine teardown page:
                       - drag to orbit, scroll to zoom
                       - EXPLODE slider spreads the parts
                       - click a part (in 3D or the side list) to isolate it
                       - Show all / Reset view / Spin toggle

CONTENTS
  engine_full.glb                Porsche GT3 RS engine (assembled)
  parts/                         14 GT3 RS engine sub-parts (regional)
  engine_full_tourbillon.glb     Tourbillon engine (assembled)
  parts_tourbillon/              6 Tourbillon engine sub-parts
  teardown_gt3rs.json            part manifest for the GT3 RS page
  teardown_tourbillon.json       part manifest for the Tourbillon page

IMPORTANT — about the breakdown
  These sub-parts are REGIONAL SEGMENTS of the engine geometry (the block mesh
  split into connected solids, then clustered by position: Upper/Lower, Left/
  Right/Center). They are NOT anatomically separate components.

  To get a true piston / intercooler / crankshaft / manifold breakdown like the
  Bugatti marketing render, the source must be a proper ENGINE ASSEMBLY model
  where each component is its own named object. The uploaded car models do not
  contain internal engine parts:
    - GT3 RS engine  = one external block mesh (3,832 tris)
    - Tourbillon engine = intake-bay surfaces only (1,574 tris)
  Drop in a component-built engine model and it plugs straight into this page.

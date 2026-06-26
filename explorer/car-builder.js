/* Procedural sports-car builder (Porsche-911-ish silhouette) for the
   Interactive Car Explorer. Builds a THREE.Group whose children are named,
   categorised "parts" carrying explode vectors + descriptions.
   Usage: const { group, parts } = window.CarKit.build({ THREE, RoundedBox, paint });
*/
(function () {
  function build(ctx) {
    const THREE = ctx.THREE;
    const RBox = ctx.RoundedBox || THREE.BoxGeometry;
    const paintColor = ctx.paint || 0x25527e;

    const root = new THREE.Group();
    const parts = [];

    // ---- materials -------------------------------------------------------
    const M = {
      paint: new THREE.MeshStandardMaterial({ color: paintColor, metalness: 0.88, roughness: 0.3, envMapIntensity: 1.25 }),
      paintDk: new THREE.MeshStandardMaterial({ color: 0x16202b, metalness: 0.7, roughness: 0.45 }),
      glass: new THREE.MeshStandardMaterial({ color: 0x07101a, metalness: 0.2, roughness: 0.05, transparent: true, opacity: 0.42, envMapIntensity: 1.6 }),
      tire: new THREE.MeshStandardMaterial({ color: 0x111316, metalness: 0.1, roughness: 0.85 }),
      rim: new THREE.MeshStandardMaterial({ color: 0xd2d6dc, metalness: 1.0, roughness: 0.22 }),
      brake: new THREE.MeshStandardMaterial({ color: 0xb8351f, metalness: 0.6, roughness: 0.4 }),
      trim: new THREE.MeshStandardMaterial({ color: 0x1c1f24, metalness: 0.6, roughness: 0.5 }),
      engine: new THREE.MeshStandardMaterial({ color: 0x53585f, metalness: 0.75, roughness: 0.5 }),
      headlight: new THREE.MeshStandardMaterial({ color: 0xeef4ff, emissive: 0xbcd6ff, emissiveIntensity: 1.1, roughness: 0.2 }),
      taillight: new THREE.MeshStandardMaterial({ color: 0x2a0608, emissive: 0xff2630, emissiveIntensity: 1.2, roughness: 0.3 }),
    };

    function rbox(w, h, d, r) {
      try { return new RBox(w, h, d, 4, r == null ? Math.min(w, h, d) * 0.22 : r); }
      catch (e) { return new THREE.BoxGeometry(w, h, d); }
    }
    function mesh(geo, mat) { const m = new THREE.Mesh(geo, mat); m.castShadow = true; m.receiveShadow = true; return m; }

    function P(name, cat, desc, base, explode, builder) {
      const g = new THREE.Group();
      builder(g);
      g.position.set(base[0], base[1], base[2]);
      g.userData = {
        partName: name, cat: cat, desc: desc,
        base: new THREE.Vector3(base[0], base[1], base[2]),
        explode: new THREE.Vector3(explode[0], explode[1], explode[2]),
      };
      g.traverse(function (o) { if (o.isMesh) o.userData.owner = g; });
      parts.push(g); root.add(g); return g;
    }

    // ---- chassis / body --------------------------------------------------
    P('Chassis & floor pan', 'Chassis',
      'The structural backbone — a bonded aluminium-and-steel floor pan that ties the suspension, drivetrain and cabin together and carries the crash loads.',
      [0, 0.30, 0], [0, -1.0, 0], function (g) {
        const m = mesh(rbox(3.9, 0.14, 1.55, 0.06), M.trim); g.add(m);
        const t1 = mesh(new THREE.BoxGeometry(3.4, 0.1, 0.12), M.paintDk); t1.position.set(0, 0.04, 0.5); g.add(t1);
        const t2 = t1.clone(); t2.position.z = -0.5; g.add(t2);
      });

    P('Body shell', 'Body',
      'The monocoque body shell — the painted central tub that the doors, glass and panels mount to. Defines the car\u2019s iconic silhouette.',
      [0.05, 0.7, 0], [0, 0.25, 0], function (g) {
        const lower = mesh(rbox(3.5, 0.62, 1.5, 0.26), M.paint); g.add(lower);
        const haunch = mesh(rbox(1.2, 0.5, 1.58, 0.3), M.paint); haunch.position.set(-1.0, 0.05, 0); g.add(haunch);
      });

    P('Hood', 'Body',
      'The front hood (frunk lid). On a rear-engined car this covers the luggage compartment and the fuel tank ahead of the cabin.',
      [1.18, 1.0, 0], [0.4, 0.65, 0], function (g) {
        const m = mesh(rbox(1.25, 0.16, 1.3, 0.08), M.paint); m.rotation.z = -0.06; g.add(m);
      });

    P('Roof & cabin', 'Body',
      'The roof and A/B pillars forming the greenhouse. Its low, fastback curve is the defining line of the silhouette.',
      [0.0, 1.22, 0], [0, 1.05, 0], function (g) {
        const m = mesh(rbox(1.7, 0.5, 1.32, 0.3), M.paint); g.add(m);
      });

    P('Rear deck lid', 'Body',
      'The engine lid over the rear powertrain, usually vented to feed and cool the engine sitting beneath it.',
      [-1.3, 1.0, 0], [-0.4, 0.6, 0], function (g) {
        const m = mesh(rbox(1.15, 0.16, 1.34, 0.07), M.paint); m.rotation.z = 0.05; g.add(m);
        for (let i = -2; i <= 2; i++) { const v = mesh(new THREE.BoxGeometry(0.5, 0.02, 0.04), M.paintDk); v.position.set(0, 0.09, i * 0.12); g.add(v); }
      });

    P('Door — left', 'Body',
      'The driver-side door, with side-impact beams and the mirror and window glass integrated into the frame.',
      [0.15, 0.72, 0.79], [0, 0, 1.15], function (g) {
        const m = mesh(rbox(1.5, 0.66, 0.1, 0.06), M.paint); g.add(m);
        const mir = mesh(rbox(0.16, 0.12, 0.22, 0.04), M.paintDk); mir.position.set(0.7, 0.32, 0.12); g.add(mir);
      });
    P('Door — right', 'Body',
      'The passenger-side door, mirroring the driver door with side-impact protection and integrated glass.',
      [0.15, 0.72, -0.79], [0, 0, -1.15], function (g) {
        const m = mesh(rbox(1.5, 0.66, 0.1, 0.06), M.paint); g.add(m);
        const mir = mesh(rbox(0.16, 0.12, 0.22, 0.04), M.paintDk); mir.position.set(0.7, 0.32, -0.12); g.add(mir);
      });

    P('Front bumper', 'Body',
      'The front bumper and crash structure — energy-absorbing foam and beams behind the lower fascia that protect the body in a low-speed impact.',
      [1.92, 0.62, 0], [1.2, 0, 0], function (g) {
        const m = mesh(rbox(0.35, 0.55, 1.5, 0.16), M.paint); g.add(m);
      });
    P('Rear bumper', 'Body',
      'The rear bumper and diffuser surround, housing the exhaust outlets and the rear crash structure.',
      [-1.92, 0.64, 0], [-1.2, 0, 0], function (g) {
        const m = mesh(rbox(0.35, 0.55, 1.5, 0.16), M.paint); g.add(m);
        const ex1 = mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.14, 16), M.rim); ex1.rotation.x = Math.PI / 2; ex1.position.set(-0.18, -0.22, 0.3); g.add(ex1);
        const ex2 = ex1.clone(); ex2.position.z = -0.3; g.add(ex2);
      });

    // ---- glass -----------------------------------------------------------
    P('Windshield', 'Glass',
      'The laminated front windshield — two glass layers bonded to a plastic interlayer for safety and to stiffen the body.',
      [0.66, 1.16, 0], [0.45, 0.95, 0], function (g) {
        const m = mesh(rbox(0.55, 0.5, 1.2, 0.05), M.glass); m.rotation.z = -0.5; g.add(m);
      });
    P('Rear window', 'Glass',
      'The heated rear window set into the fastback, often louvered or vented on rear-engined cars.',
      [-0.78, 1.16, 0], [-0.45, 0.95, 0], function (g) {
        const m = mesh(rbox(0.5, 0.48, 1.2, 0.05), M.glass); m.rotation.z = 0.45; g.add(m);
      });

    // ---- powertrain ------------------------------------------------------
    P('Engine', 'Powertrain',
      'The flat-six engine, mounted behind the rear axle. Its low, rearward placement gives the car its signature traction and balance.',
      [-1.35, 0.72, 0], [0, 1.7, -1.1], function (g) {
        const block = mesh(rbox(0.95, 0.55, 1.15, 0.08), M.engine); g.add(block);
        const fan = mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.1, 24), M.trim); fan.position.y = 0.32; g.add(fan);
        for (let i = 0; i < 6; i++) { const c = mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.5, 12), M.rim); c.position.set((i % 3 - 1) * 0.26, 0.1, i < 3 ? 0.34 : -0.34); g.add(c); }
      });

    P('Transmission', 'Powertrain',
      'The transaxle gearbox, combined with the differential ahead of the engine to send drive to the rear wheels.',
      [-0.65, 0.55, 0], [0, -1.4, 0], function (g) {
        const m = mesh(rbox(0.7, 0.4, 0.55, 0.1), M.engine); g.add(m);
      });

    // ---- wheels & brakes -------------------------------------------------
    function wheel(name, base, ez) {
      P(name, 'Wheels & Brakes',
        'A forged alloy wheel wrapped in a performance tire, with a ventilated brake disc and caliper hidden behind the spokes.',
        base, [0, 0, ez], function (g) {
          const tire = mesh(new THREE.CylinderGeometry(0.47, 0.47, 0.32, 30), M.tire); tire.rotation.x = Math.PI / 2; g.add(tire);
          const rim = mesh(new THREE.CylinderGeometry(0.31, 0.31, 0.34, 24), M.rim); rim.rotation.x = Math.PI / 2; g.add(rim);
          for (let i = 0; i < 5; i++) { const sp = mesh(new THREE.BoxGeometry(0.06, 0.5, 0.05), M.rim); sp.rotation.z = (i / 5) * Math.PI * 2; sp.position.z = ez > 0 ? 0.02 : -0.02; g.add(sp); }
          const disc = mesh(new THREE.CylinderGeometry(0.27, 0.27, 0.05, 24), M.brake); disc.rotation.x = Math.PI / 2; disc.position.z = ez > 0 ? -0.1 : 0.1; g.add(disc);
        });
    }
    wheel('Front-left wheel', [1.32, 0.47, 0.88], 1.15);
    wheel('Front-right wheel', [1.32, 0.47, -0.88], -1.15);
    wheel('Rear-left wheel', [-1.32, 0.47, 0.88], 1.15);
    wheel('Rear-right wheel', [-1.32, 0.47, -0.88], -1.15);

    // ---- aero ------------------------------------------------------------
    P('Rear wing', 'Aero',
      'The active rear wing that extends at speed to add downforce over the rear axle and stabilise the car.',
      [-1.98, 1.2, 0], [-0.8, 0.85, 0], function (g) {
        const blade = mesh(rbox(0.3, 0.05, 1.5, 0.02), M.paintDk); g.add(blade);
        const s1 = mesh(new THREE.BoxGeometry(0.08, 0.22, 0.06), M.trim); s1.position.set(0, -0.13, 0.5); g.add(s1);
        const s2 = s1.clone(); s2.position.z = -0.5; g.add(s2);
      });
    P('Front splitter', 'Aero',
      'The front splitter that manages airflow under the nose, balancing front downforce against the rear wing.',
      [1.98, 0.36, 0], [1.2, -0.35, 0], function (g) {
        const m = mesh(rbox(0.3, 0.06, 1.45, 0.02), M.paintDk); g.add(m);
      });

    // ---- lighting --------------------------------------------------------
    P('Headlights', 'Lighting',
      'The round LED headlights — a signature design cue — combining low/high beam and daytime running lights.',
      [1.9, 0.82, 0], [1.25, 0.25, 0], function (g) {
        const l = mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.1, 20), M.headlight); l.rotation.z = Math.PI / 2; l.position.z = 0.55; g.add(l);
        const r = l.clone(); r.position.z = -0.55; g.add(r);
      });
    P('Taillights', 'Lighting',
      'The full-width LED light bar across the rear, sweeping the tail and integrating the brake and indicator lights.',
      [-1.9, 0.9, 0], [-1.25, 0.25, 0], function (g) {
        const bar = mesh(rbox(0.1, 0.14, 1.3, 0.04), M.taillight); g.add(bar);
      });

    return { group: root, parts: parts, materials: M };
  }

  window.CarKit = { build: build };
})();

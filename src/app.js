import * as THREE from "three";
import { GLTFLoader } from "../vendor/loaders/GLTFLoader.js";
import { assetUrl } from "./config.js";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const isMobile = () => matchMedia("(max-width: 820px)").matches;
const isCoarsePointer = () => matchMedia("(pointer: coarse)").matches;

const commonCarInfo = {
  wing: { name: "Aerodynamic surfaces", desc: "The wing, spoiler, splitter, and diffuser manage pressure around the body to trade drag for stability and cornering grip.", specs: { role: "Downforce", system: "Body aero" } },
  hood: { name: "Hood & front structure", desc: "The front closure covers luggage, cooling hardware, or crash structure depending on the powertrain layout.", specs: { role: "Access panel", material: "Light alloy / composite" } },
  doors: { name: "Doors & mirrors", desc: "Door construction balances side-impact structure, low mass, cabin access, and clean airflow along the body.", specs: { role: "Cabin access", system: "Body structure" } },
  wheels: { name: "Wheels & brakes", desc: "The unsprung corner assembly combines wheel, tire, brake disc, caliper, hub, and suspension pickup points.", specs: { role: "Grip & stopping", system: "Chassis" } },
  engine: { name: "Powertrain", desc: "The engine converts stored energy into torque, then sends it through the transmission and differential to the driven wheels.", specs: { role: "Propulsion", system: "Powertrain" } },
  exhaust: { name: "Exhaust system", desc: "Headers and silencers evacuate hot gases while balancing flow, emissions, heat management, mass, and sound.", specs: { role: "Gas flow", system: "Powertrain" } },
  interior: { name: "Cockpit", desc: "The cabin packages the driver, controls, restraints, displays, and the human contact points that define how the car communicates.", specs: { role: "Human interface", system: "Cabin" } },
};

const catalog = [
  {
    id: "porsche-gt3-rs", type: "vehicle", maker: "Porsche", series: "992.1", name: "911 GT3 RS",
    tag: "Track-focused · naturally aspirated · active aero", description: "A road-legal circuit tool built around response, downforce, and a 9,000 rpm flat-six.",
    model: "./assets/models/porsche_gt3_rs.glb", accent: "#f2bd39", power: "518 hp", top: "296 km/h", weight: "1,440 kg", dbName: "Porsche 911 GT3 RS",
    attribution: "3D model: Black Snow · Sketchfab · CC BY 4.0",
    info: {
      ...commonCarInfo,
      wing: { name: "Swan-neck DRS rear wing", desc: "Top-mounted struts keep the high-pressure underside clean. The upper plane can flatten on straights and return to a high-downforce angle for braking and corners.", specs: { type: "Active DRS", purpose: "Downforce" } },
      hood: { name: "Carbon hood & front duct", desc: "The carbon-composite hood channels hot radiator air upward instead of underneath the car, improving front-axle aero consistency.", specs: { material: "CFRP", layout: "Front cooling" } },
      wheels: { name: "Center-lock wheels & PCCB", desc: "Forged center-lock wheels reduce rotating mass; large carbon-ceramic discs handle repeated track-speed braking with less fade.", specs: { front: "275/35 ZR20", rear: "335/30 ZR21" } },
      engine: { name: "4.0 L flat-six", desc: "A naturally aspirated, rear-mounted flat-six with dry-sump lubrication. Its compact height lowers the center of gravity and it spins to 9,000 rpm.", specs: { output: "518 hp", layout: "Rear / RWD" } },
    },
    categorize: "porsche",
  },
  {
    id: "ferrari-laferrari", type: "vehicle", maker: "Ferrari", series: "F150", name: "LaFerrari",
    tag: "V12 hybrid · carbon monocoque · active aero", description: "Ferrari's first production hybrid uses HY-KERS to fill torque around a high-revving V12.",
    model: "./assets/models/laferrari.glb", accent: "#ff5362", power: "949 hp", top: "350 km/h", weight: "1,580 kg", dbName: "Ferrari LaFerrari",
    attribution: "3D model: Sketchfab · original creator attribution retained in source project",
    info: {
      ...commonCarInfo,
      wing: { name: "Active rear aero", desc: "Computer-controlled surfaces change position with speed, braking, and steering to balance low drag against high-speed stability.", specs: { type: "Active", role: "Aero balance" } },
      doors: { name: "Butterfly doors", desc: "The doors hinge at the A-pillar and roof, swinging upward around the wide structural sill of the carbon monocoque.", specs: { hinge: "Dihedral", structure: "Carbon tub" } },
      engine: { name: "6.3 L V12 + HY-KERS", desc: "A naturally aspirated V12 works with an electric motor for immediate torque and energy recovery—a road-car translation of Ferrari's hybrid racing work.", specs: { output: "949 hp", layout: "Mid / RWD" } },
    },
  },
  {
    id: "porsche-911-turbo", type: "vehicle", maker: "Porsche", series: "992", name: "911 Turbo S",
    tag: "Twin-turbo flat-six · all-wheel drive · grand tourer", description: "The everyday-supercar branch of the 911 family pairs immense traction with deceptive usability.",
    model: "./assets/models/porsche_911_turbo.glb", accent: "#76b8e3", power: "650 hp", top: "330 km/h", weight: "1,572 kg", dbName: "Porsche 911 Turbo S",
    attribution: "3D model: Sketchfab · original creator attribution retained in source project",
    info: {
      ...commonCarInfo,
      wing: { name: "Adaptive rear spoiler", desc: "The deployable rear surface changes height and angle to support cooling, stability, and braking while staying clean at low speed.", specs: { type: "Adaptive", role: "Stability" } },
      engine: { name: "3.7 L twin-turbo flat-six", desc: "The rear-mounted boxer engine uses two turbochargers and all-wheel drive to turn a broad torque curve into repeatable acceleration.", specs: { output: "650 hp", layout: "Rear / AWD" } },
    },
  },
  {
    id: "lamborghini-svj", type: "vehicle", maker: "Lamborghini", series: "LB834", name: "Aventador SVJ",
    tag: "Naturally aspirated V12 · ALA 2.0 · carbon tub", description: "A loud, physical V12 flagship whose active aero can vector downforce across the car.",
    model: "./assets/models/aventador_svj.glb", accent: "#ff9a36", power: "759 hp", top: "351 km/h", weight: "1,575 kg", dbName: "Lamborghini Aventador SVJ",
    attribution: "3D model: Sketchfab · original creator attribution retained in source project",
    info: {
      ...commonCarInfo,
      wing: { name: "ALA 2.0 active aero", desc: "Internal air channels can stall or load sections of the aero package, reducing drag on straights and even varying downforce side-to-side in a corner.", specs: { type: "Active aero", role: "Vectoring" } },
      doors: { name: "Scissor doors", desc: "Front-hinged doors rotate upward, preserving the dramatic packaging language used by Lamborghini's V12 flagships since the Countach.", specs: { hinge: "Vertical", structure: "Carbon / alloy" } },
      engine: { name: "6.5 L naturally aspirated V12", desc: "The longitudinal mid-mounted V12 delivers response without turbo lag and drives all four wheels through a seven-speed ISR gearbox.", specs: { output: "759 hp", layout: "Mid / AWD" } },
    },
  },
  {
    id: "bugatti-chiron", type: "vehicle", maker: "Bugatti", series: "Chiron", name: "Chiron Profilée",
    tag: "Quad-turbo W16 · all-wheel drive · high-speed aero", description: "A long-tail interpretation of Bugatti's W16 platform, shaped around cooling and extreme-speed stability.",
    model: "./assets/models/bugatti_chiron_profilee.glb", accent: "#62d9ff", power: "1,479 hp", top: "380 km/h", weight: "1,995 kg", dbName: "Bugatti Chiron",
    attribution: "3D model: Sketchfab · original creator attribution retained in source project",
    info: {
      ...commonCarInfo,
      wing: { name: "Fixed swept rear wing", desc: "The Profilée's fixed rear wing works with the longer tail to deliver stability without the Pur Sport's larger deployable unit.", specs: { type: "Fixed", role: "High-speed balance" } },
      engine: { name: "8.0 L quad-turbo W16", desc: "Four turbochargers feed a compact sixteen-cylinder engine. The layout packages exceptional output behind the cabin and sends it through all-wheel drive.", specs: { output: "1,479 hp", layout: "Mid / AWD" } },
    },
  },
  {
    id: "bugatti-tourbillon", type: "vehicle", maker: "Bugatti", series: "Tourbillon", name: "Tourbillon",
    tag: "Naturally aspirated V16 · tri-motor hybrid · active aero", description: "Bugatti's next chapter replaces the W16 with a high-revving Cosworth V16 and three electric motors.",
    model: "./assets/models/bugatti_tourbillon.glb", accent: "#7de0ff", power: "1,775 hp", top: "445 km/h", weight: "1,995 kg", dbName: "Bugatti Tourbillon",
    attribution: "3D model: Sketchfab · original creator attribution retained in source project",
    info: {
      ...commonCarInfo,
      wing: { name: "Multi-position rear wing", desc: "The rear wing remains tucked away when possible, then deploys for downforce or stands steeply as an airbrake under heavy deceleration.", specs: { type: "Active", role: "Airbrake" } },
      engine: { name: "8.3 L V16 hybrid", desc: "A naturally aspirated V16 revs to 9,000 rpm and works with three electric motors, combining linear combustion response with electric torque fill.", specs: { output: "1,775 hp", layout: "Mid / AWD" } },
    },
  },
  {
    id: "w16-engine", type: "engine", maker: "Bugatti", series: "Original teardown", name: "W16 Engine",
    tag: "20 named components · 407 solids · original geometry", description: "The original detailed teardown: block, pistons, turbochargers, camshafts, manifolds, bearings, and fasteners as separate inspectable groups.",
    geometry: "./assets/engines/w16-engine.json", accent: "#e10600", power: "1,479 hp", top: "Quad-turbo", weight: "407 solids", dbName: "Bugatti Chiron",
    attribution: "Original W16 teardown geometry from the supplied interactive explorer",
    info: {}, dynamicParts: true, preserveMaterials: true, explodeScale: .62,
  },
  {
    id: "tourbillon-engine", type: "engine", maker: "Bugatti", series: "Powertrain lab", name: "Tourbillon V16",
    tag: "Segmented teardown · 8.3 L · hybrid", description: "Study the long naturally aspirated V16 as a six-region powertrain assembly.",
    manifest: "./assets/engines/teardown_tourbillon.json", accent: "#7de0ff", power: "986 hp ICE", top: "9,000 rpm", weight: "V16 hybrid", dbName: "Bugatti Tourbillon",
    attribution: "Engine geometry extracted from the supplied Tourbillon assembly",
    info: engineInfo("V16", "8.3 L naturally aspirated", "9,000 rpm"),
  },
];

for (const item of catalog) {
  if (item.model) item.model = assetUrl(item.model);
  if (item.manifest) item.manifest = assetUrl(item.manifest);
  if (item.geometry) item.geometry = assetUrl(item.geometry);
}

function engineInfo(layout, displacement, redline) {
  return {
    upper: { name: "Upper assembly", desc: `The upper region packages the ${layout}'s intake path and cylinder-head hardware, where airflow is metered into each bank.`, specs: { engine: layout, zone: "Upper" } },
    core: { name: "Central core", desc: `The structural center carries the crankcase and the main rotating assembly for this ${displacement} engine.`, specs: { displacement, zone: "Core" } },
    left: { name: "Left bank", desc: "The left cylinder bank groups combustion chambers, valve gear, and its share of the intake and exhaust routing.", specs: { bank: "Left", redline } },
    right: { name: "Right bank", desc: "The mirrored right bank balances the engine around the crankshaft and shares the firing work across the layout.", specs: { bank: "Right", redline } },
    lower: { name: "Lower assembly", desc: "The lower region contains the sump and supporting structure that manages oil return and bottom-end stiffness.", specs: { zone: "Lower", lubrication: "Dry sump" } },
  };
}

const elements = {
  grid: $("#machine-grid"), resultCount: $("#result-count"), canvas: $("#scene-canvas"),
  loading: $("#loading-panel"), loadingTitle: $("#loading-title"), loadingProgress: $("#loading-progress"), loadingPercent: $("#loading-percent"),
  maker: $("#asset-maker"), name: $("#asset-name"), tag: $("#asset-tag"), attribution: $("#attribution"),
  partRail: $("#part-rail"), partCard: $("#part-card"), partIndex: $("#part-index"), partName: $("#part-name"), partDescription: $("#part-description"), partSpecs: $("#part-specs"),
  explodeSlider: $("#explode-slider"), explodeValue: $("#explode-value"), conversation: $("#conversation"),
  assistant: $("#assistant-panel"), assistantInput: $("#assistant-input"), agentStatus: $("#agent-status"), airflowCard: $("#airflow-card"),
};

const state = {
  asset: null, root: null, parts: [], selected: null, isolated: null, highlighted: null,
  explode: 0, categoryExplode: null, xray: false, wind: false, paint: null,
  history: [], loadingToken: 0, rendererReady: false, bounds: null,
};

let renderer, scene, camera, controls, raycaster, flowPoints, clock;
const loader = new GLTFLoader();

function renderLibrary(filter = "all") {
  elements.grid.replaceChildren();
  catalog.forEach((asset, index) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "machine-card";
    card.dataset.type = asset.type;
    card.dataset.assetId = asset.id;
    card.hidden = filter !== "all" && filter !== asset.type;
    card.style.setProperty("--accent", asset.accent);
    card.innerHTML = `
      <span class="card-number">${String(index + 1).padStart(2, "0")}</span>
      <span class="card-type">${asset.type === "vehicle" ? "Complete vehicle" : "Powertrain assembly"}</span>
      <h2><span>${asset.maker} / ${asset.series}</span>${asset.name}</h2>
      <p>${asset.description}</p>
      <div class="card-stats">
        <span>${asset.type === "vehicle" ? "Power" : "Output"}<b>${asset.power}</b></span>
        <span>${asset.type === "vehicle" ? "Top speed" : "Limit"}<b>${asset.top}</b></span>
        <span>${asset.type === "vehicle" ? "Mass" : "Type"}<b>${asset.weight}</b></span>
      </div>
      <span class="card-enter">→</span>`;
    card.addEventListener("click", () => openAsset(asset.id));
    elements.grid.append(card);
  });
  const visible = filter === "all" ? catalog.length : catalog.filter((item) => item.type === filter).length;
  elements.resultCount.textContent = String(visible).padStart(2, "0");
}

function wireInterface() {
  $$(".side-link").forEach((button) => button.addEventListener("click", () => {
    $$(".side-link").forEach((item) => item.classList.toggle("is-active", item === button));
    renderLibrary(button.dataset.filter);
  }));
  $("#back-library").addEventListener("click", showLibrary);
  $("#part-close").addEventListener("click", clearSelection);
  $("#focus-part").addEventListener("click", () => state.selected && focusCategory(state.selected));
  $("#isolate-part").addEventListener("click", () => state.selected && isolateCategory(state.selected));
  $("#ask-part").addEventListener("click", () => state.selected && ask(`Explain the ${partTitle(state.selected)} and show me how it fits into this ${state.asset.type}.`));
  $("#isolate-selected").addEventListener("click", () => state.selected ? isolateCategory(state.selected) : addMessage("assistant", "Select a system first, then I can isolate it for you."));
  $("#reset-view").addEventListener("click", resetView);
  elements.explodeSlider.addEventListener("input", (event) => setExplode(Number(event.target.value) / 100));
  $("#blueprint-toggle").addEventListener("click", (event) => {
    state.xray = !state.xray;
    event.currentTarget.setAttribute("aria-pressed", String(state.xray));
    document.body.classList.toggle("xray-on", state.xray);
    refreshMaterials();
  });
  $("#wind-toggle").addEventListener("click", (event) => setWind(!state.wind, event.currentTarget));
  $("#spin-toggle").addEventListener("click", (event) => {
    controls.autoRotate = !controls.autoRotate;
    event.currentTarget.setAttribute("aria-pressed", String(controls.autoRotate));
  });
  $("#assistant-collapse").addEventListener("click", () => {
    elements.assistant.classList.add("is-collapsed");
    $("#assistant-reopen").classList.add("is-visible");
  });
  $("#assistant-reopen").addEventListener("click", () => {
    elements.assistant.classList.remove("is-collapsed");
    $("#assistant-reopen").classList.remove("is-visible");
  });
  $("#assistant-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const value = elements.assistantInput.value.trim();
    if (!value) return;
    elements.assistantInput.value = "";
    ask(value);
  });
  $$("#suggestions button").forEach((button) => button.addEventListener("click", () => ask(button.textContent.trim())));
  window.addEventListener("popstate", () => routeFromLocation(false));
}

function routeFromLocation(push) {
  const match = location.hash.match(/^#explore\/(.+)$/);
  if (match && catalog.some((item) => item.id === match[1])) openAsset(match[1], push);
  else showLibrary(false);
}

async function openAsset(id, push = true) {
  const asset = catalog.find((item) => item.id === id);
  if (!asset) return;
  if (push) history.pushState({ asset: id }, "", `#explore/${id}`);
  document.body.dataset.view = "explorer";
  state.asset = asset;
  elements.maker.textContent = `${asset.maker} / ${asset.series}`;
  elements.name.textContent = asset.name;
  elements.tag.textContent = asset.tag;
  elements.attribution.textContent = asset.attribution;
  const hint = $(".scene-hint");
  if (hint) {
    hint.textContent = isMobile()
      ? "Drag to orbit · pinch to zoom · tap a part"
      : "Drag to orbit · scroll to zoom · click a part to inspect";
  }
  if (isMobile()) {
    elements.assistant.classList.add("is-collapsed");
    $("#assistant-reopen").classList.add("is-visible");
  } else {
    elements.assistant.classList.remove("is-collapsed");
    $("#assistant-reopen").classList.remove("is-visible");
  }
  elements.conversation.replaceChildren();
  state.history = [];
  addMessage("assistant", `I've opened the ${asset.name}. Pull the assembly apart yourself, click a system, or ask me to move the scene for you.`);
  const prompts = $$("#suggestions button");
  if (asset.type === "engine") {
    prompts[0].textContent = "Show the engine core";
    prompts[1].textContent = "Take the engine apart";
    prompts[2].textContent = "Explain the cylinder banks";
  } else {
    prompts[0].textContent = "Show me the engine";
    prompts[1].textContent = "Take the car apart";
    prompts[2].textContent = "How does the aero work?";
  }
  renderPartRail();
  clearSelection();
  await loadAsset(asset);
}

function showLibrary(push = true) {
  if (push) history.pushState({}, "", `${location.pathname}${location.search}`);
  document.body.dataset.view = "library";
  state.asset = null;
  state.wind = false;
  flowPoints.visible = false;
}

function renderPartRail() {
  elements.partRail.replaceChildren();
  Object.keys(state.asset.info).forEach((key, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.category = key;
    button.textContent = `${String(index + 1).padStart(2, "0")} / ${state.asset.info[key]?.name || partTitle(key)}`;
    button.addEventListener("click", () => selectCategory(key, true));
    elements.partRail.append(button);
  });
}

function selectCategory(category, focus = false) {
  state.selected = category;
  state.isolated = null;
  const info = state.asset.info[category] || genericPartInfo(category);
  const keys = Object.keys(state.asset.info);
  elements.partIndex.textContent = `SYSTEM ${String(Math.max(0, keys.indexOf(category)) + 1).padStart(2, "0")}`;
  elements.partName.textContent = info.name;
  elements.partDescription.textContent = info.desc;
  elements.partSpecs.replaceChildren();
  Object.entries(info.specs || {}).forEach(([label, value]) => {
    const wrap = document.createElement("div");
    const dt = document.createElement("dt");
    const dd = document.createElement("dd");
    dt.textContent = label;
    dd.textContent = value;
    wrap.append(dt, dd);
    elements.partSpecs.append(wrap);
  });
  elements.partCard.classList.add("is-open");
  $$(`button`, elements.partRail).forEach((button) => button.classList.toggle("is-active", button.dataset.category === category));
  refreshMaterials();
  if (focus) focusCategory(category);
}

function clearSelection() {
  state.selected = null;
  state.isolated = null;
  state.highlighted = null;
  elements.partCard.classList.remove("is-open");
  $$(`button`, elements.partRail).forEach((button) => button.classList.remove("is-active"));
  refreshMaterials();
}

function partTitle(category) {
  if (state.asset?.info?.[category]?.name) return state.asset.info[category].name;
  return ({ wing: "Aero", hood: "Hood", doors: "Doors", wheels: "Wheels & brakes", engine: "Engine", exhaust: "Exhaust", interior: "Cockpit", upper: "Upper assembly", core: "Core", left: "Left bank", right: "Right bank", lower: "Lower assembly", body: "Body" })[category] || category.replaceAll("_", " ");
}

function genericPartInfo(category) {
  return { name: partTitle(category), desc: "This mesh group is part of the digital twin. Use focus, isolate, and exploded view to understand its position in the larger assembly.", specs: { group: category, source: "3D assembly" } };
}

function initScene() {
  renderer = new THREE.WebGLRenderer({ canvas: elements.canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, isCoarsePointer() ? 1.35 : 1.6));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(32, 1, 0.01, 1000);
  controls = new OrbitRig(camera, elements.canvas);
  raycaster = new THREE.Raycaster();
  clock = new THREE.Clock();

  scene.add(new THREE.HemisphereLight(0xa8dcff, 0x03101f, 2.2));
  const key = new THREE.DirectionalLight(0xffffff, 4.2);
  key.position.set(6, 10, 7);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x31baff, 3.4);
  rim.position.set(-7, 4, -5);
  scene.add(rim);
  const fill = new THREE.PointLight(0x9fe8ff, 2.2, 40);
  fill.position.set(0, 5, 4);
  scene.add(fill);

  const grid = new THREE.GridHelper(40, 80, 0x1479ae, 0x0b3c62);
  grid.material.transparent = true;
  grid.material.opacity = 0.22;
  grid.position.y = -0.005;
  scene.add(grid);
  flowPoints = makeFlowField();
  scene.add(flowPoints);

  const resize = () => {
    const shell = $(".scene-shell");
    const width = shell.clientWidth || innerWidth;
    const height = shell.clientHeight || innerHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.fov = width < 700 ? 41 : 32;
    camera.updateProjectionMatrix();
  };
  window.addEventListener("resize", resize, { passive: true });
  window.visualViewport?.addEventListener("resize", resize, { passive: true });
  window.addEventListener("orientationchange", () => setTimeout(resize, 120), { passive: true });
  resize();

  let down = null;
  elements.canvas.addEventListener("pointerdown", (event) => { down = [event.clientX, event.clientY]; });
  elements.canvas.addEventListener("pointerup", (event) => {
    if (!down || Math.hypot(event.clientX - down[0], event.clientY - down[1]) > 5 || !state.parts.length) return;
    const rect = elements.canvas.getBoundingClientRect();
    const pointer = new THREE.Vector2(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(state.parts.flatMap((part) => part.meshes), false);
    if (!hits.length) return clearSelection();
    const part = state.parts.find((candidate) => candidate.meshes.includes(hits[0].object));
    if (part) selectCategory(part.category, false);
  });

  state.rendererReady = true;
  animate();
}

class OrbitRig {
  constructor(boundCamera, dom) {
    this.camera = boundCamera;
    this.dom = dom;
    this.target = new THREE.Vector3();
    this.desiredTarget = new THREE.Vector3();
    this.azimuth = 0.76;
    this.polar = 1.12;
    this.distance = 9;
    this.desiredDistance = 9;
    this.minDistance = 1;
    this.maxDistance = 80;
    this.autoRotate = false;
    const orbitSpeed = isCoarsePointer() ? 0.011 : 0.008;
    const pointers = new Map();
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let pinchStartDistance = 0;
    let pinchStartDesiredDistance = 0;

    const pointerDistance = () => {
      const pts = [...pointers.values()];
      return Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
    };

    const onPointerDown = (event) => {
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      dom.setPointerCapture?.(event.pointerId);
      if (pointers.size === 1) {
        dragging = true;
        lastX = event.clientX;
        lastY = event.clientY;
      } else if (pointers.size === 2) {
        dragging = false;
        pinchStartDistance = pointerDistance();
        pinchStartDesiredDistance = this.desiredDistance;
      }
    };

    const onPointerMove = (event) => {
      if (!pointers.has(event.pointerId)) return;
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (pointers.size === 2 && pinchStartDistance > 0) {
        const scale = pinchStartDistance / pointerDistance();
        this.desiredDistance = THREE.MathUtils.clamp(
          pinchStartDesiredDistance * scale,
          this.minDistance,
          this.maxDistance,
        );
        return;
      }
      if (!dragging || pointers.size !== 1) return;
      this.azimuth -= (event.clientX - lastX) * orbitSpeed;
      this.polar = THREE.MathUtils.clamp(this.polar - (event.clientY - lastY) * orbitSpeed, 0.2, Math.PI - 0.2);
      lastX = event.clientX;
      lastY = event.clientY;
    };

    const onPointerEnd = (event) => {
      pointers.delete(event.pointerId);
      if (pointers.size < 2) pinchStartDistance = 0;
      if (pointers.size === 0) {
        dragging = false;
        return;
      }
      if (pointers.size === 1) {
        const point = [...pointers.values()][0];
        dragging = true;
        lastX = point.x;
        lastY = point.y;
      }
    };

    dom.addEventListener("pointerdown", onPointerDown);
    dom.addEventListener("pointermove", onPointerMove);
    dom.addEventListener("pointerup", onPointerEnd);
    dom.addEventListener("pointercancel", onPointerEnd);
    dom.addEventListener("wheel", (event) => {
      event.preventDefault();
      this.desiredDistance = THREE.MathUtils.clamp(this.desiredDistance * (1 + Math.sign(event.deltaY) * 0.1), this.minDistance, this.maxDistance);
    }, { passive: false });
  }
  fit(center, radius) {
    this.desiredTarget.copy(center);
    this.target.copy(center);
    this.desiredDistance = Math.max(radius * 2.75, 1.4);
    this.distance = this.desiredDistance;
    this.minDistance = Math.max(radius * 0.45, .3);
    this.maxDistance = Math.max(radius * 8, 8);
    this.azimuth = 0.76;
    this.polar = 1.1;
  }
  focus(center, radius) {
    this.desiredTarget.copy(center);
    this.desiredDistance = THREE.MathUtils.clamp(Math.max(radius * 3, .8), this.minDistance, this.maxDistance);
  }
  update(dt) {
    if (this.autoRotate) this.azimuth += dt * .22;
    this.target.lerp(this.desiredTarget, .075);
    this.distance += (this.desiredDistance - this.distance) * .075;
    const sin = Math.sin(this.polar);
    this.camera.position.set(
      this.target.x + this.distance * sin * Math.sin(this.azimuth),
      this.target.y + this.distance * Math.cos(this.polar),
      this.target.z + this.distance * sin * Math.cos(this.azimuth),
    );
    this.camera.lookAt(this.target);
  }
}

async function loadAsset(asset) {
  const token = ++state.loadingToken;
  elements.loading.classList.remove("is-hidden");
  elements.loadingTitle.textContent = `${asset.maker} ${asset.name}`;
  setLoadProgress(0);
  disposeCurrent();
  state.parts = [];
  state.selected = null;
  state.isolated = null;
  state.highlighted = null;
  state.categoryExplode = null;
  setExplode(0);
  try {
    const root = asset.geometry ? await loadQuantizedAssembly(asset, token) : asset.manifest ? await loadMultipart(asset, token) : await loadGlb(asset.model, token);
    if (token !== state.loadingToken) return;
    state.root = root;
    scene.add(root);
    prepareAssembly(root, asset);
    setLoadProgress(1);
    setTimeout(() => token === state.loadingToken && elements.loading.classList.add("is-hidden"), 220);
  } catch (error) {
    console.error(error);
    elements.loadingTitle.textContent = "Digital twin could not be loaded";
    elements.loadingPercent.textContent = "Check the local server and try again";
  }
}

function loadGlb(url, token) {
  return new Promise((resolve, reject) => loader.load(url, (gltf) => resolve(gltf.scene), (event) => {
    if (token !== state.loadingToken) return;
    const progress = event.total ? event.loaded / event.total : Math.min(.9, event.loaded / 20_000_000);
    setLoadProgress(progress);
  }, reject));
}

async function loadMultipart(asset, token) {
  const response = await fetch(asset.manifest);
  if (!response.ok) throw new Error(`Manifest failed: ${response.status}`);
  const manifest = await response.json();
  const group = new THREE.Group();
  group.name = asset.name;
  let loaded = 0;
  await Promise.all(manifest.parts.map(async (meta) => {
    const base = asset.manifest.slice(0, asset.manifest.lastIndexOf("/") + 1);
    const partScene = await loadGlb(`${base}${meta.file}`, token);
    partScene.name = meta.label;
    partScene.userData.manifestPart = meta;
    group.add(partScene);
    loaded += 1;
    setLoadProgress(loaded / manifest.parts.length);
  }));
  return group;
}

async function loadQuantizedAssembly(asset, token) {
  const response = await fetch(asset.geometry);
  if (!response.ok) throw new Error(`Engine geometry failed: ${response.status}`);
  const data = await response.json();
  const scale = data.radius / data.quant;
  const group = new THREE.Group();
  group.name = asset.name;
  data.parts.forEach((meta, index) => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(meta.q.length);
    for (let i = 0; i < meta.q.length; i++) positions[i] = meta.q[i] * scale;
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setIndex(meta.i);
    geometry.computeVertexNormals();
    const material = new THREE.MeshStandardMaterial({ color: 0xb8bcc2, metalness: .58, roughness: .32 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = meta.label;
    mesh.userData.engineMeta = meta;
    group.add(mesh);
    setLoadProgress((index + 1) / data.parts.length);
  });
  if (token !== state.loadingToken) throw new Error("Engine load superseded");
  return group;
}

function setLoadProgress(value) {
  const pct = Math.round(THREE.MathUtils.clamp(value, 0, 1) * 100);
  elements.loadingProgress.style.width = `${pct}%`;
  elements.loadingPercent.textContent = `${pct}%`;
}

function prepareAssembly(root, asset) {
  root.updateMatrixWorld(true);
  let box = new THREE.Box3().setFromObject(root);
  const center = box.getCenter(new THREE.Vector3());
  root.position.x -= center.x;
  root.position.z -= center.z;
  root.position.y -= box.min.y;
  root.updateMatrixWorld(true);
  box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());
  const assemblyCenter = box.getCenter(new THREE.Vector3());
  const maxSize = Math.max(size.x, size.y, size.z) || 1;
  state.bounds = { box, size, center: assemblyCenter, maxSize };

  const contentRoot = asset.type === "engine" ? root : findContentRoot(root);
  const objects = contentRoot.children.length ? [...contentRoot.children] : [contentRoot];
  state.parts = objects.map((object, index) => buildPart(object, index, objects.length, asset, assemblyCenter, size));
  if (asset.dynamicParts) {
    const info = {};
    state.parts.forEach((part, index) => {
      const meta = part.object.userData.engineMeta || {};
      const id = `component_${index}`;
      part.category = id;
      info[id] = {
        name: meta.label || `Component ${index + 1}`,
        desc: `${meta.label || "This component"} is one of the original named groups in the supplied W16 teardown. Isolate it to see its exact position, or use the explode control to study how it relates to the complete powerplant.`,
        specs: {
          solids: meta.count ? Number(meta.count).toLocaleString() : "—",
          triangles: meta.tris ? Number(meta.tris).toLocaleString() : "—",
        },
      };
    });
    asset.info = info;
    renderPartRail();
  }
  state.parts.forEach((part) => preparePartMaterials(part, asset));
  controls.fit(assemblyCenter, maxSize * .58);
  resetFlowField();
  refreshMaterials();
}

function findContentRoot(root) {
  let node = root;
  while (node.children.length === 1 && !node.children[0].isMesh) node = node.children[0];
  if (node.children.length < 3) {
    const candidate = [...node.children].sort((a, b) => b.children.length - a.children.length)[0];
    if (candidate && candidate.children.length > 4) node = candidate;
  }
  return node;
}

function buildPart(object, index, count, asset, center, size) {
  object.updateMatrixWorld(true);
  const meshes = [];
  object.traverse((child) => { if (child.isMesh) meshes.push(child); });
  let category;
  if (asset.dynamicParts) category = `component_${index}`;
  else if (asset.type === "engine") category = categorizeEngine(object.name);
  else {
    category = categorizeCar(object.name, asset);
    if (category === "body") {
      for (const mesh of meshes) {
        const candidate = categorizeCar(mesh.name, asset);
        if (candidate !== "body") { category = candidate; break; }
      }
    }
  }
  const partBox = new THREE.Box3().setFromObject(object);
  const partCenter = partBox.getCenter(new THREE.Vector3());
  const direction = partCenter.clone().sub(center);
  if (direction.lengthSq() < 1e-8) direction.set(Math.sin(index * 2.1), (index % 3) - 1, Math.cos(index * 2.1));
  direction.normalize();
  direction.y += ((index / Math.max(1, count - 1)) - .5) * .28;
  const explodeWorld = direction.multiplyScalar(Math.max(size.x, size.z) * (asset.explodeScale ?? (asset.type === "engine" ? 1.0 : .72)));
  if (category === "wing" || category === "interior" || category === "upper") explodeWorld.y += size.y * .8;
  if (category === "lower" || category === "engine" || category === "exhaust") explodeWorld.y -= size.y * .35;
  object.parent.updateMatrixWorld(true);
  const localMatrix = new THREE.Matrix3().setFromMatrix4(object.parent.matrixWorld).invert();
  const explode = explodeWorld.applyMatrix3(localMatrix);
  return { object, meshes, category, base: object.position.clone(), explode, amount: 0 };
}

function categorizeCar(name, asset) {
  const n = String(name || "").toLowerCase();
  if (asset.categorize === "porsche") {
    if (n.includes("carbon_wing") || n.includes("gt3rs_spoiler")) return "wing";
    if (n.includes("carbon_hood")) return "hood";
    if (/door_l|door_r|doorpanel|doorglass|mirror_/.test(n)) return "doors";
    if (/wheels_20x9|brakedisc|object_4\./.test(n)) return "wheels";
    if (/twixer_992_engine|intake_tt|transaxle|driveshaft|diff_f|radiator/.test(n)) return "engine";
    if (/exhaust|muffler|heatshield/.test(n)) return "exhaust";
    if (/seat_|seats_|dash_|steer_|pedal|shifter|gauges_screen|needle_tacho|signalstalk|fascia|black_dash|chrome_dash/.test(n)) return "interior";
  }
  if (/wheel|tyre|tire|brake|calliper|caliper|rim|disc(?!harge)/.test(n)) return "wheels";
  if (/door|mirror/.test(n)) return "doors";
  if (/wing|spoiler|aero|splitter|diffuser/.test(n)) return "wing";
  if (/hood|bonnet|frunk|trunk|boot/.test(n)) return "hood";
  if (/engine|intake|radiator|motor|cylinder|piston|manifold|gearbox|transmission/.test(n)) return "engine";
  if (/exhaust|muffler|heatshield|tailpipe/.test(n)) return "exhaust";
  if (/seat|dash|steer|interior|cockpit|gauge|shifter/.test(n)) return "interior";
  return "body";
}

function categorizeEngine(name) {
  const n = String(name || "").toLowerCase();
  if (n.includes("upper") && !n.includes("left") && !n.includes("right")) return "upper";
  if (n.includes("mid_center") || n.includes("mid-center")) return "core";
  if (n.includes("left")) return "left";
  if (n.includes("right")) return "right";
  if (n.includes("lower")) return "lower";
  return "core";
}

function preparePartMaterials(part, asset) {
  const enginePalette = { upper: 0x8edfff, core: 0x7699aa, left: 0xc5e8f5, right: 0x94c4d8, lower: 0x587889 };
  part.meshes.forEach((mesh) => {
    mesh.castShadow = false;
    mesh.receiveShadow = true;
    const source = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    const cloned = source.map((material) => {
      const mat = material.clone();
      if (asset.type === "engine" && !asset.preserveMaterials) {
        mat.color?.setHex(enginePalette[part.category] || 0x8ebed1);
        if ("metalness" in mat) mat.metalness = .56;
        if ("roughness" in mat) mat.roughness = .36;
        if (mat.emissive) {
          mat.emissive.setHex(0x082435);
          mat.emissiveIntensity = .38;
        }
      }
      mat.userData.bpOriginal = {
        color: mat.color?.getHex(), emissive: mat.emissive?.getHex(), emissiveIntensity: mat.emissiveIntensity,
        opacity: mat.opacity, transparent: mat.transparent, wireframe: mat.wireframe, depthWrite: mat.depthWrite,
      };
      return mat;
    });
    mesh.material = Array.isArray(mesh.material) ? cloned : cloned[0];
  });
}

function refreshMaterials() {
  state.parts.forEach((part) => {
    let opacity = 1;
    if (state.isolated) opacity = part.category === state.isolated ? 1 : .035;
    else if (state.selected) opacity = part.category === state.selected || part.category === "body" ? 1 : .24;
    part.meshes.forEach((mesh) => {
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      materials.forEach((material) => {
        const original = material.userData.bpOriginal || {};
        material.opacity = opacity;
        material.transparent = opacity < .99 || original.transparent;
        material.depthWrite = opacity > .12;
        material.wireframe = state.xray || original.wireframe;
        if (material.emissive) {
          const active = part.category === state.highlighted || part.category === state.selected;
          material.emissive.setHex(active ? 0x0b91c7 : (original.emissive ?? 0x000000));
          material.emissiveIntensity = active ? .65 : (original.emissiveIntensity ?? 1);
        }
        if (state.xray && material.color) material.color.setHex(part.category === state.selected ? 0x8cecff : 0x1c7ca8);
        else if (state.paint && material.color && isPaintMesh(mesh, part)) material.color.setHex(state.paint);
        else if (material.color && original.color !== undefined) material.color.setHex(original.color);
        material.needsUpdate = true;
      });
    });
  });
}

function isPaintMesh(mesh, part) {
  const n = `${mesh.name} ${part.object.name}`.toLowerCase();
  if (/glass|window|light|lamp|tire|tyre|wheel|brake|carbon|chrome|interior|seat/.test(n)) return false;
  return part.category === "body" || part.category === "hood" || part.category === "doors" || part.category === "wing" || /paint|colou?r|body/.test(n);
}

function setExplode(value) {
  state.explode = THREE.MathUtils.clamp(value, 0, 1);
  state.categoryExplode = null;
  elements.explodeSlider.value = String(Math.round(state.explode * 100));
  elements.explodeValue.textContent = `${Math.round(state.explode * 100)}%`;
}

function explodeCategory(category) {
  const mapped = mapTarget(category);
  if (mapped === "whole_car") setExplode(1);
  else {
    state.categoryExplode = mapped;
    state.selected = mapped;
    selectCategory(mapped, false);
  }
}

function isolateCategory(category) {
  state.isolated = mapTarget(category);
  state.selected = state.isolated;
  selectCategory(state.isolated, false);
  state.isolated = mapTarget(category);
  refreshMaterials();
}

function focusCategory(category) {
  const mapped = mapTarget(category);
  const parts = state.parts.filter((part) => part.category === mapped);
  if (!parts.length || !state.bounds) return controls.focus(state.bounds.center, state.bounds.maxSize * .5);
  const box = new THREE.Box3();
  parts.forEach((part) => box.expandByObject(part.object));
  const size = box.getSize(new THREE.Vector3());
  controls.focus(box.getCenter(new THREE.Vector3()), Math.max(size.x, size.y, size.z) * .65);
}

function highlightCategory(category) {
  state.highlighted = mapTarget(category);
  refreshMaterials();
}

function resetView() {
  state.selected = null;
  state.isolated = null;
  state.highlighted = null;
  state.categoryExplode = null;
  state.paint = null;
  setExplode(0);
  elements.partCard.classList.remove("is-open");
  if (state.bounds) controls.fit(state.bounds.center, state.bounds.maxSize * .58);
  refreshMaterials();
}

function setPaint(color) {
  const colors = { "nardo grey": 0x737a7d, "nardo gray": 0x737a7d, red: 0xc9152c, blue: 0x1254a5, black: 0x080b0e, white: 0xe8edf0, silver: 0xaeb8c1, yellow: 0xf1bd21, orange: 0xe86d1c, green: 0x1f7b4b };
  state.paint = typeof color === "number" ? color : colors[String(color).toLowerCase()] ?? (String(color).startsWith("#") ? Number(`0x${String(color).slice(1)}`) : 0x737a7d);
  refreshMaterials();
}

function setWind(active, button = $("#wind-toggle")) {
  state.wind = active;
  flowPoints.visible = active;
  button?.setAttribute("aria-pressed", String(active));
  elements.airflowCard.classList.toggle("is-open", active);
}

function makeFlowField() {
  const count = 180;
  const positions = new Float32Array(count * 3);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({ color: 0x5de1ff, size: .035, transparent: true, opacity: .72, depthWrite: false });
  const points = new THREE.Points(geometry, material);
  points.visible = false;
  points.userData.count = count;
  return points;
}

function resetFlowField() {
  if (!state.bounds) return;
  const { box, size } = state.bounds;
  const positions = flowPoints.geometry.attributes.position.array;
  for (let i = 0; i < flowPoints.userData.count; i++) {
    positions[i * 3] = box.min.x - size.x * (.2 + Math.random() * .8);
    positions[i * 3 + 1] = box.min.y + Math.random() * Math.max(size.y * 1.5, .5);
    positions[i * 3 + 2] = box.min.z - size.z * .45 + Math.random() * size.z * 1.9;
  }
  flowPoints.geometry.attributes.position.needsUpdate = true;
}

function animateFlow(dt) {
  if (!state.wind || !state.bounds) return;
  const { box, size } = state.bounds;
  const positions = flowPoints.geometry.attributes.position.array;
  const speed = Math.max(size.x, size.z) * .75;
  for (let i = 0; i < flowPoints.userData.count; i++) {
    positions[i * 3] += dt * speed;
    positions[i * 3 + 1] += Math.sin(performance.now() * .002 + i) * dt * size.y * .025;
    if (positions[i * 3] > box.max.x + size.x) positions[i * 3] = box.min.x - size.x * .7;
  }
  flowPoints.geometry.attributes.position.needsUpdate = true;
}

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), .05);
  controls.update(dt);
  state.parts.forEach((part) => {
    const target = state.categoryExplode ? (part.category === state.categoryExplode ? 1 : 0) : state.explode;
    part.amount += (target - part.amount) * .11;
    part.object.position.copy(part.base).addScaledVector(part.explode, part.amount);
  });
  animateFlow(dt);
  renderer.render(scene, camera);
}

function disposeCurrent() {
  if (!state.root) return;
  scene.remove(state.root);
  state.root.traverse((object) => {
    if (!object.isMesh) return;
    object.geometry?.dispose?.();
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    materials.forEach((material) => material?.dispose?.());
  });
  state.root = null;
}

function mapTarget(target) {
  const value = String(target || "whole_car").toLowerCase().replaceAll(" ", "_");
  const mapped = ({ rear_wing: "wing", brakes: "wheels", suspension: "wheels", transmission: "engine", cooling: "engine", fuel: "engine", front: "hood", rear: "engine", top: "wing", whole: "whole_car", car: "whole_car" })[value] || value;
  if (!state.asset?.dynamicParts || mapped === "whole_car" || state.asset.info[mapped]) return mapped;
  const aliases = {
    engine: /block|structure/i, core: /block|structure/i, upper: /cylinder head/i,
    lower: /base|stand/i, exhaust: /exhaust manifold/i, cooling: /pipe/i,
    transmission: /bearing/i, left: /piston/i, right: /camshaft/i,
  };
  const match = Object.entries(state.asset.info).find(([, info]) => (aliases[mapped] || new RegExp(mapped, "i")).test(info.name));
  return match?.[0] || "whole_car";
}

async function ask(message) {
  if (!state.asset) return;
  addMessage("user", message);
  state.history.push({ role: "user", content: message });
  const thinking = addMessage("assistant", "Reading the assembly and verified vehicle context…", "Blueprint", true);
  let response;
  try {
    response = await callAgent(message);
    setAgentStatus(response.data?.provider || "ai");
  } catch {
    response = offlineAgent(message);
    setAgentStatus("local");
  }
  thinking.remove();
  (response.actions || []).forEach(executeAction);
  const verified = response.data?.verified === true || response.data?.source === "supabase";
  const provider = response.data?.provider;
  const sourceLabel = verified ? "Blueprint / Supabase verified" : provider && provider !== "local" ? `Blueprint / ${provider}` : "Blueprint / scene intelligence";
  addMessage("assistant", response.speech || "Done.", sourceLabel);
  state.history.push({ role: "assistant", content: response.speech || "Done." });
}

async function callAgent(message) {
  const endpoint = document.querySelector('meta[name="agent-endpoint"]')?.content || "/api/agent";
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 32000);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        history: state.history.slice(-8, -1),
        context: {
          car: state.asset.dbName,
          carId: state.asset.id,
          selectedPart: state.selected,
          mode: "learn",
          assetType: state.asset.type,
          availableParts: Object.entries(state.asset.info).map(([id, info]) => ({ id, name: info.name })),
        },
      }),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Agent ${response.status}`);
    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

function offlineAgent(message) {
  const q = message.toLowerCase();
  const category = detectCategory(q) || state.selected;
  const wholeAssembly = /take (the )?(car|vehicle|machine|it) apart|whole (car|vehicle|assembly)|full (car|vehicle|assembly)/.test(q);
  const actions = [];
  let speech;
  if (/reset|assemble|put (it|the car) back|start over/.test(q)) {
    actions.push({ tool: "reset_view", args: {} });
    speech = "Everything is back in its assembled reference position.";
  } else if (/take .*apart|explode|separate|disassemble/.test(q)) {
    actions.push({ tool: "explode", args: { target: wholeAssembly ? "whole_car" : (category || "whole_car") } });
    speech = !wholeAssembly && category ? `I've separated the ${partTitle(category).toLowerCase()} so you can see how it sits in the assembly.` : "I've opened the full exploded view. Each group moves away from the assembly datum so its relationship is easier to read.";
  } else if (/wind|airflow|aero/.test(q) && !category) {
    actions.push({ tool: "airflow", args: { active: true } });
    speech = "Airflow view is on. The streamlines are illustrative, but they make the car's pressure-management surfaces easier to discuss.";
  } else if (/paint|color|colour/.test(q)) {
    const color = q.match(/nardo gr[ae]y|red|blue|black|white|silver|yellow|orange|green|#[0-9a-f]{6}/)?.[0] || "Nardo Grey";
    actions.push({ tool: "set_paint", args: { color } });
    speech = `I've changed the body finish to ${color}. The structural and non-painted materials remain separate.`;
  } else if (/only|isolate|by itself/.test(q) && category) {
    actions.push({ tool: "isolate", args: { target: category } });
    speech = `I've isolated the ${partTitle(category).toLowerCase()}. Use Reset view when you want the surrounding systems back.`;
  } else if (category) {
    const info = state.asset.info[category] || genericPartInfo(category);
    actions.push({ tool: "focus_camera", args: { target: category } }, { tool: "highlight", args: { target: category } }, { tool: "show_specs", args: { part: category } });
    speech = info.desc;
  } else if (/power|horsepower|output/.test(q)) {
    speech = `This ${state.asset.name} is represented here at ${state.asset.power}. Open the engine system and I can connect that figure to the physical layout.`;
  } else if (/top speed|fast/.test(q)) {
    speech = `${state.asset.name} is cataloged here with a top-speed figure of ${state.asset.top}. The live Supabase agent can attach the verified source record when configured.`;
  } else if (/what|tell|explain|learn|about/.test(q)) {
    speech = `${state.asset.description} Choose a system—or ask me to show the engine, isolate the brakes, run airflow, repaint the body, or take the whole assembly apart.`;
  } else {
    speech = `I'm with the ${state.asset.name}. Try “show me the engine,” “isolate the wheels,” “take it apart,” or ask a specific question about how a system works.`;
  }
  return { speech, actions, data: {} };
}

function detectCategory(query) {
  if (state.asset.dynamicParts) {
    const direct = Object.entries(state.asset.info).find(([, info]) => {
      const name = info.name.toLowerCase();
      return query.includes(name) || name.split(/\s+/).some((word) => word.length > 5 && query.includes(word));
    });
    if (direct) return direct[0];
  }
  const tests = [
    ["engine", /engine|motor|powertrain|flat.?six|v12|v16|w16|cylinder/],
    ["wheels", /wheel|brake|caliper|disc|tire|tyre|suspension/],
    ["wing", /wing|spoiler|aero|downforce|splitter|diffuser/],
    ["hood", /hood|bonnet|frunk|front structure/],
    ["doors", /door|mirror/],
    ["exhaust", /exhaust|muffler|tailpipe|header/],
    ["interior", /interior|cockpit|seat|steering|cabin/],
    ["upper", /upper assembly|top of the engine/],
    ["core", /engine core|crank|central core/],
    ["left", /left bank/],
    ["right", /right bank/],
    ["lower", /lower assembly|sump|bottom end/],
  ];
  for (const [category, pattern] of tests) {
    if (pattern.test(query) && state.asset.info[category]) return category;
  }
  return null;
}

function executeAction(action) {
  const args = action.args || {};
  switch (action.tool) {
    case "focus_camera": focusCategory(args.target); break;
    case "highlight": highlightCategory(args.target); break;
    case "explode": explodeCategory(args.target); break;
    case "isolate": isolateCategory(args.target); break;
    case "reset_view": resetView(); break;
    case "show_specs": selectCategory(mapTarget(args.part), false); break;
    case "set_paint": setPaint(args.color); break;
    case "airflow": setWind(args.active !== false); break;
    case "show_labels": elements.partRail.animate([{ opacity: .35 }, { opacity: 1 }], { duration: 550 }); break;
  }
}

function addMessage(role, content, label = role === "user" ? "You" : "Blueprint", thinking = false) {
  const message = document.createElement("div");
  message.className = `message ${role}${thinking ? " is-thinking" : ""}`;
  const author = document.createElement("span");
  const text = document.createElement("p");
  author.textContent = label;
  text.textContent = content;
  message.append(author, text);
  elements.conversation.append(message);
  elements.conversation.scrollTop = elements.conversation.scrollHeight;
  return message;
}

function setAgentStatus(provider) {
  const labels = {
    openai: "OpenAI agent connected",
    featherless: "Featherless agent connected",
    ai: "AI agent connected",
    supabase: "Supabase verified data ready",
    local: "Local scene knowledge",
  };
  elements.agentStatus.innerHTML = `<i></i> ${labels[provider] || "Blueprint agent"}`;
}

async function probeAgentHealth() {
  try {
    const res = await fetch("/api/health");
    if (!res.ok) return;
    const health = await res.json();
    if (health.supabase?.connected) setAgentStatus("supabase");
    else if (health.providers?.featherless) setAgentStatus("featherless");
    else if (health.providers?.openai) setAgentStatus("openai");
  } catch {
    /* local dev without health route */
  }
}

renderLibrary();
wireInterface();
initScene();
routeFromLocation(false);
probeAgentHealth();

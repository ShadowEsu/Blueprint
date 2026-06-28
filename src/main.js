import * as THREE from "three";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js";

const sections = [...document.querySelectorAll(".page-section")];
const dots = [...document.querySelectorAll(".dot")];
const backgrounds = [...document.querySelectorAll(".backdrop-panel")];

let activeIndex = 0;

function setActive(index) {
  activeIndex = index;
  document.body.dataset.scene = String(index);

  sections.forEach((section, sectionIndex) => {
    section.classList.toggle("is-active", sectionIndex === index);
  });

  dots.forEach((dot, dotIndex) => {
    dot.classList.toggle("is-active", dotIndex === index);
  });

  backgrounds.forEach((background, backgroundIndex) => {
    background.classList.toggle("is-active", backgroundIndex === index);
  });
}

const observer = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (visible) {
      setActive(Number(visible.target.dataset.index));
    }
  },
  { threshold: [0.42, 0.58, 0.74] }
);

sections.forEach((section) => observer.observe(section));

function heroModelUrls() {
  const fast =
    "https://cdn.jsdelivr.net/gh/ShadowEsu/Blueprint@main/explorer/assets/laferrari.glb";
  const showroom = "./assets/blueprint-showroom-car.glb";
  const mobile = window.innerWidth < 760;

  if (mobile) return [fast, showroom];
  return [showroom, fast];
}

function initShowroom() {
  const canvas = document.querySelector("#showroom");
  const loadingEl = document.querySelector(".model-loading");
  if (!canvas) return;

  try {
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });

    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth < 760 ? 1.35 : 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    const cameraTarget = new THREE.Vector3(0, 0.42, 0);

    const rig = new THREE.Group();
    scene.add(rig);

    const floorGrid = new THREE.GridHelper(7.8, 22, 0xd1ddea, 0xe1e9f3);
    floorGrid.position.y = -0.13;
    floorGrid.material.transparent = true;
    floorGrid.material.opacity = 0.34;
    floorGrid.material.depthWrite = false;
    rig.add(floorGrid);

    const hemisphere = new THREE.HemisphereLight(0xffffff, 0xd3e3ff, 1.7);
    scene.add(hemisphere);

    const keyLight = new THREE.DirectionalLight(0xffffff, 3.3);
    keyLight.position.set(4.6, 6.5, 3.8);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(2048, 2048);
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 16;
    keyLight.shadow.camera.left = -5.5;
    keyLight.shadow.camera.right = 5.5;
    keyLight.shadow.camera.top = 5.5;
    keyLight.shadow.camera.bottom = -5.5;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x9dccff, 1.8);
    rimLight.position.set(-4.5, 3.8, -5.2);
    scene.add(rimLight);

    const stripLight = new THREE.PointLight(0xffffff, 1.4, 11);
    stripLight.position.set(0, 3.2, 3.8);
    scene.add(stripLight);

    const loader = new GLTFLoader();
    let carMesh = null;

    function mountCar(gltf, isLaFerrari) {
      if (carMesh) {
        rig.remove(carMesh);
        carMesh.traverse((child) => {
          if (child.isMesh) {
            child.geometry?.dispose();
            if (Array.isArray(child.material)) child.material.forEach((m) => m.dispose());
            else child.material?.dispose();
          }
        });
      }

      carMesh = gltf.scene;
      const box = new THREE.Box3().setFromObject(carMesh);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      const scale = (isLaFerrari ? 4.35 : 4.85) / Math.max(size.x, size.y, size.z);

      carMesh.position.sub(center);
      carMesh.scale.setScalar(scale);
      carMesh.rotation.y = isLaFerrari ? -Math.PI / 2 - 0.18 : -0.28;

      carMesh.traverse((child) => {
        if (!child.isMesh) return;
        child.castShadow = true;
        child.receiveShadow = true;

        if (child.material) {
          child.material = child.material.clone();
          child.material.envMapIntensity = 1.35;
          if ("roughness" in child.material) {
            child.material.roughness = Math.min(
              Math.max(child.material.roughness ?? 0.28, 0.18),
              0.62
            );
          }
          if ("metalness" in child.material) {
            child.material.metalness = Math.min(
              Math.max(child.material.metalness ?? 0.18, 0.08),
              0.82
            );
          }
        }
      });

      rig.add(carMesh);
      document.body.classList.add("model-ready");
      if (loadingEl) loadingEl.textContent = "";
    }

    function tryLoad(urls, index = 0) {
      if (index >= urls.length) {
        if (loadingEl) loadingEl.textContent = "Showroom preview unavailable";
        return;
      }

      const url = urls[index];
      const isLaFerrari = url.includes("laferrari");

      loader.load(
        url,
        (gltf) => mountCar(gltf, isLaFerrari),
        (event) => {
          if (!loadingEl || !event.total) return;
          const pct = Math.min(99, Math.round((event.loaded / event.total) * 100));
          loadingEl.textContent = `Loading showroom ${pct}%`;
        },
        () => tryLoad(urls, index + 1)
      );
    }

    tryLoad(heroModelUrls());

    const sceneStates = [
      {
        camera: new THREE.Vector3(4.2, 1.35, 6.4),
        target: new THREE.Vector3(0.15, 0.42, 0),
        rig: new THREE.Vector3(1.24, 0.04, 0),
        scale: 0.78,
        floorOpacity: 0.34,
        exposure: 1.08,
      },
      {
        camera: new THREE.Vector3(4.2, 1.35, 6.4),
        target: new THREE.Vector3(0.15, 0.42, 0),
        rig: new THREE.Vector3(1.24, 0.04, 0),
        scale: 0.78,
        floorOpacity: 0,
        exposure: 1.1,
      },
      {
        camera: new THREE.Vector3(4.7, 1.34, 6.1),
        target: new THREE.Vector3(0.1, 0.4, 0),
        rig: new THREE.Vector3(1.36, 0.02, 0),
        scale: 0.77,
        floorOpacity: 0,
        exposure: 1,
      },
      {
        camera: new THREE.Vector3(4.7, 1.34, 6.1),
        target: new THREE.Vector3(0.1, 0.4, 0),
        rig: new THREE.Vector3(1.36, 0.02, 0),
        scale: 0.77,
        floorOpacity: 0.3,
        exposure: 1.06,
      },
    ];

    const current = {
      camera: sceneStates[0].camera.clone(),
      target: sceneStates[0].target.clone(),
      rig: sceneStates[0].rig.clone(),
      scale: sceneStates[0].scale,
      floorOpacity: sceneStates[0].floorOpacity,
      exposure: sceneStates[0].exposure,
    };

    function resize() {
      const width = window.innerWidth;
      const height = window.innerHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.fov = width < 760 ? 42 : 34;
      camera.updateProjectionMatrix();
    }

    window.addEventListener("resize", resize, { passive: true });
    window.visualViewport?.addEventListener("resize", resize, { passive: true });
    window.addEventListener("orientationchange", () => setTimeout(resize, 120), { passive: true });
    resize();

    canvas.addEventListener("webglcontextlost", (event) => {
      event.preventDefault();
    });

    const clock = new THREE.Clock();
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function render() {
      const target = sceneStates[activeIndex];
      const step = 0.055;

      current.camera.lerp(target.camera, step);
      current.target.lerp(target.target, step);
      current.rig.lerp(target.rig, step);
      current.scale += (target.scale - current.scale) * step;
      current.floorOpacity += (target.floorOpacity - current.floorOpacity) * step;
      current.exposure += (target.exposure - current.exposure) * step;

      const width = window.innerWidth;
      if (width < 760) {
        current.rig.x = THREE.MathUtils.lerp(current.rig.x, 0.08, 0.045);
        current.rig.y = THREE.MathUtils.lerp(current.rig.y, -0.42, 0.045);
        current.scale = THREE.MathUtils.lerp(current.scale, 0.58, 0.045);
        current.target.y = THREE.MathUtils.lerp(current.target.y, 0.28, 0.045);
      } else {
        current.target.y = THREE.MathUtils.lerp(current.target.y, target.target.y, 0.045);
      }

      camera.position.copy(current.camera);
      camera.lookAt(cameraTarget.copy(current.target));
      rig.position.copy(current.rig);
      rig.scale.setScalar(current.scale);
      floorGrid.material.opacity = current.floorOpacity;
      renderer.toneMappingExposure = current.exposure;

      const delta = clock.getDelta();
      if (!reducedMotion && (activeIndex === 0 || activeIndex === 3)) {
        rig.rotation.y += delta * 0.18;
      }

      renderer.render(scene, camera);
      requestAnimationFrame(render);
    }

    render();
  } catch (error) {
    console.warn("[BluePrint] showroom disabled:", error);
    if (loadingEl) loadingEl.textContent = "Showroom preview unavailable";
  }
}

initShowroom();

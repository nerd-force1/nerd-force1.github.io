// Visual harness for the nf1 rack scene — igloo.inc register.
// Hardcoded hues are FINE here: this file never enters src/app; the port reads tokens.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

// Minimal vignette: darken toward the corners, nothing else. three's stock VignetteShader
// mixes toward white at these parameter ranges — wrong tool.
const CornerDarkShader = {
  uniforms: { tDiffuse: { value: null }, floorLevel: { value: 0.22 } },
  vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float floorLevel;
    varying vec2 vUv;
    void main() {
      vec4 c = texture2D(tDiffuse, vUv);
      float d = length((vUv - vec2(0.5, 0.62)) * vec2(1.3, 1.15));
      float v = mix(1.0, floorLevel, smoothstep(0.36, 0.9, d));
      gl_FragColor = vec4(c.rgb * v, c.a);
    }`,
};

const HUES = ['#339ad5', '#a78bfa', '#06b6d4', '#ec4899', '#f97316'];

// Same numbers as rack.geometry.ts.
const UNITS = 6, SLOT_H = 0.5, GAP = 0.06, PAD = 0.12, W = 2.2, D = 1.6;
const HEIGHT = UNITS * SLOT_H + (UNITS + 1) * GAP + PAD * 2; // 3.66
const TOP = HEIGHT - PAD - GAP - SLOT_H / 2;
const STEP = SLOT_H + GAP;

export async function renderOnce() {
  const canvas = document.createElement('canvas');
  document.body.appendChild(canvas);
  const w = innerWidth, h = innerHeight;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true }); // harness-only: lets --screenshot read the buffer
  renderer.setSize(w, h, false);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#06090f');
  scene.fog = new THREE.FogExp2('#06090f', 0.055);

  // Environment for metal to read as metal.
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(35, w / h, 0.1, 60);
  camera.position.set(4.4, 3.0, 8.6);
  camera.lookAt(0, HEIGHT * 0.44, 0);

  // ---- floor ----
  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(30, 48).rotateX(-Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: '#07090c', roughness: 0.82, metalness: 0.1, envMapIntensity: 0.03 }),
  );
  floor.receiveShadow = true;
  scene.add(floor);

  // ---- rack frame ----
  const metal = new THREE.MeshStandardMaterial({ color: '#181e29', roughness: 0.38, metalness: 0.9 });
  const darker = new THREE.MeshStandardMaterial({ color: '#0c1017', roughness: 0.5, metalness: 0.85 });

  const rack = new THREE.Group();
  scene.add(rack);

  // ?hero=1 previews the rack's hero pose (scroll zero, beside the headline) — the same
  // constants as HERO_SHIFT_X/Z + HERO_TURN in rack-scene.ts. Keep them in step.
  {
    const q = new URLSearchParams(location.search);
    if (q.get('hero') === '1') {
      rack.position.x = parseFloat(q.get('x') ?? '2.4');
      rack.position.z = parseFloat(q.get('z') ?? '-1.2');
      rack.rotation.y = parseFloat(q.get('turn') ?? '-0.14');
    }
  }

  // cavity (interior)
  const cavity = new THREE.Mesh(
    new THREE.BoxGeometry(W, HEIGHT, D),
    new THREE.MeshStandardMaterial({ color: '#05070b', roughness: 0.9, metalness: 0.2 }),
  );
  cavity.position.y = HEIGHT / 2;
  rack.add(cavity);

  // corner rails
  const railGeo = new THREE.BoxGeometry(0.1, HEIGHT + 0.06, 0.1);
  for (const [sx, sz] of [[-1, -1], [-1, 1], [1, -1], [1, 1]]) {
    const rail = new THREE.Mesh(railGeo, metal);
    rail.position.set(sx * (W / 2 + 0.02), HEIGHT / 2, sz * (D / 2 + 0.02));
    rack.add(rail);
  }
  // caps
  for (const y of [-0.045, HEIGHT + 0.045]) {
    const cap = new THREE.Mesh(new THREE.BoxGeometry(W + 0.12, 0.1, D + 0.12), metal);
    cap.position.y = y;
    rack.add(cap);
  }
  // side + back panels
  const sideGeo = new THREE.BoxGeometry(0.04, HEIGHT, D);
  for (const sx of [-1, 1]) {
    const side = new THREE.Mesh(sideGeo, darker);
    side.position.set(sx * (W / 2 + 0.04), HEIGHT / 2, 0);
    rack.add(side);
  }
  const back = new THREE.Mesh(new THREE.BoxGeometry(W, HEIGHT, 0.04), darker);
  back.position.set(0, HEIGHT / 2, -(D / 2 + 0.04));
  rack.add(back);

  // ---- nodes ----
  const plateMat = new THREE.MeshStandardMaterial({ color: '#141a24', roughness: 0.42, metalness: 0.85 });
  const ventMat = new THREE.MeshStandardMaterial({ color: '#070a10', roughness: 0.85, metalness: 0.3 });
  const handleMat = new THREE.MeshStandardMaterial({ color: '#242c3a', roughness: 0.35, metalness: 0.9 });

  for (let i = 0; i < 6; i++) {
    const y = TOP - i * STEP;
    if (i === 5) {
      // empty slot: recessed dark void
      const voidMesh = new THREE.Mesh(
        new THREE.BoxGeometry(W * 0.92, SLOT_H * 0.92, 0.02),
        new THREE.MeshStandardMaterial({ color: '#04060a', roughness: 1, metalness: 0 }),
      );
      voidMesh.position.set(0, y, D / 2 - 0.06);
      rack.add(voidMesh);
      continue;
    }
    // faceplate, slightly proud of the frame
    const plate = new THREE.Mesh(new THREE.BoxGeometry(W * 0.94, SLOT_H * 0.9, 0.07), plateMat);
    plate.position.set(0, y, D / 2 + 0.005);
    rack.add(plate);

    // vent louvres: thin horizontal lines, right side
    for (let v = 0; v < 6; v++) {
      const louvre = new THREE.Mesh(new THREE.BoxGeometry(W * 0.42, 0.011, 0.012), ventMat);
      louvre.position.set(W * 0.14, y - SLOT_H * 0.21 + v * (SLOT_H * 0.42 / 5), D / 2 + 0.045);
      rack.add(louvre);
    }

    // handles at both ends
    for (const sx of [-1, 1]) {
      const handle = new THREE.Mesh(new THREE.BoxGeometry(0.05, SLOT_H * 0.6, 0.05), handleMat);
      handle.position.set(sx * W * 0.43, y, D / 2 + 0.06);
      rack.add(handle);
    }

    // LED strip: 8 tiny emissive quads in the pillar hue, left of centre
    const hue = new THREE.Color(HUES[i]);
    for (let l = 0; l < 12; l++) {
      const on = Math.random() > 0.3;
      const led = new THREE.Mesh(
        new THREE.BoxGeometry(0.02, 0.02, 0.01),
        new THREE.MeshStandardMaterial({
          color: '#05070b',
          emissive: hue,
          emissiveIntensity: on ? 2.4 + Math.random() * 1.6 : 0.15,
          roughness: 0.4, metalness: 0.1,
        }),
      );
      led.position.set(-W * 0.40 + l * 0.042, y + SLOT_H * 0.2, D / 2 + 0.045);
      rack.add(led);
    }
    // status LED, far right, in hue
    const status = new THREE.Mesh(
      new THREE.BoxGeometry(0.034, 0.034, 0.01),
      new THREE.MeshStandardMaterial({ color: '#05070b', emissive: hue, emissiveIntensity: 3.2, roughness: 0.4, metalness: 0.1 }),
    );
    status.position.set(W * 0.40, y - SLOT_H * 0.22, D / 2 + 0.045);
    rack.add(status);
  }

  // ---- ghost racks: the rest of the datacenter, receding into the fog ----
  {
    const ghostBody = new THREE.MeshStandardMaterial({ color: '#0d121b', roughness: 0.55, metalness: 0.8, envMapIntensity: 0.35 });
    const ghostSlot = new THREE.MeshStandardMaterial({ color: '#070a10', roughness: 0.8, metalness: 0.4 });
    const rows = [
      // fronts turned toward the aisle/camera so their LED walls read down the depth
      { x: -6.4, rotY: 0.9, from: -7, count: 10, step: 2.4 },
      { x: 9.2, rotY: -1.0, from: -7, count: 9, step: 2.6 },
    ];
    for (const r of rows) {
      for (let i = 0; i < r.count; i++) {
        const ghost = new THREE.Group();
        ghost.position.set(r.x - (r.x > 0 ? -i * 0.15 : i * 0.15), 0, r.from - i * r.step);
        ghost.rotation.y = r.rotY;
        const body = new THREE.Mesh(new THREE.BoxGeometry(W, HEIGHT, D), ghostBody);
        body.position.y = HEIGHT / 2;
        ghost.add(body);
        for (let sl = 0; sl < 5; sl++) {
          const y = TOP - sl * STEP;
          const band = new THREE.Mesh(new THREE.BoxGeometry(W * 0.92, SLOT_H * 0.82, 0.02), ghostSlot);
          band.position.set(0, y, D / 2 + 0.011);
          ghost.add(band);
          // full LED strip per slot — rows of lights are what make a datacenter read
          const hue = new THREE.Color(HUES[Math.floor(Math.random() * HUES.length)]);
          for (let l = 0; l < 8; l++) {
            if (Math.random() < 0.25) continue;
            const dot = new THREE.Mesh(
              new THREE.BoxGeometry(0.03, 0.03, 0.012),
              new THREE.MeshStandardMaterial({ color: '#05070b', emissive: hue, emissiveIntensity: 1.6 + Math.random() * 1.2, roughness: 0.4, metalness: 0.1 }),
            );
            dot.position.set(-W * 0.36 + l * 0.1, y + SLOT_H * 0.18, D / 2 + 0.03);
            ghost.add(dot);
          }
        }
        scene.add(ghost);
      }
    }
  }

  // ---- the room: raised-floor grid, walls, ceiling with aisle light strips ----
  {
    const grid = new THREE.GridHelper(60, 50);
    grid.material.transparent = true;
    grid.material.opacity = 0.15;
    grid.material.color = new THREE.Color('#141b26');
    grid.position.y = 0.005;
    scene.add(grid);

    const wallMat = new THREE.MeshStandardMaterial({ color: '#0a0e15', roughness: 0.95, metalness: 0.1, envMapIntensity: 0.04 });
    const backWall = new THREE.Mesh(new THREE.PlaneGeometry(70, 8), wallMat);
    backWall.position.set(0, 4, -26);
    scene.add(backWall);
    const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(60, 8), wallMat);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.set(-15, 4, -10);
    scene.add(leftWall);
    const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(60, 8), wallMat);
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.position.set(18, 4, -10);
    scene.add(rightWall);

    const ceilMat = new THREE.MeshStandardMaterial({ color: '#05070b', roughness: 0.95, metalness: 0.1, envMapIntensity: 0.04 });
    const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(70, 60), ceilMat);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.set(0, 6.2, -10);
    scene.add(ceiling);

    // aisle light strips: dim emissive lines running into the depth, bloom does the glow
    const stripMat = new THREE.MeshStandardMaterial({ color: '#05070b', emissive: new THREE.Color('#7ba4c4'), emissiveIntensity: 1.5, roughness: 0.6, metalness: 0.1 });
    for (const sx of [-7.5, -3.5, 0.2, 3.8, 7.4, 11]) {
      const strip = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.03, 34), stripMat);
      strip.position.set(sx, 6.1, -12);
      scene.add(strip);
    }
  }


  // ---- lighting ----
  // Spot, not directional: the hero rack sits in its own pool of light and the rest of
  // the room stays lit only by LEDs and ceiling strips — broad key light washed the floor
  // office-grey.
  const key = new THREE.SpotLight('#cfe2f0', 260, 0, 0.42, 0.65, 1.9);
  key.position.set(5, 8, 5);
  key.target.position.set(0, 1.4, 0);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.bias = -0.0004;
  scene.add(key, key.target);
  const form = new THREE.DirectionalLight('#cfe2f0', 0.15); // barely-there global form light
  form.position.set(4, 7, 3);
  scene.add(form);
  const rim = new THREE.DirectionalLight('#5d8fb8', 2.6);
  rim.position.set(-5, 4, -4);
  scene.add(rim);
  rack.traverse((o) => { if (o.isMesh) { o.castShadow = true; } });
  const fill = new THREE.PointLight('#339ad5', 0.9, 7, 1.8); // cold-aisle cast, just kisses the rack
  fill.position.set(-1.4, 1.6, 2.2);
  scene.add(fill);
  const front = new THREE.DirectionalLight('#7ba4c4', 0.32); // soft frontal, keeps plates readable
  front.position.set(2, 2, 8);
  scene.add(front);
  scene.add(new THREE.AmbientLight('#8fb4cc', 0.07));

  // ---- atmosphere: dim blue radial glow low behind the rack ----
  {
    const c = document.createElement('canvas'); c.width = c.height = 256;
    const g = c.getContext('2d');
    const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    grad.addColorStop(0, 'rgba(51,154,213,0.30)');
    grad.addColorStop(1, 'rgba(51,154,213,0)');
    g.fillStyle = grad; g.fillRect(0, 0, 256, 256);
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({
      map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false,
      blending: THREE.AdditiveBlending, opacity: 0.5,
    }));
    glow.position.set(0, 1.7, -3.8);
    glow.scale.set(10, 7, 1);
    glow.material.opacity = 0.36;
    scene.add(glow);
  }

  // ---- bloom ----
  const msaaTarget = new THREE.WebGLRenderTarget(w, h, { samples: 4, type: THREE.HalfFloatType });
  const composer = new EffectComposer(renderer, msaaTarget);
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(new UnrealBloomPass(new THREE.Vector2(w, h), 0.55, 0.4, 0.62));
  composer.addPass(new ShaderPass(CornerDarkShader));
  composer.addPass(new OutputPass());

  composer.render();
  composer.render();
  // Headless --screenshot never presents the WebGL buffer; bake the frame into a plain <img>.
  const img = new Image();
  img.src = canvas.toDataURL('image/png');
  img.style.cssText = 'position:absolute;inset:0;width:100%;height:100%';
  await new Promise((r) => { img.onload = r; });
  canvas.remove();
  document.body.appendChild(img);
}

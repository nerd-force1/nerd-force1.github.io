import {
  ChangeDetectionStrategy, Component, DestroyRef, ElementRef,
  afterNextRender, inject, viewChild,
} from '@angular/core';
import { JourneyStore } from '../../../store/journey.store';
import { buildRackLayout } from './rack.geometry';
import { readPalette, readScenePalette, cssVarReader, Palette, SceneSurface } from './scene.palette';
import { projectToScreen } from '../../../core/journey.project';

/** True only where a scene can honestly run. Cheap checks first; WebGL probe last. */
function canRunScene(): boolean {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  const conn = (navigator as { connection?: { saveData?: boolean } }).connection;
  if (conn?.saveData === true) return false;
  try {
    const probe = document.createElement('canvas');
    return !!probe.getContext('webgl2');
  } catch {
    return false;
  }
}

/**
 * The rack, rendered live — igloo register: dark metal emerging from fog, LED strips in the
 * pillar hues as the only saturated colour, bloom for the glow, one halo of brand blue behind.
 * The look was tuned frame-by-frame in a screenshot harness, not written blind; if you change
 * materials or lights, re-tune by screenshot (scratchpad harness, or drive the page) — the
 * first cut of this scene shipped untuned and read as flat coloured rectangles.
 *
 * Three.js and its postprocessing modules are imported dynamically inside afterNextRender,
 * and both halves of that matter. afterNextRender never fires on the server, so the SSR pass
 * cannot touch WebGL. The dynamic import keeps all of it in its own lazy chunk — a static
 * import would blow the initial-bundle budget (500kB warn / 1MB error) and charge every
 * visitor who never runs the scene.
 *
 * The camera LOCKS once framed. The SVG lead lines are DOM drawn to projected node positions,
 * so a moving camera means reprojecting every node every frame and a line that lags its node
 * forever. Locking makes projection a resize-time calculation. What DOES move is the rack
 * itself: on wide viewports it starts beside the hero headline (JourneyStore.arrival, the
 * HERO_* constants below) and travels to the origin — the pose the anchors are projected
 * from — arriving exactly as the section pins, before the first line can exist. The room
 * additionally breathes through LED flicker and halo breathing, and the exposure follows
 * JourneyStore.visibility (full from scroll zero on wide viewports, approach-faded on narrow).
 *
 * No text and no colour literals live here. Hues come from readPalette / readScenePalette
 * (see their comments for why a null return must never become a fallback), and every word on
 * screen is DOM elsewhere.
 */
@Component({
  selector: 'nf-rack-scene',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<canvas #canvas class="absolute inset-0 h-full w-full"></canvas>`,
})
export class RackScene {
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly store = inject(JourneyStore);
  private readonly destroyRef = inject(DestroyRef);

  // Set true by the onDestroy callback below, which is registered up front — not after the
  // dynamic-import awaits — so a destroy mid-import is never missed. `teardown` is filled
  // in once the scene exists; the callback runs whatever it finds, including null.
  private destroyed = false;
  private teardown: (() => void) | null = null;

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.destroyed = true;
      this.teardown?.();
      this.teardown = null;
    });
    afterNextRender(() => {
      if (!canRunScene()) return;
      const read = cssVarReader(document.documentElement);
      const palette = readPalette(read);
      const surfaces = readScenePalette(read);
      if (!palette || !surfaces) return;
      void this.start(palette, surfaces);
    });
  }

  private async start(palette: Palette, surf: Record<SceneSurface, string>): Promise<void> {
    const [THREE, { RoomEnvironment }, { EffectComposer }, { RenderPass }, { UnrealBloomPass }, { OutputPass }, { ShaderPass }] =
      await Promise.all([
        import('three'),
        import('three/examples/jsm/environments/RoomEnvironment.js'),
        import('three/examples/jsm/postprocessing/EffectComposer.js'),
        import('three/examples/jsm/postprocessing/RenderPass.js'),
        import('three/examples/jsm/postprocessing/UnrealBloomPass.js'),
        import('three/examples/jsm/postprocessing/OutputPass.js'),
        import('three/examples/jsm/postprocessing/ShaderPass.js'),
      ]);
    // The component may have been destroyed while the imports were pending — bail before
    // touching the canvas or creating a renderer/RAF loop that would outlive it.
    if (this.destroyed) return;

    const layout = buildRackLayout();
    const H = layout.height, W = layout.width, D = layout.depth;
    const canvasEl = this.canvas().nativeElement;

    // alpha: at visibility 0 the frame is skipped and the buffer cleared, and a transparent
    // canvas lets journey-bg's CSS ambient show through under the hero. While the scene runs,
    // the bloom pass composites over an opaque near-black anyway — the fog colour owns it.
    const renderer = new THREE.WebGLRenderer({ canvas: canvasEl, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(surf.cavity, 0.055);

    // Environment map so the dark metals read as metal instead of flat grey.
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 60);
    camera.position.set(4.4, 3.0, 8.6);
    camera.lookAt(0, H * 0.44, 0);

    // Floor.
    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(30, 48).rotateX(-Math.PI / 2),
      new THREE.MeshStandardMaterial({ roughness: 0.82, metalness: 0.1, envMapIntensity: 0.03 }),
    );
    (floor.material as { color: { set(c: string): void } }).color.set(surf.floor);
    floor.receiveShadow = true;
    scene.add(floor);

    const mat = (colour: string, roughness: number, metalness: number) => {
      const m = new THREE.MeshStandardMaterial({ roughness, metalness });
      m.color.set(colour);
      return m;
    };
    const metal = mat(surf.metal, 0.38, 0.9);
    const metalDeep = mat(surf.metalDeep, 0.5, 0.85);
    const plateMat = mat(surf.plate, 0.42, 0.85);
    const ventMat = mat(surf.vent, 0.85, 0.3);
    const handleMat = mat(surf.handle, 0.35, 0.9);

    const rack = new THREE.Group();
    scene.add(rack);

    // Cabinet: interior cavity, four corner rails, caps, side and back panels.
    const cavity = new THREE.Mesh(new THREE.BoxGeometry(W, H, D), mat(surf.cavity, 0.9, 0.2));
    cavity.position.y = H / 2;
    rack.add(cavity);

    const railGeo = new THREE.BoxGeometry(0.1, H + 0.06, 0.1);
    for (const [sx, sz] of [[-1, -1], [-1, 1], [1, -1], [1, 1]]) {
      const rail = new THREE.Mesh(railGeo, metal);
      rail.position.set(sx * (W / 2 + 0.02), H / 2, sz * (D / 2 + 0.02));
      rack.add(rail);
    }
    for (const y of [-0.045, H + 0.045]) {
      const cap = new THREE.Mesh(new THREE.BoxGeometry(W + 0.12, 0.1, D + 0.12), metal);
      cap.position.y = y;
      rack.add(cap);
    }
    const sideGeo = new THREE.BoxGeometry(0.04, H, D);
    for (const sx of [-1, 1]) {
      const side = new THREE.Mesh(sideGeo, metalDeep);
      side.position.set(sx * (W / 2 + 0.04), H / 2, 0);
      rack.add(side);
    }
    const back = new THREE.Mesh(new THREE.BoxGeometry(W, H, 0.04), metalDeep);
    back.position.set(0, H / 2, -(D / 2 + 0.04));
    rack.add(back);

    // Ghost racks: the rest of the datacenter, receding into the fog. Added to the SCENE,
    // not the rack group — they are the room, so they hold still while the hero rack makes
    // its arrival journey past them. Banded fronts and the occasional dim LED are what make
    // them read as live machines instead of monoliths; the fog does the rest. Without them
    // the rack stood in a void and the page read as a product shot, not a datacenter.
    {
      const hueList = Object.values(palette.hues);
      // Rows with their FRONTS turned toward the aisle, the way racks actually stand —
      // flank-on rows read as black monoliths ("barely any change" was the review). Full
      // LED strips per slot: rows of receding lights are what make a machine room read.
      const ghostBodyMat = new THREE.MeshStandardMaterial({ roughness: 0.55, metalness: 0.8, envMapIntensity: 0.35 });
      ghostBodyMat.color.set(surf.metalDeep);
      const rows = [
        { x: -6.4, rotY: 0.9, from: -7, count: 10, step: 2.4 },
        { x: 9.2, rotY: -1.0, from: -7, count: 9, step: 2.6 },
      ];
      const bandGeo = new THREE.BoxGeometry(W * 0.92, layout.slots[0].height * 0.82, 0.02);
      const dotGeo = new THREE.BoxGeometry(0.03, 0.03, 0.012);
      for (const r of rows) {
        for (let i = 0; i < r.count; i++) {
          const ghost = new THREE.Group();
          ghost.position.set(r.x - (r.x > 0 ? -i * 0.15 : i * 0.15), 0, r.from - i * r.step);
          ghost.rotation.y = r.rotY;
          const body = new THREE.Mesh(new THREE.BoxGeometry(W, H, D), ghostBodyMat);
          body.position.y = H / 2;
          ghost.add(body);
          for (const slot of layout.slots) {
            if (!slot.slug) continue;
            const band = new THREE.Mesh(bandGeo, ventMat);
            band.position.set(0, slot.y, D / 2 + 0.011);
            ghost.add(band);
            const strip = new THREE.MeshStandardMaterial({ roughness: 0.4, metalness: 0.1 });
            strip.color.set(surf.cavity);
            strip.emissive.set(hueList[Math.floor(Math.random() * hueList.length)]);
            for (let l = 0; l < 8; l++) {
              if (Math.random() < 0.25) continue;
              const dotMat = strip.clone();
              dotMat.emissiveIntensity = 1.6 + Math.random() * 1.2;
              const dot = new THREE.Mesh(dotGeo, dotMat);
              dot.position.set(-W * 0.36 + l * 0.1, slot.y + slot.height * 0.18, D / 2 + 0.03);
              ghost.add(dot);
            }
          }
          scene.add(ghost);
        }
      }
    }

    // Nodes: faceplate, vent louvres, handles, an LED strip and a status LED per pillar.
    // The empty slot at the bottom stays a dark recess — it is content, not spare geometry.
    const anchors: { slug: NonNullable<(typeof layout.slots)[number]['slug']>; x: number; y: number; z: number }[] = [];
    const ledMats: { emissiveIntensity: number }[] = [];
    const ledGeo = new THREE.BoxGeometry(0.02, 0.02, 0.01);
    const statusGeo = new THREE.BoxGeometry(0.034, 0.034, 0.01);

    for (const slot of layout.slots) {
      const y = slot.y;
      if (!slot.slug) {
        const recess = new THREE.Mesh(new THREE.BoxGeometry(W * 0.92, slot.height * 0.92, 0.02), mat(surf.cavity, 1, 0));
        recess.position.set(0, y, D / 2 - 0.06);
        rack.add(recess);
        continue;
      }
      anchors.push({ slug: slot.slug, x: 0, y, z: D / 2 });

      const plate = new THREE.Mesh(new THREE.BoxGeometry(W * 0.94, slot.height * 0.9, 0.07), plateMat);
      plate.position.set(0, y, D / 2 + 0.005);
      rack.add(plate);

      for (let v = 0; v < 6; v++) {
        const louvre = new THREE.Mesh(new THREE.BoxGeometry(W * 0.42, 0.011, 0.012), ventMat);
        louvre.position.set(W * 0.14, y - slot.height * 0.21 + v * (slot.height * 0.42 / 5), D / 2 + 0.045);
        rack.add(louvre);
      }
      for (const sx of [-1, 1]) {
        const handle = new THREE.Mesh(new THREE.BoxGeometry(0.05, slot.height * 0.6, 0.05), handleMat);
        handle.position.set(sx * W * 0.43, y, D / 2 + 0.06);
        rack.add(handle);
      }

      for (let l = 0; l < 12; l++) {
        const on = Math.random() > 0.3;
        const ledMat = new THREE.MeshStandardMaterial({ roughness: 0.4, metalness: 0.1 });
        ledMat.color.set(surf.cavity);
        ledMat.emissive.set(palette.hues[slot.slug]);
        ledMat.emissiveIntensity = on ? 2.4 + Math.random() * 1.6 : 0.15;
        const led = new THREE.Mesh(ledGeo, ledMat);
        led.position.set(-W * 0.40 + l * 0.042, y + slot.height * 0.2, D / 2 + 0.045);
        rack.add(led);
        ledMats.push(ledMat);
      }
      const statusMat = new THREE.MeshStandardMaterial({ roughness: 0.4, metalness: 0.1 });
      statusMat.color.set(surf.cavity);
      statusMat.emissive.set(palette.hues[slot.slug]);
      statusMat.emissiveIntensity = 3.2;
      const status = new THREE.Mesh(statusGeo, statusMat);
      status.position.set(W * 0.40, y - slot.height * 0.22, D / 2 + 0.045);
      rack.add(status);
    }
    rack.traverse((o) => { if ((o as { isMesh?: boolean }).isMesh) { (o as { castShadow: boolean }).castShadow = true; } });

    // Lights. Constructed colourless (default white) and coloured via tokens — a literal
    // passed to a constructor is exactly the scene colour literal check 6 rejects.
    // Spot, not directional: the hero rack sits in its own pool of light and the room
    // stays lit by its LEDs and ceiling strips — a broad key washed the floor office-grey.
    const key = new THREE.SpotLight(undefined, 260, 0, 0.42, 0.65, 1.9);
    key.color.set(surf.key);
    key.position.set(5, 8, 5);
    key.target.position.set(0, 1.4, 0);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.bias = -0.0004;
    scene.add(key.target);
    const form = new THREE.DirectionalLight();
    form.color.set(surf.key);
    form.intensity = 0.15;
    form.position.set(4, 7, 3);
    scene.add(form);
    const rim = new THREE.DirectionalLight();
    rim.color.set(surf.rim);
    rim.intensity = 2.6;
    rim.position.set(-5, 4, -4);
    const front = new THREE.DirectionalLight();
    front.color.set(surf.fill);
    front.intensity = 0.32;
    front.position.set(2, 2, 8);
    const aisle = new THREE.PointLight();
    aisle.color.set(palette.accent);
    aisle.intensity = 0.9;
    aisle.distance = 8;
    aisle.decay = 1.8;
    aisle.position.set(-1.4, 1.6, 2.2);
    const ambient = new THREE.AmbientLight();
    ambient.color.set(surf.fill);
    ambient.intensity = 0.07;
    scene.add(key, rim, front, aisle, ambient);

    // Halo: a soft accent-tinted radial glow behind the rack, silhouetting it out of the fog.
    // Written as raw ImageData bytes, not a canvas gradient: gradient stops take CSS colour
    // strings, and any such string — even one interpolated from a token — is
    // indistinguishable from a literal to check 1 of the design guard. Bytes carry no text.
    const accentRgb = new THREE.Color(palette.accent);
    const haloCanvas = document.createElement('canvas');
    haloCanvas.width = haloCanvas.height = 256;
    const g = haloCanvas.getContext('2d')!;
    const img = g.createImageData(256, 256);
    for (let py = 0; py < 256; py++) {
      for (let px = 0; px < 256; px++) {
        const d = Math.min(1, Math.hypot(px - 128, py - 128) / 128);
        const i = (py * 256 + px) * 4;
        img.data[i] = Math.round(accentRgb.r * 255);
        img.data[i + 1] = Math.round(accentRgb.g * 255);
        img.data[i + 2] = Math.round(accentRgb.b * 255);
        img.data[i + 3] = Math.round(255 * 0.30 * (1 - d));
      }
    }
    g.putImageData(img, 0, 0);
    const haloMat = new THREE.SpriteMaterial({
      map: new THREE.CanvasTexture(haloCanvas), transparent: true, depthWrite: false,
      blending: THREE.AdditiveBlending, opacity: 0.36,
    });
    const halo = new THREE.Sprite(haloMat);
    halo.position.set(0, 1.7, -3.8);
    halo.scale.set(10, 7, 1);
    // Parented to the rack, not the scene: the halo silhouettes the rack, so it must make
    // the hero→pinned journey with it. Sprites always face the camera, so the parent's
    // rotation only swings its position, which is the right behaviour.
    rack.add(halo);

    // Bloom is what turns the emissive LEDs into lights; OutputPass restores tone
    // mapping/colour space, which RenderPass skips when drawing into the composer target.
    // The multisampled target matters: post-processing bypasses the canvas's own MSAA (the
    // scene renders offscreen), so without samples here every rail and louvre goes jagged —
    // "pixly" was the exact user report that added this.
    const composer = new EffectComposer(
      renderer,
      new THREE.WebGLRenderTarget(1, 1, { samples: 4, type: THREE.HalfFloatType }),
    );
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(new UnrealBloomPass(new THREE.Vector2(1, 1), 0.55, 0.4, 0.62));
    // Corner-darkening vignette, biased upward so the foreground floor falls off too. A
    // near-black albedo still renders as ~20% grey after sRGB conversion, so the dark frame
    // has to be imposed here; three's stock VignetteShader mixes toward WHITE at these
    // parameter ranges — wrong tool. Pure luminance scaling, no colour values involved.
    composer.addPass(new ShaderPass({
      uniforms: { tDiffuse: { value: null }, floorLevel: { value: 0.22 } },
      vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: [
        'uniform sampler2D tDiffuse;',
        'uniform float floorLevel;',
        'varying vec2 vUv;',
        'void main() {',
        '  vec4 c = texture2D(tDiffuse, vUv);',
        '  float d = length((vUv - vec2(0.5, 0.62)) * vec2(1.3, 1.15));',
        '  float v = mix(1.0, floorLevel, smoothstep(0.36, 0.9, d));',
        '  gl_FragColor = vec4(c.rgb * v, c.a);',
        '}',
      ].join('\n'),
    }));
    composer.addPass(new OutputPass());

    // THREE.PerspectiveCamera has no project(x, y, z) — wrap it in the structural shape
    // journey.project.ts expects, so that module never has to know about Three.js.
    const ndc = new THREE.Vector3();
    const projecting = {
      project: (x: number, y: number, z: number) => {
        ndc.set(x, y, z).project(camera);
        return { x: ndc.x, y: ndc.y };
      },
    };

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = canvasEl;
      renderer.setSize(w, h, false);
      composer.setSize(w, h);
      camera.aspect = w / Math.max(h, 1);
      camera.updateProjectionMatrix();
      camera.updateMatrixWorld();
      // Anchors are canvas-relative pixels (w, h here), but node-leads draws them straight into
      // a viewport-fixed SVG as viewport-relative. That equivalence holds only because this
      // canvas is itself fixed inset-0 for the full viewport (journey-bg) — a non-full-bleed
      // canvas would offset every lead line with no visible error at either end.
      this.store.setAnchors(
        anchors.map(({ slug, x, y, z }) => ({ slug, ...projectToScreen(x, y, z, projecting, w, h) })),
      );
    };

    // The rack's hero pose, in world units along the camera's screen-right (≈ +0.88x,
    // −0.45z at this camera): beside the headline at scroll zero, easing to the origin —
    // the pinned pose the lead-line anchors are projected from — exactly as the section
    // pins. The camera itself still never moves, so the anchor projection stays a
    // resize-time calculation; only the rack travels, and it is guaranteed home (offset 0)
    // before the first line can render, because the lines are gated to the pinned window
    // and arrival is 1 there by construction.
    const HERO_SHIFT_X = 2.4;
    const HERO_SHIFT_Z = -1.2;
    const HERO_TURN = -0.14;

    // The room breathes; the geometry holds its pose. LED flicker and halo breathing are
    // motion the lead lines cannot desync from. Exposure follows JourneyStore.visibility —
    // full from scroll zero on wide viewports (the rack is the hero visual), approach-faded
    // on narrow ones — and while fully dark the frame is skipped so the GPU idles.
    const baseExposure = 1.1;
    let raf = 0;
    let cleared = true;
    let t = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const v = this.store.visibility();
      if (v <= 0.01) {
        if (!cleared) {
          renderer.clear(true, true, true);
          cleared = true;
        }
        return;
      }
      cleared = false;
      t += 1 / 60;
      const a = this.store.arrival();
      const away = 1 - a * a * (3 - 2 * a); // smoothstep eased; 1 at the hero, 0 pinned
      rack.position.x = HERO_SHIFT_X * away;
      rack.position.z = HERO_SHIFT_Z * away;
      rack.rotation.y = HERO_TURN * away;
      renderer.toneMappingExposure = baseExposure * v;
      haloMat.opacity = 0.30 + 0.08 * Math.sin(t * 0.4);
      for (const m of ledMats) {
        if (Math.random() < 0.015) {
          m.emissiveIntensity = Math.random() > 0.3 ? 2.4 + Math.random() * 1.6 : 0.15;
        }
      }
      composer.render();
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvasEl);
    resize();
    tick();
    this.store.enable();

    this.teardown = () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      scene.traverse((o) => {
        const m = o as { geometry?: { dispose(): void }; material?: { dispose(): void } };
        m.geometry?.dispose();
        m.material?.dispose();
      });
      pmrem.dispose();
      composer.dispose();
      renderer.dispose();
      this.store.disable();
    };
  }
}

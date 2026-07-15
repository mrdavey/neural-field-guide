"use client";

import { useEffect, useRef, useState } from "react";
import {
  cappedThreePixelRatio,
  seededUnit,
  storySeed,
  threeConceptProfiles,
  threeStoryFrame,
  type ThreeStoryConcept,
} from "./three-story-math";

export const STORY_PROGRESS_EVENT = "neural-field-guide:story-progress";

type StoryProgressDetail = {
  progress: number;
  stagePosition: number;
  active: number;
  stageCount: number;
  direction: "forward" | "backward";
};

type ThreeStoryCanvasProps = {
  concept: ThreeStoryConcept;
  storyKey: string;
  stageCount: number;
};

type Point = [number, number, number];

function conceptPoint(concept: ThreeStoryConcept, index: number, count: number, seed: number): { base: Point; target: Point } {
  const t = index / Math.max(1, count - 1);
  const angle = t * Math.PI * 2;
  const jitterX = (seededUnit(seed, index, 1) - .5) * .42;
  const jitterY = (seededUnit(seed, index, 2) - .5) * .42;
  const jitterZ = (seededUnit(seed, index, 3) - .5) * .55;

  switch (concept) {
    case "pipeline": {
      const helix = t * Math.PI * 5;
      return {
        base: [Math.cos(helix) * (1.2 + t), (t - .5) * 5.6, Math.sin(helix) * 1.3],
        target: [(t - .5) * 7.2, Math.sin(t * Math.PI * 4) * .62, Math.cos(t * Math.PI * 3) * .72],
      };
    }
    case "coordinates": {
      const column = index % 10;
      const row = Math.floor(index / 10);
      const phi = Math.acos(1 - 2 * (index + .5) / count);
      const theta = Math.PI * (1 + Math.sqrt(5)) * index;
      return {
        base: [(column - 4.5) * .62, (row - 4) * .58, jitterZ],
        target: [Math.sin(phi) * Math.cos(theta) * 2.45, Math.cos(phi) * 2.45, Math.sin(phi) * Math.sin(theta) * 2.45],
      };
    }
    case "distribution": {
      const bucket = index % 8;
      const within = Math.floor(index / 8);
      const probability = Math.exp(-Math.pow(bucket - 2.6, 2) / 4.8);
      return {
        base: [(bucket - 3.5) * .78, (within - 5.5) * .28, jitterZ],
        target: [(bucket - 3.5) * .78, -2.25 + probability * (within + 1) * .38, jitterZ * .38],
      };
    }
    case "optimization": {
      const column = index % 12;
      const row = Math.floor(index / 12);
      const x = (column - 5.5) * .58;
      const z = (row - 4) * .58;
      const descent = 1 - t;
      return {
        base: [x, .12 * x * x + .08 * z * z - 1.45 + jitterY, z],
        target: [(descent - .5) * 5.4, 1.75 - t * 3.2 + Math.sin(t * Math.PI * 7) * .18, Math.sin(t * Math.PI * 2) * .7],
      };
    }
    case "segmentation": {
      const token = index % 8;
      const row = Math.floor(index / 8);
      const gap = Math.floor(token / 2) * .22;
      return {
        base: [(index - count / 2) * .075, jitterY, jitterZ * .25],
        target: [(token - 3.5) * .8 + gap, (row - 5) * .32, (token % 2 ? .22 : -.22) + jitterZ * .2],
      };
    }
    case "embedding": {
      const layer = index % 4;
      const within = Math.floor(index / 4);
      const ring = within / Math.max(1, Math.floor(count / 4));
      const ringAngle = ring * Math.PI * 2;
      return {
        base: [(layer - 1.5) * 1.3, (within - 13.5) * .17, jitterZ * .22],
        target: [Math.cos(ringAngle * 3) * (1.15 + layer * .38), Math.sin(ringAngle * 3) * (1.15 + layer * .38), (layer - 1.5) * 1.15],
      };
    }
    case "position": {
      const positionAngle = t * Math.PI * 5.5;
      return {
        base: [(t - .5) * 6.4, jitterY * .2, jitterZ * .2],
        target: [(t - .5) * 6.4, Math.sin(positionAngle) * 1.25, Math.cos(positionAngle) * 1.25],
      };
    }
    case "attention": {
      const head = index % 4;
      const token = Math.floor(index / 4);
      const tokenT = token / Math.max(1, Math.floor(count / 4) - 1);
      const focus = Math.exp(-Math.pow(tokenT - .63, 2) / .032);
      return {
        base: [(tokenT - .5) * 6.4, (head - 1.5) * .72 + jitterY, jitterZ],
        target: [(tokenT - .5) * 6.4, (head - 1.5) * .38, (focus * 2.2 - 1.1) + head * .12],
      };
    }
    case "layers": {
      const layer = index % 6;
      const within = Math.floor(index / 6);
      const layerAngle = within / Math.max(1, Math.floor(count / 6)) * Math.PI * 2;
      return {
        base: [(layer - 2.5) * 1.05, Math.cos(layerAngle) * 2.1, Math.sin(layerAngle) * 1.35],
        target: [(layer - 2.5) * .72, Math.cos(layerAngle + layer * .42) * (1 + layer * .18), Math.sin(layerAngle + layer * .42) * (1 + layer * .18)],
      };
    }
    case "training": {
      const column = index % 12;
      const row = Math.floor(index / 12);
      const x = (column - 5.5) * .58;
      const z = (row - 4.5) * .58;
      return {
        base: [x, Math.sin(x * 1.3 + z) * .85 + jitterY, z],
        target: [x * .9, -.08 * x * x + 1.2 + Math.cos(z * 1.4) * .32, z * .74],
      };
    }
    case "data": {
      const source = index % 5;
      const within = Math.floor(index / 5);
      const sourceAngle = source / 5 * Math.PI * 2;
      const clean = index % 7 !== 0;
      return {
        base: [Math.cos(sourceAngle) * (2.2 + within * .035), Math.sin(sourceAngle) * (2.2 + within * .035), jitterZ],
        target: [clean ? (t - .5) * 6.2 : 4.8 + jitterX, clean ? Math.sin(t * Math.PI * 5) * .45 : 3 + jitterY, clean ? jitterZ * .25 : jitterZ],
      };
    }
    case "systems": {
      const device = index % 8;
      const within = Math.floor(index / 8);
      const deviceAngle = device / 8 * Math.PI * 2;
      return {
        base: [Math.cos(deviceAngle) * 2.65, Math.sin(deviceAngle) * 2.1, (within - 6) * .22],
        target: [Math.cos(deviceAngle + t * Math.PI) * (1.35 + within * .08), (within - 6) * .28, Math.sin(deviceAngle + t * Math.PI) * (1.35 + within * .08)],
      };
    }
    case "preference": {
      const branch = index % 3 - 1;
      const branchT = Math.floor(index / 3) / Math.max(1, Math.floor(count / 3));
      return {
        base: [(branchT - .5) * 6.2, branch * (1.55 - branchT * .7) + jitterY, branch * .48 + jitterZ],
        target: [(branchT - .5) * 6.2, branch * .32 * (1 - branchT), branch * .18 + Math.sin(branchT * Math.PI) * .42],
      };
    }
    case "decoding": {
      const branch = index % 7 - 3;
      const step = Math.floor(index / 7);
      const stepT = step / Math.max(1, Math.floor(count / 7));
      return {
        base: [(stepT - .5) * 6.1, branch * (.18 + stepT * .22), jitterZ],
        target: [(stepT - .5) * 6.1, branch === (step % 3) - 1 ? Math.sin(stepT * Math.PI * 5) * .32 : branch * .52, branch === (step % 3) - 1 ? 0 : 1.4 + Math.abs(branch) * .16],
      };
    }
    case "memory": {
      const column = index % 12;
      const row = Math.floor(index / 12);
      const cacheAngle = t * Math.PI * 4.5;
      return {
        base: [(column - 5.5) * .58, (row - 4) * .55, jitterZ],
        target: [Math.cos(cacheAngle) * (1.1 + t * 1.7), (t - .5) * 4.6, Math.sin(cacheAngle) * (1.1 + t * 1.7)],
      };
    }
    case "retrieval": {
      const cluster = index % 4;
      const clusterAngle = cluster / 4 * Math.PI * 2;
      const relevant = cluster === 1;
      return {
        base: [Math.cos(clusterAngle) * 2.5 + jitterX, Math.sin(clusterAngle) * 2 + jitterY, jitterZ],
        target: [relevant ? jitterX * .9 : Math.cos(clusterAngle) * 3.5, relevant ? jitterY * .9 : Math.sin(clusterAngle) * 2.8, relevant ? jitterZ * .45 : jitterZ],
      };
    }
    case "agent": {
      const orbit = 1.2 + (index % 4) * .55;
      const inclination = (index % 3 - 1) * .38;
      return {
        base: [Math.cos(angle * 2.5) * orbit, Math.sin(angle * 2.5) * orbit * .62, inclination * 2.3 + jitterZ],
        target: [Math.cos(angle * 4) * orbit, inclination * 2 + jitterY, Math.sin(angle * 4) * orbit],
      };
    }
    case "evaluation": {
      const metric = index % 6;
      const sample = Math.floor(index / 6);
      const residual = seededUnit(seed, index, 7) - .5;
      return {
        base: [(sample - 7) * .42, (metric - 2.5) * .62, jitterZ * .18],
        target: [(sample - 7) * .42, residual * (1.2 + metric * .18), (metric - 2.5) * .42],
      };
    }
    case "security": {
      const radius = index % 5 === 0 ? 3.3 : 2.05;
      const phi = Math.acos(1 - 2 * (index + .5) / count);
      const theta = Math.PI * (1 + Math.sqrt(5)) * index;
      return {
        base: [Math.sin(phi) * Math.cos(theta) * radius, Math.cos(phi) * radius, Math.sin(phi) * Math.sin(theta) * radius],
        target: [Math.sin(phi) * Math.cos(theta) * (radius > 3 ? 4.6 : 1.65), Math.cos(phi) * (radius > 3 ? 4.6 : 1.65), Math.sin(phi) * Math.sin(theta) * (radius > 3 ? 4.6 : 1.65)],
      };
    }
    case "compression": {
      const column = index % 12;
      const row = Math.floor(index / 12);
      return {
        base: [(column - 5.5) * .55, (row - 4.5) * .55, jitterZ],
        target: [((index % 6) - 2.5) * .72, (Math.floor(index / 6) % 6 - 2.5) * .72, Math.round(jitterZ * 2) * .32],
      };
    }
    case "adapter": {
      const column = index % 6;
      const row = Math.floor(index / 6);
      const sidePath = index % 7 === 0;
      return {
        base: [(column - 2.5) * 1.05, (row - 8) * .3, jitterZ * .3],
        target: [sidePath ? 3.8 + jitterX : (column - 2.5) * .72, sidePath ? (t - .5) * 5.2 : (row - 8) * .24, sidePath ? Math.sin(t * Math.PI * 4) : jitterZ * .18],
      };
    }
    case "routing": {
      const expert = index % 6;
      const within = Math.floor(index / 6);
      const expertAngle = expert / 6 * Math.PI * 2;
      const selected = expert === 1 || expert === 4;
      return {
        base: [Math.cos(expertAngle) * 2.65 + jitterX, Math.sin(expertAngle) * 2.1 + jitterY, (within - 8) * .12],
        target: [selected ? Math.cos(expertAngle) * 1.3 : Math.cos(expertAngle) * 3.8, selected ? Math.sin(expertAngle) * 1.05 : Math.sin(expertAngle) * 3.1, selected ? jitterZ * .22 : jitterZ],
      };
    }
    case "multimodal": {
      const modality = index % 2 ? 1 : -1;
      const streamT = Math.floor(index / 2) / Math.max(1, Math.floor(count / 2));
      return {
        base: [(streamT - .5) * 6.2, modality * 1.85 + jitterY, modality * .7 + jitterZ],
        target: [(streamT - .5) * 6.2, modality * (1 - streamT) * 1.5, modality * (1 - streamT) * .55],
      };
    }
    case "interpretability": {
      const u = angle * 2;
      const v = angle * 7 + jitterX;
      const radius = 1.85 + Math.cos(v) * .65;
      return {
        base: [radius * Math.cos(u), radius * Math.sin(u), Math.sin(v) * .82],
        target: [(t - .5) * 6.2, Math.sin(t * Math.PI * 6) * 1.35, Math.cos(t * Math.PI * 4) * 1.25],
      };
    }
  }
}

export function ThreeStoryCanvas({ concept, storyKey, stageCount }: ThreeStoryCanvasProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [eligible, setEligible] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let timer = 0;
    const onMotionChange = () => {
      if (motionPreference.matches) {
        host.dataset.state = "reduced-motion";
        setEligible(false);
      } else {
        host.dataset.state = "idle";
        setEligible(true);
      }
    };
    motionPreference.addEventListener("change", onMotionChange);
    if (motionPreference.matches) {
      host.dataset.state = "reduced-motion";
      return () => motionPreference.removeEventListener("change", onMotionChange);
    }

    if (typeof IntersectionObserver === "undefined") {
      timer = window.setTimeout(() => setEligible(true), 0);
      return () => {
        window.clearTimeout(timer);
        motionPreference.removeEventListener("change", onMotionChange);
      };
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setEligible(true);
        observer.disconnect();
      }
    }, { rootMargin: "260px 0px" });
    observer.observe(host);
    return () => {
      observer.disconnect();
      motionPreference.removeEventListener("change", onMotionChange);
    };
  }, []);

  useEffect(() => {
    if (!eligible) return;
    const host = hostRef.current;
    const visual = host?.closest<HTMLElement>(".scroll-story-visual");
    if (!host || !visual) return;

    let disposed = false;
    let effectFrame = 0;
    let resizeObserver: ResizeObserver | undefined;
    let visibilityObserver: IntersectionObserver | undefined;
    let removeRuntimeListeners: (() => void) | undefined;
    host.dataset.state = "loading";

    const start = async () => {
      try {
        const THREE = await import("three");
        if (disposed) return;

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
        renderer.setClearColor(0x000000, 0);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.08;
        renderer.domElement.className = "three-story-webgl";
        renderer.domElement.setAttribute("aria-hidden", "true");
        host.appendChild(renderer.domElement);

        const sceneRoot = new THREE.Scene();
        sceneRoot.fog = new THREE.FogExp2(0x080c17, .07);
        const camera = new THREE.PerspectiveCamera(42, 1, .1, 40);
        const world = new THREE.Group();
        sceneRoot.add(world);

        const computedAccent = getComputedStyle(visual).getPropertyValue("--story-accent").trim() || "#ff6b35";
        const accent = new THREE.Color(computedAccent);
        const profile = threeConceptProfiles[concept];
        const seed = storySeed(`${concept}:${storyKey}`);
        const bases = new Float32Array(profile.pointCount * 3);
        const targets = new Float32Array(profile.pointCount * 3);
        for (let index = 0; index < profile.pointCount; index += 1) {
          const point = conceptPoint(concept, index, profile.pointCount, seed);
          bases.set(point.base, index * 3);
          targets.set(point.target, index * 3);
        }

        const sharedVertex = `
          attribute vec3 aTarget;
          attribute float aIndex;
          uniform float uProgress;
          uniform float uPulse;
          uniform vec2 uPointer;
          varying float vEnergy;
          void main() {
            float eased = uProgress * uProgress * (3.0 - 2.0 * uProgress);
            vec3 transformed = mix(position, aTarget, eased);
            float rhythm = sin((aIndex * 0.17) + uProgress * 18.8496) * 0.065;
            transformed += normalize(transformed + vec3(0.0001)) * (rhythm + uPulse * 0.22);
            transformed.xy += uPointer * (0.08 + abs(transformed.z) * 0.018);
            vec4 modelPosition = modelViewMatrix * vec4(transformed, 1.0);
            gl_Position = projectionMatrix * modelPosition;
            gl_PointSize = (3.0 + 2.8 * (0.5 + rhythm) + uPulse * 3.0) * (7.0 / max(1.0, -modelPosition.z));
            vEnergy = 0.48 + 0.52 * sin(eased * 3.14159 + aIndex * 0.11);
          }
        `;
        const pointsGeometry = new THREE.BufferGeometry();
        pointsGeometry.setAttribute("position", new THREE.BufferAttribute(bases, 3));
        pointsGeometry.setAttribute("aTarget", new THREE.BufferAttribute(targets, 3));
        pointsGeometry.setAttribute("aIndex", new THREE.BufferAttribute(Float32Array.from({ length: profile.pointCount }, (_, index) => index), 1));
        const uniforms = {
          uProgress: { value: 0 },
          uPulse: { value: 0 },
          uPointer: { value: new THREE.Vector2() },
          uAccent: { value: accent },
        };
        const pointsMaterial = new THREE.ShaderMaterial({
          uniforms,
          vertexShader: sharedVertex,
          fragmentShader: `
            uniform vec3 uAccent;
            varying float vEnergy;
            void main() {
              vec2 center = gl_PointCoord - vec2(0.5);
              float distanceToCenter = length(center);
              float alpha = smoothstep(0.5, 0.08, distanceToCenter) * (0.55 + vEnergy * 0.45);
              gl_FragColor = vec4(mix(uAccent, vec3(1.0), vEnergy * 0.42), alpha);
            }
          `,
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        });
        const pointField = new THREE.Points(pointsGeometry, pointsMaterial);
        world.add(pointField);

        const segmentCount = profile.pointCount - 1;
        const lineBases = new Float32Array(segmentCount * 6);
        const lineTargets = new Float32Array(segmentCount * 6);
        for (let index = 0; index < segmentCount; index += 1) {
          lineBases.set(bases.subarray(index * 3, index * 3 + 3), index * 6);
          lineBases.set(bases.subarray((index + 1) * 3, (index + 1) * 3 + 3), index * 6 + 3);
          lineTargets.set(targets.subarray(index * 3, index * 3 + 3), index * 6);
          lineTargets.set(targets.subarray((index + 1) * 3, (index + 1) * 3 + 3), index * 6 + 3);
        }
        const lineGeometry = new THREE.BufferGeometry();
        lineGeometry.setAttribute("position", new THREE.BufferAttribute(lineBases, 3));
        lineGeometry.setAttribute("aTarget", new THREE.BufferAttribute(lineTargets, 3));
        lineGeometry.setAttribute("aIndex", new THREE.BufferAttribute(Float32Array.from({ length: segmentCount * 2 }, (_, index) => index / 2), 1));
        const lineMaterial = new THREE.ShaderMaterial({
          uniforms,
          vertexShader: sharedVertex,
          fragmentShader: `uniform vec3 uAccent; varying float vEnergy; void main(){ gl_FragColor = vec4(uAccent, 0.055 + vEnergy * 0.1); }`,
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        });
        const trails = new THREE.LineSegments(lineGeometry, lineMaterial);
        world.add(trails);

        const nodeGeometry = new THREE.IcosahedronGeometry(.105, 1);
        const nodeMaterial = new THREE.MeshStandardMaterial({ color: accent.clone().lerp(new THREE.Color(0xffffff), .25), emissive: accent, emissiveIntensity: .85, metalness: .12, roughness: .34 });
        const nodeCount = Math.floor(profile.pointCount / profile.nodeStride);
        const nodes = new THREE.InstancedMesh(nodeGeometry, nodeMaterial, nodeCount);
        nodes.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        world.add(nodes);

        const coreGeometry = new THREE.IcosahedronGeometry(.48, 2);
        const coreMaterial = new THREE.MeshPhysicalMaterial({ color: accent, emissive: accent, emissiveIntensity: .38, metalness: .18, roughness: .22, clearcoat: .9, clearcoatRoughness: .18, transparent: true, opacity: .9 });
        const core = new THREE.Mesh(coreGeometry, coreMaterial);
        world.add(core);
        const ringMaterial = new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: .24, wireframe: true });
        const ringA = new THREE.Mesh(new THREE.TorusGeometry(1.04, .012, 6, 96), ringMaterial);
        const ringB = new THREE.Mesh(new THREE.TorusGeometry(1.38, .009, 6, 96), ringMaterial.clone());
        ringA.rotation.x = Math.PI * .5;
        ringB.rotation.y = Math.PI * .5;
        world.add(ringA, ringB);
        sceneRoot.add(new THREE.HemisphereLight(0xb8d7ff, 0x101426, 1.2));
        const keyLight = new THREE.PointLight(accent, 18, 18, 2);
        keyLight.position.set(2.6, 2.4, 4.8);
        sceneRoot.add(keyLight);

        const pointer = { x: 0, y: 0 };
        let current: StoryProgressDetail = { progress: 0, stagePosition: 0, active: 0, stageCount, direction: "forward" };
        let pulse = 0;
        let visible = true;
        let pageVisible = document.visibilityState !== "hidden";
        const matrix = new THREE.Matrix4();
        const position = new THREE.Vector3();
        const scale = new THREE.Vector3();
        const quaternion = new THREE.Quaternion();

        const draw = () => {
          if (disposed || !visible || !pageVisible) return;
          const frame = threeStoryFrame(concept, current.progress, pointer.x, pointer.y, pulse, current.stageCount);
          uniforms.uProgress.value = frame.progress;
          uniforms.uPulse.value = pulse;
          uniforms.uPointer.value.set(pointer.x, pointer.y);
          world.rotation.set(frame.rotationX, frame.rotationY, frame.rotationZ);
          camera.position.set(frame.cameraX, frame.cameraY, frame.cameraZ);
          camera.lookAt(0, 0, 0);
          core.scale.setScalar(frame.coreScale);
          core.rotation.set(frame.stagePosition * .31, frame.stagePosition * .46, frame.stagePosition * .17);
          ringA.rotation.z = frame.stagePosition * .34;
          ringB.rotation.x = frame.stagePosition * -.23;
          keyLight.intensity = 18 * frame.lightEnergy;

          const eased = frame.progress * frame.progress * (3 - 2 * frame.progress);
          let instanceIndex = 0;
          for (let pointIndex = 0; pointIndex < profile.pointCount && instanceIndex < nodeCount; pointIndex += profile.nodeStride) {
            const offset = pointIndex * 3;
            position.set(
              THREE.MathUtils.lerp(bases[offset], targets[offset], eased),
              THREE.MathUtils.lerp(bases[offset + 1], targets[offset + 1], eased),
              THREE.MathUtils.lerp(bases[offset + 2], targets[offset + 2], eased),
            );
            const nodeScale = .74 + Math.sin(frame.stagePosition * Math.PI + instanceIndex) * .14 + pulse * .18;
            scale.setScalar(nodeScale);
            matrix.compose(position, quaternion, scale);
            nodes.setMatrixAt(instanceIndex, matrix);
            instanceIndex += 1;
          }
          nodes.instanceMatrix.needsUpdate = true;
          renderer.render(sceneRoot, camera);
        };

        const resize = () => {
          const bounds = host.getBoundingClientRect();
          if (bounds.width < 2 || bounds.height < 2) return;
          renderer.setPixelRatio(cappedThreePixelRatio(window.devicePixelRatio, window.innerWidth));
          renderer.setSize(bounds.width, bounds.height, false);
          camera.aspect = bounds.width / bounds.height;
          camera.updateProjectionMatrix();
          draw();
        };
        const onProgress = (event: Event) => {
          current = (event as CustomEvent<StoryProgressDetail>).detail;
          draw();
        };
        const onPointerMove = (event: PointerEvent) => {
          if (event.pointerType === "touch") return;
          const bounds = host.getBoundingClientRect();
          pointer.x = ((event.clientX - bounds.left) / Math.max(1, bounds.width) - .5) * 2;
          pointer.y = -((event.clientY - bounds.top) / Math.max(1, bounds.height) - .5) * 2;
          draw();
        };
        const onPointerLeave = () => {
          pointer.x = 0;
          pointer.y = 0;
          draw();
        };
        const onPointerDown = () => {
          if (effectFrame) cancelAnimationFrame(effectFrame);
          const started = performance.now();
          const animatePulse = (time: number) => {
            const elapsed = (time - started) / 620;
            pulse = Math.max(0, 1 - elapsed) ** 2;
            draw();
            if (elapsed < 1 && !disposed) effectFrame = requestAnimationFrame(animatePulse);
            else effectFrame = 0;
          };
          effectFrame = requestAnimationFrame(animatePulse);
        };
        const onVisibilityChange = () => {
          pageVisible = document.visibilityState !== "hidden";
          if (pageVisible) draw();
        };
        const onContextLost = (event: Event) => {
          event.preventDefault();
          host.dataset.state = "fallback";
        };
        const onContextRestored = () => {
          host.dataset.state = "ready";
          resize();
        };

        visual.addEventListener(STORY_PROGRESS_EVENT, onProgress);
        host.addEventListener("pointermove", onPointerMove);
        host.addEventListener("pointerleave", onPointerLeave);
        host.addEventListener("pointerdown", onPointerDown);
        renderer.domElement.addEventListener("webglcontextlost", onContextLost);
        renderer.domElement.addEventListener("webglcontextrestored", onContextRestored);
        document.addEventListener("visibilitychange", onVisibilityChange);
        resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(host);
        visibilityObserver = new IntersectionObserver(([entry]) => {
          visible = entry?.isIntersecting ?? true;
          if (visible) draw();
        }, { threshold: 0 });
        visibilityObserver.observe(host);

        const initialProgress = Number.parseFloat(getComputedStyle(visual).getPropertyValue("--story-progress"));
        if (Number.isFinite(initialProgress)) current.progress = initialProgress;
        host.dataset.state = "ready";
        resize();

        removeRuntimeListeners = () => {
          visual.removeEventListener(STORY_PROGRESS_EVENT, onProgress);
          host.removeEventListener("pointermove", onPointerMove);
          host.removeEventListener("pointerleave", onPointerLeave);
          host.removeEventListener("pointerdown", onPointerDown);
          renderer.domElement.removeEventListener("webglcontextlost", onContextLost);
          renderer.domElement.removeEventListener("webglcontextrestored", onContextRestored);
          document.removeEventListener("visibilitychange", onVisibilityChange);
          resizeObserver?.disconnect();
          visibilityObserver?.disconnect();
          pointsGeometry.dispose();
          pointsMaterial.dispose();
          lineGeometry.dispose();
          lineMaterial.dispose();
          nodeGeometry.dispose();
          nodeMaterial.dispose();
          coreGeometry.dispose();
          coreMaterial.dispose();
          ringA.geometry.dispose();
          ringB.geometry.dispose();
          ringMaterial.dispose();
          ringB.material.dispose();
          renderer.dispose();
          renderer.domElement.remove();
        };
      } catch {
        if (!disposed) host.dataset.state = "fallback";
      }
    };

    void start();
    return () => {
      disposed = true;
      if (effectFrame) cancelAnimationFrame(effectFrame);
      removeRuntimeListeners?.();
      host.dataset.state = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "reduced-motion" : "idle";
    };
  }, [concept, eligible, stageCount, storyKey]);

  return <div className="three-story-canvas" data-concept={concept} data-state="idle" ref={hostRef} aria-hidden="true">
    <span>SCROLL TO CHANGE THE MECHANISM · TAP TO PULSE</span>
  </div>;
}

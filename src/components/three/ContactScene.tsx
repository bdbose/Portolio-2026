"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useReducedMotion } from "framer-motion";
import SceneCanvas from "./SceneCanvas";
import { ACCENT, BG, mulberry32, useGlowTexture, usePointerRef } from "./shared";

/**
 * A sparse drifting constellation — the quiet closing echo of the hero
 * globe. Points float gently on per-point sine phases; the faint links
 * between neighbours follow them.
 */
function Constellation() {
  const reduced = useReducedMotion();
  const glow = useGlowTexture();
  const pointer = usePointerRef();
  const viewportWidth = useThree((s) => s.viewport.width);

  const compact = viewportWidth < 5.5;
  const count = compact ? 80 : 130;
  // Quantize (0.5 steps) so resize drags don't rebuild geometry every frame.
  const spreadX = Math.max(2.4, Math.round(viewportWidth * 0.62 * 2) / 2);

  const { base, colors, links, phases, speeds, amps } = useMemo(() => {
    const rand = mulberry32(99);
    const base = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const phases = new Float32Array(count);
    const speeds = new Float32Array(count);
    const amps = new Float32Array(count);
    const col = new THREE.Color();
    const accent = new THREE.Color(ACCENT);
    const dim = new THREE.Color("#cfcfcf");
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < count; i++) {
      const v = new THREE.Vector3(
        (rand() * 2 - 1) * spreadX,
        (rand() * 2 - 1) * 1.7,
        (rand() * 2 - 1) * 1.3
      );
      pts.push(v);
      base.set([v.x, v.y, v.z], i * 3);
      const isAccent = rand() < 0.15;
      col
        .copy(isAccent ? accent : dim)
        .multiplyScalar(isAccent ? 0.5 + rand() * 0.5 : 0.18 + rand() * 0.35);
      colors.set([col.r, col.g, col.b], i * 3);
      phases[i] = rand() * Math.PI * 2;
      speeds[i] = 0.25 + rand() * 0.45;
      amps[i] = 0.06 + rand() * 0.1;
    }
    const links: Array<[number, number]> = [];
    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        if (pts[i].distanceTo(pts[j]) < 1.25 && rand() < 0.5) links.push([i, j]);
      }
    }
    return { base, colors, links, phases, speeds, amps };
  }, [count, spreadX]);

  const positions = useMemo(() => base.slice(), [base]);
  const linePositions = useMemo(() => new Float32Array(links.length * 6), [links]);
  const posAttr = useRef<THREE.BufferAttribute>(null);
  const lineAttr = useRef<THREE.BufferAttribute>(null);
  const group = useRef<THREE.Group>(null);

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const t = state.clock.elapsedTime;

    if (!reduced) {
      for (let i = 0; i < count; i++) {
        positions[i * 3] =
          base[i * 3] + Math.cos(t * speeds[i] * 0.6 + phases[i]) * amps[i] * 0.6;
        positions[i * 3 + 1] =
          base[i * 3 + 1] + Math.sin(t * speeds[i] + phases[i]) * amps[i];
      }
      if (posAttr.current) posAttr.current.needsUpdate = true;
    }

    for (let l = 0; l < links.length; l++) {
      const [a, b] = links[l];
      linePositions[l * 6] = positions[a * 3];
      linePositions[l * 6 + 1] = positions[a * 3 + 1];
      linePositions[l * 6 + 2] = positions[a * 3 + 2];
      linePositions[l * 6 + 3] = positions[b * 3];
      linePositions[l * 6 + 4] = positions[b * 3 + 1];
      linePositions[l * 6 + 5] = positions[b * 3 + 2];
    }
    if (lineAttr.current) lineAttr.current.needsUpdate = true;

    if (group.current) {
      const ty = reduced ? 0 : pointer.current.x * 0.06;
      const tx = reduced ? 0 : -pointer.current.y * 0.04;
      group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, ty, 2, dt);
      group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, tx, 2, dt);
    }
  });

  return (
    <>
      <fog attach="fog" args={[BG, 5.8, 9.8]} />
      <group ref={group}>
        <points frustumCulled={false}>
          <bufferGeometry key={`p${count}-${spreadX}`}>
            <bufferAttribute
              ref={posAttr}
              attach="attributes-position"
              args={[positions, 3]}
              usage={THREE.DynamicDrawUsage}
            />
            <bufferAttribute attach="attributes-color" args={[colors, 3]} />
          </bufferGeometry>
          <pointsMaterial
            map={glow}
            vertexColors
            transparent
            opacity={0.85}
            size={0.07}
            sizeAttenuation
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>
        <lineSegments frustumCulled={false}>
          <bufferGeometry key={`l${count}-${spreadX}`}>
            <bufferAttribute
              ref={lineAttr}
              attach="attributes-position"
              args={[linePositions, 3]}
              usage={THREE.DynamicDrawUsage}
            />
          </bufferGeometry>
          <lineBasicMaterial
            color="#ffffff"
            transparent
            opacity={0.05}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </lineSegments>
      </group>
    </>
  );
}

export default function ContactScene() {
  return (
    <SceneCanvas
      className="pointer-events-none absolute inset-0"
      camera={{ position: [0, 0, 7], fov: 40 }}
    >
      <Constellation />
    </SceneCanvas>
  );
}

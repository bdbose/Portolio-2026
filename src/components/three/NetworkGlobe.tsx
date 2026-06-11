"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useReducedMotion, type MotionValue } from "framer-motion";
import {
  ACCENT,
  BG,
  fibonacciSphere,
  mulberry32,
  useGlowTexture,
  usePointerRef,
} from "./shared";

const RADIUS = 2.1;
const RING_RADIUS = 2.78;
const ARC_SEGMENTS = 8;
const PACKET_TRAIL = 6;
const PACKET_SPACING = 0.035;
const BEAD_COUNT = 3;

// Scroll choreography (fractions of the pinned hero's scroll progress):
// the globe travels to centre stage, then disperses into particles.
const TRAVEL_START = 0.26;
const TRAVEL_LENGTH = 0.26;
const SCATTER_START = 0.56;
const SCATTER_LENGTH = 0.16;

type Packet = { arc: number; t: number; speed: number };

const smooth01 = (v: number) => {
  const t = THREE.MathUtils.clamp(v, 0, 1);
  return t * t * (3 - 2 * t);
};

/**
 * Builds the static geometry: nodes on a fibonacci sphere, slightly lifted
 * great-circle arcs between near neighbours, bright saffron "hub" nodes,
 * a loose dust shell, and per-node scatter directions for the dissolve.
 */
function buildGlobe(nodeCount: number, hubCount: number, dustCount: number) {
  const rand = mulberry32(20260611);
  const nodes = fibonacciSphere(nodeCount, RADIUS);

  const nodePos = new Float32Array(nodeCount * 3);
  const nodeBase = new Float32Array(nodeCount * 3);
  const nodeDir = new Float32Array(nodeCount * 3);
  const nodeCol = new Float32Array(nodeCount * 3);
  const accent = new THREE.Color(ACCENT);
  const dim = new THREE.Color("#cfcfcf");
  const col = new THREE.Color();
  const dir = new THREE.Vector3();
  nodes.forEach((p, i) => {
    nodePos.set([p.x, p.y, p.z], i * 3);
    nodeBase.set([p.x, p.y, p.z], i * 3);
    dir
      .set(rand() * 2 - 1, rand() * 2 - 1, rand() * 2 - 1)
      .normalize()
      .add(p.clone().normalize().multiplyScalar(1.4)) // bias outward
      .normalize()
      .multiplyScalar(0.8 + rand() * 0.9);
    nodeDir.set([dir.x, dir.y, dir.z], i * 3);
    const isAccent = rand() < 0.16;
    col
      .copy(isAccent ? accent : dim)
      .multiplyScalar(isAccent ? 0.55 + rand() * 0.45 : 0.22 + rand() * 0.4);
    nodeCol.set([col.r, col.g, col.b], i * 3);
  });

  const hubPos = new Float32Array(hubCount * 3);
  const hubBase = new Float32Array(hubCount * 3);
  const hubDir = new Float32Array(hubCount * 3);
  for (let i = 0; i < hubCount; i++) {
    const ni = Math.floor(rand() * nodeCount);
    hubPos.set([nodeBase[ni * 3], nodeBase[ni * 3 + 1], nodeBase[ni * 3 + 2]], i * 3);
    hubBase.set([nodeBase[ni * 3], nodeBase[ni * 3 + 1], nodeBase[ni * 3 + 2]], i * 3);
    hubDir.set([nodeDir[ni * 3], nodeDir[ni * 3 + 1], nodeDir[ni * 3 + 2]], i * 3);
  }

  // Connect neighbours closer than ~1.3× the mean node spacing, thinned
  // randomly so the mesh looks organic rather than perfectly triangulated.
  const spacing = Math.sqrt((4 * Math.PI * RADIUS * RADIUS) / nodeCount);
  const threshold = spacing * 1.3;
  const arcs: THREE.Vector3[][] = [];
  const va = new THREE.Vector3();
  const vb = new THREE.Vector3();
  for (let i = 0; i < nodeCount; i++) {
    for (let j = i + 1; j < nodeCount; j++) {
      if (nodes[i].distanceTo(nodes[j]) > threshold || rand() > 0.55) continue;
      va.copy(nodes[i]).normalize();
      vb.copy(nodes[j]).normalize();
      const arc: THREE.Vector3[] = [];
      for (let s = 0; s <= ARC_SEGMENTS; s++) {
        const t = s / ARC_SEGMENTS;
        const lift = 1 + Math.sin(t * Math.PI) * 0.022;
        arc.push(va.clone().lerp(vb, t).normalize().multiplyScalar(RADIUS * lift));
      }
      arcs.push(arc);
    }
  }
  const arcPos = new Float32Array(arcs.length * ARC_SEGMENTS * 2 * 3);
  let o = 0;
  for (const arc of arcs) {
    for (let s = 0; s < ARC_SEGMENTS; s++) {
      arcPos.set(
        [arc[s].x, arc[s].y, arc[s].z, arc[s + 1].x, arc[s + 1].y, arc[s + 1].z],
        o
      );
      o += 6;
    }
  }

  const dustPos = new Float32Array(dustCount * 3);
  const dustCol = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount; i++) {
    dir.set(rand() * 2 - 1, rand() * 2 - 1, rand() * 2 - 1).normalize();
    dir.multiplyScalar(3.1 + rand() * 3.1);
    dustPos.set([dir.x, dir.y, dir.z], i * 3);
    const isAccent = rand() < 0.12;
    col.copy(isAccent ? accent : dim).multiplyScalar(0.1 + rand() * 0.28);
    dustCol.set([col.r, col.g, col.b], i * 3);
  }

  // Equatorial accent ring, rendered tilted via its parent group.
  const ringPos = new Float32Array(128 * 3);
  for (let i = 0; i < 128; i++) {
    const a = (i / 128) * Math.PI * 2;
    ringPos.set([Math.cos(a) * RING_RADIUS, 0, Math.sin(a) * RING_RADIUS], i * 3);
  }

  return {
    arcs,
    nodePos,
    nodeBase,
    nodeDir,
    nodeCol,
    hubPos,
    hubBase,
    hubDir,
    arcPos,
    dustPos,
    dustCol,
    ringPos,
  };
}

type NetworkGlobeProps = {
  /** Scroll progress of the pinned hero (0…1). Drives the choreography. */
  progress?: MotionValue<number>;
};

/**
 * A quiet "distributed system" globe: node mesh, saffron packets travelling
 * along the arcs, satellites on a tilted orbit ring, slow spin and pointer
 * parallax. Scroll scrubs it through three acts — beside the name, centre
 * stage, then a particle dissolve.
 */
export default function NetworkGlobe({ progress }: NetworkGlobeProps) {
  const reduced = useReducedMotion();
  const glow = useGlowTexture();
  const pointer = usePointerRef();
  const viewportWidth = useThree((s) => s.viewport.width);

  const compact = viewportWidth < 5.4;
  const nodeCount = compact ? 150 : 240;
  const packetCount = compact ? 6 : 10;

  const {
    arcs,
    nodePos,
    nodeBase,
    nodeDir,
    nodeCol,
    hubPos,
    hubBase,
    hubDir,
    arcPos,
    dustPos,
    dustCol,
    ringPos,
  } = useMemo(
    () => buildGlobe(nodeCount, compact ? 9 : 14, compact ? 110 : 170),
    [nodeCount, compact]
  );

  const packets = useMemo<Packet[]>(() => {
    const rand = mulberry32(7);
    return Array.from({ length: packetCount }, () => ({
      arc: Math.floor(rand() * arcs.length),
      t: rand() * 1.2 - 0.2,
      speed: 0.45 + rand() * 0.35,
    }));
  }, [arcs, packetCount]);

  const packetPos = useMemo(
    () => new Float32Array(packetCount * PACKET_TRAIL * 3),
    [packetCount]
  );
  const packetCol = useMemo(
    () => new Float32Array(packetCount * PACKET_TRAIL * 3),
    [packetCount]
  );
  const beadPos = useMemo(() => new Float32Array(BEAD_COUNT * 3), []);

  const rig = useRef<THREE.Group>(null);
  const content = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);
  const ringGroup = useRef<THREE.Group>(null);
  const dust = useRef<THREE.Group>(null);
  const nodePosAttr = useRef<THREE.BufferAttribute>(null);
  const hubPosAttr = useRef<THREE.BufferAttribute>(null);
  const packetPosAttr = useRef<THREE.BufferAttribute>(null);
  const packetColAttr = useRef<THREE.BufferAttribute>(null);
  const beadAttr = useRef<THREE.BufferAttribute>(null);
  const nodeMat = useRef<THREE.PointsMaterial>(null);
  const hubMat = useRef<THREE.PointsMaterial>(null);
  const lineMat = useRef<THREE.LineBasicMaterial>(null);
  const packetMat = useRef<THREE.PointsMaterial>(null);
  const ringMat = useRef<THREE.LineBasicMaterial>(null);
  const beadMat = useRef<THREE.PointsMaterial>(null);
  const dustMat = useRef<THREE.PointsMaterial>(null);
  const beadAngles = useRef(
    Array.from({ length: BEAD_COUNT }, (_, i) => (i * Math.PI * 2) / BEAD_COUNT)
  );
  const spinAngle = useRef(0);
  const ramp = useRef(0);

  // Layout: right of centre on wide screens (the globe sits behind the
  // outlined surname), centred and smaller on compact screens.
  const xSide = compact ? 0 : Math.min(1.6, viewportWidth * 0.19);
  const ySide = compact ? 0.35 : 0.05;
  const baseScale = compact
    ? THREE.MathUtils.clamp(viewportWidth / 6.5, 0.4, 0.7)
    : THREE.MathUtils.clamp(viewportWidth / 12, 0.5, 0.68);
  const soloBoost = compact ? 0.18 : 0.35;

  const accentColor = useMemo(() => new THREE.Color(ACCENT), []);
  const tmp = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);

    // Entrance: slight scale-up + rotation drift-in over the first ~1.6s.
    ramp.current = reduced ? 1 : Math.min(1, ramp.current + dt / 1.6);
    const eased = 1 - Math.pow(1 - ramp.current, 3);

    // Scroll acts.
    const p = reduced ? 0 : progress?.get() ?? 0;
    const travelT = smooth01((p - TRAVEL_START) / TRAVEL_LENGTH);
    const scatterT = smooth01((p - SCATTER_START) / SCATTER_LENGTH);

    if (content.current) {
      const s =
        baseScale * (0.92 + 0.08 * eased) * (1 + soloBoost * travelT);
      content.current.scale.setScalar(s);
      content.current.position.set(
        THREE.MathUtils.lerp(xSide, 0, travelT),
        THREE.MathUtils.lerp(ySide, 0, travelT),
        0
      );
    }

    if (!reduced) spinAngle.current += dt * 0.07;
    if (spin.current) {
      // Time spin + scroll scrub, so dragging the page turns the globe.
      spin.current.rotation.y =
        spinAngle.current + p * 2.4 - 0.4 * (1 - eased);
    }
    if (ringGroup.current) {
      ringGroup.current.rotation.x = 0.55 + 0.5 * travelT;
      ringGroup.current.scale.setScalar(1 + scatterT * 0.25);
    }
    if (dust.current) {
      if (!reduced) dust.current.rotation.y -= dt * 0.015;
      dust.current.scale.setScalar(1 + scatterT * 0.35);
    }

    if (rig.current) {
      const tx = reduced ? 0 : pointer.current.y * 0.09;
      const ty = reduced ? 0 : pointer.current.x * 0.16;
      rig.current.rotation.x = THREE.MathUtils.damp(rig.current.rotation.x, tx, 2.2, dt);
      rig.current.rotation.y = THREE.MathUtils.damp(rig.current.rotation.y, ty, 2.2, dt);
    }

    // Dissolve: nodes drift along their scatter directions.
    const k = Math.pow(scatterT, 1.3) * 2.8;
    for (let i = 0; i < nodePos.length; i += 3) {
      nodePos[i] = nodeBase[i] + nodeDir[i] * k;
      nodePos[i + 1] = nodeBase[i + 1] + nodeDir[i + 1] * k;
      nodePos[i + 2] = nodeBase[i + 2] + nodeDir[i + 2] * k;
    }
    for (let i = 0; i < hubPos.length; i += 3) {
      hubPos[i] = hubBase[i] + hubDir[i] * k;
      hubPos[i + 1] = hubBase[i + 1] + hubDir[i + 1] * k;
      hubPos[i + 2] = hubBase[i + 2] + hubDir[i + 2] * k;
    }
    if (nodePosAttr.current) nodePosAttr.current.needsUpdate = true;
    if (hubPosAttr.current) hubPosAttr.current.needsUpdate = true;

    // Structure fades fast during the dissolve, particles linger.
    const lineFade = 1 - smooth01(scatterT * 2.2);
    const pointFade = 1 - smooth01((scatterT - 0.45) / 0.55);
    if (lineMat.current) lineMat.current.opacity = 0.09 * lineFade;
    if (packetMat.current) packetMat.current.opacity = lineFade;
    if (ringMat.current) ringMat.current.opacity = 0.28 * (1 - smooth01(scatterT * 1.6));
    if (beadMat.current) beadMat.current.opacity = 0.9 * (1 - smooth01(scatterT * 1.6));
    if (nodeMat.current) nodeMat.current.opacity = 0.9 * pointFade;
    if (hubMat.current) hubMat.current.opacity = 0.85 * pointFade;
    if (dustMat.current)
      dustMat.current.opacity = 0.8 * (1 - smooth01((scatterT - 0.3) / 0.7));

    // Packets: head + fading tail along an arc; brightness pulses so they
    // ease in/out at the endpoints. Negative t = idle delay between hops.
    for (let pi = 0; pi < packets.length; pi++) {
      const pk = packets[pi];
      if (!reduced) {
        pk.t += dt * pk.speed;
        if (pk.t - PACKET_TRAIL * PACKET_SPACING > 1) {
          pk.arc = Math.floor(Math.random() * arcs.length);
          pk.t = -Math.random() * 0.6;
          pk.speed = 0.45 + Math.random() * 0.35;
        }
      }
      const arc = arcs[pk.arc];
      const head = THREE.MathUtils.clamp(pk.t, 0, 1);
      const pulse = pk.t < 0 ? 0 : Math.sin(head * Math.PI);
      for (let j = 0; j < PACKET_TRAIL; j++) {
        const tk = THREE.MathUtils.clamp(pk.t - j * PACKET_SPACING, 0, 1);
        const f = tk * ARC_SEGMENTS;
        const i0 = Math.min(ARC_SEGMENTS - 1, Math.floor(f));
        tmp.lerpVectors(arc[i0], arc[i0 + 1], f - i0);
        const idx = (pi * PACKET_TRAIL + j) * 3;
        packetPos[idx] = tmp.x;
        packetPos[idx + 1] = tmp.y;
        packetPos[idx + 2] = tmp.z;
        const b = Math.pow(1 - j / PACKET_TRAIL, 1.8) * pulse * eased * 1.5;
        packetCol[idx] = accentColor.r * b;
        packetCol[idx + 1] = accentColor.g * b;
        packetCol[idx + 2] = accentColor.b * b;
      }
    }
    if (packetPosAttr.current) packetPosAttr.current.needsUpdate = true;
    if (packetColAttr.current) packetColAttr.current.needsUpdate = true;

    // Satellites on the orbit ring.
    for (let bi = 0; bi < BEAD_COUNT; bi++) {
      if (!reduced) beadAngles.current[bi] += dt * 0.22;
      const a = beadAngles.current[bi];
      beadPos[bi * 3] = Math.cos(a) * RING_RADIUS;
      beadPos[bi * 3 + 1] = 0;
      beadPos[bi * 3 + 2] = Math.sin(a) * RING_RADIUS;
    }
    if (beadAttr.current) beadAttr.current.needsUpdate = true;
  });

  return (
    <>
      <fog attach="fog" args={[BG, 5.2, 9.2]} />
      <group ref={rig}>
        <group ref={content} position={[xSide, ySide, 0]} scale={baseScale}>
          {/* axial tilt; spin happens around the tilted axis */}
          <group rotation={[0.16, 0, 0.18]}>
            <group ref={spin}>
              <points frustumCulled={false}>
                <bufferGeometry key={`n${nodeCount}`}>
                  <bufferAttribute
                    ref={nodePosAttr}
                    attach="attributes-position"
                    args={[nodePos, 3]}
                    usage={THREE.DynamicDrawUsage}
                  />
                  <bufferAttribute attach="attributes-color" args={[nodeCol, 3]} />
                </bufferGeometry>
                <pointsMaterial
                  ref={nodeMat}
                  map={glow}
                  vertexColors
                  transparent
                  opacity={0.9}
                  size={0.075}
                  sizeAttenuation
                  depthWrite={false}
                  blending={THREE.AdditiveBlending}
                />
              </points>

              <points frustumCulled={false}>
                <bufferGeometry key={`h${nodeCount}`}>
                  <bufferAttribute
                    ref={hubPosAttr}
                    attach="attributes-position"
                    args={[hubPos, 3]}
                    usage={THREE.DynamicDrawUsage}
                  />
                </bufferGeometry>
                <pointsMaterial
                  ref={hubMat}
                  map={glow}
                  color={ACCENT}
                  transparent
                  opacity={0.85}
                  size={0.14}
                  sizeAttenuation
                  depthWrite={false}
                  blending={THREE.AdditiveBlending}
                />
              </points>

              <lineSegments frustumCulled={false}>
                <bufferGeometry key={`a${nodeCount}`}>
                  <bufferAttribute attach="attributes-position" args={[arcPos, 3]} />
                </bufferGeometry>
                <lineBasicMaterial
                  ref={lineMat}
                  color="#ffffff"
                  transparent
                  opacity={0.09}
                  depthWrite={false}
                  blending={THREE.AdditiveBlending}
                />
              </lineSegments>

              <points frustumCulled={false}>
                <bufferGeometry key={`p${packetCount}`}>
                  <bufferAttribute
                    ref={packetPosAttr}
                    attach="attributes-position"
                    args={[packetPos, 3]}
                    usage={THREE.DynamicDrawUsage}
                  />
                  <bufferAttribute
                    ref={packetColAttr}
                    attach="attributes-color"
                    args={[packetCol, 3]}
                    usage={THREE.DynamicDrawUsage}
                  />
                </bufferGeometry>
                <pointsMaterial
                  ref={packetMat}
                  map={glow}
                  vertexColors
                  transparent
                  size={0.11}
                  sizeAttenuation
                  depthWrite={false}
                  blending={THREE.AdditiveBlending}
                />
              </points>
            </group>

            {/* tilted orbit ring + satellites */}
            <group ref={ringGroup} rotation={[0.55, 0, -0.18]}>
              <lineLoop frustumCulled={false}>
                <bufferGeometry>
                  <bufferAttribute attach="attributes-position" args={[ringPos, 3]} />
                </bufferGeometry>
                <lineBasicMaterial
                  ref={ringMat}
                  color={ACCENT}
                  transparent
                  opacity={0.28}
                  depthWrite={false}
                  blending={THREE.AdditiveBlending}
                />
              </lineLoop>
              <points frustumCulled={false}>
                <bufferGeometry>
                  <bufferAttribute
                    ref={beadAttr}
                    attach="attributes-position"
                    args={[beadPos, 3]}
                    usage={THREE.DynamicDrawUsage}
                  />
                </bufferGeometry>
                <pointsMaterial
                  ref={beadMat}
                  map={glow}
                  color={ACCENT}
                  transparent
                  opacity={0.9}
                  size={0.16}
                  sizeAttenuation
                  depthWrite={false}
                  blending={THREE.AdditiveBlending}
                />
              </points>
            </group>
          </group>

          <group ref={dust}>
            <points frustumCulled={false}>
              <bufferGeometry key={`d${nodeCount}`}>
                <bufferAttribute attach="attributes-position" args={[dustPos, 3]} />
                <bufferAttribute attach="attributes-color" args={[dustCol, 3]} />
              </bufferGeometry>
              <pointsMaterial
                ref={dustMat}
                map={glow}
                vertexColors
                transparent
                opacity={0.8}
                size={0.05}
                sizeAttenuation
                depthWrite={false}
                blending={THREE.AdditiveBlending}
              />
            </points>
          </group>
        </group>
      </group>
    </>
  );
}

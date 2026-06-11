"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { MotionValue } from "framer-motion";
import { ACCENT, useGlowTexture } from "./shared";

const BODY = "#e8e8e8";
const DARK = "#2a2a2a";
const FLAME_CORE = "#ffd9a8";
const TRAIL_COUNT = 56;
// Lateral weave half-cycles over the full page — the flight path snakes
// gently through the sections instead of falling in a straight line.
const WEAVES = 5.5;

type Particle = { vx: number; vy: number; vz: number; life: number; max: number };

const shortestAngle = (from: number, to: number) =>
  ((to - from + Math.PI * 3) % (Math.PI * 2)) - Math.PI;

type RocketProps = {
  /** Whole-page scroll progress (0…1). */
  progress: MotionValue<number>;
};

/**
 * A small scroll companion. The rocket rides a weaving path down the page:
 * position follows scroll with a damped lag, the nose points along the
 * actual direction of travel (so it banks through U-turns when you reverse
 * scroll), it rolls slowly around its long axis, and thrust — flame length,
 * nozzle glow, exhaust particles — scales with scroll speed.
 */
export default function Rocket({ progress }: RocketProps) {
  const glow = useGlowTexture();

  const group = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Group>(null);
  const flame = useRef<THREE.Group>(null);
  const flameInner = useRef<THREE.Mesh>(null);
  const nozzleGlow = useRef<THREE.Sprite>(null);
  const nozzle = useRef<THREE.Group>(null);
  const trailPosAttr = useRef<THREE.BufferAttribute>(null);
  const trailColAttr = useRef<THREE.BufferAttribute>(null);
  const trailMat = useRef<THREE.PointsMaterial>(null);

  const trailPos = useMemo(() => new Float32Array(TRAIL_COUNT * 3), []);
  const trailCol = useMemo(() => new Float32Array(TRAIL_COUNT * 3), []);
  const particles = useMemo<Particle[]>(
    () =>
      Array.from({ length: TRAIL_COUNT }, () => ({
        vx: 0,
        vy: 0,
        vz: 0,
        life: 0,
        max: 1,
      })),
    []
  );

  const state = useRef({
    initialized: false,
    x: 0,
    y: 0,
    prevX: 0,
    prevY: 0,
    angle: Math.PI / 2,
    spawnAccum: 0,
    head: 0,
  });

  const accentColor = useMemo(() => new THREE.Color(ACCENT), []);
  const hotColor = useMemo(() => new THREE.Color("#ffffff"), []);
  const tmpColor = useMemo(() => new THREE.Color(), []);
  const tmpVec = useMemo(() => new THREE.Vector3(), []);
  const tmpDir = useMemo(() => new THREE.Vector3(), []);

  useFrame((frame, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    if (dt <= 0) return;
    const t = frame.clock.elapsedTime;
    const { width: vw, height: vh } = frame.viewport;
    const compact = vw < 5.4;
    const s = (vh * (compact ? 0.062 : 0.075)) / 1.35;
    const st = state.current;

    // Flight path: scroll progress → a weaving descent near the right edge.
    const p = THREE.MathUtils.clamp(progress.get(), 0, 1);
    const tx = vw * 0.4 + Math.sin(p * Math.PI * WEAVES) * vw * 0.03;
    const ty = THREE.MathUtils.lerp(vh * 0.37, -vh * 0.35, p);

    if (!st.initialized) {
      st.initialized = true;
      st.x = tx;
      st.y = ty;
      st.prevX = tx;
      st.prevY = ty;
    }

    st.x = THREE.MathUtils.damp(st.x, tx, 3.2, dt);
    st.y = THREE.MathUtils.damp(st.y, ty, 3.2, dt);
    const velX = (st.x - st.prevX) / dt;
    const velY = (st.y - st.prevY) / dt;
    st.prevX = st.x;
    st.prevY = st.y;
    const speed = Math.hypot(velX, velY);
    const speedNorm = THREE.MathUtils.clamp(speed / (vh * 0.55), 0, 1);

    // Nose pitches toward the direction of travel, blended by speed so
    // gentle scrolls lean the rocket while fast ones commit to a full
    // nose-first dive; it always eases back upright when idle.
    const targetAngle =
      speedNorm > 0.02
        ? Math.PI / 2 +
          shortestAngle(Math.PI / 2, Math.atan2(velY, velX)) *
            Math.min(1, speedNorm * 2.5)
        : Math.PI / 2;
    st.angle += shortestAngle(st.angle, targetAngle) * Math.min(1, dt * 5);

    if (group.current) {
      const bob = Math.sin(t * 1.7) * 0.045 * (1 - speedNorm);
      const jx = (Math.random() - 0.5) * 0.02 * speedNorm;
      const jy = (Math.random() - 0.5) * 0.02 * speedNorm;
      group.current.position.set(st.x + jx, st.y + bob + jy, 0);
      group.current.rotation.z = st.angle - Math.PI / 2;
      group.current.scale.setScalar(s);
    }
    if (inner.current) {
      inner.current.rotation.y += dt * (0.9 + speedNorm * 2.2);
    }

    // Thrust: flickering flame + nozzle glow, scaled by scroll speed.
    const flicker =
      Math.sin(t * 31) * 0.5 + Math.sin(t * 53 + 1.7) * 0.35;
    const thrust = 0.4 + speedNorm * 1.2 + flicker * 0.1;
    if (flame.current) {
      flame.current.scale.set(1 - speedNorm * 0.12, Math.max(0.2, thrust), 1 - speedNorm * 0.12);
    }
    if (flameInner.current) {
      flameInner.current.scale.y = 1 + Math.sin(t * 47 + 0.6) * 0.12;
    }
    if (nozzleGlow.current) {
      const gs = 0.42 + speedNorm * 0.5 + flicker * 0.06;
      nozzleGlow.current.scale.set(gs, gs, gs);
    }

    // Exhaust particles, in world space so they hang behind the flight path.
    if (group.current && nozzle.current) {
      tmpDir.set(0, 1, 0).applyQuaternion(group.current.quaternion);
      st.spawnAccum += dt * (3.5 + speedNorm * 75);
      while (st.spawnAccum >= 1) {
        st.spawnAccum -= 1;
        const i = st.head;
        st.head = (st.head + 1) % TRAIL_COUNT;
        nozzle.current.getWorldPosition(tmpVec);
        trailPos[i * 3] = tmpVec.x;
        trailPos[i * 3 + 1] = tmpVec.y;
        trailPos[i * 3 + 2] = tmpVec.z;
        const kick = 0.9 + speed * 0.45;
        const pk = particles[i];
        pk.vx = -tmpDir.x * kick + (Math.random() - 0.5) * 0.3;
        pk.vy = -tmpDir.y * kick + (Math.random() - 0.5) * 0.3;
        pk.vz = (Math.random() - 0.5) * 0.2;
        pk.max = 0.5 + Math.random() * 0.35;
        pk.life = pk.max;
      }
    }
    const drag = Math.max(0, 1 - dt * 1.6);
    for (let i = 0; i < TRAIL_COUNT; i++) {
      const pk = particles[i];
      if (pk.life <= 0) {
        trailCol[i * 3] = 0;
        trailCol[i * 3 + 1] = 0;
        trailCol[i * 3 + 2] = 0;
        continue;
      }
      pk.life -= dt;
      trailPos[i * 3] += pk.vx * dt;
      trailPos[i * 3 + 1] += pk.vy * dt;
      trailPos[i * 3 + 2] += pk.vz * dt;
      pk.vx *= drag;
      pk.vy *= drag;
      pk.vz *= drag;
      const ratio = Math.max(0, pk.life / pk.max);
      const bright = Math.pow(ratio, 1.7) * 1.25;
      tmpColor
        .copy(hotColor)
        .lerp(accentColor, Math.min(1, (1 - ratio) * 2.4))
        .multiplyScalar(bright);
      trailCol[i * 3] = tmpColor.r;
      trailCol[i * 3 + 1] = tmpColor.g;
      trailCol[i * 3 + 2] = tmpColor.b;
    }
    if (trailPosAttr.current) trailPosAttr.current.needsUpdate = true;
    if (trailColAttr.current) trailColAttr.current.needsUpdate = true;
    if (trailMat.current) trailMat.current.size = s * 0.55;
  });

  return (
    <>
      <group ref={group}>
        <group ref={inner}>
          {/* nose */}
          <mesh position={[0, 0.62, 0]}>
            <coneGeometry args={[0.17, 0.38, 16]} />
            <meshBasicMaterial color={ACCENT} />
          </mesh>
          {/* body */}
          <mesh position={[0, 0.06, 0]}>
            <cylinderGeometry args={[0.16, 0.21, 0.85, 16]} />
            <meshBasicMaterial color={BODY} />
          </mesh>
          {/* porthole */}
          <mesh position={[0, 0.22, 0.2]}>
            <torusGeometry args={[0.075, 0.018, 8, 24]} />
            <meshBasicMaterial color={DARK} />
          </mesh>
          <mesh position={[0, 0.22, 0.19]}>
            <circleGeometry args={[0.062, 20]} />
            <meshBasicMaterial color="#0d0d0d" />
          </mesh>
          {/* fins */}
          {[0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].map((a) => (
            <mesh
              key={a}
              position={[Math.sin(a) * 0.21, -0.32, Math.cos(a) * 0.21]}
              rotation={[0, a, 0]}
            >
              <boxGeometry args={[0.04, 0.36, 0.22]} />
              <meshBasicMaterial color={ACCENT} />
            </mesh>
          ))}
          {/* nozzle */}
          <mesh position={[0, -0.43, 0]}>
            <cylinderGeometry args={[0.12, 0.155, 0.16, 12]} />
            <meshBasicMaterial color={DARK} />
          </mesh>

          {/* thruster flame: stretches downward from the nozzle */}
          <group position={[0, -0.5, 0]}>
            <group ref={flame}>
              <mesh position={[0, -0.275, 0]} rotation={[Math.PI, 0, 0]}>
                <coneGeometry args={[0.12, 0.55, 12]} />
                <meshBasicMaterial
                  color={ACCENT}
                  transparent
                  opacity={0.65}
                  depthWrite={false}
                  blending={THREE.AdditiveBlending}
                />
              </mesh>
              <mesh
                ref={flameInner}
                position={[0, -0.17, 0]}
                rotation={[Math.PI, 0, 0]}
              >
                <coneGeometry args={[0.065, 0.34, 10]} />
                <meshBasicMaterial
                  color={FLAME_CORE}
                  transparent
                  opacity={0.9}
                  depthWrite={false}
                  blending={THREE.AdditiveBlending}
                />
              </mesh>
            </group>
            <sprite ref={nozzleGlow} position={[0, -0.05, 0]}>
              <spriteMaterial
                map={glow}
                color={ACCENT}
                transparent
                opacity={0.85}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
              />
            </sprite>
            <group ref={nozzle} position={[0, -0.08, 0]} />
          </group>
        </group>
      </group>

      {/* exhaust trail, left behind along the flight path */}
      <points frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute
            ref={trailPosAttr}
            attach="attributes-position"
            args={[trailPos, 3]}
            usage={THREE.DynamicDrawUsage}
          />
          <bufferAttribute
            ref={trailColAttr}
            attach="attributes-color"
            args={[trailCol, 3]}
            usage={THREE.DynamicDrawUsage}
          />
        </bufferGeometry>
        <pointsMaterial
          ref={trailMat}
          map={glow}
          vertexColors
          transparent
          size={0.16}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </>
  );
}

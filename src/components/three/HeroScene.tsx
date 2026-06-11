"use client";

import type { MotionValue } from "framer-motion";
import SceneCanvas from "./SceneCanvas";
import NetworkGlobe from "./NetworkGlobe";

type HeroSceneProps = {
  /** Scroll progress of the pinned hero, drives the globe choreography. */
  progress?: MotionValue<number>;
};

export default function HeroScene({ progress }: HeroSceneProps) {
  return (
    <SceneCanvas className="pointer-events-none absolute inset-0">
      <NetworkGlobe progress={progress} />
    </SceneCanvas>
  );
}

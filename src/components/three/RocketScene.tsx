"use client";

import type { MotionValue } from "framer-motion";
import SceneCanvas from "./SceneCanvas";
import Rocket from "./Rocket";

type RocketSceneProps = {
  progress: MotionValue<number>;
};

export default function RocketScene({ progress }: RocketSceneProps) {
  return (
    <SceneCanvas className="h-full w-full">
      <Rocket progress={progress} />
    </SceneCanvas>
  );
}

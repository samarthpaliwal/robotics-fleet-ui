/**
 * With 50+ robots streaming at ~5Hz, each tick would trigger a render.
 * This hook flushes accumulated updates on a fixed interval instead.
 * UI stays live but React does not reconcile 250+ diffs/sec.
 */

import { useEffect, useRef, useState } from "react";
import type { RobotMap } from "../types/robot";

const FLUSH_INTERVAL_MS = 100; // ~10fps for robot cards

export function useThrottledRobots(liveRobots: RobotMap): RobotMap {
  const [displayRobots, setDisplayRobots] = useState<RobotMap>(liveRobots);
  const pendingRef = useRef<RobotMap>(liveRobots);

  useEffect(() => {
    pendingRef.current = liveRobots;
  }, [liveRobots]);

  useEffect(() => {
    const timer = setInterval(() => {
      setDisplayRobots({ ...pendingRef.current });
    }, FLUSH_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  return displayRobots;
}

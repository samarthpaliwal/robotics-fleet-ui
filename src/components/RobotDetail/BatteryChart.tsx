/**
 * Lightweight SVG rolling battery history chart.
 * No charting library — keeps bundle lean.
 * History stored in a ref (not state) to avoid extra re-renders.
 */

import React, { useEffect, useRef, useState } from "react";

interface Props {
  current: number;
  robotId: string;
}

const MAX_POINTS = 30;
const W = 280;
const H = 70;

export function BatteryChart({ current, robotId }: Props) {
  const historyRef = useRef<number[]>([]);
  const [path, setPath] = useState<string>("");

  useEffect(() => {
    historyRef.current = [];
  }, [robotId]);

  useEffect(() => {
    const hist = historyRef.current;
    hist.push(current);
    if (hist.length > MAX_POINTS) hist.shift();

    const pts = hist.map((val, i) => {
      const x = (i / (MAX_POINTS - 1)) * W;
      const y = H - (val / 100) * H;
      return `${x},${y}`;
    });
    setPath(pts.length > 1 ? `M ${pts.join(" L ")}` : "");
  }, [current]);

  const lineColor = current < 20 ? "#ef4444" : current < 50 ? "#f59e0b" : "#22c55e";

  return (
    <svg width={W} height={H} style={{ background: "#0f172a", borderRadius: 6, display: "block" }}>
      {[25, 50, 75].map((pct) => (
        <line
          key={pct}
          x1={0} y1={H - (pct / 100) * H}
          x2={W} y2={H - (pct / 100) * H}
          stroke="#1e293b"
          strokeWidth={1}
        />
      ))}
      {path && (
        <path d={path} stroke={lineColor} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}

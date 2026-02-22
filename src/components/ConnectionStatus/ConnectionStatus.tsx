import React, { memo } from "react";
import { useRobotStore } from "../../store/RobotContext";
import type { ConnectionState } from "../../types/robot";

const STATUS_CONFIG: Record<ConnectionState, { label: string; color: string }> = {
  connecting:   { label: "Connecting…",      color: "#f59e0b" },
  connected:    { label: "Live",             color: "#22c55e" },
  disconnected: { label: "Disconnected",     color: "#ef4444" },
  error:        { label: "Connection Error", color: "#dc2626" },
};

export const ConnectionStatus = memo(function ConnectionStatus() {
  const { state } = useRobotStore();
  const { label, color } = STATUS_CONFIG[state.connectionState];

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span
        style={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          backgroundColor: color,
          display: "inline-block",
          boxShadow: state.connectionState === "connected" ? `0 0 6px ${color}` : "none",
          animation: state.connectionState === "connecting" ? "pulse 1.2s infinite" : "none",
        }}
      />
      <span style={{ color, fontSize: 13, fontWeight: 600 }}>{label}</span>
    </div>
  );
});

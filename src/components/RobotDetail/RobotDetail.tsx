import React, { memo } from "react";
import { useRobotStore } from "../../store/RobotContext";
import { BatteryChart } from "./BatteryChart";
import { CommandPanel } from "../CommandPanel/CommandPanel";

function formatTimestamp(ms: number): string {
  return new Date(ms).toLocaleTimeString();
}

export const RobotDetail = memo(function RobotDetail() {
  const { state, selectRobot } = useRobotStore();

  if (!state.selectedRobotId) {
    return (
      <div style={{ color: "#475569", padding: 24, textAlign: "center" }}>
        Select a robot to view details
      </div>
    );
  }

  const robot = state.robots[state.selectedRobotId];
  if (!robot) return null;

  return (
    <div style={{ background: "#1e293b", borderRadius: 12, padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ color: "#e2e8f0", margin: 0, fontSize: 16 }}>{robot.robot_id}</h2>
        <button
          onClick={() => selectRobot(null)}
          style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: 18, lineHeight: 1 }}
          aria-label="Close detail panel"
        >
          ✕
        </button>
      </div>

      <section style={{ marginBottom: 20 }}>
        <label style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: 1 }}>
          Battery (last 30 readings)
        </label>
        <div style={{ marginTop: 8 }}>
          <BatteryChart current={robot.battery_level} robotId={robot.robot_id} />
        </div>
        <span style={{ fontSize: 13, color: "#94a3b8", marginTop: 4, display: "block" }}>
          Current: {robot.battery_level.toFixed(1)}%
        </span>
      </section>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
        {[
          { label: "Position X",   value: robot.position.x.toFixed(2) },
          { label: "Position Y",   value: robot.position.y.toFixed(2) },
          { label: "Velocity",     value: `${robot.velocity.toFixed(2)} m/s` },
          { label: "Temperature",  value: `${robot.temperature.toFixed(1)}°C` },
          { label: "Status",       value: robot.status.toUpperCase() },
          { label: "Last Updated", value: formatTimestamp(robot.last_updated) },
        ].map(({ label, value }) => (
          <div key={label} style={{ background: "#0f172a", borderRadius: 8, padding: "10px 14px" }}>
            <div style={{ fontSize: 11, color: "#475569", marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 14, color: "#e2e8f0", fontWeight: 600 }}>{value}</div>
          </div>
        ))}
      </div>

      <CommandPanel robotId={robot.robot_id} />
    </div>
  );
});

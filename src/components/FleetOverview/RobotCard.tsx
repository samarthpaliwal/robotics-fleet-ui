import React, { memo } from "react";
import type { RobotTelemetry, RobotStatus } from "../../types/robot";

const STATUS_COLORS: Record<RobotStatus, string> = {
  idle:     "#94a3b8",
  moving:   "#3b82f6",
  charging: "#22c55e",
  error:    "#ef4444",
};

interface Props {
  robot: RobotTelemetry;
  isSelected: boolean;
  isPending: boolean;
  onClick: () => void;
}

export const RobotCard = memo(function RobotCard({ robot, isSelected, isPending, onClick }: Props) {
  const statusColor = STATUS_COLORS[robot.status];
  const batteryColor =
    robot.battery_level < 20 ? "#ef4444" :
    robot.battery_level < 50 ? "#f59e0b" : "#22c55e";

  return (
    <div
      onClick={onClick}
      style={{
        background: robot.status === "error" ? "#2d1515" : "#1e293b",
        border: `2px solid ${isSelected ? "#3b82f6" : robot.status === "error" ? "#ef4444" : "#334155"}`,
        borderRadius: 10,
        padding: "14px 16px",
        cursor: "pointer",
        transition: "border-color 0.15s",
        opacity: isPending ? 0.75 : 1,
        position: "relative",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontWeight: 700, fontSize: 13, color: "#e2e8f0" }}>{robot.robot_id}</span>
        <span
          style={{
            width: 9,
            height: 9,
            borderRadius: "50%",
            background: statusColor,
            boxShadow: `0 0 5px ${statusColor}`,
            display: "inline-block",
          }}
        />
      </div>

      <div style={{ marginTop: 6, fontSize: 11, color: statusColor, fontWeight: 600, textTransform: "uppercase" }}>
        {robot.status}
        {isPending && <span style={{ marginLeft: 6, color: "#f59e0b" }}>⟳</span>}
      </div>

      <div style={{ marginTop: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>
          <span>Battery</span>
          <span style={{ color: batteryColor }}>{robot.battery_level.toFixed(0)}%</span>
        </div>
        <div style={{ background: "#0f172a", borderRadius: 4, height: 5 }}>
          <div
            style={{
              width: `${robot.battery_level}%`,
              height: "100%",
              background: batteryColor,
              borderRadius: 4,
              transition: "width 0.3s ease",
            }}
          />
        </div>
      </div>

      <div style={{ marginTop: 8, fontSize: 11, color: "#94a3b8" }}>
        🌡 {robot.temperature.toFixed(1)}°C &nbsp;|&nbsp; 📍 ({robot.position.x.toFixed(1)}, {robot.position.y.toFixed(1)})
      </div>
    </div>
  );
});
